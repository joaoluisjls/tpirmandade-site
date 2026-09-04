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

export interface GroupMatch {
  id: string;
  participant1: Participant | null;
  participant2: Participant | null;
  score1: number | null;
  score2: number | null;
  status: "pending" | "finished";
}

export interface GroupStanding {
  participant: Participant;
  played: number;
  wins: number;
  draws: number;
  losses: number;
  goalsFor: number;
  goalsAgainst: number;
  goalDiff: number;
  points: number;
}

export interface Group {
  id: string;
  name: string;
  participants: Participant[];
  matches: GroupMatch[];
  advanceCount: number;
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
  groups: Group[];
  champion: Participant | null;
  created_at: string;
}

function nextPowerOf2(n: number): number {
  if (n <= 1) return 1;
  let p = 1;
  while (p < n) p *= 2;
  return p;
}

export function getRoundName(roundIndex: number, totalRounds: number): string {
  const roundsFromFinal = totalRounds - 1 - roundIndex;
  if (roundsFromFinal === 0) return "FINAL";
  if (roundsFromFinal === 1) return "SEMIFINAL";
  if (roundsFromFinal === 2) return "QUARTAS";
  if (roundsFromFinal === 3) return "OITAVAS";
  return `FASE ${roundIndex + 1}`;
}

export function generateGroupMatches(participants: Participant[]): GroupMatch[] {
  const matches: GroupMatch[] = [];
  for (let i = 0; i < participants.length; i++) {
    for (let j = i + 1; j < participants.length; j++) {
      matches.push({
        id: `gm_${participants[i].id}_${participants[j].id}`,
        participant1: participants[i],
        participant2: participants[j],
        score1: null,
        score2: null,
        status: "pending",
      });
    }
  }
  return matches;
}

export function calculateGroupStandings(group: Group): GroupStanding[] {
  const map = new Map<string, GroupStanding>();
  for (const p of group.participants) {
    map.set(p.id, {
      participant: p, played: 0, wins: 0, draws: 0, losses: 0,
      goalsFor: 0, goalsAgainst: 0, goalDiff: 0, points: 0,
    });
  }
  for (const m of group.matches) {
    if (m.status !== "finished" || m.score1 === null || m.score2 === null) continue;
    if (!m.participant1 || !m.participant2) continue;
    const s1 = map.get(m.participant1.id);
    const s2 = map.get(m.participant2.id);
    if (!s1 || !s2) continue;
    s1.played++; s2.played++;
    s1.goalsFor += m.score1; s1.goalsAgainst += m.score2;
    s2.goalsFor += m.score2; s2.goalsAgainst += m.score1;
    if (m.score1 > m.score2) { s1.wins++; s1.points += 3; s2.losses++; }
    else if (m.score1 < m.score2) { s2.wins++; s2.points += 3; s1.losses++; }
    else { s1.draws++; s2.draws++; s1.points += 1; s2.points += 1; }
  }
  const standings = Array.from(map.values());
  standings.forEach((s) => { s.goalDiff = s.goalsFor - s.goalsAgainst; });
  standings.sort((a, b) => b.points - a.points || b.goalDiff - a.goalDiff || b.goalsFor - a.goalsFor);
  return standings;
}

export function advanceFromGroups(groups: Group[]): Participant[] {
  const advancers: Participant[] = [];
  for (const group of groups) {
    const standings = calculateGroupStandings(group);
    for (let i = 0; i < Math.min(group.advanceCount, standings.length); i++) {
      advancers.push(standings[i].participant);
    }
  }
  return advancers;
}

export function generateGroups(participants: Participant[], groupCount: number): Group[] {
  const groups: Group[] = [];
  const shuffled = [...participants].sort(() => Math.random() - 0.5);
  for (let i = 0; i < groupCount; i++) {
    groups.push({ id: `group_${i}`, name: String.fromCharCode(65 + i), participants: [], matches: [], advanceCount: 2 });
  }
  shuffled.forEach((p, idx) => { groups[idx % groupCount].participants.push(p); });
  for (const group of groups) { group.matches = generateGroupMatches(group.participants); }
  return groups;
}

export function generateBracketEmpty(totalSlots: number): Match[] {
  if (totalSlots <= 1) return [];
  const size = nextPowerOf2(totalSlots);
  const firstRoundMatches = size / 2;
  const totalRounds = Math.ceil(Math.log2(size));
  const matches: Match[] = [];

  for (let m = 0; m < firstRoundMatches; m++) {
    const nextMatchId = totalRounds > 1 ? `match_r1_p${Math.floor(m / 2)}` : null;
    const nextSlot = totalRounds > 1 ? (m % 2 === 0 ? 1 as const : 2 as const) : null;
    matches.push({
      id: `match_r0_p${m}`, round: 0, position: m,
      participant1: null, participant2: null,
      score1: null, score2: null, winner: null,
      status: "pending", nextMatchId, nextSlot,
    });
  }

  for (let r = 1; r < totalRounds; r++) {
    const matchesInRound = size / Math.pow(2, r + 1);
    for (let m = 0; m < matchesInRound; m++) {
      matches.push({
        id: `match_r${r}_p${m}`, round: r, position: m,
        participant1: null, participant2: null,
        score1: null, score2: null, winner: null,
        status: "pending",
        nextMatchId: r < totalRounds - 1 ? `match_r${r + 1}_p${Math.floor(m / 2)}` : null,
        nextSlot: r < totalRounds - 1 ? (m % 2 === 0 ? 1 as const : 2 as const) : null,
      });
    }
  }

  return matches;
}

export function generateBracket(participants: Participant[]): Match[] {
  const n = participants.length;
  if (n === 0) return [];
  if (n === 1) {
    return [{
      id: `match_final_0`, round: 0, position: 0,
      participant1: participants[0], participant2: null,
      score1: null, score2: null, winner: participants[0].id,
      status: "finished", nextMatchId: null, nextSlot: null,
    }];
  }
  const matches = generateBracketEmpty(n);
  const size = nextPowerOf2(n);
  const seeded = [...participants];
  while (seeded.length < size) {
    seeded.push({ id: `bye_${seeded.length}`, name: "BYE", logo: "" });
  }
  const seeds = seeded.map((p, i) => ({ participant: p, seed: i + 1 }));
  const sortedSeeds = [...seeds].sort((a, b) => a.seed - b.seed);
  const pairs: [number, number][] = [];
  for (let i = 0; i < size / 2; i++) { pairs.push([i, size - 1 - i]); }

  for (let m = 0; m < matches.length; m++) {
    const match = matches[m];
    if (match.round !== 0) continue;
    const [topIdx, bottomIdx] = pairs[m] || [0, 0];
    const top = sortedSeeds[topIdx]?.participant || null;
    const bottom = sortedSeeds[bottomIdx]?.participant || null;
    const topIsBye = top?.name === "BYE";
    const bottomIsBye = bottom?.name === "BYE";
    if (topIsBye && bottomIsBye) { match.participant1 = null; match.participant2 = null; }
    else if (topIsBye) { match.participant1 = null; match.participant2 = bottom; match.winner = bottom?.id || null; match.status = "finished"; }
    else if (bottomIsBye) { match.participant1 = top; match.participant2 = null; match.winner = top?.id || null; match.status = "finished"; }
    else { match.participant1 = top; match.participant2 = bottom; }
  }

  for (const match of matches) {
    if (match.winner && match.nextMatchId) {
      const nextMatch = matches.find((mm) => mm.id === match.nextMatchId);
      if (nextMatch) {
        const wp = [match.participant1, match.participant2].find((p) => p?.id === match.winner);
        if (match.nextSlot === 1) nextMatch.participant1 = wp || null;
        else nextMatch.participant2 = wp || null;
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

  if (match.nextMatchId) {
    let nextMatch = updated.find((m) => m.id === match.nextMatchId);
    if (!nextMatch && match.round === 0) {
      const nextRound = 1;
      const nextPos = Math.floor(match.position / 2);
      const nextId = `match_r${nextRound}_p${nextPos}`;
      const size = nextPowerOf2(updated.filter((m) => m.round === 0).length * 2);
      const totalRounds = Math.ceil(Math.log2(size));
      const newMatch: Match = {
        id: nextId, round: nextRound, position: nextPos,
        participant1: null, participant2: null,
        score1: null, score2: null, winner: null,
        status: "pending",
        nextMatchId: nextRound < totalRounds - 1 ? `match_r${nextRound + 1}_p${Math.floor(nextPos / 2)}` : null,
        nextSlot: nextRound < totalRounds - 1 ? (nextPos % 2 === 0 ? 1 as const : 2 as const) : null,
      };
      updated.push(newMatch);
      nextMatch = newMatch;
    }
    if (nextMatch) {
      const wp = [match.participant1, match.participant2].find((p) => p?.id === winnerId);
      if (match.nextSlot === 1) nextMatch.participant1 = wp || null;
      else nextMatch.participant2 = wp || null;
    }
  }

  return updated;
}

export function resetMatch(matches: Match[], matchId: string): Match[] {
  const updated = matches.map((m) => ({ ...m }));
  const matchIndex = updated.findIndex((m) => m.id === matchId);
  if (matchIndex === -1) return updated;

  const match = updated[matchIndex];
  match.winner = null;
  match.score1 = null;
  match.score2 = null;
  match.status = "pending";

  if (match.nextMatchId) {
    const nextMatch = updated.find((m) => m.id === match.nextMatchId);
    if (nextMatch) {
      if (match.nextSlot === 1) nextMatch.participant1 = null;
      else nextMatch.participant2 = null;
      nextMatch.winner = null;
      nextMatch.score1 = null;
      nextMatch.score2 = null;
      nextMatch.status = "pending";
    }
  }

  for (let i = matchIndex + 1; i < updated.length; i++) {
    const m = updated[i];
    if (m.winner) {
      if (!m.participant1 || !m.participant2) {
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
  if (matches.length === 0) return null;
  const maxRound = Math.max(...matches.map((m) => m.round));
  const finalMatch = matches.find((m) => m.round === maxRound);
  if (!finalMatch?.winner) return null;
  return [finalMatch.participant1, finalMatch.participant2].find(
    (p) => p?.id === finalMatch.winner
  ) || null;
}
