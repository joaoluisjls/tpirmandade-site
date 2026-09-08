"use client";

import { useEffect, useState } from "react";
import { Toast } from "@/components/ui";
import { getSupabase } from "@/lib/supabase-browser";

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
  avatar?: string;
}

export default function AdminGuildaPage() {
  const [settings, setSettings] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState("");
  const [players, setPlayers] = useState<Player[]>([]);

  useEffect(() => {
    const load = async () => {
      try {
        const settingsRes = await fetch("/api/settings", { cache: "no-store" });
        const s = await settingsRes.json();
        setSettings(s);

        const { data: playersData, error } = await getSupabase()
          .from("players")
          .select("id, nick, name, role, avatar")
          .order("nick", { ascending: true });

        if (error) console.error("Supabase players error:", error.message);
        setPlayers(playersData || []);
      } catch (err: any) {
        console.error("Load error:", err);
      }
      setLoading(false);
    };
    load();
  }, []);

  const update = (key: string, value: string) => setSettings({ ...settings, [key]: value });

  const save = async () => {
    setSaving(true);
    const payload = {
      guild_name: settings.guild_name || "",
      guild_tag: settings.guild_tag || "",
      guild_slogan: settings.guild_slogan || "",
      guild_motto: settings.guild_motto || "",
      guild_description: settings.guild_description || "",
      discord: settings.discord || "",
      instagram: settings.instagram || "",
      tiktok: settings.tiktok || "",
      youtube: settings.youtube || "",
      whatsapp: settings.whatsapp || "",
      guild_owner_nick: settings.guild_owner_nick || "",
      guild_admin_nicks: settings.guild_admin_nicks || "",
    };
    console.log("Saving guild settings:", payload);
    const res = await fetch("/api/settings", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    console.log("Save response:", data);

    for (const [key, value] of Object.entries(payload)) {
      await getSupabase().from("guild_settings").upsert({ key, value: String(value) });
    }
    console.log("Direct Supabase save done");

    setSaving(false);
    setToast("Informações da guilda salvas!");
  };

  const ownerNick = settings.guild_owner_nick || "";
  const adminNicks = (settings.guild_admin_nicks || "").split(",").map((s) => s.trim()).filter(Boolean);

  const toggleAdmin = (nick: string) => {
    const current = adminNicks;
    const next = current.includes(nick) ? current.filter((n) => n !== nick) : [...current, nick];
    update("guild_admin_nicks", next.join(", "));
  };

  const ownerPlayer = players.find((p) => p.nick === ownerNick);

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

            <div className="mb-4">
              <label className="block text-xs font-bold text-white/40 uppercase tracking-wider mb-1">Dono da Guilda</label>
              <select value={ownerNick} onChange={(e) => update("guild_owner_nick", e.target.value)} className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-primary/50">
                <option value="">Selecionar dono...</option>
                {players.map((p) => (
                  <option key={p.id} value={p.nick}>{p.nick} ({p.name})</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-white/40 uppercase tracking-wider mb-2">Administradores</label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {players.filter((p) => p.nick !== ownerNick).map((p) => {
                  const selected = adminNicks.includes(p.nick);
                  return (
                    <button key={p.id} onClick={() => toggleAdmin(p.nick)} className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-sm text-left transition-all ${selected ? "bg-primary/10 border-primary/40 text-primary" : "bg-white/[0.02] border-white/5 text-white/50 hover:border-white/20"}`}>
                      <div className="w-8 h-8 rounded-lg overflow-hidden shrink-0 bg-white/10 flex items-center justify-center text-xs font-bold">
                        {p.avatar ? <img src={p.avatar} alt={p.nick} className="w-full h-full object-cover" /> : p.nick.charAt(0)}
                      </div>
                      <div className="min-w-0">
                        <div className="font-bold text-xs truncate">{p.nick}</div>
                        <div className="text-[10px] opacity-60 truncate">{p.name}</div>
                      </div>
                      {selected && <span className="ml-auto text-xs">✓</span>}
                    </button>
                  );
                })}
              </div>
              {adminNicks.length > 0 && (
                <p className="text-[10px] text-primary mt-2">{adminNicks.length} admin(s) selecionado(s)</p>
              )}
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
            <h2 className="text-sm font-bold text-white mb-4">Pré-visualização — Liderança</h2>
            <div className="flex flex-col items-center gap-3">
              {ownerPlayer && (
                <div className="flex flex-col items-center">
                  {ownerPlayer.avatar ? <img src={ownerPlayer.avatar} alt={ownerPlayer.nick} className="w-14 h-14 rounded-xl object-cover ring-2 ring-yellow-500/40" /> : <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-yellow-500 to-orange-500 flex items-center justify-center text-xl font-black text-white">{ownerPlayer.nick.charAt(0)}</div>}
                  <span className="text-xs font-bold text-yellow-400 mt-1">{ownerPlayer.nick}</span>
                  <span className="text-[9px] text-white/30">👑 Dono</span>
                </div>
              )}
              {adminNicks.length > 0 && (
                <>
                  <div className="w-16 h-px bg-white/10" />
                  <div className="flex flex-wrap justify-center gap-3">
                    {adminNicks.map((nick) => {
                      const p = players.find((x) => x.nick === nick);
                      return (
                        <div key={nick} className="flex flex-col items-center">
                          {p?.avatar ? <img src={p.avatar} alt={nick} className="w-10 h-10 rounded-lg object-cover ring-1 ring-primary/30" /> : <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center text-sm font-bold text-primary">{nick.charAt(0)}</div>}
                          <span className="text-[10px] font-bold text-primary mt-1">{nick}</span>
                          <span className="text-[8px] text-white/20">🛡️ Admin</span>
                        </div>
                      );
                    })}
                  </div>
                </>
              )}
              {!ownerPlayer && adminNicks.length === 0 && (
                <p className="text-xs text-white/20">Nenhuma liderança definida</p>
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
