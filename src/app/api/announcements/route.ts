import { NextResponse } from "next/server";
import { sql } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  const { rows } = await sql`
    SELECT id, title, content, date, time, priority
    FROM announcements ORDER BY date DESC
  `;
  return NextResponse.json(rows, {
    headers: { "Cache-Control": "public, s-maxage=60, stale-while-revalidate=120" },
  });
}

export async function POST(request: Request) {
  const body = await request.json();
  const { id, title, content, date, time, priority } = body;
  const { rows } = await sql`
    INSERT INTO announcements (id, title, content, date, time, priority)
    VALUES (${id}, ${title || ""}, ${content || ""}, ${date || ""}, ${time || ""}, ${priority || "low"})
    RETURNING *
  `;
  return NextResponse.json(rows[0]);
}

export async function PUT(request: Request) {
  const body = await request.json();
  const { id, ...updates } = body;
  const { rows } = await sql`
    UPDATE announcements
    SET title = ${updates.title ?? ""}, content = ${updates.content ?? ""},
        date = ${updates.date ?? ""}, time = ${updates.time ?? ""},
        priority = ${updates.priority ?? "low"}
    WHERE id = ${id}
    RETURNING *
  `;
  return NextResponse.json(rows[0]);
}

export async function DELETE(request: Request) {
  const { id } = await request.json();
  await sql`DELETE FROM announcements WHERE id = ${id}`;
  return NextResponse.json({ ok: true });
}
