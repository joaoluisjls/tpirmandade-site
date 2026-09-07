import GuerrasClient from "./GuerrasClient";
import { createClient } from "@supabase/supabase-js";

export const dynamic = "force-dynamic";

export default async function GuerrasPage() {
  const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);

  const [w, s, c] = await Promise.all([
    supabase.from("wars").select("id, opponent, date, time, status, result, guild_score, opponent_score, mvp_nick"),
    supabase.from("guild_settings").select("key, value"),
    supabase.from("championships").select("*"),
  ]);

  if (w.error) console.error("GuerrasPage wars error:", w.error.message);

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
