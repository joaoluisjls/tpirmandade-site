import { NextResponse } from "next/server";
import { sql } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  const { rows } = await sql`
    SELECT id, player_id, nick, avatar, period, points, matches, wins, kills, deaths, kd, headshots, reason
    FROM mvp LIMIT 1
  `;
  return NextResponse.json(rows[0] || null, {
    headers: { "Cache-Control": "public, s-maxage=30, stale-while-revalidate=60" },
  });
}

export async function PUT(request: Request) {
  const body = await request.json();
  const { id, player_id, nick, avatar, period, points, matches, wins, kills, deaths, kd, headshots, reason } = body;
  const { rows } = await sql`
    INSERT INTO mvp (id, player_id, nick, avatar, period, points, matches, wins, kills, deaths, kd, headshots, reason)
    VALUES (${id}, ${player_id || ""}, ${nick || ""}, ${avatar || ""}, ${period || ""}, ${points || 0}, ${matches || 0}, ${wins || 0}, ${kills || 0}, ${deaths || 0}, ${kd || 0}, ${headshots || 0}, ${reason || ""})
    ON CONFLICT (id) DO UPDATE SET
      player_id = ${player_id || ""}, nick = ${nick || ""}, avatar = ${avatar || ""}, period = ${period || ""},
      points = ${points || 0}, matches = ${matches || 0}, wins = ${wins || 0}, kills = ${kills || 0},
      deaths = ${deaths || 0}, kd = ${kd || 0}, headshots = ${headshots || 0}, reason = ${reason || ""}
    RETURNING *
  `;
  return NextResponse.json(rows[0]);
}
