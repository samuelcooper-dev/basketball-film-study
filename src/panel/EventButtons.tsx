import React from 'react';
import { EventType } from '../types';

interface EventButtonsProps {
  onEventClick: (eventType: EventType) => void;
}

const EVENT_GROUPS = {
  'Scoring (Ours)': [
    { type: '2PT_MAKE' as EventType, label: '2PT Make', color: '#4CAF50' },
    { type: '2PT_MISS' as EventType, label: '2PT Miss', color: '#FF9800' },
    { type: '3PT_MAKE' as EventType, label: '3PT Make', color: '#2196F3' },
    { type: '3PT_MISS' as EventType, label: '3PT Miss', color: '#FF9800' },
    { type: 'FT_MAKE' as EventType, label: 'FT Make', color: '#9C27B0' },
    { type: 'FT_MISS' as EventType, label: 'FT Miss', color: '#FF9800' }
  ],
  'Ball Movement / Defense': [
    { type: 'ASSIST' as EventType, label: 'Assist', color: '#009688' },
    { type: 'REB_OFF' as EventType, label: 'Reb (Off)', color: '#795548' },
    { type: 'REB_DEF' as EventType, label: 'Reb (Def)', color: '#795548' },
    { type: 'STEAL' as EventType, label: 'Steal', color: '#3F51B5' },
    { type: 'BLOCK' as EventType, label: 'Block', color: '#3F51B5' },
    { type: 'TURNOVER' as EventType, label: 'Turnover', color: '#f44336' },
    { type: 'FOUL' as EventType, label: 'Foul', color: '#f44336' }
  ],
  'Advanced': [
    { type: 'SCREEN_ASSIST' as EventType, label: 'Screen Ast', color: '#607D8B' },
    { type: 'DEFLECTION' as EventType, label: 'Deflection', color: '#607D8B' },
    { type: 'CHARGE_TAKEN' as EventType, label: 'Charge', color: '#607D8B' },
    { type: 'BLOWN_COVERAGE' as EventType, label: 'Blown Cov', color: '#E91E63' },
    { type: 'HELP_D_BREAKDOWN' as EventType, label: 'Help D Fail', color: '#E91E63' }
  ],
  'Opponent': [
    { type: 'OPP_SCORE_2' as EventType, label: 'Opp 2PT', color: '#9E9E9E' },
    { type: 'OPP_SCORE_3' as EventType, label: 'Opp 3PT', color: '#9E9E9E' },
    { type: 'OPP_SCORE_FT' as EventType, label: 'Opp FT', color: '#9E9E9E' }
  ],
  'Other': [
    { type: 'CUSTOM' as EventType, label: '+ Custom', color: '#000' }
  ]
};

function EventButtons({ onEventClick }: EventButtonsProps) {
  return (
    <div style={{ marginBottom: '16px' }}>
      <div style={{ fontSize: '12px', fontWeight: 'bold', marginBottom: '8px', color: '#666' }}>
        Log Event
      </div>

      {Object.entries(EVENT_GROUPS).map(([groupName, buttons]) => (
        <div key={groupName} style={{ marginBottom: '12px' }}>
          <div style={{ fontSize: '11px', color: '#999', marginBottom: '4px' }}>
            {groupName}
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
            {buttons.map(btn => (
              <button
                key={btn.type}
                onClick={() => onEventClick(btn.type)}
                style={{
                  padding: '6px 10px',
                  fontSize: '11px',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  background: btn.color,
                  color: '#fff',
                  fontWeight: 'bold'
                }}
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
