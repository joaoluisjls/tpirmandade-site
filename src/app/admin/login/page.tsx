"use client";

import { useState } from "react";

export default function AdminLoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
        credentials: "include",
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Credenciais inválidas");
      } else {
        window.location.href = "/admin/dashboard";
      }
    } catch {
      setError("Erro ao conectar ao servidor");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <img src="/logo.jpg" alt="TP&IRMANDADE" className="w-14 h-14 rounded-xl object-cover mx-auto mb-4" />
          <h1 className="text-2xl font-black text-white">Painel Admin</h1>
          <p className="text-sm text-white/40 mt-1">TP&IRMANDADE</p>
        </div>

        <form onSubmit={handleSubmit} className="rounded-2xl border border-white/5 bg-white/[0.02] p-6 space-y-4">
          {error && <div className="text-sm text-red-400 bg-red-500/10 rounded-lg px-4 py-2">{error}</div>}

          <div>
            <label className="block text-xs font-bold text-white/40 uppercase tracking-wider mb-1.5">E-mail</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required className="w-full px-3 py-2.5 rounded-lg bg-white/5 border border-white/10 text-white text-sm placeholder:text-white/20 focus:outline-none focus:border-primary/50" placeholder="admin@exemplo.com" />
          </div>

          <div>
            <label className="block text-xs font-bold text-white/40 uppercase tracking-wider mb-1.5">Senha</label>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required className="w-full px-3 py-2.5 rounded-lg bg-white/5 border border-white/10 text-white text-sm placeholder:text-white/20 focus:outline-none focus:border-primary/50" placeholder="Sua senha" />
          </div>

          <button type="submit" disabled={loading} className="w-full py-3 rounded-xl bg-gradient-to-r from-primary to-primary-dark text-white font-bold text-sm hover:shadow-lg hover:shadow-primary/20 transition-all disabled:opacity-50">
            {loading ? "Entrando..." : "ENTRAR"}
          </button>
        </form>
      </div>
    </div>
  );
}
