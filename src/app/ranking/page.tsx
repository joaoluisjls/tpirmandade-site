import RankingClient from "./RankingClient";
import { createClient } from "@supabase/supabase-js";

export const dynamic = "force-dynamic";

export default async function RankingPage() {
  const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);

  const { data: players, error } = await supabase
    .from("players")
    .select("id, nick, name, role, avatar, status, points")
    .order("points", { ascending: false });

  if (error) console.error("RankingPage error:", error.message);

  const { data: settingsData } = await supabase
    .from("guild_settings")
    .select("key, value");

  const settingsMap: Record<string, string> = {};
  settingsData?.forEach((s: any) => { settingsMap[s.key] = s.value; });

  const metaRaw = settingsMap.points_meta;
  let meta = { current_week: "", current_month: "", weeks: [] as string[], months: [] as string[] };
  try { if (metaRaw) meta = JSON.parse(metaRaw); } catch {}

  return <RankingClient initialPlayers={players ?? []} initialMeta={meta} />;
}
