"use client";

import { useState, useEffect, useRef } from "react";
import type { Championship, Participant, Match } from "@/lib/bracket";
import { generateBracket, advanceWinner, resetMatch, getChampion } from "@/lib/bracket";
import { BracketView, BracketViewMobile } from "@/components/BracketView";
import { Toast, ConfirmModal } from "@/components/ui";

const emptyForm = {
  name: "",
  description: "",
  date: "",
  time: "",
  status: "open",
  prize: "",
  rules: "",
  notes: "",
};

export default function AdminCampeonatos() {
  const [championships, setChampionships] = useState<Championship[]>([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<"list" | "edit" | "bracket">("list");
  const [selected, setSelected] = useState<Championship | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [toast, setToast] = useState("");
  const [confirm, setConfirm] = useState<{ msg: string; onYes: () => void } | null>(null);
  const [saving, setSaving] = useState(false);

  const [newParticipant, setNewParticipant] = useState("");
  const [newParticipantLogo, setNewParticipantLogo] = useState("");
  const [editParticipant, setEditParticipant] = useState<{ idx: number; name: string; logo: string } | null>(null);

  const [showMatchModal, setShowMatchModal] = useState<Match | null>(null);
  const [matchScore1, setMatchScore1] = useState("");
  const [matchScore2, setMatchScore2] = useState("");

  const load = async () => {
    try {
      const res = await fetch("/api/championships", { cache: "no-store" });
      const data = await res.json();
      setChampionships(Array.isArray(data) ? data : []);
    } catch {
      setChampionships([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const save = async (champ: Championship) => {
    const res = await fetch("/api/championships", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(champ),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Erro ao salvar");
  };

  const handleCreate = async () => {
    if (!form.name) { setToast("Nome e obrigatorio"); return; }
    setSaving(true);
    try {
      const res = await fetch("/api/championships", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, participants: [], matches: [] }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setToast("Campeonato criado!");
      await load();
      setView("list");
    } catch (e: any) {
      setToast(e.message || "Erro ao criar");
    } finally {
      setSaving(false);
    }
  };

  const handleUpdate = async () => {
    if (!selected) return;
    setSaving(true);
    try {
      await save({ ...selected, ...form } as Championship);
      setToast("Campeonato atualizado!");
      await load();
      const updated = championships.find((c) => c.id === selected.id);
      if (updated) setSelected({ ...updated, ...form } as Championship);
    } catch (e: any) {
      setToast(e.message || "Erro ao atualizar");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = (champ: Championship) => {
    setConfirm({ msg: `Excluir "${champ.name}"?`, onYes: async () => {
      await fetch(`/api/championships?id=${champ.id}`, { method: "DELETE" });
      setToast("Excluido!");
      await load();
      setView("list");
      setSelected(null);
    }});
  };

  const addParticipant = async () => {
    if (!selected || !newParticipant.trim()) return;
    const p: Participant = {
      id: `p_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      name: newParticipant.trim(),
      logo: newParticipantLogo,
    };
    const updated = { ...selected, participants: [...selected.participants, p] };
    if (updated.status === "in_progress" || updated.participants.length >= 2) {
      updated.matches = generateBracket(updated.participants);
    }
    await save(updated);
    setSelected(updated);
    setNewParticipant("");
    setNewParticipantLogo("");
    await load();
  };

  const removeParticipant = (idx: number) => {
    if (!selected) return;
    setConfirm({ msg: `Remover "${selected.participants[idx].name}"?`, onYes: async () => {
      const updated = { ...selected };
      updated.participants = updated.participants.filter((_, i) => i !== idx);
      updated.matches = generateBracket(updated.participants);
      updated.champion = getChampion(updated.matches);
      await save(updated);
      setSelected(updated);
      await load();
    }});
  };

  const startEditParticipant = (idx: number) => {
    if (!selected) return;
    const p = selected.participants[idx];
    setEditParticipant({ idx, name: p.name, logo: p.logo });
  };

  const saveEditParticipant = async () => {
    if (!selected || !editParticipant) return;
    const updated = { ...selected };
    updated.participants = updated.participants.map((p, i) =>
      i === editParticipant.idx ? { ...p, name: editParticipant.name, logo: editParticipant.logo } : p
    );
    updated.matches = generateBracket(updated.participants);
    if (updated.status === "in_progress") {
      for (const m of updated.matches) {
        if (m.participant1) {
          const newP = updated.participants.find((p) => p.id === m.participant1?.id);
          if (newP) m.participant1 = newP;
        }
        if (m.participant2) {
          const newP = updated.participants.find((p) => p.id === m.participant2?.id);
          if (newP) m.participant2 = newP;
        }
      }
    }
    await save(updated);
    setSelected(updated);
    setEditParticipant(null);
    await load();
  };

  const startChampionship = async () => {
    if (!selected) return;
    if (selected.participants.length < 2) { setToast("Minimo 2 participantes"); return; }
    const updated = {
      ...selected,
      status: "in_progress" as const,
      matches: generateBracket(selected.participants),
    };
    await save(updated);
    setSelected(updated);
    setToast("Campeonato iniciado!");
    await load();
  };

  const openMatchModal = (match: Match) => {
    setShowMatchModal(match);
    setMatchScore1(match.score1?.toString() || "");
    setMatchScore2(match.score2?.toString() || "");
  };

  const setWinner = async (matchId: string, winnerId: string) => {
    if (!selected) return;
    const updated = { ...selected };
    updated.matches = advanceWinner(updated.matches, matchId, winnerId);
    updated.champion = getChampion(updated.matches);
    if (updated.champion && updated.status !== "finished") {
      updated.status = "finished";
    }
    await save(updated);
    setSelected(updated);
    setShowMatchModal(null);
    await load();
  };

  const saveMatchScore = async () => {
    if (!selected || !showMatchModal) return;
    const updated = { ...selected };
    const m = updated.matches.find((mm) => mm.id === showMatchModal.id);
    if (m) {
      m.score1 = matchScore1 ? Number(matchScore1) : null;
      m.score2 = matchScore2 ? Number(matchScore2) : null;
    }
    await save(updated);
    setSelected(updated);
    setShowMatchModal(null);
    await load();
  };

  const resetMatchResult = async (matchId: string) => {
    if (!selected) return;
    const updated = { ...selected };
    updated.matches = resetMatch(updated.matches, matchId);
    updated.champion = getChampion(updated.matches);
    updated.status = updated.champion ? "finished" : "in_progress";
    await save(updated);
    setSelected(updated);
    setShowMatchModal(null);
    await load();
  };

  const startNew = () => {
    setForm(emptyForm);
    setView("edit");
    setSelected(null);
  };

  const startEdit = (champ: Championship) => {
    setForm({
      name: champ.name,
      description: champ.description,
      date: champ.date,
      time: champ.time,
      status: champ.status,
      prize: champ.prize,
      rules: champ.rules,
      notes: champ.notes,
    });
    setSelected(champ);
    setView("edit");
  };

  const openBracket = (champ: Championship) => {
    setSelected(champ);
    setView("bracket");
  };

  const tf = (label: string, key: string, type = "text") => (
    <div>
      <label className="block text-xs font-bold text-white/40 uppercase mb-1">{label}</label>
      <input type={type} value={(form as any)[key]} onChange={(e) => setForm({ ...form, [key]: e.target.value })} className="w-full px-3 py-2.5 rounded-lg bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-primary/50" />
    </div>
  );

  const sf = (label: string, key: string, opts: { v: string; l: string }[]) => (
    <div>
      <label className="block text-xs font-bold text-white/40 uppercase mb-1">{label}</label>
      <select value={(form as any)[key]} onChange={(e) => setForm({ ...form, [key]: e.target.value })} className="w-full px-3 py-2.5 rounded-lg bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-primary/50">
        {opts.map((o) => <option key={o.v} value={o.v} className="bg-[#0a0a0f]">{o.l}</option>)}
      </select>
    </div>
  );

  const statusColors: Record<string, string> = {
    open: "bg-green-500/10 text-green-400",
    in_progress: "bg-yellow-500/10 text-yellow-400",
    finished: "bg-red-500/10 text-red-400",
    scheduled: "bg-white/10 text-white/40",
  };
  const statusLabels: Record<string, string> = {
    open: "Inscricoes",
    in_progress: "Andamento",
    finished: "Finalizado",
    scheduled: "Agendado",
  };

  return (
    <div>
      <Toast message={toast} onClose={() => setToast("")} />
      {confirm && <ConfirmModal message={confirm.msg} onConfirm={confirm.onYes} onCancel={() => setConfirm(null)} />}

      {showMatchModal && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4" onClick={() => setShowMatchModal(null)}>
          <div className="bg-[#1a1a2e] border border-white/10 rounded-2xl p-6 max-w-md w-full" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-lg font-bold text-white mb-4">
              {showMatchModal.participant1?.name || "?"} vs {showMatchModal.participant2?.name || "?"}
            </h3>

            {showMatchModal.participant1 && showMatchModal.participant2 && (
              <div className="space-y-2 mb-4">
                <div className="flex items-center gap-3 p-3 rounded-lg bg-white/5">
                  <span className="text-sm text-white/70 flex-1">{showMatchModal.participant1.name}</span>
                  <input type="number" value={matchScore1} onChange={(e) => setMatchScore1(e.target.value)} className="w-16 px-2 py-1 rounded bg-white/5 border border-white/10 text-white text-sm text-center" placeholder="0" />
                  <button onClick={() => setWinner(showMatchModal.id, showMatchModal.participant1!.id)} className="px-3 py-1 rounded bg-green-500 text-white text-xs font-bold hover:bg-green-600">
                    Venceu
                  </button>
                </div>
                <div className="flex items-center gap-3 p-3 rounded-lg bg-white/5">
                  <span className="text-sm text-white/70 flex-1">{showMatchModal.participant2.name}</span>
                  <input type="number" value={matchScore2} onChange={(e) => setMatchScore2(e.target.value)} className="w-16 px-2 py-1 rounded bg-white/5 border border-white/10 text-white text-sm text-center" placeholder="0" />
                  <button onClick={() => setWinner(showMatchModal.id, showMatchModal.participant2!.id)} className="px-3 py-1 rounded bg-green-500 text-white text-xs font-bold hover:bg-green-600">
                    Venceu
                  </button>
                </div>
              </div>
            )}

            <div className="flex gap-2">
              <button onClick={saveMatchScore} className="flex-1 py-2 rounded-lg bg-primary text-white text-sm font-bold hover:bg-primary/80">
                Salvar Placar
              </button>
              {showMatchModal.winner && (
                <button onClick={() => resetMatchResult(showMatchModal.id)} className="px-4 py-2 rounded-lg bg-red-500/10 text-red-400 text-sm font-bold hover:bg-red-500/20">
                  Resetar
                </button>
              )}
            </div>

            <button onClick={() => setShowMatchModal(null)} className="w-full mt-2 py-2 rounded-lg bg-white/5 text-white/40 text-sm hover:bg-white/10">
              Fechar
            </button>
          </div>
        </div>
      )}

      {view === "list" && (
        <>
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-black text-white">Campeonatos</h1>
            <button onClick={startNew} className="px-4 py-2 rounded-lg bg-primary text-white text-sm font-bold hover:bg-primary/80">
              + Criar Campeonato
            </button>
          </div>

          {loading ? <p className="text-white/40">Carregando...</p> : championships.length === 0 ? (
            <div className="text-center py-16 text-white/30">
              <div className="text-4xl mb-3">&#127942;</div>
              <p className="text-sm">Nenhum campeonato criado.</p>
            </div>
          ) : (
            <div className="rounded-xl border border-white/5 bg-white/[0.02] overflow-hidden">
              <table className="w-full text-sm">
                <thead><tr className="border-b border-white/5">
                  <th className="text-left text-xs text-white/40 uppercase px-4 py-3">Campeonato</th>
                  <th className="text-center text-xs text-white/40 uppercase px-4 py-3">Participantes</th>
                  <th className="text-center text-xs text-white/40 uppercase px-4 py-3">Status</th>
                  <th className="text-center text-xs text-white/40 uppercase px-4 py-3">Data</th>
                  <th className="text-center text-xs text-white/40 uppercase px-4 py-3">Acoes</th>
                </tr></thead>
                <tbody>
                  {championships.map((c) => (
                    <tr key={c.id} className="border-b border-white/5 last:border-0 hover:bg-white/[0.02]">
                      <td className="px-4 py-3">
                        <div className="font-bold text-white">🏆 {c.name}</div>
                        {c.champion && <div className="text-[11px] text-yellow-400">Campeao: {c.champion.name}</div>}
                      </td>
                      <td className="px-4 py-3 text-center text-white/60">{c.participants.length}</td>
                      <td className="px-4 py-3 text-center">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${statusColors[c.status]}`}>{statusLabels[c.status]}</span>
                      </td>
                      <td className="px-4 py-3 text-center text-white/50 text-xs">{c.date || "—"}</td>
                      <td className="px-4 py-3 text-center">
                        <div className="flex gap-1 justify-center">
                          <button onClick={() => openBracket(c)} className="px-2 py-1 rounded bg-white/5 text-white/40 text-xs hover:bg-white/10" title="Gerenciar chave">&#9876;</button>
                          <button onClick={() => startEdit(c)} className="px-2 py-1 rounded bg-white/5 text-white/40 text-xs hover:bg-white/10" title="Editar">&#9998;</button>
                          <button onClick={() => handleDelete(c)} className="px-2 py-1 rounded bg-red-500/10 text-red-400 text-xs hover:bg-red-500/20" title="Excluir">&#128465;</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}

      {view === "edit" && (
        <div>
          <div className="flex items-center gap-3 mb-6">
            <button onClick={() => setView("list")} className="text-white/30 hover:text-white text-sm">&#8592;</button>
            <h1 className="text-2xl font-black text-white">{selected ? "Editar" : "Criar"} Campeonato</h1>
          </div>

          <div className="rounded-2xl border border-white/5 bg-white/[0.02] p-6 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {tf("Nome", "name")}
              {tf("Data", "date", "date")}
              {tf("Horario", "time", "time")}
              {tf("Premiacao", "prize")}
            </div>
            {tf("Descricao", "description")}
            {sf("Status", "status", [
              { v: "open", l: "Inscricoes abertas" },
              { v: "scheduled", l: "Agendado" },
              { v: "in_progress", l: "Em andamento" },
              { v: "finished", l: "Finalizado" },
            ])}
            <div>
              <label className="block text-xs font-bold text-white/40 uppercase mb-1">Regras</label>
              <textarea value={form.rules} onChange={(e) => setForm({ ...form, rules: e.target.value })} rows={3} className="w-full px-3 py-2.5 rounded-lg bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-primary/50 resize-none" />
            </div>
            <div>
              <label className="block text-xs font-bold text-white/40 uppercase mb-1">Observacoes</label>
              <textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} rows={2} className="w-full px-3 py-2.5 rounded-lg bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-primary/50 resize-none" />
            </div>
            <div className="flex gap-3 pt-2">
              <button onClick={selected ? handleUpdate : handleCreate} disabled={saving} className="px-6 py-2.5 rounded-lg bg-primary text-white text-sm font-bold hover:bg-primary/80 disabled:opacity-50">
                {saving ? "Salvando..." : selected ? "Salvar" : "Criar"}
              </button>
              <button onClick={() => setView("list")} className="px-6 py-2.5 rounded-lg bg-white/5 text-white/40 text-sm hover:bg-white/10">
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      {view === "bracket" && selected && (
        <div>
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <button onClick={() => setView("list")} className="text-white/30 hover:text-white text-sm">&#8592;</button>
              <h1 className="text-2xl font-black text-white">🏆 {selected.name}</h1>
            </div>
            <div className="flex gap-2">
              {selected.status === "open" && (
                <button onClick={startChampionship} className="px-4 py-2 rounded-lg bg-green-500 text-white text-sm font-bold hover:bg-green-600">
                  Iniciar Campeonato
                </button>
              )}
              <button onClick={() => startEdit(selected)} className="px-4 py-2 rounded-lg bg-white/5 text-white/40 text-sm hover:bg-white/10">
                Editar
              </button>
            </div>
          </div>

          <div className="rounded-2xl border border-white/5 bg-white/[0.02] p-6 mb-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-bold text-white/30 uppercase">Participantes ({selected.participants.length})</h2>
            </div>
            <div className="flex gap-2 mb-4">
              <input type="text" value={newParticipant} onChange={(e) => setNewParticipant(e.target.value)} placeholder="Nome do participante" className="flex-1 px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-primary/50" onKeyDown={(e) => e.key === "Enter" && addParticipant()} />
              <input type="text" value={newParticipantLogo} onChange={(e) => setNewParticipantLogo(e.target.value)} placeholder="URL logo (opcional)" className="w-40 px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-primary/50" />
              <button onClick={addParticipant} className="px-4 py-2 rounded-lg bg-primary text-white text-sm font-bold hover:bg-primary/80">
                + Adicionar
              </button>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {selected.participants.map((p, i) => (
                <div key={p.id} className="flex items-center gap-2 p-2 rounded-lg bg-white/5 group">
                  {p.logo ? (
                    <img src={p.logo} alt="" className="w-6 h-6 rounded object-cover" />
                  ) : (
                    <div className="w-6 h-6 rounded bg-white/10 flex items-center justify-center text-[9px] text-white/40 font-bold">{p.name[0]}</div>
                  )}
                  <span className="text-xs text-white/70 flex-1 truncate">{p.name}</span>
                  <div className="hidden group-hover:flex gap-1">
                    <button onClick={() => startEditParticipant(i)} className="text-white/30 hover:text-white text-[10px]">&#9998;</button>
                    <button onClick={() => removeParticipant(i)} className="text-red-400/50 hover:text-red-400 text-[10px]">&#10005;</button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {editParticipant && (
            <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4" onClick={() => setEditParticipant(null)}>
              <div className="bg-[#1a1a2e] border border-white/10 rounded-2xl p-6 max-w-sm w-full" onClick={(e) => e.stopPropagation()}>
                <h3 className="text-sm font-bold text-white mb-3">Editar Participante</h3>
                <input type="text" value={editParticipant.name} onChange={(e) => setEditParticipant({ ...editParticipant, name: e.target.value })} className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-sm mb-3" />
                <input type="text" value={editParticipant.logo} onChange={(e) => setEditParticipant({ ...editParticipant, logo: e.target.value })} placeholder="URL logo" className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-sm mb-3" />
                <div className="flex gap-2">
                  <button onClick={saveEditParticipant} className="flex-1 py-2 rounded-lg bg-primary text-white text-sm font-bold">Salvar</button>
                  <button onClick={() => setEditParticipant(null)} className="py-2 px-4 rounded-lg bg-white/5 text-white/40 text-sm">Cancelar</button>
                </div>
              </div>
            </div>
          )}

          <div className="mb-4">
            <h2 className="text-sm font-bold text-white/30 uppercase mb-4">Chaveamento</h2>
            {selected.matches.length === 0 ? (
              <div className="text-center py-8 text-white/30 text-sm">
                {selected.participants.length < 2 ? "Adicione pelo menos 2 participantes para gerar a chave." : "Inicie o campeonato para gerar a chave."}
              </div>
            ) : (
              <>
                <div className="hidden sm:block">
                  <BracketView championship={selected} onMatchClick={openMatchModal} admin />
                </div>
                <div className="sm:hidden">
                  <BracketViewMobile championship={selected} onMatchClick={openMatchModal} admin />
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
