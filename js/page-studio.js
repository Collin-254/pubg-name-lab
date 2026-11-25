/* Studio: part-by-part nickname builder with undo/redo, galleries and live checks. */
(function (P) {
  'use strict';
  var h = P.h, $ = P.$, ui = P.ui;
  var KEY = 'pnl-studio', MAXSEG = 5;
  var state = P.stateFromParams(new URLSearchParams(location.search)) || (function () { var s = P.store.get(KEY, null); return s ? P.normState(s) : P.newState(); })();
  var past = [], future = [], lastKey = '', lastT = 0, focusEl = null, activeSeg = 0;
  var clone = function (s) { return JSON.parse(JSON.stringify(s)); };
  var same = function (a, b) { return JSON.stringify(a) === JSON.stringify(b); };

  /* ---------- history ---------- */
  function commit(key) {      /* call BEFORE mutating `state` */
    var now = Date.now();
    if (key && key === lastKey && now - lastT < 900) { lastT = now; return; }
    past.push(clone(state)); if (past.length > 100) past.shift(); future = []; lastKey = key || ''; lastT = now; buttons();
  }
  function undo() { if (!past.length) return; future.push(clone(state)); state = past.pop(); lastKey = ''; rebuild(); }
  function redo() { if (!future.length) return; past.push(clone(state)); state = future.pop(); lastKey = ''; rebuild(); }
  function buttons() { $('#sUndo').disabled = !past.length; $('#sRedo').disabled = !future.length; }

  /* ---------- form ---------- */
  function segRow(i) {
    var g = state.segs[i];
    var inp = h('input', { class: 'name-input', type: 'text', maxlength: '60', value: g.t, placeholder: i ? 'Another part' : 'Type a word', autocomplete: 'off', autocapitalize: 'off', spellcheck: 'false', 'aria-label': 'Part ' + (i + 1) + ' text', dataset: { i: String(i) } });
    inp.value = g.t;
    inp.addEventListener('focus', function () { focusEl = inp; activeSeg = i; paintStyles(); });
    inp.addEventListener('input', function () { commit('t' + i); state.segs[i].t = inp.value; sync(); });
    var sel = h('select', { class: 'field', 'aria-label': 'Style for part ' + (i + 1) });
    sel.append(h('option', { value: '' }, 'Plain'));
    P.STYLES.forEach(function (s) { sel.append(h('option', { value: s.id }, s.label)); });
    sel.value = g.s;
    sel.addEventListener('focus', function () { activeSeg = i; paintStyles(); });
    sel.addEventListener('change', function () { commit(); state.segs[i].s = sel.value; activeSeg = i; sync(); paintStyles(); });
    var del = h('button', { class: 'btn sm', type: 'button', 'aria-label': 'Remove part ' + (i + 1), title: 'Remove part', disabled: state.segs.length < 2, onclick: function () { commit(); state.segs.splice(i, 1); activeSeg = 0; rebuild(true); } }, '×');
    return h('div', { class: 'segrow' }, inp, sel, del);
  }
  function buildSegs() {
    var box = $('#sSegs'); box.replaceChildren();
    state.segs.forEach(function (_, i) { box.append(segRow(i)); });
    $('#sAdd').disabled = state.segs.length >= MAXSEG;
    $('#sCount').textContent = state.segs.length + ' of ' + MAXSEG;
  }
  function fillFields() {
    $('#sCase').value = state.c; ['L', 'R', 'P', 'X'].forEach(function (k) { $('#s' + k).value = state[k.toLowerCase()]; });
  }
  function rebuild(keepHist) { if (!keepHist) buttons(); buildSegs(); fillFields(); paintStyles(); paintFrames(); sync(); buttons(); }

  ['L', 'R', 'P', 'X'].forEach(function (k) {
    var el = $('#s' + k), key = k.toLowerCase();
    el.addEventListener('focus', function () { focusEl = el; });
    el.addEventListener('input', function () { commit(key); state[key] = el.value; sync(); paintFrames(); });
  });
  $('#sCase').addEventListener('change', function () { commit(); state.c = this.value; sync(); });
  $('#sAdd').addEventListener('click', function () { if (state.segs.length >= MAXSEG) return; commit(); state.segs.push({ t: '', s: '' }); activeSeg = state.segs.length - 1; rebuild(true); var ins = P.$$('#sSegs .name-input'); ins[ins.length - 1].focus(); });
  $('#sUndo').addEventListener('click', undo); $('#sRedo').addEventListener('click', redo);
  $('#sReset').addEventListener('click', function () { commit(); state = P.newState(); activeSeg = 0; rebuild(true); P.toast('Cleared. Undo brings it back'); });
  document.addEventListener('keydown', function (e) {
    if (!(e.ctrlKey || e.metaKey) || e.altKey) return;
    var k = e.key.toLowerCase();
    if (k === 'z' && !e.shiftKey) { e.preventDefault(); undo(); } else if (k === 'y' || (k === 'z' && e.shiftKey)) { e.preventDefault(); redo(); }
  });

  /* ---------- output ---------- */
  var text = '';
  function sync() {
    text = P.compose(state);
    var stage = $('#sStage'); stage.textContent = text || 'YourName'; stage.classList.toggle('ph', !text);
    var a = P.UNI.analyze(text);
    $('#mG').textContent = a.gCount; $('#mC').textContent = a.cpCount; $('#mU').textContent = a.u16; $('#mB').textContent = a.u8;
    $('#sChecks').replaceChildren.apply($('#sChecks'), text ? a.checks.slice(0, 6).map(function (c) { return h('li', { class: 'check ' + c.l }, h('span', { class: 'badge' }, c.b), h('b', null, c.t), h('p', null, c.d)); }) : [h('li', { class: 'empty' }, 'Type something to see length measures and warnings for the exact characters.')]);
    var on = text && P.favs.has(text), f = $('#sFav'); f.textContent = on ? '♥' : '♡'; f.setAttribute('aria-pressed', String(!!on));
    $('#sTest').href = 'rename.html?t=' + encodeURIComponent(text);
    $('#sSub').textContent = text ? 'Tap the preview to copy' : 'Your name appears here';
    P.store.set(KEY, state);
    buttons();
  }
  $('#sStage').addEventListener('click', function () { if (text) P.copy(text, 'Copied ' + text); });
  $('#sCopy').addEventListener('click', function () { P.copy(text, 'Copied ' + text); P.flash(this); });
  $('#sFav').addEventListener('click', function () { if (!text) { P.toast('Type a name first'); return; } var on = P.favs.toggle(text, clone(state)); P.toast(on ? 'Saved to My names' : 'Removed from My names'); sync(); });
  P.favs.on(function () { sync(); });
  $('#sInspect').addEventListener('click', function () { if (text) ui.inspectDialog(text); else P.toast('Type a name first'); });
  $('#sShare').addEventListener('click', function () { if (!text) { P.toast('Type a name first'); return; } var u = new URL(P.studioURL(state), location.href).href; P.copy(u, 'Link copied'); });

  /* ---------- galleries ---------- */
  var styleCat = 'all', styleQ = '';
  function sample() { var t = (state.segs[activeSeg] || state.segs[0]).t; return t ? P.applyCase(t, state.c).slice(0, 14) : 'Name'; }
  function item(label, preview, pressed, on) {
    var b = h('button', { class: 'gitem', type: 'button', 'aria-pressed': String(pressed) }, h('span', { class: 'gl' }, label), h('span', { class: 'gp' }, preview));
    b.addEventListener('click', on); return b;
  }
  function paintStyles() {
    var cur = (state.segs[activeSeg] || {}).s || '', box = $('#gStyles'), sm = sample();
    $('#gStyleFor').textContent = 'Applies to part ' + (activeSeg + 1) + '. Previews use your text.';
    box.replaceChildren();
    var list = [{ id: '', label: 'Plain', cat: 'all' }].concat(P.STYLES).filter(function (s) {
      return (styleCat === 'all' || s.id === '' || s.cat === styleCat) && (!styleQ || (s.label + ' ' + (s.desc || '')).toLowerCase().indexOf(styleQ) >= 0);
    });
    list.forEach(function (s) {
      box.append(item(s.label, s.id ? P.applyStyle(sm, s.id) : sm, s.id === cur, function () { commit(); state.segs[activeSeg].s = s.id; buildSegs(); sync(); paintStyles(); }));
    });
    if (!list.length) box.append(h('p', { class: 'empty', style: 'padding:10px' }, 'No style matches.'));
  }
  function paintFrames() {
    var box = $('#gFrames'), sm = (P.compose(Object.assign(clone(state), { l: '', r: '', p: '', x: '' })) || 'Name').slice(0, 12);
    box.replaceChildren();
    P.FRAMES.forEach(function (f) {
      box.append(item(f.label, f.id === 'none' ? sm : f.l + sm + f.r, state.l === f.l && state.r === f.r, function () { commit(); state.l = f.l; state.r = f.r; fillFields(); sync(); paintFrames(); }));
    });
  }
  P.ui.chips($('#gStyleCats'), P.STYLE_CATS, 'all', function (v) { styleCat = v; paintStyles(); });
  $('#gStyleQ').addEventListener('input', P.debounce(function () { styleQ = this.value.trim().toLowerCase(); paintStyles(); }, 120));

  var recent = P.store.get('pnl-recent-sym', []) || [];
  function insertSymbol(ch) {
    var el = focusEl && document.body.contains(focusEl) ? focusEl : $('#sSegs .name-input');
    commit();
    var s = el.selectionStart == null ? el.value.length : el.selectionStart, e = el.selectionEnd == null ? s : el.selectionEnd;
    el.value = el.value.slice(0, s) + ch + el.value.slice(e);
    var pos = s + ch.length; el.focus(); try { el.setSelectionRange(pos, pos); } catch (x) { }
    el.dispatchEvent(new Event('input', { bubbles: true }));
    recent = [ch].concat(recent.filter(function (r) { return r !== ch; })).slice(0, 14); P.store.set('pnl-recent-sym', recent); paintRecent();
    P.toast('Added ' + ch);
  }
  function paintRecent() {
    var box = $('#gRecent'); box.hidden = !recent.length; box.replaceChildren();
    recent.forEach(function (c) { box.append(h('button', { class: 'chip', type: 'button', 'aria-label': 'Add ' + c, onclick: function () { insertSymbol(c); } }, c)); });
  }
  var symQ = '', SKIP = { latin: 1, styled: 1, blank: 1, scripts: 1 };
  function paintSyms() {
    var box = $('#gSyms'), fl = focusEl && focusEl.id ? focusEl : null; box.replaceChildren();
    $('#gSymFor').textContent = 'Click a symbol to insert it where your cursor was last.';
    var gs = P.LIB.groups.filter(function (g) { return !SKIP[g.type] && (!symQ || g.text.indexOf(symQ) >= 0); });
    gs.forEach(function (g) {
      box.append(h('div', { class: 'group', style: 'padding-top:14px' }, h('h3', { style: 'font:600 14px var(--sans);margin:0 0 8px' }, g.title, h('span', { class: 'count' }, g.list.length)),
        h('div', { class: 'glyphs' }, g.list.slice(0, 120).map(function (c) { return h('button', { class: 'glyph', type: 'button', 'aria-label': 'Add ' + c + ' ' + P.cpOf(c), title: P.cpOf(c), onclick: function () { insertSymbol(c); } }, c); }))));
    });
    if (!gs.length) box.append(h('p', { class: 'empty' }, 'No symbol group matches.'));
  }
  $('#gSymQ').addEventListener('input', P.debounce(function () { symQ = this.value.trim().toLowerCase(); paintSyms(); }, 150));

  /* ---------- tabs ---------- */
  var tabs = P.$$('.tab'), done = {};
  function showTab(t) {
    tabs.forEach(function (x) { var on = x === t; x.setAttribute('aria-selected', String(on)); x.tabIndex = on ? 0 : -1; $('#' + x.getAttribute('aria-controls')).hidden = !on; });
    if (t.id === 'tabSyms' && !done.syms) { done.syms = 1; paintSyms(); paintRecent(); }
  }
  tabs.forEach(function (t, i) {
    t.addEventListener('click', function () { showTab(t); });
    t.addEventListener('keydown', function (e) { var n = e.key === 'ArrowRight' ? 1 : e.key === 'ArrowLeft' ? -1 : 0; if (n) { var o = tabs[(i + n + tabs.length) % tabs.length]; o.focus(); showTab(o); } });
  });
  showTab(tabs[0]);

  rebuild();
  past = []; buttons();
})(window.PNL);
