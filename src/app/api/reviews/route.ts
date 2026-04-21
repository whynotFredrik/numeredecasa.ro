import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { resend, FROM_EMAIL, FROM_NAME } from '@/lib/resend/client';
import { reviewRewardEmail } from '@/lib/resend/templates';

// Public client for reading approved reviews
const supabasePublic = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
);

// Admin client for inserting reviews
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

// GET — Citește recenziile aprobate
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const productType = searchParams.get('product_type');
  const featured = searchParams.get('featured');
  const limit = parseInt(searchParams.get('limit') || '10');

  let query = supabasePublic
    .from('reviews')
    .select('id, created_at, customer_name, rating, review_text, product_type, is_featured')
    .eq('is_approved', true)
    .order('created_at', { ascending: false })
    .limit(limit);

  if (productType) {
    query = query.eq('product_type', productType);
  }

  if (featured === 'true') {
    query = query.eq('is_featured', true);
  }

  const { data, error } = await query;

  if (error) {
    console.error('[Reviews] Eroare la citirea recenziilor:', error);
    return NextResponse.json({ error: 'Eroare la încărcarea recenziilor' }, { status: 500 });
  }

  return NextResponse.json({ reviews: data || [] });
}

// POST — Trimite o recenzie nouă
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { customer_name, customer_email, rating, review_text, product_type, order_id } = body;

    // Validare
    if (!customer_name || !customer_email || !rating || !review_text) {
      return NextResponse.json(
        { error: 'Toate câmpurile sunt obligatorii' },
        { status: 400 }
      );
    }

    if (rating < 1 || rating > 5) {
      return NextResponse.json(
        { error: 'Rating-ul trebuie să fie între 1 și 5' },
        { status: 400 }
      );
    }

    if (review_text.length < 10) {
      return NextResponse.json(
        { error: 'Recenzia trebuie să conțină cel puțin 10 caractere' },
        { status: 400 }
      );
    }

    // Verifică dacă acest email a lăsat deja o recenzie
    const { data: existingReview } = await supabaseAdmin
      .from('reviews')
      .select('id')
      .eq('customer_email', customer_email)
      .limit(1)
      .single();

    if (existingReview) {
      return NextResponse.json(
        { error: 'Ai lăsat deja o recenzie. Mulțumim pentru feedback!' },
        { status: 409 }
      );
    }

    // Verifică dacă order_id există (dacă a fost furnizat)
    if (order_id) {
      const { data: order } = await supabaseAdmin
        .from('orders')
        .select('id')
        .eq('id', order_id)
        .single();

      if (!order) {
        return NextResponse.json(
          { error: 'Comanda specificată nu a fost găsită' },
          { status: 404 }
        );
      }
    }

    const { data, error } = await supabaseAdmin
      .from('reviews')
      .insert({
        customer_name,
        customer_email,
        rating: parseInt(rating),
        review_text,
        product_type: product_type || null,
        order_id: order_id || null,
        is_approved: false, // Necesită aprobare manuală
      })
      .select()
      .single();

    if (error) {
      console.error('[Reviews] Eroare la inserarea recenziei:', error);
      return NextResponse.json(
        { error: 'Eroare la salvarea recenziei' },
        { status: 500 }
      );
    }

    // ── Generare cod de reducere și trimitere email recompensă ──
    try {
      // Verifică dacă s-a mai generat un cod pentru acest email (evită duplicate)
      const { data: existingCode } = await supabaseAdmin
        .from('discount_codes')
        .select('code')
        .eq('source_customer_email', customer_email)
        .single();

      if (!existingCode) {
        // Generare cod unic
        let discountCode = generateDiscountCode();
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

        // Salvare cod în baza de date
        const { data: newCode, error: codeError } = await supabaseAdmin
          .from('discount_codes')
          .insert({
            code: discountCode,
            discount_percent: 15,
            source_order_id: order_id || null,
            source_customer_name: customer_name,
            source_customer_email: customer_email,
            max_uses: 2,
          })
          .select()
          .single();

        if (!codeError && newCode) {
          // Trimite email cu codul de reducere
          const firstName = customer_name.split(' ')[0];
          const { subject, html } = reviewRewardEmail({
            customerFirstName: firstName,
            discountCode: newCode.code,
            discountPercent: 15,
            expiresAt: newCode.expires_at,
            maxUses: 2,
          });

          const { error: emailError } = await resend.emails.send({
            from: `${FROM_NAME} <${FROM_EMAIL}>`,
            replyTo: 'ciobotaru.serban@gmail.com',
            to: customer_email,
            subject,
            html,
          });

          if (emailError) {
            console.error('[Reviews] Eroare la trimiterea emailului de recompensă:', emailError);
          } else {
            // Marchează codul ca trimis
            await supabaseAdmin
              .from('discount_codes')
              .update({ email_sent_at: new Date().toISOString() })
              .eq('code', newCode.code);

            console.log(`[Reviews] Email recompensă trimis la ${customer_email}, cod: ${newCode.code}`);
          }
        } else {
          console.error('[Reviews] Eroare la generarea codului de reducere:', codeError);
        }
      } else {
        console.log(`[Reviews] Codul de reducere există deja pentru ${customer_email}: ${existingCode.code}`);
      }
    } catch (rewardErr) {
      // Nu bloca flow-ul recenziei dacă recompensa eșuează
      console.error('[Reviews] Eroare la procesarea recompensei:', rewardErr);
    }

    return NextResponse.json({
      success: true,
      message: 'Recenzia a fost trimisă și va fi publicată după verificare. Verifică-ți emailul pentru codul de reducere!',
    });
  } catch (err) {
    console.error('[Reviews] Excepție:', err);
    return NextResponse.json(
      { error: 'Eroare la procesarea cererii' },
      { status: 500 }
    );
  }
}
