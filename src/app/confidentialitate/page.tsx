import { ShieldCheck } from 'lucide-react';

export const metadata = {
  title: 'Politica de Confidențialitate — numeredecasa.ro',
  description: 'Politica de confidențialitate și protecția datelor personale (GDPR) pentru numeredecasa.ro.',
};

export default function ConfidentialitatePage() {
  return (
    <main className="min-h-screen pt-24 pb-12 px-6 lg:px-12 bg-foreground/[0.02]">
      <article className="max-w-3xl mx-auto prose prose-lg prose-headings:font-bold prose-headings:tracking-tight prose-a:text-primary">
        <div className="flex items-center gap-3 mb-8 not-prose">
          <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center">
            <ShieldCheck className="w-6 h-6 text-primary" />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold">Politica de Confidențialitate</h1>
        </div>

        <p className="text-foreground/60 text-sm">Ultima actualizare: 12 martie 2026</p>

        <h2>1. Operatorul de Date</h2>
        <p><strong>SC GUNDAHAR SRL</strong>, CUI 36704546, cu sediul în Str. Feleacului 14, Oradea, România, este operatorul datelor cu caracter personal colectate prin intermediul site-ului numeredecasa.ro.</p>

        <h2>2. Ce Date Colectăm</h2>
        <p>Colectăm următoarele date cu caracter personal, necesare procesării comenzilor:</p>
        <ul>
          <li><strong>Date de identificare:</strong> Nume, Prenume</li>
          <li><strong>Date de contact:</strong> Adresă de email, Număr de telefon</li>
          <li><strong>Date de livrare:</strong> Adresă completă (județ, localitate, stradă) sau locația Easybox selectată</li>
          <li><strong>Date despre comandă:</strong> Produsele configurate, tipul produsului, personalizări alese, cantitate și preț</li>
        </ul>

        <h2>3. Scopul Prelucrării</h2>
        <p>Datele personale sunt colectate și prelucrate exclusiv în următoarele scopuri:</p>
        <ul>
          <li>Procesarea și livrarea comenzilor</li>
          <li>Emiterea documentelor fiscale (facturi)</li>
          <li>Comunicarea privind starea comenzii</li>
          <li>Răspunsuri la solicitări de asistență</li>
        </ul>

        <h2>4. Temeiul Juridic</h2>
        <p>Prelucrarea datelor se bazează pe executarea contractului (plasarea comenzii) conform Art. 6 alin. (1) lit. b) din Regulamentul GDPR și pe obligațiile legale ale vânzătorului (emitere facturi) conform Art. 6 alin. (1) lit. c).</p>

        <h2>5. Cui Transmitem Datele</h2>
        <p>Datele personale pot fi transmise către:</p>
        <ul>
          <li><strong>Sameday Courier SRL</strong> — pentru livrarea coletelor</li>
          <li><strong>Procesatorul de plăți</strong> — pentru procesarea tranzacțiilor securizate</li>
          <li><strong>Supabase Inc.</strong> — pentru stocarea securizată a datelor comenzilor</li>
        </ul>
        <p>Nu vindem, nu închiriem și nu transmitem datele personale către terți în scop de marketing.</p>

        <h2>6. Durata Stocării</h2>
        <p>Datele personale sunt stocate conform cerințelor legale fiscale (minim 5 ani pentru documentele contabile) și sunt șterse automat după expirarea acestei perioade.</p>

        <h2>7. Drepturile Tale</h2>
        <p>Conform Regulamentului GDPR, beneficiezi de următoarele drepturi:</p>
        <ul>
          <li><strong>Dreptul de acces</strong> — poți solicita o copie a datelor tale personale</li>
          <li><strong>Dreptul de rectificare</strong> — poți cere corectarea datelor incorecte</li>
          <li><strong>Dreptul la ștergere</strong> — poți cere ștergerea datelor, cu excepția celor impuse de lege</li>
          <li><strong>Dreptul la portabilitate</strong> — poți solicita datele într-un format structurat</li>
          <li><strong>Dreptul de opoziție</strong> — poți refuza prelucrarea în anumite condiții</li>
        </ul>
        <p>Pentru exercitarea acestor drepturi, scrie-ne la: <a href="mailto:ciobotaru.serban@gmail.com">ciobotaru.serban@gmail.com</a>.</p>

        <h2>8. Securitate</h2>
        <p>Utilizăm măsuri tehnice și organizatorice adecvate pentru protecția datelor: conexiuni criptate (HTTPS), baze de date Supabase cu Row Level Security, și acces restricționat la datele comenzilor.</p>

        <h2>9. Cookies</h2>
        <p>Site-ul utilizează cookies strict necesare funcționării coșului de cumpărături (stocare locală). Nu utilizăm cookies de tracking sau marketing terțe părți.</p>

        <h2>10. Contact ANSPDCP</h2>
        <p>Dacă consideri că prelucrarea datelor tale acest site încalcă drepturile tale, poți depune o plângere la Autoritatea Națională de Supraveghere a Prelucrării Datelor cu Caracter Personal (ANSPDCP), B-dul G-ral. Gheorghe Magheru nr. 28-30, Sector 1, București, <a href="https://www.dataprotection.ro" target="_blank" rel="noopener noreferrer">www.dataprotection.ro</a>.</p>
      </article>
    </main>
  );
}
