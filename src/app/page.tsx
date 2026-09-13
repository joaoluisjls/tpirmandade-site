import HomePageClient from "./HomeClient";
import { sql } from "@/lib/db";

export const revalidate = 60;

export default async function HomePage() {
  const adminKeys = ["guild_name", "guild_tag", "discord", "instagram", "tiktok", "youtube", "whatsapp"];

  const [playersResult, warsResult, achievementsResult, announcementsResult, settingsResult] = await Promise.all([
    sql`SELECT id, nick, name, role, status, points, avatar FROM players ORDER BY points DESC LIMIT 10`,
    sql`SELECT id, opponent, date, time, status, result, guild_score, opponent_score, mvp_nick FROM wars ORDER BY date DESC LIMIT 5`,
    sql`SELECT id, title, description, date, icon, responsible FROM achievements ORDER BY date DESC LIMIT 5`,
    sql`SELECT id, title, content, date, time, priority FROM announcements ORDER BY date DESC LIMIT 5`,
    sql`SELECT key, value FROM guild_settings WHERE key IN ('guild_name', 'guild_tag', 'discord', 'instagram', 'tiktok', 'youtube', 'whatsapp')`,
  ]);

  const settings: Record<string, string> = {};
  settingsResult.rows.forEach((item: any) => { settings[item.key] = item.value; });

  return (
    <HomePageClient
      initialPlayers={(playersResult.rows as any[]) ?? []}
      initialWars={(warsResult.rows as any[]) ?? []}
      initialAchievements={(achievementsResult.rows as any[]) ?? []}
      initialAnnouncements={(announcementsResult.rows as any[]) ?? []}
      initialSettings={settings}
    />
  );
}
