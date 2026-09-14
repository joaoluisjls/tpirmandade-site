import { NextResponse } from "next/server";
import { sql } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const email = url.searchParams.get("email");
  const nick = url.searchParams.get("nick");

  if (email) {
    const { rows } = await sql`
      SELECT id, nick, name, email, points, weekly_evolution FROM players
      WHERE LOWER(email) = ${email.toLowerCase().trim()}
    `;
    return NextResponse.json({ found: rows.length > 0, player: rows[0] || null });
  }

  if (nick) {
    const { rows } = await sql`
      SELECT id, nick, name, avatar, bio, phone, email, points, weekly_evolution FROM players
      WHERE LOWER(nick) = ${nick.toLowerCase().trim()}
    `;
    if (rows.length === 0) {
      return NextResponse.json({ error: "Jogador nao encontrado" }, { status: 404 });
    }
    return NextResponse.json(rows[0]);
  }

  return NextResponse.json({ error: "Nick ou email obrigatorio" }, { status: 400 });
}

export async function PUT(request: Request) {
  const { id, name, avatar, bio, phone, email } = await request.json();

  if (!id) {
    return NextResponse.json({ error: "ID obrigatorio" }, { status: 400 });
  }

  const { rows } = await sql`
    UPDATE players
    SET name = COALESCE(${name || null}, name),
        avatar = COALESCE(${avatar || null}, avatar),
        bio = COALESCE(${bio || null}, bio),
        phone = COALESCE(${phone || null}, phone),
        email = COALESCE(${email || null}, email)
    WHERE id = ${id}
    RETURNING id, nick, name, avatar, bio, phone, email
  `;

  if (rows.length === 0) {
    return NextResponse.json({ error: "Jogador nao encontrado" }, { status: 404 });
  }

  return NextResponse.json(rows[0]);
}
