import { NextResponse } from "next/server";
import { sql } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  const { rows } = await sql`
    SELECT * FROM recruitment_requests ORDER BY created_at DESC
  `;
  return NextResponse.json(rows);
}

export async function POST(request: Request) {
  const body = await request.json();
  const { id, nick, name, age, ff_id, points, experience, reason, contact, email, photo, roles } = body;
  const { rows } = await sql`
    INSERT INTO recruitment_requests (id, nick, name, age, ff_id, points, experience, reason, contact, email, photo, status, created_at, roles)
    VALUES (${id}, ${nick || ""}, ${name || ""}, ${age || ""}, ${ff_id || ""}, ${points || 0}, ${experience || ""}, ${reason || ""}, ${contact || ""}, ${email || ""}, ${photo || ""}, 'pending', ${new Date().toISOString()}, ${JSON.stringify(roles || [])}::jsonb)
    RETURNING *
  `;
  return NextResponse.json(rows[0]);
}

export async function PUT(request: Request) {
  const body = await request.json();
  const { id, ...updates } = body;
  const { rows } = await sql`
    UPDATE recruitment_requests
    SET nick = ${updates.nick ?? ""}, name = ${updates.name ?? ""}, age = ${updates.age ?? ""},
        ff_id = ${updates.ff_id ?? ""}, points = ${updates.points ?? 0},
        experience = ${updates.experience ?? ""}, reason = ${updates.reason ?? ""},
        contact = ${updates.contact ?? ""}, email = ${updates.email ?? ""},
        photo = ${updates.photo ?? ""}, status = ${updates.status ?? "pending"},
        roles = COALESCE(${updates.roles ? JSON.stringify(updates.roles) : null}::jsonb, roles)
    WHERE id = ${id}
    RETURNING *
  `;
  return NextResponse.json(rows[0]);
}

export async function DELETE(request: Request) {
  const { id } = await request.json();
  await sql`DELETE FROM recruitment_requests WHERE id = ${id}`;
  return NextResponse.json({ ok: true });
}
