"use client";

import { useEffect, useState } from "react";
import { Toast } from "@/components/ui";

const SOCIAL_FIELDS = [
  { label: "Discord", key: "discord", icon: "💬", placeholder: "https://discord.gg/..." },
  { label: "Instagram", key: "instagram", icon: "📷", placeholder: "https://instagram.com/..." },
  { label: "TikTok", key: "tiktok", icon: "🎵", placeholder: "https://tiktok.com/@" },
  { label: "YouTube", key: "youtube", icon: "🎬", placeholder: "https://youtube.com/@" },
  { label: "WhatsApp", key: "whatsapp", icon: "📱", placeholder: "+55 11 99999-9999" },
];

interface Player {
  id: string;
  nick: string;
  name: string;
  role: string;
}

export default function AdminGuildaPage() {
  const [settings, setSettings] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState("");
  const [players, setPlayers] = useState<Player[]>([]);

  useEffect(() => {
    Promise.all([
      fetch("/api/settings").then((r) => r.json()),
      fetch("/api/players").then((r) => r.json()),
    ]).then(([s, p]) => {
      setSettings(s);
      setPlayers(Array.isArray(p) ? p : []);
      setLoading(false);
    });
  }, []);

  const update = (key: string, value: string) => setSettings({ ...settings, [key]: value });

  const save = async () => {
    setSaving(true);
    await fetch("/api/settings", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(settings),
    });
    setSaving(false);
    setToast("Informações da guilda salvas!");
  };

  const ownerNick = settings.guild_owner_nick || "";
  const adminNicks = (settings.guild_admin_nicks || "").split(",").map((s) => s.trim()).filter(Boolean);

  if (loading) return <p className="text-white/40">Carregando...</p>;

  return (
    <div>
      <Toast message={toast} onClose={() => setToast("")} />

      <h1 className="text-2xl font-black text-white mb-6">🏰 Guilda</h1>

      <div className="max-w-4xl grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="rounded-xl border border-white/5 bg-white/[0.02] p-5">
            <h2 className="text-sm font-bold text-white mb-4">Identidade</h2>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-white/40 uppercase tracking-wider mb-1">Nome da Guilda</label>
                <input value={settings.guild_name || ""} onChange={(e) => update("guild_name", e.target.value)} className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-primary/50" />
              </div>
              <div>
                <label className="block text-xs font-bold text-white/40 uppercase tracking-wider mb-1">Tag</label>
                <input value={settings.guild_tag || ""} onChange={(e) => update("guild_tag", e.target.value)} className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-primary/50" />
              </div>
              <div>
                <label className="block text-xs font-bold text-white/40 uppercase tracking-wider mb-1">Slogan</label>
                <input value={settings.guild_slogan || ""} onChange={(e) => update("guild_slogan", e.target.value)} className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-primary/50" placeholder="Frase de efeito" />
              </div>
              <div>
                <label className="block text-xs font-bold text-white/40 uppercase tracking-wider mb-1">Motto</label>
                <input value={settings.guild_motto || ""} onChange={(e) => update("guild_motto", e.target.value)} className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-primary/50" placeholder="Lema oficial" />
              </div>
              <div className="col-span-2">
                <label className="block text-xs font-bold text-white/40 uppercase tracking-wider mb-1">Descrição</label>
                <textarea value={settings.guild_description || ""} onChange={(e) => update("guild_description", e.target.value)} rows={4} className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-primary/50 resize-none" placeholder="Sobre a guilda..." />
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-white/5 bg-white/[0.02] p-5">
            <h2 className="text-sm font-bold text-white mb-4">Liderança</h2>
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-white/40 uppercase tracking-wider mb-1">Nick do Dono</label>
                <select value={ownerNick} onChange={(e) => update("guild_owner_nick", e.target.value)} className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-primary/50">
                  <option value="">Selecionar dono...</option>
                  {players.map((p) => (
                    <option key={p.id} value={p.nick}>{p.nick} ({p.name})</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-white/40 uppercase tracking-wider mb-1">Admins da Guilda (vírgula)</label>
                <input value={settings.guild_admin_nicks || ""} onChange={(e) => update("guild_admin_nicks", e.target.value)} className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-primary/50" placeholder="Ex: DIOGO么T.I, OutroAdmin" />
                <p className="text-[10px] text-white/30 mt-1">Separe os nicks com vírgula. Deixe vazio para nenhum admin.</p>
              </div>
              <div className="rounded-lg bg-white/[0.03] p-3 border border-white/5">
                <p className="text-xs text-white/40 mb-2">Preview da liderança:</p>
                {ownerNick ? (
                  <div className="flex items-center gap-2 text-sm text-yellow-400 font-bold">
                    <span>👑</span> {ownerNick}
                  </div>
                ) : (
                  <p className="text-xs text-white/20">Nenhum dono definido</p>
                )}
                {adminNicks.length > 0 ? (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {adminNicks.map((n) => (
                      <span key={n} className="text-xs px-2 py-1 rounded bg-primary/10 text-primary font-bold">🛡️ {n}</span>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-white/20 mt-1">Nenhum admin definido</p>
                )}
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-white/5 bg-white/[0.02] p-5">
            <h2 className="text-sm font-bold text-white mb-4">Redes Sociais</h2>
            <div className="space-y-3">
              {SOCIAL_FIELDS.map((f) => (
                <div key={f.key} className="flex items-center gap-3">
                  <span className="text-lg w-8 text-center">{f.icon}</span>
                  <div className="flex-1">
                    <label className="block text-xs font-bold text-white/40 uppercase tracking-wider mb-1">{f.label}</label>
                    <input value={settings[f.key] || ""} onChange={(e) => update(f.key, e.target.value)} className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-primary/50" placeholder={f.placeholder} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <button onClick={save} disabled={saving} className="px-8 py-3 rounded-xl bg-primary text-white font-bold text-sm hover:shadow-lg hover:shadow-primary/20 transition-all disabled:opacity-50">
            {saving ? "Salvando..." : "SALVAR"}
          </button>
        </div>

        <div className="space-y-4">
          <div className="rounded-xl border border-white/5 bg-white/[0.02] p-5">
            <h2 className="text-sm font-bold text-white mb-4">Pré-visualização</h2>
            <div className="text-center">
              <img src="/logo.jpg" alt="Logo" className="w-16 h-16 rounded-xl object-cover mx-auto mb-3" />
              <div className="text-lg font-black text-white">{settings.guild_name || "TP&IRMANDADE"}</div>
              <div className="text-xs text-primary font-bold mt-1">Tag: {settings.guild_tag || "T.I"}</div>
              {settings.guild_slogan && <div className="text-xs text-white/40 italic mt-2">&ldquo;{settings.guild_slogan}&rdquo;</div>}
              {settings.guild_motto && <div className="text-[10px] text-primary font-bold uppercase tracking-widest mt-1">{settings.guild_motto}</div>}
            </div>
            {settings.guild_description && (
              <div className="mt-4 text-xs text-white/40 leading-relaxed">{settings.guild_description}</div>
            )}
          </div>

          <div className="rounded-xl border border-white/5 bg-white/[0.02] p-5">
            <h2 className="text-sm font-bold text-white mb-3">Liderança</h2>
            <div className="space-y-2">
              {ownerNick && (
                <div className="flex items-center gap-2 text-xs text-yellow-400 font-bold">
                  <span>👑</span> Dono: {ownerNick}
                </div>
              )}
              {adminNicks.length > 0 && adminNicks.map((n) => (
                <div key={n} className="flex items-center gap-2 text-xs text-primary font-bold">
                  <span>🛡️</span> Admin: {n}
                </div>
              ))}
              {!ownerNick && adminNicks.length === 0 && (
                <p className="text-xs text-white/30">Nenhuma liderança definida</p>
              )}
            </div>
          </div>

          <div className="rounded-xl border border-white/5 bg-white/[0.02] p-5">
            <h2 className="text-sm font-bold text-white mb-3">Links</h2>
            <div className="space-y-2">
              {SOCIAL_FIELDS.filter((f) => settings[f.key]).map((f) => (
                <div key={f.key} className="flex items-center gap-2 text-xs text-white/50">
                  <span>{f.icon}</span>
                  <span className="truncate">{settings[f.key]}</span>
                </div>
              ))}
              {SOCIAL_FIELDS.every((f) => !settings[f.key]) && (
                <p className="text-xs text-white/30">Nenhum link configurado</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
