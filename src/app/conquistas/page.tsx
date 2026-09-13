import ConquistasClient from "./ConquistasClient";
import { sql } from "@/lib/db";

export const revalidate = 60;

export default async function ConquistasPage() {
  const { rows: achievements } = await sql`SELECT id, title, description, date, icon, responsible FROM achievements ORDER BY date DESC LIMIT 50`;

  return <ConquistasClient initialAchievements={(achievements as any[]) ?? []} />;
}
