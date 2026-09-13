import { NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { hashPassword, getSession } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Nao autorizado" }, { status: 401 });
  }

  const { email, password } = await request.json();

  if (!email || !password) {
    return NextResponse.json({ error: "Email e senha sao obrigatorios" }, { status: 400 });
  }

  if (password.length < 6) {
    return NextResponse.json({ error: "Senha deve ter no minimo 6 caracteres" }, { status: 400 });
  }

  const hash = hashPassword(password);

  const { rows } = await sql`
    INSERT INTO admins (email, password_hash)
    VALUES (${email.toLowerCase().trim()}, ${hash})
    ON CONFLICT (email) DO UPDATE SET password_hash = ${hash}
    RETURNING id, email, created_at
  `;

  return NextResponse.json({ user: rows[0] });
}

export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Nao autorizado" }, { status: 401 });
  }

  const { rows } = await sql`SELECT id, email, created_at FROM admins ORDER BY created_at DESC`;

  return NextResponse.json(rows);
}
