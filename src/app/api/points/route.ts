import { NextResponse } from "next/server";
import { sql } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  const { rows } = await sql`
    SELECT id, nick, weekly_evolution, points FROM players LIMIT 500
  `;
  return NextResponse.json(rows);
}

export async function PUT(request: Request) {
  const body = await request.json();
  const { action, data } = body as { action: string; data: any };

  if (action === "save") {
    const { weekly, individual, total } = data as {
      weekly: Record<string, number>;
      individual: Record<string, number>;
      total: number;
    };

    const { rows: players } = await sql`
      SELECT id, nick, weekly_evolution FROM players LIMIT 500
    `;
    const nickToId: Record<string, string> = {};
    players.forEach((p) => { nickToId[p.nick] = p.id; });

    const now = new Date();
    const weekStr = `points_history_${now.getFullYear()}_W${Math.ceil((now.getDate() - 1) / 7) + 1}`;
    const weekLabel = `${now.getFullYear()}_W${Math.ceil((now.getDate() - 1) / 7) + 1}`;
    const errors: string[] = [];

    const individualUpdates: { id: string; points: number }[] = [];
    const weeklyUpdates: { id: string; weekly_evolution: any[] }[] = [];

    if (individual && Object.keys(individual).length > 0) {
      for (const [nick, pts] of Object.entries(individual) as [string, number][]) {
        const id = nickToId[nick];
        if (id) individualUpdates.push({ id, points: pts });
      }
    }

    if (weekly && Object.keys(weekly).length > 0) {
      for (const [nick, pts] of Object.entries(weekly) as [string, number][]) {
        const id = nickToId[nick];
        if (id) {
          const player = players.find((p) => p.nick === nick);
          const currentWE = player?.weekly_evolution || [];
          const existingIdx = currentWE.findIndex((w: any) => w.week === weekLabel);
          if (existingIdx >= 0) {
            currentWE[existingIdx] = { week: weekLabel, points: pts };
          } else {
            currentWE.push({ week: weekLabel, points: pts });
          }
          weeklyUpdates.push({ id, weekly_evolution: currentWE });
        }
      }

      const weeklyData: Record<string, number> = {};
      for (const [nick, pts] of Object.entries(weekly) as [string, number][]) {
        weeklyData[nick] = pts;
      }
      await sql`
        INSERT INTO guild_settings (key, value)
        VALUES (${weekStr}, ${JSON.stringify(weeklyData)})
        ON CONFLICT (key) DO UPDATE SET value = ${JSON.stringify(weeklyData)}
      `;
    }

    for (const update of individualUpdates) {
      await sql`
        UPDATE players SET points = ${update.points} WHERE id = ${update.id}
      `;
    }

    for (const update of weeklyUpdates) {
      await sql`
        UPDATE players SET weekly_evolution = ${JSON.stringify(update.weekly_evolution)}::jsonb
        WHERE id = ${update.id}
      `;
    }

    if (total) {
      await sql`
        INSERT INTO guild_settings (key, value)
        VALUES ('points_total', ${JSON.stringify(total)})
        ON CONFLICT (key) DO UPDATE SET value = ${JSON.stringify(total)}
      `;
    }

    if (errors.length > 0) {
      return NextResponse.json({ ok: false, errors }, { status: 500 });
    }
    return NextResponse.json({ ok: true, week: weekStr });
  }

  return NextResponse.json({ error: "invalid action" }, { status: 400 });
}
