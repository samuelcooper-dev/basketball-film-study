// Background service worker for MV3

// When extension icon is clicked, toggle the panel on YouTube videos
chrome.action.onClicked.addListener((tab) => {
  if (tab.id && tab.url?.includes('youtube.com/watch')) {
    // Toggle the film study panel
    chrome.tabs.sendMessage(tab.id, { type: 'TOGGLE_PANEL' }, (response) => {
      if (chrome.runtime.lastError) {
        console.log('Panel toggle failed:', chrome.runtime.lastError.message);
      } else {
        console.log('Panel toggled. Visible:', response?.visible);
      }
    });
  } else if (tab.id) {
    // On non-YouTube pages, open the side panel for settings/reports
    chrome.sidePanel.open({ tabId: tab.id });
  }
});

// Listen for messages from content script or side panel
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'OPEN_SIDE_PANEL') {
    if (sender.tab?.id) {
      chrome.sidePanel.open({ tabId: sender.tab.id });
    }
  }
  return true;
});
