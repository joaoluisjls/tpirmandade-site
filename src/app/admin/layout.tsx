"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect, useMemo } from "react";

const MENU = [
  { href: "/admin/dashboard", label: "Dashboard", icon: "📊" },
  { href: "/admin/jogadores", label: "Jogadores", icon: "👥" },
  { href: "/admin/pedidos", label: "Pedidos", icon: "📋" },
  { href: "/admin/mvp", label: "MVP", icon: "🏆" },
  { href: "/admin/ranking", label: "Ranking", icon: "🥇" },
  { href: "/admin/guerras", label: "Guerras", icon: "⚔️" },
  { href: "/admin/conquistas", label: "Conquistas", icon: "🎯" },
  { href: "/admin/avisos", label: "Avisos", icon: "📢" },
  { href: "/admin/regras", label: "Regras", icon: "📜" },
  { href: "/admin/configuracoes", label: "Configurações", icon: "⚙️" },
  { href: "/admin/admins", label: "Administradores", icon: "👑" },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [auth, setAuth] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const isLoginPage = useMemo(() => pathname === "/admin/login", [pathname]);

  useEffect(() => {
    if (isLoginPage) return;
    let cancelled = false;

    const checkAuth = () => {
      fetch("/api/auth/check", { credentials: "include" })
        .then((r) => r.json())
        .then((d) => {
          if (cancelled) return;
          if (!d.authenticated) {
            window.location.href = "/admin/login";
          } else {
            setAuth(true);
            localStorage.setItem("tpi_admin_auth", "true");
          }
        })
        .catch(() => {
          if (!cancelled) window.location.href = "/admin/login";
        });
    };

    const cached = localStorage.getItem("tpi_admin_auth");
    if (cached === "true") {
      setAuth(true);
      checkAuth();
    } else {
      checkAuth();
    }

    return () => { cancelled = true; };
  }, [isLoginPage]);

  const handleLogout = async () => {
    localStorage.removeItem("tpi_admin_auth");
    await fetch("/api/auth/logout", { method: "POST", credentials: "include" });
    window.location.href = "/admin/login";
  };

  if (isLoginPage) return <>{children}</>;
  if (!auth) return null;

  return (
    <div className="min-h-screen bg-[#0a0a0f] flex">
      {sidebarOpen && <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />}

      <aside className={`fixed lg:static inset-y-0 left-0 z-50 w-64 bg-black/60 border-r border-white/5 flex flex-col transition-transform ${sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}`}>
        <div className="p-4 border-b border-white/5">
          <Link href="/admin/dashboard" className="flex items-center gap-3">
            <img src="/logo.jpg" alt="TP&IRMANDADE" className="w-9 h-9 rounded-lg object-cover" />
            <div>
              <div className="font-bold text-sm text-white">Admin Panel</div>
              <div className="text-[10px] text-white/30">TP&IRMANDADE</div>
            </div>
          </Link>
        </div>

        <nav className="flex-1 overflow-y-auto p-3 space-y-1">
          {MENU.map((item) => {
            const active = pathname === item.href;
            return (
              <Link key={item.href} href={item.href} onClick={() => setSidebarOpen(false)} className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${active ? "bg-primary/10 text-primary font-medium" : "text-white/40 hover:text-white hover:bg-white/5"}`}>
                <span className="text-base">{item.icon}</span>
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="p-3 border-t border-white/5 space-y-1">
          <Link href="/" target="_blank" className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-white/40 hover:text-white hover:bg-white/5 transition-colors">
            <span>🌐</span> Ver Site
          </Link>
          <button onClick={handleLogout} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-red-400 hover:bg-red-500/10 transition-colors">
            <span>🚪</span> Sair
          </button>
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-h-screen">
        <header className="h-14 border-b border-white/5 flex items-center px-4 gap-4">
          <button onClick={() => setSidebarOpen(!sidebarOpen)} className="lg:hidden p-1.5 rounded-lg text-white/50 hover:text-white hover:bg-white/5">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>
          </button>
          <div className="text-sm text-white/40">Painel Administrativo</div>
        </header>

        <main className="flex-1 overflow-y-auto p-4 sm:p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
