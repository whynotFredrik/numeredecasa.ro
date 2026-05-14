'use client';

import { useSearchParams } from 'next/navigation';
import { Suspense, useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Loader2,
  Search,
  AlertCircle,
  Package,
  PackageCheck,
  Truck,
  CheckCircle2,
  XCircle,
  Clock,
  CreditCard,
  Banknote,
  MapPin,
  Mail,
  Phone,
  ShoppingBag,
} from 'lucide-react';

interface OrderItem {
  id: string;
  product_type: string;
  finish: string;
  main_number?: string;
  street_name?: string;
  office_name?: string;
  office_function?: string;
  quantity: number;
  unit_price: number;
  total_price: number;
}

interface OrderData {
  orderId: string;
  createdAt: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  shippingMethod: 'courier' | 'easybox';
  shippingCounty: string;
  shippingCity: string;
  shippingAddress: string;
  easyboxId?: string;
  paymentMethod: 'card' | 'ramburs';
  paymentStatus: 'pending' | 'paid' | 'failed';
  orderStatus: 'new' | 'processing' | 'shipped' | 'delivered' | 'completed' | 'cancelled';
  subtotalAmount: number;
  shippingAmount: number;
  totalAmount: number;
  discountCode?: string;
  discountAmount?: number;
  items: OrderItem[];
}

const FINISH_LABELS: Record<string, string> = {
  black: 'Negru',
  white: 'Alb',
  brown: 'Maro',
  lightgray: 'Gri Deschis',
};

const PRODUCT_TYPE_LABELS: Record<string, string> = {
  house: 'Plăcuță Casă',
  apartment: 'Plăcuță Apartament',
  office: 'Plăcuță Birou',
};

function TrackingContent() {
  const searchParams = useSearchParams();
  const initialOrderId = searchParams.get('orderId') || '';

  const [orderId, setOrderId] = useState(initialOrderId);
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [order, setOrder] = useState<OrderData | null>(null);

  const handleSearch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setError('');
    setOrder(null);

    if (!orderId.trim() || !email.trim()) {
      setError('Te rugăm să introduci ID-ul comenzii și email-ul.');
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch(
        `/api/orders/track?orderId=${encodeURIComponent(orderId.trim())}&email=${encodeURIComponent(email.trim())}`
      );
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Nu am putut găsi comanda.');
        return;
      }

      setOrder(data);
    } catch {
      setError('A apărut o eroare la căutarea comenzii. Te rugăm să încerci din nou.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="min-h-screen pt-24 pb-12 px-6 lg:px-12 bg-foreground/[0.02]">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold mb-2">Urmărire Comandă</h1>
          <p className="text-foreground/60">
            Introdu ID-ul comenzii și email-ul pentru a vedea statusul comenzii tale.
          </p>
        </div>

        {/* Search Form */}
        <form
          onSubmit={handleSearch}
          className="bg-background p-6 md:p-8 rounded-[2rem] border border-foreground/5 shadow-xl shadow-foreground/5 space-y-4 mb-8"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-semibold text-foreground/70 mb-2 block">ID Comandă</label>
              <input
                type="text"
                value={orderId}
                onChange={(e) => setOrderId(e.target.value)}
                placeholder="Ex: 1a2b3c4d-5e6f-..."
                className="w-full bg-foreground/[0.02] border border-foreground/10 rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all font-mono text-sm"
                required
              />
            </div>
            <div>
              <label className="text-sm font-semibold text-foreground/70 mb-2 block">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="adresa@email.ro"
                className="w-full bg-foreground/[0.02] border border-foreground/10 rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-primary text-white py-4 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-primary/90 transition-colors shadow-xl shadow-primary/20 disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Se caută...
              </>
            ) : (
              <>
                <Search className="w-5 h-5" />
                Urmărește comanda
              </>
            )}
          </button>

          {error && (
            <div className="p-4 bg-red-500/10 border border-red-500/20 text-red-600 rounded-xl text-sm font-medium flex items-center gap-2">
              <AlertCircle className="w-5 h-5 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <p className="text-xs text-foreground/50">
            ID-ul comenzii se găsește în email-ul de confirmare primit după plasarea comenzii.
          </p>
        </form>

        {/* Order details */}
        {order && <OrderTracking order={order} />}

        {!order && !error && (
          <div className="text-center text-sm text-foreground/40 mt-8">
            <p>
              Nu găsești ID-ul?{' '}
              <Link href="/contact" className="text-primary hover:underline">
                Contactează-ne
              </Link>{' '}
              și te ajutăm noi.
            </p>
          </div>
        )}
      </div>
    </main>
  );
}

function OrderTracking({ order }: { order: OrderData }) {
  const isCancelled = order.orderStatus === 'cancelled';
  const paymentFailed = order.paymentStatus === 'failed';

  const steps: { key: string; label: string; icon: React.ReactNode }[] = [
    { key: 'new', label: 'Comandă primită', icon: <ShoppingBag className="w-5 h-5" /> },
    { key: 'processing', label: 'În procesare', icon: <Package className="w-5 h-5" /> },
    { key: 'shipped', label: 'Expediată', icon: <Truck className="w-5 h-5" /> },
    { key: 'delivered', label: 'Livrată', icon: <PackageCheck className="w-5 h-5" /> },
  ];

  const statusOrder = ['new', 'processing', 'shipped', 'delivered', 'completed'];
  const currentIndex = statusOrder.indexOf(order.orderStatus);

  return (
    <div className="space-y-6">
      {/* Status Header */}
      <div className="bg-background p-6 md:p-8 rounded-[2rem] border border-foreground/5 shadow-xl shadow-foreground/5">
        <div className="flex flex-wrap items-start justify-between gap-4 mb-2">
          <div>
            <p className="text-sm text-foreground/50">ID Comandă</p>
            <p className="font-mono font-bold text-lg">{order.orderId.slice(0, 8).toUpperCase()}</p>
          </div>
          <div className="text-right">
            <p className="text-sm text-foreground/50">Plasată pe</p>
            <p className="font-semibold">
              {new Date(order.createdAt).toLocaleDateString('ro-RO', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </p>
          </div>
        </div>
      </div>

      {/* Timeline */}
      <div className="bg-background p-6 md:p-8 rounded-[2rem] border border-foreground/5 shadow-xl shadow-foreground/5">
        <h2 className="text-xl font-bold mb-6">Status Comandă</h2>

        {isCancelled ? (
          <div className="flex items-center gap-4 p-4 bg-red-500/10 border border-red-500/20 rounded-xl">
            <XCircle className="w-8 h-8 text-red-500 shrink-0" />
            <div>
              <p className="font-bold text-red-700">Comandă anulată</p>
              <p className="text-sm text-red-600/80">Această comandă a fost anulată.</p>
            </div>
          </div>
        ) : (
          <div className="relative">
            {/* Steps */}
            <div className="grid grid-cols-4 gap-2 md:gap-4 relative">
              {/* Progress line (background) */}
              <div className="absolute top-6 left-0 right-0 h-1 bg-foreground/10 rounded-full -z-0 mx-[12.5%]" />

              {/* Progress line (filled) */}
              {currentIndex > 0 && (
                <div
                  className="absolute top-6 left-0 h-1 bg-primary rounded-full -z-0 ml-[12.5%] transition-all duration-500"
                  style={{
                    width: `${Math.min(currentIndex, steps.length - 1) * 25}%`,
                  }}
                />
              )}

              {steps.map((step, idx) => {
                const reached = currentIndex >= idx;
                const isCurrent = currentIndex === idx;
                return (
                  <div key={step.key} className="flex flex-col items-center text-center relative z-10">
                    <div
                      className={`w-12 h-12 rounded-full flex items-center justify-center border-2 transition-all ${
                        reached
                          ? 'bg-primary border-primary text-white shadow-lg shadow-primary/30'
                          : 'bg-background border-foreground/15 text-foreground/30'
                      } ${isCurrent ? 'ring-4 ring-primary/20' : ''}`}
                    >
                      {step.icon}
                    </div>
                    <p
                      className={`text-xs md:text-sm font-semibold mt-3 ${
                        reached ? 'text-foreground' : 'text-foreground/40'
                      }`}
                    >
                      {step.label}
                    </p>
                  </div>
                );
              })}
            </div>

            {order.orderStatus === 'completed' && (
              <div className="mt-6 flex items-center gap-3 p-4 bg-green-500/10 border border-green-500/20 rounded-xl">
                <CheckCircle2 className="w-6 h-6 text-green-500 shrink-0" />
                <div>
                  <p className="font-bold text-green-700">Comandă finalizată</p>
                  <p className="text-sm text-green-600/80">Mulțumim pentru încredere!</p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Payment status */}
        <div className="mt-6 pt-6 border-t border-foreground/10">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-3">
              {order.paymentMethod === 'card' ? (
                <CreditCard className="w-5 h-5 text-foreground/50" />
              ) : (
                <Banknote className="w-5 h-5 text-foreground/50" />
              )}
              <span className="text-sm text-foreground/70">
                {order.paymentMethod === 'card' ? 'Plată cu cardul' : 'Plată ramburs (la livrare)'}
              </span>
            </div>
            <PaymentBadge status={order.paymentStatus} method={order.paymentMethod} />
          </div>
          {paymentFailed && (
            <p className="text-xs text-red-600 mt-2">
              Plata a eșuat. Te rugăm să ne contactezi pentru a relua comanda.
            </p>
          )}
        </div>
      </div>

      {/* Shipping & Contact */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-background p-6 rounded-[2rem] border border-foreground/5 shadow-xl shadow-foreground/5">
          <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
            <MapPin className="w-5 h-5 text-primary" />
            Adresă livrare
          </h3>
          <div className="text-sm text-foreground/70 space-y-1">
            <p className="font-semibold text-foreground">
              {order.firstName} {order.lastName}
            </p>
            {order.shippingMethod === 'courier' ? (
              <>
                <p>{order.shippingAddress}</p>
                <p>
                  {order.shippingCity}, {order.shippingCounty}
                </p>
              </>
            ) : (
              <>
                <p className="text-xs font-semibold text-primary uppercase mt-2">Easybox</p>
                <p>{order.shippingAddress}</p>
                <p>
                  {order.shippingCity}, {order.shippingCounty}
                </p>
                {order.easyboxId && (
                  <p className="text-xs text-foreground/50 mt-1">ID locker: {order.easyboxId}</p>
                )}
              </>
            )}
          </div>
        </div>

        <div className="bg-background p-6 rounded-[2rem] border border-foreground/5 shadow-xl shadow-foreground/5">
          <h3 className="font-bold text-lg mb-4">Contact</h3>
          <div className="text-sm text-foreground/70 space-y-2">
            <p className="flex items-center gap-2">
              <Mail className="w-4 h-4 text-foreground/40 shrink-0" />
              {order.email}
            </p>
            <p className="flex items-center gap-2">
              <Phone className="w-4 h-4 text-foreground/40 shrink-0" />
              {order.phone}
            </p>
          </div>
        </div>
      </div>

      {/* Items */}
      <div className="bg-background p-6 md:p-8 rounded-[2rem] border border-foreground/5 shadow-xl shadow-foreground/5">
        <h3 className="font-bold text-lg mb-4">Produse comandate</h3>
        <div className="space-y-3">
          {order.items.map((item) => (
            <div
              key={item.id}
              className="flex items-center justify-between gap-4 py-3 border-b border-foreground/5 last:border-0"
            >
              <div className="flex-1">
                <p className="font-semibold text-sm">
                  {PRODUCT_TYPE_LABELS[item.product_type] || item.product_type}
                </p>
                <p className="text-xs text-foreground/50">
                  Culoare: {FINISH_LABELS[item.finish] || item.finish}
                  {item.main_number && ` · Nr: ${item.main_number}`}
                  {item.street_name && ` · ${item.street_name}`}
                  {item.office_name && ` · ${item.office_name}`}
                </p>
              </div>
              <div className="text-right">
                <p className="text-xs text-foreground/50">Cant: {item.quantity}</p>
                <p className="font-bold text-sm">
                  {Number(item.total_price).toFixed(2)} RON
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Totals */}
        <div className="mt-6 pt-6 border-t border-foreground/10 space-y-2">
          <div className="flex justify-between text-sm text-foreground/60">
            <span>Subtotal</span>
            <span>{Number(order.subtotalAmount).toFixed(2)} RON</span>
          </div>
          {order.discountCode && order.discountAmount && Number(order.discountAmount) > 0 && (
            <div className="flex justify-between text-sm text-green-600">
              <span>Reducere ({order.discountCode})</span>
              <span>-{Number(order.discountAmount).toFixed(2)} RON</span>
            </div>
          )}
          <div className="flex justify-between text-sm text-foreground/60">
            <span>Transport</span>
            <span>{Number(order.shippingAmount).toFixed(2)} RON</span>
          </div>
          <div className="flex justify-between text-lg font-bold pt-3 border-t border-foreground/10">
            <span>Total</span>
            <span className="text-primary">{Number(order.totalAmount).toFixed(2)} RON</span>
          </div>
        </div>
      </div>

      <div className="text-center pt-2">
        <Link href="/contact" className="text-sm text-foreground/60 hover:text-primary transition-colors">
          Ai întrebări despre comandă? Contactează-ne →
        </Link>
      </div>
    </div>
  );
}

function PaymentBadge({ status, method }: { status: string; method: string }) {
  if (method === 'ramburs' && status === 'pending') {
    return (
      <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-blue-500/10 text-blue-700 rounded-full text-xs font-bold">
        <Banknote className="w-3.5 h-3.5" />
        La livrare
      </span>
    );
  }

  if (status === 'paid') {
    return (
      <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-green-500/10 text-green-700 rounded-full text-xs font-bold">
        <CheckCircle2 className="w-3.5 h-3.5" />
        Plătit
      </span>
    );
  }

  if (status === 'failed') {
    return (
      <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-red-500/10 text-red-700 rounded-full text-xs font-bold">
        <XCircle className="w-3.5 h-3.5" />
        Eșuat
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-yellow-500/10 text-yellow-700 rounded-full text-xs font-bold">
      <Clock className="w-3.5 h-3.5" />
      În așteptare
    </span>
  );
}

export default function UrmarireComandaPage() {
  return (
    <Suspense
      fallback={
        <main className="min-h-screen pt-32 pb-12 px-6 flex items-center justify-center bg-foreground/[0.02]">
          <Loader2 className="w-12 h-12 text-foreground/30 animate-spin" />
        </main>
      }
    >
      <TrackingContent />
    </Suspense>
  );
}
