import type { Metadata } from "next";
import EstatisticasClient from "./EstatisticasClient";
import { createClient } from "@supabase/supabase-js";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Guilda - TP&IRMANDADE",
  description: "Conheça a TP&IRMANDADE - Dono, administradores, membros e informações da guilda.",
};

export default async function EstatisticasPage() {
  const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);

  const [p, s] = await Promise.all([
    supabase.from("players").select("id, nick, name, role, avatar, status, points, joined_at, bio").order("points", { ascending: false }),
    supabase.from("guild_settings").select("key, value"),
  ]);

  if (p.error) console.error("EstatisticasPage error:", p.error.message);

  const settingsMap: Record<string, string> = {};
  s.data?.forEach((item: any) => { settingsMap[item.key] = item.value; });

  return <EstatisticasClient initialPlayers={p.data ?? []} initialSettings={settingsMap} />;
}
