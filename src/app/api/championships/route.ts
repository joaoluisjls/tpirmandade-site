import { NextResponse } from "next/server";
import { sql } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  const { rows } = await sql`
    SELECT key, value FROM guild_settings
    WHERE key LIKE 'championship:%'
  `;

  const championships = rows
    .filter((row) => !row.key.includes(":matches:") && !row.key.includes(":participants:"))
    .map((row) => {
      try { return JSON.parse(row.value); } catch { return null; }
    })
    .filter(Boolean);

  championships.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

  return NextResponse.json(championships);
}

export async function POST(request: Request) {
  const body = await request.json();

  const id = `champ_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
  const championship = {
    id,
    name: body.name || "Campeonato",
    description: body.description || "",
    date: body.date || "",
    time: body.time || "",
    status: body.status || "open",
    prize: body.prize || "",
    rules: body.rules || "",
    notes: body.notes || "",
    participants: body.participants || [],
    matches: body.matches || [],
    champion: null,
    created_at: new Date().toISOString(),
  };

  await sql`
    INSERT INTO guild_settings (key, value)
    VALUES (${'championship:' + id}, ${JSON.stringify(championship)})
    ON CONFLICT (key) DO UPDATE SET value = ${JSON.stringify(championship)}
  `;

  return NextResponse.json({ ok: true, id });
}

export async function PUT(request: Request) {
  const body = await request.json();
  const { id, ...updates } = body;

  if (!id) return NextResponse.json({ error: "ID obrigatorio" }, { status: 400 });

  const { rows } = await sql`
    SELECT value FROM guild_settings
    WHERE key = ${'championship:' + id}
  `;

  if (rows.length === 0) {
    return NextResponse.json({ error: "Campeonato nao encontrado" }, { status: 404 });
  }

  const existing = JSON.parse(rows[0].value);
  const updated = { ...existing, ...updates, id };

  await sql`
    INSERT INTO guild_settings (key, value)
    VALUES (${'championship:' + id}, ${JSON.stringify(updated)})
    ON CONFLICT (key) DO UPDATE SET value = ${JSON.stringify(updated)}
  `;

  return NextResponse.json({ ok: true });
}

export async function DELETE(request: Request) {
  const url = new URL(request.url);
  const id = url.searchParams.get("id");

  if (!id) return NextResponse.json({ error: "ID obrigatorio" }, { status: 400 });

  await sql`DELETE FROM guild_settings WHERE key = ${'championship:' + id}`;

  return NextResponse.json({ ok: true });
}
