import JogadoresClient from "./JogadoresClient";
import { createClient } from "@supabase/supabase-js";

export const revalidate = 60;

export default async function JogadoresPage() {
  const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);
  const { data: players, error } = await supabase
    .from("players")
    .select("id, nick, name, role, avatar, status, points")
    .order("points", { ascending: false });

  if (error) console.error("JogadoresPage error:", error.message);

  return <JogadoresClient initialPlayers={players ?? []} />;
}
