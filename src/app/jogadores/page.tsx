import JogadoresClient from "./JogadoresClient";
import { sql } from "@/lib/db";

export const revalidate = 60;

export default async function JogadoresPage() {
  const { rows: players } = await sql`SELECT id, nick, name, role, avatar, status, points FROM players ORDER BY points DESC`;

  return <JogadoresClient initialPlayers={(players as any[]) ?? []} />;
}
