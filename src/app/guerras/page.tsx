"use client";

import { useState, useEffect, useMemo } from "react";
import type { Championship } from "@/lib/bracket";
import { BracketView, BracketViewMobile } from "@/components/BracketView";

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
type Tab = "guerras" | "campeonatos";

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

const statusColors: Record<string, string> = {
  open: "bg-green-500/10 text-green-400",
  in_progress: "bg-yellow-500/10 text-yellow-400",
  finished: "bg-red-500/10 text-red-400",
  scheduled: "bg-white/10 text-white/40",
};

const statusLabels: Record<string, string> = {
  open: "Inscricoes abertas",
  in_progress: "Em andamento",
  finished: "Finalizado",
  scheduled: "Agendado",
};

export default function GuerrasPage() {
  const [tab, setTab] = useState<Tab>("guerras");
  const [filter, setFilter] = useState<Filter>("todas");
  const [wars, setWars] = useState<War[]>([]);
  const [guild, setGuild] = useState<GuildInfo>({ name: "", tag: "" });
  const [championships, setChampionships] = useState<Championship[]>([]);
  const [selectedChamp, setSelectedChamp] = useState<Championship | null>(null);
  const [champFilter, setChampFilter] = useState<"all" | "open" | "in_progress" | "finished">("all");

  useEffect(() => {
    async function load() {
      const [warsRes, settingsRes, champsRes] = await Promise.all([
        fetch("/api/wars", { cache: "no-store" }),
        fetch("/api/settings", { cache: "no-store" }),
        fetch("/api/championships", { cache: "no-store" }),
      ]);
      const rawWars: any[] = await warsRes.json();
      const settings: any = await settingsRes.json();
      const rawChamps: any[] = await champsRes.json();

      setWars(rawWars.map(mapWar));
      setGuild({ name: settings.guild_name, tag: settings.guild_tag });
      setChampionships(rawChamps);
    }
    load();
  }, []);

  const filteredWars = useMemo(() => {
    if (filter === "vitorias") return wars.filter((w) => w.result === "victory");
    if (filter === "derrotas") return wars.filter((w) => w.result === "defeat");
    return wars;
  }, [filter, wars]);

  const filteredChamps = useMemo(() => {
    if (champFilter === "all") return championships;
    return championships.filter((c) => c.status === champFilter);
  }, [champFilter, championships]);

  const totalFinished = wars.filter((w) => w.status === "finished");
  const wins = totalFinished.filter((w) => w.result === "victory").length;
  const winRate = totalFinished.length > 0 ? ((wins / totalFinished.length) * 100).toFixed(1) : "0";
  const upcomingWar = wars.find((w) => w.status === "upcoming" || w.status === "preparation");

  return (
    <div className="pt-28 pb-20">
      <div className="max-w-5xl mx-auto px-4 sm:px-6">
        <h1 className="text-3xl sm:text-4xl font-black text-white text-center mb-6">⚔️ GUERRAS</h1>

        <div className="flex justify-center gap-2 mb-8">
          <button onClick={() => setTab("guerras")} className={`px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${tab === "guerras" ? "bg-primary text-white shadow-lg shadow-primary/20" : "bg-white/5 text-white/40 hover:bg-white/10"}`}>
            ⚔️ Guerras
          </button>
          <button onClick={() => setTab("campeonatos")} className={`px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${tab === "campeonatos" ? "bg-primary text-white shadow-lg shadow-primary/20" : "bg-white/5 text-white/40 hover:bg-white/10"}`}>
            🏆 Campeonatos
          </button>
        </div>

        {tab === "guerras" && (
          <>
            <div className="rounded-2xl border border-white/5 bg-white/[0.02] p-6 mb-8">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-6">
                  <div className="text-center"><div className="text-2xl font-black text-emerald-400">{wins}</div><div className="text-xs text-white/40">Vitorias</div></div>
                  <div className="text-center"><div className="text-2xl font-black text-red-400">{totalFinished.length - wins}</div><div className="text-xs text-white/40">Derrotas</div></div>
                  <div className="text-center"><div className="text-2xl font-black text-primary">{totalFinished.length}</div><div className="text-xs text-white/40">Total</div></div>
                </div>
                <div className="text-center sm:text-right">
                  <div className="text-xs text-white/40">Taxa de Vitoria</div>
                  <div className="text-3xl font-black text-primary">{winRate}%</div>
                </div>
              </div>
              <div className="mt-4 h-2 rounded-full bg-white/5 overflow-hidden">
                <div className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-emerald-400 transition-all" style={{ width: `${winRate}%` }} />
              </div>
            </div>

            {upcomingWar && (
              <div className="rounded-2xl border border-primary/20 bg-primary/5 p-6 mb-8 text-center">
                <h2 className="text-base font-bold text-white mb-4">{upcomingWar.status === "preparation" ? "⚔️ GUERRA EM PREPARACAO" : "PROXIMA GUERRA"}</h2>
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
                  {upcomingWar.status === "preparation" ? "PREPARACAO" : "AGENDADA"}
                </span>
              </div>
            )}

            <div className="flex gap-2 mb-6">
              {(["todas", "vitorias", "derrotas"] as Filter[]).map((f) => (
                <button key={f} onClick={() => setFilter(f)} className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors capitalize ${filter === f ? "bg-primary text-white" : "bg-white/5 text-white/50 hover:bg-white/10"}`}>
                  {f}
                </button>
              ))}
            </div>

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
                          {war.result === "victory" ? "VITORIA" : "DERROTA"}
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-primary/20 text-primary text-xs font-bold">
                          {war.status === "preparation" ? "PREPARACAO" : "AGENDADA"}
                        </span>
                      )}
                      {war.mvp && <div className="text-[11px] text-white/30 mt-1">MVP: <span className="text-accent">{war.mvp}</span></div>}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {tab === "campeonatos" && (
          <>
            {selectedChamp ? (
              <div>
                <button onClick={() => setSelectedChamp(null)} className="text-sm text-primary hover:text-primary/80 mb-4 transition-colors">
                  ← Voltar para campeonatos
                </button>

                <div className="rounded-2xl border border-white/5 bg-white/[0.02] p-6 mb-6">
                  <div className="flex flex-col sm:flex-row items-start justify-between gap-4 mb-4">
                    <div>
                      <h2 className="text-2xl font-black text-white mb-2">🏆 {selectedChamp.name}</h2>
                      {selectedChamp.description && <p className="text-sm text-white/40 mb-2">{selectedChamp.description}</p>}
                    </div>
                    <span className={`px-3 py-1.5 rounded-full text-xs font-bold ${statusColors[selectedChamp.status] || "bg-white/10 text-white/40"}`}>
                      {statusLabels[selectedChamp.status] || selectedChamp.status}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
                    <div className="rounded-lg bg-white/5 p-3">
                      <div className="text-lg font-black text-white">{selectedChamp.participants.length}</div>
                      <div className="text-[10px] text-white/30 uppercase">Participantes</div>
                    </div>
                    <div className="rounded-lg bg-white/5 p-3">
                      <div className="text-lg font-black text-white">{selectedChamp.date || "—"}</div>
                      <div className="text-[10px] text-white/30 uppercase">Data</div>
                    </div>
                    <div className="rounded-lg bg-white/5 p-3">
                      <div className="text-lg font-black text-white">{selectedChamp.time || "—"}</div>
                      <div className="text-[10px] text-white/30 uppercase">Horario</div>
                    </div>
                    <div className="rounded-lg bg-white/5 p-3">
                      <div className="text-lg font-black text-white">{selectedChamp.prize || "—"}</div>
                      <div className="text-[10px] text-white/30 uppercase">Premiacao</div>
                    </div>
                  </div>

                  {selectedChamp.champion && (
                    <div className="mt-6 p-6 rounded-2xl border border-yellow-500/20 bg-yellow-500/5 text-center">
                      <div className="text-4xl mb-2">&#127942;</div>
                      <div className="text-sm font-bold text-yellow-400 mb-2">CAMPEAO</div>
                      {selectedChamp.champion.logo ? (
                        <img src={selectedChamp.champion.logo} alt="" className="w-14 h-14 rounded-full object-cover mx-auto mb-2 border-2 border-yellow-500/30" />
                      ) : (
                        <div className="w-14 h-14 rounded-full bg-gradient-to-br from-yellow-500 to-orange-500 flex items-center justify-center text-xl font-black text-white mx-auto mb-2">
                          {selectedChamp.champion.name[0]}
                        </div>
                      )}
                      <div className="text-lg font-black text-white">{selectedChamp.champion.name}</div>
                    </div>
                  )}

                  {selectedChamp.rules && (
                    <div className="mt-4 p-4 rounded-lg bg-white/[0.02] border border-white/5">
                      <div className="text-xs font-bold text-white/30 uppercase mb-1">Regras</div>
                      <div className="text-sm text-white/50 whitespace-pre-wrap">{selectedChamp.rules}</div>
                    </div>
                  )}
                </div>

                <div className="mb-4">
                  <h3 className="text-lg font-bold text-white mb-4 text-center">CHAVEAMENTO</h3>
                  <div className="hidden sm:block">
                    <BracketView championship={selectedChamp} />
                  </div>
                  <div className="sm:hidden">
                    <BracketViewMobile championship={selectedChamp} />
                  </div>
                </div>

                {selectedChamp.participants.length > 0 && (
                  <div className="rounded-2xl border border-white/5 bg-white/[0.02] p-6 mt-6">
                    <h3 className="text-sm font-bold text-white/30 uppercase mb-3">Participantes</h3>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      {selectedChamp.participants.map((p) => (
                        <div key={p.id} className="flex items-center gap-2 p-2 rounded-lg bg-white/5">
                          {p.logo ? (
                            <img src={p.logo} alt="" className="w-6 h-6 rounded object-cover" />
                          ) : (
                            <div className="w-6 h-6 rounded bg-white/10 flex items-center justify-center text-[9px] text-white/40 font-bold">{p.name[0]}</div>
                          )}
                          <span className="text-xs text-white/70 truncate">{p.name}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <>
                <div className="flex gap-2 mb-6">
                  {(["all", "open", "in_progress", "finished"] as const).map((f) => (
                    <button key={f} onClick={() => setChampFilter(f)} className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${champFilter === f ? "bg-primary text-white" : "bg-white/5 text-white/50 hover:bg-white/10"}`}>
                      {f === "all" ? "Todos" : f === "open" ? "Inscricoes" : f === "in_progress" ? "Em andamento" : "Finalizados"}
                    </button>
                  ))}
                </div>

                {filteredChamps.length === 0 ? (
                  <div className="text-center py-16 text-white/30">
                    <div className="text-4xl mb-4">&#127942;</div>
                    <p className="text-sm">Nenhum campeonato encontrado.</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {filteredChamps.map((champ) => (
                      <button
                        key={champ.id}
                        onClick={() => setSelectedChamp(champ)}
                        className="w-full text-left rounded-xl border border-white/5 bg-white/[0.02] p-5 hover:border-primary/20 hover:bg-primary/5 transition-all"
                      >
                        <div className="flex items-center justify-between gap-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-white font-black">🏆 {champ.name}</span>
                              <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${statusColors[champ.status]}`}>
                                {statusLabels[champ.status]}
                              </span>
                            </div>
                            <div className="flex items-center gap-4 text-xs text-white/30">
                              <span>{champ.participants.length} participantes</span>
                              {champ.date && <span>{champ.date}</span>}
                              {champ.champion && <span className="text-yellow-400">Campeao: {champ.champion.name}</span>}
                            </div>
                          </div>
                          <span className="text-white/20 text-sm">→</span>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
}
