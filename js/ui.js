/* PUBG Name Lab — shared UI pieces: name cards, evidence badges, the inspector and its dialog.
   Needs core.js, styles.js, unicode.js, compat.js. */
window.PNL = window.PNL || {};
(function (P) {
  'use strict';
  var h = P.h, $ = P.$;
  var ui = P.ui = {};

  /* ---------- small bits ---------- */
  ui.badge = function (level, text) { var e = P.EV[level] || P.EV.none; return h('span', { class: 'ev ' + e.cls, title: e.label }, text || e.label); };

  /* a profile of what a name is made of (used for filters, card chips and sorting) */
  ui.profile = function (text) {
    var a = P.UNI.analyze(text), flags = [], parts = [];
    a.graphemes.forEach(function (g) { g.parts.forEach(function (d) { parts.push(d); }); });
    var plain = parts.every(function (d) { return /^[A-Za-z0-9]$/.test(d.ch); });
    var styled = parts.some(function (d) { return d.flags.indexOf('folds') >= 0 && /^[A-Za-z0-9]$/.test(d.nfkc); });
    var symbols = parts.some(function (d) { return /^[SP]/.test(d.cat.code) || (d.cat.code === 'Lo' && /Han|Katakana|Hiragana|Georgian|Javanese|Tibetan/.test(d.script)) || d.cat.code === 'Sc'; });
    var combining = parts.some(function (d) { return d.flags.indexOf('combining') >= 0; });
    var nonLatin = a.scripts.some(function (s) { return s !== 'Latin'; });
    if (plain) flags.push({ id: 'plain', label: 'plain letters' });
    if (styled) flags.push({ id: 'styled', label: 'styled letters' });
    if (symbols) flags.push({ id: 'symbols', label: 'symbols' });
    if (combining) flags.push({ id: 'combining', label: 'combining marks', warn: true });
    if (parts.some(function (d) { return d.flags.indexOf('invisible') >= 0; })) flags.push({ id: 'invisible', label: 'invisible', warn: true });
    if (a.checks.some(function (c) { return c.t === 'Emoji characters'; })) flags.push({ id: 'emoji', label: 'emoji', warn: true });
    if (nonLatin && !symbols && !styled) flags.push({ id: 'nonlatin', label: a.scripts.join(' + ') });
    if (/\s/.test(text.trim())) flags.push({ id: 'space', label: 'has space', warn: true });
    return { a: a, flags: flags, plain: plain, styled: styled, symbols: symbols, combining: combining, nonLatin: nonLatin, words: !/\s/.test(text.trim()) };
  };

  /* ---------- name card ----------
     opts: { text, state?, middle?:Node, compact?:bool, onFav?:fn } */
  ui.nameCard = function (o) {
    var text = o.text, pf = ui.profile(text), a = pf.a;
    var nameEl = h('div', { class: 'nname', title: 'Click to copy', tabindex: '0', role: 'button', 'aria-label': 'Copy ' + text }, text);
    var copyBtn = h('button', { class: 'btn sm primary', type: 'button', 'data-act': 'copy', 'aria-label': 'Copy ' + text }, 'Copy');
    var favBtn = h('button', { class: 'btn sm heart', type: 'button', 'data-act': 'fav' });
    var paintFav = function () { var on = P.favs.has(text); favBtn.textContent = on ? '♥' : '♡'; favBtn.setAttribute('aria-pressed', on ? 'true' : 'false'); favBtn.setAttribute('aria-label', (on ? 'Remove ' : 'Save ') + text + (on ? ' from My names' : ' to My names')); favBtn.title = on ? 'Saved. Click to remove' : 'Save to My names'; };
    paintFav();
    var doCopy = function () { P.copy(text, 'Copied ' + text); P.flash(copyBtn); };
    copyBtn.addEventListener('click', doCopy);
    nameEl.addEventListener('click', doCopy);
    nameEl.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); doCopy(); } });
    favBtn.addEventListener('click', function () { var on = P.favs.toggle(text, o.state ? P.normState(o.state) : undefined); paintFav(); P.toast(on ? 'Saved to My names' : 'Removed from My names'); if (o.onFav) o.onFav(on); });
    var studio = h('a', { class: 'btn sm', href: P.studioURL(o.state || text), 'aria-label': 'Open ' + text + ' in Studio' }, 'Studio');
    var insp = h('button', { class: 'btn sm', type: 'button', 'aria-label': 'Inspect characters in ' + text, onclick: function () { ui.inspectDialog(text); } }, 'Inspect');
    var lv = P.compat.levelFor(text);
    var meta = h('div', { class: 'nmeta' },
      h('span', { class: 'ncount' }, a.gCount + ' char' + (a.gCount === 1 ? '' : 's') + ' · ' + a.u16 + ' UTF-16 · ' + a.u8 + ' B'),
      pf.flags.map(function (f) { return h('span', { class: 'fl' + (f.warn ? ' fl-warn' : '') }, f.label); }),
      lv !== 'none' ? ui.badge(lv) : null);
    var card = h('div', { class: 'ncard', role: 'listitem', dataset: { text: text } },
      o.label ? h('div', { class: 'nlabel' }, o.label) : null, nameEl, o.middle || null, meta,
      h('div', { class: 'nfoot' }, h('div', { class: 'nact' }, copyBtn, favBtn, studio, insp)));
    card._profile = pf; card._repaintFav = paintFav;
    return card;
  };
  /* keep every visible heart in sync when favourites change elsewhere */
  P.favs.on(function () { P.$$('.ncard').forEach(function (c) { if (c._repaintFav) c._repaintFav(); }); });

  /* ---------- pill-style filter group ---------- */
  ui.chips = function (root, items, value, onPick) {
    root.replaceChildren();
    items.forEach(function (it) {
      var b = h('button', { class: 'chip', type: 'button', 'aria-pressed': String(it[0] === value), dataset: { v: it[0] } }, it[1], it[2] != null ? h('i', null, it[2]) : null);
      b.addEventListener('click', function () { P.$$('.chip', root).forEach(function (c) { c.setAttribute('aria-pressed', String(c === b)); }); onPick(it[0]); });
      root.append(b);
    });
  };

  /* ---------- inspector ---------- */
  var FLAGTXT = { 'invisible': 'invisible', 'odd-space': 'unusual space', 'combining': 'combining', 'emoji-capable': 'can draw as emoji', 'bidi-control': 'direction control', 'right-to-left': 'right-to-left', 'private-use': 'private use', 'unassigned': 'unassigned', 'replacement': 'damaged text', 'astral': 'supplementary plane', 'lookalike': 'lookalike', 'folds': 'folds to plain' };
  var WARNFLAG = { 'invisible': 1, 'odd-space': 1, 'bidi-control': 1, 'private-use': 1, 'unassigned': 1, 'replacement': 1, 'lookalike': 1, 'combining': 1 };
  ui.glyphFor = function (d) {
    if (d.flags.indexOf('invisible') >= 0 || d.flags.indexOf('odd-space') >= 0) return h('span', { class: 'blankbox', title: 'Draws nothing: ' + d.hex }, d.hex.replace('U+', ''));
    if (d.cp < 0x20 || (d.cp >= 0x7F && d.cp < 0xA0)) return h('span', { class: 'blankbox' }, 'ctrl');
    if (d.flags.indexOf('combining') >= 0) return h('span', null, '◌' + d.ch);
    return h('span', null, d.ch);
  };
  ui.encodingTable = function (a) {
    var bytes = Array.from(new TextEncoder().encode(a.text)).map(function (b) { return b.toString(16).toUpperCase().padStart(2, '0'); }).join(' ');
    var u16 = Array.from({ length: a.text.length }, function (_, i) { return P.hx(a.text.charCodeAt(i)); }).join(' ');
    return [['Code points', Array.from(a.text).map(function (c) { return 'U+' + P.hx(c.codePointAt(0)); }).join(' ')], ['UTF-16 units', u16], ['UTF-8 bytes', bytes]];
  };
  var NORM = [['NFC', 'nfc', 'Canonical composition: joins a letter and its accent into one character where one exists. Rarely changes styled text.'], ['NFD', 'nfd', 'Canonical decomposition: splits accented letters into a base letter plus combining marks.'], ['NFKC', 'nfkc', 'Compatibility composition: folds styled, fullwidth, circled and superscript forms to plain letters. The one that matters most for fancy names.'], ['NFKD', 'nfkd', 'Compatibility decomposition: NFKC, but accents stay split.']];

  ui.renderInspector = function (root, text, opts) {
    opts = opts || {}; root.dataset.text = text;
    var limit = opts.compact ? 24 : 400, showAll = false;
    function paint() {
      var a = P.UNI.analyze(text), rep = P.compat.report(text), counts = {};
      a.graphemes.forEach(function (g) { counts[g.g] = (counts[g.g] || 0) + 1; });
      var kids = [];
      if (!text) { root.replaceChildren(h('p', { class: 'emptystate' }, h('b', null, 'Nothing to inspect yet'), 'Type or paste a nickname to see every character in it.')); return; }

      kids.push(h('dl', { class: 'metrics', 'aria-label': 'Length measures' },
        [[a.gCount, 'visible characters', 'Grapheme clusters: what a person sees as one character.'], [a.cpCount, 'Unicode code points', 'Unicode values in the text.'], [a.u16, 'UTF-16 units', 'JavaScript-style length. Characters outside the BMP use two.'], [a.u8, 'UTF-8 bytes', 'Storage size. Non-Latin characters use 2 to 4 bytes each.']]
          .map(function (m) { return h('div', { class: 'metric', title: m[2] }, h('dd', null, String(m[0])), h('dt', null, m[1])); })));
      kids.push(h('p', { class: 'fine' }, 'Scripts present: ' + (a.scripts.length ? a.scripts.join(', ') : 'none (symbols and punctuation only)') + '.'));

      kids.push(h('h3', { class: 'ih' }, 'What to know about this name'));
      kids.push(h('ul', { class: 'checks', 'aria-label': 'Checks' }, a.checks.map(function (c) {
        return h('li', { class: 'check ' + c.l }, h('span', { class: 'badge' }, c.b), h('b', null, c.t), h('p', null, c.d));
      })));

      /* evidence */
      var ev = [h('div', { class: 'evrow' }, h('span', { class: 'evk' }, 'This exact name'), ui.badge(rep.exact.level), rep.exact.level === 'none' ? h('a', { href: 'compatibility.html?t=' + encodeURIComponent(text), class: 'evlink' }, 'Test it in-game') : null)];
      rep.chars.slice(0, opts.compact ? 6 : 40).forEach(function (c) {
        ev.push(h('div', { class: 'evrow' }, h('span', { class: 'evk evg' }, c.ch), h('code', null, c.hex), ui.badge(c.level), c.inAccepted ? h('small', null, 'in ' + c.inAccepted + ' name' + (c.inAccepted === 1 ? '' : 's') + ' you confirmed') : null));
      });
      kids.push(h('h3', { class: 'ih' }, 'In-game evidence'));
      kids.push(h('div', { class: 'evbox' }, ev, h('p', { class: 'fine' }, (rep.plainCount ? rep.plainCount + ' ordinary letters and digits are not logged individually. ' : '') + 'Valid Unicode is not the same as accepted by the game. "You" means a test you recorded in this browser.')));

      /* characters */
      var rows = a.graphemes.slice(0, showAll ? 4000 : limit).map(function (gr) {
        var parts = gr.parts;
        return h('article', { class: 'crow' },
          h('div', { class: 'cglyph' }, parts.length === 1 ? ui.glyphFor(parts[0]) : h('span', null, gr.g)),
          h('div', { class: 'cbody' },
            parts.map(function (d) {
              var fl = d.flags.filter(function (f) { return FLAGTXT[f]; }).map(function (f) {
                var label = FLAGTXT[f]; if (f === 'lookalike') label = 'looks like “' + d.like + '”'; if (f === 'folds') label = 'folds to “' + d.nfkc + '”'; if (f === 'astral') label = '2 UTF-16 units';
                return h('span', { class: 'fl' + (WARNFLAG[f] ? ' fl-warn' : '') }, label);
              });
              return h('div', { class: 'cp' },
                h('div', { class: 'cpt' }, h('b', null, d.hex), h('span', { class: 'cname' }, d.name || (P.UNI.namesLoaded() ? 'name not in the bundled data' : 'loading name…'))),
                h('div', { class: 'cps' }, d.cat.label + ' · ' + d.script + ' · ' + d.block + ' · UTF-8 ' + d.u8hex + ' · ' + d.u16 + ' UTF-16 unit' + (d.u16 === 1 ? '' : 's')),
                fl.length ? h('div', { class: 'cfl' }, fl) : null);
            }),
            counts[gr.g] > 1 ? h('div', { class: 'cfl' }, h('span', { class: 'fl' }, 'appears ×' + counts[gr.g])) : null,
            P.compat.levelFor(gr.g) !== 'none' ? h('div', { class: 'cfl' }, ui.badge(P.compat.levelFor(gr.g))) : null));
      });
      kids.push(h('h3', { class: 'ih' }, 'Character by character'));
      kids.push(h('div', { class: 'crows' }, rows));
      if (a.graphemes.length > limit && !showAll) kids.push(h('div', { class: 'more' }, h('button', { class: 'btn', type: 'button', onclick: function () { showAll = true; paint(); } }, 'Show all ' + a.graphemes.length + ' characters')));

      if (!opts.compact) {
        kids.push(h('h3', { class: 'ih' }, 'Normalisation'));
        kids.push(h('div', { class: 'tablewrap' }, h('table', { class: 'normt' }, h('thead', null, h('tr', null, h('th', { scope: 'col' }, 'Form'), h('th', { scope: 'col' }, 'Result'), h('th', { scope: 'col' }, 'What it does'))),
          h('tbody', null, NORM.map(function (n) { var r = a[n[1]], same = r === text; return h('tr', null, h('td', { class: 'm' }, n[0]), h('td', { class: 'g2' }, r, h('small', { class: same ? 'same' : 'diff' }, same ? ' same as typed' : ' changed')), h('td', null, n[2])); })))));
        kids.push(h('p', { class: 'fine' }, 'It is not confirmed that PUBG MOBILE normalises names. If it applied NFKC, this name would become “' + a.nfkc + '”.'));
        kids.push(h('h3', { class: 'ih' }, 'Raw encodings'));
        kids.push(h('div', { class: 'rawbox' }, ui.encodingTable(a).map(function (r) { return h('div', null, h('span', { class: 'kicker' }, r[0]), h('code', null, r[1])); })));
      }
      root.replaceChildren.apply(root, kids);
    }
    paint();
    if (!P.UNI.namesLoaded()) P.UNI.loadNames().then(function () { if (root.dataset.text === text && P.UNI.namesLoaded()) paint(); });
    return paint;
  };

  /* ---------- dialog ---------- */
  ui.inspectDialog = function (text) {
    var dlg = document.getElementById('inspectDlg');
    if (!dlg) {
      dlg = h('dialog', { id: 'inspectDlg', class: 'dlg', 'aria-labelledby': 'inspectDlgT' },
        h('div', { class: 'dlg-head' }, h('div', null, h('div', { class: 'kicker' }, 'Unicode inspector'), h('div', { class: 'dlg-name', id: 'inspectDlgT' })),
          h('button', { class: 'btn sm', type: 'button', id: 'inspectClose', 'aria-label': 'Close' }, 'Close')),
        h('div', { class: 'dlg-body', id: 'inspectBody' }),
        h('div', { class: 'dlg-foot' }, h('button', { class: 'btn primary sm', type: 'button', id: 'inspectCopy' }, 'Copy name'), h('a', { class: 'btn sm', id: 'inspectFull' }, 'Open full inspector')));
      document.body.append(dlg);
      dlg.addEventListener('click', function (e) { if (e.target === dlg) dlg.close(); });
      P.$('#inspectClose', dlg).addEventListener('click', function () { dlg.close(); });
    }
    P.$('#inspectDlgT', dlg).textContent = text;
    P.$('#inspectCopy', dlg).onclick = function () { P.copy(text, 'Copied ' + text); };
    P.$('#inspectFull', dlg).href = P.inspectURL(text);
    var body = P.$('#inspectBody', dlg); body.scrollTop = 0;
    ui.renderInspector(body, text, { compact: true });
    if (dlg.showModal) { if (!dlg.open) dlg.showModal(); } else dlg.setAttribute('open', '');
  };
})(window.PNL);
