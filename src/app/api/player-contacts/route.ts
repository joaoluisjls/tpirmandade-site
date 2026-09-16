import { NextRequest, NextResponse } from "next/server";
import { sql } from "@/lib/db";

export const dynamic = "force-dynamic";

const KEY = "player_contacts";

async function getContacts() {
  const { rows } = await sql`
    SELECT value FROM guild_settings WHERE key = ${KEY}
  `;
  if (rows.length === 0) return {};
  try {
    return typeof rows[0].value === "string" ? JSON.parse(rows[0].value) : rows[0].value || {};
  } catch {
    return {};
  }
}

async function saveContacts(contacts: Record<string, any>) {
  await sql`
    INSERT INTO guild_settings (key, value)
    VALUES (${KEY}, ${JSON.stringify(contacts)})
    ON CONFLICT (key) DO UPDATE SET value = ${JSON.stringify(contacts)}
  `;
}

export async function GET() {
  return NextResponse.json(await getContacts());
}

export async function PUT(req: NextRequest) {
  const body = await req.json();
  const { playerId, data } = body;
  if (!playerId) return NextResponse.json({ error: "playerId required" }, { status: 400 });
  const contacts = await getContacts();
  contacts[playerId] = { ...(contacts[playerId] || {}), ...data };
  await saveContacts(contacts);
  return NextResponse.json({ ok: true });
}

export async function DELETE(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const playerId = searchParams.get("playerId");
  if (!playerId) return NextResponse.json({ error: "playerId required" }, { status: 400 });
  const contacts = await getContacts();
  delete contacts[playerId];
  await saveContacts(contacts);
  return NextResponse.json({ ok: true });
}
