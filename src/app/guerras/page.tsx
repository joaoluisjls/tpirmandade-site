import { fetchWars, fetchSettings, fetchChampionships } from "@/lib/data";
import GuerrasClient from "./GuerrasClient";

export const revalidate = 30;

export default async function GuerrasPage() {
  const [rawWars, settings, rawChamps] = await Promise.all([
    fetchWars(),
    fetchSettings(),
    fetchChampionships(),
  ]);

  const wars = rawWars.map((w: any) => ({
    id: w.id, opponent: w.opponent, date: w.date, time: w.time,
    status: w.status, result: w.result, guildScore: w.guild_score,
    opponentScore: w.opponent_score, mvp: w.mvp_nick,
  }));

  const guild = { name: settings.guild_name ?? "", tag: settings.guild_tag ?? "" };

  return <GuerrasClient wars={wars} guild={guild} championships={rawChamps} />;
}
