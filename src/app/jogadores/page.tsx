import { fetchPlayers } from "@/lib/data";
import JogadoresClient from "./JogadoresClient";

export const revalidate = 30;

export default async function JogadoresPage() {
  const rawPlayers = await fetchPlayers();
  const players = rawPlayers.map((p: any) => ({
    id: p.id, nick: p.nick, name: p.name, role: p.role,
    joinedAt: p.joined_at, avatar: p.avatar ?? "", status: p.status,
    stats: {
      matches: p.matches, wins: p.wins, kills: p.kills, deaths: p.deaths,
      kd: p.kd, headshots: p.headshots, headshotRate: p.headshot_rate,
      avgDamage: p.avg_damage, winRate: p.win_rate, points: p.points,
    },
    bio: p.bio,
  }));

  return <JogadoresClient players={players} />;
}
