import React from 'react';
import ReactDOM from 'react-dom/client';
import FilmStudyPanel from '../panel/FilmStudyPanel';

// Debugging helpers
const DEBUG = true;
function log(...args: any[]) {
  if (DEBUG) console.log('[Basketball Wizard]', ...args);
}
function logError(...args: any[]) {
  console.error('[Basketball Wizard ERROR]', ...args);
}


// Create a shadow root container to avoid CSS conflicts with YouTube
function injectPanel() {
  try {
    log('injectPanel() called');

    const existingContainer = document.getElementById('film-study-container');
    if (existingContainer) {
      log('Panel already exists, skipping injection');
      return; // Already injected
    }

    if (!document.body) {
      logError('document.body is not available yet');
      return;
    }

    const container = document.createElement('div');
    container.id = 'film-study-container';
    container.style.cssText = `
      position: fixed;
      top: 80px;
      right: 20px;
      width: 400px;
      max-height: calc(100vh - 100px);
      z-index: 9999;
      background: linear-gradient(135deg, #0a0a0f 0%, #1a0f1f 50%, #1e1b4b 100%);
      border: 2px solid #8B5CF6;
      border-radius: 8px;
      box-shadow: 0 0 30px rgba(139, 92, 246, 0.7), 0 0 60px rgba(107, 33, 168, 0.4), inset 0 0 40px rgba(139, 92, 246, 0.1);
      overflow: hidden;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
    `;

    document.body.appendChild(container);

    const shadowRoot = container.attachShadow({ mode: 'open' });
    const reactRoot = document.createElement('div');
    reactRoot.id = 'react-root';
    shadowRoot.appendChild(reactRoot);

    // Add retro theme inside shadow DOM
    const style = document.createElement('style');
    style.textContent = `
      @import url('https://fonts.googleapis.com/css2?family=Press+Start+2P&family=VT323&display=swap');

      :root {
        /* Core palette from wizard logo */
        --bw-bg:            #0a0a0f;
        --bw-bg-panel:      #12101c;
        --bw-purple:        #6B3FE0;
        --bw-purple-dark:   #3E1F8C;
        --bw-purple-light:  #9878F8;
        --bw-gold:          #F5B82E;
        --bw-cyan:          #3CE6FC;
        --bw-cyan-dim:      rgba(60,230,252,0.15);

        /* Semantic colors */
        --bw-success:       #4CDB6E;
        --bw-danger:        #FF3B5C;
        --bw-warning:       var(--bw-gold);

        /* Text */
        --bw-text:          #EDEBFF;
        --bw-text-dim:      #8C86B8;

        /* Fonts */
        --bw-font-display: 'Press Start 2P', cursive;
        --bw-font-body:    'VT323', monospace;

        /* Pixel border unit */
        --bw-px: 4px;
      }

      * {
        box-sizing: border-box;
      }

      #react-root {
        font-family: var(--bw-font-body);
        font-size: 18px;
        color: var(--bw-text);
        background: var(--bw-bg);
      }

      /* Retro arcade buttons */
      .bw-btn {
        font-family: var(--bw-font-display);
        font-size: 11px;
        line-height: 1.6;
        color: #0a0a0f;
        background: var(--bw-gold);
        border: none;
        padding: 12px 10px;
        cursor: pointer;
        position: relative;
        text-transform: uppercase;
        letter-spacing: 0.5px;
        box-shadow:
          inset -4px -4px 0 rgba(0,0,0,0.35),
          inset 4px 4px 0 rgba(255,255,255,0.35),
          0 4px 0 #000;
        transition: transform 0.05s ease;
      }

      .bw-btn:hover { filter: brightness(1.1); }

      .bw-btn:active {
        transform: translateY(4px);
        box-shadow:
          inset -4px -4px 0 rgba(0,0,0,0.35),
          inset 4px 4px 0 rgba(255,255,255,0.25);
      }

      /* Event-type color variants */
      .bw-btn.bw-2pt   { background: var(--bw-success); }
      .bw-btn.bw-3pt   { background: var(--bw-cyan); }
      .bw-btn.bw-ast   { background: var(--bw-purple-light); color: #fff; }
      .bw-btn.bw-miss  { background: var(--bw-danger); color: #fff; }
      .bw-btn.bw-tov   { background: #FF7A3C; }
      .bw-btn.bw-reb   { background: var(--bw-gold); }

      .bw-btn:disabled {
        background: #2c2a3a;
        color: var(--bw-text-dim);
        box-shadow: 0 4px 0 #000;
        cursor: not-allowed;
      }

      input, select {
        background: #1e1b4b;
        border: 1px solid #8B5CF6;
        color: #C4B5FD;
        padding: 8px;
        border-radius: 4px;
      }
      input:focus, select:focus {
        outline: none;
        border-color: #A78BFA;
        box-shadow: 0 0 12px rgba(139, 92, 246, 0.6);
      }
      input::placeholder {
        color: #6B21A8;
      }
    `;
    shadowRoot.appendChild(style);

    const root = ReactDOM.createRoot(reactRoot);
    root.render(<FilmStudyPanel />);

    log('Panel injected successfully');
  } catch (error) {
    logError('Failed to inject panel:', error);
  }
}


// Track panel visibility and initialization
let isPanelVisible = false;
let isInitialized = false;

function showPanel() {
  log('Showing panel');
  isPanelVisible = true;
  injectPanel();
}

function hidePanel() {
  log('Hiding panel');
  isPanelVisible = false;

  const container = document.getElementById('film-study-container');
  if (container) {
    container.remove();
  }
}

// Set up message listener (only once)
function initialize() {
  if (isInitialized) {
    log('Already initialized, skipping');
    return;
  }
  isInitialized = true;

  log('Initializing content script...');

  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    log('Message received:', message.type);

    if (message.type === 'TOGGLE_PANEL') {
      log('Toggling panel. Current state:', isPanelVisible);

      if (isPanelVisible) {
        hidePanel();
      } else {
        showPanel();
      }

      sendResponse({ visible: isPanelVisible });
      return true;
    }
  });

  log('Content script ready and listening for messages');
}

// Auto-inject panel when YouTube video is detected
let currentVideoId: string | null = null;

function checkForVideoChange() {
  const urlParams = new URLSearchParams(window.location.search);
  const videoId = urlParams.get('v');

  if (videoId && videoId !== currentVideoId) {
    log('Video detected:', videoId);
    currentVideoId = videoId;
    showPanel(); // Auto-show panel on new video
  } else if (!videoId && currentVideoId) {
    log('Left video page');
    currentVideoId = null;
    hidePanel(); // Hide panel when leaving video
  }
}

// Export onExecute for CRXJS loader
export function onExecute() {
  log('onExecute called by CRXJS');
  initialize();
  checkForVideoChange(); // Auto-inject on first load
}

// Also initialize immediately (for manual/unpacked loading)
log('Content script module loaded');
initialize();

// Initial check
checkForVideoChange();

// Listen for YouTube SPA navigation
window.addEventListener('yt-navigate-finish', () => {
  log('YouTube navigation detected');
  checkForVideoChange();
});

// Fallback: poll for URL changes (YouTube's SPA can be finicky)
setInterval(checkForVideoChange, 1000);
