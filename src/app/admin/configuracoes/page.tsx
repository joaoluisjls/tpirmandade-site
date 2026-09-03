"use client";

import { useEffect, useState, useCallback } from "react";
import { Toast, ConfirmModal } from "@/components/ui";

export default function AdminConfiguracoes() {
  const [settings, setSettings] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState("");

  useEffect(() => {
    fetch("/api/settings").then((r) => r.json()).then((d) => { setSettings(d); setLoading(false); });
  }, []);

  const save = async () => {
    setSaving(true);
    await fetch("/api/settings", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(settings) });
    setSaving(false);
    setToast("Configurações salvas!");
  };

  const field = (label: string, key: string, type = "text") => (
    <div>
      <label className="block text-xs font-bold text-white/40 uppercase tracking-wider mb-1">{label}</label>
      <input type={type} value={settings[key] || ""} onChange={(e) => setSettings({ ...settings, [key]: e.target.value })} className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-primary/50" />
    </div>
  );

  if (loading) return <p className="text-white/40">Carregando...</p>;

  return (
    <div>
      <Toast message={toast} onClose={() => setToast("")} />

      <h1 className="text-2xl font-black text-white mb-6">⚙️ Configurações</h1>

      <div className="max-w-2xl space-y-6">
        <div className="rounded-xl border border-white/5 bg-white/[0.02] p-5">
          <h2 className="text-sm font-bold text-white mb-4">Identidade da Guilda</h2>
          <div className="grid grid-cols-2 gap-3">
            {field("Nome da Guilda", "guild_name")}
            {field("Tag", "guild_tag")}
            {field("Slogan", "guild_slogan")}
            {field("Motto", "guild_motto")}
            <div className="col-span-2">{field("Descrição", "guild_description")}</div>
          </div>
        </div>

        <div className="rounded-xl border border-white/5 bg-white/[0.02] p-5">
          <h2 className="text-sm font-bold text-white mb-4">Redes Sociais</h2>
          <div className="grid grid-cols-2 gap-3">
            {field("Discord", "discord")}
            {field("Instagram", "instagram")}
            {field("TikTok", "tiktok")}
            {field("YouTube", "youtube")}
            {field("WhatsApp", "whatsapp")}
          </div>
        </div>

        <div className="rounded-xl border border-white/5 bg-white/[0.02] p-5">
          <h2 className="text-sm font-bold text-white mb-4">Aparência</h2>
          <div className="grid grid-cols-2 gap-3">
            {field("Cor Principal", "primary_color", "color")}
            {field("Cor Destaque", "accent_color", "color")}
          </div>
        </div>

        <button onClick={save} disabled={saving} className="px-8 py-3 rounded-xl bg-primary text-white font-bold text-sm hover:shadow-lg hover:shadow-primary/20 transition-all disabled:opacity-50">
          {saving ? "Salvando..." : "SALVAR CONFIGURAÇÕES"}
        </button>
      </div>
    </div>
  );
}
