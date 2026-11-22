# Corner Office — demo

**Play it:** https://aimeezzzz22.github.io/Corner-Office/

**中文版:** https://aimeezzzz22.github.io/Corner-Office-Chinese/ (same code, built with `npm run build:zh`; repo: Corner-Office-Chinese)

The playable build lives in `docs/` (served by GitHub Pages). To update it, run `npm run build` and copy `dist/` into `docs/`.

A first playable slice of Corner Office, with both offices: Stitchlight and Moonpuff Studio.

## Run it

You need Node.js 18 or newer.

```
npm install
npm run dev      # opens a local dev server
npm run build    # builds the static site into dist/
npm run build:zh # builds the Chinese site into dist-zh/
```

## What is in the demo

- Onboarding, as designed: offer letter from a random company (type your name, sign, HIRED) → welcome tour of every room (the host walks you round, the camera follows) → badge photo booth (skin, eyes, hair and colour, outfit, extras, desk pet, birthday) → badge → work vibe card draw (2 redraws) → work style quiz (skippable) → your first work order, with the slip that suits you tagged. Settings → Replay onboarding runs it again.

- Name your character, then free time in the Stitchlight office: click to walk, walk up to a coworker for their menu.
- Coworkers get up from their desks now and then, walk somewhere and come back. Nobody can share a tile: the player walks around a coworker or waits, and a coworker you click waits for you.
- Order tray: four slips (15 / 30 / 60 / 90 min), each for a random coworker with one of their own tasks, or a custom time (5–120 min, no heart).
- Set your focus, then the work view with a timer that runs on timestamps (it keeps counting through reloads and closed tabs).
- "Time's up!": Finished (coins, XP, +1/10 heart) or Stopping here (coins and XP for the time worked, no heart).
- Progress saves in the browser (localStorage). Settings (button at the bottom left): fast demo time, sound, reset.

## Walk labels

Every tile has one label: free floor, solid (desks, tables, sofas: can't walk there), tall (trees, lamps, shelves: only the base
blocks, you walk behind the rest) or wall. To change them, press **Settings** (bottom left) in free time and choose **Edit walk labels**, then
click tiles. Changes save in your browser. To make them the map's permanent labels, press **Copy labels** and paste the text over
the `"labels"` rows in `public/assets/office_stitchlight.json` (or `office_moonpuff.json`) (one row per line, each in quotes), or send it to Claude.

## Where things are

- `src/data.ts` — coworkers, their tasks, pay table, heart size. Change numbers here.
- `src/state.ts` — the save file and the order tray draw.
- `src/Office.tsx` — the walkable office (canvas, click-to-move, path finding).
- `src/App.tsx` — every screen. `src/styles.css` — the Stitchlight look.
- `public/assets/` — art and sounds exported from the design files by `tools/export_assets.py`.

## Not in the demo yet

The shop, gifts, mini-games (Closet Rush has a marker only), Chinese, music.
The office is drawn from a pre-rendered image rather than Phaser + Tiled; switching to Phaser is a later step.

## Fonts

Pixelify Sans, Caveat and Cormorant Garamond are open-licensed (SIL Open Font License).
