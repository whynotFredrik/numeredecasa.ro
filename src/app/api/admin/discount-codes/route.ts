import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || ''
);

export async function GET(request: NextRequest) {
  try {
    const { data: codes, error } = await supabaseAdmin
      .from('discount_codes')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;

    return NextResponse.json({
      codes: codes || [],
    });
  } catch (error) {
    console.error('[Admin Discount Codes] Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch discount codes' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { codeId, is_active } = await request.json();

    if (!codeId) {
      return NextResponse.json(
        { error: 'codeId is required' },
        { status: 400 }
      );
    }

    const updateData: Record<string, any> = {};
    if (is_active !== undefined) updateData.is_active = is_active;

    const { error } = await supabaseAdmin
      .from('discount_codes')
      .update(updateData)
      .eq('id', codeId);

    if (error) throw error;

    return NextResponse.json({
      success: true,
      message: 'Discount code updated successfully',
    });
  } catch (error) {
    console.error('[Admin Discount Codes PUT] Error:', error);
    return NextResponse.json(
      { error: 'Failed to update discount code' },
      { status: 500 }
    );
  }
}
