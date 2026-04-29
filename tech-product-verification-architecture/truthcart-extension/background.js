// TruthCart Background Service Worker
// Handles extension lifecycle, message passing, and storage management

const API_BASE_URL = 'http://localhost:3001';

// Listen for installation
chrome.runtime.onInstalled.addListener((details) => {
  console.log('[TruthCart] Extension installed:', details.reason);
  
  // Initialize default settings
  chrome.storage.local.set({
    settings: {
      apiBaseUrl: API_BASE_URL,
      cacheTTL: 86400000, // 24 hours in ms
      autoAnalyze: true,
      showOverlay: true
    }
  });
});

// Listen for messages from content scripts
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'TRUTHCART_GET_SETTINGS') {
    chrome.storage.local.get('settings', (data) => {
      sendResponse({ settings: data.settings || {} });
    });
    return true; // Keep channel open for async response
  }

  if (message.type === 'TRUTHCART_UPDATE_SETTINGS') {
    chrome.storage.local.set({ settings: message.settings }, () => {
      sendResponse({ success: true });
    });
    return true;
  }

  if (message.type === 'TRUTHCART_CLEAR_CACHE') {
    chrome.storage.local.remove('analysisCache', () => {
      sendResponse({ success: true });
    });
    return true;
  }

  if (message.type === 'TRUTHCART_FETCH_ANALYSIS') {
    // Proxy API call through background if needed
    fetch(`${API_BASE_URL}/analyze`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(message.payload)
    })
      .then(res => res.json())
      .then(data => sendResponse({ success: true, data }))
      .catch(err => sendResponse({ success: false, error: err.message }));
    return true;
  }
});

console.log('[TruthCart] Background service worker ready.');
