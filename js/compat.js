/* PUBG Name Lab — compatibility evidence.
   Honest by construction: nothing is marked "verified" unless it is in PNL.COMPAT.records with evidence.
   Your own in-game tests are stored only in your browser and shown as "You", never as community fact.
   Needs core.js and unicode.js. */
window.PNL = window.PNL || {};
(function (P) {
  'use strict';
  P.REPO = 'Collin-254/pubg-name-lab';

  /* The four levels of evidence, weakest to strongest */
  P.COMPAT = {
    updated: '2026-11-24',
    ladder: [
      { id: 'unicode', title: 'Valid Unicode', blurb: 'The character is assigned in the Unicode Standard. Checked automatically in your browser. It says nothing about whether PUBG MOBILE accepts it.' },
      { id: 'reported', title: 'Community-reported', blurb: 'Someone says they tried it in the game. Useful as a lead, not independently checked.' },
      { id: 'verified', title: 'Verified', blurb: 'Reproduced by the maintainer, or by two independent reports on the same game version and platform, with a screenshot or recording.' },
      { id: 'official', title: 'Officially documented', blurb: 'Stated by PUBG MOBILE in its help pages, rules or developer talks. The only level that is a rule rather than an observation.' }
    ],
    sources: {
      help: { title: 'PUBG MOBILE Help Center — How do I change my in-game nickname?', url: 'https://pubgmobile.helpshift.com/hc/en/3-pubg-mobile/faq/120-how-do-i-change-my-in-game-nickname/' },
      devtalk: { title: 'PUBG MOBILE — Developer Talk', url: 'https://www.pubgmobile.com/en/event/devtalk/' },
      report: { title: 'PUBG MOBILE — Report Player and Block Player Function Descriptions', url: 'https://www.pubgmobile.com/webplat/info/news_version3/35372/57705/57706/57821/57822/57823/m22591/202109/901336.shtml' },
      tos: { title: 'PUBG MOBILE — Terms of Service', url: 'https://www.pubgmobile.com/PK/terms.shtml' },
      unicode: { title: 'The Unicode Standard', url: 'https://www.unicode.org/standard/standard.html' }
    },
    /* Documented rules and documented gaps. "official" = stated by PUBG MOBILE; "unspecified" = looked for and not found. */
    policy: [
      { id: 'rename-card', level: 'official', title: 'A Rename Card is required', text: 'The Help Center says an in-game nickname is changed with a Rename Card, obtained through Growth Missions or the Shop.', src: 'help', checked: '2026-11-23' },
      { id: 'daily-limit', level: 'official', title: 'One rename per day', text: 'The Help Center says a Rename Card can be used to change the nickname once per day.', src: 'help', checked: '2026-11-23' },
      { id: 'numeric-only', level: 'official', title: 'Numeric-only names are prevented', text: 'In a developer talk, PUBG MOBILE said it would prevent nicknames made up only of numbers. Digits alongside letters are not banned.', src: 'devtalk', checked: '2026-11-23' },
      { id: 'inappropriate', level: 'official', title: 'Offensive or impersonating names are prohibited', text: 'Rules prohibit offensive or inappropriate content in nicknames, and the Terms of Service restrict impersonation. Names can be acted on after the fact, whatever characters they use.', src: 'report', checked: '2026-11-23' },
      { id: 'max-length', level: 'unspecified', title: 'Maximum length', text: 'No official figure or counting method was found. Figures such as 14 are community reports, not a specification, and the counting method is unclear: one reported name with 11 visible characters but 16 UTF-8 bytes was called too long, which suggests bytes may be counted.', src: 'help', checked: '2026-11-23' },
      { id: 'whitelist', level: 'unspecified', title: 'Accepted character set', text: 'No complete public list of accepted or rejected characters was found. A character being valid Unicode does not mean the game accepts it.', src: 'help', checked: '2026-11-23' },
      { id: 'invisible', level: 'unspecified', title: 'Blank and invisible characters', text: 'No official statement was found. Blank-looking names are a known moderation and support problem in online games generally, and nothing here confirms they work in PUBG MOBILE.', src: 'report', checked: '2026-11-23' },
      { id: 'normalisation', level: 'unspecified', title: 'Unicode normalisation', text: 'No public statement says whether names are normalised (for example with NFKC). Styled letters may or may not be folded to plain letters.', src: 'unicode', checked: '2026-11-23' }
    ],
    /* Published evidence. Add records here (see README). Each one:
       { text, target, result:'ok'|'no', game:'x.y.z', platform:'Android|iOS|Emulator', device:'', tested:'YYYY-MM-DD',
         source:'maintainer'|'community', verified:true|false, evidence:'URL or ""', note:'' }
       "target" is the single character under test (omit it for a whole-name test). */
    records: []
  };

  /* Level definitions used by badges */
  P.EV = {
    'official': { label: 'Official', cls: 'ev-official' },
    'verified-ok': { label: 'Verified: accepted', cls: 'ev-ok' },
    'verified-no': { label: 'Verified: rejected', cls: 'ev-no' },
    'reported-ok': { label: 'Reported: accepted', cls: 'ev-rep' },
    'reported-no': { label: 'Reported: rejected', cls: 'ev-repno' },
    'disputed': { label: 'Disputed', cls: 'ev-warn' },
    'yours-ok': { label: 'You: accepted', cls: 'ev-you' },
    'yours-no': { label: 'You: rejected', cls: 'ev-youno' },
    'yours-alt': { label: 'You: changed', cls: 'ev-youalt' },
    'none': { label: 'Untested', cls: 'ev-none' }
  };

  /* ---------- your tests (browser only) ---------- */
  var TKEY = 'pnl-tests', MKEY = 'pnl-testmeta', subs = [], cache = null;
  var C = P.compat = {};
  function load() { var l = P.store.get(TKEY, []); return Array.isArray(l) ? l.filter(function (t) { return t && typeof t.text === 'string' && ['ok', 'no', 'alt'].indexOf(t.res) >= 0; }) : []; }
  function save() { P.store.set(TKEY, cache); subs.forEach(function (f) { try { f(cache); } catch (e) { } }); }
  C.tests = function () { if (!cache) cache = load(); return cache; };
  C.on = function (f) { subs.push(f); };
  C.meta = function () { return Object.assign({ game: '', platform: 'Android', device: '' }, P.store.get(MKEY, {})); };
  C.setMeta = function (m) { P.store.set(MKEY, m); };
  C.addTest = function (t) {
    var m = C.meta();
    var rec = { id: 't' + Date.now().toString(36) + Math.random().toString(36).slice(2, 5), text: t.text, target: t.target && t.target !== t.text ? t.target : '', res: t.res, alt: t.alt || '', note: t.note || '',
      game: t.game != null ? t.game : m.game, platform: t.platform || m.platform, device: t.device != null ? t.device : m.device, ts: Date.now() };
    cache = C.tests().filter(function (x) { return !(x.text === rec.text && (x.target || '') === rec.target && x.game === rec.game && x.platform === rec.platform); });
    cache.unshift(rec); cache = cache.slice(0, 500); save(); return rec;
  };
  C.removeTest = function (id) { cache = C.tests().filter(function (t) { return t.id !== id; }); save(); };
  C.clearTests = function () { cache = []; save(); };
  C.exportData = function () { return { format: 'pnl-tests', version: 1, exported: new Date().toISOString(), site: 'https://pubg-name-lab.vercel.app/', tests: C.tests() }; };
  C.importData = function (obj) {
    if (!obj || obj.format !== 'pnl-tests' || !Array.isArray(obj.tests)) throw new Error('Not a PUBG Name Lab test file.');
    var have = {}; C.tests().forEach(function (t) { have[t.id] = 1; }); var n = 0;
    obj.tests.forEach(function (t) { if (t && typeof t.text === 'string' && ['ok', 'no', 'alt'].indexOf(t.res) >= 0 && !have[t.id]) { cache.push({ id: String(t.id || 'i' + Math.random().toString(36).slice(2)), text: t.text.slice(0, 200), target: String(t.target || '').slice(0, 40), res: t.res, alt: String(t.alt || '').slice(0, 200), note: String(t.note || '').slice(0, 300), game: String(t.game || '').slice(0, 30), platform: String(t.platform || '').slice(0, 30), device: String(t.device || '').slice(0, 60), ts: +t.ts || Date.now() }); n++; } });
    cache.sort(function (a, b) { return b.ts - a.ts; }); save(); return n;
  };

  /* ---------- evidence lookup ---------- */
  function itemsFor(target) {
    var items = [];
    (P.COMPAT.records || []).forEach(function (r) { if ((r.target || r.text) === target) items.push(Object.assign({ src: 'record' }, r)); });
    C.tests().forEach(function (t) { if ((t.target || t.text) === target) items.push(Object.assign({ src: 'you' }, t)); });
    return items;
  }
  function levelOf(items) {
    var rec = items.filter(function (i) { return i.src === 'record'; });
    if (rec.length) {
      var ver = rec.filter(function (r) { return r.verified; }), pool = ver.length ? ver : rec;
      var ok = pool.some(function (r) { return r.result === 'ok'; }), no = pool.some(function (r) { return r.result === 'no'; });
      if (ok && no) return 'disputed';
      return (ver.length ? 'verified' : 'reported') + (ok ? '-ok' : '-no');
    }
    var you = items.filter(function (i) { return i.src === 'you'; }).sort(function (a, b) { return b.ts - a.ts; });
    return you.length ? 'yours-' + you[0].res : 'none';
  }
  C.levelFor = function (target) { return levelOf(itemsFor(target)); };
  C.itemsFor = itemsFor;
  var plain = /^[A-Za-z0-9]$/;
  C.report = function (text) {
    var gs = P.graphemes(text), seen = {}, chars = [], plainN = 0;
    gs.forEach(function (g) {
      if (plain.test(g)) { plainN++; return; }
      if (/^\s$/.test(g) && g === ' ') { return; }
      if (seen[g]) return; seen[g] = 1;
      var items = itemsFor(g), inOk = C.tests().filter(function (t) { return t.res !== 'no' && t.target !== g && t.text !== g && t.text.indexOf(g) >= 0; }).length;
      chars.push({ ch: g, hex: P.cpOf(g), level: levelOf(items), items: items, inAccepted: inOk });
    });
    var exact = itemsFor(text);
    return { text: text, exact: { level: levelOf(exact), items: exact }, chars: chars, plainCount: plainN };
  };
  C.summary = function () {
    var r = P.COMPAT.records || [], ver = r.filter(function (x) { return x.verified; }).length;
    var t = C.tests();
    return { verified: ver, reported: r.length - ver, yours: t.length, official: P.COMPAT.policy.filter(function (p) { return p.level === 'official'; }).length, unspecified: P.COMPAT.policy.filter(function (p) { return p.level === 'unspecified'; }).length };
  };

  /* ---------- test packs: what to try in-game ---------- */
  var probe = function (ch) { return 'Nl' + ch + 'x7'; };
  C.packs = function () {
    var lib = P.LIB ? P.LIB.groups : [];
    var g = function (id) { var x = lib.filter(function (y) { return y.id === id; })[0]; return x ? x.list : []; };
    return [
      { id: 'blank', title: 'Blank & invisible', blurb: 'The most-asked-about group. Does the game keep, strip or reject each one?', kind: 'char', items: g('blank') },
      { id: 'frames', title: 'Frames & marks', blurb: 'Brackets and marks popular in stylised names.', kind: 'char', items: Array.from('亗ツ乙彡『』【】〖〗꧁꧂༺༻《》') },
      { id: 'symbols', title: 'Symbols', blurb: 'Stars, hearts, shapes and dark symbols. Emoji-capable ones may draw in colour.', kind: 'char', items: Array.from('★☆✦✧♡ღ❀✿☠⚔☯✞♛⚡❤▲◈→') },
      { id: 'combining', title: 'Combining marks & combos', blurb: 'Marks that attach to the character before them.', kind: 'name', items: ['×͜×', '×͡×', '♡͜♡', '•͜•', 'ʘ͜ʘ', 'N̶a̶m̶e̶', 'N̲a̲m̲e̲'].map(function (x) { return { text: x.length < 6 ? 'Nl' + x + 'x7' : x, target: x }; }) },
      { id: 'styles', title: 'Fancy letter styles', blurb: 'The same name in each Unicode style.', kind: 'name', items: ['bold', 'italic', 'script', 'fraktur', 'double', 'mono', 'smallcaps', 'circled', 'fullwidth', 'superscript', 'canadian', 'cjk'].map(function (s) { var t = P.applyStyle('Ghost47', s); return { text: t, target: t, label: P.style(s).label }; }) },
      { id: 'spacelike', title: 'Space-like letters', blurb: 'Players report that letters such as ī, ū, ē, ō and į are drawn as gaps in the game. Check each one and note whether it shows as a gap, a letter or is refused.', kind: 'char', items: Array.from('īūēōįĪŪĒŌĮ') },
      { id: 'length', title: 'Length counting', blurb: 'Does the game count visible characters or bytes? These names are chosen to tell the two apart against a 14-character limit.', kind: 'name', items: [
        { text: 'AbcdefghijKLMN', label: '14 plain letters: 14 visible, 14 bytes' }, { text: 'AbcdefghijKLMNO', label: '15 plain letters: 15 visible, 15 bytes' },
        { text: 'CīOīLīLīIīN', label: '11 visible, 16 bytes (the reported case)' }, { text: 'ĀĒĪŌŪĀĒ', label: '7 visible, 14 bytes' }, { text: 'ĀĒĪŌŪĀĒĪ', label: '8 visible, 16 bytes' },
        { text: '亗亗亗亗', label: '4 visible, 12 bytes' }, { text: '亗亗亗亗亗', label: '5 visible, 15 bytes' }] },
      { id: 'scripts', title: 'Other alphabets', blurb: 'One letter each from common writing systems.', kind: 'char', items: Array.from('ΩДдアあ가ก中ن א') }
    ].map(function (p) {
      p.probes = p.items.map(function (it) {
        if (typeof it === 'string') return { text: probe(it), target: it, label: P.UNI.nameOf(it.codePointAt(0)) || P.cpOf(it) };
        return { text: it.text, target: it.target, label: it.label || '' };
      });
      return p;
    });
  };

  /* ---------- sharing ---------- */
  C.records = function (tests) {
    return tests.map(function (t) {
      var r = { text: t.text, result: t.res === 'no' ? 'no' : 'ok', game: t.game || '', platform: t.platform || '', device: t.device || '', tested: new Date(t.ts || Date.now()).toISOString().slice(0, 10), source: 'community', verified: false, evidence: '', note: (t.res === 'alt' ? 'Accepted but changed' + (t.alt ? ' to: ' + t.alt : '') + '. ' : '') + (t.note || '') };
      if (t.target) r.target = t.target; return r;
    });
  };
  C.issueURL = function (tests) {
    var m = C.meta(), recs = C.records(tests);
    var json = JSON.stringify(recs, null, 1);
    var head = 'Game version: ' + (m.game || '?') + '\nPlatform: ' + (m.platform || '?') + '\nDevice: ' + (m.device || '?') + '\n\n';
    var steps = '\nEvidence (screenshots or a short recording) makes a report much more useful. Attach it below.\n';
    var body = head + 'Results (each one is a ready-to-paste record):\n\n```json\n' + json + '\n```\n' + steps;
    var base = 'https://github.com/' + P.REPO + '/issues/new?title=' + encodeURIComponent('Compatibility results: ' + (m.platform || '?') + ', game ' + (m.game || '?') + ' (' + tests.length + ' tests)') + '&body=';
    var url = base + encodeURIComponent(body), copied = false;
    if (url.length > 7000) { url = base + encodeURIComponent(head + 'The results JSON is too long for a link. It was copied to your clipboard: paste it below.\n\n```json\n\n```\n' + steps); copied = true; }
    return { url: url, json: json, copied: copied };
  };
})(window.PNL);
