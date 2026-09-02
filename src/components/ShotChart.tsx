import React from 'react';
import { GameEvent, GameSession } from '../types';
import CourtDiagram from './CourtDiagram';

interface ShotChartProps {
  events: GameEvent[];
  title?: string;
  playerFilter?: string; // Filter by player ID
}

function ShotChart({ events, title, playerFilter }: ShotChartProps) {
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

  const makes = shotEvents.filter(e => e.eventType === '2PT_MAKE' || e.eventType === '3PT_MAKE').length;
  const attempts = shotEvents.length;
  const fgPct = attempts > 0 ? ((makes / attempts) * 100).toFixed(1) : '0.0';

  return (
    <div style={{ marginBottom: '24px' }}>
      {title && (
        <h3 style={{ fontSize: '16px', marginBottom: '8px', fontWeight: '600' }}>
          {title}
        </h3>
      )}
      <div style={{
        background: '#f5f5f5',
        padding: '12px',
        borderRadius: '8px',
        marginBottom: '12px',
        display: 'flex',
        justifyContent: 'space-around',
        fontSize: '14px'
      }}>
        <div>
          <strong>FGM-FGA:</strong> {makes}-{attempts}
        </div>
        <div>
          <strong>FG%:</strong> {fgPct}%
        </div>
      </div>
      <CourtDiagram
        mode="view"
        events={shotEvents}
        showLabels={false}
      />
      <div style={{
        marginTop: '12px',
        display: 'flex',
        gap: '16px',
        fontSize: '13px',
        justifyContent: 'center'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          <span style={{
            display: 'inline-block',
            width: '12px',
            height: '12px',
            borderRadius: '50%',
            background: '#27ae60',
            border: '1px solid #fff'
          }}></span>
          <span>Make</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          <span style={{
            display: 'inline-block',
            width: '12px',
            height: '12px',
            borderRadius: '50%',
            background: '#e74c3c',
            border: '1px solid #fff'
          }}></span>
          <span>Miss</span>
        </div>
      </div>
    </div>
  );
}

export default ShotChart;
