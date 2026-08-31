import React from 'react';
import { Roster } from '../types';

interface OnCourtToggleProps {
  roster: Roster;
  onCourtPlayerIds: string[];
  onToggle: (playerId: string) => void;
}

function OnCourtToggle({ roster, onCourtPlayerIds, onToggle }: OnCourtToggleProps) {
  return (
    <div style={{ marginBottom: '16px' }}>
      <div style={{ fontSize: '12px', fontWeight: 'bold', marginBottom: '6px', color: '#666' }}>
        On Court ({onCourtPlayerIds.length}/5)
      </div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
        {roster.players.map(player => {
          const isOnCourt = onCourtPlayerIds.includes(player.id);
          return (
            <button
              key={player.id}
              onClick={() => onToggle(player.id)}
              style={{
                padding: '6px 10px',
                fontSize: '12px',
                border: '1px solid #ccc',
                borderRadius: '4px',
                cursor: 'pointer',
                background: isOnCourt ? '#4CAF50' : '#fff',
                color: isOnCourt ? '#fff' : '#333',
                fontWeight: isOnCourt ? 'bold' : 'normal'
              }}
            >
              #{player.number} {player.name}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export default OnCourtToggle;
