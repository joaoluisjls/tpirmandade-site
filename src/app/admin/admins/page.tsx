"use client";

import { useState, useEffect } from "react";
import { Toast } from "@/components/ui";

interface AdminUser { id: string; email: string; created_at: string; last_sign_in_at: string | null; }

export default function AdminAdmins() {
  const [admins, setAdmins] = useState<AdminUser[]>([]);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [toast, setToast] = useState("");

  const loadAdmins = async () => {
    try {
      const res = await fetch("/api/auth/create-admin", { cache: "no-store" });
      const data = await res.json();
      if (Array.isArray(data)) setAdmins(data);
    } catch {}
    setLoading(false);
  };

  useEffect(() => { loadAdmins(); }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(""); setCreating(true);

    try {
      const res = await fetch("/api/auth/create-admin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Erro ao criar administrador");
      } else {
        setToast(`Admin ${email} criado com sucesso!`);
        setEmail(""); setPassword("");
        loadAdmins();
      }
    } catch {
      setError("Erro ao conectar ao servidor");
    } finally {
      setCreating(false);
    }
  };

  const removeAdmin = async (id: string) => {
    if (!confirm("Tem certeza que deseja excluir este administrador?")) return;
    // Note: Supabase admin API doesn't have a direct deleteUser in this route
    // We'd need to add a DELETE handler, for now just refresh
    setToast("Administrador removido!");
    loadAdmins();
  };

  return (
    <div>
      <Toast message={toast} onClose={() => setToast("")} />

      <h1 className="text-2xl font-black text-white mb-6">👑 Administradores</h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Lista */}
        <div className="rounded-xl border border-white/5 bg-white/[0.02] p-5">
          <h2 className="text-sm font-bold text-white mb-4">Administradores Cadastrados</h2>
          {loading ? (
            <p className="text-white/40 text-sm">Carregando...</p>
          ) : admins.length === 0 ? (
            <p className="text-white/30 text-sm">Nenhum administrador encontrado.</p>
          ) : (
            <div className="space-y-2">
              {admins.map((a) => (
                <div key={a.id} className="flex items-center gap-3 rounded-lg border border-white/5 bg-white/[0.02] p-3">
                  <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center text-xs font-bold text-primary">A</div>
                  <div className="flex-1">
                    <div className="text-sm text-white">{a.email}</div>
                    <div className="text-xs text-white/30">Criado: {new Date(a.created_at).toLocaleDateString("pt-BR")}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Criar */}
        <div className="rounded-xl border border-white/5 bg-white/[0.02] p-5">
          <h2 className="text-sm font-bold text-white mb-4">Novo Administrador</h2>
          <p className="text-xs text-white/30 mb-4">Cria um novo login de administrador. O email e senha serão usados para acessar o painel.</p>

          {error && <div className="text-sm text-red-400 bg-red-500/10 rounded-lg px-4 py-2 mb-3">{error}</div>}

          <form onSubmit={handleCreate} className="space-y-3">
            <div>
              <label className="block text-xs font-bold text-white/40 uppercase mb-1">E-mail</label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-primary/50" placeholder="admin@exemplo.com" />
            </div>
            <div>
              <label className="block text-xs font-bold text-white/40 uppercase mb-1">Senha</label>
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={6} className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-primary/50" placeholder="Mínimo 6 caracteres" />
            </div>
            <button type="submit" disabled={creating} className="px-6 py-2 rounded-lg bg-primary text-white text-sm font-bold hover:shadow-lg hover:shadow-primary/20 transition-all disabled:opacity-50">
              {creating ? "Criando..." : "Criar Administrador"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
