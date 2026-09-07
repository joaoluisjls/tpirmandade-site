import type { Metadata } from "next";
import EstatisticasClient from "./EstatisticasClient";
import { getAnonClient } from "@/lib/supabase";

export const metadata: Metadata = {
  title: "Guilda - TP&IRMANDADE",
  description: "Conheça a TP&IRMANDADE - Dono, administradores, membros e informações da guilda.",
};

export default async function EstatisticasPage() {
  const supabase = getAnonClient();

  const [p, s] = await Promise.all([
    supabase.from("players").select("id, nick, name, role, avatar, status, points, joined_at, bio").order("points", { ascending: false }),
    supabase.from("guild_settings").select("key, value"),
  ]);

  const settingsMap: Record<string, string> = {};
  s.data?.forEach((item: any) => { settingsMap[item.key] = item.value; });

  return <EstatisticasClient initialPlayers={p.data ?? []} initialSettings={settingsMap} />;
}
