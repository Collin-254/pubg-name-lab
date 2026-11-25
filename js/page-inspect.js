/* Inspect: whole-name inspector + lookalike comparison. */
(function (P) {
  'use strict';
  var h = P.h, $ = P.$, ui = P.ui;
  var inp = $('#iIn'), out = $('#iOut'), qp = new URLSearchParams(location.search);
  inp.value = (qp.get('t') || '').slice(0, 120);
  function run() {
    var t = inp.value; $('#iClear').hidden = !t;
    ui.renderInspector(out, t);
    $('#iStudio').href = P.studioURL(t); $('#iTest').href = 'compatibility.html' + (t ? '?t=' + encodeURIComponent(t) : '');
    var u = new URL(location.href); if (t) u.searchParams.set('t', t); else u.searchParams.delete('t'); history.replaceState(null, '', u.pathname + u.search);
  }
  inp.addEventListener('input', P.debounce(run, 120));
  $('#iClear').addEventListener('click', function () { inp.value = ''; run(); inp.focus(); });
  $('#iCopy').addEventListener('click', function () { P.copy(inp.value, 'Copied'); });
  $('#iLink').addEventListener('click', function () { P.copy(location.href, 'Link copied'); });
  P.$$('[data-ex]').forEach(function (b) { b.addEventListener('click', function () { inp.value = b.dataset.ex; run(); }); });
  run();

  /* compare */
  var A = $('#cA'), B = $('#cB'), co = $('#cOut');
  function cmp() {
    var a = Array.from(A.value)[0] || '', b = Array.from(B.value)[0] || '';
    if (!a || !b) { co.replaceChildren(h('p', { class: 'empty' }, 'Enter one character in each box.')); return; }
    var r = P.UNI.compare(a, b), da = P.UNI.describe(a), db = P.UNI.describe(b);
    function side(d) { return h('div', null, h('div', { class: 'cmp-g' }, d.ch), h('p', { class: 'fine' }, h('b', null, d.hex), ' ', d.name || (P.UNI.namesLoaded() ? '' : 'loading name…'), h('br'), d.cat.label + ' · ' + d.script + ' · ' + d.block)); }
    co.replaceChildren(h('div', { class: 'cmp' }, side(da), side(db)), h('ul', { style: 'margin:14px 0 0;padding-left:20px;color:var(--ink2);font-size:14.5px' }, r.why.map(function (l) { return h('li', null, l); })));
  }
  [A, B].forEach(function (e) { e.addEventListener('input', cmp); });
  cmp(); P.UNI.loadNames().then(cmp);
})(window.PNL);
