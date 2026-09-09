import type { Metadata } from "next";
import EstatisticasClient from "./EstatisticasClient";
import { createClient } from "@supabase/supabase-js";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "Guilda - TP&IRMANDADE",
  description: "Conheça a TP&IRMANDADE - Dono, administradores, membros e informações da guilda.",
};

export default async function EstatisticasPage() {
  const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);

  const [p, leadersRes, totalRes] = await Promise.all([
    supabase.from("players").select("id, nick, name, role, avatar, status, points, weekly_evolution").order("points", { ascending: false }),
    supabase.from("guild_settings").select("key, value").in("key", ["guild_owner_nick", "guild_admin_nicks"]),
    supabase.from("guild_settings").select("key, value").eq("key", "points_total"),
  ]);

  const leadersMap: Record<string, string> = {};
  leadersRes.data?.forEach((item: any) => { leadersMap[item.key] = item.value; });

  const totalPoints = totalRes.data?.[0] ? JSON.parse(totalRes.data[0].value) : 0;
  const owner = leadersMap.guild_owner_nick || "";
  const admins = leadersMap.guild_admin_nicks ? leadersMap.guild_admin_nicks.split(",").map((s: string) => s.trim()).filter(Boolean) : [];

  return <EstatisticasClient initialPlayers={p.data ?? []} initialSettings={{}} initialOwner={owner} initialAdmins={admins} initialPointsTotal={totalPoints} />;
}
