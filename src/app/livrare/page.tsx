import { Truck } from 'lucide-react';

export const metadata = {
  title: 'Politica de Livrare — numeredecasa.ro',
  description: 'Informații despre livrarea produselor numeredecasa.ro prin Sameday Courier și Easybox.',
};

export default function LivrarePage() {
  return (
    <main className="min-h-screen pt-24 pb-12 px-6 lg:px-12 bg-foreground/[0.02]">
      <article className="max-w-3xl mx-auto prose prose-lg prose-headings:font-bold prose-headings:tracking-tight prose-a:text-primary">
        <div className="flex items-center gap-3 mb-8 not-prose">
          <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center">
            <Truck className="w-6 h-6 text-primary" />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold">Politica de Livrare</h1>
        </div>

        <p className="text-foreground/60 text-sm">Ultima actualizare: 12 martie 2026</p>

        <h2>1. Metode de Livrare</h2>
        <p>Livrarea produselor comandate pe numeredecasa.ro se realizează pe teritoriul României, prin intermediul companiei de curierat <strong>Sameday Courier SRL</strong>, prin două metode:</p>
        
        <h3>Curier la Domiciliu</h3>
        <ul>
          <li>Coletul este livrat la adresa specificată în comandă</li>
          <li>Cost: <strong>20.00 RON</strong></li>
          <li>Termen estimat: 3-5 zile lucrătoare de la confirmarea comenzii</li>
        </ul>

        <h3>Sameday Easybox</h3>
        <ul>
          <li>Coletul este livrat în locker-ul Easybox selectat de tine la checkout</li>
          <li>Cost: <strong>15.00 RON</strong></li>
          <li>Termen estimat: 3-5 zile lucrătoare de la confirmarea comenzii</li>
          <li>Ai la dispoziție 48 de ore pentru a-l ridica din locker</li>
        </ul>

        <h2>2. Termene de Fabricație</h2>
        <p>Produsele noastre sunt <strong>fabricate la comandă</strong>, conform configurației alese de tine (număr, text, culoare). De aceea, la termenul de livrare curier se adaugă un termen de fabricație de <strong>2-4 zile lucrătoare</strong>.</p>
        <p>Termenul total estimat (fabricație + livrare) este de <strong>5-9 zile lucrătoare</strong>.</p>

        <h2>3. Verificare la Primire</h2>
        <p>La primirea coletului, te rugăm să verifici integritatea ambalajului și conformitatea produsului cu comanda plasată. Orice neconformitate trebuie semnalată în termen de 48 de ore de la recepție, la adresa de email: <a href="mailto:ciobotaru.serban@gmail.com">ciobotaru.serban@gmail.com</a>.</p>

        <h2>4. Livrare Eșuată</h2>
        <p>În cazul în care curierul nu te poate contacta sau nu poți prelua coletul, Sameday va încerca o a doua livrare. Dacă nici aceasta nu reușește, coletul este returnat către noi, iar tu vei fi contactat pentru reprogramarea livrării (costuri suplimentare de transport pot fi aplicate).</p>

        <h2>5. Contact</h2>
        <p>Pentru orice întrebări legate de livrare, ne poți contacta la:</p>
        <ul>
          <li>Email: <a href="mailto:ciobotaru.serban@gmail.com">ciobotaru.serban@gmail.com</a></li>
          <li>Telefon / WhatsApp: <a href="tel:0756210895">0756 210 895</a></li>
        </ul>
      </article>
    </main>
  );
}
