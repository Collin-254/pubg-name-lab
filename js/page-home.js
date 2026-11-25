/* Home: names-first stylizer, a Discover strip, collection category tiles. */
(function (P) {
  'use strict';
  var h = P.h, $ = P.$, ui = P.ui;
  var inp = $('#genInput'), cat = 'all', limit = 12, SAMPLE = 'Vanta';
  inp.value = P.store.get('pnl-name', '') || '';
  function variants(t) {
    var base = t || SAMPLE, out = [];
    P.STYLES.forEach(function (s) { if (cat !== 'all' && cat !== 'frames' && s.cat !== cat) return; if (cat === 'frames') return; var st = P.newState(); st.segs[0] = { t: base, s: s.id }; out.push({ label: s.label, state: st }); });
    if (cat === 'all' || cat === 'frames') P.FRAMES.forEach(function (f) { if (f.id === 'none') return; var st = P.newState(); st.segs[0] = { t: base, s: '' }; st.l = f.l; st.r = f.r; out.push({ label: f.label + ' frame', state: st }); });
    return out;
  }
  function paint() {
    var t = inp.value.trim(), box = $('#names'); box.replaceChildren(); $('#genClear').hidden = !t;
    var list = variants(t), seen = {}, shownList = [];
    list.forEach(function (v) { v.text = P.compose(v.state); if (!seen[v.text]) { seen[v.text] = 1; shownList.push(v); } });
    shownList.slice(0, limit).forEach(function (v) { var c = ui.nameCard({ text: v.text, state: v.state, label: v.label }); if (!t) c.classList.add('ph'); box.append(c); });
    $('#genStatus').textContent = t ? shownList.length + ' variants of “' + t + '”' : 'Sample shown. Type your name above.';
    var more = $('#namesMore'); more.hidden = shownList.length <= limit; more.textContent = 'Show ' + Math.min(12, shownList.length - limit) + ' more';
    P.store.set('pnl-name', inp.value);
  }
  inp.addEventListener('input', P.debounce(function () { limit = 12; paint(); }, 100));
  $('#genClear').addEventListener('click', function () { inp.value = ''; paint(); inp.focus(); });
  $('#namesMore').addEventListener('click', function () { limit += 12; paint(); });
  ui.chips($('#genChips'), P.STYLE_CATS.concat([['frames', 'Frames']]), 'all', function (v) { cat = v; limit = 12; paint(); });
  paint();

  /* Discover strip */
  var themeId = 'tactical', box = $('#hDisc');
  function strip() {
    var th = P.THEMES.filter(function (t) { return t.id === themeId; })[0], seen = {}, i = 0; box.replaceChildren();
    while (box.children.length < 4 && i++ < 80) {
      var pat = th.patterns[Math.floor(Math.random() * th.patterns.length)], parts = pat.map(function (k) { var b = k === 'a' ? (th.a.length ? th.a : th.n) : k === 'n' ? th.n : k === 'team' ? (th.team || th.t) : th.t; return b[Math.floor(Math.random() * b.length)]; });
      var txt = parts.join(''); if (seen[txt] || P.graphemes(txt).length > 14 || new Set(parts).size !== parts.length) continue; seen[txt] = 1;
      box.append(ui.nameCard({ text: txt }));
    }
  }
  ui.chips($('#hThemes'), P.THEMES.map(function (t) { return [t.id, t.label]; }), themeId, function (v) { themeId = v; strip(); });
  $('#hThemes').append(h('a', { class: 'chip', href: 'discover.html' }, 'More options →'));
  strip();

  /* Collection tiles */
  var list = P.nameList(), counts = {}, firsts = {};
  list.forEach(function (n) { counts[n.cat] = (counts[n.cat] || 0) + 1; if (!firsts[n.cat]) firsts[n.cat] = n.text; });
  $('#hCats').replaceChildren.apply($('#hCats'), P.NAME_CATS.map(function (c) {
    return h('a', { class: 'tile', href: 'names.html?cat=' + c.id }, h('span', { class: 't-name' }, firsts[c.id]), h('span', { class: 't-title' }, c.label), h('span', { class: 't-sub' }, counts[c.id] + ' names'));
  }));
})(window.PNL);
