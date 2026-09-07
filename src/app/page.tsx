import { fetchPlayers, fetchWars, fetchSettings, fetchAchievements, fetchAnnouncements } from "@/lib/data";
import HomePageClient from "./HomeClient";

export default async function HomePage() {
  const [players, wars, settings, achievements, announcements] = await Promise.all([
    fetchPlayers(),
    fetchWars(),
    fetchSettings(),
    fetchAchievements(),
    fetchAnnouncements(),
  ]);

  return (
    <HomePageClient
      players={players.map((p: any) => ({
        id: p.id, nick: p.nick, name: p.name, role: p.role,
        joinedAt: p.joined_at, avatar: p.avatar ?? "", status: p.status,
        points: p.points, bio: p.bio,
      }))}
      wars={wars.map((w: any) => ({
        id: w.id, opponent: w.opponent, date: w.date, time: w.time,
        status: w.status, result: w.result, guildScore: w.guild_score,
        opponentScore: w.opponent_score, mvp: w.mvp_nick,
      }))}
      achievements={achievements.map((a: any) => ({
        id: a.id, title: a.title, description: a.description,
        date: a.date, icon: a.icon, responsible: a.responsible,
      }))}
      announcements={announcements.map((a: any) => ({
        id: a.id, title: a.title, content: a.content,
        date: a.date, time: a.time, priority: a.priority,
      }))}
      settings={settings}
    />
  );
}
