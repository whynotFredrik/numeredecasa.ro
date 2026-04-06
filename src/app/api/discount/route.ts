import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || ''
);

// Generare cod unic de reducere
function generateDiscountCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // fără I, O, 0, 1 (confuzie)
  let code = 'NR-';
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

// POST — Generează un cod de reducere pentru o comandă
export async function POST(request: NextRequest) {
  try {
    // Verifică authorization (doar server-side, prin service role key)
    const authHeader = request.headers.get('x-api-key');
    if (authHeader !== process.env.SUPABASE_SERVICE_ROLE_KEY) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { order_id, customer_name, customer_email } = await request.json();

    if (!order_id || !customer_name || !customer_email) {
      return NextResponse.json(
        { error: 'order_id, customer_name și customer_email sunt obligatorii' },
        { status: 400 }
      );
    }

    // Verifică dacă există deja un cod pentru această comandă
    const { data: existing } = await supabaseAdmin
      .from('discount_codes')
      .select('code')
      .eq('source_order_id', order_id)
      .single();

    if (existing) {
      return NextResponse.json({
        success: true,
        code: existing.code,
        message: 'Cod de reducere existent returnat',
      });
    }

    // Generare cod unic
    let code = generateDiscountCode();
    let attempts = 0;
    while (attempts < 5) {
      const { data: codeExists } = await supabaseAdmin
        .from('discount_codes')
        .select('id')
        .eq('code', code)
        .single();

      if (!codeExists) break;
      code = generateDiscountCode();
      attempts++;
    }

    // Inserare cod nou
    const { data, error } = await supabaseAdmin
      .from('discount_codes')
      .insert({
        code,
        discount_percent: 15,
        source_order_id: order_id,
        source_customer_name: customer_name,
        source_customer_email: customer_email,
        max_uses: 3,
      })
      .select()
      .single();

    if (error) {
      console.error('[Discount] Eroare la generarea codului:', error);
      return NextResponse.json(
        { error: 'Eroare la generarea codului de reducere' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      code: data.code,
      discount_percent: data.discount_percent,
      expires_at: data.expires_at,
    });
  } catch (err) {
    console.error('[Discount] Excepție:', err);
    return NextResponse.json(
      { error: 'Eroare la procesarea cererii' },
      { status: 500 }
    );
  }
}
