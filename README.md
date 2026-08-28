# phoneme-builder

```bash
npm install
cp .env.example .env
npm run db:push     # creates the SQLite database from the Prisma schema
npm run db:seed      # loads starter word lists and default activities
npm run dev
```

Then open http://localhost:3000.
To inspect the database visually:
```bash
npx prisma studio
```

## Running with Docker

```bash
docker compose up --build
docker build -t phoneme-builder .
docker run -p 3000:3000 -v phoneme-db:/app/prisma phoneme-builder
```

Health check:

```bash
curl http://localhost:3000/health
```

## Project structure

```
app/
  layout.js                 Root layout: theme provider, nav, footer
  globals.css                Design tokens + shared styling
  page.js                     Home
  about/page.js                About (name, student number, video)
  wordle/page.js                Wordle builder page (reads word lists from the API)
  word-search/page.js            Word Search builder page (reads word lists from the API)
  word-lists/page.js              Word list & word CRUD management page
  activities/page.js                Saved ActivityConfig CRUD management page
  settings/page.js                 Theme + layout preferences
  health/route.js                   GET /health - liveness/readiness check
  api/word-lists/route.js            GET (list), POST (create) word lists
  api/word-lists/[id]/route.js        GET, PUT, DELETE a word list
  api/word-lists/[id]/words/route.js   POST - add a word to a list
  api/words/[id]/route.js              GET, PUT, DELETE a single word
  api/activities/route.js               GET (list/filter by type), POST - activity configs
  api/activities/[id]/route.js           GET, PUT, DELETE an activity config

components/
  NavBar.js               Tab bar + hamburger menu
  Footer.js                 Name / student number footer
  ThemeProvider.js           Light/dark + compact layout, persisted via cookies
  PhonemeKey.js                Reusable phoneme "keycap" with hover hint
  WaveformRule.js                Decorative divider
  WordleBuilder.js                 Settings panel + live playable Wordle preview (DB-driven)
  WordSearchBuilder.js              Settings panel + live interactive Word Search preview (DB-driven)
  WordListManager.js                 Full CRUD UI for word lists and words
  ActivityManager.js                   Full CRUD UI for saved activity configurations

hooks/
  useWordLists.js          Client-side fetch hook for GET /api/word-lists
  useActivities.js           Client-side fetch hook for GET /api/activities

lib/
  phonemeData.js       IPA <-> English letter/example lookup (hover hints)
  wordLists.js           Legacy static phoneme word lists (kept for reference; live data now comes from the database)
  validation.js            Server-side input validation for every API route
  prisma.js                  Prisma client singleton
  api-helpers.js               JSON response + error handling helpers for API routes
  cookies.js                     Small cookie get/set helper
  downloadHtml.js                  Triggers a browser download of a generated HTML string
  generateWordleHtml.js              Builds the standalone Wordle .html file
  generateWordSearchHtml.js            Builds the standalone Word Search .html file

prisma/
  schema.prisma          Database schema (WordList, Word, PhonemeUnit, ActivityConfig)
  seed.js                  Starter data loader (idempotent - skips if data already exists)

scripts/
  verify-connection.sh  End-to-end frontend/backend/database check (see above)
```

Top-level `Dockerfile`, `docker-compose.yml`, and `docker-entrypoint.sh`
handle containerization (see "Running with Docker" above); `.env.example`
shows the one environment variable the app needs (`DATABASE_URL`).

## Database schema (summary)

- **WordList** - a named, teacher-created collection of words (e.g. "Term 2
  CVC Words"), reusable across multiple activity configurations.
- **Word** - one phoneme-based word belonging to a WordList, storing its
  English spelling.
- **PhonemeUnit** - one phoneme symbol + its position within a Word. Each
  symbol is its own row (not a delimited string) so multi-character IPA
  symbols like `tʃ` or `eː` are never split incorrectly.
- **ActivityConfig** - a saved Wordle or Word Search configuration (type,
  title, difficulty, hint visibility, guesses/grid size) pointing at a
  WordList. Managed end-to-end: created from the Wordle/Word Search builder
  pages ("Save activity"), and read/updated/deleted from `/activities`.

## API quick reference

| Method | Route                               | Purpose                              |
|--------|--------------------------------------|---------------------------------------|
| GET    | `/health`                            | Liveness/readiness check             |
| GET    | `/api/word-lists`                    | List all word lists + words          |
| POST   | `/api/word-lists`                    | Create a word list                   |
| GET    | `/api/word-lists/:id`                | Get one word list                    |
| PUT    | `/api/word-lists/:id`                | Rename/update a word list            |
| DELETE | `/api/word-lists/:id`                | Delete a word list (cascades)        |
| POST   | `/api/word-lists/:id/words`          | Add a word to a list                 |
| GET    | `/api/words/:id`                     | Get one word                         |
| PUT    | `/api/words/:id`                     | Update a word's spelling/phonemes    |
| DELETE | `/api/words/:id`                     | Delete a word                        |
| GET    | `/api/activities?type=WORDLE`        | List saved activity configs          |
| POST   | `/api/activities`                    | Save a new activity config           |
| GET    | `/api/activities/:id`                | Get one activity config              |
| PUT    | `/api/activities/:id`                | Update an activity config            |
| DELETE | `/api/activities/:id`                | Delete an activity config            |


```bash
rm -f prisma/dev.db prisma/dev.db-journal
npm run db:push
npm run db:seed
npm run dev
docker build -t phoneme-builder . --no-cache
```

## Reference
Anthropic. (2026). Claude [Large language model]. https://claude.ai/

MDN Web Docs. (2026, June 15). *Document: cookie property*. Mozilla. https://developer.mozilla.org/en-US/docs/Web/API/Document/cookie

MDN Web Docs. (n.d.). *URL: createObjectURL() static method*. Mozilla. Retrieved August 10, 2026, from https://developer.mozilla.org/en-US/docs/Web/API/URL/createObjectURL_static

Nielsen, J. (1994). *10 usability heuristics for user interface design*. Nielsen Norman Group. https://www.nngroup.com/articles/ten-usability-heuristics/

Prisma. (n.d.). *Prisma schema reference*. Prisma Documentation. Retrieved August 23, 2026, from https://www.prisma.io/docs/orm/reference/prisma-schema-reference

React. (n.d.). *Built-in React hooks*. React Documentation. Retrieved August 10, 2026, from https://react.dev/reference/react/hooks

React. (n.d.). *Thinking in React*. React Documentation. Retrieved August 10, 2026, from https://react.dev/learn/thinking-in-react

Vercel. (n.d.). *Next.js docs: App Router*. Next.js Documentation. Retrieved August 10, 2026, from https://nextjs.org/docs/app

Vercel. (n.d.). *Route handlers*. Next.js Documentation. Retrieved August 23, 2026, from https://nextjs.org/docs/app/building-your-application/routing/route-handlers

World Wide Web Consortium. (2023, October 5). *Web Content Accessibility Guidelines (WCAG) 2.2*. W3C. https://www.w3.org/TR/WCAG22/

## Github Repo
https://github.com/Mundeeeee/phoneme-builder/tree/main
