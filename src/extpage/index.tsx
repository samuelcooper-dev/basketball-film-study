import React, { useEffect, useState } from 'react';
import ReactDOM from 'react-dom/client';
import { getSettings, saveSettings, getRoster, getGame } from '../lib/storage';
import { computeGameStats, gameStatsToSeasonRows } from '../lib/stats';
import { generateGamePDF } from '../lib/pdf';
import {
  setupDirectoryAccess,
  getOrRequestDirectoryHandle,
  writeGamePDF,
  updateSeasonCSV
} from '../lib/fsAccess';

function ExtPage() {
  const [hasFolder, setHasFolder] = useState(false);
  const [status, setStatus] = useState('');
  const [pendingExport, setPendingExport] = useState<string | null>(null);

  useEffect(() => {
    loadSettings();
    listenForExportRequests();
  }, []);

  async function loadSettings() {
    const settings = await getSettings();
    setHasFolder(settings.hasDirectoryHandle);
  }

  function listenForExportRequests() {
    chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
      if (message.type === 'REQUEST_EXPORT') {
        setPendingExport(message.gameId);
        handleExport(message.gameId);
      }
    });
  }

  async function handleSetupFolder() {
    setStatus('Opening folder picker...');
    const handle = await setupDirectoryAccess();
    if (handle) {
      await saveSettings({ hasDirectoryHandle: true });
      setHasFolder(true);
      setStatus('Folder access granted!');
    } else {
      setStatus('Folder selection cancelled.');
    }
  }

  async function handleExport(gameId: string) {
    setStatus('Generating report...');

    try {
      const game = await getGame(gameId);
      const roster = await getRoster();

      if (!game || !roster) {
        setStatus('Error: Game or roster not found.');
        return;
      }

      const dirHandle = await getOrRequestDirectoryHandle();
      if (!dirHandle) {
        setStatus('Error: No folder access. Please set up folder first.');
        return;
      }

      // Generate stats
      const stats = computeGameStats(game, roster);

      // Generate PDF
      setStatus('Creating PDF...');
      const pdfBlob = generateGamePDF(game, stats, roster);
      const opponentSlug = game.opponentName.toLowerCase().replace(/\s+/g, '-');
      const pdfFilename = `game_${game.date}_${opponentSlug}.pdf`;
      await writeGamePDF(dirHandle, pdfFilename, pdfBlob);

      // Update season CSV
      setStatus('Updating season stats...');
      const seasonRows = gameStatsToSeasonRows(game, stats);
      await updateSeasonCSV(dirHandle, seasonRows, game.date, game.opponentName);

      setStatus(`Export complete! Saved ${pdfFilename} and updated season_stats.csv`);
      setPendingExport(null);

      // Notify content script
      chrome.runtime.sendMessage({
        type: 'EXPORT_COMPLETE',
        gameId: gameId
      });
    } catch (err) {
      console.error('Export error:', err);
      setStatus(`Error: ${(err as Error).message}`);
    }
  }

  return (
    <div style={{ padding: '20px' }}>
      <h1>Film Study - Export Manager</h1>

      <div style={{ marginTop: '20px' }}>
        {!hasFolder ? (
          <div>
            <p>Set up a folder to save game reports and season stats.</p>
            <button
              onClick={handleSetupFolder}
              style={{
                padding: '10px 20px',
                fontSize: '14px',
                cursor: 'pointer',
                background: '#4CAF50',
                color: 'white',
                border: 'none',
                borderRadius: '4px'
              }}
            >
              Choose Folder
            </button>
          </div>
        ) : (
          <div>
            <p style={{ color: 'green' }}>✓ Folder access configured</p>
            <button
              onClick={handleSetupFolder}
              style={{
                padding: '8px 16px',
                fontSize: '12px',
                cursor: 'pointer',
                background: '#2196F3',
                color: 'white',
                border: 'none',
                borderRadius: '4px'
              }}
            >
              Change Folder
            </button>
          </div>
        )}
      </div>

      {status && (
        <div
          style={{
            marginTop: '20px',
            padding: '12px',
            background: '#e3f2fd',
            borderRadius: '4px',
            fontSize: '14px'
          }}
        >
          {status}
        </div>
      )}

      {pendingExport && (
        <div
          style={{
            marginTop: '20px',
            padding: '12px',
            background: '#fff3cd',
            borderRadius: '4px',
            fontSize: '14px'
          }}
        >
          Exporting game {pendingExport}...
        </div>
      )}

      <div style={{ marginTop: '40px', fontSize: '12px', color: '#666' }}>
        <p>
          This panel manages file exports. When you click "End Game & Generate Report" in the
          YouTube panel, the PDF and CSV will be saved to your chosen folder.
        </p>
      </div>
    </div>
  );
}

const root = ReactDOM.createRoot(document.getElementById('root')!);
root.render(<ExtPage />);
