import { NextResponse } from "next/server";
import { getAnonClient, getServiceClient } from "@/lib/supabase";

export async function GET() {
  const supabase = getAnonClient();
  const { data, error } = await supabase.from("announcements").select("*").order("date", { ascending: false });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function POST(request: Request) {
  const supabase = getServiceClient();
  const body = await request.json();
  const { data, error } = await supabase.from("announcements").insert(body).select().single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function PUT(request: Request) {
  const supabase = getServiceClient();
  const body = await request.json();
  const { id, ...updates } = body;
  const { data, error } = await supabase.from("announcements").update(updates).eq("id", id).select().single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function DELETE(request: Request) {
  const supabase = getServiceClient();
  const { id } = await request.json();
  const { error } = await supabase.from("announcements").delete().eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
