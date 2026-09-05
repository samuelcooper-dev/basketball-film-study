import React, { useState } from 'react';
import { Player } from '../types';

interface ActiveRosterSetupProps {
  masterRoster: Player[];
  initialActive: string[];
  onConfirm: (activePlayerIds: string[]) => void;
  onBack: () => void;
}

function ActiveRosterSetup({ masterRoster, initialActive, onConfirm, onBack }: ActiveRosterSetupProps) {
  const [activePlayerIds, setActivePlayerIds] = useState<string[]>(initialActive);

  const togglePlayer = (playerId: string) => {
    if (activePlayerIds.includes(playerId)) {
      setActivePlayerIds(activePlayerIds.filter(id => id !== playerId));
    } else {
      setActivePlayerIds([...activePlayerIds, playerId]);
    }
  };

  const canProceed = activePlayerIds.length >= 5;

  return (
    <div style={{ padding: '14px' }}>
      <div style={{
        fontFamily: 'var(--bw-font-display)',
        fontSize: '10px',
        color: 'var(--bw-gold)',
        margin: '4px 0 10px'
      }}>
        TAP EVERYONE DRESSED TONIGHT ({activePlayerIds.length} selected)
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr 1fr',
        gap: '10px',
        marginBottom: '16px'
      }}>
        {masterRoster.map(player => {
          const isSelected = activePlayerIds.includes(player.id);
          return (
            <button
              key={player.id}
              onClick={() => togglePlayer(player.id)}
              style={{
                fontFamily: 'var(--bw-font-display)',
                fontSize: '14px',
                padding: '16px 4px',
                background: isSelected ? 'var(--bw-cyan)' : 'var(--bw-bg-panel)',
                border: `3px solid ${isSelected ? '#fff' : 'var(--bw-purple)'}`,
                color: isSelected ? '#04202a' : 'var(--bw-text)',
                cursor: 'pointer'
              }}
            >
              #{player.number}
              <small style={{
                display: 'block',
                fontSize: '8px',
                marginTop: '6px',
                color: isSelected ? '#04202a' : 'var(--bw-text-dim)'
              }}>
                {player.name}
              </small>
            </button>
          );
        })}
      </div>

      <button
        onClick={() => onConfirm(activePlayerIds)}
        disabled={!canProceed}
        className="bw-btn"
        style={{
          width: '100%',
          padding: '14px',
          marginBottom: '8px'
        }}
      >
        CONTINUE
      </button>

      <button
        onClick={onBack}
        style={{
          width: '100%',
          padding: '10px',
          fontFamily: 'var(--bw-font-display)',
          fontSize: '9px',
          background: '#23202f',
          color: 'var(--bw-text-dim)',
          border: '2px solid var(--bw-purple-dark)',
          cursor: 'pointer'
        }}
      >
        ← BACK
      </button>
    </div>
  );
}

export default ActiveRosterSetup;
