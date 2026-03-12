import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

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
