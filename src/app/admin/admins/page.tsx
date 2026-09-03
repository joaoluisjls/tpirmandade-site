"use client";

import { useState } from "react";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || "",
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ""
);

interface Admin { email: string; role: string; }

const DEMO_ADMINS: Admin[] = [
  { email: "admin@tpirmandade.com", role: "ADMIN PRINCIPAL" },
];

export default function AdminAdmins() {
  const [admins] = useState<Admin[]>(DEMO_ADMINS);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(""); setSuccess("");

    try {
      const { error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { role: "admin" } },
      });

      if (authError) {
        setError(authError.message);
      } else {
        setSuccess(`Administrador ${email} criado com sucesso!`);
        setEmail(""); setPassword("");
      }
    } catch {
      setError("Erro ao criar administrador");
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-black text-white mb-6">👑 Administradores</h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Lista */}
        <div className="rounded-xl border border-white/5 bg-white/[0.02] p-5">
          <h2 className="text-sm font-bold text-white mb-4">Administradores Cadastrados</h2>
          <div className="space-y-2">
            {admins.map((a) => (
              <div key={a.email} className="flex items-center gap-3 rounded-lg border border-white/5 bg-white/[0.02] p-3">
                <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center text-xs font-bold text-primary">A</div>
                <div className="flex-1">
                  <div className="text-sm text-white">{a.email}</div>
                  <div className="text-xs text-white/30">{a.role}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Criar */}
        <div className="rounded-xl border border-white/5 bg-white/[0.02] p-5">
          <h2 className="text-sm font-bold text-white mb-4">Novo Administrador</h2>
          <p className="text-xs text-white/30 mb-4">Cria um novo login de administrador via Supabase Auth.</p>

          {error && <div className="text-sm text-red-400 bg-red-500/10 rounded-lg px-4 py-2 mb-3">{error}</div>}
          {success && <div className="text-sm text-emerald-400 bg-emerald-500/10 rounded-lg px-4 py-2 mb-3">{success}</div>}

          <form onSubmit={handleCreate} className="space-y-3">
            <div>
              <label className="block text-xs font-bold text-white/40 uppercase mb-1">E-mail</label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-primary/50" />
            </div>
            <div>
              <label className="block text-xs font-bold text-white/40 uppercase mb-1">Senha</label>
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={6} className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-primary/50" />
            </div>
            <button type="submit" className="px-6 py-2 rounded-lg bg-primary text-white text-sm font-bold">Criar Administrador</button>
          </form>
        </div>
      </div>
    </div>
  );
}
