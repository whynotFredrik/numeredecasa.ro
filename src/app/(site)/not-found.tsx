import Link from "next/link";
import { Home, Search, ArrowRight } from "lucide-react";

export default function NotFound() {
  return (
    <main className="min-h-[80vh] flex items-center justify-center px-6">
      <div className="text-center max-w-lg space-y-8">
        <div className="space-y-2">
          <p className="text-8xl font-bold text-primary/20">404</p>
          <h1 className="text-3xl font-bold">Pagina nu a fost găsită</h1>
          <p className="text-foreground/60 text-lg">
            Ne pare rău, pagina pe care o cauți nu există sau a fost mutată.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
          <Link
            href="/"
            className="inline-flex items-center justify-center gap-2 bg-foreground text-background px-6 py-3 rounded-full font-medium hover:-translate-y-0.5 hover:shadow-lg transition-all"
          >
            <Home className="w-4 h-4" />
            Pagina Principală
          </Link>
          <Link
            href="/produse"
            className="inline-flex items-center justify-center gap-2 border border-foreground/20 px-6 py-3 rounded-full font-medium hover:bg-foreground/5 transition-colors"
          >
            <Search className="w-4 h-4" />
            Vezi Produsele
          </Link>
        </div>

        <div className="pt-8 border-t border-foreground/10">
          <p className="text-sm text-foreground/50">
            Ai nevoie de ajutor?{" "}
            <Link
              href="/contact"
              className="text-primary hover:underline inline-flex items-center gap-1"
            >
              Contactează-ne <ArrowRight className="w-3 h-3" />
            </Link>
          </p>
        </div>
      </div>
    </main>
  );
}
