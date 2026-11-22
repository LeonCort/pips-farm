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
function ring(x, z, r) { return flRing(x, z, r); } /* rope on grass, stones on paths (farmlook.js) */

/* ---------- food sources ---------- */
const sources = {};
function addSource(t) {
  if (sources[t]) return; const s = SRC[t], g = new T.Group(); g.position.set(s.x, 0, s.z); sc.add(g);
  if (t === 'grain') { flSilo(g); /* corrugated silo with sacks and clutter (farmlook.js) */ for (let k = 0; k < 3; k++) { const m = PROTO.grain.clone(); m.position.set(-0.35 + k * 0.35, 0, 0.6); g.add(m); } }
  if (t === 'water') { flWell(g); /* stone well with a shingle roof (farmlook.js) */ const m = PROTO.water.clone(); m.position.set(0.25, 0, 0.62); g.add(m); }
  if (t === 'carrot') { let c = new T.BoxGeometry(1.4, 0.1, 1.0); c.translate(0, 0.05, 0); part(fac(jit(c, 0.02, 3), '#8a6248', 37), g); for (let k = 0; k < 6; k++) { const l = new T.ConeGeometry(0.06, 0.24, 4); part(fac(l, PAL.leaf, 38 + k), g, -0.45 + (k % 3) * 0.45, 0.2, -0.2 + Math.floor(k / 3) * 0.4); } }
  if (t === 'hay') { for (let k = 0; k < 5; k++) { const b = new T.CylinderGeometry(0.27, 0.27, 0.6, 14, 1); b.rotateZ(Math.PI / 2); part(fac(jit(b, 0.012, k), (cx, cy, cz, i) => tone(Math.abs(cx) > 0.28 ? '#d7a84e' : PAL.ochre, i, 0.7).multiplyScalar(0.82 + 0.3 * clamp(cy / 0.55, 0, 1))), g, k < 3 ? -0.66 + k * 0.66 : -0.33 + (k - 3) * 0.66, k < 3 ? 0.27 : 0.74, 0); } }
  ring(s.x, s.z + 1.0, 0.85); sources[t] = { t, g, x: s.x, z: s.z + 1.0 };
}

/* ---------- animals ---------- */
const AN_COL = { pig: '#f4b0a2', horse: '#a8714d', bull: '#6b4a3c' };
/* every animal gets its own coat: the first of a kind looks as before, the next ones differ */
const COATS = {
  hen: [{ b: PAL.paper }, { b: '#c9773f' }, { b: '#3a3433' }, { b: PAL.paper, s: '#8a5a3c' }, { b: '#e8c27a' }, { b: '#9a948c', s: PAL.paper }],
  pig: [{ b: '#f4b0a2' }, { b: '#f4b0a2', s: '#3a3433' }, { b: '#a8714d' }, { b: '#e8968a' }, { b: '#f7c9bd', s: '#c9773f' }, { b: '#5a4a46' }],
  sheep: [{ b: PAL.snow, h: '#3f3a3a' }, { b: '#efe1c4', h: PAL.paper }, { b: '#9a948c', h: '#3f3a3a' }, { b: '#3f3a3a', h: '#2a2626' }, { b: '#d8c3a5', h: '#8a5a3c' }],
  horse: [{ b: '#a8714d', m: PAL.ink }, { b: '#3a3433', m: '#1c1a1a' }, { b: '#e0b36a', m: PAL.paper }, { b: '#d9d4cc', m: '#8f8a86' }, { b: PAL.paper, s: '#6b4a3c', m: '#6b4a3c' }, { b: '#6b4a3c', m: PAL.ink }, { b: '#c9773f', m: '#efe1c4' }],
  cow: [{ b: PAL.paper, s: PAL.ink }, { b: '#8a5a3c', s: PAL.paper }, { b: '#b07a4f' }, { b: '#3a3433', s: PAL.paper }, { b: '#efe1c4', s: '#a8714d' }],
  bull: [{ b: '#6b4a3c' }, { b: '#3a3433' }, { b: '#a8714d' }, { b: '#8f8a86' }, { b: '#efe1c4', s: '#8a5a3c' }],
  goat: [{ b: '#f3ede2', h: '#d8cfc0' }, { b: '#8a5a3c', h: '#3a3433' }, { b: '#3a3433', h: '#efe1c4' }, { b: '#d9d4cc', s: '#6b4a3c', h: '#6b4a3c' }, { b: '#c9773f', h: '#f3ede2' }]
};
const coatOf = (a, i) => { const l = COATS[a]; return l[(i - 1) % l.length]; };
/* patches for spotted coats; plain coats paint as before */
const coatPaint = (c, seed, big) => c.s && big ? (x, y, z) => { const q = big; return tone(hash(Math.floor(x * q + 20) + seed * 3.1, Math.floor(y * q + 20), Math.floor(z * q + 20)) > 0.58 ? c.s : c.b, x * 31.1 + y * 53.3 + z * 77.7 + seed); } : c.b;
function animalModel(a, i, coat) {
  const g = new T.Group(), body = new T.Group(); g.add(body); let geo;
  const c = coat || coatOf(a, i);
  if (a === 'hen') {
    geo = ico(0.24, 1, i, 0.02); geo.scale(1.1, 0.9, 1); part(fac(geo, coatPaint(c, i, 9), i), body, 0, 0.3, 0);
    part(fac(ico(0.13, 0, i + 1), c.b, i + 1), body, 0, 0.55, 0.17); part(fac(new T.BoxGeometry(0.04, 0.09, 0.12), PAL.accent, 3), body, 0, 0.7, 0.16);
    geo = new T.ConeGeometry(0.04, 0.09, 4); geo.rotateX(Math.PI / 2); part(fac(geo, PAL.ochre, 2), body, 0, 0.55, 0.33);
    [-0.05, 0.05].forEach((x) => { const e = new T.Mesh(new T.SphereGeometry(0.02, 6, 4), ink); e.position.set(x, 0.6, 0.27); body.add(e); });
    return { g, body, h: 0.95 };
  }
  if (a === 'pig') {
    geo = ico(0.36, 1, i, 0.02); geo.scale(1, 0.8, 1.25); part(fac(geo, coatPaint(c, i, 7), i), body, 0, 0.42, 0);
    geo = new T.CylinderGeometry(0.11, 0.12, 0.08, 7); geo.rotateX(Math.PI / 2); part(fac(geo, '#e88f80', 2), body, 0, 0.44, 0.47);
    [-0.15, 0.15].forEach((x, k) => { const e = new T.ConeGeometry(0.07, 0.14, 3); part(fac(e, c.b, 3 + k), body, x, 0.72, 0.25); const y = new T.Mesh(new T.SphereGeometry(0.03, 6, 4), ink); y.position.set(x * 0.7, 0.55, 0.42); body.add(y); });
    for (let k = 0; k < 4; k++) { geo = new T.CylinderGeometry(0.06, 0.06, 0.18, 5); geo.translate(0, 0.09, 0); part(fac(geo, c.b, 5 + k), body, k % 2 ? 0.17 : -0.17, 0, k < 2 ? 0.22 : -0.22); }
    geo = new T.TorusGeometry(0.06, 0.02, 4, 8, 4.5); part(fac(geo, c.b, 9), body, 0, 0.5, -0.46);
    return { g, body, h: 1.15 };
  }
  if (a === 'sheep') {
    for (let k = 0; k < 7; k++) part(fac(ico(0.2, 0, k + i), c.b, k), body, Math.cos(k * 0.9) * 0.2, 0.55 + (k % 2) * 0.12, -0.25 + k * 0.08);
    geo = ico(0.15, 0, i + 3); geo.scale(0.9, 1, 1.2); part(fac(geo, c.h, 3), body, 0, 0.72, 0.42);
    [-0.07, 0.07].forEach((x) => { const e = new T.Mesh(new T.SphereGeometry(0.025, 6, 4), new T.MeshBasicMaterial({ color: PAL.snow })); e.position.set(x, 0.78, 0.55); body.add(e); const ear = new T.BoxGeometry(0.12, 0.04, 0.06); part(fac(ear, c.h, 4), body, x * 2.2, 0.76, 0.38); });
    for (let k = 0; k < 4; k++) { geo = new T.CylinderGeometry(0.04, 0.04, 0.34, 5); geo.translate(0, 0.17, 0); part(fac(geo, c.h, 5 + k), body, k % 2 ? 0.13 : -0.13, 0, k < 2 ? 0.2 : -0.2); }
    return { g, body, h: 1.0 };
  }
  if (a === 'goat') {
    /* a nimble goat: slim body, thin legs, a little beard and two horns curving back */
    const hd = c.h || c.b; geo = new T.BoxGeometry(0.34, 0.32, 0.68, 2, 2, 2); part(fac(jit(geo, 0.025, i), coatPaint(c, i, 6), i), body, 0, 0.6, 0);
    for (let k = 0; k < 4; k++) { geo = new T.CylinderGeometry(0.035, 0.03, 0.46, 5); geo.translate(0, 0.23, 0); part(fac(geo, k < 2 ? c.b : hd, 10 + k), body, k % 2 ? 0.11 : -0.11, 0, k < 2 ? 0.24 : -0.24); }
    geo = new T.BoxGeometry(0.15, 0.36, 0.16); geo.rotateX(0.45); part(fac(geo, c.b, 14), body, 0, 0.86, 0.36);
    geo = new T.BoxGeometry(0.17, 0.19, 0.3); part(fac(geo, c.b, 15), body, 0, 1.04, 0.5); part(fac(new T.BoxGeometry(0.13, 0.1, 0.06), PAL.blush, 16), body, 0, 0.99, 0.66);
    geo = new T.ConeGeometry(0.04, 0.14, 4); geo.rotateX(Math.PI); part(fac(geo, hd, 17), body, 0, 0.88, 0.6);
    [-1, 1].forEach((s) => { const hn = new T.ConeGeometry(0.03, 0.2, 5); hn.translate(0, 0.1, 0); hn.rotateX(-0.75); part(fac(hn, PAL.sand, 18), body, s * 0.05, 1.12, 0.44); const ear = new T.BoxGeometry(0.14, 0.04, 0.07); ear.rotateZ(s * 0.35); part(fac(ear, c.b, 19), body, s * 0.13, 1.06, 0.44); const e = new T.Mesh(new T.SphereGeometry(0.022, 6, 4), ink); e.position.set(s * 0.065, 1.09, 0.64); body.add(e); });
    geo = new T.BoxGeometry(0.06, 0.12, 0.05); geo.rotateX(-0.5); part(fac(geo, hd, 20), body, 0, 0.8, -0.36);
    return { g, body, h: 1.3 };
  }
  /* cow, horse and bull share a four-legged body */
  const col = c.b, long = a === 'horse', spot = coatPaint(c, i, 5);
  geo = new T.BoxGeometry(0.5, 0.48, long ? 1.0 : 0.9, 2, 2, 2); part(fac(jit(geo, 0.03, i), a === 'cow' ? col : spot, i), body, 0, long ? 0.78 : 0.62, 0);
  if (a === 'cow' && c.s) for (let k = 0; k < 3; k++) [0.26, -0.26].forEach((sx, j) => { if (hash(k, i, j) > 0.3) part(fac(new T.BoxGeometry(0.02, 0.14 + hash(k, i, 2) * 0.14, 0.16 + hash(k, i, 3) * 0.14), c.s, k), body, sx, 0.66 + hash(k, i) * 0.1, -0.3 + k * 0.27 + (hash(k, j, i) - 0.5) * 0.1, true); });
  if (a === 'cow' && c.s) part(fac(new T.BoxGeometry(0.34, 0.02, 0.24), c.s, 4), body, (hash(i, 5) - 0.5) * 0.1, 0.87, -0.1 + (hash(i, 6) - 0.5) * 0.3, true);
  for (let k = 0; k < 4; k++) { geo = new T.CylinderGeometry(0.06, 0.06, long ? 0.56 : 0.4, 5); geo.translate(0, long ? 0.28 : 0.2, 0); part(fac(geo, col, 10 + k), body, k % 2 ? 0.16 : -0.16, 0, k < 2 ? 0.34 : -0.34); }
  if (long) {
    geo = new T.BoxGeometry(0.24, 0.55, 0.24); geo.rotateX(0.5); part(fac(geo, spot, 14), body, 0, 1.1, 0.52);
    geo = new T.BoxGeometry(0.22, 0.24, 0.42); part(fac(geo, col, 15), body, 0, 1.36, 0.72);
    geo = new T.BoxGeometry(0.06, 0.5, 0.3); geo.rotateX(0.5); part(fac(geo, c.m, 16), body, 0, 1.2, 0.46);
    geo = new T.BoxGeometry(0.08, 0.45, 0.08); geo.rotateX(-0.4); part(fac(geo, c.m, 17), body, 0, 0.7, -0.55);
    [-0.07, 0.07].forEach((x) => { const e = new T.Mesh(new T.SphereGeometry(0.025, 6, 4), ink); e.position.set(x * 1.6, 1.42, 0.8); body.add(e); const ear = new T.ConeGeometry(0.04, 0.12, 3); part(fac(ear, col, 18), body, x, 1.53, 0.62); });
    return { g, body, h: 1.95 };
  }
  geo = new T.BoxGeometry(0.32, 0.34, 0.34); part(fac(geo, col, 5), body, 0, 0.8, 0.55); part(fac(new T.BoxGeometry(0.28, 0.14, 0.1), PAL.blush, 6), body, 0, 0.72, 0.74);
  [-0.09, 0.09].forEach((x) => { const h = new T.ConeGeometry(a === 'bull' ? 0.045 : 0.03, a === 'bull' ? 0.22 : 0.12, 4); const m = part(fac(h, PAL.sand, 7), body, x * (a === 'bull' ? 2.2 : 1), 1.02, 0.5); if (a === 'bull') m.rotation.z = -Math.sign(x) * 0.9; const e = new T.Mesh(new T.SphereGeometry(0.025, 6, 4), ink); e.position.set(x * 1.2, 0.88, 0.72); body.add(e); });
  if (a === 'bull') { const r = new T.TorusGeometry(0.05, 0.015, 4, 8); part(fac(r, PAL.ochre, 8), body, 0, 0.66, 0.8); }
  geo = new T.BoxGeometry(0.05, 0.35, 0.05); geo.rotateX(-0.3); part(fac(geo, col, 9), body, 0, 0.62, -0.5);
  return { g, body, h: 1.4 };
}
const pens = {}, animals = [];
/* the pen grows outward with every animal; the trough side toward the middle stays put */
function penBox(a) {
  const kids = typeof babies !== 'undefined' ? babies.filter((b) => b.a === a).length : 0;
  return penSize(a, Math.max(1, animals.filter((o) => o.a === a).length + kids * 0.5));
}
function fencePen(a) {
  const pen = pens[a]; if (pen.fence) sc.remove(pen.fence);
  const b = penBox(a), fg = new T.Group(); fg.position.set(b.x, 0, b.z); sc.add(fg); pen.fence = fg;
  flPen(a, fg, b); /* floor, rough post-and-rail fence, straw, hay, water trough, mud (farmlook.js) */
  setHouse(a, pen.big);
}
function buildPen(a) {
  if (pens[a]) return pens[a]; const p = PEN[a], g = new T.Group(); g.position.set(p.x, 0, p.z); sc.add(g);
  /* the feeding side faces the middle of the farm: one spot per food there (stock.js) */
  const sx = penSide(a);
  const f = feedPos(a); ring(f[0], f[1], 0.85);
  const pen = { a, g, house: null, big: false, trough: [p.x + sx * (p.w / 2 - 0.75), p.z] }; pens[a] = pen;
  pen.inbound = {}; pen.food = stockPile(a, g); fencePen(a); return pen;
}
/* food on its way to a box counts too, so a box never overfills */
function boxCount(pen, t) { return pen.food.count(t) + (pen.inbound[t] || 0); }
function boxIn(pen, m, dur) { const t = m.userData.type; pen.inbound[t] = (pen.inbound[t] || 0) + 1; fly(m, () => { const q = stockAt(pen, t); return pen.g.localToWorld(tmpV.set(q[0], 0.4, q[1])); }, () => { pen.inbound[t]--; pen.food.add(m); }, dur); }
/* walls a touch darker at the foot and lighter under the eaves, like the cozy house */
function wallY(hex, y, h, key) { const c = tone(hex, key, 0.5), q = clamp(y / h, 0, 1); return c.multiplyScalar(0.8 + 0.28 * q); }
function setHouse(a, big) {
  const pen = pens[a]; if (!pen) return; if (pen.house) sc.remove(pen.house); pen.big = big;
  const h = housePos(a), g = new T.Group(); g.position.set(h[0], 0, h[1]); sc.add(g); pen.house = g;
  const s = big ? 1.5 : 1, wall = big ? PAL.accent : '#b07a55', roof = big ? '#8a5a3a' : PAL.accent, DK = '#6b4630', W = 0.9 * s, H = 0.6 * s, D = 0.7 * s, RH = 0.32 * s, OV = 0.08 * s;
  let geo = new T.BoxGeometry(W + 0.08 * s, 0.08 * s, D + 0.08 * s); geo.translate(0, 0.04 * s, 0); part(fac(geo, '#b8aa98', 69), g); /* stone plinth */
  geo = new T.BoxGeometry(W, H, D, 2, 2, 1); geo.translate(0, H / 2, 0); part(fac(jit(geo, 0.012, 3), (cx, cy, cz, i) => wallY(wall, cy, H, i)), g);
  const gable = new T.BufferGeometry(); gable.setAttribute('position', new T.BufferAttribute(new Float32Array([-W / 2, 0, 0, W / 2, 0, 0, 0, RH, 0]), 3));
  [1, -1].forEach((k) => { const q = gable.clone(); if (k < 0) q.rotateY(Math.PI); q.translate(0, H, k * D / 2); part(fac(q, (cx, cy, cz, i) => wallY(wall, cy, H + RH, i)), g); });
  /* corner beams, a gable roof of two boards with an overhang, and a ridge beam */
  [[-1, -1], [-1, 1], [1, -1], [1, 1]].forEach(([x, z]) => { geo = new T.BoxGeometry(0.06 * s, H, 0.06 * s); part(fac(geo, DK, 75), g, x * W / 2, H / 2, z * D / 2); });
  const span = W / 2 + OV, ang = Math.atan2(RH, span), L = Math.hypot(span, RH) + 0.02;
  flHouseRoof(g, s, W, H, D, RH, OV, roof, big); /* shingle texture, eave trim, shutters (farmlook.js) */
  [-1, 1].forEach((k) => { const sc2 = new T.BoxGeometry(L, 0.05 * s, D + 0.22 * s); sc2.rotateZ(-k * ang); snowCap(g, sc2, k * span / 2, H + RH / 2 + 0.085 * s, 0); });
  geo = new T.BoxGeometry(0.07 * s, 0.07 * s, D + 0.24 * s); part(fac(geo, DK, 76), g, 0, H + RH + 0.06 * s, 0);
  /* a wooden door in a dark frame with a brass knob */
  geo = new T.BoxGeometry(0.32 * s, 0.42 * s, 0.03); part(fac(geo, DK, 77), g, 0, 0.21 * s + 0.04 * s, D / 2 + 0.005);
  geo = new T.BoxGeometry(0.24 * s, 0.36 * s, 0.03); part(fac(geo, '#9a6542', 78), g, 0, 0.2 * s + 0.04 * s, D / 2 + 0.02);
  geo = new T.SphereGeometry(0.018 * s, 6, 4); part(fac(geo, '#e8b84a', 79), g, 0.07 * s, 0.22 * s, D / 2 + 0.04);
  /* little flower boxes under the windows */
  [-0.3, 0.3].forEach((x, k) => { geo = new T.BoxGeometry(0.2 * s, 0.05 * s, 0.07 * s); part(fac(geo, '#9a6542', 80), g, x * s, 0.27 * s, D / 2 + 0.035 * s);
    for (let j = 0; j < 3; j++) { geo = new T.IcosahedronGeometry(0.03 * s, 0); part(fac(geo, j === 1 ? '#5d9160' : ['#f6b8c8', '#f2c14a', '#fffbf4'][(j + k) % 3], 81 + j), g, x * s + (j - 1) * 0.06 * s, 0.31 * s, D / 2 + 0.04 * s, true); } });
  lightHouse(g, big); g.scale.setScalar(a === 'hen' ? 0.85 : 1);
}
function addAnimal(a) {
  const pen = buildPen(a), k = animals.filter((o) => o.a === a).length, m = animalModel(a, k + 1);
  const p = penSize(a, k + 1);
  const x = p.x + (hash(k, 7) - 0.5) * (p.w - 1.2), z = p.z + (hash(k, 9) - 0.5) * (p.d - 1.0); m.g.position.set(x, 0, z); m.g.rotation.y = hash(k, 3) * 6; sc.add(m.g);
  const sp = new T.Sprite(new T.SpriteMaterial({ map: bubble('heart'), depthTest: false })); sp.scale.set(0.62, 0.62, 1); sp.position.y = m.h + 0.35; sp.renderOrder = 5; sp.visible = false; m.g.add(sp);
  const an = { a, pen, g: m.g, body: m.body, h: m.h, sp, want: null, cd: 1 + hash(k, 4) * 3, tx: x, tz: z, hop: 0, wait: 0, glad: 0, incoming: 0 }; animals.push(an); if (k > 0) fencePen(a); return an;
}
/* a happy animal hops, hearts pop out and fly to the counter */
const heartGeo = (() => { const s = new T.Shape(); s.moveTo(0, -0.1); s.bezierCurveTo(-0.16, 0.0, -0.08, 0.14, 0, 0.06); s.bezierCurveTo(0.08, 0.14, 0.16, 0.0, 0, -0.1); const g = new T.ExtrudeGeometry(s, { depth: 0.04, bevelEnabled: false }); g.translate(0, 0, -0.02); return g; })();
const heartMat = new T.MeshBasicMaterial({ color: PAL.accent, side: T.DoubleSide });
function feed(an, m) {
  an.incoming = Math.max(0, an.incoming - 1); if (m) sc.remove(m);
  if (!an.want) return;
  an.want = null; an.sp.visible = false; an.cd = 14 + Math.random() * 12; /* calm: animals are content for a good while after a meal */ an.hop = 1; an.glad = 2.5; an.wait = 0;
  const n = Math.max(1, Math.round(HEARTS[an.a] * (an.pen.big ? 2 : 1) * heartMult()));
  earn(n); const wp = an.g.position; coinToHud(wp.x, an.h, wp.z, Math.min(6, n)); produce(an); maybeBaby(an); Snd.animal(an.a, { gain: 0.5, gap: 2200, rate: 0.96 + Math.random() * 0.08 });
  for (let k = 0; k < 5; k++) { const h = new T.Mesh(heartGeo, heartMat); h.position.set(wp.x, an.h, wp.z); const a = k / 5 * 6.283; h.userData = { v: new T.Vector3(Math.cos(a) * 1.2, 3 + hash(k, 5), Math.sin(a) * 1.2), t: 0 }; sc.add(h); pops.push(h); }
  Snd.play('coin', { gain: 0.45 }, 0, 90); Snd.play('sparkle', { gain: 0.35 }, 0.05, 200);
}
function available(t) { return !!sources[t]; }

/* ---------- helpers: each one looks after one kind of food ---------- */
const helpers = [];
function robot(hat) {
  const grp = new T.Group(), g = new T.BoxGeometry(0.4, 0.3, 0.34, 2, 2, 2); part(fac(jit(g, 0.015, 2), PAL.paper, 2), grp, 0, 0.36, 0);
  const v = new T.Mesh(new T.BoxGeometry(0.28, 0.11, 0.02), ink); v.position.set(0, 0.38, 0.18); grp.add(v);
  part(fac(new T.CylinderGeometry(0.11, 0.13, 0.09, 6), hat, 3), grp, 0, 0.56, 0);
  const w = new T.CylinderGeometry(0.08, 0.08, 0.07, 6); w.rotateZ(Math.PI / 2); part(fac(w, PAL.ink, 4), grp, -0.16, 0.1, 0); part(fac(w.clone(), PAL.ink, 5), grp, 0.16, 0.1, 0);
  return grp;
}
const FOOD_COL = { hay: PAL.ochre, grain: PAL.sand, carrot: '#ef8a2e', water: PAL.seaShallow };
function addHelper(t) {
  const home = [SRC[t].x, SRC[t].z - 1.25], g = robot(FOOD_COL[t]); g.position.set(home[0], 0, home[1]); sc.add(g);
  const h = { g, t, home, st: 'idle', target: null, k: 0 }; h.pile = new Pile(g, (k) => { let y = 0.52; for (let q = 0; q < k; q++) y += ITEM_H[t]; return [0, y, -0.28]; }); helpers.push(h);
}
/* the pen that most needs this food: someone is asking for it, or its box is running low */
function needy(t, h) {
  let best = null, bs = 0;
  for (const a in pens) { if (!DIET[a].includes(t)) continue; const pen = pens[a], have = boxCount(pen, t); if (have >= BOX_MAX - 1 || helpers.some((o) => o !== h && o.t === t && o.target === pen)) continue;
    const s = (BOX_MAX - have) + animals.filter((an) => an.a === a && an.want === t).length * 4; if (s > bs) { bs = s; best = pen; } }
  return best;
}
function runHelper(h, dt) {
  const p = h.g.position, sp = helpSpeed();
  if (h.st === 'idle') {
    const pen = needy(h.t, h);
    if (pen) { h.target = pen; h.st = h.pile.items.length ? 'go' : 'get'; } else walkTo(h.g, h.home[0], h.home[1], dt, 2);
  } else if (h.st === 'get') {
    const st = h.target && stationFor(h.target.a, h.t), gx = st ? st.x + 0.5 : SRC[h.t].x + 0.5, gz = st ? st.z - 0.2 : SRC[h.t].z + 0.8;
    if (walkTo(h.g, gx, gz, dt, sp)) { h.k -= dt; if (h.k <= 0) { h.k = 0.15; if (h.pile.items.length < 4) { const m = mk(h.t); m.position.set(st ? st.x : SRC[h.t].x, 0.5, st ? st.z - 0.7 : SRC[h.t].z); sc.add(m); fly(m, () => h.g.localToWorld(tmpV.set(0, 0.6 + h.pile.items.length * 0.2, -0.28)), () => h.pile.add(m)); } else h.st = 'go'; } }
  } else if (h.st === 'go') {
    const f = feedPos(h.target.a); if (walkTo(h.g, f[0] + 0.4, f[1] + 0.3, dt, sp)) { h.st = 'feed'; h.k = 0; }
  } else if (h.st === 'feed') {
    h.k -= dt; if (h.k <= 0) { h.k = 0.35;
      const pen = h.target;
      if (h.pile.items.length && boxCount(pen, h.t) < BOX_MAX) { const m = h.pile.take(); boxIn(pen, m, 0.4); }
      else { h.target = null; h.st = 'idle'; } }
  }
  p.y = h.st === 'get' || h.st === 'go' ? Math.abs(Math.sin(time * 12 + h.home[0])) * 0.04 : 0;
}

/* ---------- buy pads ---------- */
let pad = null;
function padTex(p, left) {
  const c = document.createElement('canvas'); c.width = 256; c.height = 256; const x = c.getContext('2d');
  { const gr = x.createRadialGradient(110, 100, 10, 128, 128, 124); gr.addColorStop(0, '#fffaf0'); gr.addColorStop(1, '#ecd6aa'); x.fillStyle = gr; x.beginPath(); x.arc(128, 128, 122, 0, 7); x.fill(); x.setLineDash([9, 7]); x.lineWidth = 3; x.strokeStyle = 'rgba(150,105,60,0.6)'; x.beginPath(); x.arc(128, 128, 98, 0, 7); x.stroke(); x.setLineDash([]); }
  x.lineWidth = 10; x.strokeStyle = PAL.ochre; x.beginPath(); x.arc(128, 128, 112, -Math.PI / 2, -Math.PI / 2 + 6.2832 * (1 - left / p.cost)); x.stroke();
  if (p.kind === 'animal') drawIcon(x, p.a, 128, 86, 1.3);
  else if (p.kind === 'tractor') drawIcon(x, 'tractor', 128, 86, 1.2);
  else if (p.kind === 'house') { drawIcon(x, 'house', 118, 84, 1.25); drawIcon(x, p.a, 176, 106, 0.6); }
  else if (p.kind === 'source') drawIcon(x, p.t, 128, 84, 1.3);
  else if (p.kind === 'helper') { drawIcon(x, 'robot', 118, 84, 1.2); drawIcon(x, p.t, 178, 108, 0.7); }
  drawIcon(x, 'heart', 76, 174, 0.75);
  x.fillStyle = PAL.ink; x.font = '700 58px Fredoka, sans-serif'; x.textAlign = 'left'; x.textBaseline = 'middle'; x.fillText(fmt(left), 100, 176);
  return new T.CanvasTexture(c);
}
function showPad() {
  if (pad) { sc.remove(pad.g); pad = null; }
  const p = nextPad(); if (!p) return;
  const pos = padPos(p), g = new T.Group(); g.position.set(pos[0], 0.04, pos[1]); sc.add(g);
  const disc = new T.Mesh(new T.CircleGeometry(0.75, 32), new T.MeshBasicMaterial({ map: padTex(p, p.cost - (state.paid[p.id] || 0)), transparent: true })); disc.rotation.x = -Math.PI / 2; g.add(disc);
  g.add(flPadEdge());
  pad = { p, g, disc, shown: -1, coinT: 0 };
}
function build(p) {
  if (p.kind === 'tractor') addTractor(); else if (p.kind === 'animal') addAnimal(p.a); else if (p.kind === 'house') setHouse(p.a, true); else if (p.kind === 'source') addSource(p.t); else if (p.kind === 'helper') addHelper(p.t);
}
function unlock(p) {
  state.owned[p.id] = true; delete state.paid[p.id]; build(p);
  Snd.init(); Snd.play('success', { gain: 0.6, f: 'E6' }); Snd.play('sparkle', { gain: 0.6 }, 0.12);
  pop(padPos(p)); showPad(); save();
}
const pops = [];
function pop(pos) { for (let k = 0; k < 10; k++) { const m = new T.Mesh(new T.OctahedronGeometry(0.09, 0), new T.MeshBasicMaterial({ color: [PAL.ochre, PAL.accent, PAL.seaShallow][k % 3] })); m.position.set(pos[0], 0.5, pos[1]); const a = k / 10 * 6.283; m.userData = { v: new T.Vector3(Math.cos(a) * 2.2, 4 + hash(k, 3) * 2, Math.sin(a) * 2.2), t: 0 }; sc.add(m); pops.push(m); } }

/* guide arrow for children who cannot read */
const arrow = new T.Group(); sc.add(arrow);
{ const c = new T.ConeGeometry(0.3, 0.6, 8); c.rotateX(Math.PI); part(fac(c, PAL.accent, 3), arrow, 0, 0, 0, true); const b = new T.CylinderGeometry(0.13, 0.13, 0.4, 8); part(fac(b, PAL.accent, 4), arrow, 0, 0.45, 0, true); }
const goalRing = new T.Mesh(new T.RingGeometry(0.75, 0.95, 32), new T.MeshBasicMaterial({ color: PAL.accent, transparent: true })); goalRing.rotation.x = -Math.PI / 2; sc.add(goalRing);
const chevron = new T.Mesh(new T.ConeGeometry(0.16, 0.38, 3), new T.MeshBasicMaterial({ color: PAL.accent, transparent: true, opacity: 0.85 })); chevron.rotation.x = Math.PI / 2; const chevG = new T.Group(); chevG.add(chevron); sc.add(chevG);
function goal() {
  const p = nextPad();
  if (p && state.coins >= p.cost - (state.paid[p.id] || 0)) return padPos(p);
  /* carrying food a pen can use: take it there, the pen with a hungry animal first */
  const fits = (a) => carry.items.some((m) => DIET[a].includes(m.userData.type) && boxCount(pens[a], m.userData.type) < BOX_MAX);
  const usable = Object.keys(pens).filter(fits).sort((a, b) => animals.filter((an) => an.a === b && an.want).length - animals.filter((an) => an.a === a && an.want).length);
  if (usable.length) return feedPos(usable[0]);
  /* otherwise fetch what a hungry animal is missing in its box, or what a box is low on */
  const hungry = animals.filter((an) => an.want && !an.pen.food.count(an.want)).sort((a, b) => b.wait - a.wait)[0];
  if (hungry && sources[hungry.want]) return foodSpot(hungry.want, hungry.a);
  return null;
}
