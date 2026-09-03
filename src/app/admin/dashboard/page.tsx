"use client";

import { useEffect, useState } from "react";

export default function AdminDashboard() {
  const [stats, setStats] = useState({ players: 0, wars: 0, wins: 0, achievements: 0, announcements: 0 });

  useEffect(() => {
    Promise.all([
      fetch("/api/players").then((r) => r.json()),
      fetch("/api/wars").then((r) => r.json()),
      fetch("/api/achievements").then((r) => r.json()),
      fetch("/api/announcements").then((r) => r.json()),
    ]).then(([players, wars, achievements, announcements]) => {
      const finished = Array.isArray(wars) ? wars.filter((w: { status: string }) => w.status === "finished") : [];
      const wins = finished.filter((w: { result: string }) => w.result === "victory").length;
      setStats({
        players: Array.isArray(players) ? players.length : 0,
        wars: Array.isArray(wars) ? wars.length : 0,
        wins,
        achievements: Array.isArray(achievements) ? achievements.length : 0,
        announcements: Array.isArray(announcements) ? announcements.length : 0,
      });
    });
  }, []);

  const cards = [
    { icon: "👥", label: "Jogadores", value: stats.players, color: "text-blue-400" },
    { icon: "⚔️", label: "Guerras", value: stats.wars, color: "text-primary" },
    { icon: "🏆", label: "Vitórias", value: stats.wins, color: "text-emerald-400" },
    { icon: "🎯", label: "Conquistas", value: stats.achievements, color: "text-accent" },
    { icon: "📢", label: "Avisos", value: stats.announcements, color: "text-purple-400" },
  ];

  return (
    <div>
      <h1 className="text-2xl font-black text-white mb-6">Dashboard</h1>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        {cards.map((c) => (
          <div key={c.label} className="rounded-xl border border-white/5 bg-white/[0.02] p-5">
            <div className="text-2xl mb-2">{c.icon}</div>
            <div className={`text-2xl font-black ${c.color}`}>{c.value}</div>
            <div className="text-xs text-white/40 uppercase mt-1">{c.label}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
