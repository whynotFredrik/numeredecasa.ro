'use client';

import Link from 'next/link';
import { ShoppingBag } from 'lucide-react';
import { useCartStore } from '@/store/cartStore';
import { useEffect, useState } from 'react';

export function Navbar() {
    const { getCartCount, setCartOpen } = useCartStore();
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    return (
        <header className="fixed top-0 inset-x-0 z-50 bg-background/80 backdrop-blur-md border-b border-foreground/5">
            <div className="container mx-auto px-6 h-16 flex items-center justify-between">
                <Link href="/" className="text-xl font-bold tracking-tighter">
                    numere<span className="text-primary italic font-serif">decasa</span>.ro
                </Link>

                <nav className="hidden md:flex flex-1 justify-center gap-8">
                    <Link href="/produse" className="text-sm font-medium hover:text-primary transition-colors duration-200">Produse</Link>
                    <Link href="/configurator" className="text-sm font-medium hover:text-primary transition-colors duration-200 flex items-center gap-1 text-primary">
                        Configurator Live
                    </Link>
                    <Link href="/contact" className="text-sm font-medium hover:text-primary transition-colors duration-200">Contact</Link>
                </nav>

                <div className="flex items-center gap-4">
                    <button 
                        onClick={() => setCartOpen(true)}
                        className="relative w-10 h-10 flex items-center justify-center rounded-full hover:bg-foreground/5 transition-colors"
                    >
                        <ShoppingBag className="w-5 h-5" />
                        {mounted && getCartCount() > 0 && (
                            <span className="absolute top-1 right-1 w-4 h-4 bg-primary text-[10px] font-bold text-background flex items-center justify-center rounded-full shadow-sm">
                                {getCartCount()}
                            </span>
                        )}
                    </button>
                </div>
            </div>
        </header>
    );
}
