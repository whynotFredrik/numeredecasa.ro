import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { sendOrderDeliveredEvent } from '@/lib/loops/events';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || ''
);

function getProductName(type: string): string {
  switch (type) {
    case 'house': return 'Număr de Casă';
    case 'apartment': return 'Număr de Apartament';
    case 'office': return 'Plăcuță de Birou';
    default: return type;
  }
}

// POST — Actualizare status comandă (apelat manual din admin / automatizare)
// Când statusul devine 'delivered':
//   1. Trimite email post-livrare cu solicitare recenzie (fără cod reducere)
//   2. Trimite eveniment order_delivered în Loops (marketing drip)
// Codul de reducere se generează separat, la completarea recenziei (vezi /api/reviews POST)
export async function POST(request: NextRequest) {
  try {
    const { orderId, status, apiKey } = await request.json();

    // Protejare endpoint — doar cu service role key
    if (apiKey !== process.env.SUPABASE_SERVICE_ROLE_KEY) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!orderId || !status) {
      return NextResponse.json(
        { error: 'orderId și status sunt obligatorii' },
        { status: 400 }
      );
    }

    const validStatuses = ['new', 'processing', 'shipped', 'delivered', 'completed', 'cancelled'];
    if (!validStatuses.includes(status)) {
      return NextResponse.json(
        { error: `Status invalid. Valori permise: ${validStatuses.join(', ')}` },
        { status: 400 }
      );
    }

    // Actualizează statusul
    const { error } = await supabaseAdmin
      .from('orders')
      .update({ order_status: status })
      .eq('id', orderId);

    if (error) {
      console.error('[OrderStatus] Eroare la actualizare:', error);
      return NextResponse.json({ error: 'Eroare la actualizarea statusului' }, { status: 500 });
    }

    console.log(`[OrderStatus] Comandă ${orderId} actualizată la: ${status}`);

    let reviewEmailSent = false;
    let loopsEventSent = false;

    // Dacă statusul este 'delivered', trimite email recenzie + declanșează Loops
    if (status === 'delivered') {
      const { data: order } = await supabaseAdmin
        .from('orders')
        .select('*')
        .eq('id', orderId)
        .single();

      const { data: orderItems } = await supabaseAdmin
        .from('order_items')
        .select('product_type')
        .eq('order_id', orderId);

      if (order) {
        const productTypes = [...new Set(orderItems?.map(i => getProductName(i.product_type)) || [])].join(', ');

        // 1. Trimite email post-livrare (solicită recenzie, menționează recompensa)
        try {
          const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://numarul.ro';
          const reviewResponse = await fetch(`${siteUrl}/api/email/referral-discount`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ orderId }),
          });

          const reviewData = await reviewResponse.json();
          reviewEmailSent = reviewData.success;
          if (reviewData.success) {
            console.log(`[OrderStatus] Email recenzie trimis pentru comanda ${orderId}`);
          }
        } catch (emailErr) {
          console.error('[OrderStatus] Excepție la trimiterea emailului recenzie:', emailErr);
        }

        // 2. Trimite eveniment în Loops (declanșează secvența de marketing)
        try {
          const loopsResult = await sendOrderDeliveredEvent({
            email: order.customer_email,
            firstName: order.customer_first_name,
            lastName: order.customer_last_name,
            orderId,
            totalAmount: order.total_amount,
            productTypes,
            discountCode: '', // Codul se generează la completarea recenziei
            discountPercent: 15,
            expiresAt: '',
            maxUses: 3,
          });

          loopsEventSent = loopsResult.success;
        } catch (loopsErr) {
          console.error('[OrderStatus] Excepție Loops:', loopsErr);
        }
      }
    }

    return NextResponse.json({
      success: true,
      message: `Statusul comenzii a fost actualizat la: ${status}`,
      review_email_sent: reviewEmailSent,
      loops_event_sent: loopsEventSent,
    });
  } catch (err) {
    console.error('[OrderStatus] Excepție:', err);
    return NextResponse.json({ error: 'Eroare la procesarea cererii' }, { status: 500 });
  }
}
