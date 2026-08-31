import React, { useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { Roster, Player } from '../types';
import { saveRoster } from '../lib/storage';

interface RosterSetupProps {
  onRosterSaved: (roster: Roster) => void;
}

function RosterSetup({ onRosterSaved }: RosterSetupProps) {
  const [teamName, setTeamName] = useState('');
  const [playersText, setPlayersText] = useState('');
  const [error, setError] = useState('');

  function parseRoster(text: string): Player[] {
    const players: Player[] = [];
    const lines = text.split(',').map(s => s.trim()).filter(s => s.length > 0);

    for (const line of lines) {
      const match = line.match(/^(\d+)\s+(.+)$/);
      if (match) {
        const number = match[1];
        const name = match[2];
        players.push({
          id: uuidv4(),
          number,
          name
        });
      } else {
        throw new Error(`Invalid format: "${line}". Expected: "number name"`);
      }
    }

    return players;
  }

  async function handleSubmit() {
    setError('');
    try {
      if (!teamName.trim()) {
        setError('Team name is required');
        return;
      }

      const players = parseRoster(playersText);
      if (players.length === 0) {
        setError('At least one player is required');
        return;
      }

      const roster: Roster = { teamName, players };
      await saveRoster(roster);
      onRosterSaved(roster);
    } catch (err) {
      setError((err as Error).message);
    }
  }

  return (
    <div style={{ padding: '20px', background: '#fff' }}>
      <h2 style={{ marginBottom: '16px' }}>Roster Setup</h2>

      <div style={{ marginBottom: '16px' }}>
        <label style={{ display: 'block', marginBottom: '4px', fontWeight: 'bold' }}>
          Team Name
        </label>
        <input
          type="text"
          value={teamName}
          onChange={(e) => setTeamName(e.target.value)}
          style={{
            width: '100%',
            padding: '8px',
            fontSize: '14px',
            border: '1px solid #ccc',
            borderRadius: '4px'
          }}
          placeholder="e.g., Varsity Eagles"
        />
      </div>

      <div style={{ marginBottom: '16px' }}>
        <label style={{ display: 'block', marginBottom: '4px', fontWeight: 'bold' }}>
          Players (comma-separated)
        </label>
        <textarea
          value={playersText}
          onChange={(e) => setPlayersText(e.target.value)}
          style={{
            width: '100%',
            padding: '8px',
            fontSize: '14px',
            border: '1px solid #ccc',
            borderRadius: '4px',
            minHeight: '120px',
            fontFamily: 'monospace'
          }}
          placeholder="1 John Smith, 4 Alex Lee, 23 Sam Cooper"
        />
        <div style={{ fontSize: '12px', color: '#666', marginTop: '4px' }}>
          Format: number name, separated by commas
        </div>
      </div>

      {error && (
        <div
          style={{
            padding: '8px',
            background: '#ffebee',
            color: '#c62828',
            borderRadius: '4px',
            marginBottom: '16px',
            fontSize: '13px'
          }}
        >
          {error}
        </div>
      )}

      <button
        onClick={handleSubmit}
        style={{
          padding: '10px 20px',
          fontSize: '14px',
          background: '#1976d2',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          cursor: 'pointer',
          fontWeight: 'bold'
        }}
      >
        Save Roster
      </button>
    </div>
  );
}

export default RosterSetup;
