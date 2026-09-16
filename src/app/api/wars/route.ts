import { NextResponse } from "next/server";
import { sql } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  const { rows } = await sql`
    SELECT id, opponent, date, time, status, result, guild_score, opponent_score, mvp_nick
    FROM wars ORDER BY date DESC LIMIT 100
  `;
  return NextResponse.json(rows, {
    headers: { "Cache-Control": "public, s-maxage=30, stale-while-revalidate=60" },
  });
}

export async function POST(request: Request) {
  const body = await request.json();
  const { id, opponent, date, time, status, result, guild_score, opponent_score, mvp_nick } = body;
  const { rows } = await sql`
    INSERT INTO wars (id, opponent, date, time, status, result, guild_score, opponent_score, mvp_nick)
    VALUES (${id}, ${opponent || ""}, ${date || ""}, ${time || ""}, ${status || "upcoming"}, ${result || ""}, ${guild_score || 0}, ${opponent_score || 0}, ${mvp_nick || ""})
    RETURNING *
  `;
  return NextResponse.json(rows[0]);
}

export async function PUT(request: Request) {
  const body = await request.json();
  const { id, ...updates } = body;
  const { rows } = await sql`
    UPDATE wars
    SET opponent = ${updates.opponent ?? ""}, date = ${updates.date ?? ""}, time = ${updates.time ?? ""},
        status = ${updates.status ?? "upcoming"}, result = ${updates.result ?? ""},
        guild_score = ${updates.guild_score ?? 0}, opponent_score = ${updates.opponent_score ?? 0},
        mvp_nick = ${updates.mvp_nick ?? ""}
    WHERE id = ${id}
    RETURNING *
  `;
  return NextResponse.json(rows[0]);
}

export async function DELETE(request: Request) {
  const { id } = await request.json();
  await sql`DELETE FROM wars WHERE id = ${id}`;
  return NextResponse.json({ ok: true });
}
