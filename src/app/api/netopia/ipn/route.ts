import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { createInvoice } from '@/lib/smartbill/invoice';

// Use server-side Supabase client (not exposed to browser)
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
);

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Netopia sends payment notification data
    const { payment, order } = body;

    const orderId = order?.orderID;
    const paymentStatus = payment?.status;

    console.log(`[IPN] Order: ${orderId}, Status: ${paymentStatus}`);

    if (!orderId) {
      return NextResponse.json({ errorCode: 1, errorMessage: 'Missing orderID' }, { status: 400 });
    }

    // Map Netopia status to our internal status
    let internalStatus = 'pending';
    switch (paymentStatus) {
      case 3:  // Paid / Confirmed
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
      console.error('[IPN] Supabase update error:', error);
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
            console.log(`[IPN] Smartbill invoice created: ${invoiceResult.series}-${invoiceResult.number}`);
          } else {
            console.error('[IPN] Smartbill invoice failed:', invoiceResult.error);
          }
        }
      } catch (invoiceError: any) {
        // Log but don't fail the IPN — factura poate fi emisă manual
        console.error('[IPN] Invoice generation error:', invoiceError.message);
      }
    }

    // Netopia expects this exact response format
    return NextResponse.json({
      errorCode: 0,
      errorMessage: 'OK',
    });

  } catch (error: any) {
    console.error('[IPN] Error processing notification:', error);
    return NextResponse.json({
      errorCode: 1,
      errorMessage: error.message,
    }, { status: 500 });
  }
}

