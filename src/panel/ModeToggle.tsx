import React from 'react';

interface ModeToggleProps {
  mode: 'offense' | 'defense';
  onModeChange: (mode: 'offense' | 'defense') => void;
}

function ModeToggle({ mode, onModeChange }: ModeToggleProps) {
  return (
    <div style={{ display: 'flex', gap: 0, margin: '10px' }}>
      <button
        onClick={() => onModeChange('offense')}
        style={{
          flex: 1,
          fontFamily: 'var(--bw-font-display)',
          fontSize: '10px',
          padding: '12px 4px',
          border: '3px solid #000',
          cursor: 'pointer',
          background: mode === 'offense' ? 'var(--bw-success)' : '#23202f',
          color: mode === 'offense' ? '#06280f' : 'var(--bw-text-dim)'
        }}
      >
        OUR OFFENSE
      </button>
      <button
        onClick={() => onModeChange('defense')}
        style={{
          flex: 1,
          fontFamily: 'var(--bw-font-display)',
          fontSize: '10px',
          padding: '12px 4px',
          border: '3px solid #000',
          cursor: 'pointer',
          background: mode === 'defense' ? 'var(--bw-danger)' : '#23202f',
          color: mode === 'defense' ? '#2a0007' : 'var(--bw-text-dim)'
        }}
      >
        OUR DEFENSE
      </button>
    </div>
  );
}

export default ModeToggle;
