"use client";

import { useState, useEffect, useMemo } from "react";

interface War {
  id: string;
  opponent: string;
  date: string;
  time: string;
  status: "upcoming" | "preparation" | "finished";
  result?: "victory" | "defeat";
  guildScore?: number;
  opponentScore?: number;
  mvp?: string;
}

interface GuildInfo {
  name: string;
  tag: string;
}

type Filter = "todas" | "vitorias" | "derrotas";

function mapWar(raw: any): War {
  return {
    id: raw.id,
    opponent: raw.opponent,
    date: raw.date,
    time: raw.time,
    status: raw.status,
    result: raw.result,
    guildScore: raw.guild_score,
    opponentScore: raw.opponent_score,
    mvp: raw.mvp_nick,
  };
}

export default function GuerrasPage() {
  const [filter, setFilter] = useState<Filter>("todas");
  const [wars, setWars] = useState<War[]>([]);
  const [guild, setGuild] = useState<GuildInfo>({ name: "", tag: "" });

  useEffect(() => {
    async function load() {
      const [warsRes, settingsRes] = await Promise.all([
        fetch("/api/wars"),
        fetch("/api/settings"),
      ]);
      const rawWars: any[] = await warsRes.json();
      const settings: any = await settingsRes.json();

      setWars(rawWars.map(mapWar));
      setGuild({ name: settings.guild_name, tag: settings.guild_tag });
    }
    load();
  }, []);

  const filteredWars = useMemo(() => {
    if (filter === "vitorias") return wars.filter((w) => w.result === "victory");
    if (filter === "derrotas") return wars.filter((w) => w.result === "defeat");
    return wars;
  }, [filter, wars]);

  const totalFinished = wars.filter((w) => w.status === "finished");
  const wins = totalFinished.filter((w) => w.result === "victory").length;
  const winRate = totalFinished.length > 0 ? ((wins / totalFinished.length) * 100).toFixed(1) : "0";
  const upcomingWar = wars.find((w) => w.status === "upcoming" || w.status === "preparation");

  return (
    <div className="pt-28 pb-20">
      <div className="max-w-5xl mx-auto px-4 sm:px-6">
        <h1 className="text-3xl sm:text-4xl font-black text-white text-center mb-10">⚔️ GUERRA DE GUILDA</h1>

        {/* Win Rate */}
        <div className="rounded-2xl border border-white/5 bg-white/[0.02] p-6 mb-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-6">
              <div className="text-center"><div className="text-2xl font-black text-emerald-400">{wins}</div><div className="text-xs text-white/40">Vitórias</div></div>
              <div className="text-center"><div className="text-2xl font-black text-red-400">{totalFinished.length - wins}</div><div className="text-xs text-white/40">Derrotas</div></div>
              <div className="text-center"><div className="text-2xl font-black text-primary">{totalFinished.length}</div><div className="text-xs text-white/40">Total</div></div>
            </div>
            <div className="text-center sm:text-right">
              <div className="text-xs text-white/40">Taxa de Vitória</div>
              <div className="text-3xl font-black text-primary">{winRate}%</div>
            </div>
          </div>
          <div className="mt-4 h-2 rounded-full bg-white/5 overflow-hidden">
            <div className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-emerald-400 transition-all" style={{ width: `${winRate}%` }} />
          </div>
        </div>

        {/* Próxima guerra */}
        {upcomingWar && (
          <div className="rounded-2xl border border-primary/20 bg-primary/5 p-6 mb-8 text-center">
            <h2 className="text-base font-bold text-white mb-4">{upcomingWar.status === "preparation" ? "⚔️ GUERRA EM PREPARAÇÃO" : "📅 PRÓXIMA GUERRA"}</h2>
            <div className="flex items-center justify-center gap-6 mb-4">
              <div className="text-center">
                <img src="/logo.jpg" alt="TP&IRMANDADE" className="w-12 h-12 rounded-xl object-cover mx-auto mb-1" />
                <div className="text-xs font-bold text-white">{guild.name}</div>
              </div>
              <div className="text-xl font-black text-primary">VS</div>
              <div className="text-center">
                <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center font-black text-sm text-white mx-auto mb-1 border border-white/10">
                  {upcomingWar.opponent.split(" ").map((w) => w.charAt(0)).join("")}
                </div>
                <div className="text-xs font-bold text-white">{upcomingWar.opponent}</div>
              </div>
            </div>
            <div className="text-sm text-white/60 mb-2">{upcomingWar.date} — {upcomingWar.time}</div>
            <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/20 border border-primary/30 text-primary text-xs font-bold">
              <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
              {upcomingWar.status === "preparation" ? "PREPARAÇÃO" : "AGENDADA"}
            </span>
          </div>
        )}

        {/* Filtros */}
        <div className="flex gap-2 mb-6">
          {(["todas", "vitorias", "derrotas"] as Filter[]).map((f) => (
            <button key={f} onClick={() => setFilter(f)} className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors capitalize ${filter === f ? "bg-primary text-white" : "bg-white/5 text-white/50 hover:bg-white/10"}`}>
              {f}
            </button>
          ))}
        </div>

        {/* Lista */}
        <div className="space-y-3">
          {filteredWars.map((war) => (
            <div key={war.id} className="rounded-xl border border-white/5 bg-white/[0.02] p-5">
              <div className="flex flex-col sm:flex-row items-center gap-4">
                <div className="flex items-center gap-4 flex-1">
                  <div className="text-center min-w-[90px]">
                    <img src="/logo.jpg" alt="TP&IRMANDADE" className="w-10 h-10 rounded-lg object-cover mx-auto mb-1" />
                    <div className="text-[11px] font-bold text-white">{guild.name}</div>
                    {war.guildScore && <div className="text-base font-black text-white mt-1">{war.guildScore.toLocaleString()}</div>}
                  </div>
                  <div className="text-sm font-black text-white/30">VS</div>
                  <div className="text-center min-w-[90px]">
                    <div className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center font-bold text-xs text-white mx-auto mb-1 border border-white/10">
                      {war.opponent.split(" ").map((w) => w.charAt(0)).join("")}
                    </div>
                    <div className="text-[11px] font-bold text-white">{war.opponent}</div>
                    {war.opponentScore && <div className="text-base font-black text-white mt-1">{war.opponentScore.toLocaleString()}</div>}
                  </div>
                </div>
                <div className="text-center sm:text-right min-w-[120px]">
                  <div className="text-xs text-white/50 mb-1">{war.date}</div>
                  {war.status === "finished" && war.result ? (
                    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold ${war.result === "victory" ? "bg-emerald-500/10 text-emerald-400" : "bg-red-500/10 text-red-400"}`}>
                      {war.result === "victory" ? "✅ VITÓRIA" : "❌ DERROTA"}
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-primary/20 text-primary text-xs font-bold">
                      {war.status === "preparation" ? "PREPARAÇÃO" : "AGENDADA"}
                    </span>
                  )}
                  {war.mvp && <div className="text-[11px] text-white/30 mt-1">MVP: <span className="text-accent">{war.mvp}</span></div>}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
