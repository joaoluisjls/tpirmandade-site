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
  const res = await fetch(`${SUPABASE_URL}/rest/v1/players?select=id,nick,weekly_evolution,points&limit=500`, { headers: sbHeaders() });
  if (!res.ok) return [];
  return await res.json();
}

export async function GET() {
  const players = await getPlayers();
  return NextResponse.json(players);
}

export async function PUT(request: Request) {
  const body = await request.json();
  const { action, data } = body as { action: string; data: any };

  if (action === "save") {
    const { weekly, individual, total } = data as {
      weekly: Record<string, number>;
      individual: Record<string, number>;
      total: number;
    };

  const players = await getPlayers();
  const nickToId: Record<string, string> = {};
  (players as { nick: string; id: string }[]).forEach((p) => { nickToId[p.nick] = p.id; });

    const now = new Date();
    const weekStr = `points_history_${now.getFullYear()}_W${Math.ceil((now.getDate() - 1) / 7) + 1}`;
    const weekLabel = `2026_W${Math.ceil((now.getDate() - 1) / 7) + 1}`;
    const errors: string[] = [];

    const individualUpdates: any[] = [];
    const weeklyUpdates: any[] = [];

    if (individual && Object.keys(individual).length > 0) {
      for (const [nick, pts] of Object.entries(individual) as [string, number][]) {
        const id = nickToId[nick];
        if (id) individualUpdates.push({ id, points: pts });
      }
    }

    if (weekly && Object.keys(weekly).length > 0) {
      for (const [nick, pts] of Object.entries(weekly) as [string, number][]) {
        const id = nickToId[nick];
        if (id) {
          const player = (players as { nick: string; id: string; weekly_evolution: any[] }[]).find((p) => p.nick === nick);
          const currentWE = player?.weekly_evolution || [];
          const existingIdx = currentWE.findIndex((w: any) => w.week === weekLabel);
          if (existingIdx >= 0) {
            currentWE[existingIdx] = { week: weekLabel, points: pts };
          } else {
            currentWE.push({ week: weekLabel, points: pts });
          }
          weeklyUpdates.push({ id, weekly_evolution: currentWE });
        }
      }

      const weeklyData: Record<string, number> = {};
      for (const [nick, pts] of Object.entries(weekly) as [string, number][]) {
        weeklyData[nick] = pts;
      }
      await fetch(`${SUPABASE_URL}/rest/v1/guild_settings?key=eq.${weekStr}`, {
        method: "DELETE",
        headers: sbHeaders(),
      });
      const insertRes = await fetch(`${SUPABASE_URL}/rest/v1/guild_settings`, {
        method: "POST",
        headers: sbHeaders(),
        body: JSON.stringify({ key: weekStr, value: JSON.stringify(weeklyData) }),
      });
      if (!insertRes.ok) errors.push("weekly guild_settings insert failed");
    }

    if (individualUpdates.length > 0) {
      for (const update of individualUpdates) {
        const res = await fetch(`${SUPABASE_URL}/rest/v1/players?id=eq.${update.id}`, {
          method: "PATCH",
          headers: sbHeaders(),
          body: JSON.stringify({ points: update.points }),
        });
        if (!res.ok) errors.push(`${update.id}: individual failed`);
      }
    }

    if (weeklyUpdates.length > 0) {
      for (const update of weeklyUpdates) {
        const res = await fetch(`${SUPABASE_URL}/rest/v1/players?id=eq.${update.id}`, {
          method: "PATCH",
          headers: sbHeaders(),
          body: JSON.stringify({ weekly_evolution: update.weekly_evolution }),
        });
        if (!res.ok) errors.push(`${update.id}: weekly_evolution failed`);
      }
    }

    if (total) {
      await fetch(`${SUPABASE_URL}/rest/v1/guild_settings?key=eq.points_total`, {
        method: "DELETE",
        headers: sbHeaders(),
      });
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
    return NextResponse.json({ ok: true, week: weekStr });
  }

  return NextResponse.json({ error: "invalid action" }, { status: 400 });
}
