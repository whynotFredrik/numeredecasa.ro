export function Footer() {
    return (
        <footer className="bg-foreground/[0.02] border-t border-foreground/5 py-12 mt-20">
            <div className="container mx-auto px-6 grid grid-cols-1 md:grid-cols-4 gap-8">
                <div className="md:col-span-2">
                    <h2 className="text-xl font-bold tracking-tighter mb-4">
                        numere<span className="text-primary italic font-serif">decasa</span>.ro
                    </h2>
                    <p className="text-sm text-foreground/60 max-w-sm leading-relaxed">
                        Ne specializăm în crearea de adrese vizuale premium. Produse configurabile, fabricate din materiale de înaltă rezistență, menite să redefinească prima impresie a casei tale.
                    </p>
                </div>
                <div>
                    <h3 className="font-semibold mb-4 text-foreground/90">Linkuri Utile</h3>
                    <ul className="space-y-3 text-sm text-foreground/60">
                        <li><a href="/produse" className="hover:text-primary transition-colors">Toate Produsele</a></li>
                        <li><a href="/configurator" className="hover:text-primary transition-colors">Configurator 3D</a></li>
                        <li><a href="/livrare" className="hover:text-primary transition-colors">Politica de Livrare (Sameday)</a></li>
                        <li><a href="/retur" className="hover:text-primary transition-colors">Politica de Retur</a></li>
                    </ul>
                </div>
                <div>
                    <h3 className="font-semibold mb-4 text-foreground/90">Asistență Client</h3>
                    <ul className="space-y-3 text-sm text-foreground/60">
                        <li>Email: <a href="mailto:contact@numeredecasa.ro" className="hover:text-primary">contact@numeredecasa.ro</a></li>
                        <li>Suport Whatsapp: 0700 000 000</li>
                        <li>Program: Luni - Vineri, 09:00 - 18:00</li>
                    </ul>
                </div>
            </div>
            <div className="container mx-auto px-6 mt-16 pt-8 border-t border-foreground/5 flex flex-col md:flex-row items-center justify-between text-xs text-foreground/40 gap-4">
                <p>© {new Date().getFullYear()} numeredecasa.ro. Toate drepturile rezervate.</p>
                <p>Procesare plăți securizată prin Netopia Payments.</p>
            </div>
        </footer>
    );
}
