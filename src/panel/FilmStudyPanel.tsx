import React, { useState, useEffect, useRef } from 'react';
import { v4 as uuidv4 } from 'uuid';
import {
  getRoster,
  saveRoster,
  getGame,
  saveGame,
  getCurrentGameId,
  setCurrentGameId,
  getSettings
} from '../lib/storage';
import { Roster, Player, GameSession, GameEvent, EventType, CourtZone, EventTag } from '../types';
import RosterSetup from './RosterSetup';
import GameHeader from './GameHeader';
import OnCourtToggle from './OnCourtToggle';
import EventButtons from './EventButtons';
import EventForm from './EventForm';
import Timeline from './Timeline';

function FilmStudyPanel() {
  const [roster, setRosterState] = useState<Roster | null>(null);
  const [currentGame, setCurrentGame] = useState<GameSession | null>(null);
  const [onCourtPlayerIds, setOnCourtPlayerIds] = useState<string[]>([]);
  const [currentTimestamp, setCurrentTimestamp] = useState(0);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [activeEventForm, setActiveEventForm] = useState<{
    eventType: EventType;
    capturedTimestamp: number;
  } | null>(null);
  const [undoStack, setUndoStack] = useState<GameEvent[]>([]);
  const [showRosterSetup, setShowRosterSetup] = useState(false);

  const videoRef = useRef<HTMLVideoElement | null>(null);

  useEffect(() => {
    loadRoster();
    loadCurrentGame();
    setupVideoTracking();
  }, []);

  async function loadRoster() {
    const r = await getRoster();
    setRosterState(r);
  }

  async function loadCurrentGame() {
    const videoId = getVideoIdFromUrl();
    if (!videoId) return;

    const currentGameId = await getCurrentGameId();
    if (currentGameId) {
      const game = await getGame(currentGameId);
      if (game && game.videoId === videoId && game.status === 'in_progress') {
        setCurrentGame(game);
        // Restore last lineup
        if (game.lineupHistory.length > 0) {
          const lastLineup = game.lineupHistory[game.lineupHistory.length - 1];
          setOnCourtPlayerIds(lastLineup.onCourtPlayerIds);
        }
        return;
      }
    }

    // Check if there's an existing in-progress game for this video
    // (simplified: we'd need to query all games, but for now just start fresh)
  }

  function setupVideoTracking() {
    const interval = setInterval(() => {
      const video = document.querySelector('video');
      if (video) {
        videoRef.current = video;
        setCurrentTimestamp(video.currentTime);
      }
    }, 500);

    return () => clearInterval(interval);
  }

  function getVideoIdFromUrl(): string | null {
    const params = new URLSearchParams(window.location.search);
    return params.get('v');
  }

  function getVideoUrl(): string {
    return window.location.href;
  }

  async function handleStartGame(opponentName: string, date: string) {
    const videoId = getVideoIdFromUrl();
    if (!videoId) {
      alert('Could not detect video ID');
      return;
    }

    const newGame: GameSession = {
      id: uuidv4(),
      date,
      opponentName,
      videoUrl: getVideoUrl(),
      videoId,
      events: [],
      lineupHistory: [],
      status: 'in_progress'
    };

    await saveGame(newGame);
    await setCurrentGameId(newGame.id);
    setCurrentGame(newGame);
  }

  async function handleEndGame() {
    if (!currentGame) return;

    const updatedGame = { ...currentGame, status: 'completed' as const };
    await saveGame(updatedGame);
    await setCurrentGameId(null);

    // Open side panel first, then request export
    chrome.runtime.sendMessage({ type: 'OPEN_SIDE_PANEL' });

    // Wait a moment for side panel to load, then send export request
    setTimeout(() => {
      chrome.runtime.sendMessage({
        type: 'REQUEST_EXPORT',
        gameId: updatedGame.id
      });
    }, 500);

    alert('Game completed! Opening side panel to generate report...');
    setCurrentGame(null);
    setOnCourtPlayerIds([]);
  }

  async function handleTogglePlayer(playerId: string) {
    const newOnCourt = onCourtPlayerIds.includes(playerId)
      ? onCourtPlayerIds.filter(id => id !== playerId)
      : [...onCourtPlayerIds, playerId];

    setOnCourtPlayerIds(newOnCourt);

    // Record lineup change
    if (currentGame) {
      const updatedGame = {
        ...currentGame,
        lineupHistory: [
          ...currentGame.lineupHistory,
          { atSec: currentTimestamp, onCourtPlayerIds: newOnCourt }
        ]
      };
      setCurrentGame(updatedGame);
      await saveGame(updatedGame);
    }

    if (newOnCourt.length > 5) {
      alert('Warning: More than 5 players are on court.');
    }
  }

  function handleEventButtonClick(eventType: EventType) {
    // Require exactly 5 players on court before logging events
    if (onCourtPlayerIds.length !== 5) {
      alert(`Please select exactly 5 players on the court before logging events. (Currently: ${onCourtPlayerIds.length})`);
      return;
    }
    const capturedTimestamp = videoRef.current?.currentTime || 0;
    setActiveEventForm({ eventType, capturedTimestamp });
  }

  async function handleEventSubmit(
    eventType: EventType,
    capturedTimestamp: number,
    primaryPlayerId: string | undefined,
    secondaryPlayerId: string | undefined,
    opponentNumber: string | undefined,
    comment: string,
    location?: CourtZone,
    tags?: EventTag[]
  ) {
    if (!currentGame) return;

    const event: GameEvent = {
      id: uuidv4(),
      timestampSec: capturedTimestamp,
      wallClock: new Date().toISOString(),
      eventType,
      primaryPlayerId,
      secondaryPlayerId,
      opponentNumber,
      onCourtPlayerIds: [...onCourtPlayerIds],
      comment,
      location,
      tags
    };

    const updatedGame = {
      ...currentGame,
      events: [...currentGame.events, event]
    };

    setCurrentGame(updatedGame);
    await saveGame(updatedGame);
    setActiveEventForm(null);
    setUndoStack([...undoStack, event]);
  }

  function handleEventFormCancel() {
    setActiveEventForm(null);
  }

  async function handleDeleteEvent(eventId: string) {
    if (!currentGame) return;

    const updatedGame = {
      ...currentGame,
      events: currentGame.events.filter(e => e.id !== eventId)
    };

    setCurrentGame(updatedGame);
    await saveGame(updatedGame);
  }

  async function handleUndo() {
    if (undoStack.length === 0 || !currentGame) return;

    const lastEvent = undoStack[undoStack.length - 1];
    await handleDeleteEvent(lastEvent.id);
    setUndoStack(undoStack.slice(0, -1));
  }

  function handleSeekToEvent(timestampSec: number) {
    if (videoRef.current) {
      videoRef.current.currentTime = timestampSec;
    }
  }

  function handleChangeRoster() {
    if (currentGame) {
      const confirmed = confirm(
        'You have an active game in progress. Changing the roster may affect player tracking. Continue?'
      );
      if (!confirmed) return;
    }
    setShowRosterSetup(true);
  }

  function handleRosterSaved(r: Roster) {
    setRosterState(r);
    setShowRosterSetup(false);
    loadRoster();
  }

  function handleCancelRosterSetup() {
    setShowRosterSetup(false);
  }

  if (!roster || showRosterSetup) {
    return (
      <RosterSetup
        onRosterSaved={handleRosterSaved}
        initialRoster={roster}
        onCancel={roster ? handleCancelRosterSetup : undefined}
      />
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: '#fff' }}>
      {/* Collapse/Expand Toggle */}
      <div
        style={{
          padding: '8px',
          background: '#1976d2',
          color: 'white',
          cursor: 'pointer',
          textAlign: 'center',
          fontWeight: 'bold'
        }}
        onClick={() => setIsCollapsed(!isCollapsed)}
      >
        {isCollapsed ? '▼ Film Study (Click to Expand)' : '▲ Film Study'}
      </div>

      {!isCollapsed && (
        <div style={{ overflowY: 'auto', flex: 1, padding: '12px' }}>
          {/* Roster Info & Change Button */}
          <div style={{ marginBottom: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ fontSize: '13px', color: '#666' }}>
              <strong>{roster.teamName}</strong> ({roster.players.length} players)
            </div>
            <button
              onClick={handleChangeRoster}
              style={{
                padding: '4px 8px',
                fontSize: '11px',
                background: '#f5f5f5',
                color: '#333',
                border: '1px solid #ccc',
                borderRadius: '3px',
                cursor: 'pointer'
              }}
            >
              Change Roster
            </button>
          </div>

          <GameHeader
            currentGame={currentGame}
            currentTimestamp={currentTimestamp}
            onStartGame={handleStartGame}
            onEndGame={handleEndGame}
          />

          {currentGame && (
            <>
              <OnCourtToggle
                roster={roster}
                onCourtPlayerIds={onCourtPlayerIds}
                onToggle={handleTogglePlayer}
              />

              <EventButtons onEventClick={handleEventButtonClick} />

              {activeEventForm && (
                <EventForm
                  eventType={activeEventForm.eventType}
                  capturedTimestamp={activeEventForm.capturedTimestamp}
                  roster={roster}
                  onCourtPlayerIds={onCourtPlayerIds}
                  onSubmit={handleEventSubmit}
                  onCancel={handleEventFormCancel}
                />
              )}

              <div style={{ marginTop: '12px', display: 'flex', gap: '8px' }}>
                <button
                  onClick={handleUndo}
                  disabled={undoStack.length === 0}
                  style={{
                    padding: '6px 12px',
                    fontSize: '12px',
                    cursor: undoStack.length === 0 ? 'not-allowed' : 'pointer',
                    opacity: undoStack.length === 0 ? 0.5 : 1
                  }}
                >
                  Undo Last
                </button>
              </div>

              <Timeline
                events={currentGame.events}
                roster={roster}
                onSeek={handleSeekToEvent}
                onDelete={handleDeleteEvent}
              />
            </>
          )}
        </div>
      )}
    </div>
  );
}

export default FilmStudyPanel;
