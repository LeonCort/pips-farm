(function () {
'use strict';
const $ = (id) => document.getElementById(id);
const reduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
function hash(x, y, z) { const h = Math.sin(x * 127.1 + (y || 0) * 311.7 + (z || 0) * 74.7) * 43758.5453123; return h - Math.floor(h); }
function clamp(x, a, b) { return Math.min(b, Math.max(a, x)); }
function smooth(a, b, x) { const t = clamp((x - a) / (b - a), 0, 1); return t * t * (3 - 2 * t); }
function fmt(n) { n = Math.floor(n); if (n < 10000) return String(n); if (n < 1e6) return (n / 1000).toFixed(n < 1e5 ? 1 : 0) + 'k'; return (n / 1e6).toFixed(1) + 'M'; }

/* the low-poly reference palette */
const PAL = { seaDeep: '#1f6a80', sea: '#2e8f9c', seaShallow: '#63bfb4', sand: '#ecd3a0', bed: '#c9b99a', grass: '#a5bf66', meadow: '#86ad5c', forest: '#5d9160', pine: '#3f7d62', leaf: '#74a857', ochre: '#e0a646', rock: '#a3929b', snow: '#fffbf4', trunk: '#7d5e4e', cloud: '#fff8ef', cloudBase: '#c8c4dc', paper: '#fff6e4', ink: '#22303c', accent: '#e9684a', blush: '#f0907a', haze: '#f8dcc0' };

