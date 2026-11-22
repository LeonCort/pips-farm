
function weatherTest() {
  /* weather(kind, seconds, snap): force a spell; snap skips the fade (and lets the snow settle at once) */
  const f = (k, len, snap) => {
    if (WX_KINDS.indexOf(k) < 0) return false; wxSet(k, len == null ? 999 : len); delete state.wx.nx; k = state.wx.k;
    if (snap) { rainAmt = k === 'heavy' ? 1 : k === 'rain' ? 0.55 : 0; snowAmt = k === 'snow' ? 1 : 0; mistAmt = k === 'mist' ? 1 : 0; windAmt = WX_WIND[k]; wxAng = state.wx.dir; if (k === 'snow') state.wx.cover = 1; }
    return k;
  };
  return {
    weather: f,
    wxState: () => ({ k: state.wx.k, t: Math.round(state.wx.t), season, rain: +rainAmt.toFixed(2), wind: +windAmt.toFixed(2), gust: +WIND.g.toFixed(2), snow: +snowAmt.toFixed(2), mist: +mistAmt.toFixed(2), fog: +fogAmt.toFixed(2), cover: +state.wx.cover.toFixed(2), man: manAmt > 0.5, bow: +rainbowAmt.toFixed(2), drops: RS.n, wet: +wet.toFixed(2), gear: RGEAR.on, drips: RS.dripE ? RS.dripE.length : 0, flakes: snowN }),
    rain: (on) => f(on ? 'rain' : 'clear', on ? 60 : 999),
    wet: (v) => { wet = RS.gw = clamp(v, 0, 1); return wet; },
    wx: () => ({ rain: raining() ? state.wx.t : 0, amt: rainAmt, wet, fog: fogAmt, bow: rainbowAmt, k: state.wx.k }),
    rainEnd: () => { state.wx.t = 0.5; state.wx.nx = 'clear'; },
    /* jump to a season (keeps the time of day), or to a time of day 0..1 */
    season: (s) => { const i = SEASONS.indexOf(s); if (i < 0) return false; const fr = dayFrac(), d = Math.floor(state.clock / DAY); state.clock = (d - (d % 4) + i + 4) * DAY + fr * DAY; return s; },
    icons: () => ['rain', 'wind', 'snow', 'mist', 'sun', 'heart'].map((t) => actIcon(t)),
    dayAt: (fr) => { state.clock = Math.floor(state.clock / DAY) * DAY + fr * DAY; }
  };
}
