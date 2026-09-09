import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;

function sbHeaders() {
  return {
    "apikey": SUPABASE_KEY,
    "Authorization": `Bearer ${SUPABASE_KEY}`,
    "Content-Type": "application/json",
  };
}

async function getPlayers() {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/players?select=id,nick&limit=500`, { headers: sbHeaders() });
  if (!res.ok) return [];
  const data = await res.json();
  return data as { id: string; nick: string }[];
}

export async function GET() {
  const players = await getPlayers();
  return NextResponse.json(players);
}

export async function PUT(request: Request) {
  const body = await request.json();
  const { action, data, week } = body as { action: string; data: any[]; week?: string };

  if (action === "parse") {
    return NextResponse.json({ success: true, message: "Parsed" });
  }

  if (action === "save") {
    const { weekly, individual, total } = body.data as {
      weekly: Record<string, number>;
      individual: Record<string, number>;
      total: number;
    };

    const players = await getPlayers();
    const nickToId: Record<string, string> = {};
    players.forEach((p) => { nickToId[p.nick] = p.id; });

    const now = new Date();
    const weekStr = `points_history_${now.getFullYear()}_W${Math.ceil((now.getDate() - 1) / 7) + 1}`;
    const monthStr = `points_history_${now.getFullYear()}_M${String(now.getMonth() + 1).padStart(2, "0")}`;

    const errors: string[] = [];

    if (individual && Object.keys(individual).length > 0) {
      for (const [nick, pts] of Object.entries(individual) as [string, number][]) {
        const id = nickToId[nick];
        if (id) {
          const res = await fetch(`${SUPABASE_URL}/rest/v1/players?id=eq.${id}`, {
            method: "PATCH",
            headers: sbHeaders(),
            body: JSON.stringify({ points: pts }),
          });
          if (!res.ok) errors.push(`${nick}: individual update failed`);
        }
      }
    }

    if (weekly && Object.keys(weekly).length > 0) {
      const weeklyData: Record<string, number> = {};
      for (const [nick, pts] of Object.entries(weekly) as [string, number][]) {
        weeklyData[nick] = pts;
      }
      await fetch(`${SUPABASE_URL}/rest/v1/guild_settings?key=eq.${weekStr}`, {
        method: "DELETE",
        headers: sbHeaders(),
      });
      const res = await fetch(`${SUPABASE_URL}/rest/v1/guild_settings`, {
        method: "POST",
        headers: sbHeaders(),
        body: JSON.stringify({ key: weekStr, value: JSON.stringify(weeklyData) }),
      });
      if (!res.ok) errors.push("weekly save failed");
    }

    if (total) {
      const existing = await fetch(`${SUPABASE_URL}/rest/v1/guild_settings?key=eq.points_total`, { headers: sbHeaders() });
      if (existing.ok) {
        const existingData = await existing.json();
        await fetch(`${SUPABASE_URL}/rest/v1/guild_settings?key=eq.points_total`, {
          method: "DELETE",
          headers: sbHeaders(),
        });
      }
      const res = await fetch(`${SUPABASE_URL}/rest/v1/guild_settings`, {
        method: "POST",
        headers: sbHeaders(),
        body: JSON.stringify({ key: "points_total", value: JSON.stringify(total) }),
      });
      if (!res.ok) errors.push("total save failed");
    }

    if (errors.length > 0) {
      return NextResponse.json({ ok: false, errors }, { status: 500 });
    }
    return NextResponse.json({ ok: true, week: weekStr, updated: Object.keys(individual).length + Object.keys(weekly).length });
  }

  return NextResponse.json({ error: "invalid action" }, { status: 400 });
}
