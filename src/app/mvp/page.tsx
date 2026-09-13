import MVPClient from "./MVPClient";
import { sql } from "@/lib/db";

export const revalidate = 60;

export default async function MVPPage() {
  const { rows: players } = await sql`SELECT id, nick, name, role, avatar, points FROM players ORDER BY points DESC`;

  return <MVPClient initialPlayers={(players as any[]) ?? []} />;
}
