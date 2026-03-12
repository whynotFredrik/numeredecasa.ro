'use client';

import { useState, useEffect } from 'react';
import { useCartStore } from '@/store/cartStore';
import { motion } from 'framer-motion';
import { ChevronRight, CreditCard, Truck, ShieldCheck, MapPin, Package, Check, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { SamedayWidget } from '@/components/checkout/SamedayWidget';
import { supabase } from '@/lib/supabase/client';

export default function CheckoutPage() {
  const { items, getCartTotal, getCartCount, clearCart } = useCartStore();
  const [mounted, setMounted] = useState(false);
  const [shippingMethod, setShippingMethod] = useState<'courier' | 'easybox'>('courier');
  const [selectedLocker, setSelectedLocker] = useState<any>(null);

  // Form states
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [county, setCounty] = useState('');
  const [city, setCity] = useState('');
  const [address, setAddress] = useState('');

  // Submission states
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [submitError, setSubmitError] = useState('');

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  const total = getCartTotal();
  const shippingCost = shippingMethod === 'courier' ? 20 : 15; // Placeholder pricing
  const grandTotal = items.length > 0 ? total + shippingCost : 0;

  if (items.length === 0) {
    return (
      <main className="min-h-screen pt-32 pb-12 px-6 flex items-center justify-center bg-foreground/[0.02]">
        <div className="text-center space-y-6">
          <Package className="w-24 h-24 mx-auto text-foreground/20" />
          <h1 className="text-3xl font-bold">Coșul este gol</h1>
          <p className="text-foreground/60 max-w-md mx-auto">
            Nu ai adăugat niciun produs în coș încă. Pentru a putea finaliza comanda, te rugăm să configurezi un produs.
          </p>
          <Link 
            href="/configurator"
            className="inline-block bg-primary text-white font-bold px-8 py-4 rounded-xl hover:bg-primary/90 transition-colors"
          >
            Spre Configurator
          </Link>
        </div>
      </main>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError('');

    if (shippingMethod === 'easybox' && !selectedLocker) {
      setSubmitError('Te rugăm să selectezi un Easybox pentru a putea continua.');
      return;
    }

    setIsSubmitting(true);

    try {
      const orderId = crypto.randomUUID();

      // 1. Inserare Comandă Master
      const { error: orderError } = await supabase
        .from('orders')
        .insert({
          id: orderId,
          customer_first_name: firstName,
          customer_last_name: lastName,
          customer_email: email,
          customer_phone: phone,
          shipping_method: shippingMethod,
          shipping_county: shippingMethod === 'courier' ? county : selectedLocker.county,
          shipping_city: shippingMethod === 'courier' ? city : selectedLocker.city,
          shipping_address: shippingMethod === 'courier' ? address : selectedLocker.address,
          easybox_id: shippingMethod === 'easybox' ? selectedLocker.easyboxId : null,
          subtotal_amount: total,
          shipping_amount: shippingCost,
          total_amount: grandTotal,
        });

      if (orderError) {
        console.error("Supabase Order Insert Error:", orderError);
        setSubmitError(`Eroare db comandă: ${orderError.message}`);
        setIsSubmitting(false);
        return;
      }

      // 2. Inserare Articole în Comandă
      const orderItemsToInsert = items.map(item => ({
        order_id: orderId,
        product_type: item.productType,
        finish: item.finish,
        main_number: item.mainNumber,
        street_name: item.streetName,
        office_name: item.officeName,
        office_function: item.officeFunction,
        quantity: item.quantity,
        unit_price: item.price,
        total_price: item.price * item.quantity
      }));

      const { error: itemsError } = await supabase
        .from('order_items')
        .insert(orderItemsToInsert);

      if (itemsError) {
        console.error("Supabase Items Insert Error:", itemsError);
        setSubmitError(`Eroare db articole: ${itemsError.message}`);
        setIsSubmitting(false);
        return;
      }

      // 3. Inițiază plata prin Netopia
      const paymentResponse = await fetch('/api/netopia/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderId,
          amount: grandTotal,
          currency: 'RON',
          description: `Comandă numeredecasa.ro #${orderId.slice(0, 8)}`,
          billing: {
            email,
            phone,
            firstName,
            lastName,
            city: shippingMethod === 'courier' ? city : selectedLocker?.city,
            county: shippingMethod === 'courier' ? county : selectedLocker?.county,
            address: shippingMethod === 'courier' ? address : selectedLocker?.address,
          },
        }),
      });

      const paymentData = await paymentResponse.json();

      if (!paymentResponse.ok || !paymentData.success) {
        console.error('Payment API Error:', paymentData);
        // Fallback: comanda este salvată, dar plata nu a putut fi inițiată
        // Redirect direct la confirmare (plata se poate finaliza manual)
        clearCart();
        setIsSuccess(true);
        return;
      }

      // Netopia returnează un URL sau date HTML pentru redirect 3DS
      const { payment } = paymentData;
      
      if (payment?.payment?.paymentURL) {
        // Redirect la pagina de plată Netopia
        clearCart();
        window.location.href = payment.payment.paymentURL;
        return;
      }

      // Dacă nu există URL de redirect, comanda e salvată, arătăm confirmarea
      clearCart();
      setIsSuccess(true);
      
    } catch (err: any) {
      console.error("Eroare la procesul de salvare:", err);
      setSubmitError(`A apărut o excepție: ${err?.message || JSON.stringify(err)}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSuccess) {
    return (
      <main className="min-h-screen pt-32 pb-12 px-6 flex items-center justify-center bg-foreground/[0.02]">
        <div className="text-center space-y-6 max-w-lg">
          <div className="w-24 h-24 mx-auto bg-green-500/10 text-green-500 rounded-full flex items-center justify-center">
            <Check className="w-12 h-12" />
          </div>
          <h1 className="text-3xl font-bold">Comandă plasată cu succes!</h1>
          <p className="text-foreground/60">
            Îți mulțumim pentru comandă, {firstName}. Datele au fost salvate securizat în sistem și vei fi contactat în scurt timp pentru confirmare.
          </p>
          <Link 
            href="/"
            className="inline-block mt-4 bg-primary text-white font-bold px-8 py-4 rounded-xl hover:bg-primary/90 transition-colors"
          >
            Întoarce-te pe pagina principală
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen pt-24 pb-12 px-6 lg:px-12 bg-foreground/[0.02]">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center gap-2 text-sm text-foreground/60 mb-8">
          <Link href="/cart" className="hover:text-primary transition-colors">Coș</Link>
          <ChevronRight className="w-4 h-4" />
          <span className="text-foreground/90 font-medium">Finalizare Comandă</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
          
          {/* Form Area */}
          <div className="lg:col-span-7 space-y-8">
            <h1 className="text-3xl font-bold mb-8">Date Livrare & Facturare</h1>
            
            <form id="checkout-form" onSubmit={handleSubmit} className="space-y-8">
              {/* Contact Info */}
              <div className="bg-background p-6 md:p-8 rounded-[2rem] border border-foreground/5 shadow-xl shadow-foreground/5 space-y-6">
                <h2 className="text-xl font-bold flex items-center gap-2">
                  <span className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center text-sm">1</span>
                  Date de Contact
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <input type="text" value={lastName} onChange={e => setLastName(e.target.value)} placeholder="Nume" className="w-full bg-foreground/[0.02] border border-foreground/10 rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all" required />
                  <input type="text" value={firstName} onChange={e => setFirstName(e.target.value)} placeholder="Prenume" className="w-full bg-foreground/[0.02] border border-foreground/10 rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all" required />
                  <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="Email" className="w-full bg-foreground/[0.02] border border-foreground/10 rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary focus:border-primary outline-none md:col-span-2 transition-all" required />
                  <input type="tel" value={phone} onChange={e => setPhone(e.target.value)} placeholder="Telefon" className="w-full bg-foreground/[0.02] border border-foreground/10 rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary focus:border-primary outline-none md:col-span-2 transition-all" required />
                </div>
              </div>

              {/* Shipping Method */}
              <div className="bg-background p-6 md:p-8 rounded-[2rem] border border-foreground/5 shadow-xl shadow-foreground/5 space-y-6">
                <h2 className="text-xl font-bold flex items-center gap-2">
                  <span className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center text-sm">2</span>
                  Metodă Livrare
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <button 
                    type="button"
                    onClick={() => setShippingMethod('courier')}
                    className={`p-4 rounded-xl border text-left flex items-start gap-4 transition-all ${shippingMethod === 'courier' ? 'border-primary bg-primary/5 ring-1 ring-primary/20' : 'border-foreground/10 hover:border-foreground/30'}`}
                  >
                    <Truck className={`w-6 h-6 ${shippingMethod === 'courier' ? 'text-primary' : 'text-foreground/50'}`} />
                    <div>
                      <div className="font-bold">Curier Domiciliu</div>
                      <div className="text-sm text-foreground/60">Livrare la adresa dorită</div>
                      <div className="text-sm font-bold mt-1 text-primary">20.00 RON</div>
                    </div>
                  </button>
                  <button 
                    type="button"
                    onClick={() => setShippingMethod('easybox')}
                    className={`p-4 rounded-xl border text-left flex items-start gap-4 transition-all ${shippingMethod === 'easybox' ? 'border-primary bg-primary/5 ring-1 ring-primary/20' : 'border-foreground/10 hover:border-foreground/30'}`}
                  >
                    <MapPin className={`w-6 h-6 ${shippingMethod === 'easybox' ? 'text-primary' : 'text-foreground/50'}`} />
                    <div>
                      <div className="font-bold">Sameday Easybox</div>
                      <div className="text-sm text-foreground/60">Ridicare din locker</div>
                      <div className="text-sm font-bold mt-1 text-primary">15.00 RON</div>
                    </div>
                  </button>
                </div>

                <div className="space-y-4 pt-4">
                  {shippingMethod === 'courier' ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-in fade-in transition-all duration-300">
                      <input type="text" value={county} onChange={e => setCounty(e.target.value)} placeholder="Județ" className="w-full bg-foreground/[0.02] border border-foreground/10 rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary outline-none" required={shippingMethod === 'courier'} />
                      <input type="text" value={city} onChange={e => setCity(e.target.value)} placeholder="Oraș / Localitate" className="w-full bg-foreground/[0.02] border border-foreground/10 rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary outline-none" required={shippingMethod === 'courier'} />
                      <input type="text" value={address} onChange={e => setAddress(e.target.value)} placeholder="Adresă Completă (Stradă, Nr, Bloc, Sc, Ap)" className="w-full bg-foreground/[0.02] border border-foreground/10 rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary outline-none md:col-span-2" required={shippingMethod === 'courier'} />
                    </div>
                  ) : (
                    <SamedayWidget 
                      selectedLocker={selectedLocker} 
                      onLockerSelect={setSelectedLocker} 
                    />
                  )}
                </div>
              </div>
            </form>
          </div>

          {/* Order Summary Sticky Area */}
          <div className="lg:col-span-5 lg:sticky lg:top-28">
            <div className="bg-background p-6 md:p-8 rounded-[2rem] border border-foreground/5 shadow-2xl shadow-foreground/5 space-y-8">
              <h2 className="text-2xl font-bold">Sumar Comandă</h2>
              
              <div className="space-y-4 max-h-[300px] overflow-y-auto pr-2">
                {items.map((item) => (
                  <div key={item.id} className="flex gap-4">
                    <div className="w-16 h-16 bg-foreground/5 rounded-xl flex items-center justify-center border border-foreground/10 p-2 shrink-0">
                        {item.productType === 'house' && (
                          <div className="flex flex-col items-center">
                            <span className="text-lg font-bold leading-none">{item.mainNumber}</span>
                            <div className="w-full h-0.5 bg-foreground mt-0.5 mb-0.5"></div>
                            <span className="text-[0.4rem] font-bold">{item.streetName.slice(0, 10)}</span>
                          </div>
                        )}
                        {item.productType === 'apartment' && (
                           <div className="flex flex-col items-center">
                             <div className="text-lg font-bold leading-none">{item.mainNumber}</div>
                             <div className="w-3/4 h-0.5 bg-foreground mt-0.5"></div>
                           </div>
                         )}
                         {item.productType === 'office' && (
                           <div className="flex flex-col items-center">
                             <div className="text-[0.5rem] font-bold">{item.officeName.slice(0, 8)}</div>
                             <div className="w-full h-0.5 bg-foreground mt-0.5 mb-0.5"></div>
                             <div className="text-[0.3rem]">{item.officeFunction.slice(0, 10)}</div>
                           </div>
                         )}
                    </div>
                    <div className="flex-1">
                      <h4 className="font-bold text-sm">Model Signature - {item.productType === 'house' ? 'Case' : item.productType === 'apartment' ? 'Apt' : 'Birou'}</h4>
                      <p className="text-xs text-foreground/50">Culoare: {item.finish === 'black' ? 'Negru' : 'Alb'}</p>
                      <div className="flex justify-between items-center mt-2">
                        <span className="text-xs font-semibold">Cantitate: {item.quantity}</span>
                        <span className="font-bold text-sm">{item.price * item.quantity} RON</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="border-t border-foreground/10 pt-6 space-y-4">
                <div className="flex justify-between text-foreground/60">
                  <span>Subtotal produse ({getCartCount()})</span>
                  <span>{total} RON</span>
                </div>
                <div className="flex justify-between text-foreground/60">
                  <span>Transport ({shippingMethod === 'courier' ? 'Curier' : 'Easybox'})</span>
                  <span>{shippingCost.toFixed(2)} RON</span>
                </div>
                <div className="flex justify-between text-xl font-bold pt-4 border-t border-foreground/10">
                  <span>Total General</span>
                  <span className="text-primary">{grandTotal.toFixed(2)} RON</span>
                </div>
              </div>

              <button 
                type="submit" 
                form="checkout-form"
                disabled={isSubmitting}
                className="w-full bg-primary text-white py-4 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-primary/90 transition-colors shadow-xl shadow-primary/20 group disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Se procesează...
                  </>
                ) : (
                  <>
                    <CreditCard className="w-5 h-5" />
                    Finalizează Comanda
                  </>
                )}
              </button>

              {submitError && (
                <div className="p-4 bg-red-500/10 border border-red-500/20 text-red-600 rounded-xl text-sm font-medium animate-in fade-in text-center">
                  {submitError}
                </div>
              )}
              
              <div className="flex items-center justify-center gap-2 text-xs text-foreground/50 text-center">
                <ShieldCheck className="w-4 h-4 text-green-500" />
                <span>Tranzacție criptată și securizată prin Netopia Payments</span>
              </div>
            </div>
          </div>

        </div>
      </div>
    </main>
  );
}
