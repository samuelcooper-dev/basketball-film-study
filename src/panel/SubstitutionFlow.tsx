import React, { useState } from 'react';
import { Player } from '../types';

interface SubstitutionFlowProps {
  lineup: Player[];
  bench: Player[];
  onConfirm: (outPlayerIds: string[], inPlayerIds: string[]) => void;
  onCancel: () => void;
}

function SubstitutionFlow({ lineup, bench, onConfirm, onCancel }: SubstitutionFlowProps) {
  const [phase, setPhase] = useState<'out' | 'in'>('out');
  const [outPlayerIds, setOutPlayerIds] = useState<string[]>([]);
  const [inPlayerIds, setInPlayerIds] = useState<string[]>([]);

  const toggleOut = (playerId: string) => {
    if (outPlayerIds.includes(playerId)) {
      setOutPlayerIds(outPlayerIds.filter(id => id !== playerId));
    } else {
      setOutPlayerIds([...outPlayerIds, playerId]);
    }
  };

  const toggleIn = (playerId: string) => {
    if (inPlayerIds.includes(playerId)) {
      setInPlayerIds(inPlayerIds.filter(id => id !== playerId));
    } else {
      if (inPlayerIds.length >= outPlayerIds.length) return;
      setInPlayerIds([...inPlayerIds, playerId]);
    }
  };

  const handleNextToIn = () => {
    if (outPlayerIds.length === 0) return;
    setPhase('in');
  };

  const handleConfirm = () => {
    if (outPlayerIds.length !== inPlayerIds.length) return;
    onConfirm(outPlayerIds, inPlayerIds);
  };

  if (phase === 'out') {
    return (
      <div style={{ padding: '14px' }}>
        <div style={{
          fontFamily: 'var(--bw-font-display)',
          fontSize: '10px',
          color: 'var(--bw-gold)',
          margin: '4px 0 10px'
        }}>
          TAP PLAYER(S) COMING OUT
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr 1fr',
          gap: '10px',
          marginBottom: '16px'
        }}>
          {lineup.map(player => {
            const isSelected = outPlayerIds.includes(player.id);
            return (
              <button
                key={player.id}
                onClick={() => toggleOut(player.id)}
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
          onClick={handleNextToIn}
          disabled={outPlayerIds.length === 0}
          className="bw-btn"
          style={{
            width: '100%',
            padding: '14px',
            marginBottom: '8px'
          }}
        >
          NEXT
        </button>

        <button
          onClick={onCancel}
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
          CANCEL
        </button>
      </div>
    );
  }

  // Phase: 'in'
  return (
    <div style={{ padding: '14px' }}>
      <div style={{
        fontFamily: 'var(--bw-font-display)',
        fontSize: '10px',
        color: 'var(--bw-gold)',
        margin: '4px 0 10px'
      }}>
        TAP {outPlayerIds.length} REPLACEMENT(S)
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr 1fr',
        gap: '10px',
        marginBottom: '16px'
      }}>
        {bench.map(player => {
          const isSelected = inPlayerIds.includes(player.id);
          return (
            <button
              key={player.id}
              onClick={() => toggleIn(player.id)}
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
        onClick={handleConfirm}
        disabled={inPlayerIds.length !== outPlayerIds.length}
        className="bw-btn"
        style={{
          width: '100%',
          padding: '14px',
          marginBottom: '8px'
        }}
      >
        CONFIRM SUB
      </button>

      <button
        onClick={() => setPhase('out')}
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

export default SubstitutionFlow;
