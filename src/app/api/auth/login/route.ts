import { NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { verifyPassword, createToken } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const { email, password } = await request.json();

  if (!email || !password) {
    return NextResponse.json({ error: "Email e senha sao obrigatorios" }, { status: 400 });
  }

  const { rows } = await sql`
    SELECT * FROM admins WHERE email = ${email.toLowerCase().trim()}
  `;

  if (rows.length === 0) {
    return NextResponse.json({ error: "Credenciais invalidas" }, { status: 401 });
  }

  const admin = rows[0];
  const valid = verifyPassword(password, admin.password_hash);

  if (!valid) {
    return NextResponse.json({ error: "Credenciais invalidas" }, { status: 401 });
  }

  const token = createToken(email.toLowerCase().trim());

  const response = NextResponse.json({ user: { email: admin.email } });
  response.cookies.set("admin-token", token, {
    path: "/",
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 7,
  });

  return response;
}
