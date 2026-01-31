const API_BASE = 'http://localhost:3000';

const fetchDecks = async () => {
  const response = await fetch(`${API_BASE}/decks`);
  if (!response.ok) {
    throw new Error('Failed to fetch decks');
  }
  return response.json();
};

chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: 'anki-anywhere-create',
    title: 'Save selection to Anki Anywhere',
    contexts: ['selection'],
  });
});

chrome.contextMenus.onClicked.addListener(async (info) => {
  if (info.menuItemId !== 'anki-anywhere-create') {
    return;
  }

  const selection = info.selectionText || '';
  if (!selection.trim()) {
    return;
  }

  const { selectedDeckId } = await chrome.storage.local.get('selectedDeckId');
  const deckId = selectedDeckId;
  if (!deckId) {
    console.warn('Select a deck in the popup before saving cards.');
    return;
  }

  const response = await fetch(`${API_BASE}/cards`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      deckId,
      front: selection,
      sourceUrl: info.pageUrl || ''
    })
  });
  if (!response.ok) {
    console.warn('Failed to save card to backend.');
  }
});

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'fetch-decks') {
    fetchDecks()
      .then((decks) => sendResponse({ ok: true, decks }))
      .catch((error) => sendResponse({ ok: false, error: error.message }));
    return true;
  }

  if (message.type === 'save-deck') {
    chrome.storage.local.set({ selectedDeckId: message.deckId }, () => {
      sendResponse({ ok: true });
    });
    return true;
  }

  return false;
});
