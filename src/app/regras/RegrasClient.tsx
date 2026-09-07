"use client";

import { useState, useEffect } from "react";
import { getSupabase } from "@/lib/supabase-browser";

interface Rule {
  id: string;
  title: string;
  content: string;
  category: string;
}

const categories: Record<string, { label: string; icon: string; color: string }> = {
  respeito: { label: "Respeito", icon: "🤝", color: "text-blue-400" },
  participação: { label: "Participação", icon: "⚔️", color: "text-emerald-400" },
  conduta: { label: "Conduta", icon: "📜", color: "text-yellow-400" },
  evolução: { label: "Evolução", icon: "📈", color: "text-purple-400" },
};

export default function RegrasClient() {
  const [rules, setRules] = useState<Rule[]>([]);

  useEffect(() => {
    getSupabase().from("rules").select("id, title, content, category").then(({ data }) => {
      setRules(data ?? []);
    });
  }, []);

  return (
    <div className="pt-28 pb-20">
      <div className="max-w-3xl mx-auto px-4 sm:px-6">
        <h1 className="text-3xl sm:text-4xl font-black text-white text-center mb-10">📜 REGRAS DA GUILDA</h1>
        <div className="rounded-xl border border-primary/30 bg-primary/5 p-5 mb-8">
          <div className="flex items-start gap-3">
            <div className="text-2xl">⚠️</div>
            <div>
              <h3 className="font-bold text-primary mb-1 text-sm">TOLERÂNCIA ZERO</h3>
              <p className="text-sm text-white/50">A TP&IRMANDADE tem tolerância zero com racismo, preconceito, discriminação ou assédio. Membros que violarem serão removidos imediatamente.</p>
            </div>
          </div>
        </div>
        <div className="space-y-3">
          {rules.map((rule) => {
            const cat = categories[rule.category];
            return (
              <div key={rule.id} className="rounded-xl border border-white/5 bg-white/[0.02] p-4">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center font-black text-sm text-white shrink-0">{rule.id}</div>
                  <div className="flex-1">
                    <p className="text-white/80 text-sm">{rule.content}</p>
                    <div className="flex items-center gap-2 mt-1.5">
                      <span className={`text-xs ${cat?.color || "text-white/30"}`}>{cat?.icon} {cat?.label}</span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
