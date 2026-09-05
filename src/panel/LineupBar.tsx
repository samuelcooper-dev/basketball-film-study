import React from 'react';
import { Player } from '../types';

interface LineupBarProps {
  lineup: Player[];
  onSubClick: () => void;
}

function LineupBar({ lineup, onSubClick }: LineupBarProps) {
  if (lineup.length < 5) return null;

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: '6px',
      padding: '8px 10px',
      background: '#16131f',
      borderBottom: '3px solid var(--bw-purple)',
      overflowX: 'auto'
    }}>
      <span style={{
        fontSize: '14px',
        color: 'var(--bw-text-dim)',
        flexShrink: 0
      }}>
        ON COURT
      </span>

      {lineup.map(player => (
        <span
          key={player.id}
          style={{
            fontFamily: 'var(--bw-font-display)',
            fontSize: '11px',
            background: 'var(--bw-purple)',
            color: '#fff',
            border: '2px solid #000',
            padding: '6px 8px',
            flexShrink: 0
          }}
        >
          #{player.number}
        </span>
      ))}

      <button
        onClick={onSubClick}
        style={{
          marginLeft: 'auto',
          fontFamily: 'var(--bw-font-display)',
          fontSize: '9px',
          background: 'var(--bw-gold)',
          color: '#0a0a0f',
          border: '2px solid #000',
          padding: '8px 10px',
          cursor: 'pointer',
          flexShrink: 0
        }}
      >
        SUB
      </button>
    </div>
  );
}

export default LineupBar;
