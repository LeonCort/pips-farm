// Reads the stored logs back, newest first, as plain text.
// Only answers on a deployment URL (which Vercel Authentication protects), never on the public production
// alias, so the logs are readable from the owner's Vercel account (and Claude via the Vercel connector) only.
// Query: ?days=2 (how many days back, default 2), ?limit=20 (batches, max 100), ?id=<device id>, ?reason=error, ?list=1 (names only)
import { list } from '@vercel/blob';

// VERCEL_URL is this deployment's own hashed URL, which Vercel Authentication protects
function isDeploymentUrl(host) { return !!process.env.VERCEL_URL && host === process.env.VERCEL_URL; }

export default async function handler(req, res) {
  const host = String(req.headers['x-forwarded-host'] || req.headers.host || '');
  if (!isDeploymentUrl(host)) return res.status(403).send('Read the logs through a deployment URL (protected), not the public address.');
  const q = req.query || {};
  const days = Math.min(30, Math.max(1, parseInt(q.days || '2', 10) || 2));
  const limit = Math.min(100, Math.max(1, parseInt(q.limit || '20', 10) || 20));
  const blobs = [];
  for (let i = 0; i < days; i++) {
    const d = new Date(Date.now() - i * 86400000).toISOString().slice(0, 10);
    let cursor;
    do {
      const r = await list({ prefix: `logs/${d}/`, cursor, limit: 1000 });
      blobs.push(...r.blobs); cursor = r.hasMore ? r.cursor : undefined;
    } while (cursor);
  }
  let pick = blobs.sort((a, b) => (a.pathname < b.pathname ? 1 : -1));
  if (q.id) pick = pick.filter(b => b.pathname.includes(`-${q.id}-`));
  if (q.reason) pick = pick.filter(b => b.pathname.includes(`-${q.reason}`));
  res.setHeader('Content-Type', 'text/plain; charset=utf-8');
  res.setHeader('Cache-Control', 'no-store');
  if (q.list) return res.status(200).send(`${pick.length} batches in ${days} day(s)\n` + pick.slice(0, 500).map(b => `${b.pathname}  ${b.size} B`).join('\n'));
  pick = pick.slice(0, limit);
  const out = await Promise.all(pick.map(async b => {
    try {
      const r = await (await fetch(b.url, { cache: 'no-store' })).json();
      return `######## ${r.at} device ${r.id} ${r.page} v${r.ver} reason=${r.reason} host=${r.host}\n# ${r.dev}\n${r.text}`;
    } catch (e) { return `######## ${b.pathname}: could not read (${e.message})`; }
  }));
  res.status(200).send(`${pick.length} of ${blobs.length} batches, newest first\n\n` + out.join('\n\n'));
}
