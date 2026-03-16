import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Server-side Supabase client for secure order verification
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || ''
);

// Shipping cost constants (single source of truth)
const SHIPPING_COSTS: Record<string, number> = {
  courier: 20,
  easybox: 15,
};

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { orderId, currency, billing } = body;

    if (!orderId) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // --- Server-side amount verification ---
    // Fetch the order and its items from the database to recalculate the total
    const { data: order, error: orderError } = await supabaseAdmin
      .from('orders')
      .select('*')
      .eq('id', orderId)
      .single();

    if (orderError || !order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    // Verify order hasn't already been paid
    if (order.payment_status === 'paid') {
      return NextResponse.json({ error: 'Order already paid' }, { status: 400 });
    }

    const { data: orderItems, error: itemsError } = await supabaseAdmin
      .from('order_items')
      .select('*')
      .eq('order_id', orderId);

    if (itemsError || !orderItems || orderItems.length === 0) {
      return NextResponse.json({ error: 'Order items not found' }, { status: 404 });
    }

    // Recalculate the total server-side
    const itemsTotal = orderItems.reduce((sum, item) => {
      return sum + (parseFloat(item.unit_price) * item.quantity);
    }, 0);

    const shippingCost = SHIPPING_COSTS[order.shipping_method] || 0;
    const verifiedTotal = itemsTotal + shippingCost;

    // Verify the stored total matches the recalculated total
    const storedTotal = parseFloat(order.total_amount);
    if (Math.abs(storedTotal - verifiedTotal) > 0.01) {
      console.error(`[Netopia] Amount mismatch: stored=${storedTotal}, calculated=${verifiedTotal}`);
      return NextResponse.json({ error: 'Amount verification failed' }, { status: 400 });
    }

    // Use the verified amount (not the client-provided one)
    const amount = verifiedTotal;

    const apiKey = process.env.NETOPIA_API_KEY || '';
    const posSignature = process.env.NETOPIA_POS_SIGNATURE || '';
    const isLive = process.env.NETOPIA_SANDBOX !== 'true';
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

    const apiUrl = isLive
      ? 'https://secure.netopia-payments.com'
      : 'https://secure-sandbox.netopia-payments.com';

    const paymentPayload = {
      config: {
        emailTemplate: '',
        notifyUrl: `${siteUrl}/api/netopia/ipn`,
        redirectUrl: `${siteUrl}/api/netopia/return`,
        language: 'ro',
      },
      payment: {
        options: {
          installments: 0,
          bonus: 0,
        },
        instrument: {
          type: 'card',
          account: '',
          expMonth: 0,
          expYear: 0,
          secretCode: '',
          token: '',
        },
        data: {},
      },
      order: {
        ntpID: '',
        posSignature: posSignature,
        dateTime: new Date().toISOString(),
        description: `Comandă numeredecasa.ro #${orderId.slice(0, 8)}`,
        orderID: orderId,
        amount: amount,
        currency: currency || 'RON',
        billing: {
          email: billing?.email || '',
          phone: billing?.phone || '',
          firstName: billing?.firstName || '',
          lastName: billing?.lastName || '',
          city: billing?.city || '',
          country: 642, // Romania ISO numeric code
          state: billing?.county || '',
          postalCode: billing?.postalCode || '',
          details: billing?.address || '',
        },
        shipping: {
          email: billing?.email || '',
          phone: billing?.phone || '',
          firstName: billing?.firstName || '',
          lastName: billing?.lastName || '',
          city: billing?.city || '',
          country: 642,
          state: billing?.county || '',
          postalCode: '',
          details: billing?.address || '',
        },
        products: [],
        data: {},
      },
    };

    // Call Netopia API v2 directly to bypass SDK bugs
    const netopiaResponse = await fetch(`${apiUrl}/payment/card/start`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': apiKey,
      },
      body: JSON.stringify(paymentPayload),
    });

    const netopiaData = await netopiaResponse.json();
    console.log('[Netopia] Payment initiated for order:', orderId.slice(0, 8));

    if (!netopiaResponse.ok || (netopiaData?.error?.code !== '00' && netopiaData?.error?.code !== '101')) {
      console.error('[Netopia] Payment initiation failed for order:', orderId.slice(0, 8));
      return NextResponse.json(
        { error: 'Payment initiation failed. Please try again.' },
        { status: 500 }
      );
    }

    // Return the payment URL or form data for 3DS redirect
    return NextResponse.json({
      success: true,
      payment: netopiaData,
    });

  } catch (error: any) {
    console.error('[Netopia] Internal error during payment start');
    return NextResponse.json(
      { error: 'An error occurred. Please try again.' },
      { status: 500 }
    );
  }
}
