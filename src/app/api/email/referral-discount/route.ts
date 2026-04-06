import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { resend, FROM_EMAIL, FROM_NAME } from '@/lib/resend/client';
import { postDeliveryEmail } from '@/lib/resend/templates';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || ''
);

// POST — Trimite email post-livrare cu solicitare recenzie
// Apelat când o comandă este marcată ca livrată
// Codul de reducere NU se mai trimite aici — se trimite doar la completarea recenziei
export async function POST(request: NextRequest) {
  try {
    const { orderId } = await request.json();

    if (!orderId) {
      return NextResponse.json({ error: 'orderId este obligatoriu' }, { status: 400 });
    }

    // Ia datele comenzii
    const { data: order, error: orderError } = await supabaseAdmin
      .from('orders')
      .select('*')
      .eq('id', orderId)
      .single();

    if (orderError || !order) {
      console.error('[PostDelivery] Comanda nu a fost găsită:', orderId);
      return NextResponse.json({ error: 'Comanda nu a fost găsită' }, { status: 404 });
    }

    // Trimite emailul de solicitare recenzie (fără cod de reducere)
    const { subject, html } = postDeliveryEmail({
      customerFirstName: order.customer_first_name,
      orderId,
      reviewUrl: `https://numarul.ro/configurator`,
    });

    const { data: emailData, error: emailError } = await resend.emails.send({
      from: `${FROM_NAME} <${FROM_EMAIL}>`,
      replyTo: 'ciobotaru.serban@gmail.com',
      to: order.customer_email,
      subject,
      html,
    });

    if (emailError) {
      console.error('[PostDelivery] Eroare la trimiterea emailului:', emailError);
      return NextResponse.json({ error: 'Eroare la trimiterea emailului' }, { status: 500 });
    }

    console.log(`[PostDelivery] Email recenzie trimis la ${order.customer_email}`);

    return NextResponse.json({
      success: true,
      emailId: emailData?.id,
    });
  } catch (err) {
    console.error('[PostDelivery] Excepție:', err);
    return NextResponse.json({ error: 'Eroare la procesarea cererii' }, { status: 500 });
  }
}
