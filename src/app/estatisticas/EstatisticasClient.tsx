"use client";

import { useState, useEffect } from "react";
import { getSupabase } from "@/lib/supabase-browser";

interface Player {
  id: string;
  nick: string;
  name: string;
  role: string;
  avatar: string;
  status: string;
  points: number;
  joined_at?: string;
  bio?: string;
}

interface GuildSettings {
  [key: string]: string;
}

export default function EstatisticasClient({ initialPlayers, initialSettings }: { initialPlayers: Player[]; initialSettings: GuildSettings }) {
  const [players, setPlayers] = useState<Player[]>(initialPlayers);
  const [settings] = useState<GuildSettings>(initialSettings);

  useEffect(() => {
    getSupabase().from("players").select("id, nick, name, role, avatar, status, points, joined_at, bio").order("points", { ascending: false }).then(({ data }) => {
      if (data) setPlayers(data as Player[]);
    });
  }, []);

  const owner = players.find((p) => p.nick === "CORINGA");
  const admins = players.filter((p) => p.role === "ADM" && p.nick !== "CORINGA");
  const totalPoints = players.reduce((sum, p) => sum + (p.points || 0), 0);

  const guild = {
    name: settings.guild_name || "TP&IRMANDADE",
    tag: settings.guild_tag || "T.I",
    slogan: settings.guild_slogan || "",
    motto: settings.guild_motto || "",
    description: settings.guild_description || "",
  };

  return (
    <div className="pt-28 pb-20">
      <div className="max-w-5xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-12">
          <img src="/logo.jpg" alt="TP&IRMANDADE" className="w-24 h-24 rounded-2xl object-cover shadow-lg shadow-primary/20 mx-auto mb-6" />
          <h1 className="text-4xl sm:text-5xl font-black text-white mb-3">{guild.name}</h1>
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-sm text-white/60 mb-4">
            Tag: <span className="font-bold text-primary">{guild.tag}</span>
          </div>
          <p className="text-lg text-white/50 italic max-w-xl mx-auto">&ldquo;{guild.slogan}&rdquo;</p>
          <p className="text-sm text-primary font-bold uppercase tracking-widest mt-3">{guild.motto}</p>
        </div>

        {guild.description && (
          <div className="rounded-2xl border border-white/5 bg-white/[0.02] p-6 mb-8">
            <h2 className="text-lg font-bold text-white mb-3">📖 SOBRE A GUILDA</h2>
            <p className="text-sm text-white/50 leading-relaxed">{guild.description}</p>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {owner && (
            <div className="rounded-2xl border border-yellow-500/20 bg-yellow-500/5 p-6">
              <div className="flex items-center gap-2 mb-4">
                <span className="text-2xl">👑</span>
                <h3 className="text-lg font-bold text-yellow-400">DONO DA GUILDA</h3>
              </div>
              <div className="flex items-center gap-4">
                {owner.avatar ? (<img src={owner.avatar} alt={owner.nick} className="w-16 h-16 rounded-xl object-cover ring-2 ring-yellow-500/30" />) : (<div className="w-16 h-16 rounded-xl bg-gradient-to-br from-yellow-500 to-orange-500 flex items-center justify-center text-2xl font-black text-white">{owner.nick.charAt(0)}</div>)}
                <div>
                  <div className="text-lg font-black text-white">{owner.nick}</div>
                  <div className="text-sm text-white/40">{owner.name}</div>
                  <div className="text-xs text-white/30 mt-1">{owner.points?.toLocaleString()} pontos</div>
                </div>
              </div>
            </div>
          )}

          <div className="rounded-2xl border border-primary/20 bg-primary/5 p-6">
            <div className="flex items-center gap-2 mb-4">
              <span className="text-2xl">🛡️</span>
              <h3 className="text-lg font-bold text-primary">ADMINISTRADORES</h3>
            </div>
            {admins.length > 0 ? (
              <div className="space-y-3">
                {admins.map((admin) => (
                  <div key={admin.id} className="flex items-center gap-3">
                    {admin.avatar ? (<img src={admin.avatar} alt={admin.nick} className="w-12 h-12 rounded-lg object-cover" />) : (<div className="w-12 h-12 rounded-lg bg-white/10 flex items-center justify-center text-lg font-bold text-white">{admin.nick.charAt(0)}</div>)}
                    <div>
                      <div className="font-bold text-white text-sm">{admin.nick}</div>
                      <div className="text-xs text-white/40">{admin.name}</div>
                    </div>
                  </div>
                ))}
              </div>
            ) : <p className="text-sm text-white/30">Nenhum administrador definido</p>}
          </div>
        </div>

        <div className="rounded-2xl border border-white/5 bg-white/[0.02] p-6 mb-8">
          <h2 className="text-lg font-bold text-white mb-4">📊 RESUMO</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-3xl font-black text-white">{players.length}</div>
              <div className="text-xs text-white/40 uppercase">Membros</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-black text-primary">{totalPoints.toLocaleString()}</div>
              <div className="text-xs text-white/40 uppercase">Pontos Total</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-black text-yellow-400">1</div>
              <div className="text-xs text-white/40 uppercase">Dono</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-black text-emerald-400">{admins.length}</div>
              <div className="text-xs text-white/40 uppercase">Admins</div>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-white/5 bg-white/[0.02] p-6">
          <h2 className="text-lg font-bold text-white mb-4">👥 TODOS OS MEMBROS ({players.length})</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {players.map((player) => (
              <div key={player.id} className="flex items-center gap-3 p-3 rounded-xl bg-white/[0.02] border border-white/5">
                <div className="relative shrink-0">
                  {player.avatar ? (<img src={player.avatar} alt={player.nick} className="w-10 h-10 rounded-lg object-cover" />) : (<div className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center text-sm font-bold text-white">{player.nick.charAt(0)}</div>)}
                  <div className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-[#0a0a0f] ${player.status === "online" ? "bg-emerald-400" : player.status === "away" ? "bg-yellow-400" : "bg-white/20"}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-white text-sm truncate">{player.nick}</span>
                    {player.role === "ADM" && <span className="text-[9px] px-1.5 py-0.5 rounded bg-primary/20 text-primary font-bold">ADM</span>}
                  </div>
                  <div className="text-[11px] text-white/30 truncate">{player.name}</div>
                </div>
                <div className="text-right shrink-0">
                  <div className="text-sm font-bold text-primary">{player.points?.toLocaleString()}</div>
                  <div className="text-[9px] text-white/30">pts</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
