import Link from 'next/link';
import Image from 'next/image';

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

            {/* ANPC & Payment badges */}
            <div className="container mx-auto px-6 mt-12 pt-8 border-t border-foreground/5">
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                    {/* ANPC badges */}
                    <div className="flex flex-col sm:flex-row gap-3">
                        <a
                            href="https://anpc.ro/ce-este-sal/"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="hover:opacity-80 transition-opacity"
                            title="ANPC – Soluționarea Alternativă a Litigiilor"
                        >
                            <Image
                                src="/anpc-sal.png"
                                alt="ANPC – Soluționarea Alternativă a Litigiilor"
                                width={250}
                                height={50}
                                className="h-[50px] w-auto"
                            />
                        </a>
                        <a
                            href="https://ec.europa.eu/consumers/odr"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="hover:opacity-80 transition-opacity"
                            title="ANPC – Soluționarea Online a Litigiilor"
                        >
                            <Image
                                src="/anpc-sol.png"
                                alt="ANPC – Soluționarea Online a Litigiilor"
                                width={250}
                                height={50}
                                className="h-[50px] w-auto"
                            />
                        </a>
                    </div>
                    {/* Netopia payment badge */}
                    <a
                        href="https://netopia-payments.com"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="hover:opacity-80 transition-opacity"
                        title="Plăți procesate de NETOPIA Payments"
                    >
                        <Image
                            src="/netopia-logo.svg"
                            alt="NETOPIA Payments – Visa, Mastercard"
                            width={200}
                            height={40}
                            className="h-[40px] w-auto"
                        />
                    </a>
                </div>
                <p className="text-[11px] text-foreground/30 mt-4 max-w-3xl leading-relaxed">
                    Măsurile ANPC de informare a consumatorilor cu privire la soluționarea alternativă a litigiilor: Autoritatea Națională pentru Protecția Consumatorilor – <a href="https://anpc.ro/ce-este-sal/" target="_blank" rel="noopener noreferrer" className="underline hover:text-foreground/50 transition-colors">SAL</a> / <a href="https://ec.europa.eu/consumers/odr" target="_blank" rel="noopener noreferrer" className="underline hover:text-foreground/50 transition-colors">SOL</a>
                </p>
            </div>

            {/* Copyright bar */}
            <div className="container mx-auto px-6 mt-8 pt-8 border-t border-foreground/5 flex flex-col md:flex-row items-center justify-between text-xs text-foreground/40 gap-4">
                <p>© {new Date().getFullYear()} numeredecasa.ro · SC GUNDAHAR SRL. Toate drepturile rezervate.</p>
                <div className="flex gap-4">
                    <span>Email: ciobotaru.serban@gmail.com</span>
                    <span>Tel: 0756 210 895</span>
                </div>
            </div>
        </footer>
    );
}
