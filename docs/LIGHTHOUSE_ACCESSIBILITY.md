# Lighthouse Accessibility Review

## How to run it

```bash
npm run build && npm start
```
Then, with the app running at http://localhost:3000:

**Option A - CLI:**
```bash
npx lighthouse http://localhost:3000 --only-categories=accessibility --view
```

**Option B - Chrome DevTools:** open the app in Chrome, DevTools (F12) →
**Lighthouse** tab → check only "Accessibility" → **Analyze page load**.

Run it against at least `/`, `/wordle`, `/word-search`, and `/dashboard` —
scores can differ per page since each has different interactive elements.

## Findings addressed during development

| Finding | Fix | File(s) |
|---|---|---|
| Phoneme keyboard cells used `role="button"` on a `<td>`, an invalid ARIA role for a table-row child | Replaced with a real `<button>` element inside the `<td>` | `WordleBuilder.js`, `WordListManager.js` |
| `<video>` had no captions track | Added a `<track kind="captions">` pointing to `walkthrough-captions.vtt` | `about/page.js` |
| Dashboard alerts/health status weren't announced to screen readers on change | Added `role="status"` (health banner) and `role="alert"` (alerts card) | `Dashboard.js` |
| Decorative success/failure bar had no accessible name and duplicated info already in text | Marked `aria-hidden="true"` (the numbers are already stated in the metric cards above it) | `Dashboard.js` |

## How this influenced the design

The `role="button"` fix in particular changed *how* the phoneme keyboard is
built, not just a label: rather than attaching interactive behaviour
directly to table cells (a common shortcut), every clickable phoneme is
now a real `<button>`, which also means it's keyboard-focusable and has a
visible focus ring (`:focus-visible` in `globals.css`) for free — a
screen-reader and keyboard-navigation improvement, not just something to
satisfy an automated audit.

## Known remaining gap

The video's caption file (`public/walkthrough-captions.vtt`) currently
contains a placeholder, not a real transcript. **Replace this with actual
captions before final submission** — an empty/placeholder track satisfies
the automated Lighthouse check but not genuine accessibility, and the
video's real content should be discussed in the video demo (Lighthouse
audits automated checks; it can't verify caption *accuracy*).
