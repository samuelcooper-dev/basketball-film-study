import { ZoneStats } from './analytics';
import { CourtZone } from '../types';
import { ZONE_LABELS } from '../components/CourtDiagram';

export interface ChartTheme {
  background: string;
  text: string;
  bars: {
    good: string;
    average: string;
    poor: string;
  };
}

export const DARK_CHART_THEME: ChartTheme = {
  background: '#2A2A2A',
  text: '#E0E0E0',
  bars: {
    good: '#10B981',
    average: '#F59E0B',
    poor: '#EF4444'
  }
};

export const LIGHT_CHART_THEME: ChartTheme = {
  background: '#F5F5F5',
  text: '#333333',
  bars: {
    good: '#22C55E',
    average: '#F59E0B',
    poor: '#DC2626'
  }
};

// Generate horizontal bar chart for zone efficiency
export function generateZoneEfficiencyChart(
  zones: [CourtZone, ZoneStats][],
  theme: ChartTheme = DARK_CHART_THEME,
  width: number = 600,
  height: number = 300
): string {
  const barHeight = 30;
  const spacing = 10;
  const labelWidth = 120;
  const chartStartX = labelWidth + 10;
  const chartWidth = width - chartStartX - 80;

  const sortedZones = zones
    .filter(([_, stats]) => stats.fga > 0)
    .sort((a, b) => b[1].fgPct - a[1].fgPct)
    .slice(0, 8); // Top 8 zones

  const chartHeight = sortedZones.length * (barHeight + spacing) + 40;

  return `
    <svg viewBox="0 0 ${width} ${chartHeight}" xmlns="http://www.w3.org/2000/svg"
         style="background: ${theme.background}; border-radius: 8px;">

      <!-- Title -->
      <text x="${width / 2}" y="25" fill="${theme.text}" font-size="16" font-weight="700" text-anchor="middle">
        Shooting Efficiency by Zone
      </text>

      ${sortedZones.map(([zone, stats], index) => {
        const y = 50 + index * (barHeight + spacing);
        const barWidth = (stats.fgPct / 100) * chartWidth;

        // Color based on efficiency
        let barColor = theme.bars.average;
        if (stats.fgPct >= 50) barColor = theme.bars.good;
        else if (stats.fgPct < 40) barColor = theme.bars.poor;

        return `
          <!-- Zone label -->
          <text x="10" y="${y + barHeight / 2 + 5}" fill="${theme.text}" font-size="13" font-weight="600">
            ${ZONE_LABELS[zone]}
          </text>

          <!-- Bar background -->
          <rect x="${chartStartX}" y="${y}" width="${chartWidth}" height="${barHeight}"
                fill="${theme.background}" stroke="${theme.text}" stroke-width="1" opacity="0.3" rx="4" />

          <!-- Filled bar -->
          <rect x="${chartStartX}" y="${y}" width="${barWidth}" height="${barHeight}"
                fill="${barColor}" opacity="0.85" rx="4" />

          <!-- Percentage label -->
          <text x="${chartStartX + barWidth + 10}" y="${y + barHeight / 2 + 5}"
                fill="${theme.text}" font-size="12" font-weight="700">
            ${stats.fgPct.toFixed(1)}%
          </text>

          <!-- Attempts label -->
          <text x="${chartStartX + chartWidth + 10}" y="${y + barHeight / 2 + 5}"
                fill="${theme.text}" font-size="11" opacity="0.7">
            (${stats.fgm}/${stats.fga})
          </text>
        `;
      }).join('')}
    </svg>
  `;
}

// Generate pie chart for shot distribution
export function generateShotDistributionChart(
  zones: [CourtZone, ZoneStats][],
  theme: ChartTheme = DARK_CHART_THEME,
  size: number = 300
): string {
  const centerX = size / 2;
  const centerY = size / 2;
  const radius = size / 2 - 40;

  const zonesWithShots = zones.filter(([_, stats]) => stats.fga > 0);
  const totalShots = zonesWithShots.reduce((sum, [_, stats]) => sum + stats.fga, 0);

  if (totalShots === 0) return '';

  // Color palette for slices
  const colors = [
    '#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6',
    '#EC4899', '#14B8A6', '#F97316', '#6366F1', '#84CC16'
  ];

  let currentAngle = -90; // Start from top

  return `
    <svg viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg"
         style="background: ${theme.background}; border-radius: 8px;">

      <!-- Title -->
      <text x="${size / 2}" y="20" fill="${theme.text}" font-size="14" font-weight="700" text-anchor="middle">
        Shot Distribution
      </text>

      ${zonesWithShots.map(([zone, stats], index) => {
        const percentage = (stats.fga / totalShots) * 100;
        const sliceAngle = (percentage / 100) * 360;
        const startAngle = currentAngle;
        const endAngle = currentAngle + sliceAngle;

        // Calculate arc path
        const startRad = (startAngle * Math.PI) / 180;
        const endRad = (endAngle * Math.PI) / 180;

        const x1 = centerX + radius * Math.cos(startRad);
        const y1 = centerY + radius * Math.sin(startRad);
        const x2 = centerX + radius * Math.cos(endRad);
        const y2 = centerY + radius * Math.sin(endRad);

        const largeArc = sliceAngle > 180 ? 1 : 0;

        const path = `
          M ${centerX} ${centerY}
          L ${x1} ${y1}
          A ${radius} ${radius} 0 ${largeArc} 1 ${x2} ${y2}
          Z
        `;

        // Label position (middle of slice)
        const labelAngle = (startAngle + endAngle) / 2;
        const labelRad = (labelAngle * Math.PI) / 180;
        const labelDistance = radius * 0.7;
        const labelX = centerX + labelDistance * Math.cos(labelRad);
        const labelY = centerY + labelDistance * Math.sin(labelRad);

        const color = colors[index % colors.length];

        currentAngle = endAngle;

        return `
          <!-- Slice -->
          <path d="${path}" fill="${color}" opacity="0.8" stroke="${theme.background}" stroke-width="2" />

          <!-- Percentage label (only if > 5%) -->
          ${percentage > 5 ? `
            <text x="${labelX}" y="${labelY}" fill="#fff" font-size="11" font-weight="700" text-anchor="middle">
              ${percentage.toFixed(0)}%
            </text>
          ` : ''}
        `;
      }).join('')}

      <!-- Legend -->
      ${zonesWithShots.map(([zone, stats], index) => {
        const legendY = size - 120 + index * 18;
        const percentage = ((stats.fga / totalShots) * 100).toFixed(0);
        const color = colors[index % colors.length];

        return index < 6 ? `
          <rect x="10" y="${legendY}" width="12" height="12" fill="${color}" rx="2" />
          <text x="28" y="${legendY + 10}" fill="${theme.text}" font-size="10">
            ${ZONE_LABELS[zone]} (${percentage}%)
          </text>
        ` : '';
      }).join('')}
    </svg>
  `;
}
