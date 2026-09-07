import PlayerProfileClient from "./PlayerProfileClient";
import { getAnonClient } from "@/lib/supabase";
import { notFound } from "next/navigation";

export default async function PlayerProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = getAnonClient();

  const { data } = await supabase
    .from("players")
    .select("id, nick, name, role, status, bio, joined_at, avatar, matches, wins, kills, deaths, headshot_rate, avg_damage, win_rate, points, weekly_evolution, achievements")
    .eq("id", id)
    .single();

  if (!data) notFound();

  return <PlayerProfileClient player={data} />;
}
