"use client";

import Link from "next/link";

interface Props {
  player: {
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
    weekly_evolution: { week: string; points: number }[];
    achievements: string[];
  };
}

export default function PlayerProfileClient({ player }: Props) {
  const p = player;
  const kd = p.deaths > 0 ? +(p.kills / p.deaths).toFixed(2) : 0;
  const maxPoints = p.weekly_evolution?.length ? Math.max(...p.weekly_evolution.map((w) => w.points)) : 0;

  return (
    <div className="pt-28 pb-20">
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        <Link href="/jogadores" className="inline-flex items-center gap-2 text-sm text-white/40 hover:text-white mb-8 transition-colors">← Voltar para jogadores</Link>

        <div className="rounded-2xl border border-white/5 bg-white/[0.02] p-8 mb-6">
          <div className="flex flex-col sm:flex-row items-center gap-6">
            <div className="relative">
              {p.avatar ? (<img src={p.avatar} alt={p.nick} className="w-24 h-24 rounded-2xl object-cover" />) : (<div className="w-24 h-24 rounded-2xl bg-white/10 flex items-center justify-center text-4xl font-black text-white">{p.nick.charAt(0)}</div>)}
              <div className={`absolute -bottom-1 -right-1 w-5 h-5 rounded-full border-2 border-[#0a0a0f] ${p.status === "online" ? "bg-emerald-400" : p.status === "away" ? "bg-yellow-400" : "bg-white/20"}`} />
            </div>
            <div className="text-center sm:text-left">
              <div className="text-xs text-primary font-bold uppercase tracking-widest mb-1">{p.role}</div>
              <h1 className="text-3xl font-black text-white mb-1">{p.nick}</h1>
              <p className="text-sm text-white/40">{p.name}</p>
              <p className="text-xs text-white/30 mt-1">Entrada: {p.joined_at}</p>
              {p.bio && <p className="text-sm text-white/50 mt-2 italic">&ldquo;{p.bio}&rdquo;</p>}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-3 mb-6">
          <div className="rounded-xl border border-white/5 bg-white/[0.02] p-4 text-center">
            <div className="text-lg mb-1">⭐</div>
            <div className="text-2xl font-black text-primary">{p.points.toLocaleString()}</div>
            <div className="text-[10px] text-white/40 uppercase">Pontos</div>
          </div>
        </div>

        {p.weekly_evolution?.length > 0 && (
          <div className="rounded-2xl border border-white/5 bg-white/[0.02] p-6 mb-6">
            <h2 className="text-lg font-bold text-white mb-4">📈 EVOLUÇÃO NAS ÚLTIMAS 8 SEMANAS</h2>
            <div className="flex items-end gap-2 h-40">
              {p.weekly_evolution.map((week) => {
                const height = maxPoints > 0 ? (week.points / maxPoints) * 100 : 0;
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
        )}

        {p.achievements?.length > 0 && (
          <div className="rounded-2xl border border-white/5 bg-white/[0.02] p-6">
            <h2 className="text-lg font-bold text-white mb-4">🏆 CONQUISTAS</h2>
            <div className="flex flex-wrap gap-2">
              {p.achievements.map((ach) => (
                <span key={ach} className="px-3 py-1.5 rounded-lg bg-accent/10 border border-accent/20 text-accent text-sm">{ach}</span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
