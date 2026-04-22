import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || ''
);

// Admin-only order status update (protected by middleware Basic Auth)
export async function PUT(request: NextRequest) {
  try {
    const { orderId, status } = await request.json();

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

    // Update status
    const { error } = await supabaseAdmin
      .from('orders')
      .update({ order_status: status })
      .eq('id', orderId);

    if (error) {
      console.error('[Admin OrderStatus] Update error:', error);
      return NextResponse.json({ error: 'Eroare la actualizare' }, { status: 500 });
    }

    // If delivered, trigger post-delivery flow (review email + Loops event)
    if (status === 'delivered') {
      try {
        const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://numarul.ro';
        await fetch(`${siteUrl}/api/email/referral-discount`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ orderId }),
        });
      } catch (emailErr) {
        console.error('[Admin OrderStatus] Email error:', emailErr);
      }
    }

    return NextResponse.json({ success: true, message: `Status actualizat la: ${status}` });
  } catch (error) {
    console.error('[Admin OrderStatus] Error:', error);
    return NextResponse.json({ error: 'Eroare internă' }, { status: 500 });
  }
}
