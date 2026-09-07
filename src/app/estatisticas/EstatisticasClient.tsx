"use client";

import { useState, useEffect } from "react";
import dynamic from "next/dynamic";

const RechartsArea = dynamic(() => import("recharts").then(m => {
  const { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip } = m;
  return function RechartsAreaComponent({ data }: { data: any[] }) {
    return (
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data}>
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
    );
  };
}), { ssr: false, loading: () => <div className="h-64 flex items-center justify-center text-white/20 text-sm">Carregando grafico...</div> });

const RechartsPie = dynamic(() => import("recharts").then(m => {
  const { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } = m;
  return function RechartsPieComponent({ data }: { data: any[] }) {
    return (
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie data={data} cx="50%" cy="50%" innerRadius={55} outerRadius={85} paddingAngle={5} dataKey="value">
            <Cell fill="#10b981" />
            <Cell fill="#ef4444" />
          </Pie>
          <Tooltip content={<CustomTooltip />} />
        </PieChart>
      </ResponsiveContainer>
    );
  };
}), { ssr: false, loading: () => <div className="h-64 flex items-center justify-center text-white/20 text-sm">Carregando grafico...</div> });

const RechartsBar = dynamic(() => import("recharts").then(m => {
  const { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip } = m;
  return function RechartsBarComponent({ data, dataKey, fill }: { data: any[]; dataKey: string; fill: string }) {
    return (
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
          <XAxis dataKey="week" stroke="rgba(255,255,255,0.3)" fontSize={11} />
          <YAxis stroke="rgba(255,255,255,0.3)" fontSize={11} />
          <Tooltip content={<CustomTooltip />} />
          <Bar dataKey={dataKey} name={dataKey === "kills" ? "Abates" : "Partidas"} fill={fill} radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    );
  };
}), { ssr: false, loading: () => <div className="h-64 flex items-center justify-center text-white/20 text-sm">Carregando grafico...</div> });

const COLORS = ["#ff4655", "#f59e0b", "#06b6d4", "#10b981", "#8b5cf6", "#ec4899"];

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

export default function EstatisticasClient() {
  const [stats, setStats] = useState<any>(null);

  useEffect(() => {
    Promise.all([
      fetch("/api/players").then(r => r.json()),
      fetch("/api/wars").then(r => r.json()),
    ]).then(([rawPlayers, rawWars]: [any[], any[]]) => {
      const finishedWars = rawWars.filter((w: any) => w.status === "finished");
      const wins = rawWars.filter((w: any) => w.result === "victory").length;
      const kills = rawPlayers.reduce((sum: number, p: any) => sum + (p.kills || 0), 0);
      const warsCount = finishedWars.length;
      const winRate = warsCount > 0 ? (wins / warsCount) * 100 : 0;
      const topPlayers = [...rawPlayers].sort((a: any, b: any) => (b.matches || 0) - (a.matches || 0)).slice(0, 5);

      setStats({
        members: rawPlayers.length, wins, wars: warsCount, kills, mvps: 156, winRate: winRate.toFixed(1),
        weeklyEvolution: [
          { week: "Sem 1", points: 120 }, { week: "Sem 2", points: 185 }, { week: "Sem 3", points: 210 },
          { week: "Sem 4", points: 195 }, { week: "Sem 5", points: 240 }, { week: "Sem 6", points: 280 },
          { week: "Sem 7", points: 310 }, { week: "Sem 8", points: 295 },
        ],
        winsVsLosses: [{ name: "Vitórias", value: wins }, { name: "Derrotas", value: warsCount - wins }],
        killsPerWeek: [
          { week: "Sem 1", kills: 45 }, { week: "Sem 2", kills: 52 }, { week: "Sem 3", kills: 38 },
          { week: "Sem 4", kills: 61 }, { week: "Sem 5", kills: 48 }, { week: "Sem 6", kills: 55 },
          { week: "Sem 7", kills: 67 }, { week: "Sem 8", kills: 58 },
        ],
        participation: topPlayers.map((p: any) => ({ name: p.nick, matches: p.matches || 0 })),
      });
    });
  }, []);

  if (!stats) return <div className="pt-28 pb-20 text-center text-white/40">Carregando...</div>;

  return (
    <div className="pt-28 pb-20">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <h1 className="text-3xl sm:text-4xl font-black text-white text-center mb-10">📊 ESTATÍSTICAS DA GUILDA</h1>

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

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="rounded-2xl border border-white/5 bg-white/[0.02] p-5">
            <h3 className="text-base font-bold text-white mb-4">📈 Evolução Semanal</h3>
            <div className="h-64"><RechartsArea data={stats.weeklyEvolution} /></div>
          </div>

          <div className="rounded-2xl border border-white/5 bg-white/[0.02] p-5">
            <h3 className="text-base font-bold text-white mb-4">🏆 Vitórias x Derrotas</h3>
            <div className="h-64 flex items-center justify-center"><RechartsPie data={stats.winsVsLosses} /></div>
            <div className="flex justify-center gap-4 mt-2 text-xs text-white/50">
              <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-emerald-500" /> Vitórias ({stats.wins})</span>
              <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-red-500" /> Derrotas ({stats.wars - stats.wins})</span>
            </div>
          </div>

          <div className="rounded-2xl border border-white/5 bg-white/[0.02] p-5">
            <h3 className="text-base font-bold text-white mb-4">🔥 Abates por Semana</h3>
            <div className="h-64"><RechartsBar data={stats.killsPerWeek} dataKey="kills" fill="#f59e0b" /></div>
          </div>

          <div className="rounded-2xl border border-white/5 bg-white/[0.02] p-5">
            <h3 className="text-base font-bold text-white mb-4">👥 Participação</h3>
            <div className="h-64"><RechartsBar data={stats.participation} dataKey="matches" fill="#8b5cf6" /></div>
          </div>
        </div>
      </div>
    </div>
  );
}
