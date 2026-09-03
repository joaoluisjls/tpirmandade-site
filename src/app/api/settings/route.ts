import { NextResponse } from "next/server";
import { getAnonClient, getServiceClient } from "@/lib/supabase";

export async function GET() {
  const supabase = getAnonClient();
  const { data, error } = await supabase.from("guild_settings").select("*");
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  const settings: Record<string, string> = {};
  data?.forEach((s) => { settings[s.key] = s.value; });
  return NextResponse.json(settings, { headers: { "Cache-Control": "public, s-maxage=60, stale-while-revalidate=120" } });
}

export async function PUT(request: Request) {
  const supabase = getServiceClient();
  const body = await request.json();
  const updates = Object.entries(body).map(([key, value]) =>
    supabase.from("guild_settings").upsert({ key, value: String(value) })
  );
  await Promise.all(updates);
  return NextResponse.json({ ok: true });
}
