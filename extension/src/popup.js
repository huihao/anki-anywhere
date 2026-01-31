const statusEl = document.getElementById('status');
const selectEl = document.getElementById('deck-select');
const refreshButton = document.getElementById('refresh');

const setStatus = (text) => {
  statusEl.textContent = text;
};

const loadDecks = () => {
  setStatus('Loading decks...');
  chrome.runtime.sendMessage({ type: 'fetch-decks' }, (response) => {
    if (!response || !response.ok) {
      setStatus(response?.error || 'Failed to load decks');
      return;
    }

    selectEl.innerHTML = '';
    response.decks.forEach((deck) => {
      const option = document.createElement('option');
      option.value = deck.id;
      option.textContent = deck.name;
      selectEl.appendChild(option);
    });

    chrome.storage.local.get('selectedDeckId', (data) => {
      if (data.selectedDeckId) {
        selectEl.value = data.selectedDeckId;
      }
    });

    setStatus('');
  });
};

selectEl.addEventListener('change', () => {
  chrome.runtime.sendMessage({ type: 'save-deck', deckId: Number(selectEl.value) }, () => {
    setStatus('Deck saved');
  });
});

refreshButton.addEventListener('click', loadDecks);

loadDecks();
