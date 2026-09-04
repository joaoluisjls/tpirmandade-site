export interface Participant {
  id: string;
  name: string;
  logo: string;
}

export interface Match {
  id: string;
  round: number;
  position: number;
  participant1: Participant | null;
  participant2: Participant | null;
  score1: number | null;
  score2: number | null;
  winner: string | null;
  status: "pending" | "in_progress" | "finished";
  nextMatchId: string | null;
  nextSlot: 1 | 2 | null;
}

export interface Championship {
  id: string;
  name: string;
  description: string;
  date: string;
  time: string;
  status: "open" | "in_progress" | "finished" | "scheduled";
  prize: string;
  rules: string;
  notes: string;
  participants: Participant[];
  matches: Match[];
  champion: Participant | null;
  created_at: string;
}

function nextPowerOf2(n: number): number {
  if (n <= 1) return 1;
  let p = 1;
  while (p < n) p *= 2;
  return p;
}

function log2(n: number): number {
  return Math.ceil(Math.log2(Math.max(n, 1)));
}

export function getRoundName(roundIndex: number, totalRounds: number): string {
  const roundsFromFinal = totalRounds - 1 - roundIndex;
  if (roundsFromFinal === 0) return "FINAL";
  if (roundsFromFinal === 1) return "SEMIFINAL";
  if (roundsFromFinal === 2) return "QUARTAS";
  if (roundsFromFinal === 3) return "OITAVAS";
  return `FASE ${roundIndex + 1}`;
}

export function generateBracket(participants: Participant[]): Match[] {
  const n = participants.length;
  if (n === 0) return [];
  if (n === 1) {
    return [{
      id: `match_final_0`,
      round: 0,
      position: 0,
      participant1: participants[0],
      participant2: null,
      score1: null,
      score2: null,
      winner: participants[0].id,
      status: "finished",
      nextMatchId: null,
      nextSlot: null,
    }];
  }

  const size = nextPowerOf2(n);
  const totalRounds = log2(size);
  const firstRoundMatches = size / 2;
  const byes = size - n;

  const seeded = [...participants];
  while (seeded.length < size) {
    seeded.push({ id: `bye_${seeded.length}`, name: "BYE", logo: "" });
  }

  const bracketOrder: Participant[] = new Array(size);
  const seeds = seeded.map((p, i) => ({ participant: p, seed: i + 1 }));
  const sortedSeeds = [...seeds].sort((a, b) => a.seed - b.seed);

  const pairs: [number, number][] = [];
  for (let i = 0; i < size / 2; i++) {
    const top = i;
    const bottom = size - 1 - i;
    pairs.push([top, bottom]);
  }

  const matches: Match[] = [];
  const roundMatches: Match[][] = [];

  for (let r = 0; r < totalRounds; r++) {
    const matchesInRound = size / Math.pow(2, r + 1);
    const roundMatchList: Match[] = [];

    for (let m = 0; m < matchesInRound; m++) {
      const match: Match = {
        id: `match_r${r}_p${m}`,
        round: r,
        position: m,
        participant1: null,
        participant2: null,
        score1: null,
        score2: null,
        winner: null,
        status: "pending",
        nextMatchId: null,
        nextSlot: null,
      };
      roundMatchList.push(match);
      matches.push(match);
    }
    roundMatches.push(roundMatchList);
  }

  for (let m = 0; m < firstRoundMatches; m++) {
    const [topIdx, bottomIdx] = pairs[m];
    const top = sortedSeeds[topIdx]?.participant || null;
    const bottom = sortedSeeds[bottomIdx]?.participant || null;

    const match = roundMatches[0][m];

    const topIsBye = top?.name === "BYE";
    const bottomIsBye = bottom?.name === "BYE";

    if (topIsBye && bottomIsBye) {
      match.participant1 = null;
      match.participant2 = null;
      match.status = "pending";
    } else if (topIsBye) {
      match.participant1 = null;
      match.participant2 = bottom;
      match.winner = bottom?.id || null;
      match.status = "finished";
    } else if (bottomIsBye) {
      match.participant1 = top;
      match.participant2 = null;
      match.winner = top?.id || null;
      match.status = "finished";
    } else {
      match.participant1 = top;
      match.participant2 = bottom;
      match.status = "pending";
    }

    if (totalRounds > 1) {
      const nextMatchPos = Math.floor(m / 2);
      match.nextMatchId = `match_r1_p${nextMatchPos}`;
      match.nextSlot = m % 2 === 0 ? 1 : 2;
    }
  }

  for (let r = 1; r < totalRounds; r++) {
    for (let m = 0; m < roundMatches[r].length; m++) {
      const match = roundMatches[r][m];
      if (r < totalRounds - 1) {
        const nextMatchPos = Math.floor(m / 2);
        match.nextMatchId = `match_r${r + 1}_p${nextMatchPos}`;
        match.nextSlot = m % 2 === 0 ? 1 : 2;
      }
    }
  }

  for (const match of matches) {
    if (match.winner && match.nextMatchId) {
      const nextMatch = matches.find((m) => m.id === match.nextMatchId);
      if (nextMatch) {
        const winnerParticipant = [match.participant1, match.participant2].find(
          (p) => p?.id === match.winner
        );
        if (match.nextSlot === 1) {
          nextMatch.participant1 = winnerParticipant || null;
        } else {
          nextMatch.participant2 = winnerParticipant || null;
        }
      }
    }
  }

  return matches;
}

export function advanceWinner(matches: Match[], matchId: string, winnerId: string): Match[] {
  const updated = matches.map((m) => ({ ...m }));
  const match = updated.find((m) => m.id === matchId);
  if (!match) return updated;

  match.winner = winnerId;
  match.status = "finished";

  if (match.nextMatchId && match.nextSlot) {
    const nextMatch = updated.find((m) => m.id === match.nextMatchId);
    if (nextMatch) {
      const winnerParticipant = [match.participant1, match.participant2].find(
        (p) => p?.id === winnerId
      );
      if (match.nextSlot === 1) {
        nextMatch.participant1 = winnerParticipant || null;
      } else {
        nextMatch.participant2 = winnerParticipant || null;
      }
    }
  }

  const lastRound = updated.reduce((max, m) => Math.max(max, m.round), 0);
  const finalMatch = updated.find((m) => m.round === lastRound);
  if (finalMatch?.winner) {
    const champ = [finalMatch.participant1, finalMatch.participant2].find(
      (p) => p?.id === finalMatch.winner
    );
    return updated;
  }

  return updated;
}

export function resetMatch(matches: Match[], matchId: string): Match[] {
  const updated = matches.map((m) => ({ ...m }));
  const matchIndex = updated.findIndex((m) => m.id === matchId);
  if (matchIndex === -1) return updated;

  const match = updated[matchIndex];
  const oldWinner = match.winner;

  match.winner = null;
  match.score1 = null;
  match.score2 = null;
  match.status = "pending";

  if (match.nextMatchId && match.nextSlot) {
    const nextMatch = updated.find((m) => m.id === match.nextMatchId);
    if (nextMatch) {
      if (match.nextSlot === 1) {
        nextMatch.participant1 = null;
      } else {
        nextMatch.participant2 = null;
      }
      nextMatch.winner = null;
      nextMatch.score1 = null;
      nextMatch.score2 = null;
      nextMatch.status = "pending";

      if (nextMatch.nextMatchId && nextMatch.nextSlot) {
        const nextNextMatch = updated.find((m) => m.id === nextMatch.nextMatchId);
        if (nextNextMatch) {
          if (nextMatch.nextSlot === 1) {
            nextNextMatch.participant1 = null;
          } else {
            nextNextMatch.participant2 = null;
          }
        }
      }
    }
  }

  for (let i = matchIndex + 1; i < updated.length; i++) {
    const m = updated[i];
    if (m.winner) {
      const hasValidParticipants = m.participant1 && m.participant2;
      if (!hasValidParticipants) {
        m.winner = null;
        m.score1 = null;
        m.score2 = null;
        m.status = "pending";
      }
    }
  }

  return updated;
}

export function getChampion(matches: Match[]): Participant | null {
  const lastRound = matches.reduce((max, m) => Math.max(max, m.round), 0);
  const finalMatch = matches.find((m) => m.round === lastRound);
  if (!finalMatch?.winner) return null;
  return [finalMatch.participant1, finalMatch.participant2].find(
    (p) => p?.id === finalMatch.winner
  ) || null;
}
