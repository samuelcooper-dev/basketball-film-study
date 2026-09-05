// Professional NBA-accurate court SVG templates

export interface CourtColors {
  floor: string;
  lines: string;
  paint: string;
  threePoint: string;
}

export const LIGHT_THEME: CourtColors = {
  floor: '#C99869',
  lines: '#FFFFFF',
  paint: 'rgba(200,100,50,0.15)',
  threePoint: '#FFFFFF'
};

export const DARK_THEME: CourtColors = {
  floor: '#1E1E1E',
  lines: '#888888',
  paint: 'rgba(136,136,136,0.1)',
  threePoint: '#888888'
};

export function generateCourtSVG(
  colors: CourtColors = LIGHT_THEME,
  width: number = 500,
  height: number = 470
): string {
  return `
    <svg viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <!-- Wood grain for light theme -->
        <pattern id="woodGrain" x="0" y="0" width="100" height="100" patternUnits="userSpaceOnUse">
          <rect width="100" height="100" fill="${colors.floor}" />
          ${colors.floor === LIGHT_THEME.floor ? `
            <path d="M0,20 Q25,22 50,20 T100,20" stroke="#B08759" stroke-width="0.5" fill="none" opacity="0.3" />
            <path d="M0,50 Q25,48 50,50 T100,50" stroke="#B08759" stroke-width="0.5" fill="none" opacity="0.3" />
            <path d="M0,80 Q25,82 50,80 T100,80" stroke="#B08759" stroke-width="0.5" fill="none" opacity="0.3" />
          ` : ''}
        </pattern>
      </defs>

      <!-- Court background -->
      <rect x="0" y="0" width="${width}" height="${height}" fill="url(#woodGrain)" />

      <!-- Court boundary -->
      <rect x="25" y="10" width="450" height="450" fill="none" stroke="${colors.lines}" stroke-width="3" />

      <!-- Half court line -->
      <line x1="25" y1="10" x2="475" y2="10" stroke="${colors.lines}" stroke-width="3" />

      <!-- Center circle (half) -->
      <circle cx="250" cy="10" r="60" fill="none" stroke="${colors.lines}" stroke-width="2" />

      <!-- Paint / Key (16ft = 160px wide) -->
      <rect x="170" y="270" width="160" height="190" fill="${colors.paint}" stroke="${colors.lines}" stroke-width="2.5" />

      <!-- Free throw circle -->
      <circle cx="250" cy="270" r="60" fill="none" stroke="${colors.lines}" stroke-width="2" />

      <!-- Free throw line -->
      <line x1="170" y1="270" x2="330" y2="270" stroke="${colors.lines}" stroke-width="2" />

      <!-- Restricted area arc (4ft radius) -->
      <path d="M 220 455 A 40 40 0 0 1 280 455" fill="none" stroke="${colors.lines}" stroke-width="2" />

      <!-- 3-Point Arc (NBA: 23.75ft from center, 22ft corners) -->
      <!-- Corners: straight 22ft from baseline = y:235 -->
      <!-- Arc: 237.5 units from basket -->
      <path d="M 70 455 L 70 380 Q 250 80, 430 380 L 430 455"
            fill="none" stroke="${colors.threePoint}" stroke-width="2.5" />

      <!-- Baseline -->
      <line x1="25" y1="460" x2="475" y2="460" stroke="${colors.lines}" stroke-width="3" />

      <!-- Basket -->
      <line x1="215" y1="455" x2="285" y2="455" stroke="${colors.lines}" stroke-width="3" opacity="0.8" />
      <circle cx="250" cy="455" r="9" fill="none" stroke="#E74C3C" stroke-width="2" />
      <circle cx="250" cy="455" r="3" fill="#E74C3C" />

      <!-- Lane hash marks -->
      <line x1="170" y1="320" x2="163" y2="320" stroke="${colors.lines}" stroke-width="1.5" />
      <line x1="330" y1="320" x2="337" y2="320" stroke="${colors.lines}" stroke-width="1.5" />
      <line x1="170" y1="370" x2="163" y2="370" stroke="${colors.lines}" stroke-width="1.5" />
      <line x1="330" y1="370" x2="337" y2="370" stroke="${colors.lines}" stroke-width="1.5" />
      <line x1="170" y1="420" x2="163" y2="420" stroke="${colors.lines}" stroke-width="1.5" />
      <line x1="330" y1="420" x2="337" y2="420" stroke="${colors.lines}" stroke-width="1.5" />
    </svg>
  `;
}

// Zone center coordinates for plotting (13-zone system)
// Based on: Court 500x470 units, Basket at top (250, 0)
export const ZONE_CENTERS_ACCURATE: Record<string, { x: number; y: number }> = {
  restricted_area: { x: 250, y: 25 },           // Restricted area at rim
  paint: { x: 250, y: 95 },                     // Center of paint area
  left_baseline_mid: { x: 100, y: 70 },         // Left baseline mid-range
  center_mid: { x: 250, y: 220 },               // Center mid-range (top of key)
  right_baseline_mid: { x: 400, y: 70 },        // Right baseline mid-range
  left_elbow_mid: { x: 100, y: 190 },           // Left elbow mid-range
  right_elbow_mid: { x: 400, y: 190 },          // Right elbow mid-range
  left_wing_3: { x: 50, y: 240 },               // Left wing 3
  top_key_3: { x: 250, y: 290 },                // Top of key 3
  right_wing_3: { x: 450, y: 240 },             // Right wing 3
  left_corner_3: { x: 15, y: 70 },              // Left corner 3
  right_corner_3: { x: 485, y: 70 },            // Right corner 3
  deep_3_logo: { x: 250, y: 405 },              // Deep 3 / Logo
  unknown: { x: 250, y: 235 }                   // Default center court
};
