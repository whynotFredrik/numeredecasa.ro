import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || ''
);

// POST — Actualizare status comandă (apelat manual din admin / automatizare)
// Când statusul devine 'delivered', trimite automat emailul de referral
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

    // Dacă statusul este 'delivered', trimite automat emailul de referral
    if (status === 'delivered') {
      try {
        const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://numarul.ro';
        const referralResponse = await fetch(`${siteUrl}/api/email/referral-discount`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ orderId }),
        });

        const referralData = await referralResponse.json();
        if (referralData.success) {
          console.log(`[OrderStatus] Email referral trimis pentru comanda ${orderId}`);
        } else {
          console.error('[OrderStatus] Eroare la trimiterea emailului referral:', referralData.error);
        }
      } catch (emailErr) {
        // Nu blocăm răspunsul dacă emailul eșuează
        console.error('[OrderStatus] Excepție la trimiterea emailului referral:', emailErr);
      }
    }

    return NextResponse.json({
      success: true,
      message: `Statusul comenzii a fost actualizat la: ${status}`,
      referral_email_sent: status === 'delivered',
    });
  } catch (err) {
    console.error('[OrderStatus] Excepție:', err);
    return NextResponse.json({ error: 'Eroare la procesarea cererii' }, { status: 500 });
  }
}
