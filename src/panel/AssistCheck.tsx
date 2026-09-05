import React, { useState } from 'react';
import { Player } from '../types';

interface AssistCheckProps {
  lineup: Player[];
  shooterId: string;
  onConfirm: (assisterId: string | null) => void;
  onBack: () => void;
}

function AssistCheck({ lineup, shooterId, onConfirm, onBack }: AssistCheckProps) {
  const [phase, setPhase] = useState<'question' | 'select'>('question');
  const [selectedAssisterId, setSelectedAssisterId] = useState<string | null>(null);

  const eligibleAssisters = lineup.filter(p => p.id !== shooterId);

  const handleYes = () => {
    setPhase('select');
  };

  const handleNo = () => {
    onConfirm(null);
  };

  const handleSelectAssister = (playerId: string) => {
    setSelectedAssisterId(playerId);
  };

  const handleConfirmAssist = () => {
    if (!selectedAssisterId) return;
    onConfirm(selectedAssisterId);
  };

  if (phase === 'question') {
    return (
      <div style={{ padding: '14px' }}>
        <div style={{
          fontFamily: 'var(--bw-font-display)',
          fontSize: '10px',
          color: 'var(--bw-gold)',
          margin: '4px 0 10px'
        }}>
          WAS THIS ASSISTED?
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '10px',
          marginBottom: '16px'
        }}>
          <button
            onClick={handleYes}
            className="bw-btn bw-2pt"
            style={{
              padding: '20px 8px'
            }}
          >
            YES
          </button>

          <button
            onClick={handleNo}
            className="bw-btn bw-miss"
            style={{
              padding: '20px 8px'
            }}
          >
            NO
          </button>
        </div>

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

  // Phase: 'select'
  return (
    <div style={{ padding: '14px' }}>
      <div style={{
        fontFamily: 'var(--bw-font-display)',
        fontSize: '10px',
        color: 'var(--bw-gold)',
        margin: '4px 0 10px'
      }}>
        SELECT ASSISTER
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr 1fr',
        gap: '10px',
        marginBottom: '16px'
      }}>
        {eligibleAssisters.map(player => {
          const isSelected = selectedAssisterId === player.id;
          return (
            <button
              key={player.id}
              onClick={() => handleSelectAssister(player.id)}
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
        onClick={handleConfirmAssist}
        disabled={!selectedAssisterId}
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
        onClick={() => setPhase('question')}
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

export default AssistCheck;
