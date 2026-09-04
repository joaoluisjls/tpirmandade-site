"use client";

import type { Group, GroupStanding, GroupMatch } from "@/lib/bracket";
import { calculateGroupStandings } from "@/lib/bracket";

interface GroupTableProps {
  group: Group;
  onMatchClick?: (match: GroupMatch, groupId: string) => void;
  admin?: boolean;
}

function MatchRow({ match, onMatchClick, admin, groupId }: {
  match: GroupMatch;
  onMatchClick?: (match: GroupMatch, groupId: string) => void;
  admin?: boolean;
  groupId: string;
}) {
  const isFinished = match.status === "finished";
  const p1 = match.participant1;
  const p2 = match.participant2;

  return (
    <div
      className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs ${
        admin ? "hover:bg-white/5 cursor-pointer" : ""
      } ${isFinished ? "bg-white/[0.02]" : ""}`}
      onClick={() => admin && onMatchClick?.(match, groupId)}
    >
      <div className="flex-1 flex items-center gap-2">
        {p1?.logo ? (
          <img src={p1.logo} alt="" className="w-4 h-4 rounded object-cover" />
        ) : (
          <div className="w-4 h-4 rounded bg-white/5 flex items-center justify-center text-[7px] text-white/30">{p1?.name?.[0]}</div>
        )}
        <span className="text-white/70 truncate">{p1?.name || "?"}</span>
      </div>
      <span className={`font-bold px-1 min-w-[24px] text-center ${isFinished ? "text-white" : "text-white/20"}`}>
        {match.score1 ?? "-"}
      </span>
      <span className="text-white/20">x</span>
      <span className={`font-bold px-1 min-w-[24px] text-center ${isFinished ? "text-white" : "text-white/20"}`}>
        {match.score2 ?? "-"}
      </span>
      <div className="flex-1 flex items-center gap-2 justify-end">
        <span className="text-white/70 truncate">{p2?.name || "?"}</span>
        {p2?.logo ? (
          <img src={p2.logo} alt="" className="w-4 h-4 rounded object-cover" />
        ) : (
          <div className="w-4 h-4 rounded bg-white/5 flex items-center justify-center text-[7px] text-white/30">{p2?.name?.[0]}</div>
        )}
      </div>
    </div>
  );
}

export function GroupTable({ group, onMatchClick, admin }: GroupTableProps) {
  const standings = calculateGroupStandings(group);

  return (
    <div className="rounded-xl border border-white/10 bg-white/[0.02] overflow-hidden">
      <div className="px-4 py-3 border-b border-white/5 bg-white/[0.02]">
        <h3 className="text-sm font-black text-white">
          GRUPO <span className="text-primary">{group.name}</span>
        </h3>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-xs">
          <thead>
            <tr className="border-b border-white/5">
              <th className="text-left px-3 py-2 text-white/30 font-medium">#</th>
              <th className="text-left px-3 py-2 text-white/30 font-medium">Time</th>
              <th className="text-center px-2 py-2 text-white/30 font-medium">P</th>
              <th className="text-center px-2 py-2 text-white/30 font-medium">V</th>
              <th className="text-center px-2 py-2 text-white/30 font-medium">E</th>
              <th className="text-center px-2 py-2 text-white/30 font-medium">D</th>
              <th className="text-center px-2 py-2 text-white/30 font-medium">GP</th>
              <th className="text-center px-2 py-2 text-white/30 font-medium">GC</th>
              <th className="text-center px-2 py-2 text-white/30 font-medium">SG</th>
              <th className="text-center px-3 py-2 text-white/30 font-bold">PTS</th>
            </tr>
          </thead>
          <tbody>
            {standings.map((s, i) => (
              <tr key={s.participant.id} className={`border-b border-white/5 last:border-0 ${i < group.advanceCount ? "bg-green-500/5" : ""}`}>
                <td className="px-3 py-2 text-white/30">{i + 1}</td>
                <td className="px-3 py-2">
                  <div className="flex items-center gap-2">
                    {s.participant.logo ? (
                      <img src={s.participant.logo} alt="" className="w-5 h-5 rounded object-cover" />
                    ) : (
                      <div className="w-5 h-5 rounded bg-white/10 flex items-center justify-center text-[8px] text-white/40 font-bold">{s.participant.name[0]}</div>
                    )}
                    <span className="text-white/80 font-medium truncate">{s.participant.name}</span>
                  </div>
                </td>
                <td className="text-center px-2 py-2 text-white/50">{s.played}</td>
                <td className="text-center px-2 py-2 text-green-400">{s.wins}</td>
                <td className="text-center px-2 py-2 text-yellow-400">{s.draws}</td>
                <td className="text-center px-2 py-2 text-red-400">{s.losses}</td>
                <td className="text-center px-2 py-2 text-white/50">{s.goalsFor}</td>
                <td className="text-center px-2 py-2 text-white/50">{s.goalsAgainst}</td>
                <td className={`text-center px-2 py-2 font-bold ${s.goalDiff > 0 ? "text-green-400" : s.goalDiff < 0 ? "text-red-400" : "text-white/30"}`}>
                  {s.goalDiff > 0 ? `+${s.goalDiff}` : s.goalDiff}
                </td>
                <td className="text-center px-3 py-2 text-primary font-black">{s.points}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="px-4 py-2 border-t border-white/5 bg-white/[0.01]">
        <div className="text-[10px] text-white/20">
          {group.advanceCount} classificado{group.advanceCount > 1 ? "s" : ""} por grupo
        </div>
      </div>

      {group.matches.length > 0 && (
        <div className="px-3 py-3 border-t border-white/5 space-y-1">
          <div className="text-[10px] text-white/20 uppercase tracking-wider mb-1 px-1">Partidas</div>
          {group.matches.map((m) => (
            <MatchRow key={m.id} match={m} onMatchClick={onMatchClick} admin={admin} groupId={group.id} />
          ))}
        </div>
      )}
    </div>
  );
}
