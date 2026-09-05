import html2pdf from 'html2pdf.js';
import { GameSession, Roster, CourtZone } from '../types';
import { computeTeamAnalytics, getHotZones, getColdZones, ZoneStats } from './analytics';
import { ZONE_LABELS } from '../components/CourtDiagram';

/**
 * Generate complete PDF report from HTML templates
 */
export async function generatePDFFromHTML(
  game: GameSession,
  roster: Roster
): Promise<Blob> {
  const analytics = computeTeamAnalytics(game, roster);

  // Generate complete HTML document
  const htmlContent = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <title>${roster.teamName} vs ${game.opponentName} - Basketball Wizard Report</title>
      ${getSharedStyles()}
    </head>
    <body>
      ${generateTitlePage(game, roster, analytics)}
      <div style="page-break-after: always;"></div>
      ${generateTeamShotChartPage(game, roster, analytics)}
      <div style="page-break-after: always;"></div>
      ${generateLineupAnalysisPage(game, roster)}
      ${generatePlayerCards(game, roster, analytics)}
    </body>
    </html>
  `;

  // Convert HTML to PDF
  const options = {
    margin: 0,
    filename: `${roster.teamName}_vs_${game.opponentName}_${game.date}.pdf`,
    image: { type: 'jpeg' as const, quality: 0.98 },
    html2canvas: { scale: 2, useCORS: true },
    jsPDF: { unit: 'in' as const, format: 'letter' as const, orientation: 'portrait' as const }
  };

  return html2pdf().set(options).from(htmlContent).outputPdf('blob');
}

/**
 * Shared CSS styles for all pages
 */
function getSharedStyles(): string {
  return `
    <style>
      @import url('https://fonts.googleapis.com/css2?family=Press+Start+2P&family=VT323&display=swap');

      :root {
        --bg: #0a0a0f;
        --panel: #12101c;
        --purple: #6B3FE0;
        --purple-dark: #3E1F8C;
        --purple-light: #9878F8;
        --gold: #F5B82E;
        --cyan: #3CE6FC;
        --cyan-dim: rgba(60,230,252,0.15);
        --success: #4CDB6E;
        --danger: #FF3B5C;
        --text: #EDEBFF;
        --text-dim: #8C86B8;
      }

      * { box-sizing: border-box; margin: 0; padding: 0; }
      html { background: var(--bg); }
      body {
        background: var(--bg);
        color: var(--text);
        font-family: 'VT323', monospace;
        font-size: 20px;
        padding: 0;
      }

      h1, h2 { font-family: 'Press Start 2P', cursive; }

      .page {
        max-width: 560px;
        margin: 0 auto;
        padding-bottom: 40px;
        min-height: 100vh;
      }

      .page-header {
        text-align: center;
        padding: 18px;
        background: var(--panel);
        border-bottom: 4px solid var(--gold);
      }

      .page-header .title {
        font-family: 'Press Start 2P', cursive;
        font-size: 14px;
        text-shadow: 2px 2px 0 var(--purple-dark), 0 0 10px var(--cyan);
      }

      .page-header .sub {
        color: var(--cyan);
        font-size: 16px;
        margin-top: 6px;
      }

      .section-label {
        font-family: 'Press Start 2P', cursive;
        font-size: 10px;
        color: var(--gold);
        margin: 18px 16px 10px;
      }

      .chart-row { padding: 0 16px; }

      svg.court { width: 100%; height: auto; display: block; }

      .court-line {
        fill: none;
        stroke: rgba(140,134,184,0.4);
        stroke-width: 1.5;
      }

      .zone-label {
        font-size: 9px;
        fill: var(--text-dim);
        text-anchor: middle;
        pointer-events: none;
      }

      .zone-count {
        font-family: 'Press Start 2P', cursive;
        font-size: 11px;
        text-anchor: middle;
        pointer-events: none;
      }

      .legend {
        display: flex;
        flex-wrap: wrap;
        gap: 12px;
        margin: 10px 16px 4px;
        font-size: 14px;
        color: var(--text-dim);
      }

      .legend span { display: flex; align-items: center; gap: 5px; }

      .swatch {
        width: 12px;
        height: 12px;
        display: inline-block;
        border: 1px solid #000;
      }

      table {
        width: calc(100% - 32px);
        margin: 6px 16px 0;
        border-collapse: collapse;
        font-size: 16px;
      }

      th, td {
        border: 1px solid var(--purple-dark);
        padding: 6px 8px;
        text-align: left;
      }

      th {
        background: var(--purple-dark);
        color: var(--gold);
        font-family: 'Press Start 2P', cursive;
        font-size: 9px;
      }

      .insights {
        margin: 10px 16px 0;
        background: var(--panel);
        border: 2px dashed var(--gold);
        padding: 14px;
      }

      .insights li { margin-bottom: 8px; }

      .timeline {
        margin: 8px 16px 0;
        border: 2px dashed var(--purple-dark);
      }

      .timeline a {
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 8px 10px;
        text-decoration: none;
        color: var(--text);
        border-bottom: 1px solid #201c2c;
        font-size: 15px;
      }

      .timeline a:hover {
        background: rgba(60,230,252,0.08);
        color: var(--cyan);
      }

      .timeline .t {
        color: var(--gold);
        font-family: 'Press Start 2P', cursive;
        font-size: 9px;
        flex-shrink: 0;
        width: 58px;
      }

      .timeline .who {
        color: var(--cyan);
        flex-shrink: 0;
        width: 70px;
      }

      .timeline .d { flex: 1; }

      .timeline .pt {
        color: var(--success);
        flex-shrink: 0;
      }

      .timeline .pt.neg { color: var(--danger); }
    </style>
  `;
}

/**
 * Generate title page HTML
 */
function generateTitlePage(
  game: GameSession,
  roster: Roster,
  analytics: any
): string {
  const finalScore = `${analytics.teamStats.totalPoints} – ${analytics.opponentStats.totalPoints}`;
  const courtFormat = game.courtType === 'nba' ? 'NBA COURT' : 'HIGH SCHOOL COURT';

  return `
    <div class="page" style="display:flex; flex-direction:column; justify-content:center; align-items:center; min-height:100vh; text-align:center;">
      <img class="battle-banner" src="./public/battle-banner.png" alt="Basketball Wizard" style="width:100%; max-width:600px; display:block; border-bottom:4px solid var(--gold); margin-bottom:30px;" />

      <div style="font-family:'Press Start 2P', cursive; font-size:11px; color:var(--text-dim); margin-bottom:30px;">GENERATED BY BASKETBALL WIZARD</div>

      <div style="font-family:'Press Start 2P', cursive; font-size:24px; color:var(--text); text-shadow:3px 3px 0 var(--purple-dark), 0 0 15px var(--cyan); margin-bottom:20px;">${roster.teamName.toUpperCase()}</div>

      <div style="font-family:'VT323', monospace; font-size:32px; color:var(--gold); margin:10px 0;">VS</div>

      <div style="font-family:'Press Start 2P', cursive; font-size:24px; color:var(--text); text-shadow:3px 3px 0 var(--purple-dark), 0 0 15px var(--cyan); margin-bottom:30px;">${game.opponentName.toUpperCase()}</div>

      <div style="font-family:'Press Start 2P', cursive; font-size:28px; color:var(--cyan); text-shadow:2px 2px 0 #000; margin:20px 0;">${finalScore}</div>

      <div style="display:flex; gap:20px; margin-top:30px;">
        <div style="background:var(--panel); border:2px solid var(--purple); padding:12px 16px;">
          <div style="font-family:'Press Start 2P', cursive; font-size:8px; color:var(--gold);">DATE</div>
          <div style="font-size:18px; color:var(--text); margin-top:6px;">${game.date}</div>
        </div>
        <div style="background:var(--panel); border:2px solid var(--purple); padding:12px 16px;">
          <div style="font-family:'Press Start 2P', cursive; font-size:8px; color:var(--gold);">FORMAT</div>
          <div style="font-size:18px; color:var(--text); margin-top:6px;">${courtFormat}</div>
        </div>
      </div>

      <div style="font-family:'VT323', monospace; font-size:14px; color:var(--text-dim); margin-top:40px;">FULL GAME REPORT · GENERATED FROM LIVE LOGGED EVENTS</div>
    </div>
  `;
}

/**
 * Generate team shot chart page HTML
 */
function generateTeamShotChartPage(
  game: GameSession,
  roster: Roster,
  analytics: any
): string {
  const offensiveShotChart = generateShotChartSVG(analytics.offense?.byZone || analytics.teamZoneStats, game.courtType || 'highschool');
  const defensiveShotChart = generateDefensiveShotChartSVG(analytics.defense?.byZone || {}, game.courtType || 'highschool');
  const timeline = generateTimeline(game, roster);

  return `
    <div class="page">
      <div class="page-header">
        <div class="title">TEAM SHOT CHART</div>
        <div class="sub">OFFENSE & DEFENSE, ALL PLAYERS COMBINED</div>
      </div>

      <div class="section-label">TEAM OFFENSE</div>
      <div class="chart-row">${offensiveShotChart}</div>
      ${generateZoneStatsTable(analytics.teamZoneStats)}

      <div class="section-label">TEAM DEFENSE (OPPONENT SHOTS FACED)</div>
      <div class="chart-row">${defensiveShotChart}</div>

      <div class="section-label">THIS GAME</div>
      <div class="insights">
        ${generateInsights(game, analytics)}
      </div>

      <div class="section-label">FULL GAME LOG (TAP TO WATCH)</div>
      <div class="timeline">
        ${timeline}
      </div>
    </div>
  `;
}

/**
 * Calculate HSL color based on FG percentage
 */
function getHSLColorForPercentage(percentage: number): string {
  if (percentage >= 55) {
    // Hot: green-ish (hue 100-180)
    const hue = 100 + (percentage - 55) * 1.5;
    return `hsl(${hue},55%,45%)`;
  } else if (percentage >= 33) {
    // Average: yellow (hue 40-100)
    const hue = 40 + (percentage - 33) * 2.7;
    return `hsl(${hue},55%,45%)`;
  } else {
    // Cold: blue (hue 200-240)
    const hue = 240 - percentage;
    return `hsl(${hue},55%,45%)`;
  }
}

/**
 * Generate shot chart SVG with hotzone shading
 */
function generateShotChartSVG(
  zoneStats: Record<CourtZone, ZoneStats>,
  courtType: 'nba' | 'highschool'
): string {
  // NBA zone paths
  const NBA_ZONES: Record<CourtZone, string> = {
    restricted_area: 'M210,0 L210,52.5 A40,40 0 0 1 290,52.5 L290,0 Z',
    paint: 'M170,0 L330,0 L330,190 L170,190 Z',
    left_baseline_mid: 'M30,0 L170,0 L170,142 L30,142 Z',
    center_mid: 'M170,190 L330,190 L369.5,258 A237.5,237.5 0 0 1 130.5,258 L170,190 Z',
    right_baseline_mid: 'M330,0 L470,0 L470,142 L330,142 Z',
    left_elbow_mid: 'M170,142 L170,190 L130.5,258 A237.5,237.5 0 0 1 30,142 L170,142 Z',
    right_elbow_mid: 'M330,142 L330,190 L369.5,258 A237.5,237.5 0 0 0 470,142 L330,142 Z',
    left_wing_3: 'M0,142 L30,142 A237.5,237.5 0 0 0 130.5,258 L82.8,340 L0,340 Z',
    top_key_3: 'M130.5,258 A237.5,237.5 0 0 0 369.5,258 L417.2,340 L82.8,340 Z',
    right_wing_3: 'M500,142 L470,142 A237.5,237.5 0 0 1 369.5,258 L417.2,340 L500,340 Z',
    left_corner_3: 'M0,0 L30,0 L30,142 L0,142 Z',
    right_corner_3: 'M470,0 L500,0 L500,142 L470,142 Z',
    deep_3_logo: 'M0,340 L500,340 L500,470 L0,470 Z',
    unknown: '', // Fallback for unknown zones
  };

  const zoneOrder: CourtZone[] = [
    'restricted_area', 'paint', 'left_baseline_mid', 'center_mid', 'right_baseline_mid',
    'left_elbow_mid', 'right_elbow_mid', 'left_wing_3', 'top_key_3', 'right_wing_3',
    'left_corner_3', 'right_corner_3', 'deep_3_logo'
  ];

  let zonePaths = '';
  let zoneCounts = '';

  zoneOrder.forEach(zone => {
    const stats = zoneStats[zone];
    const path = NBA_ZONES[zone];

    let fill = '#2c2a3a'; // No attempts
    let countText = '';

    if (stats && stats.fga > 0) {
      fill = getHSLColorForPercentage(stats.fgPct);
      countText = `${stats.fgm}-${stats.fga}`;
    }

    zonePaths += `<path d="${path}" fill="${fill}" fill-opacity="0.8" stroke="#000" stroke-width="1"></path>`;

    // Add count text at zone center (simplified positioning)
    if (countText) {
      const labelPos = getZoneLabelPosition(zone);
      zoneCounts += `<text class="zone-count" x="${labelPos.x}" y="${labelPos.y}" fill="#fff">${countText}</text>`;
    }
  });

  return `
    <svg class="court" viewBox="0 0 500 470" xmlns="http://www.w3.org/2000/svg">
      <rect x="1" y="1" width="498" height="468" class="court-line"></rect>
      <rect x="170" y="0" width="160" height="190" class="court-line"></rect>
      <circle cx="250" cy="190" r="60" class="court-line" stroke-dasharray="3 4"></circle>
      <circle cx="250" cy="52.5" r="7.5" class="court-line"></circle>
      ${zonePaths}
      ${zoneCounts}
      <text class="zone-label" x="250" y="410">DEEP</text>
    </svg>
    <div class="legend">
      <span><i class="swatch" style="background:hsl(215,55%,45%)"></i>&lt;33%</span>
      <span><i class="swatch" style="background:hsl(60,55%,45%)"></i>33-55%</span>
      <span><i class="swatch" style="background:hsl(0,70%,45%)"></i>&gt;55%</span>
      <span><i class="swatch" style="background:#2c2a3a"></i>no attempts</span>
    </div>
  `;
}

function getZoneLabelPosition(zone: CourtZone): { x: number; y: number } {
  const positions: Record<CourtZone, { x: number; y: number }> = {
    restricted_area: { x: 250, y: 35 },
    paint: { x: 250, y: 165 },
    left_baseline_mid: { x: 100, y: 70 },
    center_mid: { x: 250, y: 215 },
    right_baseline_mid: { x: 400, y: 70 },
    left_elbow_mid: { x: 90, y: 210 },
    right_elbow_mid: { x: 410, y: 210 },
    left_wing_3: { x: 45, y: 270 },
    top_key_3: { x: 250, y: 300 },
    right_wing_3: { x: 455, y: 270 },
    left_corner_3: { x: 15, y: 70 },
    right_corner_3: { x: 485, y: 70 },
    deep_3_logo: { x: 250, y: 410 },
    unknown: { x: 0, y: 0 }
  };

  return positions[zone];
}

/**
 * Generate zone stats table
 */
function generateZoneStatsTable(zoneStats: Record<CourtZone, ZoneStats>): string {
  const sortedZones = Object.entries(zoneStats)
    .filter(([_, stats]) => stats.fga > 0)
    .sort((a, b) => b[1].fga - a[1].fga);

  const rows = sortedZones.map(([zone, stats]) => `
    <tr>
      <td>${ZONE_LABELS[zone as CourtZone]}</td>
      <td>${stats.fgm}-${stats.fga}</td>
      <td>${Math.round(stats.fgPct)}%</td>
    </tr>
  `).join('');

  return `
    <table>
      <tr><th>Zone</th><th>Made-Att</th><th>%</th></tr>
      ${rows}
    </table>
  `;
}

/**
 * Generate defensive shot chart showing opponent attempts by zone
 */
function generateDefensiveShotChartSVG(
  zoneStats: Record<CourtZone, ZoneStats>,
  courtType: 'nba' | 'highschool'
): string {
  // NBA zone paths (same as offensive chart)
  const NBA_ZONES: Record<CourtZone, string> = {
    restricted_area: 'M210,0 L210,52.5 A40,40 0 0 1 290,52.5 L290,0 Z',
    paint: 'M170,0 L330,0 L330,190 L170,190 Z',
    left_baseline_mid: 'M30,0 L170,0 L170,142 L30,142 Z',
    center_mid: 'M170,190 L330,190 L369.5,258 A237.5,237.5 0 0 1 130.5,258 L170,190 Z',
    right_baseline_mid: 'M330,0 L470,0 L470,142 L330,142 Z',
    left_elbow_mid: 'M170,142 L170,190 L130.5,258 A237.5,237.5 0 0 1 30,142 L170,142 Z',
    right_elbow_mid: 'M330,142 L330,190 L369.5,258 A237.5,237.5 0 0 0 470,142 L330,142 Z',
    left_wing_3: 'M0,142 L30,142 A237.5,237.5 0 0 0 130.5,258 L82.8,340 L0,340 Z',
    top_key_3: 'M130.5,258 A237.5,237.5 0 0 0 369.5,258 L417.2,340 L82.8,340 Z',
    right_wing_3: 'M500,142 L470,142 A237.5,237.5 0 0 1 369.5,258 L417.2,340 L500,340 Z',
    left_corner_3: 'M0,0 L30,0 L30,142 L0,142 Z',
    right_corner_3: 'M470,0 L500,0 L500,142 L470,142 Z',
    deep_3_logo: 'M0,340 L500,340 L500,470 L0,470 Z',
    unknown: '', // Fallback for unknown zones
  };

  const zoneOrder: CourtZone[] = [
    'restricted_area', 'paint', 'left_baseline_mid', 'center_mid', 'right_baseline_mid',
    'left_elbow_mid', 'right_elbow_mid', 'left_wing_3', 'top_key_3', 'right_wing_3',
    'left_corner_3', 'right_corner_3', 'deep_3_logo'
  ];

  let zonePaths = '';
  let zoneCounts = '';

  zoneOrder.forEach(zone => {
    const stats = zoneStats[zone];
    const path = NBA_ZONES[zone];

    let fill = '#2c2a3a'; // No attempts
    let countText = '';

    if (stats && stats.fga > 0) {
      // For defense, lower opponent FG% is better (shown in green)
      // Higher opponent FG% is worse (shown in red)
      const invertedPct = 100 - stats.fgPct;
      fill = getHSLColorForPercentage(invertedPct);
      countText = `${stats.fgm}-${stats.fga}`;
    }

    zonePaths += `<path d="${path}" fill="${fill}" fill-opacity="0.8" stroke="#000" stroke-width="1"></path>`;

    // Add count text at zone center
    if (countText) {
      const labelPos = getZoneLabelPosition(zone);
      zoneCounts += `<text class="zone-count" x="${labelPos.x}" y="${labelPos.y}" fill="#fff">${countText}</text>`;
    }
  });

  return `
    <svg class="court" viewBox="0 0 500 470" xmlns="http://www.w3.org/2000/svg">
      <rect x="1" y="1" width="498" height="468" class="court-line"></rect>
      <rect x="170" y="0" width="160" height="190" class="court-line"></rect>
      <circle cx="250" cy="190" r="60" class="court-line" stroke-dasharray="3 4"></circle>
      <circle cx="250" cy="52.5" r="7.5" class="court-line"></circle>
      ${zonePaths}
      ${zoneCounts}
      <text class="zone-label" x="250" y="410">DEEP</text>
    </svg>
    <div class="legend">
      <span><i class="swatch" style="background:hsl(140,55%,45%)"></i>Good D (&lt;35% opp)</span>
      <span><i class="swatch" style="background:hsl(60,55%,45%)"></i>Average (35-50% opp)</span>
      <span><i class="swatch" style="background:hsl(220,55%,45%)"></i>Weak D (&gt;50% opp)</span>
      <span><i class="swatch" style="background:#2c2a3a"></i>no attempts</span>
    </div>
  `;
}

/**
 * Generate insights list
 */
function generateInsights(game: GameSession, analytics: any): string {
  const insights: string[] = [];

  const totalAttempts = analytics.teamStats.fgAttempts;
  const totalMade = analytics.teamStats.fgMade;
  const fgPct = totalAttempts > 0 ? Math.round((totalMade / totalAttempts) * 100) : 0;

  insights.push(`Team shot ${totalMade}-${totalAttempts} (${fgPct}%) from the field this game.`);

  // Find most attempted zone
  const zoneEntries = Object.entries(analytics.teamZoneStats) as [CourtZone, ZoneStats][];
  const mostAttempts = zoneEntries
    .filter(([_, stats]) => stats.fga > 0)
    .sort((a, b) => b[1].fga - a[1].fga)[0];

  if (mostAttempts) {
    const [zone, stats] = mostAttempts;
    insights.push(`Most attempts came from ${ZONE_LABELS[zone]} (${stats.fga} attempts, ${stats.fgm}-${stats.fga}).`);
  }

  return '<ul>' + insights.map(i => `<li>${i}</li>`).join('') + '</ul>';
}

/**
 * Generate timeline with YouTube links
 */
function generateTimeline(game: GameSession, roster: Roster): string {
  if (!game.events || game.events.length === 0) {
    return '<div style="padding:12px; color:var(--text-dim);">No events logged yet.</div>';
  }

  const videoId = extractVideoId(game.videoUrl);

  return game.events.map(event => {
    const timestamp = formatTimestamp(event.timestampSec);
    const timestampSeconds = Math.floor(event.timestampSec);
    const youtubeLink = `https://www.youtube.com/watch?v=${videoId}&t=${timestampSeconds}s`;

    // Look up player from roster using primaryPlayerId
    let playerName = 'Team';
    if (event.primaryPlayerId) {
      const player = roster.players.find(p => p.id === event.primaryPlayerId);
      if (player) {
        playerName = `#${player.number} ${player.name}`;
      }
    }

    const description = formatEventDescription(event);
    const points = calculateEventPoints(event);

    return `
      <a href="${youtubeLink}" target="_blank" rel="noopener">
        <span class="t">${timestamp}</span>
        <span class="who">${playerName}</span>
        <span class="d">${description}</span>
        ${points !== 0 ? `<span class="pt ${points < 0 ? 'neg' : ''}">${points > 0 ? '+' : ''}${points}</span>` : ''}
      </a>
    `;
  }).join('');
}

function extractVideoId(url: string): string {
  const match = url.match(/[?&]v=([^&]+)/);
  return match ? match[1] : '';
}

function formatTimestamp(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

function formatEventDescription(event: any): string {
  const type = event.eventType || event.type;

  switch (type) {
    case '2PT_MAKE': return '2PT Make';
    case '2PT_MISS': return '2PT Miss';
    case '3PT_MAKE': return '3PT Make';
    case '3PT_MISS': return '3PT Miss';
    case 'FT_MAKE': return 'Free Throw Make';
    case 'FT_MISS': return 'Free Throw Miss';
    case 'REB_OFF': return 'Offensive Rebound';
    case 'REB_DEF': return 'Defensive Rebound';
    case 'ASSIST': return 'Assist';
    case 'TURNOVER': return 'Turnover';
    case 'STEAL': return 'Steal';
    case 'BLOCK': return 'Block';
    case 'FOUL': return 'Foul';
    case 'DEFLECTION': return 'Deflection';
    case 'CHARGE_TAKEN': return 'Charge Taken';
    case 'BLOWN_COVERAGE': return 'Blown Coverage';
    case 'HELP_D_BREAKDOWN': return 'Help Defense Breakdown';
    case 'OPP_SCORE_2': return 'Opponent 2PT';
    case 'OPP_SCORE_3': return 'Opponent 3PT';
    case 'OPP_SCORE_FT': return 'Opponent Free Throw';
    case 'CUSTOM': return event.comment || 'Custom Event';
    default: return type || 'Event';
  }
}

function calculateEventPoints(event: any): number {
  const type = event.eventType || event.type;

  switch (type) {
    case '2PT_MAKE': return 2;
    case '3PT_MAKE': return 3;
    case 'FT_MAKE': return 1;
    case 'OPP_SCORE_2': return -2;
    case 'OPP_SCORE_3': return -3;
    case 'OPP_SCORE_FT': return -1;
    default: return 0;
  }
}

/**
 * Placeholder for lineup analysis
 */
function generateLineupAnalysisPage(game: GameSession, roster: Roster): string {
  return `
    <div class="page">
      <div class="page-header">
        <div class="title">LINEUP ANALYSIS</div>
        <div class="sub">5-MAN UNIT PERFORMANCE</div>
      </div>
      <div style="padding:20px; color:var(--text-dim);">Lineup analysis coming soon.</div>
    </div>
  `;
}

/**
 * Placeholder for player cards
 */
function generatePlayerCards(game: GameSession, roster: Roster, analytics: any): string {
  return `
    <div class="page">
      <div class="page-header">
        <div class="title">PLAYER CARDS</div>
        <div class="sub">INDIVIDUAL PERFORMANCE</div>
      </div>
      <div style="padding:20px; color:var(--text-dim);">Player cards coming soon.</div>
    </div>
  `;
}
