import { NextResponse } from "next/server";
import { sql } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  const { rows } = await sql`
    SELECT key, value FROM guild_settings
    WHERE key LIKE 'recruitment_request:%'
  `;

  const requests = rows.map((row) => {
    try { return JSON.parse(row.value); } catch { return null; }
  }).filter(Boolean);

  requests.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

  return NextResponse.json(requests);
}

export async function POST(request: Request) {
  const body = await request.json();

  const id = `req_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
  const newRequest = {
    id,
    nick: body.nick || "",
    name: body.name || "",
    age: Number(body.age) || 0,
    ff_id: body.ff_id || "",
    points: Number(body.points) || 0,
    experience: body.experience || "",
    reason: body.reason || "",
    contact: body.contact || "",
    email: body.email || "",
    photo: body.photo || null,
    status: "pending",
    created_at: new Date().toISOString(),
  };

  await sql`
    INSERT INTO guild_settings (key, value)
    VALUES (${'recruitment_request:' + id}, ${JSON.stringify(newRequest)})
    ON CONFLICT (key) DO UPDATE SET value = ${JSON.stringify(newRequest)}
  `;

  return NextResponse.json({ ok: true, id });
}

export async function PUT(request: Request) {
  const body = await request.json();
  const { id, status } = body;

  if (!id || !status) {
    return NextResponse.json({ error: "ID e status obrigatorios" }, { status: 400 });
  }

  const { rows } = await sql`
    SELECT value FROM guild_settings
    WHERE key = ${'recruitment_request:' + id}
  `;

  if (rows.length === 0) {
    return NextResponse.json({ error: "Pedido nao encontrado" }, { status: 404 });
  }

  const requestData = JSON.parse(rows[0].value);
  requestData.status = status;

  await sql`
    INSERT INTO guild_settings (key, value)
    VALUES (${'recruitment_request:' + id}, ${JSON.stringify(requestData)})
    ON CONFLICT (key) DO UPDATE SET value = ${JSON.stringify(requestData)}
  `;

  return NextResponse.json({ ok: true });
}

export async function DELETE(request: Request) {
  const url = new URL(request.url);
  const id = url.searchParams.get("id");

  if (!id) return NextResponse.json({ error: "ID obrigatorio" }, { status: 400 });

  await sql`DELETE FROM guild_settings WHERE key = ${'recruitment_request:' + id}`;

  return NextResponse.json({ ok: true });
}
