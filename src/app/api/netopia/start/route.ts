import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { orderId, amount, currency, billing, description } = body;

    if (!orderId || !amount) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const apiKey = process.env.NETOPIA_API_KEY || '';
    const posSignature = process.env.NETOPIA_POS_SIGNATURE || '';
    const isLive = process.env.NETOPIA_SANDBOX !== 'true';
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

    const apiUrl = isLive 
      ? 'https://secure.netopia-payments.com' 
      : 'https://secure-sandbox.netopia-payments.com';

    console.log('[Netopia API] URL:', apiUrl);
    console.log('[Netopia API] POS:', posSignature);

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
        description: description || `Comandă numeredecasa.ro #${orderId.slice(0, 8)}`,
        orderID: orderId,
        amount: parseFloat(amount),
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

    console.log('[Netopia API] Request Body Length:', JSON.stringify(paymentPayload).length);

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
    console.log('[Netopia API] Response Status:', netopiaResponse.status);
    console.log('[Netopia API] Full JSON Response:', JSON.stringify(netopiaData));

    if (!netopiaResponse.ok || (netopiaData?.error?.code !== '00' && netopiaData?.error?.code !== '101')) {
      return NextResponse.json(
        { error: 'Payment initiation failed', details: netopiaData },
        { status: 500 }
      );
    }

    // Return the payment URL or form data for 3DS redirect
    return NextResponse.json({
      success: true,
      payment: netopiaData,
    });

  } catch (error: any) {
    console.error('[Netopia API] Catch block error:', error);
    return NextResponse.json(
      { error: 'Internal server error', message: error.message },
      { status: 500 }
    );
  }
}
