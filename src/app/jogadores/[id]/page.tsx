"use client";

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";

interface WeeklyEvolution {
  week: string;
  points: number;
}

interface Player {
  id: string;
  nick: string;
  name: string;
  role: string;
  status: string;
  bio?: string;
  joinedAt: string;
  avatar: string;
  stats: {
    matches: number;
    wins: number;
    kills: number;
    kd: number;
    headshotRate: number;
    avgDamage: number;
    winRate: number;
    points: number;
  };
  weeklyEvolution: WeeklyEvolution[];
  achievements: string[];
}

interface PlayerDB {
  id: string;
  nick: string;
  name: string;
  role: string;
  status: string;
  bio?: string;
  joined_at: string;
  avatar: string;
  matches: number;
  wins: number;
  kills: number;
  deaths: number;
  headshot_rate: number;
  avg_damage: number;
  win_rate: number;
  points: number;
  weekly_evolution: WeeklyEvolution[];
  achievements: string[];
}

export default function PlayerProfilePage() {
  const params = useParams();
  const [player, setPlayer] = useState<Player | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/players")
      .then((res) => res.json())
      .then((data: PlayerDB[]) => {
        const found = data.find((p) => p.id === params.id);
        if (found) {
          const mapped: Player = {
            id: found.id,
            nick: found.nick,
            name: found.name,
            role: found.role,
            status: found.status,
            bio: found.bio,
            joinedAt: found.joined_at,
            avatar: found.avatar || "",
            stats: {
              matches: found.matches,
              wins: found.wins,
              kills: found.kills,
              kd: found.deaths > 0 ? +(found.kills / found.deaths).toFixed(2) : 0,
              headshotRate: found.headshot_rate,
              avgDamage: found.avg_damage,
              winRate: found.win_rate,
              points: found.points,
            },
            weeklyEvolution: found.weekly_evolution || [],
            achievements: found.achievements || [],
          };
          setPlayer(mapped);
        }
        setLoading(false);
      });
  }, [params.id]);

  if (loading) {
    return (
      <div className="pt-28 pb-20 text-center">
        <h1 className="text-2xl font-bold text-white">Carregando...</h1>
      </div>
    );
  }

  if (!player) {
    return (
      <div className="pt-28 pb-20 text-center">
        <h1 className="text-2xl font-bold text-white">Jogador não encontrado</h1>
        <Link href="/jogadores" className="text-primary mt-4 inline-block">← Voltar</Link>
      </div>
    );
  }

  const maxPoints = Math.max(...player.weeklyEvolution.map((w) => w.points));

  return (
    <div className="pt-28 pb-20">
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        <Link href="/jogadores" className="inline-flex items-center gap-2 text-sm text-white/40 hover:text-white mb-8 transition-colors">← Voltar para jogadores</Link>

        {/* Header */}
        <div className="rounded-2xl border border-white/5 bg-white/[0.02] p-8 mb-6">
          <div className="flex flex-col sm:flex-row items-center gap-6">
            <div className="relative">
              {player.avatar ? (
                <img src={player.avatar} alt={player.nick} className="w-24 h-24 rounded-2xl object-cover" />
              ) : (
                <div className="w-24 h-24 rounded-2xl bg-white/10 flex items-center justify-center text-4xl font-black text-white">{player.nick.charAt(0)}</div>
              )}
              <div className={`absolute -bottom-1 -right-1 w-5 h-5 rounded-full border-2 border-[#0a0a0f] ${player.status === "online" ? "bg-emerald-400" : player.status === "away" ? "bg-yellow-400" : "bg-white/20"}`} />
            </div>
            <div className="text-center sm:text-left">
              <div className="text-xs text-primary font-bold uppercase tracking-widest mb-1">{player.role}</div>
              <h1 className="text-3xl font-black text-white mb-1">{player.nick}</h1>
              <p className="text-sm text-white/40">{player.name}</p>
              <p className="text-xs text-white/30 mt-1">Entrada: {player.joinedAt}</p>
              {player.bio && <p className="text-sm text-white/50 mt-2 italic">&ldquo;{player.bio}&rdquo;</p>}
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 gap-3 mb-6">
          <div className="rounded-xl border border-white/5 bg-white/[0.02] p-4 text-center">
            <div className="text-lg mb-1">⭐</div>
            <div className="text-2xl font-black text-primary">{player.stats.points.toLocaleString()}</div>
            <div className="text-[10px] text-white/40 uppercase">Pontos</div>
          </div>
        </div>

        {/* Gráfico */}
        <div className="rounded-2xl border border-white/5 bg-white/[0.02] p-6 mb-6">
          <h2 className="text-lg font-bold text-white mb-4">📈 EVOLUÇÃO NAS ÚLTIMAS 8 SEMANAS</h2>
          <div className="flex items-end gap-2 h-40">
            {player.weeklyEvolution.map((week) => {
              const height = (week.points / maxPoints) * 100;
              return (
                <div key={week.week} className="flex-1 flex flex-col items-center gap-1">
                  <div className="text-[10px] text-white/50 font-medium">{week.points}</div>
                  <div className="w-full rounded-t bg-gradient-to-t from-primary to-primary-light" style={{ height: `${height}%`, minHeight: "4px" }} />
                  <div className="text-[10px] text-white/30">{week.week}</div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Conquistas */}
        <div className="rounded-2xl border border-white/5 bg-white/[0.02] p-6">
          <h2 className="text-lg font-bold text-white mb-4">🏆 CONQUISTAS</h2>
          <div className="flex flex-wrap gap-2">
            {player.achievements.map((ach) => (
              <span key={ach} className="px-3 py-1.5 rounded-lg bg-accent/10 border border-accent/20 text-accent text-sm">{ach}</span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}