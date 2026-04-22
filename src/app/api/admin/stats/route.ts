import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || ''
);

export async function GET(request: NextRequest) {
  try {
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0);

    // Get current month's orders
    const { data: currentMonthOrders, error: currentMonthError } = await supabaseAdmin
      .from('orders')
      .select('id, total_amount, payment_status, order_status')
      .gte('created_at', monthStart.toISOString())
      .lte('created_at', now.toISOString());

    if (currentMonthError) throw currentMonthError;

    // Get last month's orders for comparison
    const { data: lastMonthOrders, error: lastMonthError } = await supabaseAdmin
      .from('orders')
      .select('id, total_amount, payment_status')
      .gte('created_at', lastMonthStart.toISOString())
      .lte('created_at', lastMonthEnd.toISOString());

    if (lastMonthError) throw lastMonthError;

    // Get all reviews for average rating
    const { data: reviews, error: reviewsError } = await supabaseAdmin
      .from('reviews')
      .select('rating, is_approved');

    if (reviewsError) throw reviewsError;

    // Get recent 10 orders
    const { data: recentOrders, error: recentOrdersError } = await supabaseAdmin
      .from('orders')
      .select('id, customer_first_name, customer_last_name, customer_email, total_amount, payment_status, order_status, created_at')
      .order('created_at', { ascending: false })
      .limit(10);

    if (recentOrdersError) throw recentOrdersError;

    // Get discount codes stats
    const { data: discountCodes, error: discountCodesError } = await supabaseAdmin
      .from('discount_codes')
      .select('id, is_active, times_used, source_order_id');

    if (discountCodesError) throw discountCodesError;

    // Get all orders for chart data
    const { data: allOrders, error: allOrdersError } = await supabaseAdmin
      .from('orders')
      .select('id, total_amount, created_at')
      .gte('created_at', thirtyDaysAgo.toISOString());

    if (allOrdersError) throw allOrdersError;

    // Calculate statistics
    const currentRevenue = currentMonthOrders?.reduce((sum, o) => sum + (o.total_amount || 0), 0) || 0;
    const lastRevenue = lastMonthOrders?.reduce((sum, o) => sum + (o.total_amount || 0), 0) || 0;
    const revenueChange = lastRevenue > 0 ? ((currentRevenue - lastRevenue) / lastRevenue) * 100 : 0;

    const currentOrderCount = currentMonthOrders?.length || 0;
    const lastOrderCount = lastMonthOrders?.length || 0;
    const ordersChange = lastOrderCount > 0 ? ((currentOrderCount - lastOrderCount) / lastOrderCount) * 100 : 0;

    const currentPaidOrders = currentMonthOrders?.filter(o => o.payment_status === 'paid').length || 0;
    const currentPaymentSuccessRate = currentOrderCount > 0 ? (currentPaidOrders / currentOrderCount) * 100 : 0;
    const lastPaidOrders = lastMonthOrders?.filter(o => o.payment_status === 'paid').length || 0;
    const lastPaymentSuccessRate = lastOrderCount > 0 ? (lastPaidOrders / lastOrderCount) * 100 : 0;
    const paymentRateChange = lastPaymentSuccessRate > 0 ? (currentPaymentSuccessRate - lastPaymentSuccessRate) : 0;

    const approvedReviews = reviews?.filter(r => r.is_approved) || [];
    const avgRating = approvedReviews.length > 0
      ? approvedReviews.reduce((sum, r) => sum + r.rating, 0) / approvedReviews.length
      : 0;

    // We'll assume previous month's average is similar for now
    const ratingChange = 0;

    // Generate chart data (last 30 days)
    const chartData = generateChartData(allOrders || []);

    // Status breakdown
    const statusBreakdown = {
      new: currentMonthOrders?.filter(o => o.order_status === 'new').length || 0,
      processing: currentMonthOrders?.filter(o => o.order_status === 'processing').length || 0,
      shipped: currentMonthOrders?.filter(o => o.order_status === 'shipped').length || 0,
      delivered: currentMonthOrders?.filter(o => o.order_status === 'delivered').length || 0,
      completed: currentMonthOrders?.filter(o => o.order_status === 'completed').length || 0,
      cancelled: currentMonthOrders?.filter(o => o.order_status === 'cancelled').length || 0,
    };

    // Discount codes stats
    const totalCodes = discountCodes?.length || 0;
    const activeCodes = discountCodes?.filter(c => c.is_active).length || 0;
    const totalUsages = discountCodes?.reduce((sum, c) => sum + (c.times_used || 0), 0) || 0;

    // Calculate revenue from discount codes (using source_order_id)
    const discountedOrders = currentMonthOrders?.filter(o => o.order_status === 'completed' || o.order_status === 'delivered') || [];
    const totalRevenueFromDiscounts = 0; // Would need discount_amount from orders table

    return NextResponse.json({
      totalRevenue: currentRevenue,
      totalRevenueChange: revenueChange,
      ordersThisMonth: currentOrderCount,
      ordersThisMonthChange: ordersChange,
      paymentSuccessRate: currentPaymentSuccessRate,
      paymentSuccessRateChange: paymentRateChange,
      averageRating: avgRating,
      averageRatingChange: ratingChange,
      chartData,
      recentOrders: (recentOrders || []).map(o => ({
        id: o.id,
        customerName: `${o.customer_first_name} ${o.customer_last_name}`,
        email: o.customer_email,
        totalAmount: o.total_amount,
        paymentStatus: o.payment_status,
        orderStatus: o.order_status,
        createdAt: o.created_at,
      })),
      statusBreakdown,
      discountCodeStats: {
        totalCodes,
        activeCodes,
        totalUsages,
        totalRevenueFromDiscounts,
      },
    });
  } catch (error) {
    console.error('[Admin Stats] Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch statistics' },
      { status: 500 }
    );
  }
}

function generateChartData(orders: any[]) {
  const chartData: Record<string, number> = {};

  // Initialize last 30 days
  for (let i = 29; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    const dateStr = date.toLocaleDateString('ro-RO', { month: '2-digit', day: '2-digit' });
    chartData[dateStr] = 0;
  }

  // Sum up revenues by date
  orders.forEach(order => {
    const date = new Date(order.created_at);
    const dateStr = date.toLocaleDateString('ro-RO', { month: '2-digit', day: '2-digit' });
    if (dateStr in chartData) {
      chartData[dateStr] += order.total_amount || 0;
    }
  });

  return Object.entries(chartData).map(([date, revenue]) => ({
    date,
    revenue,
  }));
}
