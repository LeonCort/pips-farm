// Receives batches of the Pips game log (src/engine/log.js) and keeps each one as a blob for 60 days.
// No personal data: an anonymous random device id, the game version, the device type and the log lines.
import { put } from '@vercel/blob';

const MAX = 120000;

function cors(res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
}

async function body(req) {
  if (typeof req.body === 'string') return req.body;
  if (req.body && typeof req.body === 'object' && !Buffer.isBuffer(req.body)) return JSON.stringify(req.body);
  if (Buffer.isBuffer(req.body)) return req.body.toString('utf8');
  let s = '';
  for await (const c of req) { s += c; if (s.length > MAX) break; }
  return s;
}

const clean = (v, n) => String(v == null ? '' : v).replace(/[^\w.\-]/g, '').slice(0, n);

export default async function handler(req, res) {
  cors(res);
  if (req.method === 'OPTIONS') return res.status(204).end();
  if (req.method !== 'POST') return res.status(405).send('POST only');
  let raw = await body(req);
  if (raw.length > MAX) return res.status(413).send('too big');
  let d;
  try { d = JSON.parse(raw); } catch (e) { return res.status(400).send('bad json'); }
  if (!d || typeof d.text !== 'string' || !d.text) return res.status(400).send('no text');
  const now = new Date();
  const rec = {
    at: now.toISOString(),
    id: clean(d.id, 16), page: clean(d.page, 40), ver: clean(d.ver, 40), reason: clean(d.reason, 20),
    host: clean(d.host, 80), dev: String(d.dev || '').slice(0, 300), text: d.text.slice(0, MAX)
  };
  const day = rec.at.slice(0, 10), time = rec.at.slice(11, 19).replace(/:/g, '');
  await put(`logs/${day}/${time}-${rec.id || 'x'}-${rec.reason || 'log'}.json`, JSON.stringify(rec), {
    access: 'public', addRandomSuffix: true, contentType: 'application/json', ttlDays: 60
  });
  res.status(200).send('ok');
}
