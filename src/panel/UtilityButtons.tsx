import React from 'react';

interface UtilityButtonsProps {
  onTimeout: () => void;
  onPeriod: () => void;
  onUndo: () => void;
  canUndo: boolean;
}

function UtilityButtons({ onTimeout, onPeriod, onUndo, canUndo }: UtilityButtonsProps) {
  return (
    <div style={{
      display: 'flex',
      gap: '8px',
      padding: '0 14px 14px'
    }}>
      <button
        onClick={onTimeout}
        style={{
          flex: 1,
          fontFamily: 'var(--bw-font-display)',
          fontSize: '9px',
          padding: '10px 4px',
          background: '#23202f',
          color: 'var(--bw-text-dim)',
          border: '2px solid var(--bw-purple-dark)',
          cursor: 'pointer'
        }}
      >
        TIMEOUT
      </button>

      <button
        onClick={onPeriod}
        style={{
          flex: 1,
          fontFamily: 'var(--bw-font-display)',
          fontSize: '9px',
          padding: '10px 4px',
          background: '#23202f',
          color: 'var(--bw-text-dim)',
          border: '2px solid var(--bw-purple-dark)',
          cursor: 'pointer'
        }}
      >
        PERIOD
      </button>

      <button
        onClick={onUndo}
        disabled={!canUndo}
        style={{
          flex: 1,
          fontFamily: 'var(--bw-font-display)',
          fontSize: '9px',
          padding: '10px 4px',
          background: canUndo ? '#23202f' : '#1a1824',
          color: canUndo ? 'var(--bw-text-dim)' : '#4a4560',
          border: '2px solid var(--bw-purple-dark)',
          cursor: canUndo ? 'pointer' : 'not-allowed'
        }}
      >
        UNDO
      </button>
    </div>
  );
}

export default UtilityButtons;
