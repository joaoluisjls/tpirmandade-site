import { NextResponse } from "next/server";
import { sql } from "@/lib/db";

export const dynamic = "force-dynamic";

const ADMIN_KEYS = [
  "guild_name", "guild_tag", "guild_slogan", "guild_motto", "guild_description",
  "discord", "instagram", "tiktok", "youtube", "whatsapp",
];

export async function GET() {
  const { rows } = await sql`
    SELECT key, value FROM guild_settings
    WHERE key IN ('guild_name', 'guild_tag', 'guild_slogan', 'guild_motto', 'guild_description', 'discord', 'instagram', 'tiktok', 'youtube', 'whatsapp')
  `;
  const settings: Record<string, string> = {};
  rows.forEach((s) => { settings[s.key] = s.value; });
  return NextResponse.json(settings);
}

export async function PUT(request: Request) {
  const body = await request.json();
  const errors: string[] = [];

  for (const [key, value] of Object.entries(body)) {
    const strValue = String(value);
    const result = await sql`
      INSERT INTO guild_settings (key, value)
      VALUES (${key}, ${strValue})
      ON CONFLICT (key) DO UPDATE SET value = ${strValue}
    `;
    if (result.rowCount === 0) errors.push(`${key}: upsert failed`);
  }

  if (errors.length > 0) {
    return NextResponse.json({ ok: false, errors }, { status: 500 });
  }
  return NextResponse.json({ ok: true });
}
