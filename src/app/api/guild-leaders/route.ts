import { NextResponse } from "next/server";
import { sql } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  const { rows } = await sql`
    SELECT key, value FROM guild_settings
    WHERE key IN ('guild_owner_nick', 'guild_admin_nicks')
  `;
  const map: Record<string, string> = {};
  rows.forEach((r) => { map[r.key] = r.value; });
  return NextResponse.json({
    owner: map.guild_owner_nick || "",
    admins: map.guild_admin_nicks
      ? map.guild_admin_nicks.split(",").map((s: string) => s.trim()).filter(Boolean)
      : [],
  });
}

export async function PUT(request: Request) {
  const body = await request.json();
  const { owner = "", admins = [] } = body;
  const adminStr: string = Array.isArray(admins) ? admins.join(", ") : admins;

  const inserts: { key: string; value: string }[] = [];
  if (owner) inserts.push({ key: "guild_owner_nick", value: owner });
  if (adminStr) inserts.push({ key: "guild_admin_nicks", value: adminStr });

  for (const row of inserts) {
    await sql`
      INSERT INTO guild_settings (key, value)
      VALUES (${row.key}, ${row.value})
      ON CONFLICT (key) DO UPDATE SET value = ${row.value}
    `;
  }

  return NextResponse.json({
    ok: true,
    owner,
    admins: adminStr.split(",").map((s: string) => s.trim()).filter(Boolean),
  });
}
