import { NextResponse } from "next/server";
import { getServiceClient, getAnonClient } from "@/lib/supabase";

export async function GET() {
  const supabase = getAnonClient();
  const { data, error } = await supabase
    .from("guild_settings")
    .select("key, value")
    .like("key", "recruitment_request:%");

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const requests = (data || []).map((row) => {
    try { return JSON.parse(row.value); } catch { return null; }
  }).filter(Boolean);

  requests.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

  return NextResponse.json(requests);
}

export async function POST(request: Request) {
  const supabase = getServiceClient();
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

  const { error } = await supabase
    .from("guild_settings")
    .upsert({ key: `recruitment_request:${id}`, value: JSON.stringify(newRequest) });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true, id });
}

export async function PUT(request: Request) {
  const supabase = getServiceClient();
  const body = await request.json();
  const { id, status } = body;

  if (!id || !status) {
    return NextResponse.json({ error: "ID e status obrigatorios" }, { status: 400 });
  }

  const { data, error: fetchError } = await supabase
    .from("guild_settings")
    .select("value")
    .eq("key", `recruitment_request:${id}`)
    .single();

  if (fetchError || !data) {
    return NextResponse.json({ error: "Pedido nao encontrado" }, { status: 404 });
  }

  const requestData = JSON.parse(data.value);
  requestData.status = status;

  const { error } = await supabase
    .from("guild_settings")
    .upsert({ key: `recruitment_request:${id}`, value: JSON.stringify(requestData) });

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
    .eq("key", `recruitment_request:${id}`);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
