import { NextRequest, NextResponse } from 'next/server';

// Use the official netopia-payment2 SDK
import { Netopia } from 'netopia-payment2';

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

    console.log('[Netopia] isLive:', isLive, '| Has API key:', !!apiKey, '| POS:', posSignature);

    const netopia = new Netopia({
      apiKey,
      posSignature,
      isLive,
    });

    const configData = {
      emailTemplate: '',
      emailSubject: '',
      cancelUrl: `${siteUrl}/checkout`,
      notifyUrl: `${siteUrl}/api/netopia/ipn`,
      redirectUrl: `${siteUrl}/api/netopia/return`,
      language: 'ro',
    };

    const paymentData = {
      options: {
        installments: 0,
        bonus: 0,
        split: [] as { posID: number; amount: number }[],
      },
      instrument: {
        type: 'card',
        account: '',
        expMonth: 0,
        expYear: 0,
        secretCode: '',
        token: '',
        clientID: '',
      },
      data: {},
    };

    const orderData = {
      ntpID: '',
      posSignature,
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
        country: 642,
        countryName: 'Romania',
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
        countryName: 'Romania',
        state: billing?.county || '',
        postalCode: '',
        details: billing?.address || '',
      },
      products: [],
      installments: {
        selected: 0,
        available: 0,
      },
      data: {},
    };

    const result = await netopia.createOrder(configData, paymentData, orderData);
    console.log('[Netopia] SDK result:', JSON.stringify(result));

    if (result.code === 200 && result.data) {
      return NextResponse.json({
        success: true,
        payment: result.data,
      });
    }

    return NextResponse.json(
      { error: 'Payment initiation failed', details: result.message, code: result.code },
      { status: 500 }
    );

  } catch (error: any) {
    console.error('Payment start error:', error);
    return NextResponse.json(
      { error: 'Internal server error', message: error.message },
      { status: 500 }
    );
  }
}
