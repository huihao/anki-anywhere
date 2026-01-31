# anki-anywhere

Minimal monorepo skeleton for Anki Anywhere:

- `backend/`: Node.js + Postgres API for decks/cards, supports SM-2 scheduling updates.
- `extension/`: Browser extension (MV3) to save selected text into a chosen deck.
- `admin/`: Simple admin page to create decks.
- `mobile/`: Native iOS/Android notes with SM-2 scheduling logic.

## Backend

```bash
cd backend
npm install
cp .env.example .env
npm run start
```

## Extension

1. Load `extension/` as an unpacked extension in Chrome.
2. Use the popup to select a deck.
3. Select text on a page and use the context menu to save it.

## Admin

Open `admin/index.html` in a browser and create decks.

## Mobile

See platform READMEs under `mobile/ios` and `mobile/android` for scheduling helpers and API notes.
