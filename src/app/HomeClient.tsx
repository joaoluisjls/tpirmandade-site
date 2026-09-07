"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { getSupabase } from "@/lib/supabase-browser";

interface Player {
  id: string;
  nick: string;
  name: string;
  role: string;
  joinedAt: string;
  avatar: string;
  status: "online" | "away" | "offline";
  points: number;
  bio?: string;
}

interface War {
  id: string;
  opponent: string;
  date: string;
  time: string;
  status: "upcoming" | "preparation" | "finished";
  result?: "victory" | "defeat";
  guildScore?: number;
  opponentScore?: number;
  mvp?: string;
}

interface Achievement {
  id: string;
  title: string;
  description: string;
  date: string;
  icon: string;
  responsible: string;
}

interface Announcement {
  id: string;
  title: string;
  content: string;
  date: string;
  time: string;
  priority: "high" | "medium" | "low";
}

interface GuildSettings {
  [key: string]: string;
}

function StatCard({ label, value, icon }: { label: string; value: string | number; icon: string }) {
  return (
    <div className="rounded-2xl border border-white/5 bg-white/[0.02] p-6 text-center hover:bg-white/[0.04] transition-colors">
      <div className="text-3xl mb-3">{icon}</div>
      <div className="text-3xl sm:text-4xl font-black text-white mb-1">{value}</div>
      <div className="text-xs text-white/40 uppercase tracking-wider font-medium">{label}</div>
    </div>
  );
}

const GUILD_HISTORY = [
  { year: "2024", title: "Fundação da Guilda", description: "TP&IRMANDADE nasce com o objetivo de criar uma comunidade forte e competitiva." },
  { year: "2025", title: "Primeira Grande Conquista", description: "A guilda conquista seu primeiro título em campeonato regional." },
  { year: "2026", title: "Expansão da Equipe", description: "A equipe cresce para 18 membros ativos, expandindo seu alcance competitivo." },
  { year: "2026", title: "Nova Temporada Competitiva", description: "Início de uma nova era com ranking crescente e estatísticas recordes." },
];

const GUILD_MVP_KEY = "tpi_guild_mvp";
interface GuildMVP { mvp_id: string; top3_ids: string[]; }

interface Props {
  initialPlayers: any[];
  initialWars: any[];
  initialAchievements: any[];
  initialAnnouncements: any[];
  initialSettings: Record<string, string>;
}

export default function HomePageClient({ initialPlayers, initialWars, initialAchievements, initialAnnouncements, initialSettings }: Props) {
  const [players, setPlayers] = useState<any[]>(initialPlayers);
  const [wars, setWars] = useState<any[]>(initialWars);
  const [achievements, setAchievements] = useState<any[]>(initialAchievements);
  const [announcements, setAnnouncements] = useState<any[]>(initialAnnouncements);
  const [settings, setSettings] = useState<GuildSettings>(initialSettings);
  const [guildMVPData, setGuildMVPData] = useState<GuildMVP>({ mvp_id: "", top3_ids: [] });

  useEffect(() => {
    const db = getSupabase();
    Promise.all([
      db.from("players").select("id, nick, name, role, status, points, avatar, joined_at, bio"),
      db.from("wars").select("id, opponent, date, time, status, result, guild_score, opponent_score, mvp_nick"),
      db.from("achievements").select("id, title, description, date, icon, responsible"),
      db.from("announcements").select("id, title, content, date, time, priority"),
      db.from("guild_settings").select("key, value"),
    ]).then(([p, w, a, an, s]) => {
      setPlayers(p.data ?? []);
      setWars(w.data ?? []);
      setAchievements(a.data ?? []);
      setAnnouncements(an.data ?? []);
      const settings2: Record<string, string> = {};
      s.data?.forEach((item: any) => { settings2[item.key] = item.value; });
      setSettings(settings2);
    });
    try { setGuildMVPData(JSON.parse(localStorage.getItem(GUILD_MVP_KEY) || '{"mvp_id":"","top3_ids":[]}')); } catch { /* */ }
  }, []);

  const guild = {
    name: settings?.guild_name ?? "",
    tag: settings?.guild_tag ?? "",
    slogan: settings?.guild_slogan ?? "",
    motto: settings?.guild_motto ?? "",
    guildRanking: 14,
    season: "Temporada 8",
    activeMembers: players.length,
    totalWins: wars.filter((w) => w.result === "victory").length,
  };

  const guildStats = {
    members: players.length,
    wins: wars.filter((w) => w.result === "victory").length,
    wars: wars.filter((w) => w.status === "finished").length,
    kills: players.reduce((sum, p) => sum + (p.points || 0), 0),
    mvps: 156,
    winRate: (() => {
      const finished = wars.filter((w) => w.status === "finished").length;
      const victories = wars.filter((w) => w.result === "victory").length;
      return finished > 0 ? Number(((victories / finished) * 100).toFixed(1)) : 0;
    })(),
  };

  const sorted = [...players].sort((a, b) => b.points - a.points);
  const weeklyMVP = sorted[0];
  const weeklyTop3 = sorted.slice(0, 3);

  const guildMVPPlayer = guildMVPData.mvp_id ? players.find((p) => p.id === guildMVPData.mvp_id) : null;
  const guildTop3 = guildMVPData.top3_ids.map((id) => players.find((p) => p.id === id)).filter(Boolean) as Player[];

  const upcomingWar = wars.find((w) => w.status === "upcoming" || w.status === "preparation");

  const medals = ["🥇", "🥈", "🥉"];

  return (
    <div className="pt-24">
      {/* Hero */}
      <section className="relative min-h-[85vh] flex items-center justify-center">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-transparent to-transparent" />
        <div className="absolute inset-0" style={{ backgroundImage: "radial-gradient(rgba(255,255,255,0.02) 1px, transparent 1px)", backgroundSize: "40px 40px" }} />

        <div className="relative z-10 max-w-5xl mx-auto px-4 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-sm text-white/60 mb-8">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            Ranking #{guild.guildRanking} · {guild.season}
          </div>

          <img src="/logo.jpg" alt="TP&IRMANDADE" className="w-24 h-24 rounded-2xl object-cover shadow-lg shadow-primary/20 mb-8 mx-auto" />

          <h1 className="text-5xl sm:text-7xl font-black text-white mb-4 tracking-tight">
            {guild.name}
          </h1>

          <p className="text-lg text-white/50 max-w-xl mx-auto mb-3 italic">
            &ldquo;{guild.slogan}&rdquo;
          </p>

          <p className="text-sm text-primary font-bold uppercase tracking-widest mb-10">
            {guild.motto}
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4 mb-16">
            <Link href="/ranking" className="px-8 py-4 rounded-xl bg-gradient-to-r from-primary to-primary-dark text-white font-bold hover:shadow-lg hover:shadow-primary/30 transition-all">
              VER RANKING
            </Link>
            <Link href="/jogadores" className="px-8 py-4 rounded-xl border border-white/10 text-white/70 font-medium hover:bg-white/5 transition-all">
              CONHECER A GUILDA
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-3xl mx-auto">
            {[
              { icon: "🏆", label: "Ranking", value: `#${guild.guildRanking}` },
              { icon: "👥", label: "Membros", value: guild.activeMembers },
              { icon: "🔥", label: "Vitórias", value: guild.totalWins },
              { icon: "⭐", label: "MVP", value: weeklyMVP?.nick || "—" },
            ].map((stat) => (
              <div key={stat.label} className="rounded-xl border border-white/5 bg-white/[0.02] p-4 text-center">
                <div className="text-xl mb-1">{stat.icon}</div>
                <div className="text-lg font-bold text-white">{stat.value}</div>
                <div className="text-[10px] text-white/40 uppercase tracking-wider">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* MVP DA SEMANA */}
      <section className="py-20">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <h2 className="text-2xl sm:text-3xl font-black text-white text-center mb-3">🏆 MVP DA SEMANA</h2>
          <p className="text-white/30 text-center text-sm mb-10">Escolhido automaticamente por pontos</p>

          {weeklyMVP && (
            <div className="max-w-2xl mx-auto rounded-2xl border border-accent/20 bg-accent/5 p-8 sm:p-10">
              <div className="flex flex-col sm:flex-row items-center gap-8">
                <div className="relative shrink-0">
                  {weeklyMVP.avatar ? (
                    <img src={weeklyMVP.avatar} alt={weeklyMVP.nick} className="w-28 h-28 rounded-2xl object-cover" />
                  ) : (
                    <div className="w-28 h-28 rounded-2xl bg-gradient-to-br from-accent to-primary flex items-center justify-center text-4xl font-black text-white">{weeklyMVP.nick.charAt(0)}</div>
                  )}
                  <div className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-accent flex items-center justify-center text-sm">👑</div>
                </div>

                <div className="flex-1 text-center sm:text-left">
                  <div className="text-xs text-accent font-bold uppercase tracking-widest mb-2">MVP DA SEMANA</div>
                  <h3 className="text-3xl font-black text-white mb-1">{weeklyMVP.nick}</h3>
                  <p className="text-sm text-white/40 mb-4">{weeklyMVP.role}</p>
                  <div className="text-2xl font-black text-primary">{weeklyMVP.points} pontos</div>
                  {weeklyMVP.bio && <p className="text-sm text-white/40 italic mt-2">&ldquo;{weeklyMVP.bio}&rdquo;</p>}
                </div>
              </div>
              <div className="mt-8 text-center">
                <Link href={`/jogadores/${weeklyMVP.id}`} className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-accent to-accent-light text-black font-bold text-sm hover:shadow-lg transition-all">VER PERFIL COMPLETO →</Link>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Top 3 da Semana */}
      <section className="py-20">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <h2 className="text-2xl sm:text-3xl font-black text-white text-center mb-10">🏅 TOP 3 DA SEMANA</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {weeklyTop3.map((player, index) => (
              <div key={player.id} className={`rounded-2xl border p-6 ${index === 0 ? "border-accent/30 bg-accent/5" : "border-white/5 bg-white/[0.02]"}`}>
                <div className="text-center">
                  <div className="text-4xl mb-3">{medals[index]}</div>
                  {player.avatar ? (
                    <img src={player.avatar} alt={player.nick} className={`w-16 h-16 rounded-xl mx-auto mb-3 object-cover ${index === 0 ? "ring-2 ring-accent" : ""}`} />
                  ) : (
                    <div className={`w-16 h-16 rounded-xl mx-auto mb-3 flex items-center justify-center text-xl font-black text-white ${index === 0 ? "bg-gradient-to-br from-accent to-primary" : "bg-white/10"}`}>{player.nick.charAt(0)}</div>
                  )}
                  <h3 className="text-lg font-black text-white mb-1">{player.nick}</h3>
                  <p className="text-xs text-white/40 mb-4">{player.role}</p>
                  <div className="text-sm font-bold text-primary">{player.points} pontos</div>
                  <Link href={`/jogadores/${player.id}`} className="mt-3 inline-block text-xs text-white/30 hover:text-primary transition-colors">VER PERFIL →</Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* MVP DA GUILDA */}
      {guildMVPPlayer && (
        <section className="py-20">
          <div className="max-w-5xl mx-auto px-4 sm:px-6">
            <h2 className="text-2xl sm:text-3xl font-black text-white text-center mb-3">👑 MVP DA GUILDA</h2>
            <p className="text-white/30 text-center text-sm mb-10">Escolhido pelo administrador</p>

            <div className="max-w-2xl mx-auto rounded-2xl border border-primary/20 bg-primary/5 p-8 sm:p-10">
              <div className="flex flex-col sm:flex-row items-center gap-8">
                <div className="relative shrink-0">
                  {guildMVPPlayer.avatar ? (
                    <img src={guildMVPPlayer.avatar} alt={guildMVPPlayer.nick} className="w-28 h-28 rounded-2xl object-cover" />
                  ) : (
                    <div className="w-28 h-28 rounded-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center text-4xl font-black text-white">{guildMVPPlayer.nick.charAt(0)}</div>
                  )}
                  <div className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-primary flex items-center justify-center text-sm">👑</div>
                </div>

                <div className="flex-1 text-center sm:text-left">
                  <div className="text-xs text-primary font-bold uppercase tracking-widest mb-2">MVP DA GUILDA</div>
                  <h3 className="text-3xl font-black text-white mb-1">{guildMVPPlayer.nick}</h3>
                  <p className="text-sm text-white/40 mb-4">{guildMVPPlayer.role}</p>
                  <div className="text-2xl font-black text-primary">{guildMVPPlayer.points} pontos</div>
                  {guildMVPPlayer.bio && <p className="text-sm text-white/40 italic mt-2">&ldquo;{guildMVPPlayer.bio}&rdquo;</p>}
                </div>
              </div>
              <div className="mt-8 text-center">
                <Link href={`/jogadores/${guildMVPPlayer.id}`} className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-primary to-primary-dark text-white font-bold text-sm hover:shadow-lg transition-all">VER PERFIL COMPLETO →</Link>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Top 3 da Guilda */}
      {guildTop3.length > 0 && (
        <section className="py-20">
          <div className="max-w-5xl mx-auto px-4 sm:px-6">
            <h2 className="text-2xl sm:text-3xl font-black text-white text-center mb-10">🏅 TOP 3 DA GUILDA</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {guildTop3.map((player, index) => (
                <div key={player.id} className={`rounded-2xl border p-6 ${index === 0 ? "border-primary/30 bg-primary/5" : "border-white/5 bg-white/[0.02]"}`}>
                  <div className="text-center">
                    <div className="text-4xl mb-3">{medals[index]}</div>
                    {player.avatar ? (
                      <img src={player.avatar} alt={player.nick} className={`w-16 h-16 rounded-xl mx-auto mb-3 object-cover ${index === 0 ? "ring-2 ring-primary" : ""}`} />
                    ) : (
                      <div className={`w-16 h-16 rounded-xl mx-auto mb-3 flex items-center justify-center text-xl font-black text-white ${index === 0 ? "bg-gradient-to-br from-primary to-accent" : "bg-white/10"}`}>{player.nick.charAt(0)}</div>
                    )}
                    <h3 className="text-lg font-black text-white mb-1">{player.nick}</h3>
                    <p className="text-xs text-white/40 mb-4">{player.role}</p>
                    <div className="text-sm font-bold text-primary">{player.points} pontos</div>
                    <Link href={`/jogadores/${player.id}`} className="mt-3 inline-block text-xs text-white/30 hover:text-primary transition-colors">VER PERFIL →</Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Stats */}
      <section className="py-20">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <h2 className="text-2xl sm:text-3xl font-black text-white text-center mb-10">📊 NÚMEROS DA GUILDA</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            <StatCard icon="👥" label="Membros" value={guildStats.members} />
            <StatCard icon="🏆" label="Vitórias" value={guildStats.wins} />
            <StatCard icon="⚔️" label="Guerras" value={guildStats.wars} />
            <StatCard icon="🔥" label="Pontos Total" value={guildStats.kills.toLocaleString()} />
            <StatCard icon="⭐" label="MVPs" value={guildStats.mvps} />
            <StatCard icon="📈" label="Win Rate" value={`${guildStats.winRate}%`} />
          </div>
        </div>
      </section>

      {/* Próxima Guerra */}
      {upcomingWar && (
        <section className="py-20">
          <div className="max-w-3xl mx-auto px-4 sm:px-6">
            <h2 className="text-2xl sm:text-3xl font-black text-white text-center mb-10">⚔️ PRÓXIMA GUERRA</h2>
            <div className="rounded-2xl border border-primary/20 bg-primary/5 p-8 text-center">
              <div className="flex items-center justify-center gap-8 mb-6">
                <div className="text-center">
                  <img src="/logo.jpg" alt="TP&IRMANDADE" className="w-14 h-14 rounded-xl object-cover mx-auto mb-2" />
                  <div className="text-xs font-bold text-white">{guild.name}</div>
                </div>
                <div className="text-2xl font-black text-primary">VS</div>
                <div className="text-center">
                  <div className="w-14 h-14 rounded-xl bg-white/10 flex items-center justify-center font-black text-lg text-white mx-auto mb-2 border border-white/10">{upcomingWar.opponent.split(" ").map((w: string) => w.charAt(0)).join("")}</div>
                  <div className="text-xs font-bold text-white">{upcomingWar.opponent}</div>
                </div>
              </div>
              <div className="text-lg text-white/60 mb-3">{upcomingWar.date} — {upcomingWar.time}</div>
              <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/20 border border-primary/30 text-primary text-sm font-bold">
                <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                {upcomingWar.status === "preparation" ? "PREPARAÇÃO" : "AGENDADA"}
              </span>
            </div>
          </div>
        </section>
      )}

      {/* Avisos */}
      <section className="py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <h2 className="text-2xl sm:text-3xl font-black text-white text-center mb-10">📢 AVISOS DA GUILDA</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {announcements.slice(0, 4).map((ann: any) => {
              const colors: Record<string, string> = { high: "border-primary/30 bg-primary/5", medium: "border-accent/20 bg-accent/5", low: "border-white/10 bg-white/[0.02]" };
              return (
                <div key={ann.id} className={`rounded-xl border p-5 ${colors[ann.priority as string] || colors.low}`}>
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="font-bold text-white text-sm">{ann.title}</h3>
                    <span className="text-[10px] text-white/30 whitespace-nowrap ml-3">{ann.date}</span>
                  </div>
                  <p className="text-sm text-white/50">{ann.content}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Conquistas */}
      <section className="py-20">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <h2 className="text-2xl sm:text-3xl font-black text-white text-center mb-10">🏆 NOSSAS CONQUISTAS</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {achievements.map((ach) => (
              <div key={ach.id} className="rounded-2xl border border-white/5 bg-white/[0.02] p-6 hover:bg-white/[0.04] transition-colors">
                <div className="text-3xl mb-3">{ach.icon}</div>
                <h3 className="text-base font-bold text-white mb-2">{ach.title}</h3>
                <p className="text-sm text-white/40 mb-3">{ach.description}</p>
                <div className="flex items-center justify-between text-xs text-white/30">
                  <span>{ach.date}</span>
                  <span>{ach.responsible}</span>
                </div>
              </div>
            ))}
          </div>
          <div className="text-center mt-8">
            <Link href="/conquistas" className="inline-flex items-center gap-2 px-6 py-3 rounded-xl border border-white/10 text-white/70 font-medium text-sm hover:bg-white/5 transition-all">VER TODAS →</Link>
          </div>
        </div>
      </section>

      {/* História */}
      <section className="py-20">
        <div className="max-w-3xl mx-auto px-4 sm:px-6">
          <h2 className="text-2xl sm:text-3xl font-black text-white text-center mb-10">📖 NOSSA HISTÓRIA</h2>
          <div className="space-y-6">
            {GUILD_HISTORY.map((item, index) => (
              <div key={index} className="flex gap-5">
                <div className="flex flex-col items-center">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-xs font-black text-white shrink-0">{item.year.slice(2)}</div>
                  {index < GUILD_HISTORY.length - 1 && <div className="w-px flex-1 bg-white/10 mt-2" />}
                </div>
                <div className="pb-6">
                  <div className="text-xs text-primary font-bold mb-1">{item.year}</div>
                  <h3 className="font-bold text-white mb-1">{item.title}</h3>
                  <p className="text-sm text-white/40">{item.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
