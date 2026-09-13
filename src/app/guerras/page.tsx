import GuerrasClient from "./GuerrasClient";
import { sql } from "@/lib/db";

export const revalidate = 60;

export default async function GuerrasPage() {
  const [warsResult, guildResult, championshipsResult] = await Promise.all([
    sql`SELECT id, opponent, date, time, status, result, guild_score, opponent_score, mvp_nick FROM wars ORDER BY date DESC LIMIT 20`,
    sql`SELECT key, value FROM guild_settings WHERE key IN ('guild_name', 'guild_tag')`,
    sql`SELECT * FROM championships ORDER BY date DESC LIMIT 10`,
  ]);

  const settingsMap: Record<string, string> = {};
  guildResult.rows.forEach((item: any) => { settingsMap[item.key] = item.value; });

  return (
    <GuerrasClient
      initialWars={(warsResult.rows as any[]) ?? []}
      initialGuildName={settingsMap.guild_name ?? ""}
      initialGuildTag={settingsMap.guild_tag ?? ""}
      initialChampionships={(championshipsResult.rows as any[]) ?? []}
    />
  );
}
