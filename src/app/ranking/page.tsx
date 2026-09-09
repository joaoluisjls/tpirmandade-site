import RankingClient from "./RankingClient";
import { createClient } from "@supabase/supabase-js";

export const revalidate = 60;

export default async function RankingPage() {
  const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);

  const [players, metaRes] = await Promise.all([
    supabase.from("players").select("id, nick, name, role, avatar, status, points").order("points", { ascending: false }),
    supabase.from("guild_settings").select("key, value").eq("key", "points_meta"),
  ]);

  const metaRaw = metaRes.data?.[0]?.value;
  let meta = { current_week: "", current_month: "", weeks: [] as string[], months: [] as string[] };
  try { if (metaRaw) meta = JSON.parse(metaRaw); } catch {}

  return <RankingClient initialPlayers={players.data ?? []} initialMeta={meta} />;
}
