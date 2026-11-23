/* ---------- sandbox: the whole farm, every unlock done, nothing to buy ----------
   Opened from the start page (bondgard.html?sandbox=1). It has its own save (SAVE_KEY in rules.js), so it never touches the
   real farm. Each time it loads it checks that everything on both queues is owned, plus every catalog piece, colour,
   extra, decoration and paint; if something is missing (a new farm, or a new thing added in an update) it buys it all
   in one go, silently, clears the building queue so nothing waits to be built, saves and reloads, so the farm is built
   from the save the normal way. The care loop is untouched; the bag button, the swap pad and the first day are gone. */
function sbxNeed() {
  const S = stS(); if (!S || S.size < 4) return true;
  if (QUEUE.h.concat(QUEUE.c).some(([id]) => !qOwned(id))) return true;
  if (FURN.some((f) => !S.furn[f.id]) || DECO_L.some((d) => !S.deco[d.id])) return true;
  const C = catS(); if (!C) return true;
  if (Object.values(CSPOT).some((s) => CFAM[s.fam].types.some((_, t) => !(C.own[s.id] && C.own[s.id][t] && C.own[s.id][t].length >= CFAM[s.fam].cols.length)))) return true;
  return C.paint.ow.length < WALLC.length || C.paint.or.length < ROOFC.length;
}
/* when the real buy does not take (an item the shop would not offer yet), the flag is set straight */
function sbxForce(id) {
  if (id.startsWith('gear:')) { const m = id.slice(5).match(/^([a-z]+)(\d+)$/); state.lv[m[1]] = Math.max(state.lv[m[1]] || 0, +m[2]); return; }
  if (Q_SIZE[id]) { stS().size = Math.max(stS().size, Q_SIZE[id]); return; }
  if (Q_ISLE[id]) { const k = Q_ISLE[id], t = ISET_BY[k]; if (t) t.lots.forEach((l) => { const q = ISLE_BY[l]; if (q && !isleOwn(q)) { const pr = islePrep({ k: 'isle', id: k }); if (pr) pr.go(); } }); else isleX().pk[k] = 1; return; }
  if (PADS.some((p) => p.id === id)) { state.owned[id] = true; return; }
  if (BPADS.some((p) => p.id === id)) { barnS().owned[id] = true; return; }
  if (SPADS.some((p) => p.id === id)) shop().owned[id] = true;
}
function sbxFill() {
  const snd = Snd.play; Snd.play = () => {}; const rich = () => { state.coins = 1e9; shop().coins = 1e9; };
  try {
    const S = stS(); rich();
    if (S.size < 1) catBuy({ k: 'size', n: 1 });
    ['c', 'h'].forEach((tr) => {
      for (let guard = 0; guard < 400; guard++) {
        const h = qHead(tr); if (!h) break; rich();
        let ok = false; try { const it = bmItem(tr, h, Q_PRICE[h]); if (it && (!it.open || it.open())) { it.buy(); ok = qOwned(h); } } catch (e) {}
        if (!ok) { try { sbxForce(h); } catch (e) {} }
        if (!qOwned(h)) { if (window.PipsLog) PipsLog.add('info', 'sandbox: stuck at ' + h); break; }
      }
    });
    for (let n = S.size + 1; n <= 4; n++) { rich(); if (!catBuy({ k: 'size', n })) S.size = n; }
    FURN.forEach((f) => { S.furn[f.id] = 1; }); DECO_L.forEach((d) => { S.deco[d.id] = 1; });
    const C = catS();
    Object.values(CSPOT).forEach((s) => { const F = CFAM[s.fam], o = C.own[s.id] = C.own[s.id] || {}; F.types.forEach((_, t) => { o[t] = F.cols.map((_, c) => c); }); if (!C.eq[s.id]) C.eq[s.id] = [0, 0]; });
    C.paint.ow = WALLC.map((_, i) => i); C.paint.or = ROOFC.map((_, i) => i);
    S.pend = []; S.paid = {}; S.seenIn = S.size;
  } finally { Snd.play = snd; }
  state.coins = 0; shop().coins = 0; delete state.tut; state.sbx = 1;
}
if (SANDBOX) {
  /* a new sandbox farm starts like a played one: no first day, the pig there, the tent ready for the house */
  tutFresh = function (s) { s.owned.pig1 = true; s.store = { size: 0, seenIn: 0, furn: {}, deco: {}, paid: {}, pend: [] }; return s; };
  { const e0 = extrasInit; extrasInit = function () {
    e0();
    let tries = 0; try { tries = +sessionStorage.getItem('pips-sbx-fill') || 0; } catch (e) {}
    if (!sbxNeed()) { try { sessionStorage.removeItem('pips-sbx-fill'); } catch (e) {} return; }
    if (tries >= 2) return; /* never reload in a loop: play with what is there */
    try { sessionStorage.setItem('pips-sbx-fill', String(tries + 1)); } catch (e) {}
    sbxFill(); save(); window.removeEventListener('pagehide', save);
    setTimeout(() => location.reload(), 30);
  }; }
  /* nothing to buy: no bag button (and no shop tile on phones), no swap pad, no buy bubbles */
  { const b0 = bmStep; bmStep = function (dt) { b0(dt); bmBtn.hidden = true; }; }
  swapFrame = function () { swapG.visible = false; };
  document.body.classList.add('sandbox');
  { const st = document.createElement('style'); st.textContent = 'body.sandbox .bmBtn, body.sandbox .spBuy, body.sandbox .stWish { display: none !important; }'; document.head.appendChild(st); }
}
if (window.__farmTest) window.__sbx = { on: SANDBOX, need: () => sbxNeed(), size: () => stS() && stS().size, heads: () => [qHead('h'), qHead('c')] };
