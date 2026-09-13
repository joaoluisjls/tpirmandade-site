import { NextResponse } from "next/server";
import { sql } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  const { rows } = await sql`
    SELECT id, title, description, icon, date, players
    FROM achievements ORDER BY date DESC
  `;
  return NextResponse.json(rows, {
    headers: { "Cache-Control": "public, s-maxage=60, stale-while-revalidate=120" },
  });
}

export async function POST(request: Request) {
  const body = await request.json();
  const { id, title, description, date, icon, responsible, players } = body;
  const { rows } = await sql`
    INSERT INTO achievements (id, title, description, date, icon, responsible, players)
    VALUES (${id}, ${title || ""}, ${description || ""}, ${date || ""}, ${icon || ""}, ${responsible || ""}, ${JSON.stringify(players || [])}::jsonb)
    RETURNING *
  `;
  return NextResponse.json(rows[0]);
}

export async function PUT(request: Request) {
  const body = await request.json();
  const { id, ...updates } = body;
  const { rows } = await sql`
    UPDATE achievements
    SET title = ${updates.title ?? ""}, description = ${updates.description ?? ""},
        date = ${updates.date ?? ""}, icon = ${updates.icon ?? ""},
        responsible = ${updates.responsible ?? ""},
        players = COALESCE(${updates.players ? JSON.stringify(updates.players) : null}::jsonb, players)
    WHERE id = ${id}
    RETURNING *
  `;
  return NextResponse.json(rows[0]);
}

export async function DELETE(request: Request) {
  const { id } = await request.json();
  await sql`DELETE FROM achievements WHERE id = ${id}`;
  return NextResponse.json({ ok: true });
}
