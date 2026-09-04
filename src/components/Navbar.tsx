"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { GUILD } from "@/data/guild";

const ALL_NAV_LINKS = [
  { href: "/", label: "Início" },
  { href: "/ranking", label: "Ranking" },
  { href: "/mvp", label: "MVP" },
  { href: "/jogadores", label: "Jogadores" },
  { href: "/guerras", label: "Guerras" },
  { href: "/estatisticas", label: "Estatísticas" },
  { href: "/conquistas", label: "Conquistas" },
  { href: "/regras", label: "Regras" },
  { href: "/recrutamento", label: "Recrutamento", publicOnly: true },
];

export function Navbar() {
  const [open, setOpen] = useState(false);
  const [approved, setApproved] = useState(false);

  useEffect(() => {
    const approved = localStorage.getItem("tpi_user_approved");
    if (approved === "true") setApproved(true);
  }, []);

  const navLinks = approved ? ALL_NAV_LINKS.filter((l) => !(l as any).publicOnly) : ALL_NAV_LINKS;

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-black/80 backdrop-blur-xl border-b border-white/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="flex items-center gap-3">
            <img src="/logo.jpg" alt="TP&IRMANDADE" className="w-9 h-9 rounded-lg object-cover" />
            <span className="hidden sm:block font-bold text-sm text-white">{GUILD.name}</span>
          </Link>

          <nav className="hidden lg:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link key={link.href} href={link.href} className="px-3 py-2 rounded-lg text-sm text-white/50 hover:text-white hover:bg-white/5 transition-colors">
                {link.label}
              </Link>
            ))}
          </nav>

          {!approved && (
            <Link href="/recrutamento" className="hidden lg:inline-flex px-5 py-2 rounded-lg bg-gradient-to-r from-primary to-primary-dark text-white text-sm font-bold hover:shadow-lg hover:shadow-primary/20 transition-all">
              ENTRAR NA GUILDA
            </Link>
          )}

          <button onClick={() => setOpen(!open)} className="lg:hidden p-2 rounded-lg text-white/60 hover:text-white hover:bg-white/5" aria-label="Menu">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {open ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>
      </div>

      {open && (
        <div className="lg:hidden border-t border-white/5 bg-black/95 p-3 space-y-1">
          {navLinks.map((link) => (
            <Link key={link.href} href={link.href} onClick={() => setOpen(false)} className="block px-4 py-2.5 rounded-lg text-sm text-white/50 hover:text-white hover:bg-white/5 transition-colors">
              {link.label}
            </Link>
          ))}
          {!approved && (
            <Link href="/recrutamento" onClick={() => setOpen(false)} className="block text-center px-4 py-2.5 rounded-lg bg-gradient-to-r from-primary to-primary-dark text-white text-sm font-bold mt-2">
              ENTRAR NA GUILDA
            </Link>
          )}
        </div>
      )}
    </header>
  );
}
