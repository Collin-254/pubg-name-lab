/* Compatibility: evidence ladder, name check, policy, test lab, log. */
(function (P) {
  'use strict';
  var h = P.h, $ = P.$, ui = P.ui, C = P.compat, qp = new URLSearchParams(location.search);

  /* ladder */
  var s = C.summary(), counts = { unicode: 'checked live', reported: s.reported, verified: s.verified, official: s.official };
  $('#cLadder').replaceChildren.apply($('#cLadder'), P.COMPAT.ladder.map(function (r, i) {
    return h('div', { class: 'rung' }, h('span', { class: 'n' }, 'LEVEL ' + (i + 1)), h('h3', null, r.title), h('p', null, r.blurb), h('span', { class: 'cnt' }, String(counts[r.id])), h('span', { class: 'fine', style: 'margin:2px 0 0' }, i === 0 ? 'automatic' : i === 3 ? 'documented rules' : 'published records'));
  }));

  /* check a name */
  var cin = $('#cIn'); cin.value = (qp.get('t') || '').slice(0, 120);
  function chk() { ui.renderInspector($('#cOut'), cin.value, { compact: true }); }
  cin.addEventListener('input', P.debounce(chk, 150)); chk();
  C.on(function () { chk(); log(); });

  /* policy */
  $('#cPolicy').replaceChildren.apply($('#cPolicy'), P.COMPAT.policy.map(function (p) {
    var src = P.COMPAT.sources[p.src];
    return h('div', { class: 'pol' }, h('span', null, h('span', { class: 'tag ' + (p.level === 'official' ? 'official' : 'caution') }, p.level === 'official' ? 'Official' : 'Not published')), h('h3', null, p.title),
      h('div', null, h('p', null, p.text), h('small', null, 'Source: ', src ? h('a', { href: src.url, target: '_blank', rel: 'noopener' }, src.title) : '', ' · checked ' + p.checked)));
  }));

  /* meta */
  var m = C.meta(); $('#cGame').value = m.game; $('#cPlat').value = m.platform; $('#cDev').value = m.device;
  function saveMeta() { C.setMeta({ game: $('#cGame').value.trim(), platform: $('#cPlat').value, device: $('#cDev').value.trim() }); }
  ['#cGame', '#cPlat', '#cDev'].forEach(function (id) { $(id).addEventListener('change', saveMeta); $(id).addEventListener('input', saveMeta); });

  /* packs + stepper */
  var packs = C.packs();
  var custom = (qp.get('t') || '').trim();
  if (custom) packs.unshift({ id: 'custom', title: 'Your name', blurb: 'Test the exact name you typed above.', kind: 'name', probes: [{ text: custom, target: '', label: 'Your name' }] });
  function packBtn(p) {
    var done = p.probes.filter(function (x) { return C.tests().some(function (t) { return t.text === x.text && (t.target || '') === (x.target || ''); }); }).length;
    return h('button', { class: 'pack', type: 'button', onclick: function () { start(p); } }, h('small', null, p.probes.length + ' probes · ' + done + ' done'), h('b', null, p.title), h('span', null, p.blurb));
  }
  function paintPacks() { $('#cPacks').replaceChildren.apply($('#cPacks'), packs.map(packBtn)); }
  var cur = null, idx = 0;
  function start(p) { cur = p; idx = 0; step(); $('#cStep').hidden = false; $('#cStep').scrollIntoView({ block: 'nearest', behavior: 'smooth' }); }
  function step() {
    var box = $('#cStep'), p = cur;
    if (idx >= p.probes.length) {
      box.replaceChildren(h('h3', null, p.title + ': finished'), h('p', { class: 'muted' }, 'Your results are in the log below. Send them to the project if you can, with a screenshot or recording of anything surprising.'), h('div', { class: 'actions' }, h('button', { class: 'btn primary', type: 'button', onclick: function () { $('#cSubmit').click(); } }, 'Submit as GitHub issue'), h('button', { class: 'btn', type: 'button', onclick: function () { box.hidden = true; paintPacks(); } }, 'Close')));
      paintPacks(); return;
    }
    var pr = p.probes[idx], prev = C.tests().filter(function (t) { return t.text === pr.text && (t.target || '') === (pr.target || ''); })[0];
    var alt = h('input', { class: 'field', id: 'stAlt', placeholder: 'If the game changed it, type what it became', autocomplete: 'off' });
    function rec(res) { C.addTest({ text: pr.text, target: pr.target || '', res: res, alt: res === 'alt' ? alt.value : '' }); idx++; step(); }
    var changed = h('button', { class: 'btn', type: 'button', onclick: function () { if (!alt.value.trim()) { P.toast('Type what the game changed it to'); alt.focus(); return; } rec('alt'); } }, 'Changed');
    box.replaceChildren(
      h('div', { class: 'rangehead' }, h('span', { class: 'kicker' }, p.title + ' · ' + (idx + 1) + ' of ' + p.probes.length), prev ? ui.badge(C.levelFor(pr.target || pr.text)) : null),
      h('div', { class: 'prog', 'aria-hidden': 'true' }, h('i', { style: 'width:' + Math.round(idx / p.probes.length * 100) + '%' })),
      h('p', { class: 'lbl', style: 'margin:0' }, 'Type this exact name into the in-game rename field'),
      h('div', { class: 'step-probe', title: 'Click to copy', style: 'cursor:pointer', onclick: function () { P.copy(pr.text, 'Copied'); } }, pr.text),
      h('p', { class: 'fine', style: 'margin:0;text-align:center' }, pr.label || ''),
      h('div', { class: 'actions', style: 'margin:0;justify-content:center' }, h('button', { class: 'btn sm', type: 'button', onclick: function () { P.copy(pr.text, 'Copied ' + pr.text); } }, 'Copy probe'), h('button', { class: 'btn sm', type: 'button', onclick: function () { ui.inspectDialog(pr.text); } }, 'Inspect')),
      h('div', { class: 'step-btns' }, h('button', { class: 'btn primary', type: 'button', onclick: function () { rec('ok'); } }, 'Accepted'), h('button', { class: 'btn', type: 'button', onclick: function () { rec('no'); } }, 'Rejected'), changed),
      alt,
      h('div', { class: 'actions', style: 'margin:0' }, h('button', { class: 'btn sm', type: 'button', onclick: function () { idx++; step(); } }, 'Skip'), h('button', { class: 'btn sm', type: 'button', onclick: function () { if (idx) { idx--; step(); } }, disabled: !idx }, 'Back'), h('button', { class: 'btn sm', type: 'button', onclick: function () { box.hidden = true; paintPacks(); } }, 'Stop')));
  }
  if (qp.get('pack')) { var want = packs.filter(function (p) { return p.id === qp.get('pack'); })[0]; if (want) setTimeout(function () { start(want); }, 0); }
  else if (custom) setTimeout(function () { start(packs[0]); }, 0);

  /* log */
  var RES = { ok: 'You: accepted', no: 'You: rejected', alt: 'You: changed' };
  function log() {
    var t = C.tests(), box = $('#cLog'); box.replaceChildren();
    if (!t.length) box.append(h('p', { class: 'empty' }, 'No tests yet. Run a pack above.'));
    t.forEach(function (x) {
      box.append(h('div', { class: 'logrow' },
        h('div', { class: 'lg' }, x.text), ui.badge('yours-' + x.res, RES[x.res]),
        h('small', null, (x.target ? 'Character ' + P.cpOf(x.target) + ' · ' : '') + (x.alt ? 'became “' + x.alt + '” · ' : '') + [x.note, x.game && 'v' + x.game, x.platform, x.device, new Date(x.ts).toISOString().slice(0, 10)].filter(Boolean).join(' · ')),
        h('button', { class: 'btn sm', type: 'button', 'aria-label': 'Remove test of ' + x.text, onclick: function () { C.removeTest(x.id); } }, 'Remove')));
    });
    paintPacks();
  }
  $('#cSubmit').addEventListener('click', function () {
    var t = C.tests(); if (!t.length) { P.toast('Run a test first'); return; }
    var r = C.issueURL(t); if (r.copied) P.copy(r.json, 'Results copied. Paste them into the issue');
    window.open(r.url, '_blank', 'noopener');
  });
  $('#cExport').addEventListener('click', function () {
    var a = h('a', { href: URL.createObjectURL(new Blob([JSON.stringify(C.exportData(), null, 1)], { type: 'application/json' })), download: 'pubg-name-lab-tests.json' }); document.body.append(a); a.click(); a.remove();
  });
  $('#cImport').addEventListener('change', function () {
    var f = this.files[0]; if (!f) return; var rd = new FileReader();
    rd.onload = function () { try { P.toast('Imported ' + C.importData(JSON.parse(rd.result)) + ' tests'); } catch (e) { P.toast(e.message || 'Could not read that file'); } };
    rd.readAsText(f); this.value = '';
  });
  $('#cClear').addEventListener('click', function () { if (C.tests().length && confirm('Clear every test in this browser?')) C.clearTests(); });

  /* published records */
  var rec = P.COMPAT.records || [], rb = $('#cRecords');
  if (!rec.length) rb.append(h('p', { class: 'empty' }, 'No published records yet. Nothing has been reported or verified, so every game-acceptance claim on this site is currently “untested”. Be the first: run a pack above and submit it.'));
  rec.forEach(function (r) {
    rb.append(h('div', { class: 'logrow' }, h('div', { class: 'lg' }, r.target || r.text), ui.badge((r.verified ? 'verified-' : 'reported-') + r.result),
      h('small', null, [r.game && 'v' + r.game, r.platform, r.device, r.tested, r.note].filter(Boolean).join(' · ')), r.evidence ? h('a', { href: r.evidence, target: '_blank', rel: 'noopener' }, 'Evidence') : h('span')));
  });
  log();
})(window.PNL);
