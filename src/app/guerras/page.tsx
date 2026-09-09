import GuerrasClient from "./GuerrasClient";
import { createClient } from "@supabase/supabase-js";

export const revalidate = 60;

export default async function GuerrasPage() {
  const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);

  const [w, guildRes, c] = await Promise.all([
    supabase.from("wars").select("id, opponent, date, time, status, result, guild_score, opponent_score, mvp_nick").limit(20),
    supabase.from("guild_settings").select("key, value").in("key", ["guild_name", "guild_tag"]),
    supabase.from("championships").select("*").limit(10),
  ]);

  if (w.error) console.error("GuerrasPage wars error:", w.error.message);

  const settingsMap: Record<string, string> = {};
  guildRes.data?.forEach((item: any) => { settingsMap[item.key] = item.value; });

  return (
    <GuerrasClient
      initialWars={w.data ?? []}
      initialGuildName={settingsMap.guild_name ?? ""}
      initialGuildTag={settingsMap.guild_tag ?? ""}
      initialChampionships={c.data ?? []}
    />
  );
}
