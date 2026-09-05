import React from 'react';
import { CourtZone, GameEvent } from '../types';
import { ZONE_CENTERS_ACCURATE } from './CourtSVG';

interface CourtDiagramProps {
  onZoneClick?: (zone: CourtZone) => void;
  selectedZone?: CourtZone;
  mode?: 'select' | 'view';
  events?: GameEvent[];
  showLabels?: boolean;
}

const ZONE_LABELS: Record<CourtZone, string> = {
  restricted_area: 'Restricted Area',
  paint: 'Paint',
  left_baseline_mid: 'Left Baseline Mid',
  center_mid: 'Center Mid-Range',
  right_baseline_mid: 'Right Baseline Mid',
  left_elbow_mid: 'Left Elbow',
  right_elbow_mid: 'Right Elbow',
  left_wing_3: 'Left Wing 3',
  top_key_3: 'Top of Key 3',
  right_wing_3: 'Right Wing 3',
  left_corner_3: 'Left Corner 3',
  right_corner_3: 'Right Corner 3',
  deep_3_logo: 'Deep 3 / Logo',
  unknown: 'Unknown'
};

const ZONE_CENTERS = ZONE_CENTERS_ACCURATE;

function CourtDiagram({
  onZoneClick,
  selectedZone,
  mode = 'select',
  events = [],
  showLabels = true
}: CourtDiagramProps) {
  const isInteractive = mode === 'select';

  // HIGH SCHOOL court dimensions (in feet, scaled to 10 units per foot)
  // Full court: 84ft × 50ft, Half court: 42ft × 50ft
  const SCALE = 10; // units per foot
  const COURT_WIDTH = 50 * SCALE; // 500 units
  const COURT_LENGTH = 42 * SCALE; // 420 units (high school half court)
  const BASKET_DISTANCE = 4 * SCALE; // 40 units from baseline
  const FREE_THROW_LINE = 15 * SCALE; // 150 units from baseline (19 ft from backboard)
  const PAINT_WIDTH = 12 * SCALE; // 120 units (high school paint is 12 ft)
  const THREE_POINT_RADIUS = 19.75 * SCALE; // 197.5 units (19'9" high school 3pt line)
  const THREE_POINT_CORNER = 19.75 * SCALE; // Same as arc radius
  const RESTRICTED_RADIUS = 4 * SCALE; // 40 units
  const FT_CIRCLE_RADIUS = 6 * SCALE; // 60 units
  const RIM_RADIUS = 0.75 * SCALE; // 7.5 units (18" diameter)
  const BACKBOARD_WIDTH = 6 * SCALE; // 60 units

  const basketX = COURT_WIDTH / 2;
  const basketY = COURT_LENGTH - BASKET_DISTANCE;

  // Calculate where 3-point arc meets baseline (high school arc is smaller)
  const cornerDistance = THREE_POINT_CORNER;
  const cornerY = basketY - cornerDistance;

  const getZoneStyle = (zone: CourtZone) => {
    const isSelected = selectedZone === zone;
    return {
      fill: isSelected ? 'rgba(139, 92, 246, 0.4)' : 'transparent',
      stroke: isInteractive ? 'rgba(139, 92, 246, 0.3)' : 'none',
      strokeWidth: isSelected ? 3 : 1.5,
      cursor: isInteractive ? 'pointer' : 'default',
    };
  };

  const handleZoneClick = (zone: CourtZone) => {
    if (isInteractive && onZoneClick) {
      onZoneClick(zone);
    }
  };

  return (
    <div style={{ width: '100%', maxWidth: '450px', margin: '0 auto' }}>
      <svg
        viewBox="0 0 500 420"
        style={{
          width: '100%',
          height: 'auto',
          filter: 'drop-shadow(0 8px 24px rgba(107, 33, 168, 0.6))',
          borderRadius: '8px'
        }}
      >
        <defs>
          {/* Dark fantasy floor gradient */}
          <linearGradient id="darkFloor" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style={{ stopColor: '#0a0a0f', stopOpacity: 1 }} />
            <stop offset="50%" style={{ stopColor: '#0f0a15', stopOpacity: 1 }} />
            <stop offset="100%" style={{ stopColor: '#1a0f1f', stopOpacity: 1 }} />
          </linearGradient>

          {/* Mystical stone texture */}
          <pattern id="stoneTexture" x="0" y="0" width="100" height="100" patternUnits="userSpaceOnUse">
            <rect width="100" height="100" fill="url(#darkFloor)" />
            <circle cx="20" cy="20" r="2" fill="#1a1520" opacity="0.3" />
            <circle cx="60" cy="40" r="1.5" fill="#1a1520" opacity="0.25" />
            <circle cx="80" cy="70" r="2.5" fill="#1a1520" opacity="0.35" />
            <circle cx="30" cy="80" r="1.8" fill="#1a1520" opacity="0.28" />
            <path d="M0,50 Q25,48 50,50 T100,50" stroke="#2a1f30" strokeWidth="0.5" fill="none" opacity="0.2" />
          </pattern>

          {/* Paint area mystical glow */}
          <linearGradient id="paintMystic" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" style={{ stopColor: '#6B21A8', stopOpacity: 0.2 }} />
            <stop offset="100%" style={{ stopColor: '#4C1D95', stopOpacity: 0.35 }} />
          </linearGradient>

          {/* Glow filters */}
          <filter id="purpleGlow">
            <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
            <feMerge>
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>

          <filter id="crimsonGlow">
            <feGaussianBlur stdDeviation="4" result="coloredBlur"/>
            <feMerge>
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>

          <filter id="goldGlow">
            <feGaussianBlur stdDeviation="2.5" result="coloredBlur"/>
            <feMerge>
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
        </defs>

        {/* Court floor */}
        <rect x="0" y="0" width="500" height="420" fill="url(#stoneTexture)" />

        {/* Outer court boundary */}
        <rect
          x="0" y="0"
          width={COURT_WIDTH}
          height={COURT_LENGTH}
          fill="none"
          stroke="#8B5CF6"
          strokeWidth="4"
          filter="url(#purpleGlow)"
        />

        {/* Half court line */}
        <line
          x1="0" y1="0"
          x2={COURT_WIDTH} y2="0"
          stroke="#8B5CF6"
          strokeWidth="4"
          filter="url(#purpleGlow)"
        />

        {/* Center circle */}
        <circle
          cx={COURT_WIDTH / 2} cy="0"
          r={FT_CIRCLE_RADIUS}
          fill="none"
          stroke="#8B5CF6"
          strokeWidth="3"
          filter="url(#purpleGlow)"
        />

        {/* Paint area (12 ft wide for high school) */}
        <rect
          x={(COURT_WIDTH - PAINT_WIDTH) / 2}
          y={COURT_LENGTH - FREE_THROW_LINE}
          width={PAINT_WIDTH}
          height={FREE_THROW_LINE - BASKET_DISTANCE}
          fill="url(#paintMystic)"
          stroke="#A78BFA"
          strokeWidth="3.5"
          filter="url(#purpleGlow)"
        />

        {/* Free throw circle - top half (dashed) */}
        <path
          d={`M ${(COURT_WIDTH - PAINT_WIDTH) / 2} ${COURT_LENGTH - FREE_THROW_LINE}
              A ${FT_CIRCLE_RADIUS} ${FT_CIRCLE_RADIUS} 0 0 1 ${(COURT_WIDTH + PAINT_WIDTH) / 2} ${COURT_LENGTH - FREE_THROW_LINE}`}
          fill="none"
          stroke="#A78BFA"
          strokeWidth="3"
          strokeDasharray="8,6"
          filter="url(#purpleGlow)"
        />

        {/* Free throw circle - bottom half */}
        <path
          d={`M ${(COURT_WIDTH - PAINT_WIDTH) / 2} ${COURT_LENGTH - FREE_THROW_LINE}
              A ${FT_CIRCLE_RADIUS} ${FT_CIRCLE_RADIUS} 0 0 0 ${(COURT_WIDTH + PAINT_WIDTH) / 2} ${COURT_LENGTH - FREE_THROW_LINE}`}
          fill="none"
          stroke="#A78BFA"
          strokeWidth="3"
          filter="url(#purpleGlow)"
        />

        {/* Free throw line */}
        <line
          x1={(COURT_WIDTH - PAINT_WIDTH) / 2}
          y1={COURT_LENGTH - FREE_THROW_LINE}
          x2={(COURT_WIDTH + PAINT_WIDTH) / 2}
          y2={COURT_LENGTH - FREE_THROW_LINE}
          stroke="#A78BFA"
          strokeWidth="3.5"
          filter="url(#purpleGlow)"
        />

        {/* Restricted area arc */}
        <path
          d={`M ${basketX - RESTRICTED_RADIUS} ${basketY}
              A ${RESTRICTED_RADIUS} ${RESTRICTED_RADIUS} 0 0 1 ${basketX + RESTRICTED_RADIUS} ${basketY}`}
          fill="none"
          stroke="#A78BFA"
          strokeWidth="3"
          filter="url(#purpleGlow)"
        />

        {/* 3-Point Line - High School (19'9" arc) - Crimson red */}
        {/* Left corner straight line */}
        <line
          x1={basketX - cornerDistance}
          y1={COURT_LENGTH}
          x2={basketX - cornerDistance}
          y2={cornerY}
          stroke="#DC2626"
          strokeWidth="4"
          filter="url(#crimsonGlow)"
        />

        {/* Arc - 19'9" radius from basket center */}
        <path
          d={`M ${basketX - cornerDistance} ${cornerY}
              A ${THREE_POINT_RADIUS} ${THREE_POINT_RADIUS} 0 0 1 ${basketX + cornerDistance} ${cornerY}`}
          fill="none"
          stroke="#DC2626"
          strokeWidth="4"
          filter="url(#crimsonGlow)"
        />

        {/* Right corner straight line */}
        <line
          x1={basketX + cornerDistance}
          y1={cornerY}
          x2={basketX + cornerDistance}
          y2={COURT_LENGTH}
          stroke="#DC2626"
          strokeWidth="4"
          filter="url(#crimsonGlow)"
        />

        {/* Baseline */}
        <line
          x1="0"
          y1={COURT_LENGTH}
          x2={COURT_WIDTH}
          y2={COURT_LENGTH}
          stroke="#8B5CF6"
          strokeWidth="4"
          filter="url(#purpleGlow)"
        />

        {/* Backboard */}
        <line
          x1={basketX - BACKBOARD_WIDTH / 2}
          y1={basketY}
          x2={basketX + BACKBOARD_WIDTH / 2}
          y2={basketY}
          stroke="#1a1520"
          strokeWidth="8"
        />

        {/* Rim - golden */}
        <circle
          cx={basketX}
          cy={basketY}
          r={RIM_RADIUS}
          fill="none"
          stroke="#F59E0B"
          strokeWidth="3"
          filter="url(#goldGlow)"
        />

        {/* Lane hash marks */}
        {[7, 8, 11, 14].map(distance => {
          const y = COURT_LENGTH - (distance * SCALE);
          if (y < COURT_LENGTH - FREE_THROW_LINE) return null; // Don't draw if outside paint area
          return (
            <React.Fragment key={`hash-${distance}`}>
              <line
                x1={(COURT_WIDTH - PAINT_WIDTH) / 2 - 8}
                y1={y}
                x2={(COURT_WIDTH - PAINT_WIDTH) / 2}
                y2={y}
                stroke="#A78BFA"
                strokeWidth="2.5"
                filter="url(#purpleGlow)"
              />
              <line
                x1={(COURT_WIDTH + PAINT_WIDTH) / 2}
                y1={y}
                x2={(COURT_WIDTH + PAINT_WIDTH) / 2 + 8}
                y2={y}
                stroke="#A78BFA"
                strokeWidth="2.5"
                filter="url(#purpleGlow)"
              />
            </React.Fragment>
          );
        })}

        {/* SHOT CHART ZONES - Standard NBA layout adapted for high school */}

        {/* Paint (restricted + rest of key) */}
        <rect
          x={(COURT_WIDTH - PAINT_WIDTH) / 2}
          y={COURT_LENGTH - FREE_THROW_LINE}
          width={PAINT_WIDTH}
          height={FREE_THROW_LINE - BASKET_DISTANCE}
          {...getZoneStyle('paint')}
          onClick={() => handleZoneClick('paint')}
        />

        {/* Mid-range Left - between paint and 3pt line on left */}
        <path
          d={`M ${basketX - cornerDistance} ${cornerY}
              L ${basketX - cornerDistance} ${COURT_LENGTH - FREE_THROW_LINE}
              L ${(COURT_WIDTH - PAINT_WIDTH) / 2} ${COURT_LENGTH - FREE_THROW_LINE}
              L ${(COURT_WIDTH - PAINT_WIDTH) / 2} ${COURT_LENGTH - BASKET_DISTANCE}
              L ${basketX - cornerDistance} ${COURT_LENGTH}
              L ${basketX - cornerDistance} ${cornerY}
              Z`}
          {...getZoneStyle('midrange_left')}
          onClick={() => handleZoneClick('midrange_left')}
        />

        {/* Mid-range Right - between paint and 3pt line on right */}
        <path
          d={`M ${basketX + cornerDistance} ${cornerY}
              L ${basketX + cornerDistance} ${COURT_LENGTH - FREE_THROW_LINE}
              L ${(COURT_WIDTH + PAINT_WIDTH) / 2} ${COURT_LENGTH - FREE_THROW_LINE}
              L ${(COURT_WIDTH + PAINT_WIDTH) / 2} ${COURT_LENGTH - BASKET_DISTANCE}
              L ${basketX + cornerDistance} ${COURT_LENGTH}
              L ${basketX + cornerDistance} ${cornerY}
              Z`}
          {...getZoneStyle('midrange_right')}
          onClick={() => handleZoneClick('midrange_right')}
        />

        {/* Corner 3 Left - below the break on left side */}
        <rect
          x="0"
          y={cornerY}
          width={basketX - cornerDistance}
          height={COURT_LENGTH - cornerY}
          {...getZoneStyle('corner3_left')}
          onClick={() => handleZoneClick('corner3_left')}
        />

        {/* Corner 3 Right - below the break on right side */}
        <rect
          x={basketX + cornerDistance}
          y={cornerY}
          width={basketX - cornerDistance}
          height={COURT_LENGTH - cornerY}
          {...getZoneStyle('corner3_right')}
          onClick={() => handleZoneClick('corner3_right')}
        />

        {/* Wing 3 Left - left wing above break */}
        <path
          d={`M ${basketX - cornerDistance} ${cornerY}
              A ${THREE_POINT_RADIUS} ${THREE_POINT_RADIUS} 0 0 1 ${basketX - 80} ${basketY - THREE_POINT_RADIUS}
              L ${(COURT_WIDTH - PAINT_WIDTH) / 2} ${COURT_LENGTH - FREE_THROW_LINE}
              L ${basketX - cornerDistance} ${COURT_LENGTH - FREE_THROW_LINE}
              Z`}
          {...getZoneStyle('wing3_left')}
          onClick={() => handleZoneClick('wing3_left')}
        />

        {/* Wing 3 Right - right wing above break */}
        <path
          d={`M ${basketX + cornerDistance} ${cornerY}
              A ${THREE_POINT_RADIUS} ${THREE_POINT_RADIUS} 0 0 0 ${basketX + 80} ${basketY - THREE_POINT_RADIUS}
              L ${(COURT_WIDTH + PAINT_WIDTH) / 2} ${COURT_LENGTH - FREE_THROW_LINE}
              L ${basketX + cornerDistance} ${COURT_LENGTH - FREE_THROW_LINE}
              Z`}
          {...getZoneStyle('wing3_right')}
          onClick={() => handleZoneClick('wing3_right')}
        />

        {/* Top 3 - top of key beyond arc */}
        <path
          d={`M 0 0
              L ${COURT_WIDTH} 0
              L ${COURT_WIDTH} ${basketY - THREE_POINT_RADIUS}
              A ${THREE_POINT_RADIUS} ${THREE_POINT_RADIUS} 0 0 0 ${basketX + 80} ${basketY - THREE_POINT_RADIUS}
              L ${basketX - 80} ${basketY - THREE_POINT_RADIUS}
              A ${THREE_POINT_RADIUS} ${THREE_POINT_RADIUS} 0 0 0 0 ${basketY - THREE_POINT_RADIUS}
              Z`}
          {...getZoneStyle('top3')}
          onClick={() => handleZoneClick('top3')}
        />

        {/* Baseline Left - short corner inside 3pt */}
        <rect
          x={basketX - cornerDistance}
          y={cornerY}
          width={(COURT_WIDTH - PAINT_WIDTH) / 2 - (basketX - cornerDistance)}
          height={COURT_LENGTH - cornerY}
          {...getZoneStyle('baseline_left')}
          onClick={() => handleZoneClick('baseline_left')}
        />

        {/* Baseline Right - short corner inside 3pt */}
        <rect
          x={(COURT_WIDTH + PAINT_WIDTH) / 2}
          y={cornerY}
          width={(basketX + cornerDistance) - (COURT_WIDTH + PAINT_WIDTH) / 2}
          height={COURT_LENGTH - cornerY}
          {...getZoneStyle('baseline_right')}
          onClick={() => handleZoneClick('baseline_right')}
        />

        {/* Zone Labels */}
        {showLabels && isInteractive && (
          <>
            <text
              x={basketX}
              y={COURT_LENGTH - (FREE_THROW_LINE + BASKET_DISTANCE) / 2 + 8}
              fill="#C4B5FD"
              fontSize="14"
              fontWeight="700"
              textAnchor="middle"
              pointerEvents="none"
              filter="url(#purpleGlow)"
            >
              Paint
            </text>

            <text x={basketX - cornerDistance + 35} y={COURT_LENGTH - FREE_THROW_LINE - 20}
              fill="#C4B5FD" fontSize="13" fontWeight="600" textAnchor="middle" pointerEvents="none" filter="url(#purpleGlow)">
              Mid L
            </text>
            <text x={basketX + cornerDistance - 35} y={COURT_LENGTH - FREE_THROW_LINE - 20}
              fill="#C4B5FD" fontSize="13" fontWeight="600" textAnchor="middle" pointerEvents="none" filter="url(#purpleGlow)">
              Mid R
            </text>

            <text x={(basketX - cornerDistance) / 2} y={cornerY + 25}
              fill="#C4B5FD" fontSize="11" fontWeight="600" textAnchor="middle" pointerEvents="none" filter="url(#purpleGlow)">
              C3 L
            </text>
            <text x={basketX + cornerDistance + (basketX - cornerDistance) / 2} y={cornerY + 25}
              fill="#C4B5FD" fontSize="11" fontWeight="600" textAnchor="middle" pointerEvents="none" filter="url(#purpleGlow)">
              C3 R
            </text>

            <text x={basketX - 90} y={basketY - THREE_POINT_RADIUS + 60}
              fill="#C4B5FD" fontSize="13" fontWeight="600" textAnchor="middle" pointerEvents="none" filter="url(#purpleGlow)">
              W3 L
            </text>
            <text x={basketX + 90} y={basketY - THREE_POINT_RADIUS + 60}
              fill="#C4B5FD" fontSize="13" fontWeight="600" textAnchor="middle" pointerEvents="none" filter="url(#purpleGlow)">
              W3 R
            </text>

            <text x={basketX} y={(basketY - THREE_POINT_RADIUS) / 2}
              fill="#C4B5FD" fontSize="14" fontWeight="700" textAnchor="middle" pointerEvents="none" filter="url(#purpleGlow)">
              Top 3
            </text>

            <text x={basketX - cornerDistance + (((COURT_WIDTH - PAINT_WIDTH) / 2 - (basketX - cornerDistance)) / 2)} y={cornerY + 25}
              fill="#C4B5FD" fontSize="11" fontWeight="600" textAnchor="middle" pointerEvents="none" filter="url(#purpleGlow)">
              Base L
            </text>
            <text x={(COURT_WIDTH + PAINT_WIDTH) / 2 + (((basketX + cornerDistance) - (COURT_WIDTH + PAINT_WIDTH) / 2) / 2)} y={cornerY + 25}
              fill="#C4B5FD" fontSize="11" fontWeight="600" textAnchor="middle" pointerEvents="none" filter="url(#purpleGlow)">
              Base R
            </text>
          </>
        )}

        {/* Event markers */}
        {events.map((event) => {
          if (!event.location || event.location === 'unknown') return null;

          const center = ZONE_CENTERS[event.location];
          const jitterX = (Math.random() - 0.5) * 20;
          const jitterY = (Math.random() - 0.5) * 20;
          const x = center.x + jitterX;
          const y = center.y + jitterY;

          let fill = '#8B5CF6';
          let symbol = '●';

          if (event.eventType === '2PT_MAKE' || event.eventType === '3PT_MAKE') {
            fill = '#10B981';
            symbol = '✓';
          } else if (event.eventType === '2PT_MISS' || event.eventType === '3PT_MISS') {
            fill = '#DC2626';
            symbol = '✗';
          } else if (event.eventType === 'TURNOVER') {
            fill = '#F59E0B';
            symbol = '⚠';
          } else if (event.eventType === 'STEAL') {
            fill = '#A855F7';
            symbol = '💪';
          } else if (event.eventType === 'BLOCK') {
            fill = '#06B6D4';
            symbol = '🛡';
          }

          return (
            <g key={event.id}>
              <circle cx={x} cy={y} r="9" fill={fill} stroke="#1a1520" strokeWidth="2" opacity="0.95" filter="url(#purpleGlow)" />
              <text
                x={x} y={y + 1}
                fill="#0a0a0f"
                fontSize="11"
                fontWeight="bold"
                textAnchor="middle"
                dominantBaseline="middle"
                pointerEvents="none"
              >
                {symbol === '✓' ? '✓' : symbol === '✗' ? '✗' : ''}
              </text>
            </g>
          );
        })}
      </svg>

      {selectedZone && selectedZone !== 'unknown' && (
        <div
          style={{
            marginTop: '12px',
            padding: '12px',
            background: 'linear-gradient(135deg, #1e1b4b 0%, #312e81 100%)',
            border: '2px solid #8B5CF6',
            color: '#C4B5FD',
            borderRadius: '8px',
            textAlign: 'center',
            fontSize: '15px',
            fontWeight: '700',
            boxShadow: '0 0 20px rgba(139, 92, 246, 0.6)',
            textShadow: '0 0 10px rgba(196, 181, 253, 0.8)'
          }}
        >
          Selected: {ZONE_LABELS[selectedZone]}
        </div>
      )}
    </div>
  );
}

export default CourtDiagram;
export { ZONE_LABELS, ZONE_CENTERS };
