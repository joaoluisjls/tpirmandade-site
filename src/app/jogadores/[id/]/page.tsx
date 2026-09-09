import PlayerProfileClient from "./PlayerProfileClient";
import { createClient } from "@supabase/supabase-js";
import { notFound } from "next/navigation";

export const revalidate = 60;

export default async function PlayerProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY!);

  const { data, error } = await supabase
    .from("players")
    .select("id, nick, name, role, status, bio, joined_at, avatar, matches, wins, kills, deaths, headshot_rate, avg_damage, win_rate, points, weekly_evolution, achievements")
    .eq("id", id)
    .single();

  if (error) console.error("PlayerProfilePage error:", error.message);
  if (!data) notFound();

  const { data: settingsData } = await supabase
    .from("guild_settings")
    .select("value").eq("key", "points_total").single();

  const pointsTotal = settingsData ? JSON.parse(settingsData.value) : 0;

  return <PlayerProfileClient player={data} pointsTotal={pointsTotal} />;
}
