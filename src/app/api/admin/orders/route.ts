import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || ''
);

export async function GET(request: NextRequest) {
  try {
    // Get all orders with their items
    const { data: orders, error: ordersError } = await supabaseAdmin
      .from('orders')
      .select('*')
      .order('created_at', { ascending: false });

    if (ordersError) throw ordersError;

    // Get all order items
    const { data: orderItems, error: itemsError } = await supabaseAdmin
      .from('order_items')
      .select('*');

    if (itemsError) throw itemsError;

    // Combine orders with their items
    const ordersWithItems = (orders || []).map(order => ({
      ...order,
      items: (orderItems || []).filter(item => item.order_id === order.id),
    }));

    return NextResponse.json({
      orders: ordersWithItems,
    });
  } catch (error) {
    console.error('[Admin Orders] Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch orders' },
      { status: 500 }
    );
  }
}
