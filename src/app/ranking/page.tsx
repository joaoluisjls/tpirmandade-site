import RankingClient from "./RankingClient";
import { sql } from "@/lib/db";

export const revalidate = 60;

export default async function RankingPage() {
  const [playersRes, metaRes, totalRes, settingsRes] = await Promise.all([
    sql`SELECT id, nick, name, role, avatar, status, points FROM players ORDER BY points DESC LIMIT 100`,
    sql`SELECT value FROM guild_settings WHERE key = 'points_meta'`,
    sql`SELECT value FROM guild_settings WHERE key = 'points_total'`,
    sql`SELECT key, value FROM guild_settings`,
  ]);

  const metaRaw = metaRes.rows[0]?.value;
  let meta = { current_week: "", current_month: "", weeks: [] as string[], months: [] as string[] };
  try { if (metaRaw) meta = JSON.parse(metaRaw); } catch {}

  const totalResData = totalRes.rows[0]?.value;
  let totalPoints = 0;
  try { totalPoints = totalResData ? JSON.parse(totalResData) : 0; } catch {}

  const weekPoints: Record<string, number> = {};
  const allSettings = settingsRes.rows;
  if (allSettings) {
    const weekEntry = allSettings.find((s: any) => s.key.startsWith("points_history_") && s.key.includes("_W"));
    if (weekEntry?.value) {
      try { Object.assign(weekPoints, JSON.parse(weekEntry.value)); } catch {}
    }
  }

  if (totalPoints === 0 && playersRes.rows) {
    totalPoints = (playersRes.rows as any[]).reduce((s: number, p: any) => s + (p.points || 0), 0);
  }

  return <RankingClient initialPlayers={(playersRes.rows as any[]) ?? []} initialMeta={meta} initialPointsTotal={totalPoints} initialWeekPoints={weekPoints} />;
}
