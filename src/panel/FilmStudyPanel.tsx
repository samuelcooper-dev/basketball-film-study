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
import { Roster, Player, GameSession, GameEvent, EventType } from '../types';
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

    // Check if folder is set up
    const settings = await getSettings();
    if (!settings.hasDirectoryHandle) {
      const shouldSetup = confirm(
        'You need to set up an output folder first. Open the side panel to configure?'
      );
      if (shouldSetup) {
        chrome.runtime.sendMessage({ type: 'OPEN_SIDE_PANEL' });
      }
      return;
    }

    const updatedGame = { ...currentGame, status: 'completed' as const };
    await saveGame(updatedGame);
    await setCurrentGameId(null);

    // Request export via side panel
    chrome.runtime.sendMessage({
      type: 'REQUEST_EXPORT',
      gameId: updatedGame.id
    });

    alert('Game completed! Generating report in side panel...');
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
    const capturedTimestamp = videoRef.current?.currentTime || 0;
    setActiveEventForm({ eventType, capturedTimestamp });
  }

  async function handleEventSubmit(
    eventType: EventType,
    capturedTimestamp: number,
    primaryPlayerId: string | undefined,
    secondaryPlayerId: string | undefined,
    opponentNumber: string | undefined,
    comment: string
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
      comment
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

  if (!roster) {
    return <RosterSetup onRosterSaved={(r) => { setRosterState(r); loadRoster(); }} />;
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
