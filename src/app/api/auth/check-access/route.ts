import { NextResponse } from "next/server";
import { sql } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const { email } = await request.json();

  if (!email) {
    return NextResponse.json({ error: "Email é obrigatório" }, { status: 400 });
  }

  const key = `approved_email:${email.toLowerCase().trim()}`;
  await sql`
    INSERT INTO guild_settings (key, value)
    VALUES (${key}, 'true')
    ON CONFLICT (key) DO UPDATE SET value = 'true'
  `;

  return NextResponse.json({ ok: true });
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const email = url.searchParams.get("email");

  if (!email) {
    return NextResponse.json({ approved: false });
  }

  const key = `approved_email:${email.toLowerCase().trim()}`;
  const { rows } = await sql`
    SELECT value FROM guild_settings WHERE key = ${key}
  `;

  return NextResponse.json({ approved: rows.length > 0 && rows[0].value === "true" });
}
