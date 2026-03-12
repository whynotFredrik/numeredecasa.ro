import Link from 'next/link';
import { ArrowRight, Home, Building, Briefcase, Sparkles, Shield, Truck } from 'lucide-react';

export const metadata = {
  title: 'Produse — numeredecasa.ro',
  description: 'Numere stradale premium, numere de apartament și plăcuțe birou personalizate. Configurează-ți produsul live și comandă online.',
};

const products = [
  {
    id: 'house',
    title: 'Numere Stradale',
    subtitle: 'Case & Vile',
    description: 'Numărul tău stradal, conceput ca element arhitectural. Un număr mare, vizibil, deasupra numelui străzii tale — toate suspendate pe o bară metalică elegantă.',
    price: 149,
    icon: Home,
    features: ['Număr + Nume Stradă', 'Design suspendat premium', 'Rezistență UV & intemperii'],
    configTab: 'house',
  },
  {
    id: 'apartment',
    title: 'Numere Apartament',
    subtitle: 'Blocuri & Rezidențiale',
    description: 'Numărul apartamentului tău, într-un format compact dar de impact. Design curat, minimalist, perfect pentru holurile moderne sau clasice.',
    price: 99,
    icon: Building,
    features: ['Număr mare centralizat', 'Profil subțire elegant', 'Montaj simplu, invizibil'],
    configTab: 'apartment',
  },
  {
    id: 'office',
    title: 'Plăcuțe Birou',
    subtitle: 'Birouri & Cabinete',
    description: 'Plăcuță nominală pentru biroul tău. Numele deasupra barei de susținere, funcția dedesubt — o carte de vizită permanentă pe ușa ta.',
    price: 149,
    icon: Briefcase,
    features: ['Nume + Funcție/Profesie', 'Look corporate premium', 'Font Open Sans profesional'],
    configTab: 'office',
  },
];

function ProductIllustration({ type }: { type: string }) {
  if (type === 'house') {
    return (
      <div className="flex flex-col items-end pr-4">
        <span className="text-6xl font-bold leading-none tracking-tight" style={{ fontFamily: 'var(--font-geist-sans)' }}>25</span>
        <div className="w-32 h-1 bg-foreground rounded-full mt-1 mb-1"></div>
        <span className="text-sm font-bold tracking-widest uppercase" style={{ fontFamily: 'var(--font-open-sans)' }}>Str. Feleacului</span>
      </div>
    );
  }
  if (type === 'apartment') {
    return (
      <div className="flex flex-col items-center">
        <span className="text-7xl font-bold leading-none tracking-tight" style={{ fontFamily: 'var(--font-geist-sans)' }}>14</span>
        <div className="w-20 h-1 bg-foreground rounded-full mt-1"></div>
      </div>
    );
  }
  return (
    <div className="flex flex-col items-end pr-4">
      <span className="text-2xl font-bold leading-none" style={{ fontFamily: 'var(--font-open-sans)' }}>Popescu Ion</span>
      <div className="w-40 h-1 bg-foreground rounded-full mt-1 mb-1"></div>
      <span className="text-sm font-bold" style={{ fontFamily: 'var(--font-open-sans)' }}>Avocat</span>
    </div>
  );
}

export default function ProdusePage() {
  return (
    <main className="min-h-screen pt-24 pb-12 px-6 lg:px-12 bg-foreground/[0.02]">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-16 space-y-4">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium border border-primary/20">
            <Sparkles className="w-4 h-4" />
            Colecția Signature
          </div>
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight">
            Toate <span className="text-primary italic font-serif">Produsele</span> Noastre
          </h1>
          <p className="text-foreground/60 max-w-2xl mx-auto text-lg">
            Fiecare produs este configurat de tine, fabricat cu precizie și livrat la ușa ta prin Sameday.
          </p>
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-1 gap-8 lg:gap-12">
          {products.map((product, index) => (
            <div
              key={product.id}
              className={`grid grid-cols-1 lg:grid-cols-2 gap-0 bg-background rounded-[2rem] border border-foreground/5 shadow-xl shadow-foreground/5 overflow-hidden ${index % 2 !== 0 ? 'lg:direction-rtl' : ''}`}
            >
              {/* Illustration Side */}
              <div className={`bg-foreground/[0.03] flex items-center justify-center p-12 lg:p-16 min-h-[300px] ${index % 2 !== 0 ? 'lg:order-2' : ''}`}>
                <div className="transform hover:scale-105 transition-transform duration-500">
                  <ProductIllustration type={product.id} />
                </div>
              </div>

              {/* Info Side */}
              <div className={`p-8 lg:p-12 flex flex-col justify-center ${index % 2 !== 0 ? 'lg:order-1' : ''}`}>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                    <product.icon className="w-5 h-5 text-primary" />
                  </div>
                  <span className="text-sm font-medium text-foreground/50 uppercase tracking-wider">{product.subtitle}</span>
                </div>

                <h2 className="text-3xl font-bold mb-2">{product.title}</h2>
                <p className="text-xl text-primary font-semibold mb-4">de la {product.price} RON</p>
                <p className="text-foreground/70 leading-relaxed mb-8">{product.description}</p>

                <ul className="space-y-3 mb-8">
                  {product.features.map((feat, i) => (
                    <li key={i} className="flex items-center gap-3 text-foreground/80">
                      <div className="w-1.5 h-1.5 rounded-full bg-primary"></div>
                      {feat}
                    </li>
                  ))}
                </ul>

                <Link
                  href={`/configurator`}
                  className="inline-flex items-center gap-2 bg-foreground text-background px-8 py-4 rounded-xl font-bold hover:-translate-y-0.5 hover:shadow-xl transition-all duration-300 w-fit"
                >
                  Configurează Acum
                  <ArrowRight className="w-5 h-5" />
                </Link>
              </div>
            </div>
          ))}
        </div>

        {/* Trust Badges */}
        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { icon: Shield, title: 'Garanție Calitate', desc: 'Materiale certificate, rezistente la UV și intemperii.' },
            { icon: Truck, title: 'Livrare Sameday', desc: 'Curier la domiciliu sau ridicare din Easybox.' },
            { icon: Sparkles, title: 'Fabricat La Comandă', desc: 'Fiecare produs este unic, configurat de tine.' },
          ].map((badge, i) => (
            <div key={i} className="flex gap-4 p-6 rounded-2xl bg-background border border-foreground/5">
              <badge.icon className="w-6 h-6 text-primary shrink-0 mt-1" />
              <div>
                <h3 className="font-bold mb-1">{badge.title}</h3>
                <p className="text-sm text-foreground/60">{badge.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
