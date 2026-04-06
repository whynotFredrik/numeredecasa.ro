import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { sendOrderConfirmation } from '@/lib/resend/send';
import { upsertLoopsContact, sendFirstOrderEvent } from '@/lib/loops/events';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || ''
);

export async function POST(request: NextRequest) {
  try {
    const { orderId } = await request.json();

    if (!orderId) {
      return NextResponse.json({ error: 'orderId lipsește' }, { status: 400 });
    }

    // Fetch order with items from Supabase
    const { data: order, error: orderError } = await supabaseAdmin
      .from('orders')
      .select('*')
      .eq('id', orderId)
      .single();

    if (orderError || !order) {
      console.error('[Email API] Comanda nu a fost găsită:', orderId);
      return NextResponse.json({ error: 'Comanda nu a fost găsită' }, { status: 404 });
    }

    const { data: items, error: itemsError } = await supabaseAdmin
      .from('order_items')
      .select('*')
      .eq('order_id', orderId);

    if (itemsError) {
      console.error('[Email API] Eroare la citirea articolelor:', itemsError);
      return NextResponse.json({ error: 'Eroare la citirea articolelor' }, { status: 500 });
    }

    // Send the confirmation email
    const result = await sendOrderConfirmation({
      ...order,
      items: items || [],
    });

    if (!result.success) {
      return NextResponse.json({ error: 'Emailul nu a putut fi trimis' }, { status: 500 });
    }

    // Adaugă contactul în Loops (non-blocking)
    upsertLoopsContact({
      email: order.customer_email,
      firstName: order.customer_first_name,
      lastName: order.customer_last_name,
      phone: order.customer_phone,
      city: order.shipping_city,
      county: order.shipping_county,
    }).catch(err => console.error('[Loops] Eroare upsert contact:', err));

    // Trimite eveniment first_order în Loops (non-blocking)
    const productTypes = [...new Set((items || []).map((i: any) => {
      switch (i.product_type) {
        case 'house': return 'Număr de Casă';
        case 'apartment': return 'Număr de Apartament';
        case 'office': return 'Plăcuță de Birou';
        default: return i.product_type;
      }
    }))].join(', ');

    sendFirstOrderEvent({
      email: order.customer_email,
      firstName: order.customer_first_name,
      lastName: order.customer_last_name,
      orderId: order.id,
      totalAmount: order.total_amount,
      productTypes,
    }).catch(err => console.error('[Loops] Eroare first_order event:', err));

    return NextResponse.json({ success: true, emailId: result.id });
  } catch (err) {
    console.error('[Email API] Eroare:', err);
    return NextResponse.json({ error: 'Eroare internă' }, { status: 500 });
  }
}
