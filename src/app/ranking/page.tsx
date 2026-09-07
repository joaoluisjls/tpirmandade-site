import { fetchPlayers } from "@/lib/data";
import RankingClient from "./RankingClient";

export const revalidate = 30;

export default async function RankingPage() {
  const rawPlayers = await fetchPlayers();
  const players = rawPlayers.map((p: any) => ({
    id: p.id, nick: p.nick, name: p.name, role: p.role,
    avatar: p.avatar ?? "", status: p.status, points: p.points,
  }));

  return <RankingClient players={players} />;
}
