import RankingClient from "./RankingClient";
import { getAnonClient } from "@/lib/supabase";

export default async function RankingPage() {
  const supabase = getAnonClient();
  const { data: players } = await supabase
    .from("players")
    .select("id, nick, name, role, avatar, status, points")
    .order("points", { ascending: false });

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
