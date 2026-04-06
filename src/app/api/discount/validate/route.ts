import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || ''
);

// POST — Validare cod de reducere
export async function POST(request: NextRequest) {
  try {
    const { code } = await request.json();

    if (!code || typeof code !== 'string') {
      return NextResponse.json(
        { valid: false, error: 'Codul de reducere este obligatoriu' },
        { status: 400 }
      );
    }

    const normalizedCode = code.trim().toUpperCase();

    const { data: discount, error } = await supabaseAdmin
      .from('discount_codes')
      .select('*')
      .eq('code', normalizedCode)
      .single();

    if (error || !discount) {
      return NextResponse.json({
        valid: false,
        error: 'Codul de reducere nu a fost găsit',
      });
    }

    // Verifică dacă este activ
    if (!discount.is_active) {
      return NextResponse.json({
        valid: false,
        error: 'Acest cod de reducere nu mai este activ',
      });
    }

    // Verifică expirarea
    if (discount.expires_at && new Date(discount.expires_at) < new Date()) {
      return NextResponse.json({
        valid: false,
        error: 'Acest cod de reducere a expirat',
      });
    }

    // Verifică numărul de utilizări
    if (discount.times_used >= discount.max_uses) {
      return NextResponse.json({
        valid: false,
        error: 'Acest cod de reducere a atins limita maximă de utilizări',
      });
    }

    return NextResponse.json({
      valid: true,
      discount_percent: discount.discount_percent,
      code: discount.code,
      message: `Reducere de ${discount.discount_percent}% aplicată cu succes!`,
    });
  } catch (err) {
    console.error('[Discount] Excepție la validare:', err);
    return NextResponse.json(
      { valid: false, error: 'Eroare la validarea codului' },
      { status: 500 }
    );
  }
}
