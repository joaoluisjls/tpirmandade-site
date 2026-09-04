import { NextResponse } from "next/server";
import { getServiceClient, getAnonClient } from "@/lib/supabase";

export async function GET() {
  const supabase = getAnonClient();
  const { data, error } = await supabase
    .from("guild_settings")
    .select("key, value")
    .like("key", "championship:%");

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const championships = (data || [])
    .filter((row) => !row.key.includes(":matches:") && !row.key.includes(":participants:"))
    .map((row) => {
      try { return JSON.parse(row.value); } catch { return null; }
    })
    .filter(Boolean);

  championships.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

  return NextResponse.json(championships);
}

export async function POST(request: Request) {
  const supabase = getServiceClient();
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

  const { error } = await supabase
    .from("guild_settings")
    .upsert({ key: `championship:${id}`, value: JSON.stringify(championship) });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true, id });
}

export async function PUT(request: Request) {
  const supabase = getServiceClient();
  const body = await request.json();
  const { id, ...updates } = body;

  if (!id) return NextResponse.json({ error: "ID obrigatorio" }, { status: 400 });

  const { data, error: fetchError } = await supabase
    .from("guild_settings")
    .select("value")
    .eq("key", `championship:${id}`)
    .single();

  if (fetchError || !data) {
    return NextResponse.json({ error: "Campeonato nao encontrado" }, { status: 404 });
  }

  const existing = JSON.parse(data.value);
  const updated = { ...existing, ...updates, id };

  const { error } = await supabase
    .from("guild_settings")
    .upsert({ key: `championship:${id}`, value: JSON.stringify(updated) });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}

export async function DELETE(request: Request) {
  const supabase = getServiceClient();
  const url = new URL(request.url);
  const id = url.searchParams.get("id");

  if (!id) return NextResponse.json({ error: "ID obrigatorio" }, { status: 400 });

  const { error } = await supabase
    .from("guild_settings")
    .delete()
    .eq("key", `championship:${id}`);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
