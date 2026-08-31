import React from 'react';
import ReactDOM from 'react-dom/client';
import FilmStudyPanel from '../panel/FilmStudyPanel';

// Create a shadow root container to avoid CSS conflicts with YouTube
function injectPanel() {
  const existingContainer = document.getElementById('film-study-container');
  if (existingContainer) {
    return; // Already injected
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
    background: white;
    border-radius: 8px;
    box-shadow: 0 4px 12px rgba(0,0,0,0.3);
    overflow: hidden;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  `;

  document.body.appendChild(container);

  const shadowRoot = container.attachShadow({ mode: 'open' });
  const reactRoot = document.createElement('div');
  reactRoot.id = 'react-root';
  shadowRoot.appendChild(reactRoot);

  // Add basic styles inside shadow DOM
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
      color: #333;
    }
  `;
  shadowRoot.appendChild(style);

  const root = ReactDOM.createRoot(reactRoot);
  root.render(<FilmStudyPanel />);
}

// Detect YouTube SPA navigation
let currentVideoId: string | null = null;

function checkForVideoChange() {
  const urlParams = new URLSearchParams(window.location.search);
  const videoId = urlParams.get('v');

  if (videoId && videoId !== currentVideoId) {
    currentVideoId = videoId;
    injectPanel();
  }
}

// Initial check
checkForVideoChange();

// Listen for YouTube SPA navigation
window.addEventListener('yt-navigate-finish', checkForVideoChange);

// Fallback: poll for URL changes
setInterval(checkForVideoChange, 1000);
