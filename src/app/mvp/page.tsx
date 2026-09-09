import MVPClient from "./MVPClient";
import { createClient } from "@supabase/supabase-js";

export const revalidate = 60;

export default async function MVPPage() {
  const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);

  const { data: players, error } = await supabase
    .from("players")
    .select("id, nick, name, role, avatar, points")
    .order("points", { ascending: false });

  if (error) console.error("MVPPage error:", error.message);

  return <MVPClient initialPlayers={players ?? []} />;
}
