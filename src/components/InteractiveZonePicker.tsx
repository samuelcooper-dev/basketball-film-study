import React from 'react';
import { CourtZone } from '../types';

interface InteractiveZonePickerProps {
  onZoneClick: (zone: CourtZone) => void;
  selectedZone?: CourtZone;
  courtType?: 'nba' | 'highschool';
}

// Map zone data attributes from SVG to CourtZone type
const ZONE_MAP: Record<string, CourtZone> = {
  'restricted-area': 'restricted_area',
  'paint': 'paint',
  'left-baseline-mid': 'left_baseline_mid',
  'center-mid': 'center_mid',
  'right-baseline-mid': 'right_baseline_mid',
  'left-elbow-mid': 'left_elbow_mid',
  'right-elbow-mid': 'right_elbow_mid',
  'left-wing-3': 'left_wing_3',
  'top-key-3': 'top_key_3',
  'right-wing-3': 'right_wing_3',
  'left-corner-3': 'left_corner_3',
  'right-corner-3': 'right_corner_3',
  'deep-3-logo': 'deep_3_logo'
};

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

function InteractiveZonePicker({ onZoneClick, selectedZone, courtType = 'highschool' }: InteractiveZonePickerProps) {
  const handleZoneClick = (zoneDataAttr: string) => {
    const zone = ZONE_MAP[zoneDataAttr];
    if (zone) {
      onZoneClick(zone);
    }
  };

  const getZoneFill = (zoneDataAttr: string) => {
    const zone = ZONE_MAP[zoneDataAttr];
    if (zone === selectedZone) {
      return 'rgba(60,230,252,0.5)'; // Selected - bright cyan
    }
    return 'rgba(60,230,252,0.12)'; // Default - dim cyan
  };

  const getZoneStroke = (zoneDataAttr: string) => {
    const zone = ZONE_MAP[zoneDataAttr];
    if (zone === selectedZone) {
      return '#3CE6FC';
    }
    return '#3CE6FC';
  };

  const getZoneStrokeOpacity = (zoneDataAttr: string) => {
    const zone = ZONE_MAP[zoneDataAttr];
    if (zone === selectedZone) {
      return '1';
    }
    return '0.55';
  };

  return (
    <div style={{
      maxWidth: '500px',
      margin: '0 auto',
      background: 'var(--bw-bg-panel)',
      border: 'var(--bw-px) solid #000',
      boxShadow: '0 0 0 var(--bw-px) var(--bw-purple)',
      padding: 'calc(var(--bw-px) * 2)'
    }}>
      {courtType === 'nba' ? (
        <svg viewBox="0 0 500 470" xmlns="http://www.w3.org/2000/svg" style={{ width: '100%', height: 'auto', display: 'block' }}>
          <defs>
            <filter id="cyanGlowPicker" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="2.2" result="blur"/>
              <feMerge>
                <feMergeNode in="blur"/>
                <feMergeNode in="SourceGraphic"/>
              </feMerge>
            </filter>
          </defs>

          <rect fill="#0a0a0f" x="0" y="0" width="500" height="470"></rect>

          <rect x="1" y="1" width="498" height="468" fill="none" stroke="#3CE6FC" strokeWidth="1.6" opacity="0.85" filter="url(#cyanGlowPicker)"></rect>
          <rect x="170" y="0" width="160" height="190" fill="none" stroke="#3CE6FC" strokeWidth="1.6" opacity="0.85" filter="url(#cyanGlowPicker)"></rect>
          <circle cx="250" cy="190" r="60" fill="none" stroke="#3CE6FC" strokeWidth="1.6" strokeDasharray="3 4" opacity="0.85" filter="url(#cyanGlowPicker)"></circle>
          <circle cx="250" cy="52.5" r="7.5" fill="none" stroke="#3CE6FC" strokeWidth="1.6" opacity="0.85" filter="url(#cyanGlowPicker)"></circle>
          <line x1="220" y1="40" x2="280" y2="40" stroke="#3CE6FC" strokeWidth="1.6" opacity="0.85" filter="url(#cyanGlowPicker)"></line>
          <line x1="0" y1="470" x2="500" y2="470" stroke="#3CE6FC" strokeWidth="1.6" strokeDasharray="3 4" opacity="0.85" filter="url(#cyanGlowPicker)"></line>
          <circle cx="250" cy="470" r="45" fill="none" stroke="#3CE6FC" strokeWidth="1.6" strokeDasharray="3 4" opacity="0.85" filter="url(#cyanGlowPicker)"></circle>

          <g id="zonesNBA">
            <path
              data-zone="restricted-area"
              d="M210,0 L210,52.5 A40,40 0 0 1 290,52.5 L290,0 Z"
              fill={getZoneFill('restricted-area')}
              stroke={getZoneStroke('restricted-area')}
              strokeWidth="2"
              strokeOpacity={getZoneStrokeOpacity('restricted-area')}
              cursor="pointer"
              onClick={() => handleZoneClick('restricted-area')}
            />
            <path
              data-zone="paint"
              d="M170,0 L330,0 L330,190 L170,190 Z"
              fill={getZoneFill('paint')}
              stroke={getZoneStroke('paint')}
              strokeWidth="2"
              strokeOpacity={getZoneStrokeOpacity('paint')}
              cursor="pointer"
              onClick={() => handleZoneClick('paint')}
            />
            <path
              data-zone="left-baseline-mid"
              d="M30,0 L170,0 L170,142 L30,142 Z"
              fill={getZoneFill('left-baseline-mid')}
              stroke={getZoneStroke('left-baseline-mid')}
              strokeWidth="2"
              strokeOpacity={getZoneStrokeOpacity('left-baseline-mid')}
              cursor="pointer"
              onClick={() => handleZoneClick('left-baseline-mid')}
            />
            <path
              data-zone="center-mid"
              d="M170,190 L330,190 L369.5,258 A237.5,237.5 0 0 1 130.5,258 L170,190 Z"
              fill={getZoneFill('center-mid')}
              stroke={getZoneStroke('center-mid')}
              strokeWidth="2"
              strokeOpacity={getZoneStrokeOpacity('center-mid')}
              cursor="pointer"
              onClick={() => handleZoneClick('center-mid')}
            />
            <path
              data-zone="right-baseline-mid"
              d="M330,0 L470,0 L470,142 L330,142 Z"
              fill={getZoneFill('right-baseline-mid')}
              stroke={getZoneStroke('right-baseline-mid')}
              strokeWidth="2"
              strokeOpacity={getZoneStrokeOpacity('right-baseline-mid')}
              cursor="pointer"
              onClick={() => handleZoneClick('right-baseline-mid')}
            />
            <path
              data-zone="left-elbow-mid"
              d="M170,142 L170,190 L130.5,258 A237.5,237.5 0 0 1 30,142 L170,142 Z"
              fill={getZoneFill('left-elbow-mid')}
              stroke={getZoneStroke('left-elbow-mid')}
              strokeWidth="2"
              strokeOpacity={getZoneStrokeOpacity('left-elbow-mid')}
              cursor="pointer"
              onClick={() => handleZoneClick('left-elbow-mid')}
            />
            <path
              data-zone="right-elbow-mid"
              d="M330,142 L330,190 L369.5,258 A237.5,237.5 0 0 0 470,142 L330,142 Z"
              fill={getZoneFill('right-elbow-mid')}
              stroke={getZoneStroke('right-elbow-mid')}
              strokeWidth="2"
              strokeOpacity={getZoneStrokeOpacity('right-elbow-mid')}
              cursor="pointer"
              onClick={() => handleZoneClick('right-elbow-mid')}
            />
            <path
              data-zone="left-wing-3"
              d="M0,142 L30,142 A237.5,237.5 0 0 0 130.5,258 L82.8,340 L0,340 Z"
              fill={getZoneFill('left-wing-3')}
              stroke={getZoneStroke('left-wing-3')}
              strokeWidth="2"
              strokeOpacity={getZoneStrokeOpacity('left-wing-3')}
              cursor="pointer"
              onClick={() => handleZoneClick('left-wing-3')}
            />
            <path
              data-zone="top-key-3"
              d="M130.5,258 A237.5,237.5 0 0 0 369.5,258 L417.2,340 L82.8,340 Z"
              fill={getZoneFill('top-key-3')}
              stroke={getZoneStroke('top-key-3')}
              strokeWidth="2"
              strokeOpacity={getZoneStrokeOpacity('top-key-3')}
              cursor="pointer"
              onClick={() => handleZoneClick('top-key-3')}
            />
            <path
              data-zone="right-wing-3"
              d="M500,142 L470,142 A237.5,237.5 0 0 1 369.5,258 L417.2,340 L500,340 Z"
              fill={getZoneFill('right-wing-3')}
              stroke={getZoneStroke('right-wing-3')}
              strokeWidth="2"
              strokeOpacity={getZoneStrokeOpacity('right-wing-3')}
              cursor="pointer"
              onClick={() => handleZoneClick('right-wing-3')}
            />
            <path
              data-zone="left-corner-3"
              d="M0,0 L30,0 L30,142 L0,142 Z"
              fill={getZoneFill('left-corner-3')}
              stroke={getZoneStroke('left-corner-3')}
              strokeWidth="2"
              strokeOpacity={getZoneStrokeOpacity('left-corner-3')}
              cursor="pointer"
              onClick={() => handleZoneClick('left-corner-3')}
            />
            <path
              data-zone="right-corner-3"
              d="M470,0 L500,0 L500,142 L470,142 Z"
              fill={getZoneFill('right-corner-3')}
              stroke={getZoneStroke('right-corner-3')}
              strokeWidth="2"
              strokeOpacity={getZoneStrokeOpacity('right-corner-3')}
              cursor="pointer"
              onClick={() => handleZoneClick('right-corner-3')}
            />
            <path
              data-zone="deep-3-logo"
              d="M0,340 L500,340 L500,470 L0,470 Z"
              fill={getZoneFill('deep-3-logo')}
              stroke={getZoneStroke('deep-3-logo')}
              strokeWidth="2"
              strokeOpacity={getZoneStrokeOpacity('deep-3-logo')}
              cursor="pointer"
              onClick={() => handleZoneClick('deep-3-logo')}
            />
          </g>

          <g>
            <text x="250" y="30" fontSize="12px" fontWeight="400" fill="#3CE6FC" textAnchor="middle" opacity="0.9" pointerEvents="none" fontFamily="VT323, monospace">RA</text>
            <text x="250" y="170" fontSize="12px" fontWeight="400" fill="#3CE6FC" textAnchor="middle" opacity="0.9" pointerEvents="none" fontFamily="VT323, monospace">PAINT</text>
            <text x="100" y="70" fontSize="12px" fontWeight="400" fill="#3CE6FC" textAnchor="middle" opacity="0.9" pointerEvents="none" fontFamily="VT323, monospace">L BASE</text>
            <text x="400" y="70" fontSize="12px" fontWeight="400" fill="#3CE6FC" textAnchor="middle" opacity="0.9" pointerEvents="none" fontFamily="VT323, monospace">R BASE</text>
            <text x="250" y="215" fontSize="12px" fontWeight="400" fill="#3CE6FC" textAnchor="middle" opacity="0.9" pointerEvents="none" fontFamily="VT323, monospace">CTR MID</text>
            <text x="90" y="210" fontSize="12px" fontWeight="400" fill="#3CE6FC" textAnchor="middle" opacity="0.9" pointerEvents="none" fontFamily="VT323, monospace">L ELBOW</text>
            <text x="410" y="210" fontSize="12px" fontWeight="400" fill="#3CE6FC" textAnchor="middle" opacity="0.9" pointerEvents="none" fontFamily="VT323, monospace">R ELBOW</text>
            <text x="15" y="70" fontSize="12px" fontWeight="400" fill="#3CE6FC" textAnchor="middle" opacity="0.9" pointerEvents="none" fontFamily="VT323, monospace">L CNR3</text>
            <text x="485" y="70" fontSize="12px" fontWeight="400" fill="#3CE6FC" textAnchor="middle" opacity="0.9" pointerEvents="none" fontFamily="VT323, monospace">R CNR3</text>
            <text x="45" y="270" fontSize="12px" fontWeight="400" fill="#3CE6FC" textAnchor="middle" opacity="0.9" pointerEvents="none" fontFamily="VT323, monospace">L WING</text>
            <text x="455" y="270" fontSize="12px" fontWeight="400" fill="#3CE6FC" textAnchor="middle" opacity="0.9" pointerEvents="none" fontFamily="VT323, monospace">R WING</text>
            <text x="250" y="300" fontSize="12px" fontWeight="400" fill="#3CE6FC" textAnchor="middle" opacity="0.9" pointerEvents="none" fontFamily="VT323, monospace">TOP KEY</text>
            <text x="250" y="410" fontSize="12px" fontWeight="400" fill="#3CE6FC" textAnchor="middle" opacity="0.9" pointerEvents="none" fontFamily="VT323, monospace">DEEP / LOGO</text>
          </g>
        </svg>
      ) : (
        <svg viewBox="0 0 500 470" xmlns="http://www.w3.org/2000/svg" style={{ width: '100%', height: 'auto', display: 'block' }}>
          <defs>
            <filter id="cyanGlowPickerHS" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="2.2" result="blur"/>
              <feMerge>
                <feMergeNode in="blur"/>
                <feMergeNode in="SourceGraphic"/>
              </feMerge>
            </filter>
          </defs>

          <rect fill="#0a0a0f" x="0" y="0" width="500" height="470"></rect>

          <rect x="1" y="1" width="498" height="468" fill="none" stroke="#3CE6FC" strokeWidth="1.6" opacity="0.85" filter="url(#cyanGlowPickerHS)"></rect>
          <rect x="190" y="0" width="120" height="190" fill="none" stroke="#3CE6FC" strokeWidth="1.6" opacity="0.85" filter="url(#cyanGlowPickerHS)"></rect>
          <circle cx="250" cy="190" r="60" fill="none" stroke="#3CE6FC" strokeWidth="1.6" strokeDasharray="3 4" opacity="0.85" filter="url(#cyanGlowPickerHS)"></circle>
          <circle cx="250" cy="52.5" r="7.5" fill="none" stroke="#3CE6FC" strokeWidth="1.6" opacity="0.85" filter="url(#cyanGlowPickerHS)"></circle>
          <line x1="220" y1="40" x2="280" y2="40" stroke="#3CE6FC" strokeWidth="1.6" opacity="0.85" filter="url(#cyanGlowPickerHS)"></line>
          <line x1="0" y1="470" x2="500" y2="470" stroke="#3CE6FC" strokeWidth="1.6" strokeDasharray="3 4" opacity="0.85" filter="url(#cyanGlowPickerHS)"></line>
          <circle cx="250" cy="470" r="45" fill="none" stroke="#3CE6FC" strokeWidth="1.6" strokeDasharray="3 4" opacity="0.85" filter="url(#cyanGlowPickerHS)"></circle>

          <g id="zonesHS">
            <path
              data-zone="restricted-area"
              d="M210,0 L210,52.5 A40,40 0 0 1 290,52.5 L290,0 Z"
              fill={getZoneFill('restricted-area')}
              stroke={getZoneStroke('restricted-area')}
              strokeWidth="2"
              strokeOpacity={getZoneStrokeOpacity('restricted-area')}
              cursor="pointer"
              onClick={() => handleZoneClick('restricted-area')}
            />
            <path
              data-zone="paint"
              d="M190,0 L310,0 L310,190 L190,190 Z"
              fill={getZoneFill('paint')}
              stroke={getZoneStroke('paint')}
              strokeWidth="2"
              strokeOpacity={getZoneStrokeOpacity('paint')}
              cursor="pointer"
              onClick={() => handleZoneClick('paint')}
            />
            <path
              data-zone="left-baseline-mid"
              d="M59.6,0 L190,0 L190,142 L73.9,142 A197.5,197.5 0 0 1 59.6,0 Z"
              fill={getZoneFill('left-baseline-mid')}
              stroke={getZoneStroke('left-baseline-mid')}
              strokeWidth="2"
              strokeOpacity={getZoneStrokeOpacity('left-baseline-mid')}
              cursor="pointer"
              onClick={() => handleZoneClick('left-baseline-mid')}
            />
            <path
              data-zone="center-mid"
              d="M190,190 L310,190 L329,233.5 A197.5,197.5 0 0 1 171,233.5 L190,190 Z"
              fill={getZoneFill('center-mid')}
              stroke={getZoneStroke('center-mid')}
              strokeWidth="2"
              strokeOpacity={getZoneStrokeOpacity('center-mid')}
              cursor="pointer"
              onClick={() => handleZoneClick('center-mid')}
            />
            <path
              data-zone="right-baseline-mid"
              d="M440.4,0 L310,0 L310,142 L426.1,142 A197.5,197.5 0 0 0 440.4,0 Z"
              fill={getZoneFill('right-baseline-mid')}
              stroke={getZoneStroke('right-baseline-mid')}
              strokeWidth="2"
              strokeOpacity={getZoneStrokeOpacity('right-baseline-mid')}
              cursor="pointer"
              onClick={() => handleZoneClick('right-baseline-mid')}
            />
            <path
              data-zone="left-elbow-mid"
              d="M190,142 L190,190 L171,233.5 A197.5,197.5 0 0 1 73.9,142 L190,142 Z"
              fill={getZoneFill('left-elbow-mid')}
              stroke={getZoneStroke('left-elbow-mid')}
              strokeWidth="2"
              strokeOpacity={getZoneStrokeOpacity('left-elbow-mid')}
              cursor="pointer"
              onClick={() => handleZoneClick('left-elbow-mid')}
            />
            <path
              data-zone="right-elbow-mid"
              d="M310,142 L310,190 L329,233.5 A197.5,197.5 0 0 0 426.1,142 L310,142 Z"
              fill={getZoneFill('right-elbow-mid')}
              stroke={getZoneStroke('right-elbow-mid')}
              strokeWidth="2"
              strokeOpacity={getZoneStrokeOpacity('right-elbow-mid')}
              cursor="pointer"
              onClick={() => handleZoneClick('right-elbow-mid')}
            />
            <path
              data-zone="left-wing-3"
              d="M0,142 L73.9,142 A197.5,197.5 0 0 0 171,233.5 L124.5,340 L0,340 Z"
              fill={getZoneFill('left-wing-3')}
              stroke={getZoneStroke('left-wing-3')}
              strokeWidth="2"
              strokeOpacity={getZoneStrokeOpacity('left-wing-3')}
              cursor="pointer"
              onClick={() => handleZoneClick('left-wing-3')}
            />
            <path
              data-zone="top-key-3"
              d="M171,233.5 A197.5,197.5 0 0 0 329,233.5 L375.5,340 L124.5,340 Z"
              fill={getZoneFill('top-key-3')}
              stroke={getZoneStroke('top-key-3')}
              strokeWidth="2"
              strokeOpacity={getZoneStrokeOpacity('top-key-3')}
              cursor="pointer"
              onClick={() => handleZoneClick('top-key-3')}
            />
            <path
              data-zone="right-wing-3"
              d="M500,142 L426.1,142 A197.5,197.5 0 0 1 329,233.5 L375.5,340 L500,340 Z"
              fill={getZoneFill('right-wing-3')}
              stroke={getZoneStroke('right-wing-3')}
              strokeWidth="2"
              strokeOpacity={getZoneStrokeOpacity('right-wing-3')}
              cursor="pointer"
              onClick={() => handleZoneClick('right-wing-3')}
            />
            <path
              data-zone="left-corner-3"
              d="M0,0 L59.6,0 A197.5,197.5 0 0 0 73.9,142 L0,142 Z"
              fill={getZoneFill('left-corner-3')}
              stroke={getZoneStroke('left-corner-3')}
              strokeWidth="2"
              strokeOpacity={getZoneStrokeOpacity('left-corner-3')}
              cursor="pointer"
              onClick={() => handleZoneClick('left-corner-3')}
            />
            <path
              data-zone="right-corner-3"
              d="M500,0 L440.4,0 A197.5,197.5 0 0 1 426.1,142 L500,142 Z"
              fill={getZoneFill('right-corner-3')}
              stroke={getZoneStroke('right-corner-3')}
              strokeWidth="2"
              strokeOpacity={getZoneStrokeOpacity('right-corner-3')}
              cursor="pointer"
              onClick={() => handleZoneClick('right-corner-3')}
            />
            <path
              data-zone="deep-3-logo"
              d="M0,340 L500,340 L500,470 L0,470 Z"
              fill={getZoneFill('deep-3-logo')}
              stroke={getZoneStroke('deep-3-logo')}
              strokeWidth="2"
              strokeOpacity={getZoneStrokeOpacity('deep-3-logo')}
              cursor="pointer"
              onClick={() => handleZoneClick('deep-3-logo')}
            />
          </g>

          <g>
            <text x="250" y="28" fontSize="11px" fontWeight="400" fill="#3CE6FC" textAnchor="middle" opacity="0.9" pointerEvents="none" fontFamily="VT323, monospace">RA</text>
            <text x="250" y="168" fontSize="11px" fontWeight="400" fill="#3CE6FC" textAnchor="middle" opacity="0.9" pointerEvents="none" fontFamily="VT323, monospace">PAINT</text>
            <text x="125" y="42" fontSize="11px" fontWeight="400" fill="#3CE6FC" textAnchor="middle" opacity="0.9" pointerEvents="none" fontFamily="VT323, monospace">L BASE</text>
            <text x="375" y="42" fontSize="11px" fontWeight="400" fill="#3CE6FC" textAnchor="middle" opacity="0.9" pointerEvents="none" fontFamily="VT323, monospace">R BASE</text>
            <text x="250" y="207" fontSize="11px" fontWeight="400" fill="#3CE6FC" textAnchor="middle" opacity="0.9" pointerEvents="none" fontFamily="VT323, monospace">CTR MID</text>
            <text x="140" y="153" fontSize="11px" fontWeight="400" fill="#3CE6FC" textAnchor="middle" opacity="0.9" pointerEvents="none" fontFamily="VT323, monospace">L ELBOW</text>
            <text x="360" y="153" fontSize="11px" fontWeight="400" fill="#3CE6FC" textAnchor="middle" opacity="0.9" pointerEvents="none" fontFamily="VT323, monospace">R ELBOW</text>
            <text x="30" y="53" fontSize="11px" fontWeight="400" fill="#3CE6FC" textAnchor="middle" opacity="0.9" pointerEvents="none" fontFamily="VT323, monospace">L CNR3</text>
            <text x="470" y="53" fontSize="11px" fontWeight="400" fill="#3CE6FC" textAnchor="middle" opacity="0.9" pointerEvents="none" fontFamily="VT323, monospace">R CNR3</text>
            <text x="65" y="243" fontSize="11px" fontWeight="400" fill="#3CE6FC" textAnchor="middle" opacity="0.9" pointerEvents="none" fontFamily="VT323, monospace">L WING</text>
            <text x="435" y="243" fontSize="11px" fontWeight="400" fill="#3CE6FC" textAnchor="middle" opacity="0.9" pointerEvents="none" fontFamily="VT323, monospace">R WING</text>
            <text x="250" y="296" fontSize="11px" fontWeight="400" fill="#3CE6FC" textAnchor="middle" opacity="0.9" pointerEvents="none" fontFamily="VT323, monospace">TOP KEY</text>
            <text x="250" y="408" fontSize="11px" fontWeight="400" fill="#3CE6FC" textAnchor="middle" opacity="0.9" pointerEvents="none" fontFamily="VT323, monospace">DEEP / LOGO</text>
          </g>
        </svg>
      )}

      {selectedZone && selectedZone !== 'unknown' && (
        <div style={{
          marginTop: 'calc(var(--bw-px) * 3)',
          padding: 'calc(var(--bw-px) * 2)',
          background: 'var(--bw-bg-panel)',
          border: 'var(--bw-px) solid #000',
          boxShadow: '0 0 0 var(--bw-px) var(--bw-cyan), 0 0 0 calc(var(--bw-px) * 2) #000',
          textAlign: 'center',
          color: 'var(--bw-cyan)',
          fontSize: '16px',
          fontFamily: 'var(--bw-font-body)',
          textTransform: 'uppercase'
        }}>
          Selected: {ZONE_LABELS[selectedZone]}
        </div>
      )}
    </div>
  );
}

export default InteractiveZonePicker;
export { ZONE_LABELS };
