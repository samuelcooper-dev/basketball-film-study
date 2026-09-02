import React, { useState, useEffect } from 'react';
import { EventType, Roster, CourtZone, EventTag } from '../types';
import CourtDiagram from '../components/CourtDiagram';

interface EventFormProps {
  eventType: EventType;
  capturedTimestamp: number;
  roster: Roster;
  onCourtPlayerIds: string[]; // Only allow selecting from on-court players
  onSubmit: (
    eventType: EventType,
    capturedTimestamp: number,
    primaryPlayerId: string | undefined,
    secondaryPlayerId: string | undefined,
    opponentNumber: string | undefined,
    comment: string,
    location?: CourtZone,
    tags?: EventTag[]
  ) => void;
  onCancel: () => void;
}

const EVENTS_NEEDING_PRIMARY = [
  '2PT_MAKE', '2PT_MISS', '3PT_MAKE', '3PT_MISS', 'FT_MAKE', 'FT_MISS',
  'REB_OFF', 'REB_DEF', 'ASSIST', 'TURNOVER', 'STEAL', 'BLOCK', 'FOUL',
  'SCREEN_ASSIST', 'DEFLECTION', 'CHARGE_TAKEN', 'BLOWN_COVERAGE', 'HELP_D_BREAKDOWN'
];

const EVENTS_NEEDING_SECONDARY = ['ASSIST', 'SCREEN_ASSIST', 'BLOWN_COVERAGE', 'HELP_D_BREAKDOWN'];

const OPPONENT_EVENTS = ['OPP_SCORE_2', 'OPP_SCORE_3', 'OPP_SCORE_FT'];

// Events that should show court diagram
const EVENTS_NEEDING_LOCATION = [
  '2PT_MAKE', '2PT_MISS', '3PT_MAKE', '3PT_MISS',
  'TURNOVER', 'STEAL', 'BLOCK', 'FOUL', 'ASSIST',
  'OPP_SCORE_2', 'OPP_SCORE_3',
  'BLOWN_COVERAGE', 'HELP_D_BREAKDOWN'
];

function EventForm({
  eventType,
  capturedTimestamp,
  roster,
  onCourtPlayerIds,
  onSubmit,
  onCancel
}: EventFormProps) {
  const [primaryPlayerId, setPrimaryPlayerId] = useState<string>('');
  const [secondaryPlayerId, setSecondaryPlayerId] = useState<string>('');
  const [opponentNumber, setOpponentNumber] = useState('');
  const [comment, setComment] = useState('');
  const [selectedZone, setSelectedZone] = useState<CourtZone | undefined>(undefined);
  const [showCourtStep, setShowCourtStep] = useState(true);

  const needsPrimary = EVENTS_NEEDING_PRIMARY.includes(eventType);
  const needsSecondary = EVENTS_NEEDING_SECONDARY.includes(eventType);
  const needsOpponent = OPPONENT_EVENTS.includes(eventType);
  const needsLocation = EVENTS_NEEDING_LOCATION.includes(eventType);

  // Filter roster to only show on-court players
  const onCourtPlayers = roster.players.filter(p => onCourtPlayerIds.includes(p.id));

  useEffect(() => {
    // Generate default comment
    const primaryPlayer = roster.players.find(p => p.id === primaryPlayerId);
    const secondaryPlayer = roster.players.find(p => p.id === secondaryPlayerId);

    let defaultComment = '';

    if (primaryPlayer) {
      defaultComment = `#${primaryPlayer.number} ${primaryPlayer.name}`;
    }

    if (secondaryPlayer) {
      if (eventType === 'ASSIST') {
        defaultComment = `#${secondaryPlayer.number} ${secondaryPlayer.name} assisted #${primaryPlayer?.number} ${primaryPlayer?.name}`;
      } else if (eventType === 'SCREEN_ASSIST') {
        defaultComment = `#${primaryPlayer?.number} ${primaryPlayer?.name} screen for #${secondaryPlayer.number} ${secondaryPlayer.name}`;
      } else {
        defaultComment += ` + #${secondaryPlayer.number} ${secondaryPlayer.name}`;
      }
    }

    if (needsOpponent && opponentNumber) {
      defaultComment += ` — Opp #${opponentNumber}`;
    }

    defaultComment += ` — ${eventType.replace(/_/g, ' ')}`;

    setComment(defaultComment);
  }, [primaryPlayerId, secondaryPlayerId, opponentNumber, eventType, roster]);

  function handleZoneSelected(zone: CourtZone) {
    setSelectedZone(zone);
    setShowCourtStep(false);
  }

  function handleSubmit() {
    if (needsPrimary && !primaryPlayerId) {
      alert('Please select a player');
      return;
    }

    if (needsOpponent && !opponentNumber) {
      alert('Please enter opponent jersey number');
      return;
    }

    if (needsLocation && !selectedZone) {
      alert('Please select a location on the court');
      return;
    }

    onSubmit(
      eventType,
      capturedTimestamp,
      primaryPlayerId || undefined,
      secondaryPlayerId || undefined,
      opponentNumber || undefined,
      comment,
      selectedZone,
      [] // tags - empty for now
    );
  }

  function formatTimestamp(seconds: number): string {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  }

  // Show court diagram first for location-based events
  if (needsLocation && showCourtStep) {
    return (
      <div
        style={{
          position: 'fixed',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          background: '#fff',
          padding: '16px',
          borderRadius: '8px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
          zIndex: 10000,
          width: '90%',
          maxWidth: '450px',
          maxHeight: '90vh',
          overflowY: 'auto'
        }}
      >
        <h3 style={{ marginBottom: '12px', fontSize: '16px', textAlign: 'center' }}>
          {eventType.replace(/_/g, ' ')} @ {formatTimestamp(capturedTimestamp)}
        </h3>
        <p style={{ marginBottom: '16px', fontSize: '13px', textAlign: 'center', color: '#666' }}>
          Where did this happen? Click a zone on the court.
        </p>

        <CourtDiagram
          onZoneClick={handleZoneSelected}
          selectedZone={selectedZone}
          mode="select"
        />

        <div style={{ marginTop: '16px', display: 'flex', gap: '8px' }}>
          <button
            onClick={onCancel}
            style={{
              flex: 1,
              padding: '8px',
              fontSize: '13px',
              background: '#999',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            Cancel
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      style={{
        position: 'fixed',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        background: '#fff',
        padding: '16px',
        borderRadius: '8px',
        boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
        zIndex: 10000,
        width: '90%',
        maxWidth: '360px'
      }}
    >
      <h3 style={{ marginBottom: '12px', fontSize: '14px' }}>
        {eventType.replace(/_/g, ' ')} @ {formatTimestamp(capturedTimestamp)}
        {selectedZone && selectedZone !== 'unknown' && (
          <span style={{ color: '#3498db', marginLeft: '8px' }}>
            ({selectedZone.replace(/_/g, ' ')})
          </span>
        )}
      </h3>

      {needsPrimary && (
        <div style={{ marginBottom: '12px' }}>
          <label style={{ display: 'block', marginBottom: '4px', fontSize: '12px', fontWeight: 'bold' }}>
            Player (on court only)
          </label>
          <select
            value={primaryPlayerId}
            onChange={(e) => setPrimaryPlayerId(e.target.value)}
            style={{
              width: '100%',
              padding: '6px',
              fontSize: '13px',
              border: '1px solid #ccc',
              borderRadius: '4px'
            }}
          >
            <option value="">Select player...</option>
            {onCourtPlayers.map(p => (
              <option key={p.id} value={p.id}>
                #{p.number} {p.name}
              </option>
            ))}
          </select>
          {onCourtPlayers.length === 0 && (
            <p style={{ fontSize: '11px', color: '#e74c3c', marginTop: '4px' }}>
              No players on court. Please select players using the On Court toggles above.
            </p>
          )}
        </div>
      )}

      {needsSecondary && (
        <div style={{ marginBottom: '12px' }}>
          <label style={{ display: 'block', marginBottom: '4px', fontSize: '12px', fontWeight: 'bold' }}>
            {eventType === 'ASSIST' ? 'Assisted by (on court)' : 'Secondary Player (on court)'}
          </label>
          <select
            value={secondaryPlayerId}
            onChange={(e) => setSecondaryPlayerId(e.target.value)}
            style={{
              width: '100%',
              padding: '6px',
              fontSize: '13px',
              border: '1px solid #ccc',
              borderRadius: '4px'
            }}
          >
            <option value="">Select player...</option>
            {onCourtPlayers.map(p => (
              <option key={p.id} value={p.id}>
                #{p.number} {p.name}
              </option>
            ))}
          </select>
        </div>
      )}

      {needsOpponent && (
        <div style={{ marginBottom: '12px' }}>
          <label style={{ display: 'block', marginBottom: '4px', fontSize: '12px', fontWeight: 'bold' }}>
            Opponent Jersey #
          </label>
          <input
            type="text"
            value={opponentNumber}
            onChange={(e) => setOpponentNumber(e.target.value)}
            style={{
              width: '100%',
              padding: '6px',
              fontSize: '13px',
              border: '1px solid #ccc',
              borderRadius: '4px'
            }}
            placeholder="e.g., 14"
          />
        </div>
      )}

      <div style={{ marginBottom: '12px' }}>
        <label style={{ display: 'block', marginBottom: '4px', fontSize: '12px', fontWeight: 'bold' }}>
          Comment
        </label>
        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          style={{
            width: '100%',
            padding: '6px',
            fontSize: '13px',
            border: '1px solid #ccc',
            borderRadius: '4px',
            minHeight: '60px',
            fontFamily: 'inherit'
          }}
        />
      </div>

      <div style={{ display: 'flex', gap: '8px' }}>
        <button
          onClick={handleSubmit}
          style={{
            flex: 1,
            padding: '8px',
            fontSize: '13px',
            background: '#4CAF50',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontWeight: 'bold'
          }}
        >
          Save
        </button>
        <button
          onClick={onCancel}
          style={{
            flex: 1,
            padding: '8px',
            fontSize: '13px',
            background: '#999',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          Cancel
        </button>
      </div>
    </div>
  );
}

export default EventForm;
