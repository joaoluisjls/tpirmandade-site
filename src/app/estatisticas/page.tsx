import { fetchPlayers, fetchWars } from "@/lib/data";
import EstatisticasClient from "./EstatisticasClient";

export default async function EstatisticasPage() {
  const [rawPlayers, rawWars] = await Promise.all([fetchPlayers(), fetchWars()]);

  const players = rawPlayers.map((p: any) => ({
    id: p.id, nick: p.nick, name: p.name, role: p.role, status: p.status,
    kills: p.kills, wins: p.wins, matches: p.matches,
  }));

  const wars = rawWars.map((w: any) => ({
    id: w.id, result: w.result, status: w.status,
  }));

  return <EstatisticasClient players={players} wars={wars} />;
}
