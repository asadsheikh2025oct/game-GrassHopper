# Hop: Glowlands

A small original platformer for phones and desktop: run, jump, gather glowing orbs, squash Grumps and reach the portal.
Built with plain HTML, CSS and JavaScript — no engine, no libraries, all art drawn in code, all audio synthesized.

**Play:** open `index.html` (or the GitHub Pages link for this repo). On a phone, hold it landscape and use the on‑screen buttons; on desktop use ← → / A D and Space to jump. It installs as an app (PWA) and works offline.

## Files
| File | Purpose |
|---|---|
| `index.html`, `style.css`, `game.js` | the game |
| `editor.html` | paint your own level and test it in the game |
| `validate-levels.js` | `node validate-levels.js` checks every level for pits, floating tiles and reachability |
| `sw.js`, `manifest.json`, `icon-*.png` | PWA: offline cache, install metadata, app icons |

## Editing levels
Levels are text maps near the top of `game.js`; the legend is in the comments there (`#` ground, `w` water, `o` bug, `e` frog, `G` flower, …).
After changing any file, bump `CACHE_VERSION` in `sw.js` so installed copies pick up the update.
