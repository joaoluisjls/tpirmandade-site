import { NextRequest, NextResponse } from "next/server";
import { getServiceClient } from "@/lib/supabase";

const supabase = getServiceClient();

function getKey(championshipId: string) {
  return `championship_subs:${championshipId}`;
}

async function getSubscriptions(championshipId: string) {
  const { data } = await supabase.from("guild_settings").select("value").eq("key", getKey(championshipId)).single();
  return (data?.value as any[]) || [];
}

async function saveSubscriptions(championshipId: string, subs: any[]) {
  const key = getKey(championshipId);
  const { data: existing } = await supabase.from("guild_settings").select("id").eq("key", key).single();
  if (existing) {
    await supabase.from("guild_settings").update({ value: subs }).eq("key", key);
  } else {
    await supabase.from("guild_settings").insert({ key, value: subs });
  }
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const championshipId = searchParams.get("championshipId");
  if (!championshipId) return NextResponse.json({ error: "championshipId required" }, { status: 400 });
  const subs = await getSubscriptions(championshipId);
  return NextResponse.json(subs);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { championshipId, teamName, captainName, captainEmail, members, logo } = body;
  if (!championshipId || !teamName || !captainName || !captainEmail) {
    return NextResponse.json({ error: "Campos obrigatorios faltando" }, { status: 400 });
  }
  const subs = await getSubscriptions(championshipId);
  if (subs.find((s: any) => s.captainEmail === captainEmail)) {
    return NextResponse.json({ error: "Voce ja inscreveu um time neste campeonato" }, { status: 400 });
  }
  const newSub = {
    id: `sub_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    teamName,
    captainName,
    captainEmail,
    members: members || [],
    logo: logo || "",
    status: "pending",
    created_at: new Date().toISOString(),
  };
  subs.push(newSub);
  await saveSubscriptions(championshipId, subs);
  return NextResponse.json({ ok: true, sub: newSub });
}

export async function PUT(req: NextRequest) {
  const body = await req.json();
  const { championshipId, subId, status } = body;
  if (!championshipId || !subId) return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  const subs = await getSubscriptions(championshipId);
  const sub = subs.find((s: any) => s.id === subId);
  if (sub) {
    sub.status = status || sub.status;
    await saveSubscriptions(championshipId, subs);
  }
  return NextResponse.json({ ok: true });
}

export async function DELETE(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const championshipId = searchParams.get("championshipId");
  const subId = searchParams.get("subId");
  if (!championshipId || !subId) return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  const subs = await getSubscriptions(championshipId);
  const filtered = subs.filter((s: any) => s.id !== subId);
  await saveSubscriptions(championshipId, filtered);
  return NextResponse.json({ ok: true });
}
