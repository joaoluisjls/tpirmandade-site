import { getAnonClient } from "@/lib/supabase";

export async function fetchPlayers() {
  const supabase = getAnonClient();
  const { data } = await supabase
    .from("players")
    .select("id, nick, name, role, status, points, avatar, joined_at, bio, matches, wins, kills, deaths, kd, headshots, headshot_rate, avg_damage, win_rate")
    .order("points", { ascending: false });
  return data ?? [];
}

export async function fetchWars() {
  const supabase = getAnonClient();
  const { data } = await supabase
    .from("wars")
    .select("id, opponent, date, time, status, result, guild_score, opponent_score, mvp_nick")
    .order("date", { ascending: false });
  return data ?? [];
}

export async function fetchSettings() {
  const supabase = getAnonClient();
  const { data } = await supabase.from("guild_settings").select("key, value");
  const settings: Record<string, string> = {};
  data?.forEach((s) => { settings[s.key] = s.value; });
  return settings;
}

export async function fetchAchievements() {
  const supabase = getAnonClient();
  const { data } = await supabase
    .from("achievements")
    .select("id, title, description, icon, date, responsible")
    .order("date", { ascending: false });
  return data ?? [];
}

export async function fetchAnnouncements() {
  const supabase = getAnonClient();
  const { data } = await supabase
    .from("announcements")
    .select("id, title, content, date, time, priority")
    .order("date", { ascending: false });
  return data ?? [];
}

export async function fetchMVP() {
  const supabase = getAnonClient();
  const { data } = await supabase
    .from("mvp")
    .select("id, player_id, nick, avatar, period, points, matches, wins, kills, deaths, kd, headshots, reason")
    .single();
  return data ?? null;
}

export async function fetchChampionships() {
  const supabase = getAnonClient();
  const { data } = await supabase
    .from("championships")
    .select("*")
    .order("date", { ascending: false });
  return data ?? [];
}

export async function fetchRules() {
  const supabase = getAnonClient();
  const { data } = await supabase
    .from("rules")
    .select("id, title, content, category")
    .order("id", { ascending: true });
  return data ?? [];
}
