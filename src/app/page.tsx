import HomePageClient from "./HomeClient";
import { createClient } from "@supabase/supabase-js";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);

  const [p, w, a, an, s] = await Promise.all([
    supabase.from("players").select("id, nick, name, role, status, points, avatar, joined_at, bio"),
    supabase.from("wars").select("id, opponent, date, time, status, result, guild_score, opponent_score, mvp_nick"),
    supabase.from("achievements").select("id, title, description, date, icon, responsible"),
    supabase.from("announcements").select("id, title, content, date, time, priority"),
    supabase.from("guild_settings").select("key, value"),
  ]);

  if (p.error) console.error("HomePage players error:", p.error.message);

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
