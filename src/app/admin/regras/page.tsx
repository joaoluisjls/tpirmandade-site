"use client";

import { useEffect, useState, useCallback } from "react";
import { Toast, ConfirmModal } from "@/components/ui";

interface Rule { id: number; text: string; category: string; highlighted: boolean; }

export default function AdminRegras() {
  const [rules, setRules] = useState<Rule[]>([]);
  const [editing, setEditing] = useState<Rule | null>(null);
  const [toast, setToast] = useState("");
  const [confirmDelete, setConfirmDelete] = useState<number | null>(null);

  const load = () => fetch("/api/rules", { cache: "no-store" }).then((r) => r.json()).then(setRules);
  useEffect(() => { load(); }, []);

  const save = async () => {
    if (!editing) return;
    await fetch("/api/rules", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(editing) });
    setEditing(null); load();
    setToast("Regra salva!");
  };

  const add = async () => {
    const maxId = rules.length > 0 ? Math.max(...rules.map((r) => r.id)) : 0;
    const newRule: Rule = { id: maxId + 1, text: "Nova regra", category: "conduta", highlighted: false };
    await fetch("/api/rules", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(newRule) });
    load();
    setToast("Regra criada!");
  };

  const remove = async (id: number) => {
    setConfirmDelete(id);
  };

  const confirmRemove = async () => {
    if (!confirmDelete) return;
    await fetch("/api/rules", { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id: confirmDelete }) });
    setConfirmDelete(null);
    setToast("Regra excluída!");
    load();
  };

  return (
    <div>
      <Toast message={toast} onClose={() => setToast("")} />
      {confirmDelete && <ConfirmModal message="Tem certeza que deseja excluir esta regra?" onConfirm={confirmRemove} onCancel={() => setConfirmDelete(null)} />}

      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-black text-white">📜 Regras</h1>
        <button onClick={add} className="px-4 py-2 rounded-lg bg-primary text-white text-sm font-bold">+ Nova</button>
      </div>

      <div className="space-y-2">
        {rules.map((r) => (
          <div key={r.id} className="flex items-center gap-4 rounded-xl border border-white/5 bg-white/[0.02] p-4">
            <span className="text-white/30 font-black text-sm w-6">{r.id}</span>
            {editing?.id === r.id ? (
              <div className="flex-1 flex items-center gap-3">
                <input type="text" value={editing.text} onChange={(e) => setEditing({ ...editing, text: e.target.value })} className="flex-1 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-primary/50" />
                <select value={editing.category} onChange={(e) => setEditing({ ...editing, category: e.target.value })} className="px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-white text-sm">
                  <option value="respeito" className="bg-[#0a0a0f]">Respeito</option>
                  <option value="participação" className="bg-[#0a0a0f]">Participação</option>
                  <option value="conduta" className="bg-[#0a0a0f]">Conduta</option>
                  <option value="evolução" className="bg-[#0a0a0f]">Evolução</option>
                </select>
                <label className="flex items-center gap-1 text-xs text-white/40"><input type="checkbox" checked={editing.highlighted} onChange={(e) => setEditing({ ...editing, highlighted: e.target.checked })} className="rounded" /> Destaque</label>
                <button onClick={save} className="px-3 py-1 rounded bg-emerald-500/10 text-emerald-400 text-xs">Salvar</button>
                <button onClick={() => setEditing(null)} className="px-3 py-1 rounded bg-white/5 text-white/40 text-xs">Cancelar</button>
              </div>
            ) : (
              <>
                <div className="flex-1">
                  <span className="text-white/80 text-sm">{r.text}</span>
                  <span className="ml-2 text-xs text-white/30">{r.category}{r.highlighted ? " ⭐" : ""}</span>
                </div>
                <button onClick={() => setEditing(r)} className="px-3 py-1 rounded bg-white/5 text-white/60 text-xs">Editar</button>
                <button onClick={() => remove(r.id)} className="px-3 py-1 rounded bg-red-500/10 text-red-400 text-xs">Excluir</button>
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
