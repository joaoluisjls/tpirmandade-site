"use client";

import { useEffect, useState } from "react";

interface Achievement {
  id: string;
  title: string;
  description: string;
  date: string;
  icon: string;
  responsible: string;
}

export default function ConquistasPage() {
  const [achievements, setAchievements] = useState<Achievement[]>([]);

  useEffect(() => {
    fetch("/api/achievements")
      .then((res) => res.json())
      .then((data) => setAchievements(data));
  }, []);

  return (
    <div className="pt-28 pb-20">
      <div className="max-w-5xl mx-auto px-4 sm:px-6">
        <h1 className="text-3xl sm:text-4xl font-black text-white text-center mb-10">🏆 NOSSAS CONQUISTAS</h1>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {achievements.map((ach) => (
            <div key={ach.id} className="rounded-2xl border border-white/5 bg-white/[0.02] p-6 hover:bg-white/[0.04] transition-colors">
              <div className="text-4xl mb-3">{ach.icon}</div>
              <h3 className="text-base font-bold text-white mb-2">{ach.title}</h3>
              <p className="text-sm text-white/40 mb-4">{ach.description}</p>
              <div className="flex items-center justify-between text-xs text-white/30 pt-3 border-t border-white/5">
                <span>📅 {ach.date}</span>
                <span>👤 {ach.responsible}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}