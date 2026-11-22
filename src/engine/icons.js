/* ---------- icons and thought bubbles ---------- */
const bubbleTex = {};
function drawIcon(cx, t, x, y, s) {
  cx.save(); cx.translate(x, y); cx.scale(s, s); cx.lineWidth = 4; cx.strokeStyle = PAL.ink; cx.lineJoin = 'round';
  if (t === 'hay') { cx.fillStyle = PAL.ochre; cx.fillRect(-26, -16, 52, 34); cx.strokeRect(-26, -16, 52, 34); cx.strokeStyle = PAL.trunk; [-9, 9].forEach((q) => { cx.beginPath(); cx.moveTo(q, -16); cx.lineTo(q, 18); cx.stroke(); }); cx.strokeStyle = '#c98a2c'; cx.lineWidth = 2; [-6, 2, 10].forEach((q) => { cx.beginPath(); cx.moveTo(-24, q); cx.lineTo(24, q); cx.stroke(); }); }
  else if (t === 'grain') { cx.fillStyle = PAL.sand; cx.beginPath(); cx.moveTo(-18, -18); cx.quadraticCurveTo(-30, 24, 0, 26); cx.quadraticCurveTo(30, 24, 18, -18); cx.closePath(); cx.fill(); cx.stroke(); cx.fillStyle = PAL.trunk; cx.fillRect(-12, -26, 24, 9); cx.strokeRect(-12, -26, 24, 9); cx.fillStyle = PAL.ochre; [[-6, 4], [6, 4], [0, 14]].forEach(([a, b]) => { cx.beginPath(); cx.ellipse(a, b, 4, 6, 0, 0, 7); cx.fill(); }); }
  else if (t === 'carrot') { cx.fillStyle = '#ef8a2e'; cx.beginPath(); cx.moveTo(-14, -12); cx.lineTo(14, -12); cx.lineTo(0, 28); cx.closePath(); cx.fill(); cx.stroke(); cx.fillStyle = PAL.leaf; [-8, 0, 8].forEach((q) => { cx.beginPath(); cx.ellipse(q, -22, 5, 11, q * 0.04, 0, 7); cx.fill(); cx.stroke(); }); }
  else if (t === 'water') { cx.fillStyle = PAL.rock; cx.beginPath(); cx.moveTo(-22, -14); cx.lineTo(22, -14); cx.lineTo(16, 24); cx.lineTo(-16, 24); cx.closePath(); cx.fill(); cx.stroke(); cx.fillStyle = PAL.seaShallow; cx.beginPath(); cx.ellipse(0, -14, 22, 7, 0, 0, 7); cx.fill(); cx.stroke(); cx.beginPath(); cx.arc(0, -14, 26, Math.PI, 0); cx.stroke(); }
  else if (t === 'heart') { cx.fillStyle = PAL.accent; cx.beginPath(); cx.moveTo(0, 22); cx.bezierCurveTo(-34, -2, -18, -30, 0, -12); cx.bezierCurveTo(18, -30, 34, -2, 0, 22); cx.fill(); cx.stroke(); }
  else if (t === 'house') { cx.fillStyle = PAL.accent; cx.beginPath(); cx.moveTo(-28, -2); cx.lineTo(0, -28); cx.lineTo(28, -2); cx.closePath(); cx.fill(); cx.stroke(); cx.fillStyle = PAL.paper; cx.fillRect(-20, -2, 40, 28); cx.strokeRect(-20, -2, 40, 28); cx.fillStyle = PAL.trunk; cx.fillRect(-7, 8, 14, 18); cx.strokeRect(-7, 8, 14, 18); }
  else if (t === 'robot') { cx.fillStyle = PAL.paper; cx.fillRect(-26, -20, 52, 40); cx.strokeRect(-26, -20, 52, 40); cx.fillStyle = PAL.ink; cx.fillRect(-18, -10, 36, 14); cx.fillStyle = PAL.seaShallow; cx.beginPath(); cx.arc(-8, -3, 4, 0, 7); cx.arc(8, -3, 4, 0, 7); cx.fill(); }
  else if (t === 'tractor') { cx.fillStyle = PAL.accent; cx.fillRect(-26, -6, 40, 18); cx.strokeRect(-26, -6, 40, 18); cx.fillRect(-4, -26, 18, 20); cx.strokeRect(-4, -26, 18, 20); cx.fillStyle = PAL.seaShallow; cx.fillRect(0, -22, 10, 10); cx.fillStyle = PAL.ink; cx.beginPath(); cx.arc(8, 16, 13, 0, 7); cx.fill(); cx.beginPath(); cx.arc(-20, 20, 8, 0, 7); cx.fill(); cx.fillStyle = PAL.rock; cx.beginPath(); cx.arc(8, 16, 5, 0, 7); cx.fill(); }
  else if (t === 'hand') { cx.fillStyle = PAL.paper; cx.beginPath(); cx.roundRect ? cx.roundRect(-16, -8, 32, 30, 10) : cx.rect(-16, -8, 32, 30); cx.fill(); cx.stroke(); [-12, -4, 4, 12].forEach((q, k) => { cx.beginPath(); cx.roundRect ? cx.roundRect(q - 4, -24 + Math.abs(k - 1.5) * 4, 8, 22, 4) : cx.rect(q - 4, -24, 8, 22); cx.fill(); cx.stroke(); }); cx.fillStyle = PAL.accent; cx.beginPath(); cx.moveTo(18, -6); cx.bezierCurveTo(8, -14, 12, -26, 18, -20); cx.bezierCurveTo(24, -26, 28, -14, 18, -6); cx.fill(); cx.stroke(); }
  else if (t === 'down') { cx.fillStyle = PAL.paper; cx.beginPath(); cx.moveTo(-10, -24); cx.lineTo(10, -24); cx.lineTo(10, 0); cx.lineTo(22, 0); cx.lineTo(0, 24); cx.lineTo(-22, 0); cx.lineTo(-10, 0); cx.closePath(); cx.fill(); cx.stroke(); }
  else if (t === 'dog') { /* a golden retriever portrait: soft fur, floppy ears, shiny eyes, tongue and a red collar */
    const fur = cx.createRadialGradient(-6, -8, 4, 0, 2, 28); fur.addColorStop(0, '#f2c27a'); fur.addColorStop(1, '#c98a45');
    cx.fillStyle = '#d8423a'; cx.beginPath(); cx.ellipse(0, 25, 17, 6, 0, 0, 7); cx.fill(); cx.stroke();
    cx.fillStyle = '#f2c14a'; cx.beginPath(); cx.arc(0, 30, 4, 0, 7); cx.fill(); cx.stroke();
    cx.fillStyle = fur; cx.beginPath(); cx.moveTo(-20, -14); cx.bezierCurveTo(-22, -30, 22, -30, 20, -14); cx.bezierCurveTo(26, 0, 22, 22, 0, 23); cx.bezierCurveTo(-22, 22, -26, 0, -20, -14); cx.fill(); cx.stroke();
    cx.fillStyle = '#b5743a'; [-1, 1].forEach((q) => { cx.beginPath(); cx.moveTo(q * 15, -20); cx.bezierCurveTo(q * 34, -20, q * 34, 6, q * 25, 14); cx.bezierCurveTo(q * 20, 16, q * 15, 6, q * 15, -20); cx.fill(); cx.stroke(); });
    cx.fillStyle = '#f7dca8'; cx.beginPath(); cx.ellipse(0, 9, 13, 10, 0, 0, 7); cx.fill(); cx.stroke();
    cx.fillStyle = '#ef8a8a'; cx.beginPath(); cx.ellipse(0, 18, 4.5, 6, 0, 0, 7); cx.fill(); cx.stroke();
    cx.fillStyle = PAL.ink; cx.beginPath(); cx.ellipse(0, 5, 6, 4.2, 0, 0, 7); cx.fill();
    [-1, 1].forEach((q) => { cx.fillStyle = PAL.ink; cx.beginPath(); cx.ellipse(q * 9, -6, 4, 4.8, 0, 0, 7); cx.fill(); cx.fillStyle = '#fff'; cx.beginPath(); cx.arc(q * 9 + 1.5, -7.8, 1.6, 0, 7); cx.fill(); });
    cx.fillStyle = 'rgba(240,144,122,0.55)'; [-1, 1].forEach((q) => { cx.beginPath(); cx.ellipse(q * 15, 4, 4, 2.6, 0, 0, 7); cx.fill(); }); }
  else if (t === 'cat') { /* a ginger kitten portrait: pointy ears, tabby stripes, cream cheeks, whiskers, a blue collar with a bell */
    const fur = cx.createRadialGradient(-6, -8, 4, 0, 2, 28); fur.addColorStop(0, '#f6b46a'); fur.addColorStop(1, '#d97f36');
    cx.fillStyle = '#4f86c6'; cx.beginPath(); cx.ellipse(0, 25, 16, 5.5, 0, 0, 7); cx.fill(); cx.stroke();
    cx.fillStyle = '#f2c14a'; cx.beginPath(); cx.arc(0, 31, 4.5, 0, 7); cx.fill(); cx.stroke();
    [-1, 1].forEach((q) => { cx.fillStyle = '#e08a3e'; cx.beginPath(); cx.moveTo(q * 25, -6); cx.lineTo(q * 24, -36); cx.lineTo(q * 5, -20); cx.closePath(); cx.fill(); cx.stroke(); cx.fillStyle = '#f5a3a8'; cx.beginPath(); cx.moveTo(q * 21, -11); cx.lineTo(q * 21, -29); cx.lineTo(q * 10, -20); cx.closePath(); cx.fill(); });
    cx.fillStyle = fur; cx.beginPath(); cx.ellipse(0, 0, 26, 23, 0, 0, 7); cx.fill(); cx.stroke();
    cx.strokeStyle = '#b8632a'; cx.lineWidth = 3.5; cx.lineCap = 'round'; [[-7, -21, -5, -13], [0, -23, 0, -14], [7, -21, 5, -13]].forEach(([a, b, c, d]) => { cx.beginPath(); cx.moveTo(a, b); cx.lineTo(c, d); cx.stroke(); });
    [-1, 1].forEach((q) => { cx.beginPath(); cx.moveTo(q * 25, -2); cx.lineTo(q * 18, 0); cx.moveTo(q * 25, 6); cx.lineTo(q * 19, 6); cx.stroke(); });
    cx.strokeStyle = PAL.ink; cx.lineWidth = 3; cx.fillStyle = '#fbe6c6'; [-1, 1].forEach((q) => { cx.beginPath(); cx.ellipse(q * 6.5, 10, 8, 6.5, 0, 0, 7); cx.fill(); cx.stroke(); });
    cx.fillStyle = '#f08a96'; cx.beginPath(); cx.moveTo(-4, 4); cx.lineTo(4, 4); cx.lineTo(0, 9); cx.closePath(); cx.fill(); cx.stroke();
    cx.strokeStyle = 'rgba(60,40,30,0.7)'; cx.lineWidth = 1.6; [-1, 1].forEach((q) => [[2, -3], [8, 0], [14, 3]].forEach(([dy, a]) => { cx.beginPath(); cx.moveTo(q * 12, 9 + dy * 0.3); cx.lineTo(q * 30, 4 + a * 2); cx.stroke(); }));
    [-1, 1].forEach((q) => { cx.fillStyle = PAL.ink; cx.beginPath(); cx.ellipse(q * 10, -5, 4.6, 5.6, 0, 0, 7); cx.fill(); cx.fillStyle = '#fff'; cx.beginPath(); cx.arc(q * 10 + 1.6, -7.2, 1.8, 0, 7); cx.fill(); });
    cx.fillStyle = 'rgba(240,120,120,0.45)'; [-1, 1].forEach((q) => { cx.beginPath(); cx.ellipse(q * 17, 5, 4, 2.6, 0, 0, 7); cx.fill(); }); }
  else if (t === 'wolf') { /* a fluffy wolf pup portrait: grey and white mask, tall ears, a teal bandana */
    const fur = cx.createRadialGradient(-6, -10, 4, 0, 0, 30); fur.addColorStop(0, '#b4bdc8'); fur.addColorStop(1, '#7b8693');
    cx.fillStyle = '#2f9c94'; cx.beginPath(); cx.moveTo(-18, 20); cx.lineTo(18, 20); cx.lineTo(0, 34); cx.closePath(); cx.fill(); cx.stroke();
    [-1, 1].forEach((q) => { cx.fillStyle = '#7b8693'; cx.beginPath(); cx.moveTo(q * 23, -8); cx.lineTo(q * 20, -38); cx.lineTo(q * 4, -20); cx.closePath(); cx.fill(); cx.stroke(); cx.fillStyle = '#eef0f2'; cx.beginPath(); cx.moveTo(q * 19, -12); cx.lineTo(q * 18, -30); cx.lineTo(q * 9, -20); cx.closePath(); cx.fill(); });
    cx.fillStyle = fur; cx.beginPath(); cx.moveTo(-22, -16); cx.bezierCurveTo(-18, -30, 18, -30, 22, -16); cx.lineTo(30, 6); cx.lineTo(22, 4); cx.lineTo(24, 14); cx.bezierCurveTo(14, 24, -14, 24, -24, 14); cx.lineTo(-22, 4); cx.lineTo(-30, 6); cx.closePath(); cx.fill(); cx.stroke();
    cx.fillStyle = '#eef0f2'; cx.beginPath(); cx.moveTo(-6, -14); cx.bezierCurveTo(-4, -4, -18, -4, -20, 8); cx.bezierCurveTo(-12, 22, 12, 22, 20, 8); cx.bezierCurveTo(18, -4, 4, -4, 6, -14); cx.closePath(); cx.fill();
    cx.fillStyle = '#f4f5f7'; cx.beginPath(); cx.ellipse(0, 10, 11, 9, 0, 0, 7); cx.fill(); cx.stroke();
    cx.fillStyle = PAL.ink; cx.beginPath(); cx.ellipse(0, 5, 6, 4.4, 0, 0, 7); cx.fill();
    cx.strokeStyle = PAL.ink; cx.lineWidth = 2.5; cx.beginPath(); cx.moveTo(0, 9); cx.lineTo(0, 13); cx.moveTo(-5, 15); cx.quadraticCurveTo(0, 18, 5, 15); cx.stroke();
    [-1, 1].forEach((q) => { cx.fillStyle = PAL.ink; cx.beginPath(); cx.ellipse(q * 10, -7, 4.4, 5.2, 0, 0, 7); cx.fill(); cx.fillStyle = '#fff'; cx.beginPath(); cx.arc(q * 10 + 1.5, -9, 1.7, 0, 7); cx.fill(); cx.fillStyle = '#eef0f2'; cx.beginPath(); cx.ellipse(q * 9, -15, 3.5, 2, q * 0.3, 0, 7); cx.fill(); }); }
  else if (t === 'bear') { /* a teddy bear cub portrait: round ears, a honey muzzle, rosy cheeks and a red bow */
    const fur = cx.createRadialGradient(-6, -8, 4, 0, 2, 28); fur.addColorStop(0, '#b78256'); fur.addColorStop(1, '#85573a');
    [-1, 1].forEach((q) => { cx.fillStyle = '#8f6040'; cx.beginPath(); cx.arc(q * 19, -19, 10, 0, 7); cx.fill(); cx.stroke(); cx.fillStyle = '#e8c49a'; cx.beginPath(); cx.arc(q * 19, -19, 5, 0, 7); cx.fill(); });
    cx.fillStyle = fur; cx.beginPath(); cx.ellipse(0, 2, 26, 23, 0, 0, 7); cx.fill(); cx.stroke();
    cx.fillStyle = '#d8423a'; [-1, 1].forEach((q) => { cx.beginPath(); cx.moveTo(0, 27); cx.lineTo(q * 13, 21); cx.lineTo(q * 13, 33); cx.closePath(); cx.fill(); cx.stroke(); }); cx.beginPath(); cx.arc(0, 27, 4, 0, 7); cx.fill(); cx.stroke();
    cx.fillStyle = '#ecd0a8'; cx.beginPath(); cx.ellipse(0, 10, 12, 9.5, 0, 0, 7); cx.fill(); cx.stroke();
    cx.fillStyle = PAL.ink; cx.beginPath(); cx.ellipse(0, 6, 5.6, 4, 0, 0, 7); cx.fill();
    cx.strokeStyle = PAL.ink; cx.lineWidth = 2.5; cx.beginPath(); cx.moveTo(0, 9); cx.lineTo(0, 13); cx.moveTo(-5, 14); cx.quadraticCurveTo(0, 18, 5, 14); cx.stroke();
    [-1, 1].forEach((q) => { cx.fillStyle = PAL.ink; cx.beginPath(); cx.ellipse(q * 10, -4, 3.8, 4.6, 0, 0, 7); cx.fill(); cx.fillStyle = '#fff'; cx.beginPath(); cx.arc(q * 10 + 1.4, -5.8, 1.5, 0, 7); cx.fill(); });
    cx.fillStyle = 'rgba(240,120,110,0.5)'; [-1, 1].forEach((q) => { cx.beginPath(); cx.ellipse(q * 17, 7, 4.2, 2.8, 0, 0, 7); cx.fill(); }); }
  else if (t === 'paw') { cx.fillStyle = PAL.accent; cx.beginPath(); cx.ellipse(0, 8, 15, 13, 0, 0, 7); cx.fill(); cx.stroke(); [[-17, -8], [-6, -18], [6, -18], [17, -8]].forEach(([a, b]) => { cx.beginPath(); cx.ellipse(a, b, 6, 7.5, a * 0.02, 0, 7); cx.fill(); cx.stroke(); }); }
  else if (t === 'seed') { cx.fillStyle = '#7d5e4e'; cx.beginPath(); cx.ellipse(0, 16, 28, 11, 0, 0, 7); cx.fill(); cx.stroke(); cx.strokeStyle = PAL.leaf; cx.lineWidth = 5; cx.beginPath(); cx.moveTo(0, 12); cx.lineTo(0, -6); cx.stroke(); cx.fillStyle = PAL.leaf; cx.strokeStyle = PAL.ink; cx.lineWidth = 3; [-1, 1].forEach((q) => { cx.beginPath(); cx.ellipse(q * 11, -10, 12, 7, q * -0.5, 0, 7); cx.fill(); cx.stroke(); }); }
  else if (t === 'strawberry') { cx.fillStyle = '#e0453a'; cx.beginPath(); cx.moveTo(-22, -10); cx.quadraticCurveTo(-22, 22, 0, 28); cx.quadraticCurveTo(22, 22, 22, -10); cx.closePath(); cx.fill(); cx.stroke(); cx.fillStyle = PAL.sand; [[-9, 0], [7, -2], [0, 12], [-6, 18], [10, 12]].forEach(([a, b]) => { cx.beginPath(); cx.arc(a, b, 2.4, 0, 7); cx.fill(); }); cx.fillStyle = PAL.leaf; cx.beginPath(); cx.moveTo(-20, -12); cx.lineTo(0, -24); cx.lineTo(20, -12); cx.lineTo(0, -6); cx.closePath(); cx.fill(); cx.stroke(); }
  else if (t === 'pumpkin') { cx.fillStyle = '#ee8a2c'; [-14, 14, 0].forEach((q) => { cx.beginPath(); cx.ellipse(q, 6, 16, 20, 0, 0, 7); cx.fill(); cx.stroke(); }); cx.fillStyle = PAL.trunk; cx.fillRect(-4, -24, 8, 12); cx.strokeRect(-4, -24, 8, 12); }
  else if (t === 'sunflower') { cx.fillStyle = '#f6c443'; for (let k = 0; k < 10; k++) { const a = k / 10 * 6.283; cx.beginPath(); cx.ellipse(Math.cos(a) * 18, Math.sin(a) * 18, 10, 5, a, 0, 7); cx.fill(); cx.stroke(); } cx.fillStyle = '#6b4a3c'; cx.beginPath(); cx.arc(0, 0, 13, 0, 7); cx.fill(); cx.stroke(); }
  else if (t === 'fish' || t.indexOf('fish:') === 0) { const f = FISH.find((q) => 'fish:' + q.id === t) || FISH[0], L = 22 + f.len * 30; cx.fillStyle = f.f; cx.beginPath(); cx.moveTo(L - 4, 0); cx.lineTo(L + 16, -14); cx.lineTo(L + 16, 14); cx.closePath(); cx.fill(); cx.stroke(); cx.fillStyle = f.c; cx.beginPath(); cx.ellipse(0, 0, L, 15, 0, 0, 7); cx.fill(); cx.stroke(); cx.strokeStyle = f.s; cx.lineWidth = 4; for (let k = -1; k <= 1; k++) { cx.beginPath(); cx.moveTo(k * 10, -12); cx.lineTo(k * 10 - 3, 12); cx.stroke(); } cx.strokeStyle = PAL.ink; cx.lineWidth = 3; cx.fillStyle = PAL.ink; cx.beginPath(); cx.arc(-L + 10, -3, 3.5, 0, 7); cx.fill(); }
  else if (t === 'rod') { cx.strokeStyle = PAL.trunk; cx.lineWidth = 6; cx.beginPath(); cx.moveTo(-24, 26); cx.lineTo(18, -26); cx.stroke(); cx.strokeStyle = PAL.ink; cx.lineWidth = 2; cx.beginPath(); cx.moveTo(18, -26); cx.lineTo(18, 14); cx.stroke(); cx.lineWidth = 3; cx.fillStyle = PAL.accent; cx.beginPath(); cx.arc(18, 18, 6, 0, 7); cx.fill(); cx.stroke(); }
  else if (t === 'map') { cx.fillStyle = '#f6e7c4'; cx.beginPath(); cx.moveTo(-28, -18); cx.lineTo(-10, -24); cx.lineTo(10, -18); cx.lineTo(28, -24); cx.lineTo(28, 20); cx.lineTo(10, 26); cx.lineTo(-10, 20); cx.lineTo(-28, 26); cx.closePath(); cx.fill(); cx.stroke(); cx.lineWidth = 2.5; cx.beginPath(); cx.moveTo(-10, -24); cx.lineTo(-10, 20); cx.moveTo(10, -18); cx.lineTo(10, 26); cx.stroke(); cx.fillStyle = PAL.leaf; cx.beginPath(); cx.ellipse(-2, 4, 17, 12, -0.2, 0, 7); cx.fill(); cx.strokeStyle = '#c9a66b'; cx.setLineDash([4, 4]); cx.beginPath(); cx.moveTo(-20, 14); cx.quadraticCurveTo(-4, -4, 14, -6); cx.stroke(); cx.setLineDash([]); cx.strokeStyle = PAL.ink; cx.lineWidth = 3; cx.fillStyle = PAL.accent; cx.beginPath(); cx.moveTo(14, 2); cx.bezierCurveTo(4, -10, 8, -22, 14, -22); cx.bezierCurveTo(20, -22, 24, -10, 14, 2); cx.fill(); cx.stroke(); cx.fillStyle = PAL.paper; cx.beginPath(); cx.arc(14, -13, 3.5, 0, 7); cx.fill(); }
  else if (t === 'egg') { cx.fillStyle = PAL.snow; cx.beginPath(); cx.ellipse(0, 2, 20, 26, 0, 0, 7); cx.fill(); cx.stroke(); }
  else if (t === 'apple') { cx.fillStyle = PAL.accent; cx.beginPath(); cx.arc(0, 4, 23, 0, 7); cx.fill(); cx.stroke(); cx.fillStyle = PAL.leaf; cx.beginPath(); cx.ellipse(10, -24, 10, 5, -0.6, 0, 7); cx.fill(); cx.stroke(); }
  else if (t === 'milk') { cx.fillStyle = PAL.paper; cx.beginPath(); cx.roundRect ? cx.roundRect(-16, -14, 32, 42, 6) : cx.rect(-16, -14, 32, 42); cx.fill(); cx.stroke(); cx.fillStyle = PAL.sea; cx.fillRect(-9, -28, 18, 14); cx.strokeRect(-9, -28, 18, 14); }
  else if (t === 'cake') { cx.fillStyle = PAL.sand; cx.fillRect(-26, -2, 52, 24); cx.strokeRect(-26, -2, 52, 24); cx.fillStyle = PAL.blush; cx.fillRect(-26, -12, 52, 10); cx.strokeRect(-26, -12, 52, 10); cx.fillStyle = PAL.accent; cx.beginPath(); cx.arc(0, -18, 7, 0, 7); cx.fill(); cx.stroke(); }
  else if (t === 'coin') { cx.fillStyle = PAL.ochre; cx.beginPath(); cx.arc(0, 0, 22, 0, 7); cx.fill(); cx.stroke(); cx.strokeStyle = '#b9822a'; cx.beginPath(); cx.arc(0, 0, 13, 0, 7); cx.stroke(); }
  else if (t === 'guest') { cx.fillStyle = PAL.paper; [[-8, -30], [8, -30]].forEach(([a, b]) => { cx.beginPath(); cx.ellipse(a, b, 7, 17, 0, 0, 7); cx.fill(); cx.stroke(); }); cx.beginPath(); cx.arc(0, 4, 25, 0, 7); cx.fill(); cx.stroke(); cx.fillStyle = PAL.ink; cx.beginPath(); cx.arc(-9, 0, 3.5, 0, 7); cx.arc(9, 0, 3.5, 0, 7); cx.fill(); cx.fillStyle = PAL.blush; cx.beginPath(); cx.arc(0, 10, 4.5, 0, 7); cx.fill(); }
  else if (t === 'dump') { cx.fillStyle = PAL.ochre; cx.beginPath(); cx.moveTo(-26, -4); cx.lineTo(26, -4); cx.lineTo(18, 26); cx.lineTo(-18, 26); cx.closePath(); cx.fill(); cx.stroke(); cx.strokeStyle = '#b9822a'; cx.lineWidth = 3; [6, 15].forEach((q) => { cx.beginPath(); cx.moveTo(-22 + (q - 4) * 0.25, q); cx.lineTo(22 - (q - 4) * 0.25, q); cx.stroke(); }); cx.strokeStyle = PAL.ink; cx.lineWidth = 4; cx.fillStyle = PAL.paper; cx.beginPath(); cx.moveTo(-6, -8); cx.lineTo(-6, -22); cx.lineTo(-14, -22); cx.lineTo(0, -34); cx.lineTo(14, -22); cx.lineTo(6, -22); cx.lineTo(6, -8); cx.closePath(); cx.fill(); cx.stroke(); }
  else if (t === 'bed') { cx.fillStyle = PAL.trunk; cx.fillRect(-30, -2, 8, 26); cx.strokeRect(-30, -2, 8, 26); cx.fillStyle = '#7b9fd6'; cx.fillRect(-22, 4, 50, 14); cx.strokeRect(-22, 4, 50, 14); cx.fillStyle = PAL.snow; cx.fillRect(-20, -4, 16, 9); cx.strokeRect(-20, -4, 16, 9); cx.fillStyle = PAL.trunk; cx.fillRect(-22, 18, 50, 6); cx.strokeRect(-22, 18, 50, 6); cx.fillStyle = '#f4d76a'; const mn = new Path2D('M10 -36 A15 15 0 1 0 28 -14 A11 11 0 1 1 10 -36 Z'); cx.fill(mn); cx.stroke(mn); }
  else if (t === 'sun') { cx.lineCap = 'round'; for (let k = 0; k < 8; k++) { const a = k / 8 * 6.283; cx.beginPath(); cx.moveTo(Math.cos(a) * 21, Math.sin(a) * 21); cx.lineTo(Math.cos(a) * 30, Math.sin(a) * 30); cx.stroke(); } cx.fillStyle = '#f2c14a'; cx.beginPath(); cx.arc(0, 0, 15, 0, 7); cx.fill(); cx.stroke(); }
  else if (t === 'rain' || t === 'cloud') {
    const C = [[-14, -2, 11], [1, -10, 15], [16, -2, 11]], y0 = t === 'rain' ? -6 : 0;
    cx.lineWidth = 8; C.forEach(([a, b, r]) => { cx.beginPath(); cx.arc(a, b + y0, r, 0, 7); cx.stroke(); }); cx.strokeRect(-14, -2 + y0, 30, 11);
    cx.fillStyle = '#eef2f5'; C.forEach(([a, b, r]) => { cx.beginPath(); cx.arc(a, b + y0, r, 0, 7); cx.fill(); }); cx.fillRect(-14, -2 + y0, 30, 11);
    if (t === 'rain') { cx.lineWidth = 3; cx.fillStyle = '#5aa9d6'; [[-12, 18], [2, 24], [16, 18]].forEach(([a, b]) => { cx.beginPath(); cx.moveTo(a, b - 8); cx.quadraticCurveTo(a + 6, b + 1, a, b + 5); cx.quadraticCurveTo(a - 6, b + 1, a, b - 8); cx.fill(); cx.stroke(); }); }
  }
  else if (t === 'wind') {
    cx.lineCap = 'round'; const path = () => { cx.beginPath(); cx.moveTo(-28, -10); cx.lineTo(8, -10); cx.arc(8, -17, 7, Math.PI / 2, -Math.PI, true); cx.moveTo(-28, 3); cx.lineTo(18, 3); cx.arc(18, 10, 7, -Math.PI / 2, Math.PI, false); cx.moveTo(-22, 16); cx.lineTo(4, 16); };
    cx.lineWidth = 11; path(); cx.stroke(); cx.strokeStyle = '#9fd0e8'; cx.lineWidth = 5; path(); cx.stroke();
  }
  else if (t === 'snow') {
    cx.lineCap = 'round'; const path = () => { cx.beginPath(); for (let k = 0; k < 3; k++) { const a = k / 3 * Math.PI + Math.PI / 2, c = Math.cos(a), s = Math.sin(a); cx.moveTo(-c * 26, -s * 26); cx.lineTo(c * 26, s * 26); [-1, 1].forEach((e) => { const ex = c * 26 * e, ey = s * 26 * e, bx = c * 17 * e, by = s * 17 * e; cx.moveTo(bx - s * 7, by + c * 7); cx.lineTo(ex * 0.82, ey * 0.82); cx.lineTo(bx + s * 7, by - c * 7); }); } };
    cx.lineWidth = 10; path(); cx.stroke(); cx.strokeStyle = '#bfe2f6'; cx.lineWidth = 5; path(); cx.stroke();
  }
  else if (t === 'mist') {
    cx.lineCap = 'round'; const path = () => { cx.beginPath(); cx.moveTo(-26, -14); cx.lineTo(18, -14); cx.moveTo(-18, 0); cx.lineTo(26, 0); cx.moveTo(-26, 14); cx.lineTo(14, 14); };
    cx.lineWidth = 13; path(); cx.stroke(); cx.strokeStyle = '#dfe6ea'; cx.lineWidth = 7; path(); cx.stroke();
  }
  else if (t === 'moon') { cx.fillStyle = '#f4d76a'; const mn = new Path2D('M4 -28 A26 26 0 1 0 28 8 A19 19 0 1 1 4 -28 Z'); cx.fill(mn); cx.stroke(mn); cx.fillStyle = '#fff6e4'; [[-20, -22, 3], [24, -24, 2.5]].forEach(([a, b, r]) => { cx.beginPath(); cx.arc(a, b, r, 0, 7); cx.fill(); }); }
  else if (t === 'market') { /* a market stall: striped awning on two posts, a counter with an apple and an egg */
    cx.fillStyle = PAL.trunk; cx.fillRect(-27, -16, 6, 42); cx.strokeRect(-27, -16, 6, 42); cx.fillRect(21, -16, 6, 42); cx.strokeRect(21, -16, 6, 42);
    cx.fillStyle = PAL.accent; cx.beginPath(); cx.arc(-11, 2, 8, 0, 7); cx.fill(); cx.stroke(); cx.fillStyle = PAL.snow; cx.beginPath(); cx.ellipse(8, 1, 6.5, 8.5, 0, 0, 7); cx.fill(); cx.stroke();
    cx.fillStyle = '#c98a4b'; cx.fillRect(-32, 8, 64, 18); cx.strokeRect(-32, 8, 64, 18); cx.beginPath(); cx.moveTo(-32, 15); cx.lineTo(32, 15); cx.stroke();
    for (let k = 0; k < 4; k++) { const x0 = -32 + k * 16; cx.fillStyle = k % 2 ? PAL.paper : '#e9684a'; cx.beginPath(); cx.moveTo(x0, -30); cx.lineTo(x0 + 16, -30); cx.lineTo(x0 + 16, -18); cx.arc(x0 + 8, -18, 8, 0, Math.PI); cx.closePath(); cx.fill(); }
    cx.beginPath(); cx.moveTo(-32, -18); cx.lineTo(-32, -30); cx.lineTo(32, -30); cx.lineTo(32, -18); for (let k = 3; k >= 0; k--) cx.arc(-32 + k * 16 + 8, -18, 8, 0, Math.PI); cx.closePath(); cx.stroke(); }
  else if (t === 'barn' || t === 'stall') { cx.fillStyle = '#c4553f'; cx.beginPath(); cx.moveTo(-28, 26); cx.lineTo(-28, -6); cx.lineTo(-16, -22); cx.lineTo(16, -22); cx.lineTo(28, -6); cx.lineTo(28, 26); cx.closePath(); cx.fill(); cx.stroke(); cx.fillStyle = '#6b4a3c'; cx.beginPath(); cx.moveTo(-32, -4); cx.lineTo(-17, -26); cx.lineTo(17, -26); cx.lineTo(32, -4); cx.lineTo(26, -4); cx.lineTo(14, -20); cx.lineTo(-14, -20); cx.lineTo(-26, -4); cx.closePath(); cx.fill(); cx.stroke(); cx.fillStyle = PAL.paper; cx.fillRect(-12, 2, 24, 24); cx.strokeRect(-12, 2, 24, 24); cx.lineWidth = 3; cx.beginPath(); cx.moveTo(-12, 2); cx.lineTo(12, 26); cx.moveTo(12, 2); cx.lineTo(-12, 26); cx.stroke();
    if (t === 'stall') { cx.lineWidth = 4; cx.fillStyle = '#74a857'; cx.beginPath(); cx.arc(22, -24, 12, 0, 7); cx.fill(); cx.stroke(); cx.fillStyle = PAL.paper; cx.fillRect(19.5, -31, 5, 14); cx.fillRect(15, -26.5, 14, 5); } }
  else if (t === 'goat') { const col = '#f3ede2'; cx.fillStyle = PAL.sand; [-1, 1].forEach((q) => { cx.beginPath(); cx.moveTo(q * 8, -18); cx.quadraticCurveTo(q * 20, -40, q * 28, -26); cx.lineTo(q * 14, -16); cx.closePath(); cx.fill(); cx.stroke(); }); cx.fillStyle = col; [-1, 1].forEach((q) => { cx.beginPath(); cx.ellipse(q * 26, -4, 12, 6, q * 0.4, 0, 7); cx.fill(); cx.stroke(); }); cx.beginPath(); cx.ellipse(0, 0, 20, 25, 0, 0, 7); cx.fill(); cx.stroke(); cx.fillStyle = '#d8cfc0'; cx.beginPath(); cx.moveTo(-7, 20); cx.lineTo(7, 20); cx.lineTo(0, 36); cx.closePath(); cx.fill(); cx.stroke(); cx.fillStyle = PAL.ink; cx.beginPath(); cx.arc(-8, -4, 3.5, 0, 7); cx.arc(8, -4, 3.5, 0, 7); cx.fill(); cx.fillStyle = PAL.blush; cx.beginPath(); cx.ellipse(0, 11, 8, 5, 0, 0, 7); cx.fill(); cx.stroke(); }
  else if (t === 'hen' || t === 'pig' || t === 'cow' || t === 'horse' || t === 'bull' || t === 'sheep') {
    const col = { hen: PAL.paper, pig: '#f4b0a2', cow: PAL.paper, horse: '#a8714d', bull: '#6b4a3c', sheep: '#3f3a3a' }[t];
    if (t === 'sheep') { cx.fillStyle = PAL.snow; [[-18, -16], [0, -24], [18, -16], [-24, 2], [24, 2]].forEach(([a, b]) => { cx.beginPath(); cx.arc(a, b, 12, 0, 7); cx.fill(); cx.stroke(); }); }
    if (t === 'hen') { cx.fillStyle = PAL.accent; cx.beginPath(); cx.arc(0, -28, 7, 0, 7); cx.fill(); cx.stroke(); }
    if (t === 'cow' || t === 'bull') { cx.fillStyle = PAL.sand; [-1, 1].forEach((q) => { cx.beginPath(); cx.moveTo(q * 16, -18); cx.lineTo(q * (t === 'bull' ? 34 : 26), -34); cx.lineTo(q * 22, -14); cx.closePath(); cx.fill(); cx.stroke(); }); }
    if (t === 'horse') { cx.fillStyle = PAL.ink; cx.fillRect(-6, -34, 12, 18); }
    if (t === 'pig') { cx.fillStyle = col; [-1, 1].forEach((q) => { cx.beginPath(); cx.moveTo(q * 10, -20); cx.lineTo(q * 22, -30); cx.lineTo(q * 22, -12); cx.closePath(); cx.fill(); cx.stroke(); }); }
    cx.fillStyle = col; cx.beginPath(); cx.arc(0, 0, 24, 0, 7); cx.fill(); cx.stroke();
    if (t === 'cow') { cx.fillStyle = PAL.ink; cx.beginPath(); cx.arc(-10, -10, 6, 0, 7); cx.fill(); }
    cx.fillStyle = PAL.ink; cx.beginPath(); cx.arc(-8, -4, 3.5, 0, 7); cx.arc(8, -4, 3.5, 0, 7); cx.fill();
    if (t === 'hen') { cx.fillStyle = PAL.ochre; cx.beginPath(); cx.moveTo(-6, 4); cx.lineTo(6, 4); cx.lineTo(0, 14); cx.closePath(); cx.fill(); cx.stroke(); }
    else { cx.fillStyle = t === 'pig' ? '#e88f80' : PAL.blush; cx.beginPath(); cx.ellipse(0, 10, 11, 7, 0, 0, 7); cx.fill(); cx.stroke(); }
    if (t === 'bull') { cx.strokeStyle = PAL.ochre; cx.lineWidth = 3; cx.beginPath(); cx.arc(0, 18, 5, 0, 7); cx.stroke(); }
  }
  cx.restore();
}
function bubble(type) {
  if (bubbleTex[type]) return bubbleTex[type];
  /* a soft paper bubble: drop shadow, warm parchment gradient, a stitched inner edge and a little tail */
  const c = document.createElement('canvas'); c.width = 160; c.height = 160; const x = c.getContext('2d');
  const a1 = Math.atan2(52, -14), a2 = Math.atan2(52, 14) + Math.PI * 2, shape = () => { x.beginPath(); x.moveTo(80, 150); x.lineTo(80 - 14, 70 + 52); x.arc(80, 68, 56, a1, a2); x.closePath(); };
  x.save(); x.shadowColor = 'rgba(70,40,18,0.4)'; x.shadowBlur = 9; x.shadowOffsetY = 5; shape(); x.fillStyle = '#f3e2bf'; x.fill(); x.restore();
  const gr = x.createRadialGradient(66, 50, 6, 80, 68, 60); gr.addColorStop(0, '#fffdf6'); gr.addColorStop(1, '#efdcb4'); shape(); x.fillStyle = gr; x.fill(); x.lineWidth = 5; x.strokeStyle = '#6e4426'; x.stroke();
  x.setLineDash([7, 5]); x.lineWidth = 2.4; x.strokeStyle = 'rgba(150,105,60,0.6)'; x.beginPath(); x.arc(80, 68, 47, 0, 7); x.stroke(); x.setLineDash([]);
  drawIcon(x, type, 80, 70, 1.35);
  const tex = new T.CanvasTexture(c); bubbleTex[type] = tex; return tex;
}
/* zone rings on the ground so a small child can see where to stand */
const ringMat = new T.MeshBasicMaterial({ color: PAL.paper, transparent: true, opacity: 0.55 });
/* action button pictures: an icon, or a small icon over a bigger one */
const ACT_ICON = {};
function actIcon(name, sub) {
  const key = name + (sub || ''); if (ACT_ICON[key]) return ACT_ICON[key];
  const c = document.createElement('canvas'); c.width = 128; c.height = 128; const x = c.getContext('2d');
  if (sub) { drawIcon(x, sub, 54, 70, 1.05); drawIcon(x, name, 92, 34, 0.7); } else drawIcon(x, name, 64, 66, 1.35);
  return (ACT_ICON[key] = c.toDataURL());
}
