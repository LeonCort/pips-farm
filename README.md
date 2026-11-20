# Pips gårdsbutik

A small farm-shop game for young children (4–5 years). Walk Pip around by holding a finger on the screen, collect eggs, apples, milk and cakes, put them on the counter for the animal guests, collect the coins and spend them on the glowing pads to grow the farm.

Play: https://leoncort.github.io/pips-farm/

On an iPad, open the link in Safari, tap Share and choose **Add to Home Screen** to get a full-screen app icon.

## Files

- `index.html`: the whole game (three.js scene, game logic, sound).
- `three.min.js`: three.js r128 (MIT, see `three.LICENSE`), bundled so the game does not depend on a CDN.
- `music.mp3`: background music, looped in the game.
- `manifest.webmanifest`, `icon-*.png`: home-screen app icon and name.

Progress is saved in the browser (localStorage), so it stays on the device.
