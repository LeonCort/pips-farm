  /* ---------- the island's part of each frame (inside step(), between the engine's loop.js and loop-end.js) ---------- */
  skyStep(dt); dogStep(dt); weatherStep(dt); rainLate(); petsStep(dt); storeStep(dt);
  isleStep(dt);
