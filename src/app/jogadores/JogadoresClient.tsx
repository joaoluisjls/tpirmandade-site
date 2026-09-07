"use client";

import { useState, useEffect } from "react";
import { getSupabase } from "@/lib/supabase-browser";
import { getCached, setCache, isCacheStale } from "@/lib/cache";
import Link from "next/link";

interface Player {
  id: string;
  nick: string;
  name: string;
  role: string;
  avatar: string;
  status: "online" | "away" | "offline";
  stats: { points: number };
  bio?: string;
}

export default function JogadoresClient() {
  const [players, setPlayers] = useState<Player[]>([]);

  useEffect(() => {
    const CACHE_KEY = "players_data";
    const cached = getCached<Player[]>(CACHE_KEY);

    const apply = (data: Player[] | null) => {
      if (!data) return;
      setPlayers(data.map((p: any) => ({ ...p, stats: { points: p.points } })));
    };

    const fetchFresh = () => {
      return getSupabase().from("players").select("id, nick, name, role, avatar, status, points, bio").then(({ data }) => {
        const result = (data ?? []) as any[];
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
  }, []);

  return (
    <div className="pt-28 pb-20">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <h1 className="text-3xl sm:text-4xl font-black text-white text-center mb-10">👥 NOSSA TROPA</h1>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {players.map((player) => (
            <Link key={player.id} href={`/jogadores/${player.id}`} className="block rounded-2xl border border-white/5 bg-white/[0.02] p-5 hover:bg-white/[0.04] transition-colors">
              <div className="flex items-start justify-between mb-3">
                <div className="relative">
                  {player.avatar ? (<img src={player.avatar} alt={player.nick} className="w-14 h-14 rounded-xl object-cover" />) : (<div className="w-14 h-14 rounded-xl bg-white/10 flex items-center justify-center text-xl font-black text-white">{player.nick.charAt(0)}</div>)}
                  <div className={`absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full border-2 border-[#0a0a0f] ${player.status === "online" ? "bg-emerald-400" : player.status === "away" ? "bg-yellow-400" : "bg-white/20"}`} />
                </div>
                <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded ${player.status === "online" ? "bg-emerald-500/10 text-emerald-400" : player.status === "away" ? "bg-yellow-500/10 text-yellow-400" : "bg-white/5 text-white/30"}`}>
                  {player.status === "online" ? "ONLINE" : player.status === "away" ? "AUSENTE" : "OFFLINE"}
                </span>
              </div>
              <h3 className="font-bold text-white text-base mb-0.5">{player.nick}</h3>
              <p className="text-xs text-white/40 mb-3">{player.role}</p>
              <div className="rounded-lg border border-white/5 bg-white/[0.02] p-2 text-center">
                <div className="text-sm font-black text-primary">{player.stats.points}</div>
                <div className="text-[9px] text-white/30 uppercase">Pontos</div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
