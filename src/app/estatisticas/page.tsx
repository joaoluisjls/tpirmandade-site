"use client";

import { useEffect, useState } from "react";
import {
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, PieChart, Pie, Cell, AreaChart, Area,
} from "recharts";

const COLORS = ["#ff4655", "#f59e0b", "#06b6d4", "#10b981", "#8b5cf6", "#ec4899"];

interface Player {
  id: string;
  nick: string;
  name: string;
  role: string;
  status: string;
  kills: number;
  wins: number;
  matches: number;
}

interface War {
  id: string;
  result: string;
  status: string;
}

const CustomTooltip = ({ active, payload, label }: { active?: boolean; payload?: Array<{ value: number; name: string }>; label?: string }) => {
  if (active && payload && payload.length) {
    return (
      <div className="rounded-lg px-3 py-2 bg-black/90 border border-white/10 text-xs">
        <p className="text-white/40 mb-1">{label}</p>
        {payload.map((p, i) => (
          <p key={i} className="text-white font-bold">{p.name}: {p.value.toLocaleString()}</p>
        ))}
      </div>
    );
  }
  return null;
};

export default function EstatisticasPage() {
  const [stats, setStats] = useState({
    members: 0,
    wins: 0,
    wars: 0,
    kills: 0,
    mvps: 156,
    winRate: "0.0",
    weeklyEvolution: [
      { week: "Sem 1", points: 120 },
      { week: "Sem 2", points: 185 },
      { week: "Sem 3", points: 210 },
      { week: "Sem 4", points: 195 },
      { week: "Sem 5", points: 240 },
      { week: "Sem 6", points: 280 },
      { week: "Sem 7", points: 310 },
      { week: "Sem 8", points: 295 },
    ],
    winsVsLosses: [
      { name: "Vitórias", value: 0 },
      { name: "Derrotas", value: 0 },
    ],
    killsPerWeek: [
      { week: "Sem 1", kills: 45 },
      { week: "Sem 2", kills: 52 },
      { week: "Sem 3", kills: 38 },
      { week: "Sem 4", kills: 61 },
      { week: "Sem 5", kills: 48 },
      { week: "Sem 6", kills: 55 },
      { week: "Sem 7", kills: 67 },
      { week: "Sem 8", kills: 58 },
    ],
    participation: [
      { name: "Jogador1", matches: 42 },
      { name: "Jogador2", matches: 38 },
      { name: "Jogador3", matches: 35 },
      { name: "Jogador4", matches: 30 },
      { name: "Jogador5", matches: 28 },
    ],
  });

  useEffect(() => {
    Promise.all([fetch("/api/players").then((r) => r.json()), fetch("/api/wars").then((r) => r.json())]).then(
      ([players, wars]: [Player[], War[]]) => {
        const finishedWars = wars.filter((w) => w.status === "finished");
        const wins = wars.filter((w) => w.result === "victory").length;
        const kills = players.reduce((sum, p) => sum + (p.kills || 0), 0);
        const warsCount = finishedWars.length;
        const winRate = warsCount > 0 ? (wins / warsCount) * 100 : 0;

        const topPlayers = [...players].sort((a, b) => (b.matches || 0) - (a.matches || 0)).slice(0, 5);

        setStats((prev) => ({
          ...prev,
          members: players.length,
          wins,
          wars: warsCount,
          kills,
          winRate: winRate.toFixed(1),
          winsVsLosses: [
            { name: "Vitórias", value: wins },
            { name: "Derrotas", value: warsCount - wins },
          ],
          participation: topPlayers.map((p) => ({
            name: p.nick,
            matches: p.matches || 0,
          })),
        }));
      }
    );
  }, []);

  return (
    <div className="pt-28 pb-20">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <h1 className="text-3xl sm:text-4xl font-black text-white text-center mb-10">📊 ESTATÍSTICAS DA GUILDA</h1>

        {/* Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mb-10">
          {[
            { icon: "👥", label: "Membros", value: stats.members },
            { icon: "🏆", label: "Vitórias", value: stats.wins },
            { icon: "⚔️", label: "Guerras", value: stats.wars },
            { icon: "🔥", label: "Abates", value: stats.kills.toLocaleString() },
            { icon: "⭐", label: "MVPs", value: stats.mvps },
            { icon: "📈", label: "Win Rate", value: `${stats.winRate}%` },
          ].map((stat) => (
            <div key={stat.label} className="rounded-xl border border-white/5 bg-white/[0.02] p-4 text-center">
              <div className="text-xl mb-1">{stat.icon}</div>
              <div className="text-lg font-black text-white">{stat.value}</div>
              <div className="text-[10px] text-white/40 uppercase">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Gráficos */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="rounded-2xl border border-white/5 bg-white/[0.02] p-5">
            <h3 className="text-base font-bold text-white mb-4">📈 Evolução Semanal</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={stats.weeklyEvolution}>
                  <defs>
                    <linearGradient id="gPoints" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#ff4655" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#ff4655" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                  <XAxis dataKey="week" stroke="rgba(255,255,255,0.3)" fontSize={11} />
                  <YAxis stroke="rgba(255,255,255,0.3)" fontSize={11} />
                  <Tooltip content={<CustomTooltip />} />
                  <Area type="monotone" dataKey="points" name="Pontos" stroke="#ff4655" fillOpacity={1} fill="url(#gPoints)" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="rounded-2xl border border-white/5 bg-white/[0.02] p-5">
            <h3 className="text-base font-bold text-white mb-4">🏆 Vitórias x Derrotas</h3>
            <div className="h-64 flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={stats.winsVsLosses} cx="50%" cy="50%" innerRadius={55} outerRadius={85} paddingAngle={5} dataKey="value">
                    <Cell fill="#10b981" />
                    <Cell fill="#ef4444" />
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex justify-center gap-4 mt-2 text-xs text-white/50">
              <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-emerald-500" /> Vitórias ({stats.wins})</span>
              <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-red-500" /> Derrotas ({stats.wars - stats.wins})</span>
            </div>
          </div>

          <div className="rounded-2xl border border-white/5 bg-white/[0.02] p-5">
            <h3 className="text-base font-bold text-white mb-4">🔥 Abates por Semana</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stats.killsPerWeek}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                  <XAxis dataKey="week" stroke="rgba(255,255,255,0.3)" fontSize={11} />
                  <YAxis stroke="rgba(255,255,255,0.3)" fontSize={11} />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="kills" name="Abates" fill="#f59e0b" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="rounded-2xl border border-white/5 bg-white/[0.02] p-5">
            <h3 className="text-base font-bold text-white mb-4">👥 Participação</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stats.participation} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                  <XAxis type="number" stroke="rgba(255,255,255,0.3)" fontSize={11} />
                  <YAxis type="category" dataKey="name" stroke="rgba(255,255,255,0.3)" fontSize={11} width={70} />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="matches" name="Partidas" radius={[0, 4, 4, 0]}>
                    {stats.participation.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}