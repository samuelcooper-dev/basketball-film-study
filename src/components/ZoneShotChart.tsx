import React, { useState } from 'react';
import { GameEvent } from '../types';

interface ZoneShotChartProps {
  events: GameEvent[];
  title?: string;
  playerFilter?: string;
  courtType?: 'nba' | 'highschool';
}

// Map of zone IDs to zone names
const ZONE_NAMES: Record<string, string> = {
  '1': 'Restricted Area',
  '2': 'Paint',
  '3': 'Left Baseline Mid',
  '4': 'Center Mid',
  '5': 'Right Baseline Mid',
  '6': 'Left Elbow Mid',
  '7': 'Right Elbow Mid',
  '8': 'Left Wing 3',
  '9': 'Top Key 3',
  '10': 'Right Wing 3',
  '11': 'Left Corner 3',
  '12': 'Right Corner 3',
  '13': 'Deep 3 / Logo'
};

function ZoneShotChart({ events, title, playerFilter, courtType = 'highschool' }: ZoneShotChartProps) {
  const [hoveredZone, setHoveredZone] = useState<string | null>(null);

  // Filter events for shots only
  const shotEvents = events.filter(e => {
    const isShot = e.eventType === '2PT_MAKE' || e.eventType === '2PT_MISS' ||
                   e.eventType === '3PT_MAKE' || e.eventType === '3PT_MISS';

    if (!isShot) return false;

    if (playerFilter) {
      return e.primaryPlayerId === playerFilter;
    }

    return true;
  });

  // Calculate zone statistics
  const zoneStats: Record<string, { makes: number; attempts: number; percentage: number }> = {};

  shotEvents.forEach(event => {
    // Map old location system to new zones (temporary - you'll need to update event logging)
    const zoneId = event.location || 'unknown';

    if (!zoneStats[zoneId]) {
      zoneStats[zoneId] = { makes: 0, attempts: 0, percentage: 0 };
    }

    zoneStats[zoneId].attempts++;
    if (event.eventType === '2PT_MAKE' || event.eventType === '3PT_MAKE') {
      zoneStats[zoneId].makes++;
    }

    zoneStats[zoneId].percentage = zoneStats[zoneId].attempts > 0
      ? (zoneStats[zoneId].makes / zoneStats[zoneId].attempts) * 100
      : 0;
  });

  const totalMakes = shotEvents.filter(e => e.eventType === '2PT_MAKE' || e.eventType === '3PT_MAKE').length;
  const totalAttempts = shotEvents.length;
  const overallPct = totalAttempts > 0 ? ((totalMakes / totalAttempts) * 100).toFixed(1) : '0.0';

  // Get zone fill color based on shooting percentage
  const getZoneFill = (zoneId: string) => {
    const stats = zoneStats[zoneId];
    if (!stats || stats.attempts === 0) {
      return 'rgba(0,255,255,0.12)'; // Default cyan-dim
    }

    const pct = stats.percentage;
    if (pct >= 50) return 'rgba(0,255,200,0.38)'; // Good - green
    if (pct >= 35) return 'rgba(255,165,0,0.28)'; // OK - orange
    return 'rgba(255,46,106,0.28)'; // Poor - red
  };

  const getZoneStroke = (zoneId: string) => {
    const stats = zoneStats[zoneId];
    if (!stats || stats.attempts === 0) {
      return '#00ffff';
    }

    const pct = stats.percentage;
    if (pct >= 50) return '#00ffc8';
    if (pct >= 35) return '#ffa500';
    return '#ff2e6a';
  };

  return (
    <div style={{ marginBottom: '24px' }}>
      {title && (
        <h3 style={{
          fontSize: '16px',
          marginBottom: '8px',
          fontWeight: '600',
          textAlign: 'center',
          color: '#d8f9ff',
          textShadow: '0 0 8px #00ffff'
        }}>
          {title}
        </h3>
      )}

      <div style={{
        background: 'linear-gradient(135deg, #12121a 0%, #1a0f1f 100%)',
        padding: '12px',
        borderRadius: '8px',
        marginBottom: '12px',
        display: 'flex',
        justifyContent: 'space-around',
        fontSize: '14px',
        border: '1px solid #22222e',
        color: '#d8f9ff'
      }}>
        <div>
          <strong>FGM-FGA:</strong> {totalMakes}-{totalAttempts}
        </div>
        <div>
          <strong>FG%:</strong> {overallPct}%
        </div>
      </div>

      <div style={{
        maxWidth: '500px',
        margin: '0 auto',
        background: '#0a0a0f',
        border: '1px solid #22222e',
        borderRadius: '10px',
        padding: '10px'
      }}>
        {courtType === 'nba' ? (
          <svg viewBox="0 0 500 470" xmlns="http://www.w3.org/2000/svg" style={{ width: '100%', height: 'auto', display: 'block' }}>
            <defs>
              <filter id="cyanGlow" x="-50%" y="-50%" width="200%" height="200%">
                <feGaussianBlur stdDeviation="2.2" result="blur"/>
                <feMerge>
                  <feMergeNode in="blur"/>
                  <feMergeNode in="SourceGraphic"/>
                </feMerge>
              </filter>
            </defs>

            <rect fill="#0d0d14" x="0" y="0" width="500" height="470"></rect>

            <rect className="court-line" x="1" y="1" width="498" height="468" fill="none" stroke="#00ffff" strokeWidth="1.6" opacity="0.85" filter="url(#cyanGlow)"></rect>
            <rect className="court-line" x="170" y="0" width="160" height="190" fill="none" stroke="#00ffff" strokeWidth="1.6" opacity="0.85" filter="url(#cyanGlow)"></rect>
            <circle className="court-line" cx="250" cy="190" r="60" fill="none" stroke="#00ffff" strokeWidth="1.6" strokeDasharray="3 4" opacity="0.85" filter="url(#cyanGlow)"></circle>
            <circle className="court-line" cx="250" cy="52.5" r="7.5" fill="none" stroke="#00ffff" strokeWidth="1.6" opacity="0.85" filter="url(#cyanGlow)"></circle>
            <line className="court-line" x1="220" y1="40" x2="280" y2="40" stroke="#00ffff" strokeWidth="1.6" opacity="0.85" filter="url(#cyanGlow)"></line>
            <line className="court-line" x1="0" y1="470" x2="500" y2="470" stroke="#00ffff" strokeWidth="1.6" strokeDasharray="3 4" opacity="0.85" filter="url(#cyanGlow)"></line>
            <circle className="court-line" cx="250" cy="470" r="45" fill="none" stroke="#00ffff" strokeWidth="1.6" strokeDasharray="3 4" opacity="0.85" filter="url(#cyanGlow)"></circle>

            <g id="zonesNBA">
              <path
                data-zone="restricted-area"
                data-zone-id="1"
                d="M210,0 L210,52.5 A40,40 0 0 1 290,52.5 L290,0 Z"
                fill={getZoneFill('1')}
                stroke={getZoneStroke('1')}
                strokeWidth="1"
                strokeOpacity="0.85"
                cursor="pointer"
                onMouseEnter={() => setHoveredZone('1')}
                onMouseLeave={() => setHoveredZone(null)}
              />
              <path
                data-zone="paint"
                data-zone-id="2"
                d="M170,0 L330,0 L330,190 L170,190 Z"
                fill={getZoneFill('2')}
                stroke={getZoneStroke('2')}
                strokeWidth="1"
                strokeOpacity="0.85"
                cursor="pointer"
                onMouseEnter={() => setHoveredZone('2')}
                onMouseLeave={() => setHoveredZone(null)}
              />
              <path
                data-zone="left-baseline-mid"
                data-zone-id="3"
                d="M30,0 L170,0 L170,142 L30,142 Z"
                fill={getZoneFill('3')}
                stroke={getZoneStroke('3')}
                strokeWidth="1"
                strokeOpacity="0.85"
                cursor="pointer"
                onMouseEnter={() => setHoveredZone('3')}
                onMouseLeave={() => setHoveredZone(null)}
              />
              <path
                data-zone="center-mid"
                data-zone-id="4"
                d="M170,190 L330,190 L369.5,258 A237.5,237.5 0 0 1 130.5,258 L170,190 Z"
                fill={getZoneFill('4')}
                stroke={getZoneStroke('4')}
                strokeWidth="1"
                strokeOpacity="0.85"
                cursor="pointer"
                onMouseEnter={() => setHoveredZone('4')}
                onMouseLeave={() => setHoveredZone(null)}
              />
              <path
                data-zone="right-baseline-mid"
                data-zone-id="5"
                d="M330,0 L470,0 L470,142 L330,142 Z"
                fill={getZoneFill('5')}
                stroke={getZoneStroke('5')}
                strokeWidth="1"
                strokeOpacity="0.85"
                cursor="pointer"
                onMouseEnter={() => setHoveredZone('5')}
                onMouseLeave={() => setHoveredZone(null)}
              />
              <path
                data-zone="left-elbow-mid"
                data-zone-id="6"
                d="M170,142 L170,190 L130.5,258 A237.5,237.5 0 0 1 30,142 L170,142 Z"
                fill={getZoneFill('6')}
                stroke={getZoneStroke('6')}
                strokeWidth="1"
                strokeOpacity="0.85"
                cursor="pointer"
                onMouseEnter={() => setHoveredZone('6')}
                onMouseLeave={() => setHoveredZone(null)}
              />
              <path
                data-zone="right-elbow-mid"
                data-zone-id="7"
                d="M330,142 L330,190 L369.5,258 A237.5,237.5 0 0 0 470,142 L330,142 Z"
                fill={getZoneFill('7')}
                stroke={getZoneStroke('7')}
                strokeWidth="1"
                strokeOpacity="0.85"
                cursor="pointer"
                onMouseEnter={() => setHoveredZone('7')}
                onMouseLeave={() => setHoveredZone(null)}
              />
              <path
                data-zone="left-wing-3"
                data-zone-id="8"
                d="M0,142 L30,142 A237.5,237.5 0 0 0 130.5,258 L82.8,340 L0,340 Z"
                fill={getZoneFill('8')}
                stroke={getZoneStroke('8')}
                strokeWidth="1"
                strokeOpacity="0.85"
                cursor="pointer"
                onMouseEnter={() => setHoveredZone('8')}
                onMouseLeave={() => setHoveredZone(null)}
              />
              <path
                data-zone="top-key-3"
                data-zone-id="9"
                d="M130.5,258 A237.5,237.5 0 0 0 369.5,258 L417.2,340 L82.8,340 Z"
                fill={getZoneFill('9')}
                stroke={getZoneStroke('9')}
                strokeWidth="1"
                strokeOpacity="0.85"
                cursor="pointer"
                onMouseEnter={() => setHoveredZone('9')}
                onMouseLeave={() => setHoveredZone(null)}
              />
              <path
                data-zone="right-wing-3"
                data-zone-id="10"
                d="M500,142 L470,142 A237.5,237.5 0 0 1 369.5,258 L417.2,340 L500,340 Z"
                fill={getZoneFill('10')}
                stroke={getZoneStroke('10')}
                strokeWidth="1"
                strokeOpacity="0.85"
                cursor="pointer"
                onMouseEnter={() => setHoveredZone('10')}
                onMouseLeave={() => setHoveredZone(null)}
              />
              <path
                data-zone="left-corner-3"
                data-zone-id="11"
                d="M0,0 L30,0 L30,142 L0,142 Z"
                fill={getZoneFill('11')}
                stroke={getZoneStroke('11')}
                strokeWidth="1"
                strokeOpacity="0.85"
                cursor="pointer"
                onMouseEnter={() => setHoveredZone('11')}
                onMouseLeave={() => setHoveredZone(null)}
              />
              <path
                data-zone="right-corner-3"
                data-zone-id="12"
                d="M470,0 L500,0 L500,142 L470,142 Z"
                fill={getZoneFill('12')}
                stroke={getZoneStroke('12')}
                strokeWidth="1"
                strokeOpacity="0.85"
                cursor="pointer"
                onMouseEnter={() => setHoveredZone('12')}
                onMouseLeave={() => setHoveredZone(null)}
              />
              <path
                data-zone="deep-3-logo"
                data-zone-id="13"
                d="M0,340 L500,340 L500,470 L0,470 Z"
                fill={getZoneFill('13')}
                stroke={getZoneStroke('13')}
                strokeWidth="1"
                strokeOpacity="0.85"
                cursor="pointer"
                onMouseEnter={() => setHoveredZone('13')}
                onMouseLeave={() => setHoveredZone(null)}
              />
            </g>

            <g className="labelsNBA">
              <text className="zone-label" x="250" y="30" fontSize="10.5px" fontWeight="600" fill="#d8f9ff" textAnchor="middle" opacity="0.85">RA</text>
              <text className="zone-label" x="250" y="170" fontSize="10.5px" fontWeight="600" fill="#d8f9ff" textAnchor="middle" opacity="0.85">PAINT</text>
              <text className="zone-label" x="100" y="70" fontSize="10.5px" fontWeight="600" fill="#d8f9ff" textAnchor="middle" opacity="0.85">L BASE</text>
              <text className="zone-label" x="400" y="70" fontSize="10.5px" fontWeight="600" fill="#d8f9ff" textAnchor="middle" opacity="0.85">R BASE</text>
              <text className="zone-label" x="250" y="215" fontSize="10.5px" fontWeight="600" fill="#d8f9ff" textAnchor="middle" opacity="0.85">CTR MID</text>
              <text className="zone-label" x="90" y="210" fontSize="10.5px" fontWeight="600" fill="#d8f9ff" textAnchor="middle" opacity="0.85">L ELBOW</text>
              <text className="zone-label" x="410" y="210" fontSize="10.5px" fontWeight="600" fill="#d8f9ff" textAnchor="middle" opacity="0.85">R ELBOW</text>
              <text className="zone-label" x="15" y="70" fontSize="10.5px" fontWeight="600" fill="#d8f9ff" textAnchor="middle" opacity="0.85">L CNR3</text>
              <text className="zone-label" x="485" y="70" fontSize="10.5px" fontWeight="600" fill="#d8f9ff" textAnchor="middle" opacity="0.85">R CNR3</text>
              <text className="zone-label" x="45" y="270" fontSize="10.5px" fontWeight="600" fill="#d8f9ff" textAnchor="middle" opacity="0.85">L WING</text>
              <text className="zone-label" x="455" y="270" fontSize="10.5px" fontWeight="600" fill="#d8f9ff" textAnchor="middle" opacity="0.85">R WING</text>
              <text className="zone-label" x="250" y="300" fontSize="10.5px" fontWeight="600" fill="#d8f9ff" textAnchor="middle" opacity="0.85">TOP KEY</text>
              <text className="zone-label" x="250" y="410" fontSize="10.5px" fontWeight="600" fill="#d8f9ff" textAnchor="middle" opacity="0.85">DEEP / LOGO</text>
            </g>
          </svg>
        ) : (
          <svg viewBox="0 0 500 470" xmlns="http://www.w3.org/2000/svg" style={{ width: '100%', height: 'auto', display: 'block' }}>
            <defs>
              <filter id="cyanGlowHS" x="-50%" y="-50%" width="200%" height="200%">
                <feGaussianBlur stdDeviation="2.2" result="blur"/>
                <feMerge>
                  <feMergeNode in="blur"/>
                  <feMergeNode in="SourceGraphic"/>
                </feMerge>
              </filter>
            </defs>

            <rect fill="#0d0d14" x="0" y="0" width="500" height="470"></rect>

            <rect className="court-line" x="1" y="1" width="498" height="468" fill="none" stroke="#00ffff" strokeWidth="1.6" opacity="0.85" filter="url(#cyanGlowHS)"></rect>
            <rect className="court-line" x="190" y="0" width="120" height="190" fill="none" stroke="#00ffff" strokeWidth="1.6" opacity="0.85" filter="url(#cyanGlowHS)"></rect>
            <circle className="court-line" cx="250" cy="190" r="60" fill="none" stroke="#00ffff" strokeWidth="1.6" strokeDasharray="3 4" opacity="0.85" filter="url(#cyanGlowHS)"></circle>
            <circle className="court-line" cx="250" cy="52.5" r="7.5" fill="none" stroke="#00ffff" strokeWidth="1.6" opacity="0.85" filter="url(#cyanGlowHS)"></circle>
            <line className="court-line" x1="220" y1="40" x2="280" y2="40" stroke="#00ffff" strokeWidth="1.6" opacity="0.85" filter="url(#cyanGlowHS)"></line>
            <line className="court-line" x1="0" y1="470" x2="500" y2="470" stroke="#00ffff" strokeWidth="1.6" strokeDasharray="3 4" opacity="0.85" filter="url(#cyanGlowHS)"></line>
            <circle className="court-line" cx="250" cy="470" r="45" fill="none" stroke="#00ffff" strokeWidth="1.6" strokeDasharray="3 4" opacity="0.85" filter="url(#cyanGlowHS)"></circle>

            <g id="zonesHS">
              <path
                data-zone="restricted-area"
                data-zone-id="1"
                d="M210,0 L210,52.5 A40,40 0 0 1 290,52.5 L290,0 Z"
                fill={getZoneFill('1')}
                stroke={getZoneStroke('1')}
                strokeWidth="1"
                strokeOpacity="0.85"
                cursor="pointer"
                onMouseEnter={() => setHoveredZone('1')}
                onMouseLeave={() => setHoveredZone(null)}
              />
              <path
                data-zone="paint"
                data-zone-id="2"
                d="M190,0 L310,0 L310,190 L190,190 Z"
                fill={getZoneFill('2')}
                stroke={getZoneStroke('2')}
                strokeWidth="1"
                strokeOpacity="0.85"
                cursor="pointer"
                onMouseEnter={() => setHoveredZone('2')}
                onMouseLeave={() => setHoveredZone(null)}
              />
              <path
                data-zone="left-baseline-mid"
                data-zone-id="3"
                d="M59.6,0 L190,0 L190,142 L73.9,142 A197.5,197.5 0 0 1 59.6,0 Z"
                fill={getZoneFill('3')}
                stroke={getZoneStroke('3')}
                strokeWidth="1"
                strokeOpacity="0.85"
                cursor="pointer"
                onMouseEnter={() => setHoveredZone('3')}
                onMouseLeave={() => setHoveredZone(null)}
              />
              <path
                data-zone="center-mid"
                data-zone-id="4"
                d="M190,190 L310,190 L329,233.5 A197.5,197.5 0 0 1 171,233.5 L190,190 Z"
                fill={getZoneFill('4')}
                stroke={getZoneStroke('4')}
                strokeWidth="1"
                strokeOpacity="0.85"
                cursor="pointer"
                onMouseEnter={() => setHoveredZone('4')}
                onMouseLeave={() => setHoveredZone(null)}
              />
              <path
                data-zone="right-baseline-mid"
                data-zone-id="5"
                d="M440.4,0 L310,0 L310,142 L426.1,142 A197.5,197.5 0 0 0 440.4,0 Z"
                fill={getZoneFill('5')}
                stroke={getZoneStroke('5')}
                strokeWidth="1"
                strokeOpacity="0.85"
                cursor="pointer"
                onMouseEnter={() => setHoveredZone('5')}
                onMouseLeave={() => setHoveredZone(null)}
              />
              <path
                data-zone="left-elbow-mid"
                data-zone-id="6"
                d="M190,142 L190,190 L171,233.5 A197.5,197.5 0 0 1 73.9,142 L190,142 Z"
                fill={getZoneFill('6')}
                stroke={getZoneStroke('6')}
                strokeWidth="1"
                strokeOpacity="0.85"
                cursor="pointer"
                onMouseEnter={() => setHoveredZone('6')}
                onMouseLeave={() => setHoveredZone(null)}
              />
              <path
                data-zone="right-elbow-mid"
                data-zone-id="7"
                d="M310,142 L310,190 L329,233.5 A197.5,197.5 0 0 0 426.1,142 L310,142 Z"
                fill={getZoneFill('7')}
                stroke={getZoneStroke('7')}
                strokeWidth="1"
                strokeOpacity="0.85"
                cursor="pointer"
                onMouseEnter={() => setHoveredZone('7')}
                onMouseLeave={() => setHoveredZone(null)}
              />
              <path
                data-zone="left-wing-3"
                data-zone-id="8"
                d="M0,142 L73.9,142 A197.5,197.5 0 0 0 171,233.5 L124.5,340 L0,340 Z"
                fill={getZoneFill('8')}
                stroke={getZoneStroke('8')}
                strokeWidth="1"
                strokeOpacity="0.85"
                cursor="pointer"
                onMouseEnter={() => setHoveredZone('8')}
                onMouseLeave={() => setHoveredZone(null)}
              />
              <path
                data-zone="top-key-3"
                data-zone-id="9"
                d="M171,233.5 A197.5,197.5 0 0 0 329,233.5 L375.5,340 L124.5,340 Z"
                fill={getZoneFill('9')}
                stroke={getZoneStroke('9')}
                strokeWidth="1"
                strokeOpacity="0.85"
                cursor="pointer"
                onMouseEnter={() => setHoveredZone('9')}
                onMouseLeave={() => setHoveredZone(null)}
              />
              <path
                data-zone="right-wing-3"
                data-zone-id="10"
                d="M500,142 L426.1,142 A197.5,197.5 0 0 1 329,233.5 L375.5,340 L500,340 Z"
                fill={getZoneFill('10')}
                stroke={getZoneStroke('10')}
                strokeWidth="1"
                strokeOpacity="0.85"
                cursor="pointer"
                onMouseEnter={() => setHoveredZone('10')}
                onMouseLeave={() => setHoveredZone(null)}
              />
              <path
                data-zone="left-corner-3"
                data-zone-id="11"
                d="M0,0 L59.6,0 A197.5,197.5 0 0 0 73.9,142 L0,142 Z"
                fill={getZoneFill('11')}
                stroke={getZoneStroke('11')}
                strokeWidth="1"
                strokeOpacity="0.85"
                cursor="pointer"
                onMouseEnter={() => setHoveredZone('11')}
                onMouseLeave={() => setHoveredZone(null)}
              />
              <path
                data-zone="right-corner-3"
                data-zone-id="12"
                d="M500,0 L440.4,0 A197.5,197.5 0 0 1 426.1,142 L500,142 Z"
                fill={getZoneFill('12')}
                stroke={getZoneStroke('12')}
                strokeWidth="1"
                strokeOpacity="0.85"
                cursor="pointer"
                onMouseEnter={() => setHoveredZone('12')}
                onMouseLeave={() => setHoveredZone(null)}
              />
              <path
                data-zone="deep-3-logo"
                data-zone-id="13"
                d="M0,340 L500,340 L500,470 L0,470 Z"
                fill={getZoneFill('13')}
                stroke={getZoneStroke('13')}
                strokeWidth="1"
                strokeOpacity="0.85"
                cursor="pointer"
                onMouseEnter={() => setHoveredZone('13')}
                onMouseLeave={() => setHoveredZone(null)}
              />
            </g>

            <g className="labelsHS">
              <text className="zone-label" x="250" y="28" fontSize="8.5px" fontWeight="600" fill="#d8f9ff" textAnchor="middle" opacity="0.85">RA</text>
              <text className="zone-label" x="250" y="168" fontSize="8.5px" fontWeight="600" fill="#d8f9ff" textAnchor="middle" opacity="0.85">PAINT</text>
              <text className="zone-label" x="125" y="42" fontSize="8.5px" fontWeight="600" fill="#d8f9ff" textAnchor="middle" opacity="0.85">L BASE</text>
              <text className="zone-label" x="375" y="42" fontSize="8.5px" fontWeight="600" fill="#d8f9ff" textAnchor="middle" opacity="0.85">R BASE</text>
              <text className="zone-label" x="250" y="207" fontSize="8.5px" fontWeight="600" fill="#d8f9ff" textAnchor="middle" opacity="0.85">CTR MID</text>
              <text className="zone-label" x="140" y="153" fontSize="8.5px" fontWeight="600" fill="#d8f9ff" textAnchor="middle" opacity="0.85">L ELBOW</text>
              <text className="zone-label" x="360" y="153" fontSize="8.5px" fontWeight="600" fill="#d8f9ff" textAnchor="middle" opacity="0.85">R ELBOW</text>
              <text className="zone-label" x="30" y="53" fontSize="8.5px" fontWeight="600" fill="#d8f9ff" textAnchor="middle" opacity="0.85">L CNR3</text>
              <text className="zone-label" x="470" y="53" fontSize="8.5px" fontWeight="600" fill="#d8f9ff" textAnchor="middle" opacity="0.85">R CNR3</text>
              <text className="zone-label" x="65" y="243" fontSize="8.5px" fontWeight="600" fill="#d8f9ff" textAnchor="middle" opacity="0.85">L WING</text>
              <text className="zone-label" x="435" y="243" fontSize="8.5px" fontWeight="600" fill="#d8f9ff" textAnchor="middle" opacity="0.85">R WING</text>
              <text className="zone-label" x="250" y="296" fontSize="8.5px" fontWeight="600" fill="#d8f9ff" textAnchor="middle" opacity="0.85">TOP KEY</text>
              <text className="zone-label" x="250" y="408" fontSize="8.5px" fontWeight="600" fill="#d8f9ff" textAnchor="middle" opacity="0.85">DEEP / LOGO</text>
            </g>
          </svg>
        )}
      </div>

      {hoveredZone && zoneStats[hoveredZone] && (
        <div style={{
          marginTop: '12px',
          padding: '10px',
          background: 'linear-gradient(135deg, #12121a 0%, #1a0f1f 100%)',
          border: '1px solid #00ffff',
          borderRadius: '6px',
          textAlign: 'center',
          color: '#d8f9ff',
          fontSize: '13px',
          boxShadow: '0 0 12px rgba(0,255,255,0.3)'
        }}>
          <strong>{ZONE_NAMES[hoveredZone]}</strong>:{' '}
          {zoneStats[hoveredZone].makes}/{zoneStats[hoveredZone].attempts}{' '}
          ({zoneStats[hoveredZone].percentage.toFixed(1)}%)
        </div>
      )}

      <div style={{
        marginTop: '12px',
        display: 'flex',
        gap: '16px',
        fontSize: '12px',
        justifyContent: 'center',
        color: '#6f8f95'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span style={{
            display: 'inline-block',
            width: '12px',
            height: '12px',
            borderRadius: '3px',
            background: 'rgba(0,255,200,0.38)',
            border: '1px solid #00ffc8'
          }}></span>
          <span>50%+</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span style={{
            display: 'inline-block',
            width: '12px',
            height: '12px',
            borderRadius: '3px',
            background: 'rgba(255,165,0,0.28)',
            border: '1px solid #ffa500'
          }}></span>
          <span>35-49%</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span style={{
            display: 'inline-block',
            width: '12px',
            height: '12px',
            borderRadius: '3px',
            background: 'rgba(255,46,106,0.28)',
            border: '1px solid #ff2e6a'
          }}></span>
          <span>&lt;35%</span>
        </div>
      </div>
    </div>
  );
}

export default ZoneShotChart;
