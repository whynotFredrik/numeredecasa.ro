import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || ''
);

export async function GET(request: NextRequest) {
  try {
    const { data: reviews, error } = await supabaseAdmin
      .from('reviews')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;

    return NextResponse.json({
      reviews: reviews || [],
    });
  } catch (error) {
    console.error('[Admin Reviews] Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch reviews' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { reviewId, is_approved, is_featured } = await request.json();

    if (!reviewId) {
      return NextResponse.json(
        { error: 'reviewId is required' },
        { status: 400 }
      );
    }

    const updateData: Record<string, any> = {};
    if (is_approved !== undefined) updateData.is_approved = is_approved;
    if (is_featured !== undefined) updateData.is_featured = is_featured;

    const { error } = await supabaseAdmin
      .from('reviews')
      .update(updateData)
      .eq('id', reviewId);

    if (error) throw error;

    return NextResponse.json({
      success: true,
      message: 'Review updated successfully',
    });
  } catch (error) {
    console.error('[Admin Reviews PUT] Error:', error);
    return NextResponse.json(
      { error: 'Failed to update review' },
      { status: 500 }
    );
  }
}
