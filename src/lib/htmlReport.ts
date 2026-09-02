import { GameSession, Roster, CourtZone } from '../types';
import { computeTeamAnalytics, getHotZones, getColdZones, getDefensiveWeakZones, TeamAnalytics, ZoneStats } from './analytics';
import { ZONE_LABELS } from '../components/CourtDiagram';
import { generateCourtSVG, DARK_THEME, ZONE_CENTERS_ACCURATE } from '../components/CourtSVG';
import { calculateHexBins, generateHeatMapSVG } from './heatmap';
import { generateZoneEfficiencyChart, generateShotDistributionChart, DARK_CHART_THEME } from './charts';
import { computeLineupStats, getBestLineups, getWorstLineups, getBestOffensiveLineups, getBestDefensiveLineups } from './lineupAnalytics';

export function generateHTMLReport(game: GameSession, roster: Roster): string {
  const analytics = computeTeamAnalytics(game, roster);
  const lineupStats = computeLineupStats(game, roster);

  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${roster.teamName} vs ${game.opponentName} - Film Study Report</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }

    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', sans-serif;
      background: #0A0A0A;
      padding: 20px;
      color: #E0E0E0;
      line-height: 1.6;
    }

    .container {
      max-width: 1400px;
      margin: 0 auto;
      background: #1A1A1A;
      padding: 40px;
      border-radius: 16px;
      box-shadow: 0 8px 32px rgba(0,0,0,0.4);
    }

    /* Header */
    h1 {
      font-size: 36px;
      margin-bottom: 12px;
      background: linear-gradient(135deg, #3B82F6 0%, #8B5CF6 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
      border-bottom: 3px solid #3B82F6;
      padding-bottom: 16px;
      font-weight: 800;
    }

    .game-info {
      background: #2A2A2A;
      padding: 20px;
      border-radius: 12px;
      margin: 24px 0;
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 16px;
      border: 1px solid #333;
    }

    .info-item {
      display: flex;
      flex-direction: column;
      gap: 4px;
    }

    .info-label {
      font-size: 11px;
      color: #888;
      text-transform: uppercase;
      font-weight: 700;
      letter-spacing: 0.5px;
    }

    .info-value {
      font-size: 24px;
      font-weight: 800;
      background: linear-gradient(135deg, #3B82F6 0%, #60A5FA 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
    }

    /* Section Headers */
    h2 {
      font-size: 28px;
      margin: 48px 0 24px 0;
      color: #F5F5F5;
      border-left: 5px solid #3B82F6;
      padding-left: 16px;
      font-weight: 700;
    }

    h3 {
      font-size: 20px;
      margin: 32px 0 16px 0;
      color: #D0D0D0;
      font-weight: 600;
    }

    /* Tables */
    table {
      width: 100%;
      border-collapse: collapse;
      margin: 20px 0;
      font-size: 14px;
      background: #2A2A2A;
      border-radius: 8px;
      overflow: hidden;
    }

    th {
      background: linear-gradient(135deg, #3B82F6 0%, #2563EB 100%);
      color: white;
      padding: 14px 12px;
      text-align: left;
      font-weight: 700;
      text-transform: uppercase;
      font-size: 12px;
      letter-spacing: 0.5px;
    }

    td {
      padding: 12px;
      border-bottom: 1px solid #333;
      color: #D0D0D0;
    }

    tr:hover {
      background: #333;
    }

    tr:last-child td {
      border-bottom: none;
    }

    .stat-highlight {
      background: #3B82F6;
      color: white;
      font-weight: 700;
      padding: 4px 8px;
      border-radius: 4px;
    }

    .good {
      color: #10B981;
      font-weight: 700;
    }

    .bad {
      color: #EF4444;
      font-weight: 700;
    }

    .average {
      color: #F59E0B;
      font-weight: 700;
    }

    /* Court Container */
    .court-container {
      margin: 32px 0;
      padding: 24px;
      background: #2A2A2A;
      border-radius: 12px;
      border: 1px solid #333;
    }

    .shot-chart {
      max-width: 500px;
      margin: 0 auto;
    }

    .legend {
      display: flex;
      justify-content: center;
      flex-wrap: wrap;
      gap: 20px;
      margin-top: 20px;
      padding: 16px;
      background: #1A1A1A;
      border-radius: 8px;
    }

    .legend-item {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 13px;
      font-weight: 600;
    }

    .legend-dot {
      width: 16px;
      height: 16px;
      border-radius: 50%;
      border: 2px solid #fff;
    }

    /* Insights Box */
    .insights {
      background: linear-gradient(135deg, #1E3A20 0%, #2A2A2A 100%);
      border-left: 5px solid #10B981;
      padding: 24px;
      margin: 24px 0;
      border-radius: 8px;
      box-shadow: 0 4px 16px rgba(16, 185, 129, 0.1);
    }

    .insights h3 {
      color: #10B981;
      margin-top: 0;
      margin-bottom: 16px;
      font-size: 22px;
    }

    .insights ul {
      margin: 0 0 0 24px;
      list-style: none;
    }

    .insights li {
      margin: 12px 0;
      line-height: 1.8;
      position: relative;
      padding-left: 8px;
    }

    .insights li::before {
      content: "▸";
      position: absolute;
      left: -16px;
      color: #10B981;
      font-weight: bold;
    }

    /* Player Grid */
    .player-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(380px, 1fr));
      gap: 24px;
      margin: 32px 0;
    }

    .player-card {
      background: #2A2A2A;
      border: 1px solid #3B82F6;
      border-radius: 12px;
      padding: 0;
      overflow: hidden;
      transition: transform 0.2s, box-shadow 0.2s;
    }

    .player-card:hover {
      transform: translateY(-4px);
      box-shadow: 0 8px 24px rgba(59, 130, 246, 0.2);
    }

    .player-header {
      background: linear-gradient(135deg, #3B82F6 0%, #2563EB 100%);
      color: white;
      padding: 16px;
      font-size: 20px;
      font-weight: 800;
    }

    .player-body {
      padding: 20px;
    }

    /* Charts Section */
    .charts-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(500px, 1fr));
      gap: 24px;
      margin: 32px 0;
    }

    .chart-card {
      background: #2A2A2A;
      border-radius: 12px;
      padding: 20px;
      border: 1px solid #333;
    }

    /* Footer */
    .footer {
      margin-top: 64px;
      padding-top: 32px;
      border-top: 2px solid #333;
      text-align: center;
      color: #666;
      font-size: 13px;
    }

    .footer a {
      color: #3B82F6;
      text-decoration: none;
    }

    .footer a:hover {
      text-decoration: underline;
    }

    /* Print Styles */
    @media print {
      body {
        background: white;
        padding: 0;
      }
      .container {
        box-shadow: none;
        background: white;
        color: black;
      }
      h1, h2, h3 {
        color: black;
      }
      .game-info, .court-container, .chart-card, .player-card {
        background: white;
        border: 1px solid #ccc;
      }
      .insights {
        background: #f0f0f0;
      }
    }
  </style>
</head>
<body>
  <div class="container">
    <h1>${roster.teamName} Film Study Report</h1>

    <div class="game-info">
      <div class="info-item">
        <span class="info-label">Opponent</span>
        <span class="info-value">${game.opponentName}</span>
      </div>
      <div class="info-item">
        <span class="info-label">Date</span>
        <span class="info-value">${game.date}</span>
      </div>
      <div class="info-item">
        <span class="info-label">Total Events</span>
        <span class="info-value">${game.events.length}</span>
      </div>
      <div class="info-item">
        <span class="info-label">Points Scored</span>
        <span class="info-value">${analytics.offense.totalPoints}</span>
      </div>
    </div>

    ${generateTeamOffenseSection(analytics)}
    ${generateTeamDefenseSection(analytics)}
    ${generateLineupAnalysisSection(lineupStats)}
    ${generateInsightsSection(analytics, game)}
    ${generatePlayerReportsSection(analytics, game, roster)}

    <div class="footer">
      Generated by Basketball Film Study Extension • ${new Date().toLocaleString()}
    </div>
  </div>
</body>
</html>
  `;

  return html;
}

function generateTeamOffenseSection(analytics: TeamAnalytics): string {
  const sortedZones = Object.entries(analytics.offense.byZone)
    .filter(([_, stats]) => stats.fga > 0)
    .sort((a, b) => b[1].fga - a[1].fga);

  const shotChart = generateShotChartWithHeatMap(analytics);
  const zoneEfficiencyChart = generateZoneEfficiencyChart(
    sortedZones as [CourtZone, ZoneStats][],
    DARK_CHART_THEME,
    600,
    300
  );
  const shotDistributionChart = generateShotDistributionChart(
    sortedZones as [CourtZone, ZoneStats][],
    DARK_CHART_THEME,
    300
  );

  return `
    <h2>🏀 Team Offensive Performance</h2>

    <div class="court-container">
      <h3 style="text-align: center; margin-bottom: 16px; color: #F5F5F5;">Shot Heat Map</h3>
      <div class="shot-chart">
        ${shotChart}
      </div>
      <div class="legend">
        <div class="legend-item">
          <div class="legend-dot" style="background: #EF4444;"></div>
          <span>Hot (≥65%)</span>
        </div>
        <div class="legend-item">
          <div class="legend-dot" style="background: #F59E0B;"></div>
          <span>Good (55-65%)</span>
        </div>
        <div class="legend-item">
          <div class="legend-dot" style="background: #FCD34D;"></div>
          <span>Average (45-55%)</span>
        </div>
        <div class="legend-item">
          <div class="legend-dot" style="background: #34D399;"></div>
          <span>Below Avg (35-45%)</span>
        </div>
        <div class="legend-item">
          <div class="legend-dot" style="background: #60A5FA;"></div>
          <span>Cold (<35%)</span>
        </div>
      </div>
    </div>

    <div class="charts-grid">
      <div class="chart-card">
        ${zoneEfficiencyChart}
      </div>
      <div class="chart-card">
        ${shotDistributionChart}
      </div>
    </div>

    <h3>Overall Shooting</h3>
    <table>
      <tr>
        <th>Stat</th>
        <th>Value</th>
      </tr>
      <tr>
        <td>FG Made - Attempted</td>
        <td class="stat-highlight">${analytics.offense.totalMakes} - ${analytics.offense.totalShots}</td>
      </tr>
      <tr>
        <td>FG Percentage</td>
        <td class="${analytics.offense.fgPct >= 45 ? 'good' : 'bad'}">${analytics.offense.fgPct.toFixed(1)}%</td>
      </tr>
      <tr>
        <td>3PT Percentage</td>
        <td class="${analytics.offense.threePct >= 35 ? 'good' : 'bad'}">${analytics.offense.threePct.toFixed(1)}%</td>
      </tr>
      <tr>
        <td>Total Points</td>
        <td class="stat-highlight">${analytics.offense.totalPoints}</td>
      </tr>
    </table>

    <h3>Performance by Zone</h3>
    <table>
      <tr>
        <th>Zone</th>
        <th>FGA</th>
        <th>FGM</th>
        <th>FG%</th>
        <th>Points</th>
        <th>TO</th>
      </tr>
      ${sortedZones.map(([zone, stats]) => `
        <tr>
          <td><strong>${ZONE_LABELS[zone as CourtZone]}</strong></td>
          <td>${stats.fga}</td>
          <td>${stats.fgm}</td>
          <td class="${stats.fgPct >= 50 ? 'good' : stats.fgPct < 40 ? 'bad' : 'average'}">${stats.fgPct.toFixed(1)}%</td>
          <td><strong>${stats.points}</strong></td>
          <td>${stats.turnovers > 0 ? stats.turnovers : '-'}</td>
        </tr>
      `).join('')}
    </table>
  `;
}

function generateTeamDefenseSection(analytics: TeamAnalytics): string {
  const defenseZones = Object.entries(analytics.defense.byZone)
    .filter(([_, stats]) => stats.fga > 0 || stats.steals > 0 || stats.blocks > 0 || stats.fouls > 0);

  return `
    <h2>🛡️ Team Defensive Performance</h2>

    <h3>Overall Defense</h3>
    <table>
      <tr>
        <th>Stat</th>
        <th>Value</th>
      </tr>
      <tr>
        <td>Steals</td>
        <td class="good">${analytics.defense.steals}</td>
      </tr>
      <tr>
        <td>Blocks</td>
        <td class="good">${analytics.defense.blocks}</td>
      </tr>
      <tr>
        <td>Team Fouls</td>
        <td class="${analytics.defense.fouls > 20 ? 'bad' : ''}">${analytics.defense.fouls}</td>
      </tr>
    </table>

    ${defenseZones.length > 0 ? `
      <h3>Defensive Activity by Zone</h3>
      <table>
        <tr>
          <th>Zone</th>
          <th>Opp FGA</th>
          <th>Opp FGM</th>
          <th>Opp FG%</th>
          <th>Pts Allowed</th>
          <th>STL</th>
          <th>BLK</th>
          <th>Fouls</th>
        </tr>
        ${defenseZones.map(([zone, stats]) => `
          <tr>
            <td><strong>${ZONE_LABELS[zone as CourtZone]}</strong></td>
            <td>${stats.fga > 0 ? stats.fga : '-'}</td>
            <td>${stats.fgm > 0 ? stats.fgm : '-'}</td>
            <td class="${stats.fga > 0 && stats.fgPct >= 55 ? 'bad' : stats.fga > 0 && stats.fgPct < 40 ? 'good' : ''}">
              ${stats.fga > 0 ? stats.fgPct.toFixed(1) + '%' : '-'}
            </td>
            <td>${stats.points > 0 ? stats.points : '-'}</td>
            <td class="${stats.steals > 0 ? 'good' : ''}">${stats.steals > 0 ? stats.steals : '-'}</td>
            <td class="${stats.blocks > 0 ? 'good' : ''}">${stats.blocks > 0 ? stats.blocks : '-'}</td>
            <td class="${stats.fouls > 0 ? 'bad' : ''}">${stats.fouls > 0 ? stats.fouls : '-'}</td>
          </tr>
        `).join('')}
      </table>
    ` : ''}
  `;
}

function generateInsightsSection(analytics: TeamAnalytics, game: GameSession): string {
  const hotZones = getHotZones(analytics, 3);
  const coldZones = getColdZones(analytics, 3);
  const weakDefenseZones = getDefensiveWeakZones(analytics, 3);

  const insights: string[] = [];

  if (hotZones.length > 0) {
    insights.push(`<strong>Hot Zones (≥50% FG):</strong> ${hotZones.map(z => ZONE_LABELS[z]).join(', ')} - Keep attacking these areas!`);
  }

  if (coldZones.length > 0) {
    insights.push(`<strong>Cold Zones (<40% FG):</strong> ${coldZones.map(z => ZONE_LABELS[z]).join(', ')} - Reduce shot attempts here or practice these shots.`);
  }

  if (weakDefenseZones.length > 0) {
    insights.push(`<strong>Defensive Weaknesses:</strong> Opponent shot ≥55% in ${weakDefenseZones.map(z => ZONE_LABELS[z]).join(', ')} - Tighten up defense in these zones.`);
  }

  if (analytics.offense.fgPct >= 50) {
    insights.push(`<strong>Great Shooting!</strong> ${analytics.offense.fgPct.toFixed(1)}% FG is excellent. Keep up the shot selection.`);
  } else if (analytics.offense.fgPct < 40) {
    insights.push(`<strong>Shot Selection:</strong> ${analytics.offense.fgPct.toFixed(1)}% FG is below target. Focus on higher percentage shots.`);
  }

  const paintZone = analytics.offense.byZone.paint;
  if (paintZone.fga < analytics.offense.totalShots * 0.3) {
    insights.push(`<strong>Attack the Paint:</strong> Only ${((paintZone.fga / analytics.offense.totalShots) * 100).toFixed(0)}% of shots were in the paint. Drive more!`);
  }

  if (analytics.defense.steals >= 5) {
    insights.push(`<strong>Active Hands:</strong> ${analytics.defense.steals} steals shows great defensive pressure!`);
  }

  if (analytics.defense.blocks >= 3) {
    insights.push(`<strong>Rim Protection:</strong> ${analytics.defense.blocks} blocks - excellent paint defense!`);
  }

  return `
    <div class="insights">
      <h3>💡 Key Insights & Recommendations</h3>
      <ul>
        ${insights.map(insight => `<li>${insight}</li>`).join('')}
      </ul>
    </div>
  `;
}

function generatePlayerReportsSection(analytics: TeamAnalytics, game: GameSession, roster: Roster): string {
  const playersWithStats = analytics.playerStats
    .sort((a, b) => b.totalStats.points - a.totalStats.points);

  if (playersWithStats.length === 0) {
    return '';
  }

  return `
    <h2>👥 Individual Player Reports</h2>

    <div class="player-grid">
      ${playersWithStats.map(pStats => `
        <div class="player-card">
          <div class="player-header">
            #${pStats.playerNumber} ${pStats.playerName}
          </div>
          <div class="player-body">
            <h4 style="margin: 12px 0 8px 0; color: #F5F5F5;">Offensive Stats</h4>
            <table style="font-size: 13px; background: #1A1A1A;">
              <tr>
                <td>FGM-FGA</td>
                <td><strong>${pStats.totalStats.fgm}-${pStats.totalStats.fga}</strong></td>
                <td class="${pStats.totalStats.fgPct >= 50 ? 'good' : ''}">${pStats.totalStats.fgPct.toFixed(1)}%</td>
              </tr>
              <tr>
                <td>3PM-3PA</td>
                <td><strong>${pStats.totalStats.threePM}-${pStats.totalStats.threePA}</strong></td>
                <td class="${pStats.totalStats.threePct >= 35 ? 'good' : ''}">${pStats.totalStats.threePA > 0 ? pStats.totalStats.threePct.toFixed(1) + '%' : '-'}</td>
              </tr>
              <tr>
                <td>Points</td>
                <td colspan="2" class="stat-highlight">${pStats.totalStats.points}</td>
              </tr>
              <tr>
                <td>Turnovers</td>
                <td colspan="2">${pStats.totalStats.turnovers || '-'}</td>
              </tr>
            </table>

            <h4 style="margin: 12px 0 8px 0; color: #F5F5F5;">Defensive Stats</h4>
            <table style="font-size: 13px; background: #1A1A1A;">
              <tr>
                <td>Steals</td>
                <td colspan="2" class="${pStats.totalStats.steals > 0 ? 'good' : ''}">${pStats.totalStats.steals || '-'}</td>
              </tr>
              <tr>
                <td>Blocks</td>
                <td colspan="2" class="${pStats.totalStats.blocks > 0 ? 'good' : ''}">${pStats.totalStats.blocks || '-'}</td>
              </tr>
              <tr>
                <td>Fouls</td>
                <td colspan="2" class="${pStats.totalStats.fouls > 3 ? 'bad' : ''}">${pStats.totalStats.fouls || '-'}</td>
              </tr>
            </table>

            ${generatePlayerHotColdZones(pStats)}
          </div>
        </div>
      `).join('')}
    </div>
  `;
}

function generatePlayerHotColdZones(pStats: any): string {
  const zonesWithShots = Object.entries(pStats.byZone)
    .filter(([_, stats]: any) => stats.fga >= 2)
    .sort((a: any, b: any) => b[1].fgPct - a[1].fgPct);

  if (zonesWithShots.length === 0) return '';

  const hot = zonesWithShots.filter((z: any) => z[1].fgPct >= 50).slice(0, 2);
  const cold = zonesWithShots.filter((z: any) => z[1].fgPct < 40).slice(0, 2);

  let html = '<div style="margin-top: 12px; font-size: 12px; padding: 8px; background: #1A1A1A; border-radius: 6px;">';

  if (hot.length > 0) {
    html += `<div style="color: #10B981; font-weight: 600; margin-bottom: 4px;">🔥 Hot Zones: ${hot.map((z: any) => ZONE_LABELS[z[0] as CourtZone]).join(', ')}</div>`;
  }

  if (cold.length > 0) {
    html += `<div style="color: #EF4444; font-weight: 600;">❄️ Cold Zones: ${cold.map((z: any) => ZONE_LABELS[z[0] as CourtZone]).join(', ')}</div>`;
  }

  html += '</div>';
  return html;
}

function generateLineupAnalysisSection(lineupStats: any[]): string {
  if (lineupStats.length === 0) {
    return `
      <h2>🏀 Lineup Analysis</h2>
      <p style="color: #999; font-style: italic;">
        No lineup data available. Make sure to select 5 players on court before logging events.
      </p>
    `;
  }

  const bestOverall = getBestLineups(lineupStats, 5, 5);
  const worstOverall = getWorstLineups(lineupStats, 5, 5);
  const bestOffensive = getBestOffensiveLineups(lineupStats, 5, 5);
  const bestDefensive = getBestDefensiveLineups(lineupStats, 5, 5);

  return `
    <h2>🏀 Lineup Analysis</h2>
    <p style="color: #AAA; font-size: 13px; margin-bottom: 20px;">
      Stats normalized to per-100-possessions. Minimum 5 possessions to qualify.
    </p>

    ${bestOverall.length > 0 ? `
      <h3>Best Lineups (Net Rating)</h3>
      <table>
        <tr>
          <th>Lineup</th>
          <th>Poss</th>
          <th>+/-</th>
          <th>OffRtg</th>
          <th>DefRtg</th>
          <th>NetRtg</th>
          <th>FG%</th>
          <th>TO</th>
        </tr>
        ${bestOverall.map(lineup => `
          <tr>
            <td><strong>${lineup.playerNumbers.map((n, i) => `#${n} ${lineup.playerNames[i].split(' ')[0]}`).join(', ')}</strong></td>
            <td>${lineup.possessions.toFixed(1)}</td>
            <td class="${lineup.plusMinus > 0 ? 'good' : lineup.plusMinus < 0 ? 'bad' : ''}">${lineup.plusMinus > 0 ? '+' : ''}${lineup.plusMinus}</td>
            <td class="good">${lineup.offensiveRating.toFixed(1)}</td>
            <td class="${lineup.defensiveRating < 100 ? 'good' : 'bad'}">${lineup.defensiveRating.toFixed(1)}</td>
            <td class="good">${lineup.netRating > 0 ? '+' : ''}${lineup.netRating.toFixed(1)}</td>
            <td>${lineup.fgPct.toFixed(1)}%</td>
            <td>${lineup.turnovers}</td>
          </tr>
        `).join('')}
      </table>
    ` : ''}

    ${worstOverall.length > 0 ? `
      <h3>Worst Lineups (Net Rating)</h3>
      <table>
        <tr>
          <th>Lineup</th>
          <th>Poss</th>
          <th>+/-</th>
          <th>OffRtg</th>
          <th>DefRtg</th>
          <th>NetRtg</th>
          <th>FG%</th>
          <th>TO</th>
        </tr>
        ${worstOverall.map(lineup => `
          <tr>
            <td><strong>${lineup.playerNumbers.map((n, i) => `#${n} ${lineup.playerNames[i].split(' ')[0]}`).join(', ')}</strong></td>
            <td>${lineup.possessions.toFixed(1)}</td>
            <td class="${lineup.plusMinus > 0 ? 'good' : lineup.plusMinus < 0 ? 'bad' : ''}">${lineup.plusMinus > 0 ? '+' : ''}${lineup.plusMinus}</td>
            <td class="${lineup.offensiveRating >= 100 ? 'good' : 'bad'}">${lineup.offensiveRating.toFixed(1)}</td>
            <td class="${lineup.defensiveRating < 100 ? 'good' : 'bad'}">${lineup.defensiveRating.toFixed(1)}</td>
            <td class="bad">${lineup.netRating > 0 ? '+' : ''}${lineup.netRating.toFixed(1)}</td>
            <td>${lineup.fgPct.toFixed(1)}%</td>
            <td>${lineup.turnovers}</td>
          </tr>
        `).join('')}
      </table>
    ` : ''}

    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 24px; margin-top: 32px;">
      ${bestOffensive.length > 0 ? `
        <div>
          <h3>Best Offensive Lineups</h3>
          <table style="font-size: 13px;">
            <tr>
              <th>Lineup</th>
              <th>OffRtg</th>
              <th>FG%</th>
            </tr>
            ${bestOffensive.slice(0, 3).map(lineup => `
              <tr>
                <td style="font-size: 11px;"><strong>${lineup.playerNumbers.map(n => `#${n}`).join(', ')}</strong></td>
                <td class="good">${lineup.offensiveRating.toFixed(1)}</td>
                <td>${lineup.fgPct.toFixed(1)}%</td>
              </tr>
            `).join('')}
          </table>
        </div>
      ` : ''}

      ${bestDefensive.length > 0 ? `
        <div>
          <h3>Best Defensive Lineups</h3>
          <table style="font-size: 13px;">
            <tr>
              <th>Lineup</th>
              <th>DefRtg</th>
              <th>STL+BLK</th>
            </tr>
            ${bestDefensive.slice(0, 3).map(lineup => `
              <tr>
                <td style="font-size: 11px;"><strong>${lineup.playerNumbers.map(n => `#${n}`).join(', ')}</strong></td>
                <td class="good">${lineup.defensiveRating.toFixed(1)}</td>
                <td>${lineup.steals + lineup.blocks}</td>
              </tr>
            `).join('')}
          </table>
        </div>
      ` : ''}
    </div>
  `;
}

function generateShotChartWithHeatMap(analytics: TeamAnalytics): string {
  // Convert analytics data to events for hexbin calculation
  const mockEvents = Object.entries(analytics.offense.byZone).flatMap(([zone, stats]) => {
    const events = [];

    // Create mock make events
    for (let i = 0; i < stats.fgm; i++) {
      events.push({
        eventType: stats.threePA > 0 ? '3PT_MAKE' : '2PT_MAKE',
        location: zone as CourtZone
      });
    }

    // Create mock miss events
    const misses = stats.fga - stats.fgm;
    for (let i = 0; i < misses; i++) {
      events.push({
        eventType: stats.threePA > 0 ? '3PT_MISS' : '2PT_MISS',
        location: zone as CourtZone
      });
    }

    return events;
  });

  // Calculate hexbins and generate heat map
  const hexbins = calculateHexBins(mockEvents as any[], { minAttempts: 1 });
  const heatMapOverlay = generateHeatMapSVG(hexbins, 'dark');

  // Generate the professional dark court as background
  const courtSVG = generateCourtSVG(DARK_THEME, 500, 470);

  // Combine court and heat map
  return `
    <svg viewBox="0 0 500 470" style="width: 100%; height: auto;">
      <g>
        ${courtSVG.replace(/<\?xml.*?\?>/, '').replace(/<svg[^>]*>/, '').replace(/<\/svg>/, '')}
      </g>
      <g>
        ${heatMapOverlay}
      </g>
    </svg>
  `;
}
