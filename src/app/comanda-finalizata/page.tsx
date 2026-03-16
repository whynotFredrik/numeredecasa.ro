'use client';

import { useSearchParams } from 'next/navigation';
import { CheckCircle2, Clock, XCircle, AlertCircle } from 'lucide-react';
import Link from 'next/link';
import { Suspense, useEffect, useState } from 'react';

type OrderStatus = 'loading' | 'paid' | 'pending' | 'failed' | 'not_found';

function OrderStatusContent() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get('orderId');
  const [status, setStatus] = useState<OrderStatus>('loading');
  const [firstName, setFirstName] = useState('');

  useEffect(() => {
    if (!orderId) {
      setStatus('not_found');
      return;
    }

    let attempts = 0;
    const maxAttempts = 10;

    async function checkStatus() {
      try {
        const res = await fetch(`/api/orders/status?orderId=${encodeURIComponent(orderId!)}`);
        if (!res.ok) {
          setStatus('not_found');
          return;
        }
        const data = await res.json();
        setFirstName(data.firstName || '');

        if (data.paymentStatus === 'paid') {
          setStatus('paid');
        } else if (data.paymentStatus === 'failed') {
          setStatus('failed');
        } else {
          // Still pending — poll a few more times as IPN may not have arrived yet
          attempts++;
          if (attempts < maxAttempts) {
            setTimeout(checkStatus, 3000);
          } else {
            setStatus('pending');
          }
        }
      } catch {
        setStatus('not_found');
      }
    }

    checkStatus();
  }, [orderId]);

  if (status === 'loading') {
    return (
      <main className="min-h-screen pt-32 pb-12 px-6 flex items-center justify-center bg-foreground/[0.02]">
        <div className="text-center space-y-6 max-w-lg">
          <div className="w-24 h-24 mx-auto bg-primary/10 text-primary rounded-full flex items-center justify-center">
            <Clock className="w-12 h-12 animate-pulse" />
          </div>
          <h1 className="text-3xl font-bold">Se verifică plata...</h1>
          <p className="text-foreground/60">
            Așteptăm confirmarea plății de la procesatorul de plăți. Te rugăm să nu închizi această pagină.
          </p>
        </div>
      </main>
    );
  }

  if (status === 'paid') {
    return (
      <main className="min-h-screen pt-32 pb-12 px-6 flex items-center justify-center bg-foreground/[0.02]">
        <div className="text-center space-y-6 max-w-lg">
          <div className="w-24 h-24 mx-auto bg-green-500/10 text-green-500 rounded-full flex items-center justify-center">
            <CheckCircle2 className="w-12 h-12" />
          </div>
          <h1 className="text-3xl font-bold">Comandă Finalizată!</h1>
          <p className="text-foreground/60">
            Îți mulțumim pentru comandă{firstName ? `, ${firstName}` : ''}. Plata a fost procesată cu succes și comanda ta este în curs de pregătire.
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

  if (status === 'pending') {
    return (
      <main className="min-h-screen pt-32 pb-12 px-6 flex items-center justify-center bg-foreground/[0.02]">
        <div className="text-center space-y-6 max-w-lg">
          <div className="w-24 h-24 mx-auto bg-yellow-500/10 text-yellow-500 rounded-full flex items-center justify-center">
            <AlertCircle className="w-12 h-12" />
          </div>
          <h1 className="text-3xl font-bold">Plata în așteptare</h1>
          <p className="text-foreground/60">
            Comanda ta a fost înregistrată, dar confirmarea plății nu a fost încă primită. Aceasta poate dura câteva minute.
          </p>
          {orderId && (
            <div className="inline-block bg-foreground/5 rounded-xl px-6 py-3 text-sm">
              <span className="text-foreground/50">ID Comandă: </span>
              <span className="font-mono font-bold">{orderId.slice(0, 8).toUpperCase()}</span>
            </div>
          )}
          <p className="text-foreground/50 text-sm">
            Dacă plata a fost efectuată cu succes, vei primi un email de confirmare. Dacă nu, te rugăm să ne contactezi.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
            <Link
              href="/"
              className="bg-primary text-white font-bold px-8 py-4 rounded-xl hover:bg-primary/90 transition-colors"
            >
              Pagina Principală
            </Link>
            <Link
              href="/contact"
              className="bg-foreground/5 text-foreground font-bold px-8 py-4 rounded-xl hover:bg-foreground/10 transition-colors"
            >
              Contactează-ne
            </Link>
          </div>
        </div>
      </main>
    );
  }

  if (status === 'failed') {
    return (
      <main className="min-h-screen pt-32 pb-12 px-6 flex items-center justify-center bg-foreground/[0.02]">
        <div className="text-center space-y-6 max-w-lg">
          <div className="w-24 h-24 mx-auto bg-red-500/10 text-red-500 rounded-full flex items-center justify-center">
            <XCircle className="w-12 h-12" />
          </div>
          <h1 className="text-3xl font-bold">Plata a eșuat</h1>
          <p className="text-foreground/60">
            Din păcate, plata nu a fost procesată cu succes. Te rugăm să încerci din nou sau să alegi o altă metodă de plată.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
            <Link
              href="/checkout"
              className="bg-primary text-white font-bold px-8 py-4 rounded-xl hover:bg-primary/90 transition-colors"
            >
              Încearcă din nou
            </Link>
            <Link
              href="/contact"
              className="bg-foreground/5 text-foreground font-bold px-8 py-4 rounded-xl hover:bg-foreground/10 transition-colors"
            >
              Contactează-ne
            </Link>
          </div>
        </div>
      </main>
    );
  }

  // not_found
  return (
    <main className="min-h-screen pt-32 pb-12 px-6 flex items-center justify-center bg-foreground/[0.02]">
      <div className="text-center space-y-6 max-w-lg">
        <div className="w-24 h-24 mx-auto bg-foreground/5 text-foreground/30 rounded-full flex items-center justify-center">
          <AlertCircle className="w-12 h-12" />
        </div>
        <h1 className="text-3xl font-bold">Comanda nu a fost găsită</h1>
        <p className="text-foreground/60">
          Nu am putut identifica comanda. Dacă ai efectuat o plată, te rugăm să ne contactezi.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
          <Link
            href="/"
            className="bg-primary text-white font-bold px-8 py-4 rounded-xl hover:bg-primary/90 transition-colors"
          >
            Pagina Principală
          </Link>
          <Link
            href="/contact"
            className="bg-foreground/5 text-foreground font-bold px-8 py-4 rounded-xl hover:bg-foreground/10 transition-colors"
          >
            Contactează-ne
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
