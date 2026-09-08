import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const dynamic = "force-dynamic";

export async function GET() {
  const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);
  const { data, error } = await supabase.from("guild_settings").select("key, value");
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const ownerKeys = data?.filter((r: any) => r.key.includes("owner") || r.key.includes("admin") || r.key.includes("guild_name") || r.key.includes("guild_tag")) || [];

  return NextResponse.json({
    total: data?.length || 0,
    allKeys: data?.map((r: any) => r.key) || [],
    leadershipData: ownerKeys,
    guild_name: data?.find((r: any) => r.key === "guild_name")?.value,
    guild_owner_nick: data?.find((r: any) => r.key === "guild_owner_nick")?.value,
    guild_admin_nicks: data?.find((r: any) => r.key === "guild_admin_nicks")?.value,
  });
}
