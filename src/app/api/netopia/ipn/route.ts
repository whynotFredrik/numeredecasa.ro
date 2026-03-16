import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { Ipn } from 'netopia-payment2';
import { createInvoice } from '@/lib/smartbill/invoice';

// Use server-side Supabase client (not exposed to browser)
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || ''
);

// Initialize Netopia IPN verifier
const posSignature = process.env.NETOPIA_POS_SIGNATURE || '';

function getIpnVerifier() {
  const publicKey = process.env.NETOPIA_PUBLIC_KEY || '';
  if (!publicKey || !posSignature) {
    return null;
  }
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

    // If payment is confirmed, generate Smartbill invoice
    if (internalStatus === 'paid') {
      try {
        // Fetch order details from Supabase
        const { data: orderData } = await supabaseAdmin
          .from('orders')
          .select('*')
          .eq('id', orderId)
          .single();

        const { data: orderItems } = await supabaseAdmin
          .from('order_items')
          .select('*')
          .eq('order_id', orderId);

        if (orderData && orderItems) {
          const productTypeNames: Record<string, string> = {
            'house': 'Număr Stradal Signature',
            'apartment': 'Număr Apartament Signature',
            'office': 'Plăcuță Birou Signature',
          };

          const invoiceResult = await createInvoice({
            orderId,
            client: {
              name: `${orderData.customer_first_name} ${orderData.customer_last_name}`,
              email: orderData.customer_email,
              phone: orderData.customer_phone,
              city: orderData.shipping_city || '',
              county: orderData.shipping_county || '',
              address: orderData.shipping_address || '',
            },
            products: [
              // Map order items to invoice products
              ...orderItems.map(item => ({
                name: `${productTypeNames[item.product_type] || 'Produs'} - ${item.finish === 'black' ? 'Negru' : 'Alb'}${item.main_number ? ` (Nr. ${item.main_number})` : ''}`,
                code: `SIG-${item.product_type?.toUpperCase()?.slice(0, 3)}`,
                quantity: item.quantity,
                price: parseFloat(item.unit_price),
                measuringUnitName: 'buc',
                isTaxIncluded: true,
                taxPercentage: 19,
              })),
              // Add shipping as a separate line item
              {
                name: `Transport ${orderData.shipping_method === 'courier' ? 'Curier Sameday' : 'Sameday Easybox'}`,
                code: 'TRANSPORT',
                quantity: 1,
                price: parseFloat(orderData.shipping_amount),
                measuringUnitName: 'buc',
                isTaxIncluded: true,
                taxPercentage: 19,
              },
            ],
          });

          if (invoiceResult.success) {
            console.log(`[IPN] Invoice created: ${invoiceResult.series}-${invoiceResult.number}`);
          } else {
            console.error('[IPN] Invoice creation failed');
          }
        }
      } catch (invoiceError: any) {
        // Log but don't fail the IPN — factura poate fi emisă manual
        console.error('[IPN] Invoice generation error');
      }
    }

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
