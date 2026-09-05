import { openDB, DBSchema, IDBPDatabase } from 'idb';
import { Roster, GameSession, AppSettings } from '../types';

const STORAGE_KEYS = {
  ROSTER: 'roster',
  GAMES: 'games',
  SETTINGS: 'settings',
  CURRENT_GAME_ID: 'currentGameId',
  OUR_TEAM_NAME: 'ourTeamName',
  ACTIVE_ROSTER: 'activeRoster'
} as const;

// IndexedDB for FileSystemDirectoryHandle
interface FilmStudyDB extends DBSchema {
  'handles': {
    key: string;
    value: FileSystemDirectoryHandle;
  };
}

let dbPromise: Promise<IDBPDatabase<FilmStudyDB>> | null = null;

function getDB() {
  if (!dbPromise) {
    dbPromise = openDB<FilmStudyDB>('film-study-db', 1, {
      upgrade(db) {
        db.createObjectStore('handles');
      },
    });
  }
  return dbPromise;
}

export async function saveDirectoryHandle(handle: FileSystemDirectoryHandle): Promise<void> {
  const db = await getDB();
  await db.put('handles', handle, 'outputFolder');
}

export async function getDirectoryHandle(): Promise<FileSystemDirectoryHandle | null> {
  const db = await getDB();
  const handle = await db.get('handles', 'outputFolder');
  return handle || null;
}

// Chrome storage helpers
export async function getRoster(): Promise<Roster | null> {
  const result = await chrome.storage.local.get(STORAGE_KEYS.ROSTER);
  return result[STORAGE_KEYS.ROSTER] || null;
}

export async function saveRoster(roster: Roster): Promise<void> {
  await chrome.storage.local.set({ [STORAGE_KEYS.ROSTER]: roster });
}

export async function getGames(): Promise<Record<string, GameSession>> {
  const result = await chrome.storage.local.get(STORAGE_KEYS.GAMES);
  return result[STORAGE_KEYS.GAMES] || {};
}

export async function saveGame(game: GameSession): Promise<void> {
  const games = await getGames();
  games[game.id] = game;
  await chrome.storage.local.set({ [STORAGE_KEYS.GAMES]: games });
}

export async function getGame(gameId: string): Promise<GameSession | null> {
  const games = await getGames();
  return games[gameId] || null;
}

export async function getCurrentGameId(): Promise<string | null> {
  const result = await chrome.storage.local.get(STORAGE_KEYS.CURRENT_GAME_ID);
  return result[STORAGE_KEYS.CURRENT_GAME_ID] || null;
}

export async function setCurrentGameId(gameId: string | null): Promise<void> {
  if (gameId === null) {
    await chrome.storage.local.remove(STORAGE_KEYS.CURRENT_GAME_ID);
  } else {
    await chrome.storage.local.set({ [STORAGE_KEYS.CURRENT_GAME_ID]: gameId });
  }
}

export async function getSettings(): Promise<AppSettings> {
  const result = await chrome.storage.local.get(STORAGE_KEYS.SETTINGS);
  return result[STORAGE_KEYS.SETTINGS] || { hasDirectoryHandle: false };
}

export async function saveSettings(settings: AppSettings): Promise<void> {
  await chrome.storage.local.set({ [STORAGE_KEYS.SETTINGS]: settings });
}

export async function getCompletedGames(): Promise<GameSession[]> {
  const games = await getGames();
  return Object.values(games).filter(g => g.status === 'completed');
}

// Team name persistence
export async function getOurTeamName(): Promise<string> {
  const result = await chrome.storage.local.get(STORAGE_KEYS.OUR_TEAM_NAME);
  return result[STORAGE_KEYS.OUR_TEAM_NAME] || '';
}

export async function saveOurTeamName(teamName: string): Promise<void> {
  await chrome.storage.local.set({ [STORAGE_KEYS.OUR_TEAM_NAME]: teamName });
}

// Active roster (who's dressed tonight) persistence
export async function getActiveRoster(): Promise<string[]> {
  const result = await chrome.storage.local.get(STORAGE_KEYS.ACTIVE_ROSTER);
  return result[STORAGE_KEYS.ACTIVE_ROSTER] || [];
}

export async function saveActiveRoster(playerIds: string[]): Promise<void> {
  await chrome.storage.local.set({ [STORAGE_KEYS.ACTIVE_ROSTER]: playerIds });
}
