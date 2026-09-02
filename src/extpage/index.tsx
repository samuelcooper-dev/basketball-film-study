import React, { useEffect, useState } from 'react';
import ReactDOM from 'react-dom/client';
import { getSettings, saveSettings, getRoster, getGame } from '../lib/storage';
import { computeGameStats, gameStatsToSeasonRows } from '../lib/stats';
import { generateGamePDF } from '../lib/pdf';
import { seasonStatsToCSV } from '../lib/csv';
import { generateHTMLReport } from '../lib/htmlReport';

function ExtPage() {
  const [status, setStatus] = useState('');
  const [pendingExport, setPendingExport] = useState<string | null>(null);
  const [downloadFolder, setDownloadFolder] = useState('basketball-reports');
  const [panelVisible, setPanelVisible] = useState(false);

  useEffect(() => {
    listenForExportRequests();
    loadDownloadFolder();
  }, []);

  async function loadDownloadFolder() {
    const settings = await getSettings();
    if (settings.downloadFolder) {
      setDownloadFolder(settings.downloadFolder);
    } else {
      // Default to empty string so files go directly to Downloads folder
      setDownloadFolder('');
    }
  }

  function listenForExportRequests() {
    chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
      if (message.type === 'REQUEST_EXPORT') {
        setPendingExport(message.gameId);
        handleExport(message.gameId);
      }
    });
  }

  async function handleTogglePanel() {
    try {
      // Get the current active tab
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

      if (!tab.id) {
        setStatus('Error: Could not find active tab');
        return;
      }

      // Check if it's a YouTube page
      if (!tab.url?.includes('youtube.com/watch')) {
        setStatus('Please navigate to a YouTube video first');
        return;
      }

      setStatus('Toggling panel...');

      try {
        // Send toggle message to content script
        const response = await chrome.tabs.sendMessage(tab.id, { type: 'TOGGLE_PANEL' });
        setPanelVisible(response.visible);
        setStatus(response.visible ? '✓ Film Study panel opened' : '✓ Film Study panel closed');
      } catch (messageError) {
        // Content script not loaded - try to inject it
        console.log('Content script not responding, attempting injection...');

        try {
          await chrome.scripting.executeScript({
            target: { tabId: tab.id },
            files: ['src/content/index.tsx']
          });

          // Wait a moment for script to initialize
          await new Promise(resolve => setTimeout(resolve, 500));

          // Try sending message again
          const response = await chrome.tabs.sendMessage(tab.id, { type: 'TOGGLE_PANEL' });
          setPanelVisible(response.visible);
          setStatus(response.visible ? '✓ Film Study panel opened' : '✓ Film Study panel closed');
        } catch (injectError) {
          console.error('Failed to inject content script:', injectError);
          setStatus('⚠️ Please refresh the YouTube page and try again');
        }
      }
    } catch (err) {
      console.error('Toggle panel error:', err);
      setStatus('⚠️ Error: Please refresh the YouTube page and try again');
    }
  }

  async function handleChangeFolder() {
    const folder = prompt('Enter subfolder name for exports (within Downloads):', downloadFolder);
    if (folder !== null) {
      setDownloadFolder(folder);
      await saveSettings({ downloadFolder: folder });
      setStatus(`Files will be saved to Downloads/${folder}`);
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

      // Generate stats
      const stats = computeGameStats(game, roster);

      // Generate PDF
      setStatus('Creating PDF...');
      const pdfBlob = generateGamePDF(game, stats, roster);
      const opponentSlug = game.opponentName.toLowerCase().replace(/\s+/g, '-');
      const pdfFilename = `game_${game.date}_${opponentSlug}.pdf`;

      // Download PDF using chrome.downloads API
      const pdfUrl = URL.createObjectURL(pdfBlob);
      await chrome.downloads.download({
        url: pdfUrl,
        filename: `${downloadFolder}/${pdfFilename}`,
        saveAs: false
      });

      // Generate season CSV
      setStatus('Generating season stats...');
      const seasonRows = gameStatsToSeasonRows(game, stats);
      const csvText = seasonStatsToCSV(seasonRows);
      const csvBlob = new Blob([csvText], { type: 'text/csv' });
      const csvUrl = URL.createObjectURL(csvBlob);

      await chrome.downloads.download({
        url: csvUrl,
        filename: `${downloadFolder}/season_stats_${game.date}.csv`,
        saveAs: false
      });

      // Generate HTML report with court analytics
      setStatus('Generating visual HTML report...');
      const htmlContent = generateHTMLReport(game, roster);
      const htmlBlob = new Blob([htmlContent], { type: 'text/html' });
      const htmlUrl = URL.createObjectURL(htmlBlob);
      const htmlFilename = `game_${game.date}_${opponentSlug}_report.html`;

      await chrome.downloads.download({
        url: htmlUrl,
        filename: `${downloadFolder}/${htmlFilename}`,
        saveAs: false
      });

      setStatus(`Export complete! Downloaded PDF, CSV, and HTML report to ${downloadFolder}/`);
      setPendingExport(null);

      // Clean up URLs
      setTimeout(() => {
        URL.revokeObjectURL(pdfUrl);
        URL.revokeObjectURL(csvUrl);
        URL.revokeObjectURL(htmlUrl);
      }, 1000);

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
    <div style={{
      padding: '20px',
      background: 'linear-gradient(135deg, #0a0a0f 0%, #1a0f1f 50%, #1e1b4b 100%)',
      minHeight: '100vh',
      color: '#C4B5FD'
    }}>
      <h1 style={{
        textShadow: '0 0 20px rgba(139, 92, 246, 0.8)',
        borderBottom: '2px solid #8B5CF6',
        paddingBottom: '12px',
        marginBottom: '24px',
        color: '#E9D5FF'
      }}>⚔️ Film Study Control Panel</h1>

      <div style={{ marginTop: '20px' }}>
        <h3 style={{ marginBottom: '12px', fontSize: '16px', color: '#E9D5FF', textShadow: '0 0 10px rgba(139, 92, 246, 0.6)' }}>
          📜 Film Study Panel
        </h3>
        <p style={{ fontSize: '13px', color: '#A78BFA', marginBottom: '12px' }}>
          Open the mystical film study panel on the current YouTube video to track stats.
        </p>
        <button
          onClick={handleTogglePanel}
          style={{
            padding: '12px 24px',
            fontSize: '16px',
            cursor: 'pointer',
            background: panelVisible
              ? 'linear-gradient(135deg, #450a0a 0%, #7f1d1d 100%)'
              : 'linear-gradient(135deg, #1e1b4b 0%, #4c1d95 100%)',
            color: panelVisible ? '#FCA5A5' : '#C4B5FD',
            border: `2px solid ${panelVisible ? '#DC2626' : '#8B5CF6'}`,
            borderRadius: '6px',
            fontWeight: 'bold',
            width: '100%',
            marginBottom: '12px',
            boxShadow: panelVisible
              ? '0 0 25px rgba(220, 38, 38, 0.6)'
              : '0 0 25px rgba(139, 92, 246, 0.6)',
            transition: 'all 0.3s ease',
            textShadow: panelVisible
              ? '0 0 10px rgba(252, 165, 165, 0.8)'
              : '0 0 10px rgba(196, 181, 253, 0.8)'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.boxShadow = panelVisible
              ? '0 0 35px rgba(220, 38, 38, 0.9)'
              : '0 0 35px rgba(139, 92, 246, 0.9)';
            e.currentTarget.style.transform = 'translateY(-2px)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.boxShadow = panelVisible
              ? '0 0 25px rgba(220, 38, 38, 0.6)'
              : '0 0 25px rgba(139, 92, 246, 0.6)';
            e.currentTarget.style.transform = 'translateY(0)';
          }}
        >
          {panelVisible ? '✕ Close Film Study Panel' : '▶ Open Film Study Panel'}
        </button>
        <p style={{ fontSize: '12px', color: '#6B21A8', fontStyle: 'italic' }}>
          Note: If you get an error, refresh the YouTube page and try again
        </p>
      </div>

      <hr style={{ margin: '24px 0', border: 'none', borderTop: '2px solid #8B5CF6', boxShadow: '0 0 12px rgba(139, 92, 246, 0.5)' }} />

      <div style={{ marginTop: '20px' }}>
        <h3 style={{ marginBottom: '12px', fontSize: '16px', color: '#E9D5FF', textShadow: '0 0 10px rgba(139, 92, 246, 0.6)' }}>
          ⚙️ Export Settings
        </h3>
        <p style={{ color: '#A78BFA' }}>
          Export location: <strong style={{ color: '#FCD34D' }}>Downloads/{downloadFolder || '(root)'}</strong>
        </p>
        <button
          onClick={handleChangeFolder}
          style={{
            padding: '10px 20px',
            fontSize: '14px',
            cursor: 'pointer',
            background: 'linear-gradient(135deg, #451a03 0%, #78350f 100%)',
            color: '#FCD34D',
            border: '2px solid #F59E0B',
            borderRadius: '4px',
            marginTop: '8px',
            boxShadow: '0 0 18px rgba(245, 158, 11, 0.5)',
            fontWeight: '600',
            transition: 'all 0.3s ease',
            textShadow: '0 0 8px rgba(252, 211, 77, 0.7)'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.boxShadow = '0 0 28px rgba(245, 158, 11, 0.7)';
            e.currentTarget.style.transform = 'translateY(-2px)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.boxShadow = '0 0 18px rgba(245, 158, 11, 0.5)';
            e.currentTarget.style.transform = 'translateY(0)';
          }}
        >
          Change Subfolder
        </button>
      </div>

      {status && (
        <div
          style={{
            marginTop: '20px',
            padding: '12px',
            background: 'linear-gradient(135deg, #1e1b4b 0%, #312e81 100%)',
            border: '2px solid #8B5CF6',
            borderRadius: '4px',
            fontSize: '14px',
            color: '#C4B5FD',
            boxShadow: '0 0 18px rgba(139, 92, 246, 0.5)',
            textShadow: '0 0 6px rgba(196, 181, 253, 0.7)'
          }}
        >
          ✨ {status}
        </div>
      )}

      {pendingExport && (
        <div
          style={{
            marginTop: '20px',
            padding: '12px',
            background: 'linear-gradient(135deg, #451a03 0%, #78350f 100%)',
            border: '2px solid #F59E0B',
            borderRadius: '4px',
            fontSize: '14px',
            color: '#FCD34D',
            boxShadow: '0 0 18px rgba(245, 158, 11, 0.5)',
            textShadow: '0 0 6px rgba(252, 211, 77, 0.7)'
          }}
        >
          🔮 Exporting game {pendingExport}...
        </div>
      )}

      <div style={{ marginTop: '40px', fontSize: '12px', color: '#A78BFA' }}>
        <h4 style={{ fontSize: '14px', marginBottom: '8px', color: '#E9D5FF', textShadow: '0 0 10px rgba(139, 92, 246, 0.6)' }}>
          📖 How to Use:
        </h4>
        <ol style={{ marginLeft: '20px', lineHeight: '1.8', color: '#8B5CF6' }}>
          <li>Navigate to a basketball game video on YouTube</li>
          <li>Click the button above to open the Film Study panel</li>
          <li>Set up your team roster and start tracking stats</li>
          <li>When finished, click "End Game" to generate PDF, CSV, and HTML reports</li>
        </ol>
        <p style={{ marginTop: '12px', color: '#A78BFA' }}>
          Reports will be saved to <strong style={{ color: '#FCD34D' }}>Downloads/{downloadFolder || '(root)'}</strong>
        </p>
      </div>
    </div>
  );
}

const root = ReactDOM.createRoot(document.getElementById('root')!);
root.render(<ExtPage />);
