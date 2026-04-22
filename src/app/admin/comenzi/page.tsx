'use client';

import { useState, useEffect } from 'react';
import { ChevronDown, Search } from 'lucide-react';

interface OrderItem {
  id: string;
  product_type: string;
  quantity: number;
  unit_price: number;
  customization_data?: any;
}

interface Order {
  id: string;
  created_at: string;
  customer_first_name: string;
  customer_last_name: string;
  customer_email: string;
  customer_phone: string;
  shipping_address: string;
  shipping_city: string;
  shipping_county: string;
  shipping_postal_code: string;
  total_amount: number;
  shipping_cost: number;
  payment_status: string;
  payment_method: string;
  order_status: string;
  discount_code?: string;
  discount_amount?: number;
  items?: OrderItem[];
}

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [paymentStatusFilter, setPaymentStatusFilter] = useState<string>('');
  const [orderStatusFilter, setOrderStatusFilter] = useState<string>('');
  const [updatingOrderId, setUpdatingOrderId] = useState<string | null>(null);

  useEffect(() => {
    fetchOrders();
  }, []);

  useEffect(() => {
    filterOrders();
  }, [orders, searchQuery, paymentStatusFilter, orderStatusFilter]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/orders');
      if (!response.ok) throw new Error('Failed to fetch orders');
      const data = await response.json();
      setOrders(data.orders || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load orders');
      console.error('Error fetching orders:', err);
    } finally {
      setLoading(false);
    }
  };

  const filterOrders = () => {
    let filtered = orders;

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        order =>
          order.customer_first_name.toLowerCase().includes(query) ||
          order.customer_last_name.toLowerCase().includes(query) ||
          order.customer_email.toLowerCase().includes(query)
      );
    }

    // Payment status filter
    if (paymentStatusFilter) {
      filtered = filtered.filter(order => order.payment_status === paymentStatusFilter);
    }

    // Order status filter
    if (orderStatusFilter) {
      filtered = filtered.filter(order => order.order_status === orderStatusFilter);
    }

    setFilteredOrders(filtered);
  };

  const handleStatusChange = async (orderId: string, newStatus: string) => {
    try {
      setUpdatingOrderId(orderId);
      const response = await fetch('/api/admin/orders/update-status', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderId,
          status: newStatus,
        }),
      });

      if (!response.ok) throw new Error('Failed to update status');

      // Update local state
      setOrders(orders.map(o => (o.id === orderId ? { ...o, order_status: newStatus } : o)));
    } catch (err) {
      console.error('Error updating order status:', err);
      alert('Eroare la actualizarea statusului comenzii');
    } finally {
      setUpdatingOrderId(null);
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
        <p className="font-semibold">Eroare la încărcarea comenzilor</p>
        <p className="text-sm mt-1">{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold mb-2">Comenzi</h1>
        <p className="text-foreground/60">Gestionează și vizualizează comenzile</p>
      </div>

      {/* Filters */}
      <div className="bg-card rounded-lg shadow-sm border border-foreground/10 p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-foreground/50" />
            <input
              type="text"
              placeholder="Caută după nume, email..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-foreground/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
            />
          </div>

          {/* Payment Status Filter */}
          <select
            value={paymentStatusFilter}
            onChange={e => setPaymentStatusFilter(e.target.value)}
            className="px-4 py-2 border border-foreground/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 bg-white"
          >
            <option value="">Toate plățile</option>
            <option value="pending">În așteptare</option>
            <option value="paid">Plătit</option>
            <option value="failed">Eșuat</option>
          </select>

          {/* Order Status Filter */}
          <select
            value={orderStatusFilter}
            onChange={e => setOrderStatusFilter(e.target.value)}
            className="px-4 py-2 border border-foreground/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 bg-white"
          >
            <option value="">Toate statusurile</option>
            <option value="new">Nou</option>
            <option value="processing">În procesare</option>
            <option value="shipped">Expediat</option>
            <option value="delivered">Livrat</option>
            <option value="completed">Completat</option>
            <option value="cancelled">Anulat</option>
          </select>
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-card rounded-lg shadow-sm border border-foreground/10 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-foreground/10 bg-foreground/2">
                <th className="text-left py-3 px-4 font-semibold text-sm w-12"></th>
                <th className="text-left py-3 px-4 font-semibold text-sm">Data</th>
                <th className="text-left py-3 px-4 font-semibold text-sm">Client</th>
                <th className="text-left py-3 px-4 font-semibold text-sm">Email</th>
                <th className="text-right py-3 px-4 font-semibold text-sm">Total</th>
                <th className="text-center py-3 px-4 font-semibold text-sm">Plată</th>
                <th className="text-center py-3 px-4 font-semibold text-sm">Status</th>
              </tr>
            </thead>
            <tbody>
              {filteredOrders.map((order) => (
                <tbody key={order.id}>
                  <tr className="border-b border-foreground/5 hover:bg-foreground/2 transition-colors cursor-pointer">
                    <td className="py-3 px-4">
                      <button
                        onClick={() =>
                          setExpandedOrderId(expandedOrderId === order.id ? null : order.id)
                        }
                        className="flex items-center justify-center"
                      >
                        <ChevronDown
                          className={`w-5 h-5 transition-transform ${
                            expandedOrderId === order.id ? 'rotate-180' : ''
                          }`}
                        />
                      </button>
                    </td>
                    <td className="py-3 px-4 text-sm">
                      {new Date(order.created_at).toLocaleDateString('ro-RO')}
                    </td>
                    <td className="py-3 px-4 text-sm font-medium">
                      {order.customer_first_name} {order.customer_last_name}
                    </td>
                    <td className="py-3 px-4 text-sm text-foreground/60">{order.customer_email}</td>
                    <td className="py-3 px-4 text-sm text-right font-semibold">
                      {(order.total_amount || 0).toFixed(2)} RON
                    </td>
                    <td className="py-3 px-4 text-center">
                      <StatusBadge status={order.payment_status} type="payment" />
                    </td>
                    <td className="py-3 px-4 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <StatusBadge status={order.order_status} type="order" />
                      </div>
                    </td>
                  </tr>

                  {/* Expanded Details */}
                  {expandedOrderId === order.id && (
                    <tr className="border-b border-foreground/10 bg-foreground/2">
                      <td colSpan={7} className="py-6 px-4">
                        <OrderDetails order={order} onStatusChange={handleStatusChange} />
                      </td>
                    </tr>
                  )}
                </tbody>
              ))}
            </tbody>
          </table>
        </div>

        {filteredOrders.length === 0 && (
          <div className="p-8 text-center text-foreground/60">
            <p>Nu au fost găsite comenzi.</p>
          </div>
        )}
      </div>

      <div className="text-sm text-foreground/60">
        Total: {filteredOrders.length} comenzi din {orders.length}
      </div>
    </div>
  );
}

function OrderDetails({
  order,
  onStatusChange,
}: {
  order: Order;
  onStatusChange: (orderId: string, newStatus: string) => void;
}) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Shipping Address */}
        <div>
          <h3 className="font-semibold mb-3">Adresa de Livrare</h3>
          <div className="text-sm space-y-1 text-foreground/80">
            <p>{order.shipping_address}</p>
            <p>
              {order.shipping_postal_code} {order.shipping_city}
            </p>
            <p>{order.shipping_county}</p>
            <p className="text-foreground/60 mt-2">{order.customer_phone}</p>
          </div>
        </div>

        {/* Order Info */}
        <div>
          <h3 className="font-semibold mb-3">Detalii Comandă</h3>
          <div className="text-sm space-y-2">
            <div className="flex justify-between">
              <span className="text-foreground/60">Metoda de plată:</span>
              <span className="font-medium capitalize">{order.payment_method}</span>
            </div>
            {order.discount_code && (
              <>
                <div className="flex justify-between">
                  <span className="text-foreground/60">Cod reducere:</span>
                  <span className="font-medium">{order.discount_code}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-foreground/60">Reducere:</span>
                  <span className="font-medium">-{order.discount_amount?.toFixed(2)} RON</span>
                </div>
              </>
            )}
            <div className="flex justify-between">
              <span className="text-foreground/60">Livrare:</span>
              <span className="font-medium">{(order.shipping_cost || 0).toFixed(2)} RON</span>
            </div>
            <div className="flex justify-between border-t border-foreground/10 pt-2 mt-2">
              <span className="font-semibold">Total:</span>
              <span className="font-bold">{(order.total_amount || 0).toFixed(2)} RON</span>
            </div>
          </div>
        </div>
      </div>

      {/* Status Change */}
      <div className="border-t border-foreground/10 pt-6">
        <h3 className="font-semibold mb-3">Actualizare Status</h3>
        <div className="flex gap-2 items-center">
          <select
            value={order.order_status}
            onChange={e => onStatusChange(order.id, e.target.value)}
            className="px-4 py-2 border border-foreground/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 bg-white"
          >
            <option value="new">Nou</option>
            <option value="processing">În procesare</option>
            <option value="shipped">Expediat</option>
            <option value="delivered">Livrat</option>
            <option value="completed">Completat</option>
            <option value="cancelled">Anulat</option>
          </select>
          <span className="text-sm text-foreground/60">
            Status curent: <strong>{order.order_status}</strong>
          </span>
        </div>
      </div>
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
    <span
      className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${
        colors[status] || 'bg-gray-100 text-gray-800'
      }`}
    >
      {labels[status] || status}
    </span>
  );
}
