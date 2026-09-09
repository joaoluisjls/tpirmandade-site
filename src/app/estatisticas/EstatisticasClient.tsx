"use client";

import { useState } from "react";

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

export default function EstatisticasClient({
  initialPlayers,
  initialSettings,
  initialOwner,
  initialAdmins,
  initialPointsTotal,
}: {
  initialPlayers: Player[];
  initialSettings: GuildSettings;
  initialOwner: string;
  initialAdmins: string[];
  initialPointsTotal: number;
}) {
  const [players] = useState<Player[]>(initialPlayers);
  const [settings] = useState<GuildSettings>(initialSettings);
  const [ownerNick] = useState(initialOwner);
  const [adminNicks] = useState(initialAdmins);

  const owner = ownerNick ? players.find((p) => p.nick === ownerNick) || null : null;
  const admins = adminNicks.length > 0 ? players.filter((p) => adminNicks.includes(p.nick)) : [];
  const totalPoints = players.reduce((sum, p) => sum + (p.points || 0), 0);

  const guild = {
    name: settings.guild_name || "TP&IRMANDADE",
    tag: settings.guild_tag || "T.I",
    slogan: settings.guild_slogan || "",
    motto: settings.guild_motto || "",
    description: settings.guild_description || "",
  };

  const socials = [
    { key: "discord", icon: "💬", label: "Discord" },
    { key: "instagram", icon: "📷", label: "Instagram" },
    { key: "tiktok", icon: "🎵", label: "TikTok" },
    { key: "youtube", icon: "🎬", label: "YouTube" },
    { key: "whatsapp", icon: "📱", label: "WhatsApp" },
  ].filter((s) => settings[s.key]);

  return (
    <div className="pt-28 pb-20">
      <div className="max-w-5xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-12">
          <img src="/logo.jpg" alt="TP&IRMANDADE" className="w-24 h-24 rounded-2xl object-cover shadow-lg shadow-primary/20 mx-auto mb-6" />
          <h1 className="text-4xl sm:text-5xl font-black text-white mb-3">{guild.name}</h1>
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-sm text-white/60 mb-4">
            Tag: <span className="font-bold text-primary">{guild.tag}</span>
          </div>
          {guild.slogan && <p className="text-lg text-white/50 italic max-w-xl mx-auto">&ldquo;{guild.slogan}&rdquo;</p>}
          {guild.motto && <p className="text-sm text-primary font-bold uppercase tracking-widest mt-3">{guild.motto}</p>}
        </div>

        {guild.description && (
          <div className="rounded-2xl border border-white/5 bg-white/[0.02] p-6 mb-8">
            <h2 className="text-lg font-bold text-white mb-3">📖 SOBRE A GUILDA</h2>
            <p className="text-sm text-white/50 leading-relaxed whitespace-pre-line">{guild.description}</p>
          </div>
        )}

        {(owner || admins.length > 0) && (
          <div className="rounded-2xl border border-white/5 bg-white/[0.02] p-8 mb-8">
            <h2 className="text-lg font-bold text-white mb-8 text-center">LIDERANÇA</h2>
            <div className="flex flex-col items-center gap-6">
              {owner && (
                <div className="flex flex-col items-center">
                  <div className="relative mb-3">
                    {owner.avatar ? (
                      <img src={owner.avatar} alt={owner.nick} className="w-24 h-24 rounded-2xl object-cover ring-4 ring-yellow-500/30 shadow-lg shadow-yellow-500/10" />
                    ) : (
                      <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-yellow-500 to-orange-500 flex items-center justify-center text-4xl font-black text-white shadow-lg shadow-yellow-500/10">{owner.nick.charAt(0)}</div>
                    )}
                    <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full bg-yellow-500/20 border border-yellow-500/30 text-[10px] font-bold text-yellow-400 uppercase tracking-wider">👑 DONO</div>
                  </div>
                  <div className="text-center mt-2">
                    <div className="text-xl font-black text-white">{owner.nick}</div>
                    <div className="text-sm text-white/40">{owner.name}</div>
                    {owner.points != null && <div className="text-xs text-primary font-bold mt-1">{owner.points.toLocaleString()} pontos</div>}
                  </div>
                </div>
              )}
              {admins.length > 0 && (
                <>
                  <div className="w-32 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />
                  <div className="flex flex-wrap justify-center gap-6">
                    {admins.map((admin) => (
                      <div key={admin.id} className="flex flex-col items-center">
                        <div className="relative mb-2">
                          {admin.avatar ? (
                            <img src={admin.avatar} alt={admin.nick} className="w-16 h-16 rounded-xl object-cover ring-2 ring-primary/30 shadow-lg shadow-primary/10" />
                          ) : (
                            <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-primary to-red-500 flex items-center justify-center text-xl font-black text-white shadow-lg shadow-primary/10">{admin.nick.charAt(0)}</div>
                          )}
                          <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 px-2 py-0.5 rounded-full bg-primary/20 border border-primary/30 text-[8px] font-bold text-primary uppercase tracking-wider">ADM</div>
                        </div>
                        <div className="text-center mt-1">
                          <div className="text-sm font-black text-white">{admin.nick}</div>
                          <div className="text-[11px] text-white/30">{admin.name}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>
        )}

          <div className="rounded-xl border border-white/5 bg-white/[0.02] p-6 mb-6 text-center">
            <div className="text-xs text-white/40 uppercase mb-2">Total de Pontos</div>
            <div className="text-4xl font-black text-primary mb-4">{totalPoints.toLocaleString()}</div>
            <div className="grid grid-cols-3 gap-4">
              <div className="rounded-lg bg-white/5 p-3">
                <div className="text-lg font-black text-yellow-400">{admins.length > 0 ? 0 : 0}</div>
                <div className="text-[10px] text-white/40 uppercase">📅 Semana</div>
              </div>
              <div className="rounded-lg bg-white/5 p-3">
                <div className="text-lg font-black text-primary">{totalPoints.toLocaleString()}</div>
                <div className="text-[10px] text-white/40 uppercase">👤 Individual</div>
              </div>
              <div className="rounded-lg bg-white/5 p-3">
                <div className="text-lg font-black text-emerald-400">{initialPointsTotal.toLocaleString()}</div>
                <div className="text-[10px] text-white/40 uppercase">🏆 Guilda</div>
              </div>
            </div>
          </div>

        {socials.length > 0 && (
          <div className="rounded-2xl border border-white/5 bg-white/[0.02] p-6 mb-8">
            <h2 className="text-lg font-bold text-white mb-4">🔗 REDES SOCIAIS</h2>
            <div className="space-y-2">
              {socials.map((s) => (
                <div key={s.key} className="flex items-center gap-3 text-sm text-white/50">
                  <span className="text-lg">{s.icon}</span>
                  <span>{settings[s.key]}</span>
                </div>
              ))}
            </div>
          </div>
        )}

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
                    {ownerNick === player.nick && <span className="text-[9px] px-1.5 py-0.5 rounded bg-yellow-500/20 text-yellow-400 font-bold">DONO</span>}
                    {adminNicks.includes(player.nick) && <span className="text-[9px] px-1.5 py-0.5 rounded bg-primary/20 text-primary font-bold">ADM</span>}
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
