import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { resend, FROM_EMAIL, FROM_NAME } from '@/lib/resend/client';
import { referralDiscountEmail } from '@/lib/resend/templates';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || ''
);

// Generare cod unic de reducere
function generateDiscountCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = 'NR-';
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

// POST — Trimite email cu cod de reducere pentru prieteni/familie
// Apelat când o comandă este marcată ca livrată
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
      console.error('[Referral] Comanda nu a fost găsită:', orderId);
      return NextResponse.json({ error: 'Comanda nu a fost găsită' }, { status: 404 });
    }

    // Verifică dacă deja s-a generat un cod pentru această comandă
    const { data: existingCode } = await supabaseAdmin
      .from('discount_codes')
      .select('*')
      .eq('source_order_id', orderId)
      .single();

    let discountCode: string;
    let expiresAt: string;

    if (existingCode) {
      // Dacă deja există dar nu s-a trimis emailul
      if (existingCode.email_sent_at) {
        return NextResponse.json({
          success: true,
          message: 'Emailul de referral a fost deja trimis pentru această comandă',
          code: existingCode.code,
        });
      }
      discountCode = existingCode.code;
      expiresAt = existingCode.expires_at;
    } else {
      // Generare cod nou unic
      discountCode = generateDiscountCode();
      let attempts = 0;
      while (attempts < 5) {
        const { data: codeExists } = await supabaseAdmin
          .from('discount_codes')
          .select('id')
          .eq('code', discountCode)
          .single();

        if (!codeExists) break;
        discountCode = generateDiscountCode();
        attempts++;
      }

      const { data: newCode, error: codeError } = await supabaseAdmin
        .from('discount_codes')
        .insert({
          code: discountCode,
          discount_percent: 15,
          source_order_id: orderId,
          source_customer_name: `${order.customer_first_name} ${order.customer_last_name}`,
          source_customer_email: order.customer_email,
          max_uses: 3,
        })
        .select()
        .single();

      if (codeError || !newCode) {
        console.error('[Referral] Eroare la generarea codului:', codeError);
        return NextResponse.json({ error: 'Eroare la generarea codului' }, { status: 500 });
      }

      expiresAt = newCode.expires_at;
    }

    // Trimite emailul
    const { subject, html } = referralDiscountEmail({
      customerFirstName: order.customer_first_name,
      discountCode,
      discountPercent: 15,
      expiresAt,
      maxUses: 3,
    });

    const { data: emailData, error: emailError } = await resend.emails.send({
      from: `${FROM_NAME} <${FROM_EMAIL}>`,
      replyTo: 'ciobotaru.serban@gmail.com',
      to: order.customer_email,
      subject,
      html,
    });

    if (emailError) {
      console.error('[Referral] Eroare la trimiterea emailului:', emailError);
      return NextResponse.json({ error: 'Eroare la trimiterea emailului' }, { status: 500 });
    }

    // Marchează codul ca trimis
    await supabaseAdmin
      .from('discount_codes')
      .update({ email_sent_at: new Date().toISOString() })
      .eq('code', discountCode);

    console.log(`[Referral] Email trimis la ${order.customer_email}, cod: ${discountCode}`);

    return NextResponse.json({
      success: true,
      code: discountCode,
      emailId: emailData?.id,
    });
  } catch (err) {
    console.error('[Referral] Excepție:', err);
    return NextResponse.json({ error: 'Eroare la procesarea cererii' }, { status: 500 });
  }
}
