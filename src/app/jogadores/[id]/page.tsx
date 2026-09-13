import PlayerProfileClient from "./PlayerProfileClient";
import { sql } from "@/lib/db";
import { notFound } from "next/navigation";

export const revalidate = 60;

export function generateStaticParams() {
  return [];
}

export default async function PlayerProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const { rows } = await sql`SELECT id, nick, name, role, status, bio, joined_at, avatar, matches, wins, kills, deaths, headshot_rate, avg_damage, win_rate, points, weekly_evolution, achievements FROM players WHERE id = ${id} LIMIT 1`;

  const data = rows[0] as any;
  if (!data) notFound();

  return <PlayerProfileClient player={data} />;
}
