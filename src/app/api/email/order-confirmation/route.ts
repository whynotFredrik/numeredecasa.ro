import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { sendOrderConfirmation } from '@/lib/resend/send';

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

    return NextResponse.json({ success: true, emailId: result.id });
  } catch (err) {
    console.error('[Email API] Eroare:', err);
    return NextResponse.json({ error: 'Eroare internă' }, { status: 500 });
  }
}
