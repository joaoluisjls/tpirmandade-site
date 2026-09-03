"use client";

import { useState, useMemo, useEffect } from "react";
import Link from "next/link";

interface Player {
  id: string;
  nick: string;
  name: string;
  role: string;
  avatar: string;
  status: string;
  points: number;
}

type Filter = "semana" | "mes" | "temporada" | "geral";

export default function RankingPage() {
  const [filter, setFilter] = useState<Filter>("geral");
  const [search, setSearch] = useState("");
  const [players, setPlayers] = useState<Player[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/players")
      .then((res) => res.json())
      .then((data) => {
        setPlayers(data.map((p: any) => ({
          id: p.id,
          nick: p.nick,
          name: p.name,
          role: p.role,
          avatar: p.avatar ?? "",
          status: p.status,
          points: p.points,
        })));
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const filteredPlayers = useMemo(() => {
    let list = [...players].sort((a, b) => b.points - a.points);
    if (search) list = list.filter((p) => p.nick.toLowerCase().includes(search.toLowerCase()));
    return list;
  }, [search, players]);

  if (loading) {
    return (
      <div className="pt-28 pb-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 text-center text-white/40">Carregando...</div>
      </div>
    );
  }

  return (
    <div className="pt-28 pb-20">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <h1 className="text-3xl sm:text-4xl font-black text-white text-center mb-10">
          🏆 RANKING DA GUILDA
        </h1>

        <div className="flex flex-col sm:flex-row items-center gap-4 mb-8">
          <input type="text" placeholder="Pesquisar jogador..." value={search} onChange={(e) => setSearch(e.target.value)} className="w-full sm:w-64 px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-sm placeholder:text-white/30 focus:outline-none focus:border-primary/50" />
        </div>

        <div className="rounded-2xl border border-white/5 bg-white/[0.02] overflow-hidden">
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/5">
                  {["#", "Jogador", "Experiência", "Pontos", "Status"].map((h) => (
                    <th key={h} className={`text-xs font-bold text-white/40 uppercase tracking-wider px-5 py-3 ${h === "#" || h === "Status" ? "text-center" : h === "Jogador" ? "text-left" : "text-right"}`}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filteredPlayers.map((player, i) => (
                  <tr key={player.id} className="border-b border-white/5 last:border-0 hover:bg-white/[0.02] transition-colors">
                    <td className="px-5 py-3 text-center font-black text-white/30">
                      {i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : i + 1}
                    </td>
                    <td className="px-5 py-3">
                      <Link href={`/jogadores/${player.id}`} className="flex items-center gap-3 group">
                        {player.avatar ? (
                          <img src={player.avatar} alt={player.nick} className="w-9 h-9 rounded-lg object-cover" />
                        ) : (
                          <div className="w-9 h-9 rounded-lg bg-white/10 flex items-center justify-center font-bold text-xs text-white group-hover:bg-primary/20 transition-colors">
                            {player.nick.charAt(0)}
                          </div>
                        )}
                        <div>
                          <div className="font-bold text-white text-sm group-hover:text-primary transition-colors">{player.nick}</div>
                        </div>
                      </Link>
                    </td>
                    <td className="px-5 py-3 text-right text-sm text-white/60">{player.role}</td>
                    <td className="px-5 py-3 text-right text-sm font-bold text-primary">{player.points.toLocaleString()}</td>
                    <td className="px-5 py-3 text-center">
                      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-[11px] font-medium ${player.status === "online" ? "bg-emerald-500/10 text-emerald-400" : player.status === "away" ? "bg-yellow-500/10 text-yellow-400" : "bg-white/5 text-white/30"}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${player.status === "online" ? "bg-emerald-400" : player.status === "away" ? "bg-yellow-400" : "bg-white/30"}`} />
                        {player.status === "online" ? "Online" : player.status === "away" ? "Ausente" : "Offline"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="md:hidden p-3 space-y-2">
            {filteredPlayers.map((player, i) => (
              <Link key={player.id} href={`/jogadores/${player.id}`} className="block rounded-xl border border-white/5 bg-white/[0.02] p-4 hover:bg-white/[0.04] transition-colors">
                <div className="flex items-center gap-3 mb-3">
                  <span className="text-sm font-black text-white/30 w-7">{i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : `#${i + 1}`}</span>
                  {player.avatar ? (
                    <img src={player.avatar} alt={player.nick} className="w-9 h-9 rounded-lg object-cover" />
                  ) : (
                    <div className="w-9 h-9 rounded-lg bg-white/10 flex items-center justify-center font-bold text-xs text-white">{player.nick.charAt(0)}</div>
                  )}
                  <div className="flex-1">
                    <div className="font-bold text-white text-sm">{player.nick}</div>
                  </div>
                  <span className="font-black text-primary text-sm">{player.points.toLocaleString()}</span>
                </div>
                <div className="flex items-center justify-between text-xs mt-2 pt-2 border-t border-white/5">
                  <span className="text-white/40">{player.role}</span>
                  <span className={`text-[10px] font-medium ${player.status === "online" ? "text-emerald-400" : player.status === "away" ? "text-yellow-400" : "text-white/30"}`}>
                    {player.status === "online" ? "Online" : player.status === "away" ? "Ausente" : "Offline"}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
