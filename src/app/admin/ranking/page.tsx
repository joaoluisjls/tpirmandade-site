"use client";

import { useEffect, useState } from "react";

interface Player { id: string; nick: string; role: string; status: string; points: number; }

export default function AdminRanking() {
  const [players, setPlayers] = useState<Player[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editPoints, setEditPoints] = useState(0);
  const [toast, setToast] = useState("");

  useEffect(() => {
    fetch("/api/players", { cache: "no-store" }).then((r) => r.json()).then((d) => {
      setPlayers(d.map((p: any) => ({ id: p.id, nick: p.nick, role: p.role, status: p.status, points: p.points })).sort((a: Player, b: Player) => b.points - a.points));
    });
  }, []);

  const save = async (id: string) => {
    await fetch("/api/players", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id, points: editPoints }) });
    setEditingId(null);
    setToast("Pontos atualizados!");
    setTimeout(() => setToast(""), 3000);
    fetch("/api/players", { cache: "no-store" }).then((r) => r.json()).then((d) => {
      setPlayers(d.map((p: any) => ({ id: p.id, nick: p.nick, role: p.role, status: p.status, points: p.points })).sort((a: Player, b: Player) => b.points - a.points));
    });
  };

  const medals = ["🥇", "🥈", "🥉"];

  return (
    <div>
      {toast && (
        <div className="fixed top-4 right-4 z-[100] bg-green-500 text-white px-4 py-3 rounded-lg shadow-lg flex items-center gap-3">
          <span className="text-sm font-bold">{toast}</span>
          <button onClick={() => setToast("")} className="text-white/70 hover:text-white text-lg leading-none">&times;</button>
        </div>
      )}

      <h1 className="text-2xl font-black text-white mb-6">🥇 Ranking</h1>
      <div className="rounded-xl border border-white/5 bg-white/[0.02] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead><tr className="border-b border-white/5">
              <th className="text-left text-xs text-white/40 uppercase px-4 py-3">#</th>
              <th className="text-left text-xs text-white/40 uppercase px-4 py-3">Jogador</th>
              <th className="text-left text-xs text-white/40 uppercase px-4 py-3">Cargo</th>
              <th className="text-right text-xs text-white/40 uppercase px-4 py-3">Pontos</th>
              <th className="text-center text-xs text-white/40 uppercase px-4 py-3">Ações</th>
            </tr></thead>
            <tbody>
              {players.map((p, i) => (
                <tr key={p.id} className="border-b border-white/5 last:border-0">
                  <td className="px-4 py-3 font-black text-white/30">{i < 3 ? medals[i] : i + 1}</td>
                  <td className="px-4 py-3 font-bold text-white">{p.nick}</td>
                  <td className="px-4 py-3 text-white/50 text-xs">{p.role}</td>
                  {editingId === p.id ? (
                    <>
                      <td className="px-2 py-1 text-right">
                        <input type="number" value={editPoints} onChange={(e) => setEditPoints(Number(e.target.value))} className="w-24 px-2 py-1 rounded bg-white/5 border border-white/10 text-white text-xs text-right" />
                      </td>
                      <td className="px-4 py-3 text-center">
                        <button onClick={() => save(p.id)} className="px-3 py-1 rounded bg-emerald-500/10 text-emerald-400 text-xs mr-2">Salvar</button>
                        <button onClick={() => setEditingId(null)} className="px-3 py-1 rounded bg-white/5 text-white/40 text-xs">Cancelar</button>
                      </td>
                    </>
                  ) : (
                    <>
                      <td className="px-4 py-3 text-right text-primary font-bold">{p.points}</td>
                      <td className="px-4 py-3 text-center">
                        <button onClick={() => { setEditingId(p.id); setEditPoints(p.points); }} className="px-3 py-1 rounded bg-white/5 text-white/60 text-xs hover:bg-white/10">Editar</button>
                      </td>
                    </>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
