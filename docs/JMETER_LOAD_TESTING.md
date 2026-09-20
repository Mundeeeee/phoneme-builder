# JMeter Load Testing

Test plan: `jmeter/phoneme-builder-load-test.jmx`

## Setup

1. Install JMeter: https://jmeter.apache.org/download_jmeter.cgi
2. Start the app first (JMeter needs a live target):
   ```bash
   npm run build && npm start
   ```
3. `cd jmeter`, then open the test plan: `jmeter -t phoneme-builder-load-test.jmx`
   (the results paths inside the plan are relative to this folder)

## What it tests

Each of the 5 Thread Groups (x1 / x10 / x100 / x1000 / x10000 users) sends
the same 5 requests per user: `GET /`, `/wordle`, `/word-search`, `/health`,
and `/api/word-lists` — covering a static page, two DB-driven builder
pages, the health check, and a CRUD API read.

**Only one Thread Group is enabled at a time** (x1 by default) — the
others are present but disabled, so the file opens without immediately
trying to fire 10,000 requests.

## Running a staged test

For each level, x1 → x10 → x100 → x1000 → x10000:

1. Right-click the Thread Group you want → **Enable**; right-click all
   others → **Disable**.
2. Run (green ▶ button, or from inside `jmeter/`:
   `jmeter -n -t phoneme-builder-load-test.jmx -l results/run-x10.jtl`)
3. Check the **Summary Report** listener for: average response time,
   throughput (requests/sec), and error %.
4. Repeat for the next level.

## Interpreting results (write this up per level)

For each level, note:
- **Error %** — did requests start failing? At what level?
- **Average response time** — does it grow linearly with load, or spike
  sharply at some point (a bottleneck)?
- **Throughput** — does requests/sec keep climbing, or plateau?

A typical pattern for a single SQLite-backed Next.js dev/prod instance on
a laptop: response times stay flat and low through x1–x100, start
climbing at x1000, and x10000 likely shows a high error rate or timeouts
— because SQLite handles one writer at a time and a single Node process
has a limited connection pool. That's a legitimate, explainable finding,
not a bug: it's the same SQLite trade-off documented in
`docs/DESIGN_DECISIONS.md`, now backed by actual numbers.

## What to say in the video

Show the Summary Report for at least the smallest and largest levels you
can complete, and explain the trend using the reasoning above rather than
just reading off numbers — that's the "explain how the system behaves
under different loads" requirement.
