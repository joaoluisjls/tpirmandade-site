"use client";

import { useEffect, useState } from "react";
import { Toast } from "@/components/ui";

interface Player {
  id: string;
  nick: string;
}

interface ParsedEntry {
  nick: string;
  points: number;
  type: "semana" | "individual" | "total";
}

export default function AdminPointsPage() {
  const [players, setPlayers] = useState<Player[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState("");
  const [pasteText, setPasteText] = useState("");
  const [parsed, setParsed] = useState<ParsedEntry[]>([]);

  useEffect(() => {
    fetch("/api/points", { cache: "no-store" })
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data)) setPlayers(data);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  function parseText(text: string): ParsedEntry[] {
    const lines = text.split("\n").filter(Boolean);
    const nickToLower = new Map(players.map((p) => [p.nick.toLowerCase(), p.nick]));
    const results: ParsedEntry[] = [];

    for (const line of lines) {
      const trimmed = line.trim();
      const match = trimmed.match(/^(\S+)\s+(\d+)/);
      if (!match) continue;

      const rawNick = match[1];
      const pts = parseInt(match[2], 10);
      const canonicalNick = nickToLower.get(rawNick.toLowerCase()) || rawNick;
      results.push({ nick: canonicalNick, points: pts, type: "individual" });
    }

    return results;
  }

  const handleParse = () => {
    const results = parseText(pasteText);
    setParsed(results);
    setToast(`✅ ${results.length} entrada(s) parseada(s)`);
  };

  const updateType = (index: number, type: "semana" | "individual" | "total") => {
    setParsed((prev) => prev.map((e, i) => (i === index ? { ...e, type } : e)));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const weekly: Record<string, number> = {};
      const individual: Record<string, number> = {};
      let total = 0;

      for (const entry of parsed) {
        if (entry.type === "semana") {
          weekly[entry.nick] = entry.points;
        } else if (entry.type === "individual") {
          individual[entry.nick] = entry.points;
        } else if (entry.type === "total") {
          total += entry.points;
        }
      }

      const res = await fetch("/api/points", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "save",
          data: { weekly, individual, total },
        }),
      });
      const result = await res.json();
      if (result.ok) {
        setToast(`✅ Tudo salvo! (${parsed.length} entradas)`);
        setParsed([]);
        setPasteText("");
      } else {
        setToast("❌ Erro ao salvar!");
      }
    } catch (err) {
      setToast("❌ Erro!");
    }
    setSaving(false);
  };

  if (loading) return <p className="text-white/40">Carregando jogadores...</p>;

  return (
    <div>
      <Toast message={toast} onClose={() => setToast("")} />

      <h1 className="text-2xl font-black text-white mb-6">📊 Pontos em Massa</h1>

      <div className="bg-white/[0.02] border border-white/5 rounded-xl p-6 mb-6">
        <p className="text-sm text-white/50 mb-4">
          Cole o texto do ChatGPT. Formato: <code className="text-primary">Nick Pontos</code>
        </p>
        <code className="block bg-black/40 rounded-lg p-4 text-xs text-primary font-mono mb-4">
          MarquinhT.I 15000<br />
          JoaoT.I 12000<br />
          LucasT.I 8000
        </code>

        <textarea
          value={pasteText}
          onChange={(e) => { setPasteText(e.target.value); setParsed([]); }}
          rows={8}
          placeholder="MarquinhT.I 15000&#10;JoaoT.I 12000&#10;LucasT.I 8000"
          className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-sm font-mono focus:outline-none focus:border-primary/50 resize-none"
        />

        <div className="flex gap-3 mt-4">
          <button
            onClick={handleParse}
            className="px-6 py-2 rounded-lg bg-white/10 text-white font-bold text-sm hover:bg-white/20 transition-all"
          >
            🔍 Parsear
          </button>
          {parsed.length > 0 && (
            <button
              onClick={handleSave}
              disabled={saving}
              className="px-6 py-2 rounded-lg bg-primary text-white font-bold text-sm hover:shadow-lg hover:shadow-primary/20 transition-all disabled:opacity-50"
            >
              {saving ? "Salvando..." : `🚀 Salvar ${parsed.length} entrada(s)`}
            </button>
          )}
        </div>
      </div>

      {parsed.length > 0 && (
        <div className="bg-white/[0.02] border border-white/5 rounded-xl overflow-hidden">
          <div className="px-4 py-3 bg-white/5 text-xs font-bold text-white/40 uppercase grid grid-cols-5 gap-4">
            <div>Jogador</div>
            <div>Pontos</div>
            <div>Tipo</div>
            <div>Status</div>
            <div></div>
          </div>
          {parsed.map((entry, i) => (
            <div key={i} className="px-4 py-2.5 border-t border-white/5 grid grid-cols-5 gap-4 items-center">
              <div className="text-sm font-bold text-white">{entry.nick}</div>
              <div className="text-sm font-bold text-primary">{entry.points.toLocaleString()}</div>
              <div>
                <select
                  value={entry.type}
                  onChange={(e) => updateType(i, e.target.value as "semana" | "individual" | "total")}
                  className="px-2 py-1 rounded bg-white/5 border border-white/10 text-white text-xs focus:outline-none focus:border-primary/50"
                >
                  <option value="semana">📅 Semana</option>
                  <option value="individual">👤 Individual</option>
                  <option value="total">🏆 Total</option>
                </select>
              </div>
              <div className="text-xs text-white/40">✅</div>
              <div></div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
