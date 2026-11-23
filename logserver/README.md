# pips-log

Tiny Vercel project that receives the game log from `src/engine/log.js` and stores each batch in Vercel Blob (60 days).

- `POST /api/log` (public production address): one batch, JSON `{id, page, ver, reason, host, dev, text}`.
- `GET /api/logs` (deployment URL only, protected by Vercel Authentication): the stored logs, newest first.
  `?days=2&limit=20&id=<device>&reason=error|stall|crash|periodic|close&list=1`

Deployed by hand (not connected to git): Vercel project `pips-log` in leoncort's team.
