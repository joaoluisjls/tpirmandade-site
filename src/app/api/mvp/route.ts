import { NextResponse } from "next/server";
import { getAnonClient, getServiceClient } from "@/lib/supabase";

export async function GET() {
  const supabase = getAnonClient();
  const { data, error } = await supabase.from("mvp").select("*").single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data, { headers: { "Cache-Control": "public, s-maxage=30, stale-while-revalidate=60" } });
}

export async function PUT(request: Request) {
  const supabase = getServiceClient();
  const body = await request.json();
  const { data, error } = await supabase.from("mvp").upsert(body).select().single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}
