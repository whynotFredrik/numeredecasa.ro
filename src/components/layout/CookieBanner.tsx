'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Cookie, X } from 'lucide-react';

export function CookieBanner() {
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        const consent = localStorage.getItem('cookie-consent');
        if (!consent) {
            // Small delay so the banner doesn't flash on page load
            const timer = setTimeout(() => setVisible(true), 800);
            return () => clearTimeout(timer);
        }
    }, []);

    function accept() {
        localStorage.setItem('cookie-consent', 'accepted');
        setVisible(false);
    }

    function reject() {
        localStorage.setItem('cookie-consent', 'rejected');
        setVisible(false);
    }

    if (!visible) return null;

    return (
        <div className="fixed bottom-4 left-4 z-50 max-w-sm animate-in slide-in-from-bottom-4 fade-in duration-500">
            <div className="bg-background border border-foreground/10 rounded-2xl shadow-2xl shadow-foreground/10 p-5">
                <div className="flex items-start gap-3">
                    <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                        <Cookie className="w-4 h-4 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold mb-1">Folosim cookie-uri</p>
                        <p className="text-xs text-foreground/50 leading-relaxed">
                            Utilizăm cookie-uri esențiale pentru funcționarea site-ului și cookie-uri analitice pentru a înțelege cum interacționezi cu site-ul nostru.{' '}
                            <Link href="/confidentialitate" className="underline hover:text-foreground/70 transition-colors">
                                Politica de confidențialitate
                            </Link>
                        </p>
                    </div>
                    <button
                        onClick={reject}
                        className="shrink-0 w-7 h-7 flex items-center justify-center rounded-full hover:bg-foreground/5 transition-colors text-foreground/30 hover:text-foreground/60"
                        aria-label="Închide"
                    >
                        <X className="w-3.5 h-3.5" />
                    </button>
                </div>
                <div className="flex gap-2 mt-4">
                    <button
                        onClick={reject}
                        className="flex-1 text-xs font-medium py-2.5 px-4 rounded-xl border border-foreground/10 hover:bg-foreground/5 transition-colors"
                    >
                        Doar esențiale
                    </button>
                    <button
                        onClick={accept}
                        className="flex-1 text-xs font-bold py-2.5 px-4 rounded-xl bg-primary text-white hover:bg-primary/90 transition-colors"
                    >
                        Accept toate
                    </button>
                </div>
            </div>
        </div>
    );
}
