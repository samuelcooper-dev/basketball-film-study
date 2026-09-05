import React from 'react';
import { EventType } from '../types';

interface EventButtonsProps {
  onEventClick: (eventType: EventType) => void;
}

const EVENT_GROUPS = {
  'Scoring (Ours)': [
    { type: '2PT_MAKE' as EventType, label: '2PT Make', variant: 'bw-2pt' },
    { type: '2PT_MISS' as EventType, label: '2PT Miss', variant: 'bw-miss' },
    { type: '3PT_MAKE' as EventType, label: '3PT Make', variant: 'bw-3pt' },
    { type: '3PT_MISS' as EventType, label: '3PT Miss', variant: 'bw-miss' },
    { type: 'FT_MAKE' as EventType, label: 'FT Make', variant: 'bw-2pt' },
    { type: 'FT_MISS' as EventType, label: 'FT Miss', variant: 'bw-miss' }
  ],
  'Ball Movement / Defense': [
    { type: 'ASSIST' as EventType, label: 'Assist', variant: 'bw-ast' },
    { type: 'REB_OFF' as EventType, label: 'Reb (Off)', variant: 'bw-reb' },
    { type: 'REB_DEF' as EventType, label: 'Reb (Def)', variant: 'bw-reb' },
    { type: 'STEAL' as EventType, label: 'Steal', variant: 'bw-3pt' },
    { type: 'BLOCK' as EventType, label: 'Block', variant: 'bw-3pt' },
    { type: 'TURNOVER' as EventType, label: 'Turnover', variant: 'bw-tov' },
    { type: 'FOUL' as EventType, label: 'Foul', variant: 'bw-miss' }
  ],
  'Advanced': [
    { type: 'DEFLECTION' as EventType, label: 'Deflection', variant: 'bw-3pt' },
    { type: 'CHARGE_TAKEN' as EventType, label: 'Charge', variant: 'bw-reb' },
    { type: 'BLOWN_COVERAGE' as EventType, label: 'Blown Cov', variant: 'bw-miss' },
    { type: 'HELP_D_BREAKDOWN' as EventType, label: 'Help D Fail', variant: 'bw-miss' }
  ],
  'Opponent': [
    { type: 'OPP_SCORE_2' as EventType, label: 'Opp 2PT', variant: '' },
    { type: 'OPP_SCORE_3' as EventType, label: 'Opp 3PT', variant: '' },
    { type: 'OPP_SCORE_FT' as EventType, label: 'Opp FT', variant: '' }
  ],
  'Other': [
    { type: 'CUSTOM' as EventType, label: '+ Custom', variant: '' }
  ]
};

function EventButtons({ onEventClick }: EventButtonsProps) {
  return (
    <div style={{ marginBottom: '16px' }}>
      <div style={{
        fontFamily: 'var(--bw-font-display)',
        fontSize: '10px',
        marginBottom: '12px',
        color: 'var(--bw-gold)',
        textTransform: 'uppercase',
        letterSpacing: '1px'
      }}>
        Log Event
      </div>

      {Object.entries(EVENT_GROUPS).map(([groupName, buttons]) => (
        <div key={groupName} style={{ marginBottom: '16px' }}>
          <div style={{
            fontFamily: 'var(--bw-font-body)',
            fontSize: '14px',
            color: 'var(--bw-text-dim)',
            marginBottom: '8px',
            textTransform: 'uppercase'
          }}>
            {groupName}
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
            {buttons.map(btn => (
              <button
                key={btn.type}
                onClick={() => onEventClick(btn.type)}
                className={`bw-btn ${btn.variant}`}
              >
                {btn.label}
              </button>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

export default EventButtons;
