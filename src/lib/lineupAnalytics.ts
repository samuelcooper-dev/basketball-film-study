import { GameSession, Roster, GameEvent } from '../types';

export interface LineupStats {
  lineupKey: string; // Sorted player IDs joined with ','
  playerIds: string[];
  playerNames: string[];
  playerNumbers: string[];

  // Time tracking
  possessions: number; // Estimated possessions this lineup played
  eventsLogged: number;

  // Offensive stats
  pointsScored: number;
  fgm: number;
  fga: number;
  fgPct: number;
  threePM: number;
  threePA: number;
  threePct: number;
  ftm: number;
  fta: number;
  turnovers: number;
  assists: number;
  offReb: number;

  // Defensive stats
  pointsAllowed: number;
  steals: number;
  blocks: number;
  defReb: number;
  fouls: number;

  // Advanced stats (per 100 possessions)
  offensiveRating: number; // Points scored per 100 possessions
  defensiveRating: number; // Points allowed per 100 possessions
  netRating: number; // OffRtg - DefRtg

  // Plus/Minus
  plusMinus: number;
}

function getLineupKey(playerIds: string[]): string {
  return [...playerIds].sort().join(',');
}

function estimatePossessions(events: GameEvent[]): number {
  // Estimate possessions using formula: FGA + 0.44*FTA + TO
  let fga = 0;
  let fta = 0;
  let to = 0;

  events.forEach(e => {
    if (e.eventType === '2PT_MAKE' || e.eventType === '2PT_MISS' ||
        e.eventType === '3PT_MAKE' || e.eventType === '3PT_MISS') {
      fga++;
    }
    if (e.eventType === 'FT_MAKE' || e.eventType === 'FT_MISS') {
      fta++;
    }
    if (e.eventType === 'TURNOVER') {
      to++;
    }
  });

  const poss = fga + 0.44 * fta + to;
  return Math.max(poss, 1); // Minimum 1 to avoid division by zero
}

export function computeLineupStats(game: GameSession, roster: Roster): LineupStats[] {
  const lineupMap = new Map<string, LineupStats>();

  // Group events by lineup
  game.events.forEach(event => {
    if (event.onCourtPlayerIds.length !== 5) return; // Skip if lineup not complete

    const lineupKey = getLineupKey(event.onCourtPlayerIds);

    if (!lineupMap.has(lineupKey)) {
      // Initialize lineup stats
      const players = event.onCourtPlayerIds.map(id =>
        roster.players.find(p => p.id === id)!
      ).filter(p => p); // Filter out any undefined

      lineupMap.set(lineupKey, {
        lineupKey,
        playerIds: event.onCourtPlayerIds,
        playerNames: players.map(p => p.name),
        playerNumbers: players.map(p => p.number),
        possessions: 0,
        eventsLogged: 0,
        pointsScored: 0,
        fgm: 0,
        fga: 0,
        fgPct: 0,
        threePM: 0,
        threePA: 0,
        threePct: 0,
        ftm: 0,
        fta: 0,
        turnovers: 0,
        assists: 0,
        offReb: 0,
        pointsAllowed: 0,
        steals: 0,
        blocks: 0,
        defReb: 0,
        fouls: 0,
        offensiveRating: 0,
        defensiveRating: 0,
        netRating: 0,
        plusMinus: 0
      });
    }

    const stats = lineupMap.get(lineupKey)!;
    stats.eventsLogged++;

    // Track offensive stats
    if (event.eventType === '2PT_MAKE') {
      stats.fgm++;
      stats.fga++;
      stats.pointsScored += 2;
    } else if (event.eventType === '2PT_MISS') {
      stats.fga++;
    } else if (event.eventType === '3PT_MAKE') {
      stats.fgm++;
      stats.fga++;
      stats.threePM++;
      stats.threePA++;
      stats.pointsScored += 3;
    } else if (event.eventType === '3PT_MISS') {
      stats.fga++;
      stats.threePA++;
    } else if (event.eventType === 'FT_MAKE') {
      stats.ftm++;
      stats.fta++;
      stats.pointsScored += 1;
    } else if (event.eventType === 'FT_MISS') {
      stats.fta++;
    } else if (event.eventType === 'TURNOVER') {
      stats.turnovers++;
    } else if (event.eventType === 'ASSIST') {
      stats.assists++;
    } else if (event.eventType === 'REB_OFF') {
      stats.offReb++;
    }

    // Track defensive stats
    if (event.eventType === 'OPP_SCORE_2') {
      stats.pointsAllowed += 2;
    } else if (event.eventType === 'OPP_SCORE_3') {
      stats.pointsAllowed += 3;
    } else if (event.eventType === 'OPP_SCORE_FT') {
      stats.pointsAllowed += 1;
    } else if (event.eventType === 'STEAL') {
      stats.steals++;
    } else if (event.eventType === 'BLOCK') {
      stats.blocks++;
    } else if (event.eventType === 'REB_DEF') {
      stats.defReb++;
    } else if (event.eventType === 'FOUL') {
      stats.fouls++;
    }
  });

  // Calculate derived stats for each lineup
  const lineupStats = Array.from(lineupMap.values());

  lineupStats.forEach(stats => {
    // Calculate percentages
    stats.fgPct = stats.fga > 0 ? (stats.fgm / stats.fga) * 100 : 0;
    stats.threePct = stats.threePA > 0 ? (stats.threePM / stats.threePA) * 100 : 0;

    // Estimate possessions for this lineup
    const lineupEvents = game.events.filter(e =>
      getLineupKey(e.onCourtPlayerIds) === stats.lineupKey
    );
    stats.possessions = estimatePossessions(lineupEvents);

    // Calculate advanced stats (per 100 possessions)
    const per100 = 100 / stats.possessions;
    stats.offensiveRating = stats.pointsScored * per100;
    stats.defensiveRating = stats.pointsAllowed * per100;
    stats.netRating = stats.offensiveRating - stats.defensiveRating;

    // Plus/Minus
    stats.plusMinus = stats.pointsScored - stats.pointsAllowed;
  });

  return lineupStats;
}

export function getBestLineups(lineupStats: LineupStats[], minPossessions: number = 5, count: number = 5): LineupStats[] {
  return lineupStats
    .filter(l => l.possessions >= minPossessions)
    .sort((a, b) => b.netRating - a.netRating)
    .slice(0, count);
}

export function getWorstLineups(lineupStats: LineupStats[], minPossessions: number = 5, count: number = 5): LineupStats[] {
  return lineupStats
    .filter(l => l.possessions >= minPossessions)
    .sort((a, b) => a.netRating - b.netRating)
    .slice(0, count);
}

export function getBestOffensiveLineups(lineupStats: LineupStats[], minPossessions: number = 5, count: number = 5): LineupStats[] {
  return lineupStats
    .filter(l => l.possessions >= minPossessions)
    .sort((a, b) => b.offensiveRating - a.offensiveRating)
    .slice(0, count);
}

export function getBestDefensiveLineups(lineupStats: LineupStats[], minPossessions: number = 5, count: number = 5): LineupStats[] {
  return lineupStats
    .filter(l => l.possessions >= minPossessions)
    .sort((a, b) => a.defensiveRating - b.defensiveRating) // Lower is better
    .slice(0, count);
}
