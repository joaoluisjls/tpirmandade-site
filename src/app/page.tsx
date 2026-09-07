import HomePageClient from "./HomeClient";
import { getAnonClient } from "@/lib/supabase";

export default async function HomePage() {
  const supabase = getAnonClient();

  const [p, w, a, an, s] = await Promise.all([
    supabase.from("players").select("id, nick, name, role, status, points, avatar, joined_at, bio"),
    supabase.from("wars").select("id, opponent, date, time, status, result, guild_score, opponent_score, mvp_nick"),
    supabase.from("achievements").select("id, title, description, date, icon, responsible"),
    supabase.from("announcements").select("id, title, content, date, time, priority"),
    supabase.from("guild_settings").select("key, value"),
  ]);

  const settings: Record<string, string> = {};
  s.data?.forEach((item: any) => { settings[item.key] = item.value; });

  return (
    <HomePageClient
      initialPlayers={p.data ?? []}
      initialWars={w.data ?? []}
      initialAchievements={a.data ?? []}
      initialAnnouncements={an.data ?? []}
      initialSettings={settings}
    />
  );
}
