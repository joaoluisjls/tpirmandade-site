"use client";

import { useEffect, useState } from "react";

interface Request {
  id: string;
  nick: string;
  name: string;
  age: number;
  ff_id: string;
  points: number;
  experience: string;
  reason: string;
  contact: string;
  email: string;
  status: string;
  created_at: string;
  photo: string | null;
  roles?: string[];
}

const ROLE_LABELS: Record<string, string> = {
  fullgas: "Full Gas",
  rush: "Rush",
  suporte: "Suporte",
  capitao: "Capitao",
  granadeiro: "Granadeiro",
  curandeiro: "Curandeiro",
};

export default function AdminPedidos() {
  const [requests, setRequests] = useState<Request[]>([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState<string | null>(null);
  const [toast, setToast] = useState("");
  const [confirmAction, setConfirmAction] = useState<{ msg: string; onYes: () => void } | null>(null);

  const load = async () => {
    try {
      const res = await fetch("/api/recruitment-requests", { cache: "no-store" });
      const data = await res.json();
      setRequests(Array.isArray(data) ? data : []);
    } catch {
      setRequests([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const accept = async (req: Request) => {
    setProcessing(req.id);
    try {
      const playerId = req.nick.toLowerCase().replace(/[^a-z0-9_]/g, "_") + "_" + Date.now();
      const roleMap: Record<string, string> = {
        iniciante: "Recruta",
        intermediario: "Membro",
        avancado: "Membro",
        profissional: "Membro",
      };
      const res = await fetch("/api/players", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: playerId,
          nick: req.nick,
          name: req.name,
          role: roleMap[req.experience] || "Membro",
          status: "offline",
          joined_at: new Date().toISOString().split("T")[0],
          avatar: req.photo || "",
          matches: 0, wins: 0, kills: 0, deaths: 0, kd: 0,
          headshots: 0, headshot_rate: 0, avg_damage: 0, win_rate: 0,
          points: req.points || 0,
          bio: req.reason || "",
          achievements: [],
        }),
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result.error || "Erro ao criar jogador");

      await fetch("/api/player-contacts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ playerId, data: { whatsapp: req.contact, ff_id: req.ff_id, age: req.age, experience: req.experience, email: req.email, roles: req.roles || [] } }),
      });

      await fetch("/api/recruitment-requests", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: req.id, status: "accepted" }),
      });

      if (req.email) {
        await fetch("/api/auth/check-access", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: req.email }),
        });
      }

      setToast(req.nick + " foi aceito e adicionado aos jogadores!");
      load();
    } catch (e: any) {
      setToast("Erro ao aceitar: " + (e.message || "desconhecido"));
    } finally {
      setProcessing(null);
    }
  };

  const reject = (req: Request) => {
    setConfirmAction({ msg: `Rejeitar pedido de ${req.nick}?`, onYes: async () => {
      await fetch("/api/recruitment-requests", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: req.id, status: "rejected" }),
      });
      load();
    }});
  };

  const remove = (id: string) => {
    setConfirmAction({ msg: "Excluir este pedido permanentemente?", onYes: async () => {
      await fetch(`/api/recruitment-requests?id=${id}`, { method: "DELETE" });
      load();
    }});
  };

  const removePhoto = (req: Request) => {
    setConfirmAction({ msg: `Remover a foto de ${req.nick}?`, onYes: async () => {
      const updated = { ...req, photo: null };
      await fetch("/api/recruitment-requests", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: req.id, status: req.status, photo: null }),
      });
      load();
    }});
  };

  const pending = requests.filter((r) => r.status === "pending");
  const others = requests.filter((r) => r.status !== "pending");

  return (
    <div>
      {toast && (
        <div className="fixed top-4 right-4 z-[100] bg-green-500 text-white px-4 py-3 rounded-lg shadow-lg flex items-center gap-3 animate-[fadeIn_0.2s]">
          <span className="text-sm font-bold">{toast}</span>
          <button onClick={() => setToast("")} className="text-white/70 hover:text-white text-lg leading-none">&times;</button>
        </div>
      )}
      {confirmAction && (
        <div className="fixed inset-0 bg-black/60 z-[100] flex items-center justify-center p-4" onClick={() => setConfirmAction(null)}>
          <div className="bg-[#1a1a2e] border border-white/10 rounded-2xl p-6 max-w-sm w-full" onClick={(e) => e.stopPropagation()}>
            <p className="text-white text-sm mb-4">{confirmAction.msg}</p>
            <div className="flex gap-3 justify-end">
              <button onClick={() => setConfirmAction(null)} className="px-4 py-2 rounded-lg bg-white/5 text-white/60 text-sm hover:bg-white/10">Cancelar</button>
              <button onClick={() => { confirmAction.onYes(); setConfirmAction(null); }} className="px-4 py-2 rounded-lg bg-primary text-white text-sm font-bold">Confirmar</button>
            </div>
          </div>
        </div>
      )}

      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-black text-white">Pedidos de Entrada</h1>
        <button onClick={() => load()} className="px-3 py-1.5 rounded-lg bg-white/5 text-white/40 text-xs hover:bg-white/10 hover:text-white transition-colors">
          Atualizar
        </button>
      </div>

      {loading ? <p className="text-white/40">Carregando...</p> : (
        <>
          {pending.length === 0 && <p className="text-white/30 mb-6">Nenhum pedido pendente.</p>}

          <div className="space-y-3 mb-8">
            {pending.map((req) => (
              <div key={req.id} className="rounded-xl border border-primary/20 bg-primary/5 p-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      {req.photo ? (
                        <img src={req.photo} alt={req.nick} className="w-10 h-10 rounded-full object-cover border-2 border-white/10" />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center font-black text-xs text-white">{req.nick[0]}</div>
                      )}
                      <span className="text-white font-black text-lg">{req.nick}</span>
                      <span className="text-white/30 text-xs">ID: {req.ff_id}</span>
                      <span className="px-2 py-0.5 rounded bg-yellow-500/10 text-yellow-400 text-xs font-bold">PENDENTE</span>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs text-white/50 mb-2">
                      <div><span className="text-white/30">Nome:</span> {req.name}</div>
                      <div><span className="text-white/30">Idade:</span> {req.age || "—"}</div>
                      <div><span className="text-white/30">Pontos:</span> {req.points || 0}</div>
                      <div><span className="text-white/30">Exp:</span> {req.experience || "—"}</div>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-xs text-white/40 mb-2">
                      <div><span className="text-white/30">Email:</span> <span className="text-blue-400">{req.email || "—"}</span></div>
                      <div><span className="text-white/30">WhatsApp:</span> <span className="text-green-400">{req.contact || "—"}</span></div>
                    </div>
                    {req.roles && req.roles.length > 0 && (
                      <div className="flex flex-wrap gap-1 mb-2">
                        {req.roles.map((r) => (
                          <span key={r} className="px-2 py-0.5 rounded bg-primary/10 text-primary text-[10px] font-bold">{ROLE_LABELS[r] || r}</span>
                        ))}
                      </div>
                    )}
                    <div className="text-xs text-white/50 italic">&ldquo;{req.reason}&rdquo;</div>
                  </div>
                  <div className="flex gap-2 shrink-0 flex-wrap justify-end">
                    <button onClick={() => accept(req)} disabled={processing === req.id} className="px-4 py-2 rounded-lg bg-green-500 text-white text-xs font-bold hover:bg-green-600 disabled:opacity-50 transition-colors">
                      {processing === req.id ? "..." : "Aceitar"}
                    </button>
                    <button onClick={() => reject(req)} disabled={processing === req.id} className="px-4 py-2 rounded-lg bg-red-500/10 text-red-400 text-xs font-bold hover:bg-red-500/20 disabled:opacity-50 transition-colors">
                      Rejeitar
                    </button>
                    {req.photo && (
                      <button onClick={() => removePhoto(req)} className="px-4 py-2 rounded-lg bg-yellow-500/10 text-yellow-400 text-xs font-bold hover:bg-yellow-500/20 transition-colors">
                        Remover foto
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {others.length > 0 && (
            <>
              <h2 className="text-sm font-bold text-white/30 uppercase tracking-wider mb-3">Historico</h2>
              <div className="rounded-xl border border-white/5 bg-white/[0.02] overflow-hidden">
                <table className="w-full text-sm">
                  <thead><tr className="border-b border-white/5">
                    <th className="text-left text-xs text-white/40 uppercase px-4 py-3">Jogador</th>
                    <th className="text-left text-xs text-white/40 uppercase px-4 py-3">Contato</th>
                    <th className="text-center text-xs text-white/40 uppercase px-4 py-3">Status</th>
                    <th className="text-center text-xs text-white/40 uppercase px-4 py-3">Acoes</th>
                  </tr></thead>
                  <tbody>
                    {others.map((req) => (
                      <tr key={req.id} className="border-b border-white/5 last:border-0">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            {req.photo ? (
                              <img src={req.photo} alt={req.nick} className="w-8 h-8 rounded-full object-cover border border-white/10" />
                            ) : null}
                            <div>
                              <div className="font-bold text-white text-sm">{req.nick}</div>
                              <div className="text-xs text-white/30">{req.name}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-xs text-green-400">{req.contact}</td>
                        <td className="px-4 py-3 text-center">
                          <span className={`px-2 py-0.5 rounded text-xs font-bold ${req.status === "accepted" ? "bg-green-500/10 text-green-400" : "bg-red-500/10 text-red-400"}`}>
                            {req.status === "accepted" ? "Aceito" : "Rejeitado"}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-center">
                          <button onClick={() => remove(req.id)} className="px-3 py-1 rounded bg-red-500/10 text-red-400 text-xs hover:bg-red-500/20">Excluir</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </>
      )}
    </div>
  );
}
