'use client';

import { useState, useEffect } from 'react';
import { TrendingUp, ShoppingCart, CheckCircle, Star } from 'lucide-react';

interface DashboardStats {
  totalRevenue: number;
  totalRevenueChange: number;
  ordersThisMonth: number;
  ordersThisMonthChange: number;
  paymentSuccessRate: number;
  paymentSuccessRateChange: number;
  averageRating: number;
  averageRatingChange: number;
  chartData: Array<{ date: string; revenue: number }>;
  recentOrders: Array<{
    id: string;
    customerName: string;
    email: string;
    totalAmount: number;
    paymentStatus: string;
    orderStatus: string;
    createdAt: string;
  }>;
  statusBreakdown: {
    new: number;
    processing: number;
    shipped: number;
    delivered: number;
    completed: number;
    cancelled: number;
  };
  discountCodeStats: {
    totalCodes: number;
    activeCodes: number;
    totalUsages: number;
    totalRevenueFromDiscounts: number;
  };
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/stats');
      if (!response.ok) throw new Error('Failed to fetch stats');
      const data = await response.json();
      setStats(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load dashboard');
      console.error('Error fetching stats:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-lg text-foreground/60">Se încarcă...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-800">
        <p className="font-semibold">Eroare la încărcarea dashboard-ului</p>
        <p className="text-sm mt-1">{error}</p>
      </div>
    );
  }

  if (!stats) return null;

  // Find max revenue for chart scaling
  const maxRevenue = Math.max(...stats.chartData.map(d => d.revenue), 0) || 1;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-4xl font-bold mb-2">Dashboard</h1>
        <p className="text-foreground/60">Bun venit în panoul de administrare</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Revenue */}
        <KPICard
          title="Total Venituri"
          value={`${(stats.totalRevenue / 1000).toFixed(1)}K RON`}
          change={stats.totalRevenueChange}
          icon={<TrendingUp className="w-6 h-6" />}
          color="primary"
        />

        {/* Orders This Month */}
        <KPICard
          title="Comenzi Luna Aceasta"
          value={stats.ordersThisMonth.toString()}
          change={stats.ordersThisMonthChange}
          icon={<ShoppingCart className="w-6 h-6" />}
          color="blue"
        />

        {/* Payment Success Rate */}
        <KPICard
          title="Rata Plăți Reușite"
          value={`${stats.paymentSuccessRate.toFixed(1)}%`}
          change={stats.paymentSuccessRateChange}
          icon={<CheckCircle className="w-6 h-6" />}
          color="green"
        />

        {/* Average Rating */}
        <KPICard
          title="Rating Mediu"
          value={stats.averageRating.toFixed(2)}
          change={stats.averageRatingChange}
          icon={<Star className="w-6 h-6" />}
          color="amber"
        />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Revenue Chart */}
        <div className="lg:col-span-2 bg-card rounded-lg shadow-sm border border-foreground/10 p-6">
          <h2 className="text-lg font-semibold mb-6">Venituri Ultimele 30 Zile</h2>
          <div className="flex items-end gap-2 h-64">
            {stats.chartData.map((data, idx) => (
              <div key={idx} className="flex-1 flex flex-col items-center gap-2">
                <div
                  className="w-full bg-primary rounded-t opacity-80 hover:opacity-100 transition-opacity cursor-pointer group relative"
                  style={{
                    height: `${(data.revenue / maxRevenue) * 100}%`,
                    minHeight: data.revenue > 0 ? '4px' : '0',
                  }}
                >
                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 bg-foreground text-background text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
                    {data.revenue.toFixed(0)} RON
                  </div>
                </div>
                <span className="text-xs text-foreground/50 text-center leading-tight max-w-full">
                  {data.date}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Status Breakdown */}
        <div className="bg-card rounded-lg shadow-sm border border-foreground/10 p-6">
          <h2 className="text-lg font-semibold mb-6">Distribuția Statusului</h2>
          <div className="space-y-3">
            {Object.entries(stats.statusBreakdown).map(([status, count]) => {
              const total = Object.values(stats.statusBreakdown).reduce((a, b) => a + b, 0);
              const percentage = total > 0 ? (count / total) * 100 : 0;
              const colors: Record<string, string> = {
                new: 'bg-blue-500',
                processing: 'bg-amber-500',
                shipped: 'bg-cyan-500',
                delivered: 'bg-green-500',
                completed: 'bg-emerald-600',
                cancelled: 'bg-red-500',
              };
              const labels: Record<string, string> = {
                new: 'Nou',
                processing: 'În Procesare',
                shipped: 'Expediat',
                delivered: 'Livrat',
                completed: 'Completat',
                cancelled: 'Anulat',
              };
              return (
                <div key={status}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium">{labels[status]}</span>
                    <span className="text-sm text-foreground/60">{count}</span>
                  </div>
                  <div className="w-full h-2 bg-foreground/10 rounded-full overflow-hidden">
                    <div
                      className={`h-full ${colors[status] || 'bg-primary'}`}
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Recent Orders */}
      <div className="bg-card rounded-lg shadow-sm border border-foreground/10 p-6">
        <h2 className="text-lg font-semibold mb-6">Comenzi Recente</h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-foreground/10">
                <th className="text-left py-3 px-4 font-semibold text-sm">Data</th>
                <th className="text-left py-3 px-4 font-semibold text-sm">Client</th>
                <th className="text-left py-3 px-4 font-semibold text-sm">Email</th>
                <th className="text-right py-3 px-4 font-semibold text-sm">Total</th>
                <th className="text-center py-3 px-4 font-semibold text-sm">Plată</th>
                <th className="text-center py-3 px-4 font-semibold text-sm">Status</th>
              </tr>
            </thead>
            <tbody>
              {stats.recentOrders.map((order) => (
                <tr
                  key={order.id}
                  className="border-b border-foreground/5 hover:bg-foreground/2 transition-colors"
                >
                  <td className="py-3 px-4 text-sm">
                    {new Date(order.createdAt).toLocaleDateString('ro-RO')}
                  </td>
                  <td className="py-3 px-4 text-sm font-medium">{order.customerName}</td>
                  <td className="py-3 px-4 text-sm text-foreground/60">{order.email}</td>
                  <td className="py-3 px-4 text-sm text-right font-semibold">
                    {(order.totalAmount || 0).toFixed(2)} RON
                  </td>
                  <td className="py-3 px-4 text-center">
                    <StatusBadge status={order.paymentStatus} type="payment" />
                  </td>
                  <td className="py-3 px-4 text-center">
                    <StatusBadge status={order.orderStatus} type="order" />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Discount Codes Stats */}
      <div className="bg-card rounded-lg shadow-sm border border-foreground/10 p-6">
        <h2 className="text-lg font-semibold mb-4">Statistici Coduri Reducere</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-background rounded p-4">
            <p className="text-sm text-foreground/60 mb-1">Total Coduri</p>
            <p className="text-2xl font-bold">{stats.discountCodeStats.totalCodes}</p>
          </div>
          <div className="bg-background rounded p-4">
            <p className="text-sm text-foreground/60 mb-1">Coduri Active</p>
            <p className="text-2xl font-bold text-green-600">
              {stats.discountCodeStats.activeCodes}
            </p>
          </div>
          <div className="bg-background rounded p-4">
            <p className="text-sm text-foreground/60 mb-1">Total Utilizări</p>
            <p className="text-2xl font-bold">{stats.discountCodeStats.totalUsages}</p>
          </div>
          <div className="bg-background rounded p-4">
            <p className="text-sm text-foreground/60 mb-1">Venituri din Reduceri</p>
            <p className="text-2xl font-bold">
              {(stats.discountCodeStats.totalRevenueFromDiscounts / 1000).toFixed(1)}K RON
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

interface KPICardProps {
  title: string;
  value: string;
  change: number;
  icon: React.ReactNode;
  color: string;
}

function KPICard({ title, value, change, icon, color }: KPICardProps) {
  const isPositive = change >= 0;
  const colorClass =
    color === 'primary'
      ? 'text-primary'
      : color === 'blue'
        ? 'text-blue-600'
        : color === 'green'
          ? 'text-green-600'
          : 'text-amber-600';

  return (
    <div className="bg-card rounded-lg shadow-sm border border-foreground/10 p-6">
      <div className="flex items-start justify-between mb-4">
        <h3 className="text-sm font-medium text-foreground/60">{title}</h3>
        <div className={`p-2 bg-foreground/5 rounded-lg ${colorClass}`}>{icon}</div>
      </div>
      <p className="text-3xl font-bold mb-2">{value}</p>
      <p className={`text-sm ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
        {isPositive ? '+' : ''}
        {change.toFixed(1)}% vs luna trecută
      </p>
    </div>
  );
}

interface StatusBadgeProps {
  status: string;
  type: 'payment' | 'order';
}

function StatusBadge({ status, type }: StatusBadgeProps) {
  const paymentColors: Record<string, string> = {
    paid: 'bg-green-100 text-green-800',
    pending: 'bg-amber-100 text-amber-800',
    failed: 'bg-red-100 text-red-800',
  };

  const orderColors: Record<string, string> = {
    new: 'bg-blue-100 text-blue-800',
    processing: 'bg-amber-100 text-amber-800',
    shipped: 'bg-cyan-100 text-cyan-800',
    delivered: 'bg-green-100 text-green-800',
    completed: 'bg-emerald-100 text-emerald-800',
    cancelled: 'bg-red-100 text-red-800',
  };

  const colors = type === 'payment' ? paymentColors : orderColors;
  const labels: Record<string, string> = {
    paid: 'Plătit',
    pending: 'În Așteptare',
    failed: 'Eșuat',
    new: 'Nou',
    processing: 'În Procesare',
    shipped: 'Expediat',
    delivered: 'Livrat',
    completed: 'Completat',
    cancelled: 'Anulat',
  };

  return (
    <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${colors[status] || 'bg-gray-100 text-gray-800'}`}>
      {labels[status] || status}
    </span>
  );
}
