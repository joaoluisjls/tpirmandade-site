import { NextRequest, NextResponse } from "next/server";
import { getServiceClient } from "@/lib/supabase";

const KEY = "player_contacts";
const supabase = getServiceClient();

async function getContacts() {
  const { data } = await supabase.from("guild_settings").select("value").eq("key", KEY).single();
  return data?.value || {};
}

async function saveContacts(contacts: Record<string, any>) {
  const { data: existing } = await supabase.from("guild_settings").select("id").eq("key", KEY).single();
  if (existing) {
    await supabase.from("guild_settings").update({ value: contacts }).eq("key", KEY);
  } else {
    await supabase.from("guild_settings").insert({ key: KEY, value: contacts });
  }
}

export async function GET() {
  return NextResponse.json(await getContacts());
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { playerId, data } = body;
  if (!playerId) return NextResponse.json({ error: "playerId required" }, { status: 400 });
  const contacts = await getContacts();
  contacts[playerId] = { ...(contacts[playerId] || {}), ...data };
  await saveContacts(contacts);
  return NextResponse.json({ ok: true });
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
