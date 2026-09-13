import { NextResponse } from "next/server";
import { sql } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  const { rows } = await sql`
    SELECT id, title, content, category
    FROM rules ORDER BY id ASC
  `;
  return NextResponse.json(rows, {
    headers: { "Cache-Control": "public, s-maxage=120, stale-while-revalidate=240" },
  });
}

export async function POST(request: Request) {
  const body = await request.json();
  const { id, title, content, category } = body;
  const { rows } = await sql`
    INSERT INTO rules (id, title, content, category)
    VALUES (${id}, ${title || ""}, ${content || ""}, ${category || ""})
    RETURNING *
  `;
  return NextResponse.json(rows[0]);
}

export async function PUT(request: Request) {
  const body = await request.json();
  const { id, ...updates } = body;
  const { rows } = await sql`
    UPDATE rules
    SET title = ${updates.title ?? ""}, content = ${updates.content ?? ""},
        category = ${updates.category ?? ""}
    WHERE id = ${id}
    RETURNING *
  `;
  return NextResponse.json(rows[0]);
}

export async function DELETE(request: Request) {
  const { id } = await request.json();
  await sql`DELETE FROM rules WHERE id = ${id}`;
  return NextResponse.json({ ok: true });
}
