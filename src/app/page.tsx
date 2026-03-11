import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, Box, Layers, MousePointer2 } from 'lucide-react';

export default function Home() {
  return (
    <main className="min-h-[90vh] flex flex-col pt-32 pb-12 px-6 lg:px-12 items-center">
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

        <div className="relative animate-in fade-in slide-in-from-right-8 duration-1000 delay-300 w-full aspect-square lg:aspect-[4/5] rounded-[2.5rem] overflow-hidden shadow-2xl shadow-foreground/5 bg-foreground/5">
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

      <div className="mt-32 max-w-7xl w-full">
        <div className="flex flex-col md:flex-row justify-between items-end gap-6 mb-12">
          <div>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Colecția <span className="text-primary italic font-serif">Signature</span></h2>
            <p className="text-foreground/60 max-w-xl">Produsul nostru vedetă: personalizat în detaliu, fabricat cu precizie, menit să reziste zeci de ani pe fațada casei tale.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-32">
          <div className="relative aspect-video md:aspect-[4/3] rounded-3xl overflow-hidden bg-foreground/5">
            <Image src="/product-ro.png" alt="Numar Stradal Signature" fill className="object-cover" />
          </div>
          <div className="flex flex-col justify-center p-6 lg:p-12 bg-foreground/[0.02] border border-foreground/5 rounded-3xl">
            <h3 className="text-2xl font-bold mb-2">Model Clasic Suspendat</h3>
            <p className="text-xl text-primary font-medium mb-6">de la 149 RON</p>
            <p className="text-foreground/70 mb-8 leading-relaxed">
              O reinterpretare a plăcuțelor stradale tradiționale, realizată dintr-un aliaj ușor dar extrem de rigid. Litera și numărul tău principal stau mândre deasupra numelui străzii, pentru o citeală excelentă din strada. Textură mată elegantă, instalare usoara invizibilă.
            </p>
            <ul className="space-y-3 mb-8">
              <li className="flex items-center gap-3"><Box className="w-5 h-5 text-primary" /> <span className="text-foreground/80">Design premium 3D din material texturat</span></li>
              <li className="flex items-center gap-3"><Layers className="w-5 h-5 text-primary" /> <span className="text-foreground/80">Rezistență industrială la raze UV</span></li>
            </ul>
            <Link href="/configurator" className="bg-primary text-primary-foreground text-white px-6 py-4 rounded-xl font-medium hover:bg-primary/90 transition-colors w-fit shadow-lg shadow-primary/20">
              Configurează acest produs
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            { icon: Box, title: "Livrare Rapidă Easybox", desc: "Primești comanda prin rețeaua națională Sameday, direct la Easybox-ul preferat." },
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
