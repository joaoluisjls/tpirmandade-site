import ConquistasClient from "./ConquistasClient";
import { getAnonClient } from "@/lib/supabase";

export default async function ConquistasPage() {
  const supabase = getAnonClient();
  const { data: achievements } = await supabase
    .from("achievements")
    .select("id, title, description, date, icon, responsible")
    .order("date", { ascending: false });

  return <ConquistasClient initialAchievements={achievements ?? []} />;
}
