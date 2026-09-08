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

const ADMIN_KEYS = [
  "guild_name", "guild_tag", "guild_slogan", "guild_motto", "guild_description",
  "discord", "instagram", "tiktok", "youtube", "whatsapp",
];

export async function GET() {
  const allRes = await fetch(`${SUPABASE_URL}/rest/v1/guild_settings?select=key,value`, { headers: sbHeaders() });
  if (!allRes.ok) return NextResponse.json({ error: "fetch failed" }, { status: 500 });
  const allData: { key: string; value: string }[] = await allRes.json();
  const settings: Record<string, string> = {};
  ADMIN_KEYS.forEach((k) => {
    const row = allData.find((r) => r.key === k);
    if (row) settings[k] = row.value;
  });
  return NextResponse.json(settings);
}

export async function PUT(request: Request) {
  const body = await request.json();
  const errors: string[] = [];

  for (const [key, value] of Object.entries(body)) {
    const strValue = String(value);
    await fetch(`${SUPABASE_URL}/rest/v1/guild_settings?key=eq.${key}`, {
      method: "DELETE",
      headers: sbHeaders(),
    });
    const insertRes = await fetch(`${SUPABASE_URL}/rest/v1/guild_settings`, {
      method: "POST",
      headers: sbHeaders(),
      body: JSON.stringify({ key, value: strValue }),
    });
    if (!insertRes.ok) errors.push(`${key}: insert failed`);
  }

  if (errors.length > 0) {
    return NextResponse.json({ ok: false, errors }, { status: 500 });
  }
  return NextResponse.json({ ok: true });
}
