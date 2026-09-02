import { CourtZone, GameEvent } from '../types';
import { ZONE_CENTERS_ACCURATE } from '../components/CourtSVG';

export interface HexBin {
  x: number;
  y: number;
  makes: number;
  attempts: number;
  fgPct: number;
  points: number;
}

export interface HeatMapConfig {
  hexRadius?: number;
  minAttempts?: number; // Minimum shots to show hex
}

// Color scale for shooting efficiency (Kirk Goldsberry style)
export function getEfficiencyColor(fgPct: number, theme: 'light' | 'dark' = 'light'): string {
  if (fgPct >= 65) return '#DC2626'; // Fire red (hot)
  if (fgPct >= 55) return '#F97316'; // Orange (very good)
  if (fgPct >= 45) return '#FBBF24'; // Yellow (good)
  if (fgPct >= 35) return '#10B981'; // Teal (ok)
  return '#3B82F6'; // Blue (cold)
}

export function getEfficiencyColorDark(fgPct: number): string {
  if (fgPct >= 65) return '#EF4444'; // Bright red
  if (fgPct >= 55) return '#F59E0B'; // Bright orange
  if (fgPct >= 45) return '#FCD34D'; // Bright yellow
  if (fgPct >= 35) return '#34D399'; // Bright teal
  return '#60A5FA'; // Bright blue
}

// Calculate hexbins from shot events
export function calculateHexBins(
  events: GameEvent[],
  config: HeatMapConfig = {}
): HexBin[] {
  const { minAttempts = 2 } = config;

  // Group shots by zone
  const zoneData = new Map<CourtZone, { makes: number; attempts: number; points: number }>();

  events.forEach(event => {
    const isShot = event.eventType === '2PT_MAKE' || event.eventType === '2PT_MISS' ||
                   event.eventType === '3PT_MAKE' || event.eventType === '3PT_MISS';

    if (!isShot || !event.location || event.location === 'unknown') return;

    const zone = event.location;
    const isMake = event.eventType === '2PT_MAKE' || event.eventType === '3PT_MAKE';
    const points = event.eventType === '3PT_MAKE' ? 3 : event.eventType === '2PT_MAKE' ? 2 : 0;

    if (!zoneData.has(zone)) {
      zoneData.set(zone, { makes: 0, attempts: 0, points: 0 });
    }

    const data = zoneData.get(zone)!;
    data.attempts++;
    if (isMake) {
      data.makes++;
      data.points += points;
    }
  });

  // Convert to hexbins
  const hexbins: HexBin[] = [];

  zoneData.forEach((data, zone) => {
    if (data.attempts < minAttempts) return;

    const center = ZONE_CENTERS_ACCURATE[zone];
    if (!center) return;

    hexbins.push({
      x: center.x,
      y: center.y,
      makes: data.makes,
      attempts: data.attempts,
      fgPct: (data.makes / data.attempts) * 100,
      points: data.points
    });
  });

  return hexbins;
}

// Generate SVG hexagon path
export function generateHexPath(cx: number, cy: number, radius: number): string {
  const points: [number, number][] = [];
  for (let i = 0; i < 6; i++) {
    const angle = (Math.PI / 3) * i - Math.PI / 2; // Start from top
    const x = cx + radius * Math.cos(angle);
    const y = cy + radius * Math.sin(angle);
    points.push([x, y]);
  }

  return `M ${points.map(p => p.join(',')).join(' L ')} Z`;
}

// Calculate hex radius based on attempt count
export function calculateHexRadius(attempts: number, maxAttempts: number): number {
  const minRadius = 15;
  const maxRadius = 35;
  const ratio = Math.min(attempts / maxAttempts, 1);
  return minRadius + (maxRadius - minRadius) * ratio;
}

// Generate heat map SVG overlay
export function generateHeatMapSVG(
  hexbins: HexBin[],
  theme: 'light' | 'dark' = 'light'
): string {
  if (hexbins.length === 0) return '';

  const maxAttempts = Math.max(...hexbins.map(h => h.attempts));

  return hexbins.map(hex => {
    const radius = calculateHexRadius(hex.attempts, maxAttempts);
    const color = theme === 'dark' ? getEfficiencyColorDark(hex.fgPct) : getEfficiencyColor(hex.fgPct);
    const path = generateHexPath(hex.x, hex.y, radius);

    return `
      <g class="hex-bin" data-attempts="${hex.attempts}" data-fg-pct="${hex.fgPct.toFixed(1)}">
        <path d="${path}" fill="${color}" opacity="0.75" stroke="#fff" stroke-width="1.5" />
        <text x="${hex.x}" y="${hex.y - 5}"
              fill="#fff" font-size="11" font-weight="700"
              text-anchor="middle"
              style="text-shadow: 1px 1px 2px rgba(0,0,0,0.8);">
          ${hex.fgPct.toFixed(0)}%
        </text>
        <text x="${hex.x}" y="${hex.y + 8}"
              fill="#fff" font-size="9" font-weight="600"
              text-anchor="middle"
              style="text-shadow: 1px 1px 2px rgba(0,0,0,0.8);">
          ${hex.makes}/${hex.attempts}
        </text>
      </g>
    `;
  }).join('\n');
}
