import Link from 'next/link';

export function Footer() {
    return (
        <footer className="bg-foreground/[0.02] border-t border-foreground/5 py-12 mt-20">
            <div className="container mx-auto px-6 grid grid-cols-1 md:grid-cols-4 gap-8">
                <div className="md:col-span-2">
                    <h2 className="text-xl font-bold tracking-tighter mb-4">
                        numere<span className="text-primary italic font-serif">decasa</span>.ro
                    </h2>
                    <p className="text-sm text-foreground/60 max-w-sm leading-relaxed mb-4">
                        Ne specializăm în crearea de adrese vizuale premium. Produse configurabile, fabricate din materiale de înaltă rezistență, menite să redefinească prima impresie a casei tale.
                    </p>
                    <div className="text-xs text-foreground/40 space-y-1">
                        <p>SC GUNDAHAR SRL | CUI: 36704546</p>
                        <p>Str. Feleacului 14, Oradea, România</p>
                    </div>
                </div>
                <div>
                    <h3 className="font-semibold mb-4 text-foreground/90">Linkuri Utile</h3>
                    <ul className="space-y-3 text-sm text-foreground/60">
                        <li><Link href="/produse" className="hover:text-primary transition-colors">Toate Produsele</Link></li>
                        <li><Link href="/configurator" className="hover:text-primary transition-colors">Configurator Live</Link></li>
                        <li><Link href="/contact" className="hover:text-primary transition-colors">Contact</Link></li>
                    </ul>
                </div>
                <div>
                    <h3 className="font-semibold mb-4 text-foreground/90">Informații</h3>
                    <ul className="space-y-3 text-sm text-foreground/60">
                        <li><Link href="/termeni" className="hover:text-primary transition-colors">Termeni și Condiții</Link></li>
                        <li><Link href="/confidentialitate" className="hover:text-primary transition-colors">Politica de Confidențialitate</Link></li>
                        <li><Link href="/livrare" className="hover:text-primary transition-colors">Politica de Livrare</Link></li>
                        <li><Link href="/retur" className="hover:text-primary transition-colors">Politica de Retur</Link></li>
                    </ul>
                </div>
            </div>
            <div className="container mx-auto px-6 mt-16 pt-8 border-t border-foreground/5 flex flex-col md:flex-row items-center justify-between text-xs text-foreground/40 gap-4">
                <p>© {new Date().getFullYear()} numeredecasa.ro · SC GUNDAHAR SRL. Toate drepturile rezervate.</p>
                <div className="flex gap-4">
                    <span>Email: ciobotaru.serban@gmail.com</span>
                    <span>Tel: 0756 210 895</span>
                </div>
            </div>
        </footer>
    );
}
