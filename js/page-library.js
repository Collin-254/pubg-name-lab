/* Library: searchable character library with inspector and a working-name bar. */
(function (P) {
  'use strict';
  var h = P.h, $ = P.$, ui = P.ui, LIB = P.LIB, qp = new URLSearchParams(location.search);
  var S = { cat: LIB.CATS.some(function (c) { return c[0] === qp.get('c'); }) ? qp.get('c') : 'all', q: (qp.get('q') || '').trim() };
  var name = P.store.get('pnl-lib-name', '') || '', sel = '';
  document.body.classList.add('has-bar');
  var total = 0; LIB.groups.forEach(function (g) { total += g.list.length; });
  $('#lTotal').textContent = total.toLocaleString('en-US') + ' characters in ' + LIB.groups.length + ' groups';

  function match(g) {
    if (S.cat !== 'all' && g.type !== S.cat) return null;
    if (!S.q) return g.list;
    var q = S.q.toLowerCase(), m = /^(?:u\+)?([0-9a-f]{2,6})$/i.exec(q);
    if (g.text.indexOf(q) >= 0) return g.list;
    var hit = g.list.filter(function (c) {
      if (c === S.q || S.q.indexOf(c) >= 0 && Array.from(S.q).length < 4) return true;
      if (m && c.codePointAt(0) === parseInt(m[1], 16)) return true;
      if (P.UNI.namesLoaded() && q.length >= 3) { var n = P.UNI.nameOf(c.codePointAt(0)); if (n && n.toLowerCase().indexOf(q) >= 0) return true; }
      return false;
    });
    return hit.length ? hit : null;
  }
  function glyphBtn(c) {
    var d = P.UNI.describe(c), blank = d.flags.indexOf('invisible') >= 0 || d.flags.indexOf('odd-space') >= 0;
    var b = h('button', { class: 'glyph', type: 'button', 'aria-label': (blank ? 'Blank character ' : 'Character ') + c + ' ' + d.hex, dataset: { c: c }, title: d.hex }, blank ? h('span', { class: 'blankbox' }, d.hex.replace('U+', '')) : c);
    b.addEventListener('mouseenter', function () { inspect(c); });
    b.addEventListener('focus', function () { inspect(c); });
    b.addEventListener('click', function () { add(c); inspect(c); });
    return b;
  }
  function paint() {
    var box = $('#lGrid'), n = 0, groups = 0; box.replaceChildren();
    LIB.groups.forEach(function (g) {
      var list = match(g); if (!list) return; groups++; n += list.length;
      var head = h('div', { class: 'group-head' }, h('div', null, h('h3', null, g.title, h('span', { class: 'count' }, list.length)), h('p', null, g.desc)));
      var sec = h('section', { class: 'group', id: 'g-' + g.id }, head);
      if (g.type === 'blank') sec.append(h('div', { class: 'callout', style: 'margin-bottom:14px' }, h('b', null, 'Read this first'), 'Blank names are often rejected or stripped, can be unfair to other players, and may break moderation and support. Nothing here is confirmed to work in PUBG MOBILE. ', h('a', { href: 'compatibility.html?pack=blank' }, 'Test each one yourself'), '.'));
      sec.append(h('div', { class: 'glyphs' }, list.map(glyphBtn)));
      box.append(sec);
    });
    if (!groups) box.append(h('div', { class: 'emptystate' }, h('b', null, 'No characters match “' + S.q + '”'), 'Try a code point like U+2605, a script like Greek, or a word like star or arrows.'));
    $('#lStatus').textContent = groups ? n.toLocaleString('en-US') + ' characters in ' + groups + ' group' + (groups === 1 ? '' : 's') : '';
  }
  function row(k, v) { return h('div', null, h('dt', null, k), h('dd', null, v)); }
  function inspect(c) {
    sel = c; var d = P.UNI.describe(c), box = $('#lInsp'), blank = d.flags.indexOf('invisible') >= 0 || d.flags.indexOf('odd-space') >= 0, lv = P.compat.levelFor(c);
    var g = h('div', { class: 'insp-glyph' + (blank ? ' ph' : '') }, blank ? 'Draws nothing (' + d.hex + ')' : c);
    var fl = d.flags.filter(function (f) { return f === 'invisible' || f === 'odd-space' || f === 'combining' || f === 'emoji-capable' || f === 'lookalike' || f === 'folds'; }).map(function (f) {
      var t = { invisible: 'invisible', 'odd-space': 'unusual space', combining: 'combining mark', 'emoji-capable': 'can draw as emoji', lookalike: 'looks like “' + d.like + '”', folds: 'folds to “' + d.nfkc + '”' }[f];
      return h('span', { class: 'fl fl-warn', style: 'margin-right:4px' }, t);
    });
    box.replaceChildren(g, h('div', { class: 'insp-name' }, d.name || (P.UNI.namesLoaded() ? 'No bundled name' : 'Loading name…')), h('div', { style: 'margin-top:8px' }, fl),
      h('dl', { class: 'insp-list' }, row('Code point', d.hex), row('Category', d.cat.label), row('Script', d.script), row('Block', d.block), row('UTF-16', d.u16 + ' unit' + (d.u16 === 1 ? '' : 's')), row('UTF-8', d.u8hex), row('In-game', ui.badge(lv))),
      h('div', { class: 'insp-actions' }, h('button', { class: 'btn primary', type: 'button', onclick: function () { add(c); } }, 'Add to name'), h('button', { class: 'btn', type: 'button', onclick: function () { P.copy(c, 'Copied ' + c); } }, 'Copy glyph'), h('button', { class: 'btn', type: 'button', onclick: function () { P.copy(d.hex, 'Copied ' + d.hex); } }, 'Copy code'), h('a', { class: 'btn', href: P.inspectURL(c) }, 'Full details')));
    if (!P.UNI.namesLoaded()) P.UNI.loadNames().then(function () { if (sel === c) inspect(c); });
  }
  function ph() { $('#lInsp').replaceChildren(h('div', { class: 'insp-glyph ph' }, 'Hover or focus a character to inspect it')); }
  function bar() {
    var el = $('#lBarName'); el.textContent = name || 'Click characters to build a name'; el.classList.toggle('ph', !name);
    $('#lStudio').href = P.studioURL(name); P.store.set('pnl-lib-name', name);
  }
  function add(c) { if (P.graphemes(name).length >= 60) { P.toast('That is long enough'); return; } name += c; bar(); P.toast('Added ' + (/\s/.test(c) || P.UNI.isInvisible(c) ? P.cpOf(c) : c)); }
  $('#lBack').addEventListener('click', function () { var g = P.graphemes(name); g.pop(); name = g.join(''); bar(); });
  $('#lCopy').addEventListener('click', function () { P.copy(name, 'Copied ' + (name.length > 20 ? 'name' : name)); });
  $('#lInspect').addEventListener('click', function () { if (name) ui.inspectDialog(name); else P.toast('Add a character first'); });

  ui.chips($('#lCats'), LIB.CATS.map(function (c) { var n = 0; LIB.groups.forEach(function (g) { if (c[0] === 'all' || g.type === c[0]) n += g.list.length; }); return [c[0], c[1], n]; }), S.cat, function (v) { S.cat = v; paint(); });
  var s = $('#lSearch'); s.value = S.q;
  s.addEventListener('focus', function () { P.UNI.loadNames(); });
  s.addEventListener('input', P.debounce(function () { S.q = s.value.trim(); paint(); }, 150));
  P.UNI.loadNames().then(function () { if (S.q) paint(); });
  ph(); bar(); paint();
})(window.PNL);
