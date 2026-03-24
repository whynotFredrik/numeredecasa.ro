import { RotateCcw } from 'lucide-react';

export const metadata = {
  title: 'Politica de Retur — numarul.ro',
  description: 'Politica de retur și garanție pentru produsele achiziționate de pe numarul.ro.',
};

export default function ReturPage() {
  return (
    <main className="min-h-screen pt-24 pb-12 px-6 lg:px-12 bg-foreground/[0.02]">
      <article className="max-w-3xl mx-auto prose prose-lg prose-headings:font-bold prose-headings:tracking-tight prose-a:text-primary">
        <div className="flex items-center gap-3 mb-8 not-prose">
          <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center">
            <RotateCcw className="w-6 h-6 text-primary" />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold">Politica de Retur</h1>
        </div>

        <p className="text-foreground/60 text-sm">Ultima actualizare: 12 martie 2026</p>

        <h2>1. Produse Fabricate la Comandă</h2>
        <p>Toate produsele comercializate pe numarul.ro sunt <strong>fabricate la comandă</strong>, conform configurației personalizate alese de fiecare client (număr, text, culoare, tip).</p>
        <p>Conform <strong>Art. 16 lit. c) din OUG 34/2014</strong>, dreptul de retragere nu se aplică produselor realizate după specificațiile consumatorului sau personalizate în mod clar.</p>

        <h2>2. Defecte de Fabricație</h2>
        <p>Ne angajăm să livrăm produse de cea mai înaltă calitate. În cazul în care produsul primit prezintă defecte de fabricație, ne obligăm să:</p>
        <ul>
          <li>Înlocuim produsul defect, fără costuri suplimentare</li>
          <li>Sau rambursăm integral contravaloarea comenzii</li>
        </ul>
        <p>Defectele de fabricație trebuie semnalate în termen de <strong>48 de ore</strong> de la primirea coletului, cu fotografii clare ale defectului.</p>

        <h2>3. Neconformitate</h2>
        <p>Dacă produsul livrat nu corespunde configurației alese (de exemplu: număr greșit, culoare greșită, text incorect), contactează-ne imediat. Vom fabrica un produs nou, corect, și îl vom livra pe cheltuiala noastră.</p>

        <h2>4. Deteriorare în Transport</h2>
        <p>Dacă produsul a fost deteriorat în timpul transportului:</p>
        <ul>
          <li>Fotografiază ambalajul și produsul deteriorat</li>
          <li>Contactează-ne în maximum 48 de ore de la recepție</li>
          <li>Vom procesa o reclamație la curier și vom expedia un produs nou</li>
        </ul>

        <h2>5. Garanție</h2>
        <p>Toate produsele beneficiază de <strong>garanție de conformitate de 2 ani</strong>, conform legislației românești în vigoare. Garanția acoperă defecte de material și de fabricație, în condiții normale de utilizare.</p>
        <p>Garanția <strong>nu acoperă</strong>:</p>
        <ul>
          <li>Deteriorări cauzate de montaj incorect</li>
          <li>Uzară normală în timp</li>
          <li>Daune mecanice provocate post-livrare</li>
        </ul>

        <h2>6. Procedura de Retur</h2>
        <p>Pentru a iniția un retur sau o reclamație:</p>
        <ol>
          <li>Trimite un email la <a href="mailto:ciobotaru.serban@gmail.com">ciobotaru.serban@gmail.com</a> cu numărul comenzii și fotografii</li>
          <li>Vom analiza cererea în maximum 2 zile lucrătoare</li>
          <li>Dacă cererea este aprobată, vom aranja preluarea produsului prin curier sau trimiterea unui produs nou</li>
          <li>Rambursarea (dacă este cazul) se procesează în maximum 14 zile de la primirea produsului returnat</li>
        </ol>

        <h2>7. Contact</h2>
        <p>Pentru orice întrebări legate de retururi:</p>
        <ul>
          <li>Email: <a href="mailto:ciobotaru.serban@gmail.com">ciobotaru.serban@gmail.com</a></li>
          <li>Telefon / WhatsApp: <a href="tel:0756210895">0756 210 895</a></li>
        </ul>
      </article>
    </main>
  );
}
