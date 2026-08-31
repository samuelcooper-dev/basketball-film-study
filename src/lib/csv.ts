import Papa from 'papaparse';
import { SeasonStatRow } from './stats';

export function parseSeasonCSV(csvText: string): SeasonStatRow[] {
  const result = Papa.parse<SeasonStatRow>(csvText, {
    header: true,
    dynamicTyping: true,
    skipEmptyLines: true
  });
  return result.data;
}

export function mergeSeasonStats(
  existingRows: SeasonStatRow[],
  newGameRows: SeasonStatRow[],
  gameDate: string,
  opponentName: string
): SeasonStatRow[] {
  // Remove any existing rows for this exact game (date + opponent)
  const filtered = existingRows.filter(
    row => !(row.date === gameDate && row.opponent === opponentName)
  );

  // Add new game rows
  const merged = [...filtered, ...newGameRows];

  // Sort by date
  merged.sort((a, b) => a.date.localeCompare(b.date));

  return merged;
}

export function seasonStatsToCSV(rows: SeasonStatRow[]): string {
  return Papa.unparse(rows, {
    columns: [
      'date',
      'opponent',
      'player_number',
      'player_name',
      'points',
      'fg_m',
      'fg_a',
      'three_m',
      'three_a',
      'ft_m',
      'ft_a',
      'reb_off',
      'reb_def',
      'ast',
      'tov',
      'stl',
      'blk',
      'fouls',
      'screen_ast',
      'deflections',
      'charges',
      'blown_coverage',
      'help_d_breakdown',
      'plus_minus'
    ]
  });
}
