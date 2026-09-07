import { fetchPlayers } from "@/lib/data";
import MVPClient from "./MVPClient";

export const revalidate = 30;

export default async function MVPPage() {
  const rawPlayers = await fetchPlayers();
  const players = rawPlayers.map((p: any) => ({
    id: p.id, nick: p.nick, name: p.name, role: p.role,
    avatar: p.avatar ?? "", points: p.points, bio: p.bio,
  }));

  return <MVPClient players={players} />;
}
