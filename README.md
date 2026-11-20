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
