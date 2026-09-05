import React, { useState, useEffect } from 'react';

interface TeamSetupProps {
  initialOurTeam?: string;
  initialOpponent?: string;
  onConfirm: (ourTeam: string, opponent: string) => void;
}

function TeamSetup({ initialOurTeam = '', initialOpponent = '', onConfirm }: TeamSetupProps) {
  const [ourTeam, setOurTeam] = useState(initialOurTeam);
  const [opponent, setOpponent] = useState(initialOpponent);
  const hasSaved = initialOurTeam || initialOpponent;

  const canProceed = ourTeam.trim() && opponent.trim();

  return (
    <div style={{ padding: '14px' }}>
      {hasSaved && (
        <div style={{
          fontSize: '14px',
          color: 'var(--bw-text-dim)',
          marginBottom: '10px'
        }}>
          Loaded from last session — edit anything that changed.
        </div>
      )}

      <div style={{
        fontFamily: 'var(--bw-font-display)',
        fontSize: '10px',
        color: 'var(--bw-gold)',
        margin: '4px 0 10px'
      }}>
        OUR TEAM
      </div>

      <input
        type="text"
        value={ourTeam}
        onChange={(e) => setOurTeam(e.target.value)}
        placeholder="e.g. Timberwolves"
        style={{
          width: '100%',
          padding: '12px',
          fontSize: '18px',
          background: 'var(--bw-bg-panel)',
          color: 'var(--bw-text)',
          border: '2px solid var(--bw-purple)',
          marginBottom: '16px',
          fontFamily: 'var(--bw-font-body)'
        }}
      />

      <div style={{
        fontFamily: 'var(--bw-font-display)',
        fontSize: '10px',
        color: 'var(--bw-gold)',
        margin: '4px 0 10px'
      }}>
        OPPONENT
      </div>

      <input
        type="text"
        value={opponent}
        onChange={(e) => setOpponent(e.target.value)}
        placeholder="e.g. River City Hawks"
        style={{
          width: '100%',
          padding: '12px',
          fontSize: '18px',
          background: 'var(--bw-bg-panel)',
          color: 'var(--bw-text)',
          border: '2px solid var(--bw-purple)',
          marginBottom: '20px',
          fontFamily: 'var(--bw-font-body)'
        }}
      />

      <button
        onClick={() => onConfirm(ourTeam.trim(), opponent.trim())}
        disabled={!canProceed}
        className="bw-btn"
        style={{
          width: '100%',
          padding: '14px'
        }}
      >
        CONTINUE
      </button>
    </div>
  );
}

export default TeamSetup;
