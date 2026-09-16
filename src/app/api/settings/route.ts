import { NextResponse } from "next/server";
import { sql } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  const { rows } = await sql`
    SELECT key, value FROM guild_settings
    WHERE key IN ('guild_name', 'guild_tag', 'guild_slogan', 'guild_motto', 'guild_description', 'discord', 'instagram', 'tiktok', 'youtube', 'whatsapp')
  `;
  const settings: Record<string, string> = {};
  rows.forEach((s: any) => { settings[s.key] = s.value; });
  return NextResponse.json(settings);
}

export async function PUT(request: Request) {
  const body = await request.json();
  const entries = Object.entries(body);
  if (entries.length === 0) return NextResponse.json({ ok: true });

  for (const [key, value] of entries) {
    await sql`
      INSERT INTO guild_settings (key, value)
      VALUES (${key}, ${String(value)})
      ON CONFLICT (key) DO UPDATE SET value = ${String(value)}
    `;
  }

  return NextResponse.json({ ok: true });
}
