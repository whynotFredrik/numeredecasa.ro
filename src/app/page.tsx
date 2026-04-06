import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, Box, Layers, MousePointer2, Home, Building, Briefcase, Sparkles } from 'lucide-react';
import { ReviewsSection } from '@/components/reviews/ReviewsSection';

'use client';

export default function HomePage() {
  return (
    <main className="min-h-[90vh] flex flex-col pt-32 pb-12 px-6 lg:px-12 items-center">

      {/* ── Hero ── */}
      <div className="max-w-7xl w-full grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-1000">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary mb-2 border border-primary/20 text-sm font-medium w-fit">
            <MousePointer2 className="w-4 h-4" />
            <span>Configurator 3D Direct pe Site</span>
          </div>

          <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-balance leading-tight">
            Detalii care fac <span className="text-primary italic font-serif">diferența</span> pentru casa ta.
          </h1>

          <p className="text-lg md:text-xl text-foreground/70 max-w-2xl leading-relaxed">
            Numere stradale conceptualizate arhitectural, design premium și semnalistică pentru birouri. Configurează-ți propriul model, live.
          </p>

          <div className="flex flex-col sm:flex-row items-center gap-4 pt-8">
            <Link
              href="/configurator"
              className="flex items-center gap-2 bg-foreground text-background px-8 py-4 rounded-full font-medium hover:-translate-y-1 hover:shadow-xl hover:shadow-primary/20 transition-all duration-300 w-full sm:w-auto justify-center"
            >
              Începe Configurarea
              <ArrowRight className="w-5 h-5" />
            </Link>
            <Link
              href="/produse"
              className="flex items-center gap-2 text-foreground border border-foreground/20 px-8 py-4 rounded-full font-medium hover:bg-foreground/5 transition-colors duration-300 w-full sm:w-auto justify-center"
            >
              Vezi Tot Catalogul
            </Link>
          </div>
        </div>

        <div className="relative animate-in fade-in slide-in-from-right-8 duration-1000 delay-300 w-full aspect-square lg:aspect-[4/5] rounded-[2.5rem] overflow-hidden shadow-2xl shadow-foreground/5 bg-foreground/5 hidden lg:block">
          <Image
            src="/hero-ro.png"
            alt="Număr Stradal Premium"
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-tr from-foreground/10 to-transparent pointer-events-none"></div>
          <div className="absolute inset-0 ring-1 ring-inset ring-foreground/10 rounded-[2.5rem] pointer-events-none"></div>
        </div>
      </div>

      {/* ── Configurator CTA Section ── */}
      <div className="mt-32 max-w-7xl w-full">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-0 bg-background rounded-[2rem] border border-foreground/5 shadow-xl shadow-foreground/5 overflow-hidden">
          {/* Preview side */}
          <div className="bg-foreground/[0.03] flex items-center justify-center p-12 lg:p-16 min-h-[350px]">
            <div className="flex flex-col items-end pr-4">
              <span className="text-7xl font-bold leading-none tracking-tight" style={{ fontFamily: 'var(--font-geist-sans)' }}>25</span>
              <div className="w-36 h-1 bg-foreground rounded-full mt-2 mb-2"></div>
              <span className="text-sm font-bold tracking-widest uppercase" style={{ fontFamily: 'var(--font-open-sans)' }}>Str. Feleacului</span>
            </div>
          </div>

          {/* Info side */}
          <div className="p-8 lg:p-12 flex flex-col justify-center">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 text-primary text-xs font-medium border border-primary/20 w-fit mb-6">
              <Sparkles className="w-3.5 h-3.5" />
              Configurator Live
            </div>

            <h2 className="text-3xl font-bold mb-4">Creează-ți <span className="text-primary italic font-serif">propriul</span> model</h2>
            <p className="text-foreground/70 leading-relaxed mb-6">
              Alege tipul produsului, personalizează numărul, strada, culorile — și vezi rezultatul în timp real. Totul fabricat la comandă, exact cum vrei tu.
            </p>

            <ul className="space-y-3 mb-8">
              <li className="flex items-center gap-3 text-foreground/80">
                <div className="w-1.5 h-1.5 rounded-full bg-primary"></div>
                Previzualizare live a produsului
              </li>
              <li className="flex items-center gap-3 text-foreground/80">
                <div className="w-1.5 h-1.5 rounded-full bg-primary"></div>
                Personalizare completă: text, culoare, tip
              </li>
              <li className="flex items-center gap-3 text-foreground/80">
                <div className="w-1.5 h-1.5 rounded-full bg-primary"></div>
                Adaugă direct în coș și comandă online
              </li>
            </ul>

            <Link
              href="/configurator"
              className="inline-flex items-center gap-2 bg-foreground text-background px-8 py-4 rounded-xl font-bold hover:-translate-y-0.5 hover:shadow-xl transition-all duration-300 w-fit"
            >
              Deschide Configuratorul
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </div>

      {/* ── Products Section ── */}
      <div className="mt-32 max-w-7xl w-full">
        <div className="flex flex-col md:flex-row justify-between items-end gap-6 mb-12">
          <div>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Produsele <span className="text-primary italic font-serif">noastre</span></h2>
            <p className="text-foreground/60 max-w-xl">Fiecare produs este configurat de tine, fabricat cu precizie și livrat la ușa ta în toată România.</p>
          </div>
          <Link
            href="/produse"
            className="flex items-center gap-2 text-primary font-semibold hover:gap-3 transition-all shrink-0"
          >
            Vezi toate produsele
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            {
              icon: Home,
              title: 'Numere Stradale',
              subtitle: 'Case & Vile',
              price: 129,
              desc: 'Numărul tău stradal, conceput ca element arhitectural. Vizibil, elegant, rezistent.',
            },
            {
              icon: Building,
              title: 'Numere Apartament',
              subtitle: 'Blocuri & Rezidențiale',
              price: 89,
              desc: 'Design compact dar de impact, perfect pentru holuri moderne sau clasice.',
            },
            {
              icon: Briefcase,
              title: 'Plăcuțe Birou',
              subtitle: 'Birouri & Cabinete',
              price: 159,
              desc: 'Plăcuță nominală profesională — o carte de vizită permanentă pe ușa ta.',
            },
          ].map((product, i) => (
            <Link
              key={i}
              href="/configurator"
              className="group p-8 rounded-3xl bg-background border border-foreground/5 shadow-lg shadow-foreground/5 hover:border-primary/20 hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
            >
              <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center mb-6 group-hover:bg-primary/20 transition-colors">
                <product.icon className="w-6 h-6 text-primary" />
              </div>
              <span className="text-xs font-medium text-foreground/40 uppercase tracking-wider">{product.subtitle}</span>
              <h3 className="text-xl font-bold mt-1 mb-2 group-hover:text-primary transition-colors">{product.title}</h3>
              <p className="text-sm text-foreground/60 leading-relaxed mb-4">{product.desc}</p>
              <div className="flex items-center justify-between">
                <span className="text-primary font-bold">de la {product.price} RON</span>
                <ArrowRight className="w-4 h-4 text-foreground/30 group-hover:text-primary group-hover:translate-x-1 transition-all" />
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* ── Reviews Section ── */}
      <ReviewsSection
        variant="homepage"
        title="Ce spun clienții noștri"
        subtitle="Recenzii reale de la clienți mulțumiți care au ales plăcuțele noastre personalizate."
        showForm={true}
      />

      {/* ── Features ── */}
      <div className="mt-32 max-w-7xl w-full">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            { icon: Box, title: "Livrare Rapidă", desc: "Primești comanda prin curier la domiciliu sau direct la locker-ul preferat, în toată România." },
            { icon: Layers, title: "Materiale Premium", desc: "Folosim doar texturi rezistente la raze UV și intemperii, alese special pentru fațade." },
            { icon: MousePointer2, title: "Ajustează Live", desc: "Vizualizează cum va arăta numărul casei înainte să adaugi produsul în coș." }
          ].map((feat, i) => (
            <div key={i} className="flex gap-4 p-8 rounded-3xl bg-foreground/[0.03] border border-foreground/[0.05] hover:border-primary/20 hover:bg-foreground/[0.04] transition-all">
              <div className="bg-background p-3 rounded-2xl shadow-sm h-fit border border-foreground/5">
                <feat.icon className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold text-lg mb-2">{feat.title}</h3>
                <p className="text-sm text-foreground/60 leading-relaxed">{feat.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
