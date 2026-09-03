"use client";

import { useEffect, useState } from "react";

interface Player { id: string; nick: string; name: string; points: number; role: string; avatar: string; }

const GUILD_KEY = "tpi_guild_mvp";

interface GuildMVP { mvp_id: string; top3_ids: string[]; }

function getGuildMVP(): GuildMVP {
  if (typeof window === "undefined") return { mvp_id: "", top3_ids: [] };
  try { return JSON.parse(localStorage.getItem(GUILD_KEY) || '{"mvp_id":"","top3_ids":[]}'); } catch { return { mvp_id: "", top3_ids: [] }; }
}

function saveGuildMVP(data: GuildMVP) { localStorage.setItem(GUILD_KEY, JSON.stringify(data)); }

export default function AdminMVP() {
  const [players, setPlayers] = useState<Player[]>([]);
  const [guild, setGuild] = useState<GuildMVP>({ mvp_id: "", top3_ids: [] });
  const [toast, setToast] = useState("");

  useEffect(() => {
    fetch("/api/players").then((r) => r.json()).then((d) => {
      setPlayers(d.map((p: any) => ({ id: p.id, nick: p.nick, name: p.name, points: p.points, role: p.role, avatar: p.avatar || "" })));
    });
    setGuild(getGuildMVP());
  }, []);

  const sorted = [...players].sort((a, b) => b.points - a.points);
  const weeklyMVP = sorted[0];
  const weeklyTop3 = sorted.slice(0, 3);

  const save = () => { saveGuildMVP(guild); setToast("MVP da Guilda salvo!"); };

  const toggleTop3 = (id: string) => {
    setGuild((prev) => {
      const has = prev.top3_ids.includes(id);
      const next = has ? prev.top3_ids.filter((x) => x !== id) : prev.top3_ids.length < 3 ? [...prev.top3_ids, id] : prev.top3_ids;
      return { ...prev, top3_ids: next };
    });
  };

  const getPlayer = (id: string) => players.find((p) => p.id === id);

  return (
    <div>
      {toast && (
        <div className="fixed top-4 right-4 z-[100] bg-green-500 text-white px-4 py-3 rounded-lg shadow-lg flex items-center gap-3">
          <span className="text-sm font-bold">{toast}</span>
          <button onClick={() => setToast("")} className="text-white/70 hover:text-white text-lg leading-none">&times;</button>
        </div>
      )}

      {/* MVP DA SEMANA - Automático */}
      <h1 className="text-2xl font-black text-white mb-2">🏆 MVP da Semana (Automático)</h1>
      <p className="text-white/30 text-sm mb-6">Calculado automaticamente por pontos. Sem edição.</p>

      {weeklyMVP && (
        <div className="max-w-lg rounded-xl border border-accent/20 bg-accent/5 p-6 mb-8">
          <div className="flex items-center gap-4">
            {weeklyMVP.avatar ? (
              <img src={weeklyMVP.avatar} alt={weeklyMVP.nick} className="w-16 h-16 rounded-xl object-cover" />
            ) : (
              <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-accent to-primary flex items-center justify-center text-2xl font-black text-white">{weeklyMVP.nick.charAt(0)}</div>
            )}
            <div>
              <div className="text-xs text-accent font-bold">MVP DA SEMANA</div>
              <div className="text-xl font-black text-white">{weeklyMVP.nick}</div>
              <div className="text-sm text-primary font-bold">{weeklyMVP.points} pontos</div>
            </div>
          </div>
        </div>
      )}

      <h2 className="text-lg font-bold text-white mb-3">🏅 Top 3 da Semana (Automático)</h2>
      <div className="grid grid-cols-3 gap-3 mb-10">
        {weeklyTop3.map((p, i) => {
          const medals = ["🥇", "🥈", "🥉"];
          return (
            <div key={p.id} className="rounded-xl border border-white/5 bg-white/[0.02] p-4 text-center">
              <div className="text-2xl mb-1">{medals[i]}</div>
              {p.avatar ? <img src={p.avatar} alt={p.nick} className="w-10 h-10 rounded-lg mx-auto mb-1 object-cover" /> : <div className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center font-bold text-sm text-white mx-auto mb-1">{p.nick.charAt(0)}</div>}
              <div className="font-bold text-white text-sm">{p.nick}</div>
              <div className="text-xs text-primary">{p.points} pts</div>
            </div>
          );
        })}
      </div>

      {/* MVP DA GUILDA - Manual */}
      <h1 className="text-2xl font-black text-white mb-2">👑 MVP da Guilda (Manual)</h1>
      <p className="text-white/30 text-sm mb-6">Escolhido pelo administrador. Fique para sempre na história da guilda.</p>

      <div className="max-w-lg rounded-xl border border-white/5 bg-white/[0.02] p-6 mb-6 space-y-4">
        <div>
          <label className="block text-xs font-bold text-white/40 uppercase tracking-wider mb-1.5">Selecionar MVP da Guilda</label>
          <select value={guild.mvp_id} onChange={(e) => setGuild((prev) => ({ ...prev, mvp_id: e.target.value }))} className="w-full px-3 py-2.5 rounded-lg bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-primary/50">
            <option value="" className="bg-[#0a0a0f]">Selecione um jogador</option>
            {players.map((p) => <option key={p.id} value={p.id} className="bg-[#0a0a0f]">{p.nick} ({p.points} pts)</option>)}
          </select>
        </div>

        {guild.mvp_id && (() => { const p = getPlayer(guild.mvp_id); return p ? (
          <div className="flex items-center gap-3 p-3 rounded-lg bg-accent/10 border border-accent/20">
            {p.avatar ? <img src={p.avatar} alt={p.nick} className="w-12 h-12 rounded-xl object-cover" /> : <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-accent to-primary flex items-center justify-center text-lg font-black text-white">{p.nick.charAt(0)}</div>}
            <div><div className="font-bold text-white">{p.nick}</div><div className="text-xs text-primary">{p.points} pontos</div></div>
          </div>
        ) : null; })()}

        <div>
          <label className="block text-xs font-bold text-white/40 uppercase tracking-wider mb-1.5">Top 3 da Guilda (clique para selecionar até 3)</label>
          <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto">
            {players.map((p) => {
              const selected = guild.top3_ids.includes(p.id);
              const pos = guild.top3_ids.indexOf(p.id);
              return (
                <button key={p.id} onClick={() => toggleTop3(p.id)} className={`flex items-center gap-2 p-2 rounded-lg text-left text-sm transition-colors ${selected ? "bg-primary/20 border border-primary/30 text-white" : "bg-white/5 border border-white/5 text-white/50 hover:bg-white/10"}`}>
                  {selected && <span className="text-xs font-bold text-primary">#{pos + 1}</span>}
                  {p.avatar ? <img src={p.avatar} alt={p.nick} className="w-7 h-7 rounded object-cover" /> : <div className="w-7 h-7 rounded bg-white/10 flex items-center justify-center text-[10px] font-bold text-white">{p.nick.charAt(0)}</div>}
                  <div className="flex-1 truncate"><div className="font-medium truncate">{p.nick}</div><div className="text-[10px] text-white/30">{p.points} pts</div></div>
                </button>
              );
            })}
          </div>
        </div>

        <button onClick={save} className="px-6 py-2.5 rounded-lg bg-primary text-white text-sm font-bold hover:shadow-lg hover:shadow-primary/20 transition-all">
          Salvar MVP da Guilda
        </button>
      </div>
    </div>
  );
}
