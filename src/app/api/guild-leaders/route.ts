import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const dynamic = "force-dynamic";

function getClient() {
  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);
}

export async function GET() {
  const supabase = getClient();
  const { data, error } = await supabase.from("guild_settings").select("key, value").in("key", ["guild_owner_nick", "guild_admin_nicks"]);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const map: Record<string, string> = {};
  data?.forEach((r) => { map[r.key] = r.value; });

  return NextResponse.json({
    owner: map.guild_owner_nick || "",
    admins: map.guild_admin_nicks ? map.guild_admin_nicks.split(",").map((s) => s.trim()).filter(Boolean) : [],
  });
}

export async function PUT(request: Request) {
  const supabase = getClient();
  const body = await request.json();
  const { owner = "", admins = [] } = body;

  const adminStr = Array.isArray(admins) ? admins.join(", ") : admins;

  const keysToDelete = ["guild_owner_nick", "guild_admin_nicks"];
  for (const key of keysToDelete) {
    await supabase.from("guild_settings").delete().eq("key", key);
  }

  const inserts = [
    { key: "guild_owner_nick", value: owner },
    { key: "guild_admin_nicks", value: adminStr },
  ].filter((r) => r.value);

  if (inserts.length > 0) {
    const { error } = await supabase.from("guild_settings").insert(inserts);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true, owner, admins: adminStr.split(",").map((s) => s.trim()).filter(Boolean) });
}
