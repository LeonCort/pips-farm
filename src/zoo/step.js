  /* ---------- the zoo's part of each frame (inside step(), between the engine's loop.js and loop-end.js) ---------- */
  skyStep(dt); weatherStep(dt); rainLate(); storeStep(dt);
  zooStep(dt, near);
