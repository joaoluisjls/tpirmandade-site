"use client";

import { useMemo } from "react";
import type { Match, Championship, Participant } from "@/lib/bracket";
import { getRoundName } from "@/lib/bracket";

interface BracketViewProps {
  championship: Championship;
  onMatchClick?: (match: Match) => void;
  admin?: boolean;
  onDrop?: (participantId: string, matchId: string, slot: 1 | 2) => void;
}

function DraggableParticipant({ participant, used }: { participant: Participant; used: boolean }) {
  return (
    <div
      draggable
      onDragStart={(e) => {
        e.dataTransfer.setData("participantId", participant.id);
        e.dataTransfer.effectAllowed = "move";
      }}
      className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-xs transition-all ${
        used
          ? "border-white/5 bg-white/[0.02] opacity-40 cursor-grab"
          : "border-primary/20 bg-primary/5 hover:border-primary/40 cursor-grab active:cursor-grabbing"
      }`}
    >
      {participant.logo ? (
        <img src={participant.logo} alt="" className="w-5 h-5 rounded object-cover" />
      ) : (
        <div className="w-5 h-5 rounded bg-white/10 flex items-center justify-center text-[8px] text-white/40 font-bold">{participant.name[0]}</div>
      )}
      <span className="text-white/70 truncate">{participant.name}</span>
      <span className="text-primary/40 ml-auto text-[10px]">&#9776;</span>
    </div>
  );
}

function SlotDrop({ match, slot, admin, isFinished, children }: {
  match: Match;
  slot: 1 | 2;
  admin?: boolean;
  isFinished: boolean;
  children: React.ReactNode;
  onDrop?: (participantId: string, matchId: string, slot: 1 | 2) => void;
}) {
  const participant = slot === 1 ? match.participant1 : match.participant2;
  const otherParticipant = slot === 1 ? match.participant2 : match.participant1;

  const handleDragOver = (e: React.DragEvent) => {
    if (!admin || isFinished) return;
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    e.currentTarget.classList.add("ring-2", "ring-primary/50", "bg-primary/10");
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.currentTarget.classList.remove("ring-2", "ring-primary/50", "bg-primary/10");
  };

  const handleDrop = (e: React.DragEvent) => {
    e.currentTarget.classList.remove("ring-2", "ring-primary/50", "bg-primary/10");
    if (!admin || isFinished) return;
    e.preventDefault();
    e.stopPropagation();
    const pid = e.dataTransfer.getData("participantId");
    if (pid && pid !== otherParticipant?.id) {
      const event = new CustomEvent("bracket-drop", { detail: { participantId: pid, matchId: match.id, slot } });
      window.dispatchEvent(event);
    }
  };

  return (
    <div
      draggable={admin && !!participant && !isFinished}
      onDragStart={(e) => {
        if (!participant || isFinished) return;
        e.dataTransfer.setData("participantId", participant.id);
        e.dataTransfer.effectAllowed = "move";
      }}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={admin && !isFinished ? "min-h-[36px] rounded transition-all" : ""}
    >
      {children}
    </div>
  );
}

function MatchCard({ match, onMatchClick, admin }: {
  match: Match;
  onMatchClick?: (match: Match) => void;
  admin?: boolean;
}) {
  const p1 = match.participant1;
  const p2 = match.participant2;
  const isBye1 = p1?.name === "BYE";
  const isBye2 = p2?.name === "BYE";
  const hasPlayers = p1 && !isBye1 && p2 && !isBye2;
  const isFinished = match.status === "finished";
  const isP1Winner = match.winner === p1?.id;
  const isP2Winner = match.winner === p2?.id;

  return (
    <div
      className={`rounded-lg border transition-all ${
        admin && hasPlayers
          ? "border-primary/30 bg-primary/5 hover:border-primary/50 cursor-pointer"
          : "border-white/10 bg-white/[0.02]"
      } ${isFinished ? "border-white/15" : ""}`}
      onClick={() => admin && hasPlayers && onMatchClick?.(match)}
    >
      <div className="px-3 py-1.5 text-[10px] text-white/20 uppercase tracking-wider border-b border-white/5">
        {match.id.replace("match_", "").replace("_", " ")}
      </div>

      <SlotDrop match={match} slot={1} admin={admin} isFinished={isFinished}>
        <div className={`flex items-center ${!p1 || isBye1 ? "opacity-30" : ""}`}>
          <div className="flex-1 px-3 py-2 flex items-center gap-2">
            {p1?.logo ? (
              <img src={p1.logo} alt="" className="w-5 h-5 rounded object-cover" />
            ) : (
              <div className="w-5 h-5 rounded bg-white/5 flex items-center justify-center text-[8px] text-white/30">
                {p1?.name?.[0] || "?"}
              </div>
            )}
            <span className={`text-xs truncate ${isP1Winner ? "text-green-400 font-bold" : "text-white/70"}`}>
              {p1?.name || (admin && !isFinished ? "Arraste aqui" : "A definir")}
            </span>
            {isP1Winner && <span className="text-green-400 text-[10px]">&#9654;</span>}
          </div>
          <span className={`text-xs font-bold px-2 ${isP1Winner ? "text-green-400" : "text-white/30"}`}>
            {match.score1 ?? (isBye1 || !p1 ? "-" : "")}
          </span>
        </div>
      </SlotDrop>

      <div className="border-t border-white/5" />

      <SlotDrop match={match} slot={2} admin={admin} isFinished={isFinished}>
        <div className={`flex items-center ${!p2 || isBye2 ? "opacity-30" : ""}`}>
          <div className="flex-1 px-3 py-2 flex items-center gap-2">
            {p2?.logo ? (
              <img src={p2.logo} alt="" className="w-5 h-5 rounded object-cover" />
            ) : (
              <div className="w-5 h-5 rounded bg-white/5 flex items-center justify-center text-[8px] text-white/30">
                {p2?.name?.[0] || "?"}
              </div>
            )}
            <span className={`text-xs truncate ${isP2Winner ? "text-green-400 font-bold" : "text-white/70"}`}>
              {p2?.name || (admin && !isFinished ? "Arraste aqui" : "A definir")}
            </span>
            {isP2Winner && <span className="text-green-400 text-[10px]">&#9654;</span>}
          </div>
          <span className={`text-xs font-bold px-2 ${isP2Winner ? "text-green-400" : "text-white/30"}`}>
            {match.score2 ?? (isBye2 || !p2 ? "-" : "")}
          </span>
        </div>
      </SlotDrop>
    </div>
  );
}

export function BracketView({ championship, onMatchClick, admin, onDrop }: BracketViewProps) {
  const rounds = useMemo(() => {
    const roundMap: Record<number, Match[]> = {};
    for (const match of championship.matches) {
      if (!roundMap[match.round]) roundMap[match.round] = [];
      roundMap[match.round].push(match);
    }
    const maxRound = Math.max(...Object.keys(roundMap).map(Number), 0);
    const result: { name: string; matches: Match[] }[] = [];
    for (let r = 0; r <= maxRound; r++) {
      result.push({
        name: getRoundName(r, maxRound + 1),
        matches: (roundMap[r] || []).sort((a, b) => a.position - b.position),
      });
    }
    return result;
  }, [championship.matches]);

  const usedParticipantIds = useMemo(() => {
    const ids = new Set<string>();
    for (const m of championship.matches) {
      if (m.participant1) ids.add(m.participant1.id);
      if (m.participant2) ids.add(m.participant2.id);
    }
    return ids;
  }, [championship.matches]);

  const availableParticipants = useMemo(() => {
    return championship.participants.filter((p) => !usedParticipantIds.has(p.id));
  }, [championship.participants, usedParticipantIds]);

  if (championship.matches.length === 0) {
    return (
      <div className="text-center py-12 text-white/30">
        <p className="text-sm">Nenhum chaveamento gerado ainda.</p>
        <p className="text-xs mt-1">Adicione participantes para gerar a chave.</p>
      </div>
    );
  }

  if (championship.participants.length === 1) {
    const p = championship.participants[0];
    return (
      <div className="text-center py-12">
        <div className="inline-flex flex-col items-center gap-4 p-8 rounded-2xl border border-yellow-500/20 bg-yellow-500/5">
          <div className="text-5xl">&#127942;</div>
          <div className="text-lg font-black text-yellow-400">CAMPEAO</div>
          {p.logo ? (
            <img src={p.logo} alt={p.name} className="w-16 h-16 rounded-full object-cover border-2 border-yellow-500/30" />
          ) : (
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-yellow-500 to-orange-500 flex items-center justify-center text-2xl font-black text-white">
              {p.name[0]}
            </div>
          )}
          <div className="text-white font-bold text-xl">{p.name}</div>
          <div className="text-xs text-white/30">Classificacao automatica</div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex gap-4">
      {admin && availableParticipants.length > 0 && (
        <div className="shrink-0 w-48 hidden lg:block">
          <div className="text-[10px] font-bold text-white/30 uppercase tracking-wider mb-2 px-1">
            Disponiveis ({availableParticipants.length})
          </div>
          <div className="space-y-1 sticky top-4">
            {availableParticipants.map((p) => (
              <DraggableParticipant key={p.id} participant={p} used={usedParticipantIds.has(p.id)} />
            ))}
          </div>
        </div>
      )}

      <div className="overflow-x-auto pb-4 flex-1">
        {admin && availableParticipants.length > 0 && (
          <div className="mb-4 lg:hidden">
            <div className="text-[10px] font-bold text-white/30 uppercase tracking-wider mb-2">
              Arraste para os slots:
            </div>
            <div className="flex flex-wrap gap-1">
              {availableParticipants.map((p) => (
                <DraggableParticipant key={p.id} participant={p} used={usedParticipantIds.has(p.id)} />
              ))}
            </div>
          </div>
        )}

        <div className="flex gap-0 items-stretch min-w-max">
          {rounds.map((round, ri) => (
            <div key={ri} className="flex flex-col items-center">
              <div className="text-[10px] font-bold text-white/30 uppercase tracking-wider mb-3 px-4 text-center whitespace-nowrap">
                {round.name}
              </div>
              <div className="flex flex-col justify-around flex-1 gap-4 px-2" style={{ gap: `${ri * 24 + 16}px` }}>
                {round.matches.map((match) => (
                  <div key={match.id} className="w-44 shrink-0">
                    <MatchCard match={match} onMatchClick={onMatchClick} admin={admin} />
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function BracketViewMobile({ championship, onMatchClick, admin, onDrop }: BracketViewProps) {
  const rounds = useMemo(() => {
    const roundMap: Record<number, Match[]> = {};
    for (const match of championship.matches) {
      if (!roundMap[match.round]) roundMap[match.round] = [];
      roundMap[match.round].push(match);
    }
    const maxRound = Math.max(...Object.keys(roundMap).map(Number), 0);
    const result: { name: string; matches: Match[] }[] = [];
    for (let r = 0; r <= maxRound; r++) {
      result.push({
        name: getRoundName(r, maxRound + 1),
        matches: (roundMap[r] || []).sort((a, b) => a.position - b.position),
      });
    }
    return result;
  }, [championship.matches]);

  const usedParticipantIds = useMemo(() => {
    const ids = new Set<string>();
    for (const m of championship.matches) {
      if (m.participant1) ids.add(m.participant1.id);
      if (m.participant2) ids.add(m.participant2.id);
    }
    return ids;
  }, [championship.matches]);

  const availableParticipants = useMemo(() => {
    return championship.participants.filter((p) => !usedParticipantIds.has(p.id));
  }, [championship.participants, usedParticipantIds]);

  if (championship.matches.length === 0) {
    return (
      <div className="text-center py-8 text-white/30">
        <p className="text-sm">Nenhum chaveamento gerado ainda.</p>
      </div>
    );
  }

  if (championship.participants.length === 1) {
    const p = championship.participants[0];
    return (
      <div className="text-center py-8">
        <div className="inline-flex flex-col items-center gap-3 p-6 rounded-2xl border border-yellow-500/20 bg-yellow-500/5">
          <div className="text-4xl">&#127942;</div>
          <div className="text-sm font-black text-yellow-400">CAMPEAO</div>
          <div className="text-white font-bold">{p.name}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {admin && availableParticipants.length > 0 && (
        <div>
          <div className="text-[10px] font-bold text-white/30 uppercase tracking-wider mb-2">
            Arraste para os slots:
          </div>
          <div className="flex flex-wrap gap-1">
            {availableParticipants.map((p) => (
              <DraggableParticipant key={p.id} participant={p} used={usedParticipantIds.has(p.id)} />
            ))}
          </div>
        </div>
      )}

      {rounds.map((round, ri) => (
        <div key={ri}>
          <div className="text-xs font-bold text-white/40 uppercase tracking-wider mb-3 text-center">
            {round.name}
          </div>
          <div className="space-y-3">
            {round.matches.map((match) => (
              <MatchCard key={match.id} match={match} onMatchClick={onMatchClick} admin={admin} />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
