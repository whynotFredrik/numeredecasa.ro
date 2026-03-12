'use client';

import { useState } from 'react';
import { Mail, Phone, MapPin, Clock, Send, CheckCircle2 } from 'lucide-react';
import { supabase } from '@/lib/supabase/client';

export default function ContactPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [isSent, setIsSent] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSending(true);
    setError('');

    try {
      const { error: dbError } = await supabase
        .from('contact_messages')
        .insert({ name, email, message });
      
      if (dbError) throw dbError;
      setIsSent(true);
    } catch (err: any) {
      setError('Nu am putut trimite mesajul. Te rugăm să ne contactezi direct prin email.');
    } finally {
      setIsSending(false);
    }
  };

  return (
    <main className="min-h-screen pt-24 pb-12 px-6 lg:px-12 bg-foreground/[0.02]">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16 space-y-4">
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight">
            Contactează-<span className="text-primary italic font-serif">ne</span>
          </h1>
          <p className="text-foreground/60 max-w-xl mx-auto text-lg">
            Suntem aici pentru orice întrebare. Scrie-ne un mesaj sau contactează-ne direct.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 lg:gap-12">
          {/* Contact Info */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-background p-8 rounded-[2rem] border border-foreground/5 shadow-xl shadow-foreground/5 space-y-8">
              <div>
                <h2 className="text-xl font-bold mb-6">Date Firmă</h2>
                <p className="text-foreground/80 font-semibold">SC GUNDAHAR SRL</p>
                <p className="text-foreground/50 text-sm">CUI: 36704546</p>
              </div>

              <div className="space-y-5">
                <div className="flex gap-4">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                    <MapPin className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium text-sm text-foreground/50">Adresă</p>
                    <p className="text-foreground/80">Str. Feleacului 14, Oradea</p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                    <Phone className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium text-sm text-foreground/50">Telefon / WhatsApp</p>
                    <a href="tel:0756210895" className="text-foreground/80 hover:text-primary transition-colors">0756 210 895</a>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                    <Mail className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium text-sm text-foreground/50">Email</p>
                    <a href="mailto:ciobotaru.serban@gmail.com" className="text-foreground/80 hover:text-primary transition-colors">ciobotaru.serban@gmail.com</a>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                    <Clock className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium text-sm text-foreground/50">Program</p>
                    <p className="text-foreground/80">Luni – Vineri: 09:00 – 18:00</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Contact Form */}
          <div className="lg:col-span-3">
            <div className="bg-background p-8 rounded-[2rem] border border-foreground/5 shadow-xl shadow-foreground/5">
              {isSent ? (
                <div className="text-center py-12 space-y-4">
                  <div className="w-16 h-16 mx-auto bg-green-500/10 text-green-500 rounded-full flex items-center justify-center">
                    <CheckCircle2 className="w-8 h-8" />
                  </div>
                  <h3 className="text-2xl font-bold">Mesaj trimis!</h3>
                  <p className="text-foreground/60">Îți mulțumim. Te vom contacta în cel mai scurt timp.</p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                  <h2 className="text-xl font-bold mb-2">Trimite-ne un mesaj</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <input
                      type="text" value={name} onChange={e => setName(e.target.value)}
                      placeholder="Numele tău" required
                      className="w-full bg-foreground/[0.02] border border-foreground/10 rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary outline-none transition-all"
                    />
                    <input
                      type="email" value={email} onChange={e => setEmail(e.target.value)}
                      placeholder="Adresa ta de email" required
                      className="w-full bg-foreground/[0.02] border border-foreground/10 rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary outline-none transition-all"
                    />
                  </div>
                  <textarea
                    value={message} onChange={e => setMessage(e.target.value)}
                    placeholder="Scrie mesajul tău aici..." required rows={6}
                    className="w-full bg-foreground/[0.02] border border-foreground/10 rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary outline-none transition-all resize-none"
                  />
                  {error && <p className="text-red-500 text-sm">{error}</p>}
                  <button
                    type="submit" disabled={isSending}
                    className="w-full bg-primary text-white py-4 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-primary/90 transition-colors shadow-xl shadow-primary/20 disabled:opacity-70"
                  >
                    <Send className="w-5 h-5" />
                    {isSending ? 'Se trimite...' : 'Trimite Mesajul'}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
