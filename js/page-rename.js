/* Rename-card lab: guided preview test that isolates the character causing trouble. */
(function (P) {
  'use strict';
  var h = P.h, $ = P.$, ui = P.ui, C = P.compat, root = $('#rWiz');
  var NOTE = 'Preview only: typed in the name box, not confirmed';
  var S = { step: 1, name: P.store.get('pnl-rename', '') || '', probes: [], i: 0, res: {}, cut: null };
  var qp = new URLSearchParams(location.search); if (qp.get('t')) S.name = qp.get('t').slice(0, 60);

  /* about this phone */
  var m = C.meta(); $('#rGame').value = m.game; $('#rPlat').value = m.platform; $('#rDev').value = m.device;
  function saveMeta() { C.setMeta({ game: $('#rGame').value.trim(), platform: $('#rPlat').value, device: $('#rDev').value.trim() }); }
  ['#rGame', '#rPlat', '#rDev'].forEach(function (id) { $(id).addEventListener('input', saveMeta); $(id).addEventListener('change', saveMeta); });

  function head(n, title) {
    return h('div', { class: 'rhead' }, h('div', { class: 'prog', 'aria-hidden': 'true' }, h('i', { style: 'width:' + (n / 4 * 100) + '%' })), h('span', { class: 'kicker' }, 'Step ' + n + ' of 4 · ' + title));
  }
  function go(n) { S.step = n; render(); root.scrollIntoView({ block: 'start', behavior: 'smooth' }); }
  function unusual(name) { var seen = {}, out = []; P.graphemes(name).forEach(function (g) { if (/^[A-Za-z0-9 ]$/.test(g) || seen[g]) return; seen[g] = 1; out.push(g); }); return out; }
  function probe(g) { return 'Nl' + g + 'x7'; }

  /* ---- step 1: name ---- */
  function step1() {
    var inp = h('input', { id: 'rName', type: 'text', maxlength: '60', value: S.name, placeholder: 'Paste the exact name you want…', autocomplete: 'off', autocapitalize: 'off', spellcheck: 'false', 'aria-label': 'The name you want' });
    var next = h('button', { class: 'btn primary', type: 'button', disabled: !S.name.trim() }, 'Check this name');
    inp.addEventListener('input', function () { S.name = inp.value; next.disabled = !inp.value.trim(); });
    next.addEventListener('click', function () { S.name = inp.value.trim(); P.store.set('pnl-rename', S.name); S.probes = []; S.res = {}; S.i = 0; S.cut = null; go(2); });
    var quick = [], draft = P.store.get('pnl-studio', null);
    if (draft) { try { var t = P.compose(P.normState(draft)); if (t) quick.push(['From Studio', t]); } catch (e) { } }
    P.favs.all().slice(0, 6).forEach(function (f) { quick.push(['Saved', f.t]); });
    var chips = h('div', { class: 'chips wrapchips' }, quick.map(function (q) { return h('button', { class: 'chip', type: 'button', onclick: function () { inp.value = q[1]; S.name = q[1]; next.disabled = false; } }, h('i', null, q[0]), ' ' + q[1]); }));
    return [head(1, 'Your name'), h('h2', { style: 'font-size:28px;margin:6px 0 14px' }, 'Which name are you thinking of?'), h('div', { class: 'genbox' }, inp), quick.length ? chips : null, h('div', { class: 'actions' }, next, h('a', { class: 'btn', href: 'studio.html' }, 'Build one in Studio'), h('a', { class: 'btn', href: 'discover.html' }, 'Find ideas'))];
  }

  /* ---- step 2: pre-flight ---- */
  function step2() {
    var a = P.UNI.analyze(S.name), odd = unusual(S.name), mm = P.measure(S.name);
    var warns = a.checks.filter(function (c) { return c.l === 'warn'; });
    return [head(2, 'Pre-flight'), h('div', { class: 'stage' }, h('span', { class: 'kicker' }, 'Your name'), h('div', { class: 'stage-name' }, S.name)),
      h('dl', { class: 'metrics' }, [['g', 'visible characters'], ['cp', 'code points'], ['u16', 'UTF-16 units'], ['u8', 'UTF-8 bytes']].map(function (k) { return h('div', { class: 'metric' }, h('dd', null, String(mm[k[0]])), h('dt', null, k[1])); })),
      mm.strict > 14 ? h('div', { class: 'callout', style: 'margin-top:14px' }, h('b', null, 'Over 14 by at least one count'), 'Players quote a 14-character limit and the counting method is unpublished. One report fits bytes. Expect the box to cut this name short if your game counts that way.') : null,
      warns.length ? h('ul', { class: 'checks' }, warns.slice(0, 4).map(function (c) { return h('li', { class: 'check warn' }, h('span', { class: 'badge' }, c.b), h('b', null, c.t), h('p', null, c.d)); })) : h('p', { class: 'fine' }, 'No warnings from the Unicode checks.'),
      h('div', { class: 'ih' }, 'The plan'),
      h('ol', { class: 'def', style: 'padding-left:20px;list-style:decimal' }, h('li', null, 'Open your profile, tap rename, and type the whole name into the box. Do not confirm.'), h('li', null, 'Say what the box shows.'), h('li', null, odd.length ? 'If it is not right, the lab tests the ' + odd.length + ' unusual character' + (odd.length === 1 ? '' : 's') + ' one at a time to find the culprit.' : 'Plain letters and numbers need no further tests.')),
      h('div', { class: 'actions' }, h('button', { class: 'btn primary', type: 'button', onclick: function () { S.probes = [{ text: S.name, target: '', label: 'Whole name', whole: true }]; S.i = 0; go(3); } }, 'Start preview test'), h('button', { class: 'btn', type: 'button', onclick: function () { go(1); } }, 'Change name'), h('button', { class: 'btn', type: 'button', onclick: function () { ui.inspectDialog(S.name); } }, 'Inspect')) ];
  }

  /* ---- step 3: probes ---- */
  var BTN = [['ok', 'Looks right', 'ok', ''], ['gap', 'Shows as a gap', 'alt', 'drawn as a gap or blank'], ['box', 'Box or ?', 'alt', 'drawn as a box or question mark'], ['miss', 'Missing', 'no', 'would not type or vanished']];
  function rec(pr, res, alt) { C.addTest({ text: pr.text, target: pr.target, res: res, alt: alt || '', note: NOTE }); S.res[pr.text] = { res: res, alt: alt || '', pr: pr }; }
  function after(pr, key) {
    if (pr.whole && key === 'ok') return go(4);
    if (pr.whole && key === 'cut') return go(4);
    S.i++;
    if (pr.whole) { S.probes = S.probes.concat(unusual(S.name).slice(0, 24).map(function (g) { return { text: probe(g), target: g, label: 'Character ' + P.cpOf(g) }; })); if (S.probes.length === 1) return go(4); }
    if (S.i >= S.probes.length) go(4); else render();
  }
  function step3() {
    var pr = S.probes[S.i], total = S.probes.length;
    var alt = h('input', { class: 'field', placeholder: 'It became something else? Type what you see', autocomplete: 'off', 'aria-label': 'What the game changed it to' });
    var cutBox = h('div', { class: 'two-col', hidden: true, style: 'margin:0' });
    var kept = h('input', { class: 'field', type: 'number', min: '0', max: '80', placeholder: 'How many characters stayed in the box?', 'aria-label': 'Characters that stayed' });
    cutBox.append(kept, h('button', { class: 'btn primary', type: 'button', onclick: function () { var n = +kept.value; if (!(n >= 0)) { P.toast('Enter how many stayed'); return; } S.cut = { n: n, pre: P.graphemes(pr.text).slice(0, n).join('') }; rec(pr, 'alt', 'cut short after ' + n + ' visible characters'); after(pr, 'cut'); } }, 'Save'));
    var btns = BTN.map(function (b) { return h('button', { class: 'btn' + (b[0] === 'ok' ? ' primary' : ''), type: 'button', onclick: function () { rec(pr, b[2], b[3]); after(pr, b[0]); } }, b[1]); });
    btns.push(h('button', { class: 'btn', type: 'button', onclick: function () { cutBox.hidden = false; kept.focus(); } }, 'Cut short'));
    btns.push(h('button', { class: 'btn', type: 'button', onclick: function () { if (!alt.value.trim()) { P.toast('Type what you see first'); alt.focus(); return; } rec(pr, 'alt', 'changed to “' + alt.value.trim() + '”'); after(pr, 'chg'); } }, 'Changed'));
    return [head(3, pr.whole ? 'Whole name' : 'Finding the culprit · ' + (S.i) + ' of ' + (total - 1)),
      h('p', { class: 'lbl', style: 'margin:0' }, pr.whole ? 'Type this into the name box. Do not confirm.' : 'Type this into the name box. It is the same test with one character.'),
      h('div', { class: 'step-probe', style: 'cursor:pointer', title: 'Tap to copy', onclick: function () { P.copy(pr.text, 'Copied'); } }, pr.text),
      h('div', { class: 'actions', style: 'justify-content:center;margin:0' }, h('button', { class: 'btn sm primary', type: 'button', onclick: function () { P.copy(pr.text, 'Copied. Paste it into the game'); } }, 'Copy it'), pr.target ? h('span', { class: 'fine', style: 'align-self:center;margin:0' }, pr.label) : null),
      h('p', { class: 'lbl', style: 'margin:6px 0 0' }, 'What does the box show?'),
      h('div', { class: 'rbtns' }, btns), alt, cutBox,
      h('div', { class: 'actions', style: 'margin:0' }, h('button', { class: 'btn sm', type: 'button', onclick: function () { S.i++; if (S.i >= S.probes.length) go(4); else render(); } }, 'Skip this one'), h('button', { class: 'btn sm', type: 'button', onclick: function () { go(1); } }, 'Stop'))];
  }

  /* ---- step 4: verdict ---- */
  function step4() {
    var whole = S.res[S.name], rows = Object.keys(S.res).map(function (k) { return S.res[k]; }).filter(function (r) { return !r.pr.whole; });
    var bad = rows.filter(function (r) { return r.res === 'no' || /box/.test(r.alt); }).map(function (r) { return r.pr.target; });
    var gap = rows.filter(function (r) { return /gap/.test(r.alt); }).map(function (r) { return r.pr.target; });
    var out = [head(4, 'Verdict')], good = whole && whole.res === 'ok';
    if (good) out.push(h('div', { class: 'callout', style: 'border-color:var(--ok);background:var(--ok-bg)' }, h('b', null, 'It looked right in the preview'), 'Type it again, check it once more, then confirm if you are happy. Confirm is the only step that spends the card, and a taken name or a filter may still stop it.'), h('div', { class: 'stage' }, h('span', { class: 'kicker' }, 'Copy this exact name'), h('div', { class: 'stage-name' }, S.name)),
      h('div', { class: 'actions' }, h('button', { class: 'btn primary', type: 'button', onclick: function () { P.copy(S.name, 'Copied ' + S.name); } }, 'Copy name')));
    else if (S.cut) {
      var pre = S.cut.pre, mp = P.measure(pre), mw = P.measure(S.name);
      out.push(h('div', { class: 'callout' }, h('b', null, 'The box cut your name short'), 'What stayed: “' + pre + '” — ' + mp.g + ' visible, ' + mp.cp + ' code points, ' + mp.u16 + ' UTF-16 units, ' + mp.u8 + ' UTF-8 bytes. Your full name is ' + mw.g + ' visible, ' + mw.u8 + ' bytes. ' + (mp.u8 === 14 || mp.u8 === 13 ? 'That fits a limit counted in bytes.' : mp.g === 14 ? 'That fits a limit of 14 visible characters.' : 'Compare these counts with the limit you expected: whichever one matches is the likely counting method.')),
        h('p', { class: 'fine' }, 'This result is saved to your log. If you submit it, it helps settle how the game counts length.'));
    } else {
      out.push(h('div', { class: 'callout' }, h('b', null, bad.length || gap.length ? 'Found what changed' : 'Not clear yet'), (bad.length ? 'Not drawn properly: ' + bad.join(' ') + '. ' : '') + (gap.length ? 'Drawn as a gap: ' + gap.join(' ') + '. ' : '') + (!bad.length && !gap.length ? 'No single character explained it. Try the name in smaller pieces, or inspect it.' : '')));
      var clean = P.graphemes(S.name).filter(function (g) { return bad.indexOf(g) < 0 && gap.indexOf(g) < 0; }).join('');
      if (clean && clean !== S.name) out.push(h('div', { class: 'ih' }, 'A safer version without them'), h('div', { class: 'stage' }, h('div', { class: 'stage-name' }, clean)), h('div', { class: 'actions' }, h('button', { class: 'btn primary', type: 'button', onclick: function () { S.name = clean; P.store.set('pnl-rename', clean); S.probes = []; S.res = {}; S.i = 0; S.cut = null; go(2); } }, 'Test this version'), h('button', { class: 'btn', type: 'button', onclick: function () { P.copy(clean, 'Copied'); } }, 'Copy')));
    }
    if (rows.length) out.push(h('div', { class: 'ih' }, 'What you saw'), h('div', { class: 'log' }, rows.map(function (r) { return h('div', { class: 'logrow' }, h('div', { class: 'lg' }, r.pr.target), ui.badge(r.res === 'ok' ? 'yours-ok' : r.res === 'no' ? 'yours-no' : 'yours-alt', r.res === 'ok' ? 'Looks right' : r.alt), h('small', null, P.cpOf(r.pr.target)), h('span')); })));
    /* after confirming */
    var alt = h('input', { class: 'field', placeholder: 'If it changed or was refused, type what happened', autocomplete: 'off', 'aria-label': 'What happened after confirming' });
    function conf(res, msg) { C.addTest({ text: S.name, target: '', res: res, alt: res === 'ok' ? '' : (alt.value.trim() || msg), note: 'After pressing confirm' }); P.toast('Saved. Thank you'); }
    out.push(h('div', { class: 'ih' }, 'After you confirm'), h('p', { class: 'fine', style: 'margin:0 0 10px' }, 'Only this result is definitive. If you went ahead, tell the lab what happened.'), alt,
      h('div', { class: 'actions', style: 'margin-top:10px' }, h('button', { class: 'btn', type: 'button', onclick: function () { conf('ok'); } }, 'Accepted as typed'), h('button', { class: 'btn', type: 'button', onclick: function () { conf('alt', 'changed by the game'); } }, 'Changed'), h('button', { class: 'btn', type: 'button', onclick: function () { conf('no', 'refused'); } }, 'Refused')),
      h('div', { class: 'actions' }, h('a', { class: 'btn', href: 'compatibility.html#log' }, 'See log and submit'), h('button', { class: 'btn', type: 'button', onclick: function () { go(1); } }, 'Test another name')));
    return out;
  }
  function render() { var f = [null, step1, step2, step3, step4][S.step]; root.replaceChildren.apply(root, f().filter(Boolean)); }
  render();

  /* ---- ready-made batches ---- */
  var st = function (t, id) { return P.applyStyle(t, id); };
  var BATCHES = [
    { id: 'space', label: 'Spaces and gaps', blurb: 'Players report that letters like ī, ū, ē, ō and į are drawn as gaps, and that special spaces may be stripped. Which one does your game treat as a space?', items: [
      ['Cool Ghost', 'a normal space'], ['CoolīGhost', 'ī between words'], ['CoolūGhost', 'ū between words'], ['CoolēGhost', 'ē between words'], ['CoolōGhost', 'ō between words'], ['CoolįGhost', 'į between words'], ['CoolĪGhost', 'capital Ī'],
      ['Cool　Ghost', 'ideographic space U+3000'], ['CoolㅤGhost', 'Hangul filler U+3164'], ['Cool⠀Ghost', 'braille blank U+2800'], ['Cool Ghost', 'no-break space U+00A0']] },
    { id: 'wide', label: 'Wide and styled letters', blurb: 'Fullwidth letters look spaced out and take 3 bytes each. Do they, and the other styles, survive?', items: [
      ['Baashi', 'plain, for comparison'], [st('Baashi', 'fullwidth'), 'fullwidth'], [st('Baashi', 'bold'), 'bold'], [st('Baashi', 'boldscript'), 'bold script'], [st('Baashi', 'fraktur'), 'gothic'], [st('Baashi', 'double'), 'double-struck'], [st('Baashi', 'smallcaps'), 'small caps'], [st('Baashi', 'circled'), 'circled'], [st('Baashi', 'canadian'), 'Canadian lookalike'], [st('Baashi', 'cjk'), 'CJK lookalike']] },
    { id: 'frames', label: 'Frames and symbols', blurb: 'Brackets, stars and combining marks around a plain name.', items: [
      ['『Ghost』', 'corner brackets'], ['【NX】Ghost', 'tag prefix'], ['★Ghost★', 'stars'], ['꧁Ghost꧂', 'ornate'], ['༺Ghost༻', 'wings'], ['ミ★Ghost★彡', 'kana frame'], ['Ghost×͜×', 'combining mark'], ['Ghost♛', 'crown'], ['Ghost⚡', 'emoji-capable symbol'], ['ᵍʰᵒˢᵗ', 'superscript letters']] },
    { id: 'length', label: 'Length', blurb: 'Plain, accented, CJK and fullwidth names around the 14 mark. Where does the box stop you, and by which count?', items: [
      ['AbcdefghijKLMN', '14 plain letters'], ['AbcdefghijKLMNO', '15 plain letters'], ['CīOīLīLīIīN', '11 visible, 16 bytes'], ['ĀĒĪŌŪĀĒ', '7 visible, 14 bytes'], ['ĀĒĪŌŪĀĒĪ', '8 visible, 16 bytes'], ['亗亗亗亗', '4 visible, 12 bytes'], ['亗亗亗亗亗', '5 visible, 15 bytes'], ['Ｂａａｓｈｉ', '6 visible, 18 bytes'], ['ＢａａｓｈｉＢ', '7 visible, 21 bytes']] }
  ];
  var bat = BATCHES[0];
  function logged(text) { return C.tests().filter(function (t) { return t.text === text && !t.target; })[0]; }
  function bRow(it) {
    var text = it[0], row = h('div', { class: 'brow' }), cur = logged(text);
    var alt = h('input', { class: 'field', placeholder: 'What did it become? (optional)', autocomplete: 'off', 'aria-label': 'What it became', hidden: true });
    function mk(label, res, msg) { return h('button', { class: 'btn sm' + (cur && cur.res === res ? ' primary' : ''), type: 'button', onclick: function () {
      if (res === 'alt' && alt.hidden) { alt.hidden = false; alt.focus(); P.toast('Type what you see, then tap Changed again'); return; }
      C.addTest({ text: text, target: '', res: res, alt: res === 'alt' ? (alt.value.trim() ? 'changed to “' + alt.value.trim() + '”' : 'changed by the game') : res === 'no' ? 'rejected' : '', note: 'Typed in the name box from a ready-made batch' }); paintBatch(); } }, label); }
    row.append(h('div', { class: 'bn' }, h('div', { class: 'lg', onclick: function () { P.copy(text, 'Copied. Paste it into the game'); }, title: 'Tap to copy' }, text), h('small', null, it[1] + ' · ' + P.measure(text).g + ' visible, ' + P.measure(text).u8 + ' bytes')),
      h('div', { class: 'bb' }, h('button', { class: 'btn sm', type: 'button', onclick: function () { P.copy(text, 'Copied. Paste it into the game'); } }, 'Copy'), mk('Accepted', 'ok'), mk('Changed', 'alt'), mk('Rejected', 'no'), cur ? ui.badge(cur.res === 'ok' ? 'yours-ok' : cur.res === 'no' ? 'yours-no' : 'yours-alt', cur.res === 'ok' ? 'Accepted' : cur.res === 'no' ? 'Rejected' : 'Changed') : null), alt);
    return row;
  }
  function paintBatch() {
    $('#bBlurb').textContent = bat.blurb; var box = $('#bList'); box.replaceChildren.apply(box, bat.items.map(bRow));
    var n = bat.items.filter(function (it) { return logged(it[0]); }).length; $('#bProg').textContent = n + ' of ' + bat.items.length + ' tested';
  }
  ui.chips($('#bChips'), BATCHES.map(function (b) { return [b.id, b.label]; }), bat.id, function (id) { bat = BATCHES.filter(function (b) { return b.id === id; })[0]; paintBatch(); });
  $('#bSubmit').addEventListener('click', function () { var t = C.tests(); if (!t.length) { P.toast('Test a name first'); return; } var r = C.issueURL(t); if (r.copied) P.copy(r.json, 'Results copied. Paste them into the issue'); window.open(r.url, '_blank', 'noopener'); });
  paintBatch();
})(window.PNL);
