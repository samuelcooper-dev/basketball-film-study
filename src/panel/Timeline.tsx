import React from 'react';
import { GameEvent, Roster } from '../types';
import MiniCourt from '../components/MiniCourt';
import { ZONE_LABELS } from '../components/CourtDiagram';

interface TimelineProps {
  events: GameEvent[];
  roster: Roster;
  onSeek: (timestampSec: number) => void;
  onDelete: (eventId: string) => void;
}

function Timeline({ events, roster, onSeek, onDelete }: TimelineProps) {
  function formatTimestamp(seconds: number): string {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  }

  function getPlayerName(playerId?: string): string {
    if (!playerId) return '';
    const player = roster.players.find(p => p.id === playerId);
    return player ? `#${player.number} ${player.name}` : '';
  }

  const sortedEvents = [...events].sort((a, b) => b.timestampSec - a.timestampSec);

  if (events.length === 0) {
    return (
      <div style={{ marginTop: '16px', fontSize: '12px', color: '#999', textAlign: 'center' }}>
        No events logged yet
      </div>
    );
  }

  return (
    <div style={{ marginTop: '16px' }}>
      <div style={{ fontSize: '12px', fontWeight: 'bold', marginBottom: '8px', color: '#666' }}>
        Timeline ({events.length} events)
      </div>

      <div style={{ maxHeight: '300px', overflowY: 'auto', border: '1px solid #ddd', borderRadius: '4px' }}>
        {sortedEvents.map(event => (
          <div
            key={event.id}
            style={{
              padding: '8px',
              borderBottom: '1px solid #eee',
              fontSize: '12px',
              background: '#fafafa',
              display: 'flex',
              gap: '8px'
            }}
          >
            {/* Mini court diagram */}
            <div style={{ flexShrink: 0 }}>
              <MiniCourt zone={event.location} eventType={event.eventType} />
            </div>

            {/* Event details */}
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                <button
                  onClick={() => onSeek(event.timestampSec)}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#1976d2',
                    cursor: 'pointer',
                    fontWeight: 'bold',
                    fontSize: '12px',
                    padding: 0,
                    textDecoration: 'underline'
                  }}
                >
                  {formatTimestamp(event.timestampSec)}
                </button>
                <button
                  onClick={() => {
                    if (confirm('Delete this event?')) {
                      onDelete(event.id);
                    }
                  }}
                  style={{
                    background: '#f44336',
                    color: 'white',
                    border: 'none',
                    borderRadius: '3px',
                    padding: '2px 6px',
                    fontSize: '10px',
                    cursor: 'pointer'
                  }}
                >
                  Delete
                </button>
              </div>

              <div style={{ fontWeight: 'bold', color: '#333', marginBottom: '2px' }}>
                {event.eventType.replace(/_/g, ' ')}
                {event.location && event.location !== 'unknown' && (
                  <span style={{ color: '#3498db', fontSize: '10px', marginLeft: '6px' }}>
                    @ {ZONE_LABELS[event.location]}
                  </span>
                )}
              </div>

              {event.primaryPlayerId && (
                <div style={{ color: '#666', fontSize: '11px' }}>
                  {getPlayerName(event.primaryPlayerId)}
                  {event.secondaryPlayerId && ` + ${getPlayerName(event.secondaryPlayerId)}`}
                </div>
              )}

              {event.opponentNumber && (
                <div style={{ color: '#666', fontSize: '11px' }}>
                  Opp #{event.opponentNumber}
                </div>
              )}

              <div style={{ color: '#555', marginTop: '4px', fontSize: '11px', fontStyle: 'italic' }}>
                {event.comment}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Timeline;
