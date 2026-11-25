/* Discover: theme-based name generator with per-part reroll and lock. */
(function (P) {
  'use strict';
  var h = P.h, $ = P.$, ui = P.ui;
  var THEMES = P.THEMES, byId = {}; THEMES.forEach(function (t) { byId[t.id] = t; });
  var SURPRISE = ['bold', 'boldscript', 'fraktur', 'smallcaps', 'double', 'mono', 'italic'];
  var NUMS = ['7', '9', '11', '13', '17', '21', '47', '77', '88', '99', '07', '23'];
  var saved = P.store.get('pnl-disc', {}) || {};
  var qp = new URLSearchParams(location.search);
  var S = {
    theme: byId[qp.get('theme')] ? qp.get('theme') : (byId[saved.theme] ? saved.theme : 'tactical'),
    style: typeof saved.style === 'string' ? saved.style : '', frame: saved.frame || 'none', join: saved.join || '', len: +saved.len || 14,
    my: '', num: !!saved.num, how: saved.how || 'strict'
  };
  var cards = [], recent = [], shown = 8;
  var rnd = function (n) { return Math.floor(Math.random() * n); };
  var pick = function (arr) { return arr[rnd(arr.length)]; };
  function keep() { P.store.set('pnl-disc', { theme: S.theme, style: S.style, frame: S.frame, join: S.join, len: S.len, num: S.num, how: S.how }); }

  /* ----- engine ----- */
  function bankFor(kind, th) {
    if (kind === 'a') return th.a.length ? th.a : th.n;
    if (kind === 'n') return th.n; if (kind === 't') return th.t;
    if (kind === 'team') return th.team || ['NX', 'VX', 'RZ'];
    if (kind === 'num') return NUMS;
    return [];
  }
  function newValue(kind, th, others, cur) {
    if (kind === 'F') return pickFrame(th);
    if (kind === 'my') return S.my;
    var bank = bankFor(kind, th), taken = others.map(function (v) { return String(v).toLowerCase(); });
    for (var i = 0; i < 40; i++) {
      var v = pick(bank);
      if (v === cur || taken.indexOf(v.toLowerCase()) >= 0) continue;
      if (kind === 'team') return bracket(v);
      return v;
    }
    return cur || pick(bank);
  }
  function bracket(v) { var b = pick(P.TEAM_BRACKETS); return b[0] + v + b[1]; }
  function pickFrame(th) {
    if (S.frame === 'auto') return pick(th.frames);
    if (S.frame === 'random') return pick(P.FRAMES.filter(function (f) { return f.id !== 'none'; })).id;
    return S.frame;
  }
  function style() { return S.style === '*' ? pick(SURPRISE) : S.style; }
  function frameIsDynamic() { return S.frame === 'auto' || S.frame === 'random'; }

  /* a card = { slots:[{k,v,lock}], style } ; text is derived */
  function compose(c) {
    var words = [], prefix = '', frame = 'none';
    c.slots.forEach(function (s) {
      if (s.k === 'F') frame = s.v; else if (s.k === 'team') prefix = s.v; else words.push(s.v);
    });
    var core = words.join(S.join);
    var f = P.frame(frame);
    var st = { segs: [{ t: core, s: c.style }], c: '', l: f.l, r: f.r, p: prefix, x: '' };
    return { state: st, text: P.compose(st) };
  }
  function count(t) { var m = P.measure(t); return S.how === 'g' ? m.g : S.how === 'u8' ? m.u8 : m.strict; }
  function good(c, text) {
    var vals = c.slots.filter(function (s) { return s.k !== 'F' && s.k !== 'team'; }).map(function (s) { return s.v.toLowerCase(); });
    if (new Set(vals).size !== vals.length) return false;
    if (count(text) > S.len) return false;
    if (/^\d+$/.test(text.replace(/[^\p{L}\p{N}]/gu, ''))) return false;
    if (vals.join('').length < 3) return false;
    if (recent.indexOf(text) >= 0 || cards.some(function (x) { return x !== c && x.text === text; })) return false;
    return true;
  }
  function pattern(th) {
    var p = pick(th.patterns).slice();
    if (S.my) {
      var i = p.indexOf('n'); if (i < 0) i = p.indexOf('a');
      if (i >= 0) p[i] = 'my'; else p.unshift('my');
      if (p.length === 1) p.push(pick(th.t.length ? ['t', 'n'] : ['n']));
    }
    if (S.num && p.indexOf('num') < 0) p.push('num');
    return p;
  }
  function build(locked) {
    /* locked: previous card whose locked slots must survive */
    var th = byId[S.theme], best = null;
    for (var tries = 0; tries < 60; tries++) {
      var c;
      if (locked) {
        c = { style: locked.style, slots: locked.slots.map(function (s) { return { k: s.k, v: s.v, lock: s.lock }; }) };
        c.slots.forEach(function (s, i) { if (!s.lock && s.k !== 'my') s.v = newValue(s.k, th, c.slots.filter(function (x, j) { return j !== i && x.k !== 'F' && x.k !== 'team'; }).map(function (x) { return x.v; }), s.v); });
      } else {
        var kinds = pattern(th); c = { style: style(), slots: [] };
        kinds.forEach(function (k) { c.slots.push({ k: k, v: newValue(k, th, c.slots.map(function (x) { return x.v; })), lock: k === 'my' }); });
        if (S.frame !== 'none') c.slots.push({ k: 'F', v: pickFrame(th), lock: false });
      }
      var o = compose(c); c.text = o.text; c.state = o.state;
      if (good(c, c.text)) return c;
      if (!best || count(c.text) < count(best.text)) best = c;
    }
    return best && recent.indexOf(best.text) < 0 && !cards.some(function (x) { return x !== best && x.text === best.text; }) ? best : null;
  }
  function remember(t) { recent.push(t); if (recent.length > 80) recent.shift(); }

  /* ----- rendering ----- */
  var ICON_RE = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20 11a8 8 0 0 0-14.5-4M4 4v4h4M4 13a8 8 0 0 0 14.5 4M20 20v-4h-4"/></svg>';
  var ICON_LOCK = '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="5" y="11" width="14" height="9" rx="2"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/></svg>';
  var ICON_OPEN = '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="5" y="11" width="14" height="9" rx="2"/><path d="M8 11V8a4 4 0 0 1 7.5-2"/></svg>';
  var KIND = { a: 'word', n: 'word', t: 'tag', team: 'team', num: 'number', F: 'frame', my: 'yours' };
  function slotEl(c, s, i, rerender) {
    var label = s.k === 'F' ? (P.frame(s.v).l + '…' + P.frame(s.v).r || P.frame(s.v).label) : s.v;
    var locked = !!s.lock;
    var lock = h('button', { type: 'button', 'aria-pressed': String(locked), 'aria-label': (locked ? 'Unlock ' : 'Lock ') + label, title: locked ? 'Locked. Click to unlock' : 'Lock this part' });
    lock.innerHTML = locked ? ICON_LOCK : ICON_OPEN;
    lock.addEventListener('click', function () { s.lock = !s.lock; rerender(c, false); });
    var kids = [h('span', { class: 'sk' }, KIND[s.k]), h('span', { class: 'sv' }, label)];
    if (s.k !== 'my' && (s.k !== 'F' || frameIsDynamic())) {
      var re = h('button', { type: 'button', 'aria-label': 'Reroll ' + label, title: 'Reroll this part' }); re.innerHTML = ICON_RE;
      re.addEventListener('click', function () {
        var th = byId[S.theme];
        for (var t = 0; t < 30; t++) {
          s.v = newValue(s.k, th, c.slots.filter(function (x) { return x !== s && x.k !== 'F' && x.k !== 'team'; }).map(function (x) { return x.v; }), s.v);
          var o = compose(c); if (count(o.text) <= S.len || t === 29) break;
        }
        rerender(c, true);
      });
      kids.push(re);
    }
    kids.push(lock);
    return h('span', { class: 'slot', dataset: { lock: String(locked) } }, kids);
  }
  function renderCard(c, old) {
    var o = compose(c); c.text = o.text; c.state = o.state;
    var mid = h('div', { class: 'slots', role: 'group', 'aria-label': 'Parts of ' + c.text }, c.slots.map(function (s, i) { return slotEl(c, s, i, function (cc, bump) { if (bump) remember(cc.text); renderCard(cc, el); }); }));
    var over = count(c.text) > S.len;
    var el = ui.nameCard({ text: c.text, state: c.state, middle: mid });
    if (over) { var m = $('.nmeta', el); m.append(h('span', { class: 'fl fl-warn' }, 'over your ' + S.len + ' limit (' + (S.how === 'g' ? 'visible' : S.how === 'u8' ? 'bytes' : 'strictest count') + ')')); }
    c.el = el;
    if (old && old.parentNode) old.replaceWith(el);
    return el;
  }
  function paintAll() {
    var box = $('#dNames'); box.replaceChildren();
    cards.slice(0, shown).forEach(function (c) { box.append(renderCard(c)); });
    $('#dStatus').textContent = cards.slice(0, shown).length + ' ' + byId[S.theme].label.toLowerCase() + ' ideas · tap a name to copy · lock a part, then shuffle to keep it';
    $('#dMore').hidden = shown >= 40;
  }
  function fill() { while (cards.length < shown) { var c = build(); if (!c) break; cards.push(c); remember(c.text); } }
  function shuffle() {
    var th = byId[S.theme];
    cards = cards.slice(0, shown).map(function (c) {
      if (c.slots.some(function (s) { return s.lock && s.k !== 'F'; })) { var n = build(c) || c; remember(n.text); return n; }
      var n2 = build() || c; remember(n2.text); return n2;
    });
    paintAll();
  }
  function regenerateFrames() {
    var th = byId[S.theme];
    cards.forEach(function (c) {
      c.slots = c.slots.filter(function (s) { return s.k !== 'F'; });
      if (S.frame !== 'none') c.slots.push({ k: 'F', v: pickFrame(th), lock: false });
    });
    paintAll();
  }

  /* ----- controls ----- */
  function setup() {
    ui.chips($('#dTheme'), THEMES.map(function (t) { return [t.id, t.label]; }), S.theme, function (id) { S.theme = id; cards = []; fill(); keep(); blurb(); paintAll(); });
    var st = $('#dStyle');
    st.append(h('option', { value: '' }, 'Plain letters'), h('option', { value: '*' }, 'Surprise me'));
    P.STYLES.forEach(function (s) { st.append(h('option', { value: s.id }, s.label + ' · ' + P.applyStyle('Name', s.id))); });
    st.value = S.style; if (st.value !== S.style) { S.style = ''; st.value = ''; }
    st.addEventListener('change', function () { S.style = st.value; keep(); cards = cards.map(function (c) { c.style = style(); return c; }); paintAll(); });
    var fr = $('#dFrame');
    fr.append(h('option', { value: 'none' }, 'None'), h('option', { value: 'auto' }, 'Match the theme'), h('option', { value: 'random' }, 'Random each time'));
    P.FRAMES.filter(function (f) { return f.id !== 'none'; }).forEach(function (f) { fr.append(h('option', { value: f.id }, (f.l + 'Name' + f.r) + ' · ' + f.label)); });
    fr.value = S.frame; if (fr.value !== S.frame) { S.frame = 'none'; fr.value = 'none'; }
    fr.addEventListener('change', function () { S.frame = fr.value; keep(); regenerateFrames(); hint(); });
    var jn = $('#dJoin'); jn.value = S.join; jn.addEventListener('change', function () { S.join = jn.value; keep(); paintAll(); });
    var hw = $('#dHow'); hw.value = S.how; hw.addEventListener('change', function () { S.how = hw.value; keep(); cards = []; fill(); paintAll(); });
    var ln = $('#dLen'), lv = $('#dLenVal'); ln.value = S.len;
    var showLen = function () { lv.textContent = S.len + ' characters'; };
    showLen();
    ln.addEventListener('input', function () { S.len = +ln.value; showLen(); });
    ln.addEventListener('change', function () { keep(); cards = []; fill(); paintAll(); hint(); });
    var nm = $('#dNum'); nm.checked = S.num; nm.addEventListener('change', function () { S.num = nm.checked; keep(); cards = []; fill(); paintAll(); hint(); });
    var my = $('#dMy'); my.addEventListener('input', P.debounce(function () { S.my = my.value.trim().replace(/\s+/g, ''); cards = []; fill(); paintAll(); hint(); }, 250));
    $('#dShuffle').addEventListener('click', shuffle);
    $('#dMore').addEventListener('click', function () { shown = Math.min(40, shown + 8); fill(); paintAll(); });
    var d = $('#dOpts'); if (matchMedia('(min-width:1021px)').matches) d.open = true;
    hint();
  }
  function hint() {
    var n = [];
    if (S.my) n.push('your word'); if (S.style) n.push('styled'); if (S.frame !== 'none') n.push('decorated'); if (S.num) n.push('number');
    $('#dOptsHint').textContent = n.join(' · ');
  }
  function blurb() { $('#dBlurb').textContent = byId[S.theme].blurb; }

  blurb(); fill(); setup(); paintAll();
})(window.PNL);
