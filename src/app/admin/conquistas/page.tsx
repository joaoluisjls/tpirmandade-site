"use client";

import { useEffect, useState, useCallback } from "react";
import { Toast, ConfirmModal } from "@/components/ui";

interface Ach { id: string; title: string; description: string; date: string; icon: string; responsible: string; }
const empty: Ach = { id: "", title: "", description: "", date: "", icon: "🏆", responsible: "Toda a guilda" };

export default function AdminConquistas() {
  const [items, setItems] = useState<Ach[]>([]);
  const [editing, setEditing] = useState<Ach | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [toast, setToast] = useState("");
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  const load = () => fetch("/api/achievements", { cache: "no-store" }).then((r) => r.json()).then(setItems);
  useEffect(() => { load(); }, []);

  const save = async () => {
    if (!editing) return;
    const isNew = editing.id.startsWith("new_");
    const method = isNew ? "POST" : "PUT";
    const body = isNew ? { ...editing, id: undefined } : editing;
    await fetch("/api/achievements", { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
    setShowForm(false); setEditing(null); load();
    setToast(isNew ? "Conquista criada!" : "Conquista atualizada!");
  };

  const remove = async (id: string) => {
    setConfirmDelete(id);
  };

  const confirmRemove = async () => {
    if (!confirmDelete) return;
    await fetch("/api/achievements", { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id: confirmDelete }) });
    setConfirmDelete(null);
    setToast("Conquista excluída!");
    load();
  };

  return (
    <div>
      <Toast message={toast} onClose={() => setToast("")} />
      {confirmDelete && <ConfirmModal message="Tem certeza que deseja excluir esta conquista?" onConfirm={confirmRemove} onCancel={() => setConfirmDelete(null)} />}

      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-black text-white">🎯 Conquistas</h1>
        <button onClick={() => { setEditing({ ...empty, id: `new_${Date.now()}` }); setShowForm(true); }} className="px-4 py-2 rounded-lg bg-primary text-white text-sm font-bold">+ Nova</button>
      </div>

      {showForm && editing && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4" onClick={() => setShowForm(false)}>
          <div className="w-full max-w-lg rounded-2xl border border-white/10 bg-[#0a0a0f] p-6" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-lg font-bold text-white mb-4">Conquista</h2>
            <div className="space-y-3">
              {["icon", "title", "description", "date", "responsible"].map((key) => (
                <div key={key}>
                  <label className="block text-xs font-bold text-white/40 uppercase mb-1">{key}</label>
                  <input type="text" value={String(editing[key as keyof Ach] ?? "")} onChange={(e) => setEditing((p) => p ? { ...p, [key]: e.target.value } : p)} className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-primary/50" />
                </div>
              ))}
            </div>
            <div className="flex gap-3 mt-4">
              <button onClick={save} className="px-6 py-2 rounded-lg bg-primary text-white text-sm font-bold">Salvar</button>
              <button onClick={() => { setShowForm(false); setEditing(null); }} className="px-6 py-2 rounded-lg bg-white/5 text-white/60 text-sm">Cancelar</button>
            </div>
          </div>
        </div>
      )}

      <div className="space-y-2">
        {items.map((a) => (
          <div key={a.id} className="flex items-center gap-4 rounded-xl border border-white/5 bg-white/[0.02] p-4">
            <span className="text-2xl">{a.icon}</span>
            <div className="flex-1">
              <div className="font-bold text-white text-sm">{a.title}</div>
              <div className="text-xs text-white/40">{a.description}</div>
            </div>
            <div className="text-right">
              <div className="text-xs text-white/30">{a.date}</div>
              <div className="text-xs text-white/30">{a.responsible}</div>
            </div>
            <div className="flex gap-2">
              <button onClick={() => { setEditing(a); setShowForm(true); }} className="px-3 py-1 rounded bg-white/5 text-white/60 text-xs">Editar</button>
              <button onClick={() => remove(a.id)} className="px-3 py-1 rounded bg-red-500/10 text-red-400 text-xs">Excluir</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
