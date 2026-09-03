import { NextResponse } from "next/server";
import { getServiceClient, getAnonClient } from "@/lib/supabase";

export async function POST(request: Request) {
  const supabase = getServiceClient();
  const { email } = await request.json();

  if (!email) {
    return NextResponse.json({ error: "Email é obrigatório" }, { status: 400 });
  }

  const { error } = await supabase
    .from("guild_settings")
    .upsert({ key: `approved_email:${email.toLowerCase().trim()}`, value: "true" });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}

export async function GET(request: Request) {
  const supabase = getAnonClient();
  const url = new URL(request.url);
  const email = url.searchParams.get("email");

  if (!email) {
    return NextResponse.json({ approved: false });
  }

  const { data } = await supabase
    .from("guild_settings")
    .select("value")
    .eq("key", `approved_email:${email.toLowerCase().trim()}`)
    .single();

  return NextResponse.json({ approved: data?.value === "true" });
}
