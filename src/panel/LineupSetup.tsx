import React, { useState } from 'react';
import { Player } from '../types';

interface LineupSetupProps {
  activeRoster: Player[];
  initialLineup: string[];
  initialCourtType: 'nba' | 'highschool';
  onConfirm: (lineupIds: string[], courtType: 'nba' | 'highschool') => void;
  onBack: () => void;
}

function LineupSetup({ activeRoster, initialLineup, initialCourtType, onConfirm, onBack }: LineupSetupProps) {
  const [lineupIds, setLineupIds] = useState<string[]>(initialLineup);
  const [courtType, setCourtType] = useState<'nba' | 'highschool'>(initialCourtType);

  const toggleStarter = (playerId: string) => {
    if (lineupIds.includes(playerId)) {
      setLineupIds(lineupIds.filter(id => id !== playerId));
    } else {
      if (lineupIds.length >= 5) return;
      setLineupIds([...lineupIds, playerId]);
    }
  };

  const canProceed = lineupIds.length === 5;

  return (
    <div style={{ padding: '14px' }}>
      <div style={{
        fontFamily: 'var(--bw-font-display)',
        fontSize: '10px',
        color: 'var(--bw-gold)',
        margin: '4px 0 10px'
      }}>
        COURT DIMENSIONS
      </div>

      <div style={{ display: 'flex', gap: 0, marginBottom: '16px' }}>
        <button
          onClick={() => setCourtType('nba')}
          style={{
            flex: 1,
            fontFamily: 'var(--bw-font-display)',
            fontSize: '10px',
            padding: '12px 4px',
            border: '3px solid #000',
            cursor: 'pointer',
            background: courtType === 'nba' ? 'var(--bw-success)' : '#23202f',
            color: courtType === 'nba' ? '#06280f' : 'var(--bw-text-dim)'
          }}
        >
          NBA
        </button>
        <button
          onClick={() => setCourtType('highschool')}
          style={{
            flex: 1,
            fontFamily: 'var(--bw-font-display)',
            fontSize: '10px',
            padding: '12px 4px',
            border: '3px solid #000',
            cursor: 'pointer',
            background: courtType === 'highschool' ? 'var(--bw-success)' : '#23202f',
            color: courtType === 'highschool' ? '#06280f' : 'var(--bw-text-dim)'
          }}
        >
          HIGH SCHOOL
        </button>
      </div>

      <div style={{
        fontFamily: 'var(--bw-font-display)',
        fontSize: '10px',
        color: 'var(--bw-gold)',
        margin: '4px 0 10px'
      }}>
        TAP 5 STARTERS ({lineupIds.length}/5 selected)
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr 1fr',
        gap: '10px',
        marginBottom: '16px'
      }}>
        {activeRoster.map(player => {
          const isSelected = lineupIds.includes(player.id);
          return (
            <button
              key={player.id}
              onClick={() => toggleStarter(player.id)}
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
        onClick={() => onConfirm(lineupIds, courtType)}
        disabled={!canProceed}
        className="bw-btn"
        style={{
          width: '100%',
          padding: '14px',
          marginBottom: '8px'
        }}
      >
        START LOGGING
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

export default LineupSetup;
