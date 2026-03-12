import { NextRequest, NextResponse } from 'next/server';
import { NETOPIA_CONFIG } from '@/lib/netopia/config';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { orderId, amount, currency, billing, description } = body;

    if (!orderId || !amount) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const paymentPayload = {
      config: {
        emailTemplate: '',
        notifyUrl: NETOPIA_CONFIG.notifyUrl,
        redirectUrl: NETOPIA_CONFIG.redirectUrl,
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
        posSignature: NETOPIA_CONFIG.posSignature,
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

    // Call Netopia API v2
    const netopiaResponse = await fetch(`${NETOPIA_CONFIG.apiUrl}/payment/card/start`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': NETOPIA_CONFIG.apiKey,
      },
      body: JSON.stringify(paymentPayload),
    });

    const netopiaData = await netopiaResponse.json();

    if (!netopiaResponse.ok) {
      console.error('Netopia API Error:', netopiaData);
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
    console.error('Payment start error:', error);
    return NextResponse.json(
      { error: 'Internal server error', message: error.message },
      { status: 500 }
    );
  }
}
