import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { Ipn } from 'netopia-payment2';
import { sendPaymentConfirmation } from '@/lib/resend/send';


// Use server-side Supabase client (not exposed to browser)
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || ''
);

// Initialize Netopia IPN verifier
const posSignature = process.env.NETOPIA_POS_SIGNATURE || '';

function getIpnVerifier() {
  const rawKey = process.env.NETOPIA_PUBLIC_KEY || '';
  if (!rawKey || !posSignature) {
    return null;
  }
  // .env files store multiline values with literal \n — restore actual newlines
  const publicKey = rawKey.replace(/\\n/g, '\n');
  return new Ipn({
    posSignature,
    posSignatureSet: [posSignature],
    hashMethod: 'sha512',
    alg: 'RS512',
    publicKeyStr: publicKey,
  });
}

export async function POST(request: NextRequest) {
  try {
    // Get raw body for signature verification
    const rawBody = await request.text();

    // --- IPN Signature Verification ---
    const verificationToken = request.headers.get('Verification-token');
    const ipnVerifier = getIpnVerifier();

    if (ipnVerifier && verificationToken) {
      try {
        const verifyResult = await ipnVerifier.verify(verificationToken, rawBody);
        if (verifyResult.errorType !== 0) {
          console.error('[IPN] Verification failed:', verifyResult.errorMessage);
          return NextResponse.json(
            { errorCode: 1, errorMessage: 'IPN verification failed' },
            { status: 403 }
          );
        }
        console.log('[IPN] Signature verified successfully');
      } catch (verifyError: any) {
        console.error('[IPN] Verification error:', verifyError.message);
        return NextResponse.json(
          { errorCode: 1, errorMessage: 'IPN verification error' },
          { status: 403 }
        );
      }
    } else if (!ipnVerifier) {
      // Log warning if verification is not configured — allow in sandbox only
      const isSandbox = process.env.NETOPIA_SANDBOX === 'true';
      if (!isSandbox) {
        console.error('[IPN] CRITICAL: IPN verification not configured in production! Rejecting request.');
        return NextResponse.json(
          { errorCode: 1, errorMessage: 'IPN verification not configured' },
          { status: 500 }
        );
      }
      console.warn('[IPN] WARNING: IPN verification not configured (sandbox mode)');
    } else {
      // No verification token in request
      console.error('[IPN] Missing Verification-token header');
      return NextResponse.json(
        { errorCode: 1, errorMessage: 'Missing verification token' },
        { status: 403 }
      );
    }

    // Parse the verified body
    const body = JSON.parse(rawBody);
    const { payment, order } = body;

    const orderId = order?.orderID;
    const paymentStatus = payment?.status;

    console.log(`[IPN] Order: ${orderId}, Status: ${paymentStatus}`);

    if (!orderId) {
      return NextResponse.json({ errorCode: 1, errorMessage: 'Missing orderID' }, { status: 400 });
    }

    // Verify the order exists in our database before processing
    const { data: existingOrder, error: fetchError } = await supabaseAdmin
      .from('orders')
      .select('id, total_amount, payment_status')
      .eq('id', orderId)
      .single();

    if (fetchError || !existingOrder) {
      console.error('[IPN] Order not found in database:', orderId);
      return NextResponse.json({ errorCode: 1, errorMessage: 'Order not found' }, { status: 404 });
    }

    // Don't process if already paid (prevent duplicate processing)
    if (existingOrder.payment_status === 'paid') {
      console.log(`[IPN] Order ${orderId} already marked as paid, skipping`);
      return NextResponse.json({ errorCode: 0, errorMessage: 'OK' });
    }

    // Map Netopia status to our internal status
    let internalStatus = 'pending';
    switch (paymentStatus) {
      case 3:  // Paid
      case 5:  // Confirmed
        internalStatus = 'paid';
        break;
      case 12: // Declined
      case 13: // Rejected
        internalStatus = 'failed';
        break;
      case 15: // Fraud
        internalStatus = 'failed';
        break;
      default:
        internalStatus = 'pending';
    }

    // Update order payment_status in Supabase
    const { error } = await supabaseAdmin
      .from('orders')
      .update({ payment_status: internalStatus })
      .eq('id', orderId);

    if (error) {
      console.error('[IPN] Supabase update error');
    } else {
      console.log(`[IPN] Order ${orderId} updated to: ${internalStatus}`);
    }

    // Trimite email de confirmare plată dacă plata a fost confirmată
    if (internalStatus === 'paid') {
      try {
        const { data: orderData } = await supabaseAdmin
          .from('orders')
          .select('*')
          .eq('id', orderId)
          .single();

        const { data: orderItems } = await supabaseAdmin
          .from('order_items')
          .select('*')
          .eq('order_id', orderId);

        if (orderData) {
          await sendPaymentConfirmation({
            ...orderData,
            items: orderItems || [],
          });
        }
      } catch (emailErr) {
        // Nu blocăm răspunsul IPN dacă emailul eșuează
        console.error('[IPN] Eroare la trimiterea emailului de confirmare plată:', emailErr);
      }
    }

    // TODO: Facturare automată va fi implementată prin WOOT

    // Netopia expects this exact response format
    return NextResponse.json({
      errorCode: 0,
      errorMessage: 'OK',
    });

  } catch (error: any) {
    console.error('[IPN] Error processing notification');
    return NextResponse.json({
      errorCode: 1,
      errorMessage: 'Internal processing error',
    }, { status: 500 });
  }
}
