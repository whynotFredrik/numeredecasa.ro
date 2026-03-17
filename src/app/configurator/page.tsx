'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { ChevronRight, Info, Check, ShoppingCart } from 'lucide-react';
import Link from 'next/link';
import { useCartStore } from '@/store/cartStore';

export default function Configurator() {
  const [productType, setProductType] = useState<'house' | 'apartment' | 'office'>('house');
  const [mainNumber, setMainNumber] = useState('25');
  const [streetName, setStreetName] = useState('STR EXEMPLU');
  const [officeName, setOfficeName] = useState('DR POPESCU');
  const [officeFunction, setOfficeFunction] = useState('MEDIC STOMATOLOG');
  const [finish, setFinish] = useState<'black' | 'white'>('black');
  
  const basePrice = productType === 'apartment' ? 99 : 149;
  const totalPrice = basePrice;
  
  const addItem = useCartStore((state) => state.addItem);

  const handleAddToCart = () => {
    addItem({
      productType,
      mainNumber,
      streetName,
      officeName,
      officeFunction,
      finish,
      price: totalPrice,
      quantity: 1,
    });
  };

  return (
    <main className="min-h-screen pt-24 pb-12 px-6 lg:px-12 bg-foreground/[0.02]">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center gap-2 text-sm text-foreground/60 mb-8">
          <Link href="/" className="hover:text-primary transition-colors">Acasă</Link>
          <ChevronRight className="w-4 h-4" />
          <Link href="/produse" className="hover:text-primary transition-colors">Produse</Link>
          <ChevronRight className="w-4 h-4" />
          <span className="text-foreground/90 font-medium">Configurator Model Signature</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
          {/* Live Preview Area - sticky on desktop */}
          <div className="lg:col-span-8 lg:sticky lg:top-28 h-fit">
            <div className="bg-primary rounded-[2.5rem] shadow-2xl shadow-primary/20 border border-primary/20 aspect-square md:aspect-video flex items-center justify-center p-8 lg:p-16 relative overflow-hidden">
              {/* Background lighting simulation */}
              <div className="absolute inset-0 bg-gradient-to-tr from-black/10 to-transparent pointer-events-none"></div>
              
              <motion.div 
                className="relative w-full h-full flex items-center justify-center overflow-visible"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.8, ease: "easeOut" }}
              >
                  {/* Container for the sign components */}
                  
                  {/* OFFICE VERSION */}
                  {productType === 'office' && (
                    <div 
                      className={`flex flex-col w-full max-w-[500px] z-10 transition-all duration-500 ease-out ${finish === 'black' ? 'text-[#1a1a1a]' : 'text-white'}`}
                      style={{ textShadow: finish === 'black' ? '2px 8px 16px rgba(0,0,0,0.15)' : '2px 8px 16px rgba(0,0,0,0.1)' }}
                    >
                      <div className="w-full flex justify-end relative z-20">
                        <motion.div 
                          key={officeName}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="font-bold tracking-wider uppercase whitespace-nowrap pr-4 md:pr-8"
                          style={{ 
                            fontFamily: "var(--font-open-sans), sans-serif",
                            marginBottom: '-0.40em', 
                            fontSize: `calc(clamp(1.5rem, 4vw, 3rem) * ${Math.min(1, 15 / Math.max(1, officeName.length))})` 
                          }}
                        >
                          {officeName || 'NUME'}
                        </motion.div>
                      </div>
                      
                      <div className={`w-full h-3 md:h-5 rounded-sm shadow-lg relative z-10 ${finish === 'black' ? 'bg-[#1a1a1a]' : 'bg-white'}`}></div>
                      
                      <div className="w-full flex justify-start relative z-20">
                        <motion.div 
                          key={officeFunction}
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="font-bold tracking-wider uppercase whitespace-nowrap pl-4 md:pl-8"
                          style={{ 
                            fontFamily: "var(--font-open-sans), sans-serif",
                            marginTop: '-0.20em',
                            lineHeight: 1,
                            fontSize: `calc(clamp(0.8rem, 2vw, 1.5rem) * ${Math.min(1, 20 / Math.max(1, officeFunction.length))})` 
                          }}
                        >
                          {officeFunction}
                        </motion.div>
                      </div>
                    </div>
                  )}

                  {/* HOUSE VERSION */}
                  {productType === 'house' && (
                    <div 
                      className={`flex flex-col items-end w-full max-w-[500px] ml-[15%] md:ml-[10%] z-10 transition-all duration-500 ease-out ${finish === 'black' ? 'text-[#1a1a1a]' : 'text-white'}`}
                      style={{ textShadow: finish === 'black' ? '2px 8px 16px rgba(0,0,0,0.15)' : '2px 8px 16px rgba(0,0,0,0.1)' }}
                    >
                      <motion.div 
                        key={mainNumber}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="leading-none tracking-tighter relative z-20 mr-4 md:mr-12"
                        style={{ 
                          fontFamily: "var(--font-open-sans), sans-serif",
                          fontWeight: 700, 
                          fontSize: 'clamp(6rem, 14vw, 11rem)',
                          marginBottom: '-0.15em'
                        }}
                      >
                        {mainNumber || '10'}
                      </motion.div>
                      
                      <div className="w-full h-3 md:h-5 relative z-10 flex justify-end" style={{ marginBottom: 0 }}>
                        <div className={`absolute right-0 top-0 h-full w-[170%] md:w-[250%] max-w-[600px] rounded-sm shadow-lg ${finish === 'black' ? 'bg-[#1a1a1a]' : 'bg-white'}`}></div>
                      </div>

                      <motion.div 
                        key={streetName}
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="tracking-wider uppercase whitespace-nowrap relative z-20"
                        style={{ 
                          fontFamily: "var(--font-open-sans), sans-serif",
                          fontWeight: 700,
                          marginTop: '-0.20em',
                          lineHeight: 1,
                          fontSize: `calc(clamp(1.2rem, 3.5vw, 2.5rem) * ${Math.min(1, 15 / Math.max(1, streetName.replace(/\s/g, '').length))})` 
                        }}
                      >
                        {streetName || 'STRADA'}
                      </motion.div>
                    </div>
                  )}

                  {/* APARTMENT VERSION */}
                  {productType === 'apartment' && (
                    <div 
                      className={`flex flex-col items-center w-fit mx-auto z-10 transition-all duration-500 ease-out ${finish === 'black' ? 'text-[#1a1a1a]' : 'text-white'}`}
                      style={{ textShadow: finish === 'black' ? '2px 8px 16px rgba(0,0,0,0.15)' : '2px 8px 16px rgba(0,0,0,0.1)' }}
                    >
                      <motion.div 
                        key={mainNumber}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="leading-none tracking-tighter relative z-20"
                        style={{ 
                          fontFamily: "var(--font-open-sans), sans-serif",
                          fontWeight: 700, 
                          fontSize: 'clamp(6rem, 14vw, 11rem)',
                          marginBottom: '-0.15em'
                        }}
                      >
                        {mainNumber || '10'}
                      </motion.div>
                      
                      <div className="w-full h-3 md:h-5 relative z-10 flex justify-center" style={{ marginBottom: 0 }}>
                        <div className={`absolute left-1/2 -translate-x-1/2 w-[115%] h-full rounded-sm shadow-lg ${finish === 'black' ? 'bg-[#1a1a1a]' : 'bg-white'}`}></div>
                      </div>
                    </div>
                  )}
              </motion.div>

              <div className="absolute top-6 right-6 flex items-center gap-2 bg-background/80 backdrop-blur-md px-4 py-2 rounded-full text-xs font-medium text-foreground/60 border border-foreground/5">
                <Info className="w-4 h-4" />
                Previzualizare Simulată. Proporțiile pot varia ușor la producție.
              </div>
            </div>
          </div>

          {/* Controls Area */}
          <div className="lg:col-span-4 space-y-8 bg-background p-8 rounded-[2.5rem] shadow-xl shadow-foreground/5 border border-foreground/5">
            <div>
              <h1 className="text-3xl font-bold mb-2">Configurează Modelul</h1>
              <p className="text-foreground/60 leading-relaxed text-sm">Printat 3D dintr-un material ușor și ultra-rezistent UV. Include sistem cu găuri ascunse pentru șuruburi și bandă dublu adezivă industrială pre-aplicată.</p>
            </div>

            <div className="space-y-6">
              {/* Product Type Selection */}
              <div className="flex bg-foreground/5 p-1 rounded-xl">
                {['house', 'apartment', 'office'].map((type) => (
                  <button
                    key={type}
                    onClick={() => setProductType(type as any)}
                    className={`flex-1 text-xs md:text-sm font-medium py-2 rounded-lg transition-all ${productType === type ? 'bg-background shadow text-foreground' : 'text-foreground/60 hover:text-foreground'}`}
                  >
                    {type === 'house' ? 'Case' : type === 'apartment' ? 'Apartamente' : 'Birouri'}
                  </button>
                ))}
              </div>

              {/* Number Input (House & Apartment) */}
              {productType !== 'office' && (
              <div className="space-y-3 animate-in fade-in">
                <label className="text-sm font-semibold flex justify-between">
                  <span>Număr Principal</span>
                  <span className="text-foreground/50 font-normal">Max 5 caractere</span>
                </label>
                <input 
                  type="text" 
                  value={mainNumber}
                  onChange={(e) => setMainNumber(e.target.value.toUpperCase().replace(/[^A-Z0-9\s]/g, '').slice(0, 5))}
                  placeholder="Ex: 8A, 112"
                  className="w-full bg-foreground/[0.03] border border-foreground/10 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all font-medium text-lg uppercase"
                />
              </div>
              )}

               {/* Street Name Input (House only) */}
               {productType === 'house' && (
               <div className="space-y-3 animate-in fade-in">
                <label className="text-sm font-semibold flex justify-between">
                  <span>Nume Stradă</span>
                  <span className="text-foreground/50 font-normal">Max 25 caractere</span>
                </label>
                <input 
                  type="text" 
                  value={streetName}
                  onChange={(e) => setStreetName(e.target.value.toUpperCase().replace(/[^A-Z0-9\s]/g, '').slice(0, 25))}
                  placeholder="Ex: STR EXEMPLU"
                  className="w-full bg-foreground/[0.03] border border-foreground/10 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all font-medium text-lg uppercase"
                />
              </div>
              )}

              {/* Office Inputs */}
              {productType === 'office' && (
                <div className="space-y-4 animate-in fade-in">
                  <div className="space-y-2">
                    <label className="text-sm font-semibold">Nume / Denumire</label>
                    <input 
                      type="text" 
                      value={officeName}
                      onChange={(e) => setOfficeName(e.target.value.toUpperCase().replace(/[^A-Z0-9\s]/g, '').slice(0, 30))}
                      placeholder="Ex: DR POPESCU"
                      className="w-full bg-foreground/[0.03] border border-foreground/10 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary transition-all uppercase"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-semibold">Funcție / Profesie</label>
                    <input 
                      type="text" 
                      value={officeFunction}
                      onChange={(e) => setOfficeFunction(e.target.value.toUpperCase().replace(/[^A-Z0-9\s]/g, '').slice(0, 40))}
                      placeholder="Ex: MEDIC STOMATOLOG"
                      className="w-full bg-foreground/[0.03] border border-foreground/10 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary transition-all uppercase"
                    />
                  </div>
                </div>
              )}

              {/* Finish Selection */}
              <div className="space-y-3 pt-4 border-t border-foreground/5">
                <label className="text-sm font-semibold">Culoare & Textură</label>
                <div className="grid grid-cols-2 gap-3">
                  <button 
                    onClick={() => setFinish('black')}
                    className={`flex items-center gap-3 p-3 rounded-xl border text-left transition-all ${finish === 'black' ? 'border-primary bg-primary/5 ring-1 ring-primary/20' : 'border-foreground/10 hover:border-foreground/30'}`}
                  >
                    <div className="w-8 h-8 rounded-full bg-[#1a1a1a] shadow-inner"></div>
                    <span className="text-sm font-medium">Negru Mat<br/><span className="text-xs text-foreground/50 font-normal">Texturat</span></span>
                    {finish === 'black' && <Check className="w-4 h-4 ml-auto text-primary" />}
                  </button>
                  <button 
                    onClick={() => setFinish('white')}
                    className={`flex items-center gap-3 p-3 rounded-xl border text-left transition-all ${finish === 'white' ? 'border-primary bg-primary/5 ring-1 ring-primary/20 bg-foreground/[0.02]' : 'border-foreground/10 hover:border-foreground/30'}`}
                  >
                    <div className="w-8 h-8 rounded-full bg-white border border-gray-200 shadow-inner"></div>
                    <span className="text-sm font-medium">Alb Pur<br/><span className="text-xs text-foreground/50 font-normal">Satinat</span></span>
                    {finish === 'white' && <Check className="w-4 h-4 ml-auto text-primary" />}
                  </button>
                </div>
              </div>
            </div>

            <div className="pt-8 border-t border-foreground/5 space-y-4">
              <div className="flex justify-between items-end">
                <span className="text-foreground/60">Total Estimat</span>
                <span className="text-3xl font-bold">{totalPrice} <span className="text-lg text-foreground/60 font-medium">RON</span></span>
              </div>
              <button 
                onClick={handleAddToCart}
                className="w-full bg-primary text-primary-foreground text-white px-8 py-4 rounded-xl font-bold hover:bg-primary/90 hover:scale-[1.02] active:scale-95 transition-all duration-300 shadow-xl shadow-primary/20 flex items-center justify-center gap-2"
              >
                <ShoppingCart className="w-5 h-5" />
                Adaugă în Coș
              </button>
              <p className="text-center text-xs text-foreground/50">Livrare în 4-6 zile lucrătoare prin curier sau locker, în toată România.</p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
