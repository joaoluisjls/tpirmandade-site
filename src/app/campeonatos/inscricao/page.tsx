"use client";

import { useState, useEffect } from "react";

interface Championship {
  id: string; name: string; description: string; date: string; time: string;
  status: string; prize: string; rules: string; notes: string;
  participants: any[]; groups: any[];
}

interface Subscription {
  id: string; teamName: string; captainName: string; captainEmail: string;
  members: string[]; logo: string; status: string; created_at: string;
}

export default function InscricaoCampeonato() {
  const [championships, setChampionships] = useState<Championship[]>([]);
  const [selected, setSelected] = useState<Championship | null>(null);
  const [subs, setSubs] = useState<Subscription[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState("");
  const [form, setForm] = useState({
    teamName: "", captainName: "", captainEmail: "",
    member1: "", member2: "", member3: "", member4: "",
    logo: "",
  });

  const loadChamps = async () => {
    try {
      const res = await fetch("/api/championships", { cache: "no-store" });
      const data = await res.json();
      const open = (Array.isArray(data) ? data : []).filter((c: Championship) => c.status === "open");
      setChampionships(open);
    } finally { setLoading(false); }
  };

  const loadSubs = async (champId: string) => {
    const res = await fetch(`/api/championship-subscriptions?championshipId=${champId}`);
    const data = await res.json();
    setSubs(Array.isArray(data) ? data : []);
  };

  useEffect(() => { loadChamps(); }, []);

  useEffect(() => {
    if (selected) loadSubs(selected.id);
  }, [selected]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selected) return;
    if (!form.teamName || !form.captainName || !form.captainEmail) {
      setToast("Preencha nome do time, seu nome e email");
      return;
    }
    setSubmitting(true);
    try {
      const members = [form.member1, form.member2, form.member3, form.member4].filter(Boolean);
      const res = await fetch("/api/championship-subscriptions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          championshipId: selected.id,
          teamName: form.teamName,
          captainName: form.captainName,
          captainEmail: form.captainEmail,
          members,
          logo: form.logo,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Erro ao inscrever");
      setToast("Time inscrito com sucesso!");
      setForm({ teamName: "", captainName: "", captainEmail: "", member1: "", member2: "", member3: "", member4: "", logo: "" });
      loadSubs(selected.id);
    } catch (err: any) {
      setToast(err.message || "Erro ao inscrever");
    } finally { setSubmitting(false); }
  };

  return (
    <div className="pt-28 pb-20">
      {toast && (
        <div className="fixed top-4 right-4 z-[100] bg-primary text-white px-4 py-3 rounded-lg shadow-lg flex items-center gap-3">
          <span className="text-sm font-bold">{toast}</span>
          <button onClick={() => setToast("")} className="text-white/70 hover:text-white">&times;</button>
        </div>
      )}

      <div className="max-w-4xl mx-auto px-4">
        <h1 className="text-3xl font-black text-white text-center mb-2">INSCRICAO EM CAMPEONATOS</h1>
        <p className="text-white/40 text-center mb-8">Inscreva seu time nos campeonatos abertos</p>

        {loading ? <p className="text-white/40 text-center">Carregando...</p> : championships.length === 0 ? (
          <div className="text-center py-16 rounded-2xl border border-white/5 bg-white/[0.02]">
            <div className="text-4xl mb-3">&#127942;</div>
            <p className="text-white/40">Nenhum campeonato com inscricoes abertas no momento.</p>
          </div>
        ) : !selected ? (
          <div className="space-y-4">
            {championships.map((c) => (
              <button key={c.id} onClick={() => setSelected(c)} className="w-full text-left rounded-2xl border border-white/10 bg-white/[0.02] p-6 hover:border-primary/30 hover:bg-primary/5 transition-all">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-lg font-black text-white">🏆 {c.name}</h2>
                    {c.description && <p className="text-white/40 text-sm mt-1">{c.description}</p>}
                  </div>
                  <div className="text-right text-xs text-white/30">
                    {c.date && <div>{c.date} {c.time}</div>}
                    {c.prize && <div className="text-yellow-400 mt-1">{c.prize}</div>}
                  </div>
                </div>
                <div className="flex gap-4 mt-3 text-xs text-white/30">
                  <span>Participantes: {c.participants.length}</span>
                  <span>Grupos: {c.groups?.length || 0}</span>
                </div>
              </button>
            ))}
          </div>
        ) : (
          <div>
            <button onClick={() => { setSelected(null); setSubs([]); }} className="text-white/30 hover:text-white text-sm mb-4">&#8592; Voltar</button>

            <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-6 mb-6">
              <h2 className="text-xl font-black text-white mb-2">🏆 {selected.name}</h2>
              {selected.description && <p className="text-white/40 text-sm mb-3">{selected.description}</p>}
              <div className="flex gap-4 text-xs text-white/30">
                {selected.date && <span>Data: {selected.date} {selected.time}</span>}
                {selected.prize && <span className="text-yellow-400">Premiacao: {selected.prize}</span>}
              </div>
              {selected.rules && (
                <div className="mt-3 text-xs text-white/40">
                  <span className="font-bold">Regras:</span> {selected.rules}
                </div>
              )}
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-6 mb-6">
              <h3 className="text-sm font-bold text-white/30 uppercase mb-4">Times Inscritos ({subs.length})</h3>
              {subs.length === 0 ? (
                <p className="text-white/30 text-sm">Nenhum time inscrito ainda.</p>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {subs.map((s) => (
                    <div key={s.id} className="flex items-center gap-3 p-3 rounded-lg bg-white/5">
                      {s.logo ? (
                        <img src={s.logo} alt="" className="w-8 h-8 rounded object-cover" />
                      ) : (
                        <div className="w-8 h-8 rounded bg-primary/20 flex items-center justify-center text-xs font-bold text-primary">{s.teamName[0]}</div>
                      )}
                      <div>
                        <div className="text-sm font-bold text-white">{s.teamName}</div>
                        <div className="text-[10px] text-white/30">Cap: {s.captainName} | {s.members.length + 1} jogadores</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <form onSubmit={handleSubmit} className="rounded-2xl border border-primary/20 bg-primary/5 p-6">
              <h3 className="text-lg font-bold text-white mb-4">Inscrever Time</h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-white/40 uppercase mb-1">Nome do Time *</label>
                  <input type="text" value={form.teamName} onChange={(e) => setForm({ ...form, teamName: e.target.value })} required className="w-full px-3 py-2.5 rounded-lg bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-primary/50" placeholder="Nome do seu time" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-white/40 uppercase mb-1">Seu Nome (Capitao) *</label>
                  <input type="text" value={form.captainName} onChange={(e) => setForm({ ...form, captainName: e.target.value })} required className="w-full px-3 py-2.5 rounded-lg bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-primary/50" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-white/40 uppercase mb-1">Seu Email *</label>
                  <input type="email" value={form.captainEmail} onChange={(e) => setForm({ ...form, captainEmail: e.target.value })} required className="w-full px-3 py-2.5 rounded-lg bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-primary/50" />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-white/40 uppercase mb-1">URL Logo do Time (opcional)</label>
                  <input type="text" value={form.logo} onChange={(e) => setForm({ ...form, logo: e.target.value })} className="w-full px-3 py-2.5 rounded-lg bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-primary/50" placeholder="https://..." />
                </div>
                <div>
                  <label className="block text-xs font-bold text-white/40 uppercase mb-1">Membro 2</label>
                  <input type="text" value={form.member1} onChange={(e) => setForm({ ...form, member1: e.target.value })} className="w-full px-3 py-2.5 rounded-lg bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-primary/50" placeholder="Nick do jogador" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-white/40 uppercase mb-1">Membro 3</label>
                  <input type="text" value={form.member2} onChange={(e) => setForm({ ...form, member2: e.target.value })} className="w-full px-3 py-2.5 rounded-lg bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-primary/50" placeholder="Nick do jogador" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-white/40 uppercase mb-1">Membro 4</label>
                  <input type="text" value={form.member3} onChange={(e) => setForm({ ...form, member3: e.target.value })} className="w-full px-3 py-2.5 rounded-lg bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-primary/50" placeholder="Nick do jogador" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-white/40 uppercase mb-1">Membro 5</label>
                  <input type="text" value={form.member4} onChange={(e) => setForm({ ...form, member4: e.target.value })} className="w-full px-3 py-2.5 rounded-lg bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-primary/50" placeholder="Nick do jogador" />
                </div>
              </div>

              <button type="submit" disabled={submitting} className="mt-4 px-6 py-2.5 rounded-lg bg-primary text-white text-sm font-bold hover:bg-primary/80 disabled:opacity-50">
                {submitting ? "Inscrevendo..." : "INSCREVER TIME"}
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
