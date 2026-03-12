import { NextRequest, NextResponse } from 'next/server';

// This route handles the 3D Secure redirect from Netopia
// After the customer completes 3DS authentication, Netopia redirects here

export async function POST(request: NextRequest) {
  // Netopia sends the result via POST after 3DS
  const formData = await request.formData();
  const data = Object.fromEntries(formData);

  console.log('[3DS Return] Data:', data);

  // Redirect user to our thank-you/order-status page
  const redirectUrl = new URL('/comanda-finalizata', request.url);

  // Pass some query params so the page can show the status
  if (data.orderId) redirectUrl.searchParams.set('orderId', String(data.orderId));

  return NextResponse.redirect(redirectUrl, 303);
}

export async function GET(request: NextRequest) {
  // Fallback for GET redirects
  const redirectUrl = new URL('/comanda-finalizata', request.url);
  return NextResponse.redirect(redirectUrl, 303);
}
