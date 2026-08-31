import React, { useState } from 'react';
import { GameSession } from '../types';

interface GameHeaderProps {
  currentGame: GameSession | null;
  currentTimestamp: number;
  onStartGame: (opponentName: string, date: string) => void;
  onEndGame: () => void;
}

function GameHeader({ currentGame, currentTimestamp, onStartGame, onEndGame }: GameHeaderProps) {
  const [opponentName, setOpponentName] = useState('');
  const [gameDate, setGameDate] = useState(new Date().toISOString().split('T')[0]);

  function handleStart() {
    if (!opponentName.trim()) {
      alert('Please enter opponent name');
      return;
    }
    onStartGame(opponentName, gameDate);
  }

  function formatTimestamp(seconds: number): string {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  }

  if (!currentGame) {
    return (
      <div style={{ marginBottom: '16px', padding: '12px', background: '#f5f5f5', borderRadius: '4px' }}>
        <h3 style={{ marginBottom: '12px' }}>Start New Game</h3>
        <div style={{ marginBottom: '8px' }}>
          <label style={{ display: 'block', marginBottom: '4px', fontSize: '12px' }}>
            Opponent
          </label>
          <input
            type="text"
            value={opponentName}
            onChange={(e) => setOpponentName(e.target.value)}
            style={{
              width: '100%',
              padding: '6px',
              fontSize: '13px',
              border: '1px solid #ccc',
              borderRadius: '4px'
            }}
            placeholder="e.g., Central High"
          />
        </div>
        <div style={{ marginBottom: '12px' }}>
          <label style={{ display: 'block', marginBottom: '4px', fontSize: '12px' }}>
            Date
          </label>
          <input
            type="date"
            value={gameDate}
            onChange={(e) => setGameDate(e.target.value)}
            style={{
              width: '100%',
              padding: '6px',
              fontSize: '13px',
              border: '1px solid #ccc',
              borderRadius: '4px'
            }}
          />
        </div>
        <button
          onClick={handleStart}
          style={{
            width: '100%',
            padding: '8px',
            fontSize: '14px',
            background: '#4CAF50',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontWeight: 'bold'
          }}
        >
          Start Game
        </button>
      </div>
    );
  }

  return (
    <div style={{ marginBottom: '16px', padding: '12px', background: '#e3f2fd', borderRadius: '4px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <div style={{ fontWeight: 'bold', fontSize: '14px' }}>vs {currentGame.opponentName}</div>
          <div style={{ fontSize: '12px', color: '#666' }}>{currentGame.date}</div>
          <div style={{ fontSize: '12px', color: '#666', marginTop: '4px' }}>
            Time: {formatTimestamp(currentTimestamp)}
          </div>
        </div>
        <button
          onClick={onEndGame}
          style={{
            padding: '8px 16px',
            fontSize: '13px',
            background: '#f44336',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontWeight: 'bold'
          }}
        >
          End Game
        </button>
      </div>
      <div style={{ marginTop: '8px', fontSize: '11px', color: '#666' }}>
        {currentGame.events.length} events logged
      </div>
    </div>
  );
}

export default GameHeader;
