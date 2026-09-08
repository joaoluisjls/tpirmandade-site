import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;

function sbHeaders() {
  return {
    "apikey": SUPABASE_KEY,
    "Authorization": `Bearer ${SUPABASE_KEY}`,
    "Content-Type": "application/json",
  };
}

export async function GET() {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/guild_settings?select=key,value&key=in.(guild_owner_nick,guild_admin_nicks)`, { headers: sbHeaders() });
  if (!res.ok) return NextResponse.json({ error: "fetch failed" }, { status: 500 });
  const data: { key: string; value: string }[] = await res.json();
  const map: Record<string, string> = {};
  data?.forEach((r) => { map[r.key] = r.value; });
  return NextResponse.json({
    owner: map.guild_owner_nick || "",
    admins: map.guild_admin_nicks ? map.guild_admin_nicks.split(",").map((s: string) => s.trim()).filter((s: string) => Boolean(s)) : [],
  });
}

export async function PUT(request: Request) {
  const body = await request.json();
  const { owner = "", admins = [] } = body;
  const adminStr: string = Array.isArray(admins) ? admins.join(", ") : admins;

  for (const key of ["guild_owner_nick", "guild_admin_nicks"]) {
    await fetch(`${SUPABASE_URL}/rest/v1/guild_settings?key=eq.${key}`, {
      method: "DELETE",
      headers: sbHeaders(),
    });
  }

  const inserts = [
    { key: "guild_owner_nick", value: owner },
    { key: "guild_admin_nicks", value: adminStr },
  ].filter((r) => r.value);

  if (inserts.length > 0) {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/guild_settings`, {
      method: "POST",
      headers: sbHeaders(),
      body: JSON.stringify(inserts),
    });
    if (!res.ok) return NextResponse.json({ error: "insert failed" }, { status: 500 });
  }

  return NextResponse.json({ ok: true, owner, admins: adminStr.split(",").map((s: string) => s.trim()).filter((s: string) => Boolean(s)) });
}
