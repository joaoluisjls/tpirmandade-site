"use client";

import { useState, useMemo, useEffect } from "react";
import { getSupabase } from "@/lib/supabase-browser";
import { getCached, setCache, isCacheStale } from "@/lib/cache";
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

type PeriodType = "semana" | "mes";

const PERIOD_LABELS: Record<string, string> = {
  "2026_W37": "Sem 37 (Set 2026)",
  "2026_W36": "Sem 36 (Set 2026)",
  "2026_W35": "Sem 35 (Set 2026)",
  "2026_M09": "Setembro 2026",
  "2026_M08": "Agosto 2026",
  "2026_M07": "Julho 2026",
};

function formatPeriodLabel(key: string): string {
  if (PERIOD_LABELS[key]) return PERIOD_LABELS[key];
  const parts = key.split("_");
  if (parts[1]?.startsWith("W")) return `Sem ${parts[1].slice(1)}`;
  if (parts[1]?.startsWith("M")) {
    const months = ["", "Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];
    return `${months[parseInt(parts[1].slice(1))] || parts[1]} ${parts[0]}`;
  }
  return key;
}

export default function RankingClient() {
  const [search, setSearch] = useState("");
  const [players, setPlayers] = useState<Player[]>([]);
  const [periodType, setPeriodType] = useState<PeriodType>("semana");
  const [selectedPeriod, setSelectedPeriod] = useState<string>("");
  const [periodPoints, setPeriodPoints] = useState<Record<string, number>>({});
  const [availableWeeks, setAvailableWeeks] = useState<string[]>([]);
  const [availableMonths, setAvailableMonths] = useState<string[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);

  useEffect(() => {
    const CACHE_KEY = "ranking_data";
    const cached = getCached<Player[]>(CACHE_KEY);

    const apply = (data: Player[] | null) => {
      if (data) setPlayers(data);
    };

    const fetchFresh = () => {
      return getSupabase().from("players").select("id, nick, name, role, avatar, status, points").then(({ data }) => {
        const result = data ?? [];
        setCache(CACHE_KEY, result, 2 * 60 * 1000);
        return result;
      });
    };

    if (cached && !isCacheStale(CACHE_KEY)) {
      apply(cached);
      fetchFresh().then(apply, () => {});
    } else if (cached) {
      apply(cached);
      fetchFresh().then(apply, () => {});
    } else {
      fetchFresh().then(apply);
    }

    // Load period metadata
    getSupabase().from("guild_settings").select("key, value").then(({ data }) => {
      const metaEntry = (data as any[])?.find((s) => s.key === "points_meta");
      if (metaEntry) {
        try {
          const meta = JSON.parse(metaEntry.value);
          setAvailableWeeks(meta.weeks || []);
          setAvailableMonths(meta.months || []);
          if (meta.current_week) setSelectedPeriod(meta.current_week);
        } catch { /* ignore */ }
      }
    });
  }, []);

  useEffect(() => {
    if (!selectedPeriod) return;
    setLoadingHistory(true);
    getSupabase().from("guild_settings").select("key, value").then(({ data }) => {
      const entry = (data as any[])?.find((s) => s.key === "points_history_" + selectedPeriod);
      if (entry) {
        try { setPeriodPoints(JSON.parse(entry.value)); } catch { setPeriodPoints({}); }
      } else {
        setPeriodPoints({});
      }
      setLoadingHistory(false);
    });
  }, [selectedPeriod]);

  const availablePeriods = periodType === "semana" ? availableWeeks : availableMonths;

  const filteredPlayers = useMemo(() => {
    let list = [...players];

    if (selectedPeriod && Object.keys(periodPoints).length > 0) {
      list = list.map((p) => ({
        ...p,
        points: periodPoints[p.id] ?? 0,
      }));
    }

    list.sort((a, b) => b.points - a.points);
    if (search) list = list.filter((p) => p.nick.toLowerCase().includes(search.toLowerCase()));
    return list;
  }, [search, players, periodPoints, selectedPeriod]);

  const totalPoints = filteredPlayers.reduce((sum, p) => sum + p.points, 0);

  return (
    <div className="pt-28 pb-20">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <h1 className="text-3xl sm:text-4xl font-black text-white text-center mb-10">🏆 RANKING DA GUILDA</h1>

        <div className="flex flex-col sm:flex-row items-center gap-4 mb-6">
          <input type="text" placeholder="Pesquisar jogador..." value={search} onChange={(e) => setSearch(e.target.value)} className="w-full sm:w-64 px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-sm placeholder:text-white/30 focus:outline-none focus:border-primary/50" />
        </div>

        {/* Period Filter */}
        <div className="rounded-2xl border border-white/5 bg-white/[0.02] p-4 mb-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <div className="flex gap-2">
              <button onClick={() => { setPeriodType("semana"); setSelectedPeriod(availableWeeks[0] || ""); }} className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${periodType === "semana" ? "bg-primary text-white" : "bg-white/5 text-white/40 hover:bg-white/10"}`}>
                📅 Por Semana
              </button>
              <button onClick={() => { setPeriodType("mes"); setSelectedPeriod(availableMonths[0] || ""); }} className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${periodType === "mes" ? "bg-primary text-white" : "bg-white/5 text-white/40 hover:bg-white/10"}`}>
                📆 Por Mês
              </button>
            </div>

            {availablePeriods.length > 0 && (
              <select
                value={selectedPeriod}
                onChange={(e) => setSelectedPeriod(e.target.value)}
                className="px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-primary/50"
              >
                {availablePeriods.map((p) => (
                  <option key={p} value={p}>{formatPeriodLabel(p)}</option>
                ))}
              </select>
            )}

            {selectedPeriod && (
              <div className="text-sm text-white/40">
                Total: <span className="font-bold text-primary">{totalPoints.toLocaleString()}</span> pts
                {loadingHistory && <span className="ml-2 text-white/20">carregando...</span>}
              </div>
            )}
          </div>
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
                    <td className="px-5 py-3 text-center font-black text-white/30">{i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : i + 1}</td>
                    <td className="px-5 py-3">
                      <Link href={`/jogadores/${player.id}`} className="flex items-center gap-3 group">
                        {player.avatar ? (<img src={player.avatar} alt={player.nick} className="w-9 h-9 rounded-lg object-cover" />) : (<div className="w-9 h-9 rounded-lg bg-white/10 flex items-center justify-center font-bold text-xs text-white group-hover:bg-primary/20 transition-colors">{player.nick.charAt(0)}</div>)}
                        <div className="font-bold text-white text-sm group-hover:text-primary transition-colors">{player.nick}</div>
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
                  {player.avatar ? (<img src={player.avatar} alt={player.nick} className="w-9 h-9 rounded-lg object-cover" />) : (<div className="w-9 h-9 rounded-lg bg-white/10 flex items-center justify-center font-bold text-xs text-white">{player.nick.charAt(0)}</div>)}
                  <div className="flex-1"><div className="font-bold text-white text-sm">{player.nick}</div></div>
                  <span className="font-black text-primary text-sm">{player.points.toLocaleString()}</span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
