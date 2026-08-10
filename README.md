#phoneme-builder

## Getting started

To start this program you need to run the following commands in the terminal.

```bash
npm install
npm run dev
```

Then open http://localhost:3000.

## Project structure

```
app/
  layout.js          Root layout: theme provider, nav, footer
  globals.css         Design tokens + shared styling
  page.js              Home
  about/page.js         About (name, student number, video)
  wordle/page.js         Wordle builder page
  word-search/page.js     Word Search builder page
  settings/page.js         Theme + layout preferences

components/
  NavBar.js            Tab bar + hamburger menu (About, Settings)
  Footer.js             Name / student number footer
  ThemeProvider.js       Light/dark + compact layout, persisted via cookies
  PhonemeKey.js           Reusable phoneme "keycap" with hover hint
  WaveformRule.js          Decorative divider
  WordleBuilder.js          Settings panel + live playable Wordle preview
  WordSearchBuilder.js       Settings panel + live interactive Word Search preview

lib/
  phonemeData.js       IPA -> English letter/example lookup (hover hints)
  wordLists.js           Phoneme word lists (from the HCE corpus)
  cookies.js               Small cookie get/set helper
  downloadHtml.js            Triggers a browser download of a generated HTML string
  generateWordleHtml.js        Builds the standalone Wordle .html file
  generateWordSearchHtml.js      Builds the standalone Word Search .html file
```

## Reference
Anthropic. (2026). Claude [Large language model]. https://claude.ai/

MDN Web Docs. (2026, June 15). *Document: cookie property*. Mozilla. https://developer.mozilla.org/en-US/docs/Web/API/Document/cookie

MDN Web Docs. (n.d.). *URL: createObjectURL() static method*. Mozilla. Retrieved August 10, 2026, from https://developer.mozilla.org/en-US/docs/Web/API/URL/createObjectURL_static

Nielsen, J. (1994). *10 usability heuristics for user interface design*. Nielsen Norman Group. https://www.nngroup.com/articles/ten-usability-heuristics/

React. (n.d.). *Built-in React hooks*. React Documentation. Retrieved August 10, 2026, from https://react.dev/reference/react/hooks

React. (n.d.). *Thinking in React*. React Documentation. Retrieved August 10, 2026, from https://react.dev/learn/thinking-in-react

Vercel. (n.d.). *Next.js docs: App Router*. Next.js Documentation. Retrieved August 10, 2026, from https://nextjs.org/docs/app

World Wide Web Consortium. (2023, October 5). *Web Content Accessibility Guidelines (WCAG) 2.2*. W3C. https://www.w3.org/TR/WCAG22/

## Github Repo
https://github.com/Mundeeeee/phoneme-builder/tree/main