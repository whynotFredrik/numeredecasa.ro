'use client';

import { useSearchParams } from 'next/navigation';
import { CheckCircle2, Clock, XCircle } from 'lucide-react';
import Link from 'next/link';
import { Suspense } from 'react';

function OrderStatusContent() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get('orderId');

  return (
    <main className="min-h-screen pt-32 pb-12 px-6 flex items-center justify-center bg-foreground/[0.02]">
      <div className="text-center space-y-6 max-w-lg">
        <div className="w-24 h-24 mx-auto bg-green-500/10 text-green-500 rounded-full flex items-center justify-center">
          <CheckCircle2 className="w-12 h-12" />
        </div>

        <h1 className="text-3xl font-bold">Comandă Finalizată!</h1>
        
        <p className="text-foreground/60">
          Îți mulțumim pentru comandă. Plata a fost procesată cu succes și comanda ta este în curs de pregătire.
        </p>

        {orderId && (
          <div className="inline-block bg-foreground/5 rounded-xl px-6 py-3 text-sm">
            <span className="text-foreground/50">ID Comandă: </span>
            <span className="font-mono font-bold">{orderId.slice(0, 8).toUpperCase()}</span>
          </div>
        )}

        <p className="text-foreground/50 text-sm">
          Vei primi un email de confirmare cu detaliile comenzii și urmărirea expedierii.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
          <Link 
            href="/"
            className="bg-primary text-white font-bold px-8 py-4 rounded-xl hover:bg-primary/90 transition-colors"
          >
            Pagina Principală
          </Link>
          <Link 
            href="/produse"
            className="bg-foreground/5 text-foreground font-bold px-8 py-4 rounded-xl hover:bg-foreground/10 transition-colors"
          >
            Vezi Alte Produse
          </Link>
        </div>
      </div>
    </main>
  );
}

export default function ComandaFinalizataPage() {
  return (
    <Suspense fallback={
      <main className="min-h-screen pt-32 pb-12 px-6 flex items-center justify-center bg-foreground/[0.02]">
        <div className="text-center space-y-4">
          <Clock className="w-12 h-12 mx-auto text-foreground/30 animate-pulse" />
          <p className="text-foreground/50">Se încarcă...</p>
        </div>
      </main>
    }>
      <OrderStatusContent />
    </Suspense>
  );
}
