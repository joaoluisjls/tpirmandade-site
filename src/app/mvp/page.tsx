"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

interface Player { id: string; nick: string; name: string; role: string; avatar: string; points: number; bio?: string; }

const GUILD_KEY = "tpi_guild_mvp";
interface GuildMVP { mvp_id: string; top3_ids: string[]; }
function getGuildMVP(): GuildMVP {
  if (typeof window === "undefined") return { mvp_id: "", top3_ids: [] };
  try { return JSON.parse(localStorage.getItem(GUILD_KEY) || '{"mvp_id":"","top3_ids":[]}'); } catch { return { mvp_id: "", top3_ids: [] }; }
}

function mapPlayer(raw: any): Player {
  return { id: raw.id, nick: raw.nick, name: raw.name, role: raw.role, avatar: raw.avatar ?? "", points: raw.points, bio: raw.bio };
}

function PlayerCard({ player, subtitle, ring }: { player: Player; subtitle?: string; ring?: boolean }) {
  return (
    <div className="text-center">
      {player.avatar ? (
        <img src={player.avatar} alt={player.nick} className={`w-24 h-24 rounded-2xl mx-auto mb-3 object-cover ${ring ? "ring-2 ring-accent" : ""}`} />
      ) : (
        <div className={`w-24 h-24 rounded-2xl mx-auto mb-3 flex items-center justify-center text-3xl font-black text-white ${ring ? "bg-gradient-to-br from-accent to-primary" : "bg-white/10"}`}>{player.nick.charAt(0)}</div>
      )}
      <h3 className="text-lg font-black text-white mb-0.5">{player.nick}</h3>
      <p className="text-xs text-white/30 mb-1">{player.role}</p>
      {subtitle && <p className="text-xs text-white/40 mb-1">{subtitle}</p>}
      <div className="text-sm font-bold text-primary">{player.points} pontos</div>
      {player.bio && <p className="text-xs text-white/30 mt-1 italic">&ldquo;{player.bio}&rdquo;</p>}
      <Link href={`/jogadores/${player.id}`} className="mt-2 inline-block text-xs text-white/30 hover:text-primary transition-colors">VER PERFIL →</Link>
    </div>
  );
}

export default function MVPPage() {
  const [weekly, setWeekly] = useState<Player[]>([]);
  const [guildMVP, setGuildMVP] = useState<Player | null>(null);
  const [guildTop3, setGuildTop3] = useState<Player[]>([]);

  useEffect(() => {
    async function load() {
      const rawPlayers: any[] = await (await fetch("/api/players")).json();
      const players = rawPlayers.map(mapPlayer);
      const sorted = [...players].sort((a, b) => b.points - a.points);
      setWeekly(sorted.slice(0, 3));

      const g = getGuildMVP();
      if (g.mvp_id) { const p = players.find((x) => x.id === g.mvp_id); if (p) setGuildMVP(p); }
      if (g.top3_ids.length) { setGuildTop3(g.top3_ids.map((id) => players.find((x) => x.id === id)).filter(Boolean) as Player[]); }
    }
    load();
  }, []);

  const medals = ["🥇", "🥈", "🥉"];

  return (
    <div className="pt-28 pb-20">
      <div className="max-w-5xl mx-auto px-4 sm:px-6">

        {/* MVP DA SEMANA - Automático */}
        <h1 className="text-3xl sm:text-4xl font-black text-white text-center mb-2">🏆 MVP DA SEMANA</h1>
        <p className="text-white/30 text-center text-sm mb-10">Escolhido automaticamente por pontos</p>

        {weekly[0] && (
          <div className="max-w-2xl mx-auto rounded-2xl border border-accent/20 bg-accent/5 p-8 mb-12">
            <div className="text-center mb-6">
              <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-accent/20 border border-accent/30 text-accent text-xs font-bold">🏆 MVP DA SEMANA</span>
            </div>
            <div className="flex flex-col sm:flex-row items-center gap-6">
              <div className="relative shrink-0">
                {weekly[0].avatar ? (
                  <img src={weekly[0].avatar} alt={weekly[0].nick} className="w-32 h-32 rounded-2xl object-cover" />
                ) : (
                  <div className="w-32 h-32 rounded-2xl bg-gradient-to-br from-accent to-primary flex items-center justify-center text-5xl font-black text-white">{weekly[0].nick.charAt(0)}</div>
                )}
                <div className="absolute -top-2 -right-2 w-10 h-10 rounded-full bg-accent flex items-center justify-center text-xl">👑</div>
              </div>
              <div className="flex-1 text-center sm:text-left">
                <div className="text-xs text-accent font-bold uppercase tracking-widest mb-1">{weekly[0].role}</div>
                <h2 className="text-3xl font-black text-white mb-1">{weekly[0].nick}</h2>
                <p className="text-white/40 text-sm mb-2">{weekly[0].name}</p>
                {weekly[0].bio && <p className="text-sm text-white/50 italic mb-3">&ldquo;{weekly[0].bio}&rdquo;</p>}
                <div className="text-2xl font-black text-primary">{weekly[0].points} pontos</div>
              </div>
            </div>
            <div className="mt-6 text-center">
              <Link href={`/jogadores/${weekly[0].id}`} className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-accent to-accent-light text-black font-bold text-sm hover:shadow-lg transition-all">VER PERFIL COMPLETO →</Link>
            </div>
          </div>
        )}

        {/* Top 3 da Semana */}
        <h2 className="text-xl font-black text-white mb-6 text-center">🏅 TOP 3 DA SEMANA</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-16">
          {weekly.map((player, i) => (
            <div key={player.id} className={`rounded-2xl border p-6 text-center ${i === 0 ? "border-accent/30 bg-accent/5" : "border-white/5 bg-white/[0.02]"}`}>
              <div className="text-4xl mb-3">{medals[i]}</div>
              {player.avatar ? (
                <img src={player.avatar} alt={player.nick} className={`w-16 h-16 rounded-xl mx-auto mb-3 object-cover ${i === 0 ? "ring-2 ring-accent" : ""}`} />
              ) : (
                <div className={`w-16 h-16 rounded-xl mx-auto mb-3 flex items-center justify-center text-xl font-black text-white ${i === 0 ? "bg-gradient-to-br from-accent to-primary" : "bg-white/10"}`}>{player.nick.charAt(0)}</div>
              )}
              <h3 className="text-lg font-black text-white mb-1">{player.nick}</h3>
              <p className="text-xs text-white/30 mb-1">{player.role}</p>
              <div className="text-sm font-bold text-primary">{player.points} pontos</div>
              <Link href={`/jogadores/${player.id}`} className="mt-3 inline-block text-xs text-white/30 hover:text-primary transition-colors">VER PERFIL →</Link>
            </div>
          ))}
        </div>

        {/* MVP DA GUILDA - Manual */}
        {guildMVP && (
          <>
            <h1 className="text-3xl sm:text-4xl font-black text-white text-center mb-2">👑 MVP DA GUILDA</h1>
            <p className="text-white/30 text-center text-sm mb-10">Escolhido pelo administrador</p>

            <div className="max-w-2xl mx-auto rounded-2xl border border-primary/20 bg-primary/5 p-8 mb-12">
              <div className="text-center mb-6">
                <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/20 border border-primary/30 text-primary text-xs font-bold">👑 MVP DA GUILDA</span>
              </div>
              <div className="flex flex-col sm:flex-row items-center gap-6">
                <div className="relative shrink-0">
                  {guildMVP.avatar ? (
                    <img src={guildMVP.avatar} alt={guildMVP.nick} className="w-32 h-32 rounded-2xl object-cover" />
                  ) : (
                    <div className="w-32 h-32 rounded-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center text-5xl font-black text-white">{guildMVP.nick.charAt(0)}</div>
                  )}
                  <div className="absolute -top-2 -right-2 w-10 h-10 rounded-full bg-primary flex items-center justify-center text-xl">👑</div>
                </div>
                <div className="flex-1 text-center sm:text-left">
                  <div className="text-xs text-primary font-bold uppercase tracking-widest mb-1">{guildMVP.role}</div>
                  <h2 className="text-3xl font-black text-white mb-1">{guildMVP.nick}</h2>
                  <p className="text-white/40 text-sm mb-2">{guildMVP.name}</p>
                  {guildMVP.bio && <p className="text-sm text-white/50 italic mb-3">&ldquo;{guildMVP.bio}&rdquo;</p>}
                  <div className="text-2xl font-black text-primary">{guildMVP.points} pontos</div>
                </div>
              </div>
              <div className="mt-6 text-center">
                <Link href={`/jogadores/${guildMVP.id}`} className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-primary to-primary-dark text-white font-bold text-sm hover:shadow-lg transition-all">VER PERFIL COMPLETO →</Link>
              </div>
            </div>
          </>
        )}

        {guildTop3.length > 0 && (
          <>
            <h2 className="text-xl font-black text-white mb-6 text-center">🏅 TOP 3 DA GUILDA</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {guildTop3.map((player, i) => (
                <div key={player.id} className={`rounded-2xl border p-6 text-center ${i === 0 ? "border-primary/30 bg-primary/5" : "border-white/5 bg-white/[0.02]"}`}>
                  <div className="text-4xl mb-3">{medals[i]}</div>
                  {player.avatar ? (
                    <img src={player.avatar} alt={player.nick} className={`w-16 h-16 rounded-xl mx-auto mb-3 object-cover ${i === 0 ? "ring-2 ring-primary" : ""}`} />
                  ) : (
                    <div className={`w-16 h-16 rounded-xl mx-auto mb-3 flex items-center justify-center text-xl font-black text-white ${i === 0 ? "bg-gradient-to-br from-primary to-accent" : "bg-white/10"}`}>{player.nick.charAt(0)}</div>
                  )}
                  <h3 className="text-lg font-black text-white mb-1">{player.nick}</h3>
                  <p className="text-xs text-white/30 mb-1">{player.role}</p>
                  <div className="text-sm font-bold text-primary">{player.points} pontos</div>
                  <Link href={`/jogadores/${player.id}`} className="mt-3 inline-block text-xs text-white/30 hover:text-primary transition-colors">VER PERFIL →</Link>
                </div>
              ))}
            </div>
          </>
        )}

        {!guildMVP && guildTop3.length === 0 && (
          <div className="text-center text-white/20 py-10 border border-dashed border-white/10 rounded-2xl">
            <p className="text-lg">👑 MVP da Guilda ainda não foi definido</p>
            <p className="text-sm mt-1">O administrador pode definir na aba de configurações</p>
          </div>
        )}
      </div>
    </div>
  );
}
