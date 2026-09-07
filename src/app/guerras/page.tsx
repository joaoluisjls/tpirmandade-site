import GuerrasClient from "./GuerrasClient";
import { getAnonClient } from "@/lib/supabase";

export default async function GuerrasPage() {
  const supabase = getAnonClient();

  const [w, s, c] = await Promise.all([
    supabase.from("wars").select("id, opponent, date, time, status, result, guild_score, opponent_score, mvp_nick"),
    supabase.from("guild_settings").select("key, value"),
    supabase.from("championships").select("*"),
  ]);

  const settingsMap: Record<string, string> = {};
  s.data?.forEach((item: any) => { settingsMap[item.key] = item.value; });

  return (
    <GuerrasClient
      initialWars={w.data ?? []}
      initialGuildName={settingsMap.guild_name ?? ""}
      initialGuildTag={settingsMap.guild_tag ?? ""}
      initialChampionships={c.data ?? []}
    />
  );
}
