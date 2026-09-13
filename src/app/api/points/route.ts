import { NextResponse } from "next/server";
import { sql } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  const { rows } = await sql`
    SELECT id, nick, points FROM players ORDER BY nick ASC
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
      total: Record<string, number> | number;
    };

    const { rows: players } = await sql`SELECT id, nick FROM players`;
    const nickToId: Record<string, string> = {};
    players.forEach((p) => { nickToId[p.nick] = p.id; });

    const now = new Date();
    const weekNum = Math.ceil(((now.getTime() - new Date(now.getFullYear(), 0, 1).getTime()) / 86400000 + 1) / 7);
    const weekLabel = `${now.getFullYear()}_W${weekNum}`;
    const weekStr = `points_history_${weekLabel}`;

    const errors: string[] = [];

    // Salvar pontos semanais
    if (weekly && Object.keys(weekly).length > 0) {
      const weeklyData: Record<string, number> = {};
      for (const [nick, pts] of Object.entries(weekly)) {
        const id = nickToId[nick];
        if (id) {
          weeklyData[nick] = pts;
          // Atualizar weekly_evolution do jogador
          const { rows: playerRows } = await sql`SELECT weekly_evolution FROM players WHERE id = ${id}`;
          const currentWE = playerRows[0]?.weekly_evolution || [];
          const existingIdx = currentWE.findIndex((w: any) => w.week === weekLabel);
          if (existingIdx >= 0) {
            currentWE[existingIdx] = { week: weekLabel, points: pts };
          } else {
            currentWE.push({ week: weekLabel, points: pts });
          }
          await sql`UPDATE players SET weekly_evolution = ${JSON.stringify(currentWE)}::jsonb WHERE id = ${id}`;
        } else {
          errors.push(`Jogador "${nick}" nao encontrado`);
        }
      }
      await sql`
        INSERT INTO guild_settings (key, value)
        VALUES (${weekStr}, ${JSON.stringify(weeklyData)})
        ON CONFLICT (key) DO UPDATE SET value = ${JSON.stringify(weeklyData)}
      `;
    }

    // Salvar pontos individuais (define o total do jogador)
    if (individual && Object.keys(individual).length > 0) {
      for (const [nick, pts] of Object.entries(individual)) {
        const id = nickToId[nick];
        if (id) {
          await sql`UPDATE players SET points = ${pts} WHERE id = ${id}`;
        } else {
          errors.push(`Jogador "${nick}" nao encontrado`);
        }
      }
    }

    // Salvar pontos totais (por jogador)
    if (total && typeof total === "object") {
      for (const [nick, pts] of Object.entries(total)) {
        const id = nickToId[nick];
        if (id) {
          await sql`UPDATE players SET points = ${pts} WHERE id = ${id}`;
        } else {
          errors.push(`Jogador "${nick}" nao encontrado`);
        }
      }
    }

    if (errors.length > 0) {
      return NextResponse.json({ ok: false, errors }, { status: 200 });
    }
    return NextResponse.json({ ok: true, week: weekStr });
  }

  return NextResponse.json({ error: "invalid action" }, { status: 400 });
}
