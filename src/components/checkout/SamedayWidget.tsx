'use client';

import { useState, useEffect } from 'react';
import Script from 'next/script';
import { Package, MapPin, CheckCircle2 } from 'lucide-react';

interface LockerPluginOptions {
  clientId: string;
  country: string;
  language: string;
  city?: string;
}

interface LockerData {
  name: string;
  address: string;
  city: string;
  county: string;
  easyboxId: string;
}

declare global {
  interface Window {
    LockerPlugin?: {
      init: (options: LockerPluginOptions) => void;
      getInstance: () => {
        open: () => void;
        close: () => void;
        subscribe: (event: string, callback: (data: LockerData) => void) => void;
      };
    };
  }
}

interface SamedayWidgetProps {
  onLockerSelect: (locker: LockerData | null) => void;
  selectedLocker: LockerData | null;
}

export function SamedayWidget({ onLockerSelect, selectedLocker }: SamedayWidgetProps) {
  const [isScriptLoaded, setIsScriptLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // If we already selected a locker or the script isn't loaded, wait
    if (!isScriptLoaded || !window.LockerPlugin) return;

    try {
      // Initialize only if not already initialized
      window.LockerPlugin.init({
        clientId: 'numeredecasa-demo-id', // Înlocuiește cu Client ID-ul real Sameday
        country: 'RO',
        language: 'ro'
      });

      const instance = window.LockerPlugin.getInstance();
      
      instance.subscribe('onLockerSelect', (locker) => {
        onLockerSelect(locker);
        instance.close();
      });

    } catch (err) {
      console.error('Eroare la inițializarea Sameday Plugin:', err);
      setError('Widget-ul Sameday nu a putut fi încărcat din lipsa credențialelor (Client ID). Funcționăm în mod Simulare pentru Checkout.');
    }
  }, [isScriptLoaded, onLockerSelect]);

  const handleOpenMap = () => {
    if (window.LockerPlugin && !error) {
      try {
        const instance = window.LockerPlugin.getInstance();
        instance.open();
      } catch (err) {
        handleMockSelect(); // Fallback if API fails without real ID
      }
    } else {
      handleMockSelect();
    }
  };

  const handleMockSelect = () => {
    // Fallback/Demo function for when the user testing doesn't have a real Sameday Client ID yet
    onLockerSelect({
        name: 'Easybox Mega Image',
        address: 'Bulevardul Unirii nr. 10',
        city: 'București',
        county: 'București',
        easyboxId: 'EBOX-RO-1234'
    });
  };

  return (
    <>
      <Script 
        src="https://cdn.sameday.ro/locker-plugin/lockerpluginsameday.js"
        strategy="lazyOnload"
        onLoad={() => setIsScriptLoaded(true)}
        onError={() => setError('Nu s-a putut încărca scriptul Sameday.')}
      />

      <div className="p-6 border border-foreground/10 border-dashed rounded-xl text-center bg-foreground/[0.02] animate-in fade-in transition-all duration-300">
        {!selectedLocker ? (
          <div className="space-y-4">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto text-primary">
              <MapPin className="w-8 h-8" />
            </div>
            <div>
              <p className="text-foreground/90 font-bold mb-1">Selectează un Easybox</p>
              <p className="text-foreground/60 text-sm mb-6">Alege locker-ul cel mai apropiat de la care vrei să ridici coletul.</p>
            </div>
            
            <button 
              type="button" 
              onClick={handleOpenMap}
              className="bg-foreground text-background font-bold px-8 py-4 rounded-xl hover:bg-foreground/90 transition-colors hover:scale-[1.02] active:scale-95 shadow-lg flex items-center gap-2 mx-auto"
            >
              <Package className="w-5 h-5" />
              Deschide Harta Easybox
            </button>

            {error && (
              <p className="text-xs text-orange-500 mt-4 max-w-sm mx-auto text-center">
                Info Dev: {error}
              </p>
            )}
          </div>
        ) : (
          <div className="bg-primary/5 border border-primary/20 rounded-xl p-6 text-left relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-10">
              <MapPin className="w-24 h-24" />
            </div>
            <div className="flex items-start gap-4 relative z-10">
              <div className="mt-1">
                <CheckCircle2 className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h4 className="font-bold text-lg text-primary mb-1">{selectedLocker.name}</h4>
                <p className="text-foreground/70 text-sm">{selectedLocker.address}</p>
                <p className="text-foreground/70 text-sm font-medium">{selectedLocker.city}, {selectedLocker.county}</p>
                <div className="mt-4">
                  <button 
                    type="button"
                    onClick={() => onLockerSelect(null)}
                    className="text-sm font-bold text-foreground hover:text-primary transition-colors underline underline-offset-4 decoration-foreground/20 hover:decoration-primary"
                  >
                    Modifică locker-ul selectat
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
