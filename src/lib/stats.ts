import { GameSession, GameEvent, PlayerGameStats, OpponentScoring, GameStats, Roster } from '../types';

export function computeGameStats(game: GameSession, roster: Roster): GameStats {
  const playerStatsMap = new Map<string, PlayerGameStats>();
  const opponentScoringMap = new Map<string, number>();

  // Initialize stats for all roster players
  roster.players.forEach(player => {
    playerStatsMap.set(player.id, {
      playerId: player.id,
      playerNumber: player.number,
      playerName: player.name,
      points: 0,
      fgMade: 0,
      fgAttempts: 0,
      threeMade: 0,
      threeAttempts: 0,
      ftMade: 0,
      ftAttempts: 0,
      rebOff: 0,
      rebDef: 0,
      assists: 0,
      turnovers: 0,
      steals: 0,
      blocks: 0,
      fouls: 0,
      deflections: 0,
      chargesTaken: 0,
      blownCoverages: 0,
      helpDBreakdowns: 0,
      plusMinus: 0
    });
  });

  // Process each event
  game.events.forEach(event => {
    const primaryStats = event.primaryPlayerId ? playerStatsMap.get(event.primaryPlayerId) : null;
    const secondaryStats = event.secondaryPlayerId ? playerStatsMap.get(event.secondaryPlayerId) : null;

    switch (event.eventType) {
      case '2PT_MAKE':
        if (primaryStats) {
          primaryStats.points += 2;
          primaryStats.fgMade += 1;
          primaryStats.fgAttempts += 1;
        }
        // Plus/minus for on-court players
        event.onCourtPlayerIds.forEach(pid => {
          const stats = playerStatsMap.get(pid);
          if (stats) stats.plusMinus += 2;
        });
        break;

      case '2PT_MISS':
        if (primaryStats) {
          primaryStats.fgAttempts += 1;
        }
        break;

      case '3PT_MAKE':
        if (primaryStats) {
          primaryStats.points += 3;
          primaryStats.fgMade += 1;
          primaryStats.fgAttempts += 1;
          primaryStats.threeMade += 1;
          primaryStats.threeAttempts += 1;
        }
        event.onCourtPlayerIds.forEach(pid => {
          const stats = playerStatsMap.get(pid);
          if (stats) stats.plusMinus += 3;
        });
        break;

      case '3PT_MISS':
        if (primaryStats) {
          primaryStats.fgAttempts += 1;
          primaryStats.threeAttempts += 1;
        }
        break;

      case 'FT_MAKE':
        if (primaryStats) {
          primaryStats.points += 1;
          primaryStats.ftMade += 1;
          primaryStats.ftAttempts += 1;
        }
        event.onCourtPlayerIds.forEach(pid => {
          const stats = playerStatsMap.get(pid);
          if (stats) stats.plusMinus += 1;
        });
        break;

      case 'FT_MISS':
        if (primaryStats) {
          primaryStats.ftAttempts += 1;
        }
        break;

      case 'REB_OFF':
        if (primaryStats) primaryStats.rebOff += 1;
        break;

      case 'REB_DEF':
        if (primaryStats) primaryStats.rebDef += 1;
        break;

      case 'ASSIST':
        if (primaryStats) primaryStats.assists += 1;
        break;

      case 'TURNOVER':
        if (primaryStats) primaryStats.turnovers += 1;
        break;

      case 'STEAL':
        if (primaryStats) primaryStats.steals += 1;
        break;

      case 'BLOCK':
        if (primaryStats) primaryStats.blocks += 1;
        break;

      case 'FOUL':
        if (primaryStats) primaryStats.fouls += 1;
        break;


      case 'DEFLECTION':
        if (primaryStats) primaryStats.deflections += 1;
        break;

      case 'CHARGE_TAKEN':
        if (primaryStats) primaryStats.chargesTaken += 1;
        break;

      case 'BLOWN_COVERAGE':
        if (primaryStats) primaryStats.blownCoverages += 1;
        break;

      case 'HELP_D_BREAKDOWN':
        if (primaryStats) primaryStats.helpDBreakdowns += 1;
        break;

      case 'OPP_SCORE_2':
        if (event.opponentNumber) {
          opponentScoringMap.set(
            event.opponentNumber,
            (opponentScoringMap.get(event.opponentNumber) || 0) + 2
          );
        }
        event.onCourtPlayerIds.forEach(pid => {
          const stats = playerStatsMap.get(pid);
          if (stats) stats.plusMinus -= 2;
        });
        break;

      case 'OPP_SCORE_3':
        if (event.opponentNumber) {
          opponentScoringMap.set(
            event.opponentNumber,
            (opponentScoringMap.get(event.opponentNumber) || 0) + 3
          );
        }
        event.onCourtPlayerIds.forEach(pid => {
          const stats = playerStatsMap.get(pid);
          if (stats) stats.plusMinus -= 3;
        });
        break;

      case 'OPP_SCORE_FT':
        if (event.opponentNumber) {
          opponentScoringMap.set(
            event.opponentNumber,
            (opponentScoringMap.get(event.opponentNumber) || 0) + 1
          );
        }
        event.onCourtPlayerIds.forEach(pid => {
          const stats = playerStatsMap.get(pid);
          if (stats) stats.plusMinus -= 1;
        });
        break;
    }
  });

  const opponentScoring: OpponentScoring[] = Array.from(opponentScoringMap.entries())
    .map(([jerseyNumber, points]) => ({ jerseyNumber, points }))
    .sort((a, b) => b.points - a.points);

  return {
    playerStats: Array.from(playerStatsMap.values()),
    opponentScoring
  };
}

export interface SeasonStatRow {
  date: string;
  opponent: string;
  player_number: string;
  player_name: string;
  points: number;
  fg_m: number;
  fg_a: number;
  three_m: number;
  three_a: number;
  ft_m: number;
  ft_a: number;
  reb_off: number;
  reb_def: number;
  ast: number;
  tov: number;
  stl: number;
  blk: number;
  fouls: number;
  screen_ast: number;
  deflections: number;
  charges: number;
  blown_coverage: number;
  help_d_breakdown: number;
  plus_minus: number;
}

export function gameStatsToSeasonRows(
  game: GameSession,
  stats: GameStats
): SeasonStatRow[] {
  return stats.playerStats.map(ps => ({
    date: game.date,
    opponent: game.opponentName,
    player_number: ps.playerNumber,
    player_name: ps.playerName,
    points: ps.points,
    fg_m: ps.fgMade,
    fg_a: ps.fgAttempts,
    three_m: ps.threeMade,
    three_a: ps.threeAttempts,
    ft_m: ps.ftMade,
    ft_a: ps.ftAttempts,
    reb_off: ps.rebOff,
    reb_def: ps.rebDef,
    ast: ps.assists,
    tov: ps.turnovers,
    stl: ps.steals,
    blk: ps.blocks,
    fouls: ps.fouls,
    deflections: ps.deflections,
    charges: ps.chargesTaken,
    blown_coverage: ps.blownCoverages,
    help_d_breakdown: ps.helpDBreakdowns,
    plus_minus: ps.plusMinus
  }));
}
