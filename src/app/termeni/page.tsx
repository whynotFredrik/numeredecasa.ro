import { Scale } from 'lucide-react';

export const metadata = {
  title: 'Termeni și Condiții — numarul.ro',
  description: 'Termenii și condițiile generale de utilizare a magazinului online numarul.ro.',
};

export default function TermeniPage() {
  return (
    <main className="min-h-screen pt-24 pb-12 px-6 lg:px-12 bg-foreground/[0.02]">
      <article className="max-w-3xl mx-auto prose prose-lg prose-headings:font-bold prose-headings:tracking-tight prose-a:text-primary">
        <div className="flex items-center gap-3 mb-8 not-prose">
          <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center">
            <Scale className="w-6 h-6 text-primary" />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold">Termeni și Condiții</h1>
        </div>

        <p className="text-foreground/60 text-sm">Ultima actualizare: 12 martie 2026</p>

        <h2>1. Date Firmă</h2>
        <p>Magazinul online <strong>numarul.ro</strong> este operat de <strong>SC GUNDAHAR SRL</strong>, cu sediul social în Str. Feleacului 14, Oradea, România, CUI: 36704546. Email de contact: ciobotaru.serban@gmail.com, Telefon: 0756 210 895.</p>

        <h2>2. Definiții</h2>
        <p><strong>Vânzător</strong> — SC GUNDAHAR SRL. <strong>Cumpărător</strong> — orice persoană fizică sau juridică care accesează site-ul și plasează o comandă. <strong>Produs</strong> — numere stradale, numere de apartament, sau plăcuțe birou personalizate, fabricate la comandă conform configurației alese de cumpărător.</p>

        <h2>3. Plasarea Comenzii</h2>
        <p>Prin finalizarea comenzii pe site, Cumpărătorul confirmă că a citit și acceptat prezenții Termeni și Condiții. Comanda devine un contract obligatoriu după confirmarea de către Vânzător prin email.</p>
        <p>Deoarece produsele noastre sunt <strong>fabricate la comandă</strong> (personalizate conform configurației clientului), acestea nu pot fi returnate din motive de preferință personală, conform art. 16 lit. c) din OUG 34/2014.</p>

        <h2>4. Prețuri și Plată</h2>
        <p>Prețurile afișate pe site includ TVA. Costul livrării este calculat separat și este afișat în pagina de Checkout înainte de finalizarea comenzii. Plata se face online prin procesatorul de plăți securizat.</p>

        <h2>5. Livrare</h2>
        <p>Livrarea se realizează prin platforma WOOT (woot.ro), care colaborează cu mai mulți curieri (curier la domiciliu sau locker). Detalii complete se regăsesc în <a href="/livrare">Politica de Livrare</a>.</p>

        <h2>6. Dreptul de Retragere</h2>
        <p>Conform OUG 34/2014, produsele fabricate la comandă, personalizate conform specificațiilor cumpărătorului, sunt exceptate de la dreptul de retragere de 14 zile. Cu toate acestea, în cazul unor defecte de fabricație, Vânzătorul se angajează să remedieze sau înlocuiască produsul. Detalii în <a href="/retur">Politica de Retur</a>.</p>

        <h2>7. Garanție</h2>
        <p>Toate produsele beneficiază de garanție de conformitate de 2 ani, conform legislației în vigoare. Garanția acoperă defecte de fabricație, dar nu acoperă deteriorări cauzate de montaj incorect sau utilizare necorespunzătoare.</p>

        <h2>8. Proprietate Intelectuală</h2>
        <p>Conținutul site-ului (texte, imagini, design, cod sursă) este proprietatea SC GUNDAHAR SRL și este protejat de legislația privind drepturile de autor. Reproducerea fără acord scris este interzisă.</p>

        <h2>9. Litigii</h2>
        <p>Eventualele litigii se vor soluționa pe cale amiabilă. În caz contrar, se va apela la instanțele competente de pe raza municipiului Oradea.</p>
      </article>
    </main>
  );
}
