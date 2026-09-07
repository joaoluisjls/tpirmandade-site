import JogadoresClient from "./JogadoresClient";
import { getAnonClient } from "@/lib/supabase";

export default async function JogadoresPage() {
  const supabase = getAnonClient();
  const { data: players } = await supabase
    .from("players")
    .select("id, nick, name, role, avatar, status, points, bio")
    .order("points", { ascending: false });

  return <JogadoresClient initialPlayers={players ?? []} />;
}
