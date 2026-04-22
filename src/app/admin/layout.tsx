'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useState, useEffect } from 'react';
import { Menu, X, LayoutDashboard, ShoppingCart, Star, Ticket, LogOut } from 'lucide-react';

export default function AdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleLogout = () => {
    // Clear Basic Auth by setting empty credentials
    const win = window.open(window.location.href, '_self');
    // The browser will prompt for credentials again, effectively logging out
    localStorage.clear();
    sessionStorage.clear();
  };

  if (!mounted) return null;

  return (
        <div className="flex h-screen overflow-hidden bg-background text-foreground">
          {/* Sidebar */}
          <aside
            className={`${
              sidebarOpen ? 'w-64' : 'w-20'
            } bg-[#1A1A1A] text-white transition-all duration-300 flex flex-col border-r border-white/10 overflow-y-auto`}
          >
            {/* Logo */}
            <div className="h-16 flex items-center justify-center border-b border-white/10 px-4">
              {sidebarOpen ? (
                <div className="flex items-center gap-2 w-full">
                  <Image
                    src="/logo-dark.svg"
                    alt="numarul.ro"
                    width={140}
                    height={32}
                    className="h-6 w-auto"
                  />
                </div>
              ) : (
                <div className="w-8 h-8 bg-primary rounded flex items-center justify-center text-sm font-bold text-white">
                  A
                </div>
              )}
            </div>

            {/* Navigation */}
            <nav className="flex-1 px-3 py-6 space-y-2">
              <Link
                href="/admin"
                className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-white/10 transition-colors duration-200 text-sm font-medium"
              >
                <LayoutDashboard className="w-5 h-5" />
                {sidebarOpen && <span>Dashboard</span>}
              </Link>

              <Link
                href="/admin/comenzi"
                className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-white/10 transition-colors duration-200 text-sm font-medium"
              >
                <ShoppingCart className="w-5 h-5" />
                {sidebarOpen && <span>Comenzi</span>}
              </Link>

              <Link
                href="/admin/recenzii"
                className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-white/10 transition-colors duration-200 text-sm font-medium"
              >
                <Star className="w-5 h-5" />
                {sidebarOpen && <span>Recenzii</span>}
              </Link>

              <Link
                href="/admin/coduri-reducere"
                className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-white/10 transition-colors duration-200 text-sm font-medium"
              >
                <Ticket className="w-5 h-5" />
                {sidebarOpen && <span>Coduri Reducere</span>}
              </Link>
            </nav>

            {/* Logout Button */}
            <div className="p-3 border-t border-white/10">
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-white/10 transition-colors duration-200 text-sm font-medium text-red-400 hover:text-red-300"
              >
                <LogOut className="w-5 h-5" />
                {sidebarOpen && <span>Deconectare</span>}
              </button>
            </div>

            {/* Toggle Button */}
            <div className="p-3 border-t border-white/10 flex justify-center">
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="p-2 hover:bg-white/10 rounded-lg transition-colors duration-200"
              >
                {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </aside>

          {/* Main Content */}
          <main className="flex-1 overflow-auto bg-background">
            <div className="p-8">
              {children}
            </div>
          </main>
        </div>
  );
}
