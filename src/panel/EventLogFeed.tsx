import React from 'react';
import { GameEvent } from '../types';

interface EventLogFeedProps {
  events: GameEvent[];
  maxVisible?: number;
}

function EventLogFeed({ events, maxVisible = 8 }: EventLogFeedProps) {
  if (events.length === 0) {
    return (
      <div style={{
        margin: '10px',
        padding: '12px',
        background: 'var(--bw-bg-panel)',
        border: '2px dashed var(--bw-purple-dark)',
        color: 'var(--bw-text-dim)',
        fontSize: '14px',
        textAlign: 'center'
      }}>
        No events logged yet.
      </div>
    );
  }

  // Show last N events
  const recentEvents = events.slice(-maxVisible);

  return (
    <div style={{
      margin: '10px',
      background: 'var(--bw-bg-panel)',
      border: '2px dashed var(--bw-purple-dark)',
      maxHeight: '200px',
      overflowY: 'auto'
    }}>
      {recentEvents.map((event, index) => (
        <div
          key={event.id}
          style={{
            padding: '8px 10px',
            borderBottom: index < recentEvents.length - 1 ? '1px solid #201c2c' : 'none',
            fontSize: '14px',
            color: 'var(--bw-text)',
            fontFamily: 'var(--bw-font-body)'
          }}
        >
          <span style={{ color: 'var(--bw-gold)' }}>
            [{formatTimestamp(event.timestampSec)}]
          </span>
          {' '}
          <span style={{ color: 'var(--bw-cyan)' }}>
            {event.eventType}
          </span>
          {event.comment && (
            <span style={{ color: 'var(--bw-text-dim)' }}>
              {' — ' + event.comment}
            </span>
          )}
        </div>
      ))}
    </div>
  );
}

function formatTimestamp(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

export default EventLogFeed;
