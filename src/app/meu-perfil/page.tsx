"use client";

import { useState, useRef } from "react";

interface PlayerData {
  id: string;
  nick: string;
  name: string;
  avatar: string;
  bio: string;
  phone: string;
  email: string;
}

export default function MeuPerfilPage() {
  const [step, setStep] = useState<"login" | "edit">("login");
  const [nick, setNick] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState("");
  const [player, setPlayer] = useState<PlayerData | null>(null);
  const [form, setForm] = useState({ name: "", bio: "", phone: "", email: "", avatar: "" });
  const [preview, setPreview] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nick) { setError("Digite seu nick"); return; }
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`/api/player-profile?nick=${encodeURIComponent(nick)}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Jogador nao encontrado");
      setPlayer(data);
      setForm({ name: data.name || "", bio: data.bio || "", phone: data.phone || "", email: data.email || "", avatar: data.avatar || "" });
      setPreview(data.avatar || "");
      setStep("edit");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handlePhoto = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) { setError("Foto muito grande (max 2MB)"); return; }
    const reader = new FileReader();
    reader.onload = () => { setPreview(reader.result as string); setForm({ ...form, avatar: reader.result as string }); };
    reader.readAsDataURL(file);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!player) return;
    setSaving(true);
    setError("");
    try {
      const res = await fetch("/api/player-profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: player.id, ...form }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Erro ao salvar");
      setToast("Perfil atualizado com sucesso!");
      setPlayer({ ...player, ...data });
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  if (step === "edit" && player) {
    return (
      <div className="pt-28 pb-20">
        <div className="max-w-lg mx-auto px-4">
          {toast && (
            <div className="fixed top-4 right-4 z-[100] bg-green-500 text-white px-4 py-3 rounded-lg shadow-lg flex items-center gap-3">
              <span className="text-sm font-bold">{toast}</span>
              <button onClick={() => setToast("")} className="text-white/70 hover:text-white text-lg leading-none">&times;</button>
            </div>
          )}

          <div className="text-center mb-6">
            <h1 className="text-2xl font-black text-white">Meu Perfil</h1>
            <p className="text-white/40 text-sm mt-1">Atualize suas informacoes, {player.nick}</p>
          </div>

          <form onSubmit={handleSave} className="rounded-2xl border border-white/5 bg-white/[0.02] p-6 space-y-4">
            {error && <div className="text-sm text-red-400 bg-red-500/10 rounded-lg px-4 py-2">{error}</div>}

            <div className="text-center">
              <div className="relative inline-block">
                {preview ? (
                  <img src={preview} alt="Avatar" className="w-24 h-24 rounded-full object-cover border-2 border-white/10" />
                ) : (
                  <div className="w-24 h-24 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center font-black text-2xl text-white">
                    {player.nick[0]}
                  </div>
                )}
                <input ref={fileRef} type="file" accept="image/*" onChange={handlePhoto} className="hidden" />
                <button type="button" onClick={() => fileRef.current?.click()} className="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-primary flex items-center justify-center text-white text-sm hover:bg-primary-dark transition-colors">
                  ✎
                </button>
              </div>
              <p className="text-white/20 text-xs mt-2">Clique no icone pra trocar a foto</p>
            </div>

            <div>
              <label className="block text-xs font-bold text-white/40 uppercase tracking-wider mb-1.5">Nome</label>
              <input type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="w-full px-3 py-2.5 rounded-lg bg-white/5 border border-white/10 text-white text-sm placeholder:text-white/20 focus:outline-none focus:border-primary/50" placeholder="Seu nome" />
            </div>

            <div>
              <label className="block text-xs font-bold text-white/40 uppercase tracking-wider mb-1.5">WhatsApp</label>
              <input type="text" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className="w-full px-3 py-2.5 rounded-lg bg-white/5 border border-white/10 text-white text-sm placeholder:text-white/20 focus:outline-none focus:border-primary/50" placeholder="(00) 00000-0000" />
            </div>

            <div>
              <label className="block text-xs font-bold text-white/40 uppercase tracking-wider mb-1.5">Email</label>
              <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="w-full px-3 py-2.5 rounded-lg bg-white/5 border border-white/10 text-white text-sm placeholder:text-white/20 focus:outline-none focus:border-primary/50" placeholder="seu@email.com" />
            </div>

            <div>
              <label className="block text-xs font-bold text-white/40 uppercase tracking-wider mb-1.5">Bio</label>
              <textarea value={form.bio} onChange={(e) => setForm({ ...form, bio: e.target.value })} rows={3} className="w-full px-3 py-2.5 rounded-lg bg-white/5 border border-white/10 text-white text-sm placeholder:text-white/20 focus:outline-none focus:border-primary/50 resize-none" placeholder="Conte um pouco sobre voce..." />
            </div>

            <div className="flex gap-3 pt-2">
              <button type="button" onClick={() => { setStep("login"); setPlayer(null); setNick(""); }} className="flex-1 py-3 rounded-xl bg-white/5 border border-white/10 text-white/60 font-bold text-sm hover:bg-white/10 transition-all">
                Sair
              </button>
              <button type="submit" disabled={saving} className="flex-1 py-3 rounded-xl bg-gradient-to-r from-primary to-primary-dark text-white font-bold text-sm hover:shadow-lg hover:shadow-primary/20 transition-all disabled:opacity-50">
                {saving ? "Salvando..." : "SALVAR"}
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-28 pb-20">
      <div className="max-w-sm mx-auto px-4">
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl">👤</span>
          </div>
          <h1 className="text-2xl font-black text-white">Meu Perfil</h1>
          <p className="text-white/40 text-sm mt-1">Acesse para atualizar suas informacoes</p>
        </div>

        <form onSubmit={handleLogin} className="rounded-2xl border border-white/5 bg-white/[0.02] p-6 space-y-4">
          {error && <div className="text-sm text-red-400 bg-red-500/10 rounded-lg px-4 py-2">{error}</div>}

          <div>
            <label className="block text-xs font-bold text-white/40 uppercase tracking-wider mb-1.5">Seu Nick</label>
            <input type="text" value={nick} onChange={(e) => setNick(e.target.value)} required className="w-full px-3 py-2.5 rounded-lg bg-white/5 border border-white/10 text-white text-sm placeholder:text-white/20 focus:outline-none focus:border-primary/50" placeholder="Ex: CORINGA" />
          </div>

          <button type="submit" disabled={loading} className="w-full py-3 rounded-xl bg-gradient-to-r from-primary to-primary-dark text-white font-bold text-sm hover:shadow-lg hover:shadow-primary/20 transition-all disabled:opacity-50">
            {loading ? "Buscando..." : "ACESSAR MEU PERFIL"}
          </button>
        </form>
      </div>
    </div>
  );
}
