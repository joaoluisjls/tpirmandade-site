"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

interface Player {
  id: string;
  nick: string;
  name: string;
  role: string;
  joinedAt: string;
  avatar: string;
  status: "online" | "away" | "offline";
  stats: {
    matches: number;
    wins: number;
    kills: number;
    deaths: number;
    kd: number;
    headshots: number;
    headshotRate: number;
    avgDamage: number;
    winRate: number;
    points: number;
  };
  weeklyEvolution: { week: string; points: number }[];
  achievements: string[];
  bio?: string;
}

function mapPlayer(raw: any): Player {
  return {
    id: raw.id,
    nick: raw.nick,
    name: raw.name,
    role: raw.role,
    joinedAt: raw.joined_at,
    avatar: raw.avatar,
    status: raw.status,
    stats: {
      matches: raw.matches,
      wins: raw.wins,
      kills: raw.kills,
      deaths: raw.deaths,
      kd: raw.kd,
      headshots: raw.headshots,
      headshotRate: raw.headshot_rate,
      avgDamage: raw.avg_damage,
      winRate: raw.win_rate,
      points: raw.points,
    },
    weeklyEvolution: raw.weekly_evolution,
    achievements: raw.achievements,
    bio: raw.bio,
  };
}

export default function JogadoresPage() {
  const [players, setPlayers] = useState<Player[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/players")
      .then((res) => res.json())
      .then((data) => {
        setPlayers(data.map(mapPlayer));
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

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
          👥 NOSSA TROPA
        </h1>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {players.map((player) => (
            <Link key={player.id} href={`/jogadores/${player.id}`} className="block rounded-2xl border border-white/5 bg-white/[0.02] p-5 hover:bg-white/[0.04] transition-colors">
              <div className="flex items-start justify-between mb-3">
                <div className="relative">
                  {player.avatar ? (
                    <img src={player.avatar} alt={player.nick} className="w-14 h-14 rounded-xl object-cover" />
                  ) : (
                    <div className="w-14 h-14 rounded-xl bg-white/10 flex items-center justify-center text-xl font-black text-white">
                      {player.nick.charAt(0)}
                    </div>
                  )}
                  <div className={`absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full border-2 border-[#0a0a0f] ${player.status === "online" ? "bg-emerald-400" : player.status === "away" ? "bg-yellow-400" : "bg-white/20"}`} />
                </div>
                <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded ${player.status === "online" ? "bg-emerald-500/10 text-emerald-400" : player.status === "away" ? "bg-yellow-500/10 text-yellow-400" : "bg-white/5 text-white/30"}`}>
                  {player.status === "online" ? "ONLINE" : player.status === "away" ? "AUSENTE" : "OFFLINE"}
                </span>
              </div>

              <h3 className="font-bold text-white text-base mb-0.5">{player.nick}</h3>
              <p className="text-xs text-white/40 mb-1">{player.role}</p>
              <p className="text-[10px] text-white/25 mb-3">ID: {player.id}</p>

              <div className="grid grid-cols-1 gap-2">
                <div className="rounded-lg border border-white/5 bg-white/[0.02] p-2 text-center">
                  <div className="text-sm font-black text-primary">{player.stats.points}</div>
                  <div className="text-[9px] text-white/30 uppercase">Pontos</div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
