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

