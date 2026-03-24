'use client';

import { useCartStore } from '@/store/cartStore';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Trash2, Plus, Minus, ShoppingBag, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';

const finishBgMap: Record<string, string> = {
  black: 'bg-[#1a1a1a]',
  white: 'bg-white',
  brown: 'bg-[#5C3A21]',
  lightgray: 'bg-[#B0B0B0]',
};

const finishNameMap: Record<string, string> = {
  black: 'Negru Texturat',
  white: 'Alb Satinat',
  brown: 'Maro Texturat',
  lightgray: 'Gri Deschis Satinat',
};

export function CartSidebar() {
  const { isCartOpen, setCartOpen, items, updateQuantity, removeItem, getCartTotal } = useCartStore();
  const [mounted, setMounted] = useState(false);

  // Hydration fix for Zustand persist
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <AnimatePresence>
      {isCartOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setCartOpen(false)}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50"
          />

          {/* Sidebar */}
          <motion.div
            initial={{ x: '100%', opacity: 0.5 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: '100%', opacity: 0.5 }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed top-0 right-0 h-screen w-full md:w-[450px] bg-background shadow-2xl z-[60] flex flex-col border-l border-foreground/10"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-foreground/10">
              <div className="flex items-center gap-3">
                <ShoppingBag className="w-5 h-5" />
                <h2 className="text-xl font-bold">Coșul tău</h2>
                <span className="bg-primary/10 text-primary text-xs font-bold px-2 py-1 rounded-full">
                  {items.length} {items.length === 1 ? 'produs' : 'produse'}
                </span>
              </div>
              <button
                onClick={() => setCartOpen(false)}
                className="p-2 hover:bg-foreground/5 rounded-full transition-colors"
              >
                <X className="w-5 h-5 text-foreground/60" />
              </button>
            </div>

            {/* Items */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {items.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-foreground/50 space-y-4">
                  <ShoppingBag className="w-16 h-16 opacity-20" />
                  <p>Coșul tău este gol</p>
                  <button 
                    onClick={() => setCartOpen(false)}
                    className="text-primary font-medium hover:underline mt-4"
                  >
                    Întoarce-te la cumpărături
                  </button>
                </div>
              ) : (
                items.map((item) => (
                  <div key={item.id} className="flex gap-4 p-4 bg-foreground/[0.02] rounded-2xl border border-foreground/5 relative group">
                    <div className="w-24 h-24 bg-foreground/5 rounded-xl flex items-center justify-center border border-foreground/10 overflow-hidden relative p-2 shadow-inner">
                      {/* Mini Preview bazat pe tip */}
                      <div className="w-full flex flex-col items-center justify-center">
                         {item.productType === 'house' && (
                           <>
                             <div className="text-2xl font-bold leading-none">{item.mainNumber}</div>
                             <div className={`w-full h-1 mt-1 mb-1 ${finishBgMap[item.finish] || 'bg-[#1a1a1a]'}`}></div>
                             <div className="text-[0.5rem] font-bold tracking-widest">{item.streetName}</div>
                           </>
                         )}
                         {item.productType === 'apartment' && (
                           <>
                             <div className="text-2xl font-bold leading-none">{item.mainNumber}</div>
                             <div className={`w-3/4 h-1 mt-1 ${finishBgMap[item.finish] || 'bg-[#1a1a1a]'}`}></div>
                           </>
                         )}
                         {item.productType === 'office' && (
                           <>
                             <div className="text-[0.6rem] font-bold">{item.officeName}</div>
                             <div className={`w-full h-1 mt-0.5 mb-0.5 ${finishBgMap[item.finish] || 'bg-[#1a1a1a]'}`}></div>
                             <div className="text-[0.4rem]">{item.officeFunction}</div>
                           </>
                         )}
                      </div>
                    </div>

                    <div className="flex-1 flex flex-col justify-between">
                      <div>
                        <h3 className="font-bold text-sm">
                          Plăcuță {item.productType === 'house' ? 'Casă' : item.productType === 'apartment' ? 'Apartament' : 'Birou'}
                        </h3>
                        <p className="text-xs text-foreground/60 capitalize mt-1">
                          Culoare: {finishNameMap[item.finish] || item.finish}
                        </p>
                      </div>

                      <div className="flex items-center justify-between mt-4">
                        <div className="flex items-center gap-2 bg-background rounded-lg border border-foreground/10 p-1">
                          <button 
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            className="p-1 hover:bg-foreground/5 rounded-md transition-colors"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="text-xs font-semibold w-6 text-center">{item.quantity}</span>
                          <button 
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            className="p-1 hover:bg-foreground/5 rounded-md transition-colors"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>
                        
                        <div className="text-sm font-bold">
                          {item.price * item.quantity} RON
                        </div>
                      </div>
                    </div>
                    
                    <button 
                      onClick={() => removeItem(item.id)}
                      className="absolute -top-2 -right-2 bg-background border border-foreground/10 p-1.5 rounded-full text-foreground/40 hover:text-red-500 hover:border-red-500/30 transition-all opacity-0 group-hover:opacity-100 md:opacity-100 shadow-sm"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                ))
              )}
            </div>

            {/* Footer */}
            {items.length > 0 && (
              <div className="p-6 bg-foreground/[0.02] border-t border-foreground/10 space-y-4">
                <div className="flex justify-between items-center text-sm mb-2">
                  <span className="text-foreground/60">Subtotal</span>
                  <span className="font-bold">{getCartTotal()} RON</span>
                </div>
                <div className="flex justify-between items-center text-sm mb-4">
                  <span className="text-foreground/60">Livrare</span>
                  <span className="font-medium text-green-600">Calculat la finalizare</span>
                </div>
                <div className="flex justify-between items-center text-lg">
                  <span className="font-bold">Total Estimat</span>
                  <span className="font-black text-2xl">{getCartTotal()} RON</span>
                </div>
                
                <Link 
                  href="/checkout"
                  onClick={() => setCartOpen(false)}
                  className="w-full bg-primary text-white py-4 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-primary/90 transition-colors shadow-lg shadow-primary/20 mt-6 group"
                >
                  Spre Finalizare Comandă
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
