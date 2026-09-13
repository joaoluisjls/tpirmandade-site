import type { Metadata } from "next";
import EstatisticasClient from "./EstatisticasClient";
import { sql } from "@/lib/db";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "Guilda - TP&IRMANDADE",
  description: "Conheça a TP&IRMANDADE - Dono, administradores, membros e informações da guilda.",
};

export default async function EstatisticasPage() {
  const [playersResult, leadersResult, totalResult] = await Promise.all([
    sql`SELECT id, nick, name, role, avatar, status, points FROM players ORDER BY points DESC LIMIT 100`,
    sql`SELECT key, value FROM guild_settings WHERE key IN ('guild_owner_nick', 'guild_admin_nicks')`,
    sql`SELECT value FROM guild_settings WHERE key = 'points_total'`,
  ]);

  const leadersMap: Record<string, string> = {};
  leadersResult.rows.forEach((item: any) => { leadersMap[item.key] = item.value; });

  const totalPoints = totalResult.rows[0] ? JSON.parse(totalResult.rows[0].value) : 0;
  const owner = leadersMap.guild_owner_nick || "";
  const admins = leadersMap.guild_admin_nicks ? leadersMap.guild_admin_nicks.split(",").map((s: string) => s.trim()).filter(Boolean) : [];

  return <EstatisticasClient initialPlayers={(playersResult.rows as any[]) ?? []} initialSettings={{}} initialOwner={owner} initialAdmins={admins} initialPointsTotal={totalPoints} />;
}
