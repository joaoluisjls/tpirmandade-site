import { NextResponse } from "next/server";
import { sql } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  const { rows } = await sql`
    SELECT id, nick, name, role, status, points, avatar, joined_at, bio, matches, wins, kills, deaths, kd, headshots, headshot_rate, avg_damage, win_rate
    FROM players ORDER BY points DESC
  `;
  return NextResponse.json(rows, {
    headers: { "Cache-Control": "public, s-maxage=30, stale-while-revalidate=60" },
  });
}

export async function POST(request: Request) {
  const body = await request.json();
  const { id, nick, name, role, status, bio, joined_at, avatar, matches, wins, kills, deaths, kd, headshots, headshot_rate, avg_damage, win_rate, points, weekly_evolution, achievements } = body;
  const { rows } = await sql`
    INSERT INTO players (id, nick, name, role, status, bio, joined_at, avatar, matches, wins, kills, deaths, kd, headshots, headshot_rate, avg_damage, win_rate, points, weekly_evolution, achievements)
    VALUES (${id}, ${nick || ""}, ${name || ""}, ${role || ""}, ${status || "offline"}, ${bio || ""}, ${joined_at || ""}, ${avatar || ""}, ${matches || 0}, ${wins || 0}, ${kills || 0}, ${deaths || 0}, ${kd || 0}, ${headshots || 0}, ${headshot_rate || 0}, ${avg_damage || 0}, ${win_rate || 0}, ${points || 0}, ${JSON.stringify(weekly_evolution || [])}::jsonb, ${JSON.stringify(achievements || [])}::jsonb)
    RETURNING *
  `;
  return NextResponse.json(rows[0]);
}

export async function PUT(request: Request) {
  const body = await request.json();
  const { id, ...updates } = body;
  const { rows } = await sql`
    UPDATE players
    SET nick = ${updates.nick ?? ""}, name = ${updates.name ?? ""}, role = ${updates.role ?? ""}, status = ${updates.status ?? "offline"},
        bio = ${updates.bio ?? ""}, joined_at = ${updates.joined_at ?? ""}, avatar = ${updates.avatar ?? ""},
        matches = ${updates.matches ?? 0}, wins = ${updates.wins ?? 0}, kills = ${updates.kills ?? 0},
        deaths = ${updates.deaths ?? 0}, kd = ${updates.kd ?? 0}, headshots = ${updates.headshots ?? 0},
        headshot_rate = ${updates.headshot_rate ?? 0}, avg_damage = ${updates.avg_damage ?? 0},
        win_rate = ${updates.win_rate ?? 0}, points = ${updates.points ?? 0},
        weekly_evolution = COALESCE(${updates.weekly_evolution ? JSON.stringify(updates.weekly_evolution) : null}::jsonb, weekly_evolution),
        achievements = COALESCE(${updates.achievements ? JSON.stringify(updates.achievements) : null}::jsonb, achievements)
    WHERE id = ${id}
    RETURNING *
  `;
  return NextResponse.json(rows[0]);
}

export async function DELETE(request: Request) {
  const { id } = await request.json();
  await sql`DELETE FROM players WHERE id = ${id}`;
  return NextResponse.json({ ok: true });
}
