import type { Metadata } from "next";
import EstatisticasClient from "./EstatisticasClient";
import { createClient } from "@supabase/supabase-js";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Guilda - TP&IRMANDADE",
  description: "Conheça a TP&IRMANDADE - Dono, administradores, membros e informações da guilda.",
};

export default async function EstatisticasPage() {
  const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);

  const [p, s, leadersRes] = await Promise.all([
    supabase.from("players").select("id, nick, name, role, avatar, status, points, joined_at, bio").order("points", { ascending: false }),
    supabase.from("guild_settings").select("key, value"),
    supabase.from("guild_settings").select("key, value").in("key", ["guild_owner_nick", "guild_admin_nicks"]),
  ]);

  const settingsMap: Record<string, string> = {};
  s.data?.forEach((item: any) => { settingsMap[item.key] = item.value; });

  const leadersMap: Record<string, string> = {};
  leadersRes.data?.forEach((item: any) => { leadersMap[item.key] = item.value; });

  const owner = leadersMap.guild_owner_nick || "";
  const admins = leadersMap.guild_admin_nicks ? leadersMap.guild_admin_nicks.split(",").map((s: string) => s.trim()).filter(Boolean) : [];

  return <EstatisticasClient initialPlayers={p.data ?? []} initialSettings={settingsMap} initialOwner={owner} initialAdmins={admins} />;
}
