# phoneme-builder

Next.js app for Speech Pathology teachers to build phoneme-based Wordle
and Word Search classroom activities.

- **Assessment 1:** frontend builder (components, responsive layout, live
  previews, downloadable HTML output).
- **Assessment 2:** backend — Prisma/SQLite database, CRUD API, validation,
  `/health` endpoint, Docker, AWS deployment.

## Contents

- [Quick Start](#quick-start)
- [Project Structure](#project-structure)
- [Database Schema](#database-schema)
- [API Reference](#api-reference)
- [Troubleshooting](#troubleshooting)
- [Before You Submit](#before-you-submit)
- [Reference](#reference)

---

## Quick Start

Three ways to run this, pick one.

### 🖥️ Option A — Local (no Docker)

```bash
npm install
cp .env.example .env
npm run db:push
npm run db:seed
npm run dev
```
Open http://localhost:3000. DB viewer: `npx prisma studio`

### 🐳 Option B — Local with Docker

```bash
docker compose up --build
```
or manually:
```bash
docker build -t phoneme-builder . --no-cache
docker run -d -p 3000:3000 -v phoneme-db:/app/data --name phoneme-builder phoneme-builder
```

**Verify it's actually working — check all three:**
```powershell
docker ps                                    # container shows "Up"
docker logs phoneme-builder                   # no errors, ends with "Starting application..."
Invoke-RestMethod http://localhost:3000/health   # status: ok
```

If `docker ps` doesn't show it, or `docker logs` shows an error, that's
the real problem — see [Troubleshooting](#troubleshooting) below rather
than assuming the app itself is broken.

> DB lives at `/app/data`, not `/app/prisma` — that folder also holds
> `schema.prisma`, and mounting a volume there hides it.

> Container already exists from a previous run? `docker rm -f phoneme-builder` first.

### ☁️ Option C — Deploy to AWS (Academy Learner Lab)

**Setup (once):**
1. `aws --version` to confirm CLI is installed
2. Start Lab → **AWS Details → Show** → paste into `~/.aws/credentials`
3. Download `labsuser.pem` (SSH Key) into project folder
4. `aws sts get-caller-identity` to confirm session is live

**Deploy:**
```powershell
.\deploy-to-aws.ps1
```
Builds → pushes to ECR → launches EC2 (using Academy's `LabInstanceProfile`
role and `vockey` key pair) → runs the container.

**Verify:**
```powershell
Invoke-RestMethod http://<public-ip>:3000/health
```

**Clean up (every time):**
```powershell
aws ec2 terminate-instances --instance-ids <instance-id> --region us-east-1
```

**Debug a bad deploy:**
```powershell
ssh -i labsuser.pem ec2-user@<public-ip>
sudo docker logs phoneme-builder
```

---

## Project Structure

```
app/
  layout.js, globals.css, page.js          Root layout, styling, Home
  about/ wordle/ word-search/               Assessment 1 pages
  word-lists/ activities/ settings/         Assessment 2 CRUD pages
  health/route.js                           GET /health
  api/word-lists/ api/words/ api/activities/  CRUD routes

components/
  NavBar.js, Footer.js, ThemeProvider.js    Layout pieces
  PhonemeKey.js, WaveformRule.js            Assessment 1 UI
  WordleBuilder.js, WordSearchBuilder.js    DB-driven builders
  WordListManager.js, ActivityManager.js    CRUD UIs

hooks/        useWordLists.js, useActivities.js
lib/          phonemeData.js, validation.js, prisma.js, api-helpers.js,
              cookies.js, downloadHtml.js, generate*Html.js
prisma/       schema.prisma, seed.js
scripts/      verify-connection.sh

deploy-to-aws.ps1        Build → ECR → EC2
test-aws-academy.ps1     Verify AWS access with throwaway resources
```

---

## Database Schema

| Model | Purpose |
|---|---|
| **WordList** | Named collection of words, reusable across activities |
| **Word** | One phoneme-based word + English spelling |
| **PhonemeUnit** | One phoneme symbol + position (row-per-symbol so multi-char IPA like `tʃ` never splits wrong) |
| **ActivityConfig** | Saved Wordle/Word Search settings (type, difficulty, hints, guesses/grid) pointing at a WordList |

---

## API Reference

| Method | Route | Purpose |
|---|---|---|
| GET | `/health` | Liveness + DB check |
| GET / POST | `/api/word-lists` | List / create word lists |
| GET / PUT / DELETE | `/api/word-lists/:id` | Get / rename / delete a list |
| POST | `/api/word-lists/:id/words` | Add a word |
| GET / PUT / DELETE | `/api/words/:id` | Get / update / delete a word |
| GET / POST | `/api/activities` | List / create activity configs |
| GET / PUT / DELETE | `/api/activities/:id` | Get / update / delete a config |

All writes validated (`lib/validation.js`) → `400` + errors on bad input, `404` if not found.

---

## Troubleshooting

**Docker command hangs, errors "cannot connect to the Docker daemon," or nothing happens at all:** Docker Desktop isn't running.
```powershell
docker info
```
If this errors, open Docker Desktop from the Start Menu and wait for the whale icon in the system tray to stop animating before retrying.

**"Container name already in use":** a previous run is still there.
```powershell
docker rm -f phoneme-builder
```

**Page loads forever:** `db:push` hung waiting for a confirmation prompt. Fixed with `--accept-data-loss`. Still stuck?
```bash
rm -f prisma/dev.db prisma/dev.db-journal && npm run db:push && npm run db:seed
```

**"Could not find Prisma Schema" in Docker:** volume mounted over `/app/prisma`, hiding `schema.prisma`. Mount `/app/data` instead.

**"Could not parse schema engine response" / OpenSSL warnings:** Alpine's musl libc needs OpenSSL installed explicitly + a `binaryTargets` entry in `schema.prisma`. Rebuild clean:
```bash
docker build -t phoneme-builder . --no-cache
```

**Still broken:** check `.env` exists, check terminal/`docker logs` output, check Network tab — *pending* request = hang above, *failed* request = validation/Prisma error.

**Confirm frontend ↔ backend connection:**
```bash
./scripts/verify-connection.sh http://localhost:3000
```

---

## Before You Submit

- [ ] Name/student number set in `Footer.js` + `about/page.js`
- [ ] Video reference added in `about/page.js`
- [ ] `node_modules`, `.next` removed before zipping
- [ ] AWS EC2 instance terminated
- [ ] Video shows: student ID (first 30s), CRUD demo, `/health`, Docker running

---

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

## GitHub Repo
https://github.com/Mundeeeee/phoneme-builder/tree/main
