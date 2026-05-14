import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || ''
);

const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

// GET /api/orders/track?orderId=...&email=...
// Returns detailed order info for the tracking page.
// Requires both orderId AND email match (so customers can only see their own orders).
// If only orderId is provided, returns a minimal payload (used right after checkout
// when the customer was just shown their order ID).
export async function GET(request: NextRequest) {
  const orderId = request.nextUrl.searchParams.get('orderId');
  const email = request.nextUrl.searchParams.get('email');

  if (!orderId) {
    return NextResponse.json({ error: 'Missing orderId' }, { status: 400 });
  }

  if (!uuidRegex.test(orderId)) {
    return NextResponse.json({ error: 'ID comandă invalid' }, { status: 400 });
  }

  try {
    const { data: order, error } = await supabaseAdmin
      .from('orders')
      .select('*')
      .eq('id', orderId)
      .single();

    if (error || !order) {
      return NextResponse.json({ error: 'Comandă negăsită' }, { status: 404 });
    }

    // If email provided, must match (case-insensitive)
    if (email && order.customer_email.toLowerCase() !== email.toLowerCase()) {
      return NextResponse.json(
        { error: 'Email-ul nu corespunde cu cel din comandă' },
        { status: 403 }
      );
    }

    const { data: items } = await supabaseAdmin
      .from('order_items')
      .select('*')
      .eq('order_id', orderId);

    // If no email check requested, return minimal info (used by success page only)
    if (!email) {
      return NextResponse.json({
        orderId: order.id,
        firstName: order.customer_first_name,
        paymentStatus: order.payment_status,
        paymentMethod: order.payment_method,
        orderStatus: order.order_status,
        createdAt: order.created_at,
        requireEmailVerification: true,
      });
    }

    return NextResponse.json({
      orderId: order.id,
      createdAt: order.created_at,
      firstName: order.customer_first_name,
      lastName: order.customer_last_name,
      email: order.customer_email,
      phone: order.customer_phone,
      shippingMethod: order.shipping_method,
      shippingCounty: order.shipping_county,
      shippingCity: order.shipping_city,
      shippingAddress: order.shipping_address,
      easyboxId: order.easybox_id,
      paymentMethod: order.payment_method,
      paymentStatus: order.payment_status,
      orderStatus: order.order_status,
      subtotalAmount: order.subtotal_amount,
      shippingAmount: order.shipping_amount,
      totalAmount: order.total_amount,
      discountCode: order.discount_code,
      discountAmount: order.discount_amount,
      items: items || [],
    });
  } catch {
    return NextResponse.json({ error: 'Eroare internă' }, { status: 500 });
  }
}
