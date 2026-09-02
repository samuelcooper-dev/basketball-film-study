export interface Player {
  id: string;
  number: string;
  name: string;
}

export interface Roster {
  teamName: string;
  players: Player[];
}

export type EventType =
  | "2PT_MAKE" | "2PT_MISS" | "3PT_MAKE" | "3PT_MISS"
  | "FT_MAKE" | "FT_MISS"
  | "REB_OFF" | "REB_DEF"
  | "ASSIST" | "TURNOVER" | "STEAL" | "BLOCK" | "FOUL"
  | "SCREEN_ASSIST" | "DEFLECTION" | "CHARGE_TAKEN" | "BLOWN_COVERAGE" | "HELP_D_BREAKDOWN"
  | "OPP_SCORE_2" | "OPP_SCORE_3" | "OPP_SCORE_FT"
  | "CUSTOM";

export type CourtZone =
  | 'paint'
  | 'midrange_left'
  | 'midrange_right'
  | 'corner3_left'
  | 'corner3_right'
  | 'wing3_left'
  | 'wing3_right'
  | 'top3'
  | 'baseline_left'
  | 'baseline_right'
  | 'unknown';

export type EventTag =
  | 'baseline_drive'
  | 'help_defense'
  | 'transition'
  | 'fast_break'
  | 'pick_and_roll'
  | 'isolation'
  | 'off_screen'
  | 'putback'
  | 'and1'
  | 'technical'
  | 'intentional';

export interface GameEvent {
  id: string;
  timestampSec: number;
  wallClock: string;
  eventType: EventType;
  primaryPlayerId?: string;
  secondaryPlayerId?: string;
  opponentNumber?: string;
  onCourtPlayerIds: string[];
  comment: string;

  // Court tracking fields
  location?: CourtZone;
  tags?: EventTag[];
}

export interface LineupChange {
  atSec: number;
  onCourtPlayerIds: string[];
}

export interface GameSession {
  id: string;
  date: string;
  opponentName: string;
  videoUrl: string;
  videoId: string;
  events: GameEvent[];
  lineupHistory: LineupChange[];
  status: "in_progress" | "completed";
}

export interface PlayerGameStats {
  playerId: string;
  playerNumber: string;
  playerName: string;
  points: number;
  fgMade: number;
  fgAttempts: number;
  threeMade: number;
  threeAttempts: number;
  ftMade: number;
  ftAttempts: number;
  rebOff: number;
  rebDef: number;
  assists: number;
  turnovers: number;
  steals: number;
  blocks: number;
  fouls: number;
  screenAssists: number;
  deflections: number;
  chargesTaken: number;
  blownCoverages: number;
  helpDBreakdowns: number;
  plusMinus: number;
}

export interface OpponentScoring {
  jerseyNumber: string;
  points: number;
}

export interface GameStats {
  playerStats: PlayerGameStats[];
  opponentScoring: OpponentScoring[];
}

export interface AppSettings {
  downloadFolder?: string;
}
