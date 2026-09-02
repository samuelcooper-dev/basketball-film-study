import React from 'react';
import { CourtZone } from '../types';
import { ZONE_CENTERS } from './CourtDiagram';

interface MiniCourtProps {
  zone?: CourtZone;
  eventType?: string;
}

function MiniCourt({ zone, eventType }: MiniCourtProps) {
  if (!zone || zone === 'unknown') {
    return null;
  }

  const center = ZONE_CENTERS[zone];

  // Determine marker color based on event type
  let fill = '#3498db';
  if (eventType === '2PT_MAKE' || eventType === '3PT_MAKE') {
    fill = '#27ae60'; // green
  } else if (eventType === '2PT_MISS' || eventType === '3PT_MISS') {
    fill = '#e74c3c'; // red
  } else if (eventType === 'TURNOVER') {
    fill = '#f39c12'; // orange
  } else if (eventType === 'STEAL') {
    fill = '#9b59b6'; // purple
  } else if (eventType === 'BLOCK') {
    fill = '#1abc9c'; // teal
  } else if (eventType === 'FOUL') {
    fill = '#e67e22'; // dark orange
  }

  return (
    <svg
      viewBox="0 0 500 600"
      style={{
        width: '60px',
        height: '72px',
        flexShrink: 0
      }}
    >
      {/* Simplified court background */}
      <rect x="0" y="0" width="500" height="600" fill="#C99869" opacity="0.3" />

      {/* Court outline */}
      <rect x="20" y="20" width="460" height="560" fill="none" stroke="#999" strokeWidth="2" />

      {/* Paint */}
      <rect x="170" y="380" width="160" height="190" fill="none" stroke="#999" strokeWidth="1.5" />

      {/* 3-point arc (simplified) */}
      <path
        d="M 63 570 L 63 495 Q 250 160, 437 495 L 437 570"
        fill="none"
        stroke="#999"
        strokeWidth="1.5"
      />

      {/* Basket */}
      <circle cx="250" cy="567" r="5" fill="#999" />

      {/* Event marker */}
      <circle cx={center.x} cy={center.y} r="12" fill={fill} stroke="#fff" strokeWidth="2" opacity="0.9" />
    </svg>
  );
}

export default MiniCourt;
