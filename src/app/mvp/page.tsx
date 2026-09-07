import MVPClient from "./MVPClient";
import { getAnonClient } from "@/lib/supabase";

export default async function MVPPage() {
  const supabase = getAnonClient();
  const { data: players } = await supabase
    .from("players")
    .select("id, nick, name, role, avatar, points, bio")
    .order("points", { ascending: false });

  return <MVPClient initialPlayers={players ?? []} />;
}
