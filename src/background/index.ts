// Background service worker for MV3

chrome.action.onClicked.addListener((tab) => {
  if (tab.id) {
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
