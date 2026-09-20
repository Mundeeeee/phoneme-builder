# Playwright End-to-End Tests

Two required tests, in `tests/`:

- `word-list-crud.spec.js` — **builder use case**: creates a word list,
  adds a word, edits it, deletes it, deletes the list. Full CRUD.
- `generate-wordle.spec.js` — **user use case**: loads the Wordle builder
  and confirms clicking Generate actually downloads a playable `.html`
  file built from stored data.

## First-time setup

```bash
npm install
npx playwright install chromium
```

## Running the tests

```bash
npm run db:reset
npm run test:e2e
```

`playwright.config.js` automatically starts `npm run dev` for you and
waits for it to be ready — you don't need the dev server running first.

## Watching it run / debugging

```bash
npm run test:e2e:ui
```
Opens Playwright's UI mode — step through each test, see the browser live,
inspect what failed if something breaks.

## Viewing the report after a run

```bash
npm run test:e2e:report
```

## What to show in the video

Run `npm run test:e2e` on camera and let both tests finish (a few seconds
each) — the terminal output shows both passing. Briefly point at each
spec file and say which rubric requirement it satisfies (one CRUD, one
generation/viewing use case).
