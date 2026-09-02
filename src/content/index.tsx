import React from 'react';
import ReactDOM from 'react-dom/client';
import FilmStudyPanel from '../panel/FilmStudyPanel';

// Debugging helpers
const DEBUG = true;
function log(...args: any[]) {
  if (DEBUG) console.log('[Basketball Film Study]', ...args);
}
function logError(...args: any[]) {
  console.error('[Basketball Film Study ERROR]', ...args);
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

    // Add dark fantasy theme inside shadow DOM
    const style = document.createElement('style');
    style.textContent = `
      * {
        box-sizing: border-box;
        margin: 0;
        padding: 0;
      }
      #react-root {
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
        font-size: 14px;
        color: #C4B5FD;
        background: linear-gradient(135deg, #0a0a0f 0%, #1a0f1f 50%, #1e1b4b 100%);
      }
      button {
        background: linear-gradient(135deg, #1e1b4b 0%, #312e81 100%);
        border: 2px solid #8B5CF6;
        color: #C4B5FD;
        font-weight: 600;
        cursor: pointer;
        transition: all 0.3s ease;
        box-shadow: 0 0 15px rgba(139, 92, 246, 0.4);
      }
      button:hover {
        box-shadow: 0 0 25px rgba(139, 92, 246, 0.7);
        border-color: #A78BFA;
        transform: translateY(-2px);
        background: linear-gradient(135deg, #312e81 0%, #4c1d95 100%);
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

// Export onExecute for CRXJS loader
export function onExecute() {
  log('onExecute called by CRXJS');
  initialize();
}

// Also initialize immediately (for manual/unpacked loading)
log('Content script module loaded');
initialize();
