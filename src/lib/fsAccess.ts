import { getDirectoryHandle, saveDirectoryHandle } from './storage';
import { parseSeasonCSV, mergeSeasonStats, seasonStatsToCSV } from './csv';
import { SeasonStatRow } from './stats';

export async function setupDirectoryAccess(): Promise<FileSystemDirectoryHandle | null> {
  try {
    const handle = await (window as any).showDirectoryPicker({
      mode: 'readwrite',
      startIn: 'documents'
    });

    await saveDirectoryHandle(handle);
    return handle;
  } catch (err) {
    console.error('Directory picker error:', err);
    return null;
  }
}

export async function getOrRequestDirectoryHandle(): Promise<FileSystemDirectoryHandle | null> {
  let handle = await getDirectoryHandle();

  if (handle) {
    try {
      // Check if permission is still granted
      const permission = await (handle as any).queryPermission({ mode: 'readwrite' });
      if (permission === 'granted') {
        return handle;
      }

      // Try requesting permission again
      const requestResult = await (handle as any).requestPermission({ mode: 'readwrite' });
      if (requestResult === 'granted') {
        return handle;
      }
    } catch (err) {
      // Permission API might not be available, try to use the handle anyway
      return handle;
    }
  }

  // Need to re-pick the directory
  return await setupDirectoryAccess();
}

export async function writeGamePDF(
  dirHandle: FileSystemDirectoryHandle,
  filename: string,
  blob: Blob
): Promise<void> {
  const fileHandle = await dirHandle.getFileHandle(filename, { create: true });
  const writable = await fileHandle.createWritable();
  await writable.write(blob);
  await writable.close();
}

export async function updateSeasonCSV(
  dirHandle: FileSystemDirectoryHandle,
  newGameRows: SeasonStatRow[],
  gameDate: string,
  opponentName: string
): Promise<void> {
  const filename = 'season_stats.csv';
  let existingRows: SeasonStatRow[] = [];

  try {
    const fileHandle = await dirHandle.getFileHandle(filename);
    const file = await fileHandle.getFile();
    const text = await file.text();
    existingRows = parseSeasonCSV(text);
  } catch (err) {
    // File doesn't exist yet, that's fine
  }

  const mergedRows = mergeSeasonStats(existingRows, newGameRows, gameDate, opponentName);
  const csvText = seasonStatsToCSV(mergedRows);

  const fileHandle = await dirHandle.getFileHandle(filename, { create: true });
  const writable = await fileHandle.createWritable();
  await writable.write(csvText);
  await writable.close();
}
