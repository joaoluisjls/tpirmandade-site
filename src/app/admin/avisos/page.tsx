"use client";

import { useEffect, useState, useCallback } from "react";
import { Toast, ConfirmModal } from "@/components/ui";

interface Ann { id: string; title: string; content: string; date: string; time: string; priority: string; }
const empty: Ann = { id: "", title: "", content: "", date: "", time: "", priority: "medium" };

export default function AdminAvisos() {
  const [items, setItems] = useState<Ann[]>([]);
  const [editing, setEditing] = useState<Ann | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [toast, setToast] = useState("");
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  const load = () => fetch("/api/announcements").then((r) => r.json()).then(setItems);
  useEffect(() => { load(); }, []);

  const save = async () => {
    if (!editing) return;
    const isNew = editing.id.startsWith("new_");
    const method = isNew ? "POST" : "PUT";
    const body = isNew ? { ...editing, id: undefined } : editing;
    await fetch("/api/announcements", { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
    setShowForm(false); setEditing(null); load();
    setToast(isNew ? "Aviso criado!" : "Aviso atualizado!");
  };

  const remove = async (id: string) => {
    setConfirmDelete(id);
  };

  const confirmRemove = async () => {
    if (!confirmDelete) return;
    await fetch("/api/announcements", { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id: confirmDelete }) });
    setConfirmDelete(null);
    setToast("Aviso excluído!");
    load();
  };

  return (
    <div>
      <Toast message={toast} onClose={() => setToast("")} />
      {confirmDelete && <ConfirmModal message="Tem certeza que deseja excluir este aviso?" onConfirm={confirmRemove} onCancel={() => setConfirmDelete(null)} />}

      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-black text-white">📢 Avisos</h1>
        <button onClick={() => { setEditing({ ...empty, id: `new_${Date.now()}` }); setShowForm(true); }} className="px-4 py-2 rounded-lg bg-primary text-white text-sm font-bold">+ Novo</button>
      </div>

      {showForm && editing && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4" onClick={() => setShowForm(false)}>
          <div className="w-full max-w-lg rounded-2xl border border-white/10 bg-[#0a0a0f] p-6" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-lg font-bold text-white mb-4">Aviso</h2>
            <div className="space-y-3">
              <div><label className="block text-xs font-bold text-white/40 uppercase mb-1">Título</label><input type="text" value={editing.title} onChange={(e) => setEditing({ ...editing, title: e.target.value })} className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-primary/50" /></div>
              <div><label className="block text-xs font-bold text-white/40 uppercase mb-1">Conteúdo</label><textarea value={editing.content} onChange={(e) => setEditing({ ...editing, content: e.target.value })} rows={3} className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-primary/50 resize-none" /></div>
              <div className="grid grid-cols-3 gap-3">
                <div><label className="block text-xs font-bold text-white/40 uppercase mb-1">Data</label><input type="text" value={editing.date} onChange={(e) => setEditing({ ...editing, date: e.target.value })} className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-primary/50" /></div>
                <div><label className="block text-xs font-bold text-white/40 uppercase mb-1">Hora</label><input type="text" value={editing.time} onChange={(e) => setEditing({ ...editing, time: e.target.value })} className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-primary/50" /></div>
                <div><label className="block text-xs font-bold text-white/40 uppercase mb-1">Prioridade</label><select value={editing.priority} onChange={(e) => setEditing({ ...editing, priority: e.target.value })} className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-primary/50"><option value="low" className="bg-[#0a0a0f]">Baixa</option><option value="medium" className="bg-[#0a0a0f]">Média</option><option value="high" className="bg-[#0a0a0f]">Alta</option></select></div>
              </div>
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
            <div className="flex-1">
              <div className="font-bold text-white text-sm">{a.title}</div>
              <div className="text-xs text-white/40 line-clamp-1">{a.content}</div>
            </div>
            <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${a.priority === "high" ? "bg-red-500/10 text-red-400" : a.priority === "medium" ? "bg-accent/10 text-accent" : "bg-white/5 text-white/30"}`}>{a.priority}</span>
            <div className="text-xs text-white/30">{a.date}</div>
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
