# Pips gårdsbutik

A small farm-shop game for young children (4–5 years). Walk Pip around by holding a finger on the screen and stand on the glowing pads to unlock new things.

Play: https://leoncort.github.io/pips-farm/

On an iPad, open the link in Safari, tap Share and choose **Add to Home Screen** to get a full-screen app icon.

Two game modes, picked on the start page:

- **Butik** (`butik.html`): run a farm shop and grow it into a little industry.
- **Bondgård** (`bondgard.html`): fetch hay, grain, carrots and water, feed hens, pigs, cows, horses and a bull so they get happy and give hearts, then buy bigger houses and helper robots.

## Files

- `index.html`: start page where you pick Butik or Bondgård.
- `butik.html`, `bondgard.html`: the two games (three.js scene, game logic, sound).
- `three.min.js`: three.js r128 (MIT, see `three.LICENSE`), bundled so the game does not depend on a CDN.
- `audio/`: the three music loops. `pastoral-loop.mp3` plays by day on the farm and by the hens and orchard in the shop. `bouncing-coin.mp3` plays in the shop's market area. `relaxed-pulse.mp3` plays inside the house and at night on the farm. They crossfade over 1.5 s.
- `manifest.webmanifest`, `icon-*.png`: home-screen app icon and name.

Progress is saved in the browser (localStorage), so it stays on the device.

## Working on the game

The sources live in `src/`; the pages at the repo root are built from them. Never edit a built page by hand: the next build overwrites it.

- `src/engine/`: parts any Pips game can use (Pip and the wardrobe, camera and input, the loop, sky, weather, rain, light, house, store, buy mode, unlock queues, robots, pets, guests, tutorial runner, sound in `sound/`, the loading screen in `boot/`, the shared page head and CSS).
- `src/farm/`: the farm (Bondgård): animals, barn and loft, meadow, market, town, island, and `manifest.txt`, the list of script files glued together in order.
- `src/start/`: the start page.
- `tools/build.py`: builds `bondgard.html` and `index.html`, plus `build/test-bondgard.html` (three.js from the repo root) for tests.
- `tools/check.py`: rebuilds and compares with the committed pages; it passes when they are identical apart from the version stamp. Use it for changes that should not change the game.
- `tests/smoke.js`: loads the test page headless and fails on any page error (`node tests/smoke.js`).

To change the game: edit `src/` on a branch, run `python3 tools/build.py`, test, then `python3 stamp.py` and commit the sources and the built pages together.

All script files run in one shared scope, so the order in `manifest.txt` matters. Engine and farm files are still interleaved and some engine files still name farm things; untangling them comes next, before a second game (the zoo) gets its own `src/zoo/` and page. `butik.html` (the old shop) is frozen as built; its sources are in git history.
