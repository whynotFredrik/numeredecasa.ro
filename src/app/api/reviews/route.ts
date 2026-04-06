import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

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

    return NextResponse.json({
      success: true,
      message: 'Recenzia a fost trimisă și va fi publicată după verificare. Mulțumim!',
    });
  } catch (err) {
    console.error('[Reviews] Excepție:', err);
    return NextResponse.json(
      { error: 'Eroare la procesarea cererii' },
      { status: 500 }
    );
  }
}
