"use client";

import { useEffect, useState, useCallback } from "react";
import { Toast, ConfirmModal } from "@/components/ui";

interface War { id: string; opponent: string; date: string; time: string; status: string; result: string | null; guild_score: number | null; opponent_score: number | null; mvp_nick: string | null; }

const emptyWar: War = { id: "", opponent: "", date: "", time: "20:00", status: "upcoming", result: null, guild_score: null, opponent_score: null, mvp_nick: null };

export default function AdminGuerras() {
  const [wars, setWars] = useState<War[]>([]);
  const [editing, setEditing] = useState<War | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [toast, setToast] = useState("");
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  const load = () => fetch("/api/wars").then((r) => r.json()).then(setWars);
  useEffect(() => { load(); }, []);

  const save = async () => {
    if (!editing) return;
    const isNew = editing.id.startsWith("new_");
    const method = isNew ? "POST" : "PUT";
    const body = isNew ? { ...editing, id: undefined } : editing;
    await fetch("/api/wars", { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
    setShowForm(false); setEditing(null); load();
    setToast(isNew ? "Guerra criada!" : "Guerra salva!");
  };

  const remove = async (id: string) => {
    setConfirmDelete(id);
  };

  const confirmRemove = async () => {
    if (!confirmDelete) return;
    await fetch("/api/wars", { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id: confirmDelete }) });
    setConfirmDelete(null);
    setToast("Guerra excluída!");
    load();
  };

  const selectField = (label: string, key: keyof War, options: { value: string; label: string }[]) => (
    <div>
      <label className="block text-xs font-bold text-white/40 uppercase mb-1">{label}</label>
      <select value={String(editing?.[key] ?? "")} onChange={(e) => setEditing((p) => p ? { ...p, [key]: e.target.value || null } : p)} className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-primary/50">
        {options.map((o) => <option key={o.value} value={o.value} className="bg-[#0a0a0f]">{o.label}</option>)}
      </select>
    </div>
  );

  const textField = (label: string, key: keyof War, type = "text") => (
    <div>
      <label className="block text-xs font-bold text-white/40 uppercase mb-1">{label}</label>
      <input type={type} value={String(editing?.[key] ?? "")} onChange={(e) => setEditing((p) => p ? { ...p, [key]: type === "number" ? Number(e.target.value) : e.target.value } : p)} className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-primary/50" />
    </div>
  );

  return (
    <div>
      <Toast message={toast} onClose={() => setToast("")} />
      {confirmDelete && <ConfirmModal message="Tem certeza que deseja excluir esta guerra?" onConfirm={confirmRemove} onCancel={() => setConfirmDelete(null)} />}

      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-black text-white">⚔️ Guerras</h1>
        <button onClick={() => { setEditing({ ...emptyWar, id: `new_${Date.now()}` }); setShowForm(true); }} className="px-4 py-2 rounded-lg bg-primary text-white text-sm font-bold">+ Nova Guerra</button>
      </div>

      {showForm && editing && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4" onClick={() => setShowForm(false)}>
          <div className="w-full max-w-lg rounded-2xl border border-white/10 bg-[#0a0a0f] p-6" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-lg font-bold text-white mb-4">{editing.id.startsWith("new_") ? "Nova" : "Editar"} Guerra</h2>
            <div className="grid grid-cols-2 gap-3">
              {textField("Adversário", "opponent")}
              {textField("Data", "date")}
              {textField("Horário", "time")}
              {selectField("Status", "status", [
                { value: "upcoming", label: "Agendada" },
                { value: "preparation", label: "Preparação" },
                { value: "finished", label: "Finalizada" },
              ])}
              {selectField("Resultado", "result", [
                { value: "", label: "Sem resultado" },
                { value: "victory", label: "Vitória" },
                { value: "defeat", label: "Derrota" },
              ])}
              {textField("Pontos Nossa Guilda", "guild_score", "number")}
              {textField("Pontos Adversário", "opponent_score", "number")}
              {textField("MVP", "mvp_nick")}
            </div>
            <div className="flex gap-3 mt-4">
              <button onClick={save} className="px-6 py-2 rounded-lg bg-primary text-white text-sm font-bold">Salvar</button>
              <button onClick={() => { setShowForm(false); setEditing(null); }} className="px-6 py-2 rounded-lg bg-white/5 text-white/60 text-sm">Cancelar</button>
            </div>
          </div>
        </div>
      )}

      <div className="space-y-2">
        {wars.map((w) => (
          <div key={w.id} className="flex items-center gap-4 rounded-xl border border-white/5 bg-white/[0.02] p-4">
            <div className="flex-1">
              <div className="font-bold text-white text-sm">{w.opponent}</div>
              <div className="text-xs text-white/40">{w.date} — {w.time}</div>
            </div>
            <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${w.result === "victory" ? "bg-emerald-500/10 text-emerald-400" : w.result === "defeat" ? "bg-red-500/10 text-red-400" : "bg-white/5 text-white/40"}`}>
              {w.status === "finished" ? (w.result === "victory" ? "VITÓRIA" : w.result === "defeat" ? "DERROTA" : "FINALIZADA") : w.status === "preparation" ? "PREPARAÇÃO" : "AGENDADA"}
            </span>
            <div className="flex gap-2">
              <button onClick={() => { setEditing(w); setShowForm(true); }} className="px-3 py-1 rounded bg-white/5 text-white/60 text-xs hover:bg-white/10">Editar</button>
              <button onClick={() => remove(w.id)} className="px-3 py-1 rounded bg-red-500/10 text-red-400 text-xs hover:bg-red-500/20">Excluir</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
