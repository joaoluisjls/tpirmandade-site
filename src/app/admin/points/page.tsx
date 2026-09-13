"use client";

import { useEffect, useState } from "react";

interface Player {
  id: string;
  nick: string;
  points: number;
}

export default function AdminPointsPage() {
  const [players, setPlayers] = useState<Player[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState("");
  const [pasteText, setPasteText] = useState("");
  const [parsed, setParsed] = useState<{ nick: string; points: number; type: "semana" | "individual" | "total" }[]>([]);

  const [manualNick, setManualNick] = useState("");
  const [manualPts, setManualPts] = useState("");
  const [manualType, setManualType] = useState<"semana" | "individual" | "total">("semana");

  const loadPlayers = () => {
    fetch("/api/points", { cache: "no-store" })
      .then((r) => r.json())
      .then((data) => { if (Array.isArray(data)) setPlayers(data); })
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => { loadPlayers(); }, []);

  const handleManualSave = async () => {
    if (!manualNick || !manualPts) { setToast("Selecione jogador e informe os pontos"); return; }
    const pts = parseInt(manualPts, 10);
    if (isNaN(pts) || pts <= 0) { setToast("Pontos invalidos"); return; }

    setSaving(true);
    try {
      const body: any = { action: "save", data: { weekly: {}, individual: {}, total: 0 } };
      if (manualType === "semana") body.data.weekly = { [manualNick]: pts };
      else if (manualType === "individual") body.data.individual = { [manualNick]: pts };
      else body.data.total = pts;

      const res = await fetch("/api/points", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const result = await res.json();
      if (result.ok) {
        setToast(`${pts} pontos (${manualType}) adicionados para ${manualNick}!`);
        setManualPts("");
        loadPlayers();
      } else {
        setToast("Erro ao salvar!");
      }
    } catch {
      setToast("Erro ao salvar!");
    }
    setSaving(false);
  };

  function parseText(text: string) {
    const lines = text.split("\n").filter(Boolean);
    const nickToLower = new Map(players.map((p) => [p.nick.toLowerCase(), p.nick]));
    const results: { nick: string; points: number; type: "semana" | "individual" | "total" }[] = [];

    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed) continue;

      const lower = trimmed.toLowerCase();
      let type: "semana" | "individual" | "total" = "individual";
      let cleanLine = trimmed;

      if (/\b(semana|semanas)\b/.test(lower)) { type = "semana"; cleanLine = trimmed.replace(/\b(semana|semanas)\b/gi, "").trim(); }
      else if (/\b(individual|individuais)\b/.test(lower)) { type = "individual"; cleanLine = trimmed.replace(/\b(individual|individuais)\b/gi, "").trim(); }
      else if (/\b(total|totais)\b/.test(lower)) { type = "total"; cleanLine = trimmed.replace(/\b(total|totais)\b/gi, "").trim(); }

      const match = cleanLine.match(/^(.+?)\s+(\d+)$/);
      if (!match) continue;

      const rawNick = match[1].trim();
      const pts = parseInt(match[2], 10);
      const canonicalNick = nickToLower.get(rawNick.toLowerCase());
      if (!canonicalNick) continue;
      results.push({ nick: canonicalNick, points: pts, type });
    }
    return results;
  }

  const handleParse = () => {
    const results = parseText(pasteText);
    setParsed(results);
    setToast(`${results.length} jogador(es) encontrado(s)`);
  };

  const updateType = (index: number, type: "semana" | "individual" | "total") => {
    setParsed((prev) => prev.map((e, i) => (i === index ? { ...e, type } : e)));
  };

  const removeParsed = (index: number) => {
    setParsed((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSaveAll = async () => {
    setSaving(true);
    try {
      const weekly: Record<string, number> = {};
      const individual: Record<string, number> = {};
      const totalByNick: Record<string, number> = {};

      for (const entry of parsed) {
        if (entry.type === "semana") weekly[entry.nick] = entry.points;
        else if (entry.type === "individual") individual[entry.nick] = entry.points;
        else totalByNick[entry.nick] = entry.points;
      }

      const res = await fetch("/api/points", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "save", data: { weekly, individual, total: totalByNick } }),
      });
      const result = await res.json();
      if (result.ok) {
        setToast(`${parsed.length} entrada(s) salva(s)!`);
        setParsed([]);
        setPasteText("");
        loadPlayers();
      } else {
        setToast("Erro ao salvar!");
      }
    } catch {
      setToast("Erro ao salvar!");
    }
    setSaving(false);
  };

  if (loading) return <p className="text-white/40">Carregando jogadores...</p>;

  return (
    <div>
      {toast && (
        <div className="fixed top-4 right-4 z-[100] bg-green-500 text-white px-4 py-3 rounded-lg shadow-lg flex items-center gap-3">
          <span className="text-sm font-bold">{toast}</span>
          <button onClick={() => setToast("")} className="text-white/70 hover:text-white text-lg leading-none">&times;</button>
        </div>
      )}

      <h1 className="text-2xl font-black text-white mb-6">Pontos em Massa</h1>

      {players.length === 0 ? (
        <div className="rounded-xl border border-yellow-500/20 bg-yellow-500/5 p-8 text-center">
          <p className="text-yellow-400 font-bold mb-2">Nenhum jogador cadastrado</p>
          <p className="text-white/40 text-sm">Cadastre jogadores primeiro em <a href="/admin/jogadores" className="text-primary underline">Admin → Jogadores</a> ou aguarde cadastros pelo <a href="/recrutamento" className="text-primary underline">recrutamento</a></p>
        </div>
      ) : (
        <>
          {/* Adicionar pontos manualmente */}
          <div className="bg-white/[0.02] border border-white/5 rounded-xl p-6 mb-6">
            <h2 className="text-sm font-bold text-white/60 uppercase tracking-wider mb-4">Adicionar Pontos</h2>
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
              <select
                value={manualNick}
                onChange={(e) => setManualNick(e.target.value)}
                className="px-3 py-2.5 rounded-lg bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-primary/50"
              >
                <option value="" className="bg-[#0a0a0f]">Selecione o jogador</option>
                {players.map((p) => (
                  <option key={p.id} value={p.nick} className="bg-[#0a0a0f]">{p.nick}</option>
                ))}
              </select>
              <input
                type="number"
                value={manualPts}
                onChange={(e) => setManualPts(e.target.value)}
                placeholder="Pontos"
                className="px-3 py-2.5 rounded-lg bg-white/5 border border-white/10 text-white text-sm placeholder:text-white/20 focus:outline-none focus:border-primary/50"
              />
              <select
                value={manualType}
                onChange={(e) => setManualType(e.target.value as any)}
                className="px-3 py-2.5 rounded-lg bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-primary/50"
              >
                <option value="semana" className="bg-[#0a0a0f]">Semana</option>
                <option value="individual" className="bg-[#0a0a0f]">Individual</option>
                <option value="total" className="bg-[#0a0a0f]">Total</option>
              </select>
              <button
                onClick={handleManualSave}
                disabled={saving || !manualNick || !manualPts}
                className="px-6 py-2.5 rounded-lg bg-gradient-to-r from-primary to-primary-dark text-white font-bold text-sm hover:shadow-lg hover:shadow-primary/20 transition-all disabled:opacity-50"
              >
                {saving ? "Salvando..." : "Adicionar"}
              </button>
            </div>
          </div>

          {/* Colar texto */}
          <div className="bg-white/[0.02] border border-white/5 rounded-xl p-6 mb-6">
            <h2 className="text-sm font-bold text-white/60 uppercase tracking-wider mb-2">Colar em Massa</h2>
            <p className="text-xs text-white/30 mb-4">Formatos: <code className="text-primary">Nick Pontos</code> ou <code className="text-primary">Nick Pontos Tipo</code> (Tipo = Semana, Individual, Total)</p>
            <textarea
              value={pasteText}
              onChange={(e) => { setPasteText(e.target.value); setParsed([]); }}
              rows={6}
              placeholder={"CORINGA 100 SEMANA\nMarquinhoT.I 200\nDIOGO 4 T.I 150 TOTAL"}
              className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-sm font-mono focus:outline-none focus:border-primary/50 resize-none"
            />
            <div className="flex gap-3 mt-3">
              <button onClick={handleParse} className="px-5 py-2 rounded-lg bg-white/10 text-white font-bold text-sm hover:bg-white/20 transition-all">
                Parsear
              </button>
              {parsed.length > 0 && (
                <button onClick={handleSaveAll} disabled={saving} className="px-5 py-2 rounded-lg bg-primary text-white font-bold text-sm hover:shadow-lg hover:shadow-primary/20 transition-all disabled:opacity-50">
                  {saving ? "Salvando..." : `Salvar ${parsed.length} entrada(s)`}
                </button>
              )}
            </div>
          </div>

          {/* Tabela parseada */}
          {parsed.length > 0 && (
            <div className="bg-white/[0.02] border border-white/5 rounded-xl overflow-hidden mb-6">
              <div className="px-4 py-3 bg-white/5 text-xs font-bold text-white/40 uppercase grid grid-cols-4 gap-4">
                <div>Jogador</div>
                <div>Pontos</div>
                <div>Tipo</div>
                <div></div>
              </div>
              {parsed.map((entry, i) => (
                <div key={i} className="px-4 py-2.5 border-t border-white/5 grid grid-cols-4 gap-4 items-center">
                  <div className="text-sm font-bold text-white">{entry.nick}</div>
                  <div className="text-sm font-bold text-primary">{entry.points.toLocaleString()}</div>
                  <div>
                    <select
                      value={entry.type}
                      onChange={(e) => updateType(i, e.target.value as any)}
                      className="px-2 py-1 rounded bg-white/5 border border-white/10 text-white text-xs focus:outline-none focus:border-primary/50"
                    >
                      <option value="semana" className="bg-[#0a0a0f]">Semana</option>
                      <option value="individual" className="bg-[#0a0a0f]">Individual</option>
                      <option value="total" className="bg-[#0a0a0f]">Total</option>
                    </select>
                  </div>
                  <div className="text-right">
                    <button onClick={() => removeParsed(i)} className="text-red-400 text-xs hover:text-red-300">Remover</button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Lista de jogadores */}
          <div className="bg-white/[0.02] border border-white/5 rounded-xl overflow-hidden">
            <div className="px-4 py-3 bg-white/5 text-xs font-bold text-white/40 uppercase grid grid-cols-3 gap-4">
              <div>Jogador</div>
              <div className="text-center">Pontos</div>
              <div className="text-center">ID</div>
            </div>
            {players.map((p) => (
              <div key={p.id} className="px-4 py-2.5 border-t border-white/5 grid grid-cols-3 gap-4 items-center">
                <div className="text-sm font-bold text-white">{p.nick}</div>
                <div className="text-sm font-bold text-primary text-center">{p.points || 0}</div>
                <div className="text-xs text-white/30 text-center truncate">{p.id}</div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
