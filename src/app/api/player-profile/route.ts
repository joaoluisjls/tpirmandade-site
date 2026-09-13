import { NextResponse } from "next/server";
import { sql } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const { nick, pin } = await request.json();

  if (!nick || !pin) {
    return NextResponse.json({ error: "Nick e PIN sao obrigatorios" }, { status: 400 });
  }

  const { rows } = await sql`
    SELECT id, nick, name, avatar, bio, phone, email, pin FROM players
    WHERE LOWER(nick) = ${nick.toLowerCase().trim()}
  `;

  if (rows.length === 0) {
    return NextResponse.json({ error: "Jogador nao encontrado" }, { status: 404 });
  }

  const player = rows[0];

  if (!player.pin || player.pin !== pin.toUpperCase()) {
    return NextResponse.json({ error: "PIN invalido" }, { status: 401 });
  }

  return NextResponse.json({
    id: player.id,
    nick: player.nick,
    name: player.name,
    avatar: player.avatar,
    bio: player.bio,
    phone: player.phone,
    email: player.email,
  });
}

export async function PUT(request: Request) {
  const { id, pin, name, avatar, bio, phone, email } = await request.json();

  if (!id || !pin) {
    return NextResponse.json({ error: "ID e PIN obrigatorios" }, { status: 400 });
  }

  const { rows } = await sql`SELECT pin FROM players WHERE id = ${id}`;

  if (rows.length === 0) {
    return NextResponse.json({ error: "Jogador nao encontrado" }, { status: 404 });
  }

  if (rows[0].pin !== pin.toUpperCase()) {
    return NextResponse.json({ error: "PIN invalido" }, { status: 401 });
  }

  const { rows: updated } = await sql`
    UPDATE players
    SET name = COALESCE(${name || null}, name),
        avatar = COALESCE(${avatar || null}, avatar),
        bio = COALESCE(${bio || null}, bio),
        phone = COALESCE(${phone || null}, phone),
        email = COALESCE(${email || null}, email)
    WHERE id = ${id}
    RETURNING id, nick, name, avatar, bio, phone, email
  `;

  return NextResponse.json(updated[0]);
}
