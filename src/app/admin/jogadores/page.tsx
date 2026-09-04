"use client";

import { useEffect, useState, useRef } from "react";
import { Toast, ConfirmModal } from "@/components/ui";

interface Player {
  id: string; nick: string; name: string; role: string; status: string;
  points: number; bio: string; joined_at: string; avatar: string;
}

interface ContactInfo { whatsapp: string; ff_id: string; age: number; experience: string; email: string; roles: string[]; }

const ROLE_OPTIONS = [
  { id: "fullgas", label: "Full Gas" },
  { id: "rush", label: "Rush" },
  { id: "suporte", label: "Suporte" },
  { id: "capitao", label: "Capitao" },
  { id: "granadeiro", label: "Granadeiro" },
  { id: "curandeiro", label: "Curandeiro" },
];

async function fetchContacts(): Promise<Record<string, ContactInfo>> {
  try {
    const res = await fetch("/api/player-contacts", { cache: "no-store" });
    const data = await res.json();
    return data || {};
  } catch { return {}; }
}

const emptyPlayer: Player = {
  id: "", nick: "", name: "", role: "Membro", status: "offline",
  points: 0, bio: "", joined_at: "", avatar: "",
};

const emptyContact: ContactInfo = { whatsapp: "", ff_id: "", age: 0, experience: "", email: "", roles: [] };

export default function AdminJogadores() {
  const [players, setPlayers] = useState<Player[]>([]);
  const [contacts, setContacts] = useState<Record<string, ContactInfo>>({});
  const [editing, setEditing] = useState<Player | null>(null);
  const [editContact, setEditContact] = useState<ContactInfo>(emptyContact);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState("");
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const load = async () => {
    try {
      const [playersRes, contactsData] = await Promise.all([
        fetch("/api/players", { cache: "no-store" }),
        fetchContacts(),
      ]);
      const playersData = await playersRes.json();
      setPlayers(playersData);
      setContacts(contactsData);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const handlePhoto = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) { setToast("Foto muito grande (max 2MB)"); return; }
    const reader = new FileReader();
    reader.onload = () => setEditing(p => p ? { ...p, avatar: reader.result as string } : p);
    reader.readAsDataURL(file);
  };

  const toggleRole = (id: string) => {
    setEditContact(prev => {
      const roles = prev.roles || [];
      if (roles.includes(id)) return { ...prev, roles: roles.filter(r => r !== id) };
      if (roles.length >= 3) return prev;
      return { ...prev, roles: [...roles, id] };
    });
  };

  const save = async () => {
    if (!editing) return;
    const isNew = editing.id.startsWith("new_");
    const method = isNew ? "POST" : "PUT";
    const body = isNew ? { ...editing, id: undefined } : editing;
    await fetch("/api/players", { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
    await fetch("/api/player-contacts", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ playerId: editing.id, data: editContact }),
    });
    setShowForm(false);
    setEditing(null);
    setToast(isNew ? "Jogador criado!" : "Jogador salvo!");
    load();
  };

  const remove = async (id: string) => { setConfirmDelete(id); };

  const confirmRemove = async () => {
    if (!confirmDelete) return;
    await fetch("/api/players", { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id: confirmDelete }) });
    await fetch(`/api/player-contacts?playerId=${confirmDelete}`, { method: "DELETE" });
    setConfirmDelete(null);
    setToast("Jogador excluido!");
    load();
  };

  const toggleStatus = async (id: string, newStatus: string) => {
    await fetch("/api/players", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id, status: newStatus }) });
    load();
  };

  const statusColors: Record<string, string> = {
    online: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
    away: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
    offline: "bg-white/5 text-white/30 border-white/10",
  };

  const openEdit = (p: Player) => {
    setEditing(p);
    setEditContact(contacts[p.id] || emptyContact);
    setShowForm(true);
  };

  const openNew = () => {
    setEditing({ ...emptyPlayer, id: `new_${Date.now()}` });
    setEditContact(emptyContact);
    setShowForm(true);
  };

  return (
    <div>
      <Toast message={toast} onClose={() => setToast("")} />
      {confirmDelete && <ConfirmModal message="Tem certeza que deseja excluir este jogador?" onConfirm={confirmRemove} onCancel={() => setConfirmDelete(null)} />}

      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-black text-white">Jogadores</h1>
        <button onClick={openNew} className="px-4 py-2 rounded-lg bg-primary text-white text-sm font-bold hover:shadow-lg hover:shadow-primary/20 transition-all">
          + Adicionar
        </button>
      </div>

      {showForm && editing && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4" onClick={() => setShowForm(false)}>
          <div className="w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-2xl border border-white/10 bg-[#0a0a0f] p-6" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-lg font-bold text-white mb-4">{editing.id.startsWith("new_") ? "Novo Jogador" : "Editar Jogador"}</h2>

            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-white/40 uppercase mb-1">Email *</label>
                  <input type="email" value={editContact.email} onChange={(e) => setEditContact(p => ({ ...p, email: e.target.value }))} className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-primary/50" placeholder="seu@email.com" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-white/40 uppercase mb-1">Nick *</label>
                  <input type="text" value={editing.nick} onChange={(e) => setEditing(p => p ? { ...p, nick: e.target.value } : p)} className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-primary/50" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-white/40 uppercase mb-1">Nome Completo *</label>
                  <input type="text" value={editing.name} onChange={(e) => setEditing(p => p ? { ...p, name: e.target.value } : p)} className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-primary/50" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-white/40 uppercase mb-1">Idade</label>
                  <input type="number" value={editContact.age || ""} onChange={(e) => setEditContact(p => ({ ...p, age: Number(e.target.value) }))} className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-primary/50" placeholder="18" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-white/40 uppercase mb-1">ID Free Fire *</label>
                  <input type="text" value={editContact.ff_id} onChange={(e) => setEditContact(p => ({ ...p, ff_id: e.target.value }))} className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-primary/50" placeholder="123456789" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-white/40 uppercase mb-1">Pontos Atuais da Guerras de Guildas</label>
                  <input type="number" value={editing.points} onChange={(e) => setEditing(p => p ? { ...p, points: Number(e.target.value) } : p)} className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-primary/50" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-white/40 uppercase mb-1">Experiencia</label>
                  <select value={editContact.experience} onChange={(e) => setEditContact(p => ({ ...p, experience: e.target.value }))} className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-primary/50">
                    <option value="" className="bg-[#0a0a0f]">Selecione</option>
                    <option value="iniciante" className="bg-[#0a0a0f]">Iniciante</option>
                    <option value="intermediario" className="bg-[#0a0a0f]">Intermediario</option>
                    <option value="avancado" className="bg-[#0a0a0f]">Avancado</option>
                    <option value="profissional" className="bg-[#0a0a0f]">Profissional</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-white/40 uppercase mb-1">WhatsApp</label>
                  <input type="text" value={editContact.whatsapp} onChange={(e) => setEditContact(p => ({ ...p, whatsapp: e.target.value }))} className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-primary/50" placeholder="(00) 00000-0000" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-white/40 uppercase mb-2">Funcao no Free Fire (ate 3)</label>
                <div className="grid grid-cols-2 gap-2">
                  {ROLE_OPTIONS.map((r) => {
                    const selected = (editContact.roles || []).includes(r.id);
                    return (
                      <button key={r.id} type="button" onClick={() => toggleRole(r.id)}
                        className={`px-3 py-2 rounded-lg border text-sm font-medium transition-all ${selected ? "bg-primary/20 border-primary/50 text-primary" : "bg-white/5 border-white/10 text-white/50 hover:border-white/20"}`}>
                        {r.label}
                      </button>
                    );
                  })}
                </div>
                {(editContact.roles || []).length > 0 && <p className="text-[10px] text-white/20 mt-1">{(editContact.roles || []).length}/3 selecionadas</p>}
              </div>

              <div>
                <label className="block text-xs font-bold text-white/40 uppercase mb-1">Foto de Perfil</label>
                <div className="flex items-center gap-3">
                  <input ref={fileRef} type="file" accept="image/*" onChange={handlePhoto} className="hidden" />
                  <button type="button" onClick={() => fileRef.current?.click()} className="px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white/60 text-sm hover:bg-white/10 transition-colors">
                    {editing.avatar ? "Trocar foto" : "Escolher foto"}
                  </button>
                  {editing.avatar && (
                    <div className="flex items-center gap-2">
                      <img src={editing.avatar} alt="Preview" className="w-10 h-10 rounded-full object-cover border-2 border-white/10" />
                      <button type="button" onClick={() => setEditing(p => p ? { ...p, avatar: "" } : p)} className="text-red-400 text-xs">Remover</button>
                    </div>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-white/40 uppercase mb-1">Cargo</label>
                  <input type="text" value={editing.role} onChange={(e) => setEditing(p => p ? { ...p, role: e.target.value } : p)} className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-primary/50" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-white/40 uppercase mb-1">Status</label>
                  <select value={editing.status} onChange={(e) => setEditing(p => p ? { ...p, status: e.target.value } : p)} className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-primary/50">
                    <option value="online" className="bg-[#0a0a0f]">Online</option>
                    <option value="away" className="bg-[#0a0a0f]">Ausente</option>
                    <option value="offline" className="bg-[#0a0a0f]">Offline</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-white/40 uppercase mb-1">Bio / Observacoes</label>
                <textarea value={editing.bio} onChange={(e) => setEditing(p => p ? { ...p, bio: e.target.value } : p)} rows={2} className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-primary/50 resize-none" />
              </div>
            </div>

            <div className="flex gap-3 mt-4">
              <button onClick={save} className="px-6 py-2 rounded-lg bg-primary text-white text-sm font-bold">Salvar</button>
              <button onClick={() => { setShowForm(false); setEditing(null); }} className="px-6 py-2 rounded-lg bg-white/5 text-white/60 text-sm">Cancelar</button>
            </div>
          </div>
        </div>
      )}

      {loading ? <p className="text-white/40">Carregando...</p> : (
        <div className="rounded-xl border border-white/5 bg-white/[0.02] overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead><tr className="border-b border-white/5">
                <th className="text-left text-xs text-white/40 uppercase px-4 py-3">Jogador</th>
                <th className="text-center text-xs text-white/40 uppercase px-4 py-3">Status</th>
                <th className="text-right text-xs text-white/40 uppercase px-4 py-3">Pontos GG</th>
                <th className="text-left text-xs text-white/40 uppercase px-4 py-3">WhatsApp</th>
                <th className="text-center text-xs text-white/40 uppercase px-4 py-3">Acoes</th>
              </tr></thead>
              <tbody>
                {players.map((p) => (
                  <tr key={p.id} className="border-b border-white/5 last:border-0">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        {p.avatar ? <img src={p.avatar} alt={p.nick} className="w-7 h-7 rounded object-cover" /> : <div className="w-7 h-7 rounded bg-white/10 flex items-center justify-center text-[10px] font-bold text-white">{p.nick.charAt(0)}</div>}
                        <div><div className="font-bold text-white text-sm">{p.nick}</div><div className="text-xs text-white/30">{p.role}</div></div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <select value={p.status} onChange={(e) => toggleStatus(p.id, e.target.value)} className={`px-2 py-1 rounded-full text-xs font-bold border cursor-pointer ${statusColors[p.status] || statusColors.offline}`}>
                        <option value="online" className="bg-[#0a0a0f]">Online</option>
                        <option value="away" className="bg-[#0a0a0f]">Ausente</option>
                        <option value="offline" className="bg-[#0a0a0f]">Offline</option>
                      </select>
                    </td>
                    <td className="px-4 py-3 text-right text-primary font-bold">{p.points}</td>
                    <td className="px-4 py-3 text-xs text-green-400">{contacts[p.id]?.whatsapp || "—"}</td>
                    <td className="px-4 py-3 text-center">
                      <button onClick={() => openEdit(p)} className="px-3 py-1 rounded bg-white/5 text-white/60 text-xs hover:bg-white/10 mr-2">Editar</button>
                      <button onClick={() => remove(p.id)} className="px-3 py-1 rounded bg-red-500/10 text-red-400 text-xs hover:bg-red-500/20">Excluir</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
