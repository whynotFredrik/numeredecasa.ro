'use client';

import Link from 'next/link';
import Image from 'next/image';
import { ShoppingBag, Menu, X } from 'lucide-react';
import { useCartStore } from '@/store/cartStore';
import { useEffect, useState } from 'react';

export function Navbar() {
    const { getCartCount, setCartOpen } = useCartStore();
    const [mounted, setMounted] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    return (
        <header className="fixed top-0 inset-x-0 z-50 bg-background/80 backdrop-blur-md border-b border-foreground/5">
            <div className="container mx-auto px-6 h-16 flex items-center justify-between">
                <Link href="/" className="flex items-center">
                    <Image
                        src="/logo.svg"
                        alt="numarul.ro"
                        width={140}
                        height={32}
                        className="h-7 w-auto dark:hidden"
                        priority
                    />
                    <Image
                        src="/logo-dark.svg"
                        alt="numarul.ro"
                        width={140}
                        height={32}
                        className="h-7 w-auto hidden dark:block"
                        priority
                    />
                </Link>

                <nav className="hidden md:flex flex-1 justify-center gap-8">
                    <Link href="/produse" className="text-sm font-medium hover:text-primary transition-colors duration-200">Produse</Link>
                    <Link href="/configurator" className="text-sm font-medium hover:text-primary transition-colors duration-200 flex items-center gap-1 text-primary">
                        Configurator Live
                    </Link>
                    <Link href="/contact" className="text-sm font-medium hover:text-primary transition-colors duration-200">Contact</Link>
                </nav>

                <div className="flex items-center gap-2">
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

                    {/* Mobile hamburger */}
                    <button 
                        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                        className="md:hidden w-10 h-10 flex items-center justify-center rounded-full hover:bg-foreground/5 transition-colors"
                    >
                        {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                    </button>
                </div>
            </div>

            {/* Mobile Menu Drawer */}
            {mobileMenuOpen && (
                <div className="md:hidden bg-background/95 backdrop-blur-xl border-b border-foreground/5 animate-in slide-in-from-top-2 duration-200">
                    <nav className="container mx-auto px-6 py-6 flex flex-col gap-4">
                        <Link href="/produse" onClick={() => setMobileMenuOpen(false)} className="text-lg font-medium hover:text-primary transition-colors py-2 border-b border-foreground/5">
                            Produse
                        </Link>
                        <Link href="/configurator" onClick={() => setMobileMenuOpen(false)} className="text-lg font-medium text-primary transition-colors py-2 border-b border-foreground/5">
                            Configurator Live
                        </Link>
                        <Link href="/contact" onClick={() => setMobileMenuOpen(false)} className="text-lg font-medium hover:text-primary transition-colors py-2 border-b border-foreground/5">
                            Contact
                        </Link>
                        <Link href="/termeni" onClick={() => setMobileMenuOpen(false)} className="text-sm text-foreground/50 hover:text-primary transition-colors py-1">
                            Termeni și Condiții
                        </Link>
                        <Link href="/confidentialitate" onClick={() => setMobileMenuOpen(false)} className="text-sm text-foreground/50 hover:text-primary transition-colors py-1">
                            Politica de Confidențialitate
                        </Link>
                    </nav>
                </div>
            )}
        </header>
    );
}
