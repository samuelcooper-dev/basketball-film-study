import { GameSession, Roster, CourtZone, GameEvent, PlayerGameStats } from '../types';

export interface ZoneStats {
  zone: CourtZone;
  fga: number;
  fgm: number;
  fgPct: number;
  threePA: number;
  threePM: number;
  threePct: number;
  points: number;
  turnovers: number;
  steals: number;
  blocks: number;
  fouls: number;
}

export interface PlayerZoneStats {
  playerId: string;
  playerName: string;
  playerNumber: string;
  byZone: Record<CourtZone, ZoneStats>;
  totalStats: ZoneStats;
}

export interface TeamAnalytics {
  offense: {
    byZone: Record<CourtZone, ZoneStats>;
    totalShots: number;
    totalMakes: number;
    totalPoints: number;
    fgPct: number;
    threePct: number;
  };
  defense: {
    byZone: Record<CourtZone, ZoneStats>;
    steals: number;
    blocks: number;
    fouls: number;
  };
  playerStats: PlayerZoneStats[];
}

function createEmptyZoneStats(zone: CourtZone): ZoneStats {
  return {
    zone,
    fga: 0,
    fgm: 0,
    fgPct: 0,
    threePA: 0,
    threePM: 0,
    threePct: 0,
    points: 0,
    turnovers: 0,
    steals: 0,
    blocks: 0,
    fouls: 0
  };
}

function createEmptyZoneRecord(): Record<CourtZone, ZoneStats> {
  const zones: CourtZone[] = [
    'restricted_area', 'paint',
    'left_baseline_mid', 'center_mid', 'right_baseline_mid',
    'left_elbow_mid', 'right_elbow_mid',
    'left_wing_3', 'top_key_3', 'right_wing_3',
    'left_corner_3', 'right_corner_3',
    'deep_3_logo', 'unknown'
  ];

  const record: any = {};
  zones.forEach(zone => {
    record[zone] = createEmptyZoneStats(zone);
  });

  return record;
}

export function computeTeamAnalytics(game: GameSession, roster: Roster): TeamAnalytics {
  const offenseByZone = createEmptyZoneRecord();
  const defenseByZone = createEmptyZoneRecord();

  // Initialize player stats
  const playerStatsMap = new Map<string, PlayerZoneStats>();
  roster.players.forEach(player => {
    playerStatsMap.set(player.id, {
      playerId: player.id,
      playerName: player.name,
      playerNumber: player.number,
      byZone: createEmptyZoneRecord(),
      totalStats: createEmptyZoneStats('unknown')
    });
  });

  // Process each event
  game.events.forEach(event => {
    const location = event.location || 'unknown';
    const zone = offenseByZone[location];
    const defZone = defenseByZone[location];

    // Shots
    if (event.eventType === '2PT_MAKE') {
      zone.fga++;
      zone.fgm++;
      zone.points += 2;

      // Player stats
      if (event.primaryPlayerId && playerStatsMap.has(event.primaryPlayerId)) {
        const pStats = playerStatsMap.get(event.primaryPlayerId)!;
        pStats.byZone[location].fga++;
        pStats.byZone[location].fgm++;
        pStats.byZone[location].points += 2;
        pStats.totalStats.fga++;
        pStats.totalStats.fgm++;
        pStats.totalStats.points += 2;
      }
    } else if (event.eventType === '2PT_MISS') {
      zone.fga++;

      if (event.primaryPlayerId && playerStatsMap.has(event.primaryPlayerId)) {
        const pStats = playerStatsMap.get(event.primaryPlayerId)!;
        pStats.byZone[location].fga++;
        pStats.totalStats.fga++;
      }
    } else if (event.eventType === '3PT_MAKE') {
      zone.fga++;
      zone.fgm++;
      zone.threePA++;
      zone.threePM++;
      zone.points += 3;

      if (event.primaryPlayerId && playerStatsMap.has(event.primaryPlayerId)) {
        const pStats = playerStatsMap.get(event.primaryPlayerId)!;
        pStats.byZone[location].fga++;
        pStats.byZone[location].fgm++;
        pStats.byZone[location].threePA++;
        pStats.byZone[location].threePM++;
        pStats.byZone[location].points += 3;
        pStats.totalStats.fga++;
        pStats.totalStats.fgm++;
        pStats.totalStats.threePA++;
        pStats.totalStats.threePM++;
        pStats.totalStats.points += 3;
      }
    } else if (event.eventType === '3PT_MISS') {
      zone.fga++;
      zone.threePA++;

      if (event.primaryPlayerId && playerStatsMap.has(event.primaryPlayerId)) {
        const pStats = playerStatsMap.get(event.primaryPlayerId)!;
        pStats.byZone[location].fga++;
        pStats.byZone[location].threePA++;
        pStats.totalStats.fga++;
        pStats.totalStats.threePA++;
      }
    }

    // Turnovers
    if (event.eventType === 'TURNOVER') {
      zone.turnovers++;

      if (event.primaryPlayerId && playerStatsMap.has(event.primaryPlayerId)) {
        const pStats = playerStatsMap.get(event.primaryPlayerId)!;
        pStats.byZone[location].turnovers++;
        pStats.totalStats.turnovers++;
      }
    }

    // Defensive events
    if (event.eventType === 'STEAL') {
      defZone.steals++;

      if (event.primaryPlayerId && playerStatsMap.has(event.primaryPlayerId)) {
        const pStats = playerStatsMap.get(event.primaryPlayerId)!;
        pStats.byZone[location].steals++;
        pStats.totalStats.steals++;
      }
    }

    if (event.eventType === 'BLOCK') {
      defZone.blocks++;

      if (event.primaryPlayerId && playerStatsMap.has(event.primaryPlayerId)) {
        const pStats = playerStatsMap.get(event.primaryPlayerId)!;
        pStats.byZone[location].blocks++;
        pStats.totalStats.blocks++;
      }
    }

    if (event.eventType === 'FOUL') {
      defZone.fouls++;

      if (event.primaryPlayerId && playerStatsMap.has(event.primaryPlayerId)) {
        const pStats = playerStatsMap.get(event.primaryPlayerId)!;
        pStats.byZone[location].fouls++;
        pStats.totalStats.fouls++;
      }
    }

    // Opponent scoring (defense allowed)
    if (event.eventType === 'OPP_SCORE_2') {
      defZone.fga++;
      defZone.fgm++;
      defZone.points += 2;
    } else if (event.eventType === 'OPP_SCORE_3') {
      defZone.fga++;
      defZone.fgm++;
      defZone.threePA++;
      defZone.threePM++;
      defZone.points += 3;
    }
  });

  // Calculate percentages
  Object.values(offenseByZone).forEach(zoneStats => {
    if (zoneStats.fga > 0) {
      zoneStats.fgPct = (zoneStats.fgm / zoneStats.fga) * 100;
    }
    if (zoneStats.threePA > 0) {
      zoneStats.threePct = (zoneStats.threePM / zoneStats.threePA) * 100;
    }
  });

  Object.values(defenseByZone).forEach(zoneStats => {
    if (zoneStats.fga > 0) {
      zoneStats.fgPct = (zoneStats.fgm / zoneStats.fga) * 100;
    }
    if (zoneStats.threePA > 0) {
      zoneStats.threePct = (zoneStats.threePM / zoneStats.threePA) * 100;
    }
  });

  // Calculate player percentages
  playerStatsMap.forEach(pStats => {
    Object.values(pStats.byZone).forEach(zoneStats => {
      if (zoneStats.fga > 0) {
        zoneStats.fgPct = (zoneStats.fgm / zoneStats.fga) * 100;
      }
      if (zoneStats.threePA > 0) {
        zoneStats.threePct = (zoneStats.threePM / zoneStats.threePA) * 100;
      }
    });

    if (pStats.totalStats.fga > 0) {
      pStats.totalStats.fgPct = (pStats.totalStats.fgm / pStats.totalStats.fga) * 100;
    }
    if (pStats.totalStats.threePA > 0) {
      pStats.totalStats.threePct = (pStats.totalStats.threePM / pStats.totalStats.threePA) * 100;
    }
  });

  // Totals
  let totalShots = 0;
  let totalMakes = 0;
  let totalPoints = 0;
  let total3PA = 0;
  let total3PM = 0;

  Object.values(offenseByZone).forEach(z => {
    totalShots += z.fga;
    totalMakes += z.fgm;
    totalPoints += z.points;
    total3PA += z.threePA;
    total3PM += z.threePM;
  });

  const fgPct = totalShots > 0 ? (totalMakes / totalShots) * 100 : 0;
  const threePct = total3PA > 0 ? (total3PM / total3PA) * 100 : 0;

  let totalSteals = 0;
  let totalBlocks = 0;
  let totalFouls = 0;

  Object.values(defenseByZone).forEach(z => {
    totalSteals += z.steals;
    totalBlocks += z.blocks;
    totalFouls += z.fouls;
  });

  return {
    offense: {
      byZone: offenseByZone,
      totalShots,
      totalMakes,
      totalPoints,
      fgPct,
      threePct
    },
    defense: {
      byZone: defenseByZone,
      steals: totalSteals,
      blocks: totalBlocks,
      fouls: totalFouls
    },
    playerStats: Array.from(playerStatsMap.values()).filter(p => p.totalStats.fga > 0 || p.totalStats.steals > 0 || p.totalStats.blocks > 0)
  };
}

export function getHotZones(analytics: TeamAnalytics, minAttempts: number = 3): CourtZone[] {
  const hotZones: CourtZone[] = [];

  Object.entries(analytics.offense.byZone).forEach(([zone, stats]) => {
    if (stats.fga >= minAttempts && stats.fgPct >= 50) {
      hotZones.push(zone as CourtZone);
    }
  });

  return hotZones;
}

export function getColdZones(analytics: TeamAnalytics, minAttempts: number = 3): CourtZone[] {
  const coldZones: CourtZone[] = [];

  Object.entries(analytics.offense.byZone).forEach(([zone, stats]) => {
    if (stats.fga >= minAttempts && stats.fgPct < 40) {
      coldZones.push(zone as CourtZone);
    }
  });

  return coldZones;
}

export function getDefensiveWeakZones(analytics: TeamAnalytics, minAttempts: number = 3): CourtZone[] {
  const weakZones: CourtZone[] = [];

  Object.entries(analytics.defense.byZone).forEach(([zone, stats]) => {
    if (stats.fga >= minAttempts && stats.fgPct >= 55) {
      weakZones.push(zone as CourtZone);
    }
  });

  return weakZones;
}
