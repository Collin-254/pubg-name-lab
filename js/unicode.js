/* PUBG Name Lab — Unicode intelligence.
   Describes single characters and whole nicknames: names, categories, scripts, blocks, encodings,
   normalisation, invisible / lookalike / mixed-script warnings. No DOM access (Node-testable).
   Depends on core.js and data/unicode-blocks.js. Character names come from data/unicode-names.js (lazy). */
window.PNL = window.PNL || {};
(function (P) {
  'use strict';
  var U = P.UNI = {};
  var hex = function (n) { return n.toString(16).toUpperCase().padStart(4, '0'); };
  var cpStr = function (ch) { return Array.from(ch).map(function (c) { return 'U+' + hex(c.codePointAt(0)); }).join(' '); };

  /* ---------- blocks ---------- */
  U.block = function (cp) {
    var B = P.BLOCKS || [], lo = 0, hi = B.length - 1;
    while (lo <= hi) { var m = (lo + hi) >> 1; if (cp < B[m][0]) hi = m - 1; else if (cp > B[m][1]) lo = m + 1; else return B[m][2]; }
    return 'Unassigned range';
  };

  /* ---------- general category ---------- */
  var CATS = [['Lu', 'Uppercase letter'], ['Ll', 'Lowercase letter'], ['Lt', 'Titlecase letter'], ['Lm', 'Modifier letter'], ['Lo', 'Other letter'],
    ['Mn', 'Combining mark (non-spacing)'], ['Mc', 'Combining mark (spacing)'], ['Me', 'Enclosing mark'], ['Nd', 'Decimal digit'], ['Nl', 'Letter-like number'], ['No', 'Other number'],
    ['Pc', 'Connector punctuation'], ['Pd', 'Dash'], ['Ps', 'Opening bracket'], ['Pe', 'Closing bracket'], ['Pi', 'Opening quote'], ['Pf', 'Closing quote'], ['Po', 'Other punctuation'],
    ['Sm', 'Math symbol'], ['Sc', 'Currency symbol'], ['Sk', 'Modifier symbol'], ['So', 'Other symbol'], ['Zs', 'Space'], ['Zl', 'Line separator'], ['Zp', 'Paragraph separator'],
    ['Cc', 'Control character'], ['Cf', 'Invisible format character'], ['Cs', 'Surrogate'], ['Co', 'Private use'], ['Cn', 'Unassigned']]
    .map(function (a) { return { code: a[0], label: a[1], re: new RegExp('^\\p{' + a[0] + '}$', 'u') }; });
  U.category = function (ch) { for (var i = 0; i < CATS.length; i++) if (CATS[i].re.test(ch)) return { code: CATS[i].code, label: CATS[i].label }; return { code: 'Cn', label: 'Unassigned' }; };

  /* ---------- scripts ---------- */
  var SCRIPTS = ['Latin', 'Greek', 'Cyrillic', 'Armenian', 'Hebrew', 'Arabic', 'Syriac', 'Thaana', 'Devanagari', 'Bengali', 'Gurmukhi', 'Gujarati', 'Tamil', 'Telugu', 'Kannada', 'Malayalam', 'Sinhala', 'Thai', 'Lao', 'Tibetan', 'Myanmar', 'Georgian', 'Hangul', 'Ethiopic', 'Cherokee', 'Canadian_Aboriginal', 'Ogham', 'Runic', 'Khmer', 'Mongolian', 'Hiragana', 'Katakana', 'Bopomofo', 'Han', 'Yi', 'Braille', 'Javanese', 'Balinese', 'Coptic', 'Common', 'Inherited']
    .map(function (n) { return { n: n, re: new RegExp('^\\p{Script=' + n + '}$', 'u') }; });
  U.script = function (ch) {
    for (var i = 0; i < SCRIPTS.length; i++) if (SCRIPTS[i].re.test(ch)) return SCRIPTS[i].n.replace('_', ' ');
    return 'Other';
  };

  /* ---------- names ---------- */
  var runs = null;
  U.namesLoaded = function () { return !!P.UNAMES; };
  U.loadNames = function () {
    return new Promise(function (res) {
      if (P.UNAMES || typeof document === 'undefined') return res();
      if (document.querySelector('script[data-unames]')) { var t = setInterval(function () { if (P.UNAMES) { clearInterval(t); res(); } }, 40); return; }
      var s = document.createElement('script'); s.src = 'data/unicode-names.js'; s.async = true; s.dataset.unames = '1';
      s.onload = function () { res(); }; s.onerror = function () { res(); }; document.head.appendChild(s);
    });
  };
  var HL = ['G', 'GG', 'N', 'D', 'DD', 'R', 'M', 'B', 'BB', 'S', 'SS', '', 'J', 'JJ', 'C', 'K', 'T', 'P', 'H'];
  var HV = ['A', 'AE', 'YA', 'YAE', 'EO', 'E', 'YEO', 'YE', 'O', 'WA', 'WAE', 'OE', 'YO', 'U', 'WEO', 'WE', 'WI', 'YU', 'EU', 'YI', 'I'];
  var HT = ['', 'G', 'GG', 'GS', 'N', 'NJ', 'NH', 'D', 'L', 'LG', 'LM', 'LB', 'LS', 'LT', 'LP', 'LH', 'M', 'B', 'BS', 'S', 'SS', 'NG', 'J', 'C', 'K', 'T', 'P', 'H'];
  U.nameOf = function (cp) {
    if (cp >= 0xAC00 && cp <= 0xD7A3) { var s = cp - 0xAC00; return 'HANGUL SYLLABLE ' + HL[Math.floor(s / 588)] + HV[Math.floor((s % 588) / 28)] + HT[s % 28]; }
    if ((cp >= 0x3400 && cp <= 0x4DBF) || (cp >= 0x4E00 && cp <= 0x9FFF) || (cp >= 0x20000 && cp <= 0x2FA1F)) return 'CJK UNIFIED IDEOGRAPH-' + hex(cp);
    if (cp < 0x20 || (cp >= 0x7F && cp < 0xA0)) return 'CONTROL CHARACTER';
    if (!P.UNAMES) return null;
    if (!runs) runs = P.UNAMES.map(function (r) { return { s: r[0], t: r[1], l: null }; });
    for (var i = 0; i < runs.length; i++) {
      var r = runs[i];
      if (cp < r.s) continue;
      if (!r.l) r.l = r.t.split('\n');
      if (cp < r.s + r.l.length) return r.l[cp - r.s] || null;
    }
    return null;
  };

  /* ---------- invisible, blank-looking, emoji, bidi ---------- */
  var INVISIBLE = /[­͏؜ᅟᅠ឴឵᠋-᠏​-‏‪-‮⁠-⁯⠀ㅤ︀-️﻿ﾠ￹-￻\u{E0000}-\u{E007F}]/u;
  var ODD_SPACE = /[   -   　]/u;
  var BIDI = /[؜‎‏‪-‮⁦-⁩]/u;
  var RTL = /[\p{Script=Arabic}\p{Script=Hebrew}\p{Script=Syriac}\p{Script=Thaana}]/u;
  var PICTO = /\p{Extended_Pictographic}/u;
  U.isInvisible = function (ch) { return INVISIBLE.test(ch) || ODD_SPACE.test(ch); };

  /* ---------- lookalikes: code point -> the Latin character it imitates ---------- */
  var LOOK = {};
  ('0410:A 0412:B 0415:E 041A:K 041C:M 041D:H 041E:O 0420:P 0421:C 0422:T 0425:X 0406:I 0408:J 0405:S 0430:a 0441:c 0435:e 043E:o 0440:p 0445:x 0443:y 0456:i 0458:j 0455:s 0501:d 051B:q 051D:w ' +
    '0391:A 0392:B 0395:E 0396:Z 0397:H 0399:I 039A:K 039C:M 039D:N 039F:O 03A1:P 03A4:T 03A5:Y 03A7:X 03BF:o 03BD:v 03B9:i ' +
    '13AA:A 13F4:B 13DF:C 13A0:D 13AC:E 13BB:H 13D6:I 13AB:J 13E6:K 13DE:L 13B7:M 13E2:P 13DA:S 13A2:T 13D9:V 13B3:W 13C3:Z ' +
    '0131:i 01C0:l 2D54:O 0555:O 054D:U 0585:o 0578:n 057C:n 0570:h').split(' ').forEach(function (p) { var a = p.split(':'); LOOK[parseInt(a[0], 16)] = a[1]; });
  U.looksLike = function (ch) { var l = LOOK[ch.codePointAt(0)]; return l || null; };
  U.lookalikeCount = Object.keys(LOOK).length;

  /* ---------- one character (a single code point) ---------- */
  U.describe = function (ch) {
    var c = ch.codePointAt(0), cat = U.category(ch), nfkc = ch.normalize('NFKC'), flags = [];
    if (INVISIBLE.test(ch)) flags.push('invisible'); else if (ODD_SPACE.test(ch)) flags.push('odd-space');
    if (cat.code === 'Mn' || cat.code === 'Mc' || cat.code === 'Me') flags.push('combining');
    if (PICTO.test(ch)) flags.push('emoji-capable');
    if (BIDI.test(ch)) flags.push('bidi-control'); else if (RTL.test(ch)) flags.push('right-to-left');
    if (cat.code === 'Co') flags.push('private-use');
    if (cat.code === 'Cn') flags.push('unassigned');
    if (c === 0xFFFD) flags.push('replacement');
    if (c > 0xFFFF) flags.push('astral');
    var like = U.looksLike(ch); if (like) flags.push('lookalike');
    if (nfkc !== ch && !flags.includes('combining')) flags.push('folds');
    var enc = new TextEncoder().encode(ch);
    return {
      ch: ch, cp: c, hex: 'U+' + hex(c), name: U.nameOf(c), cat: cat, script: U.script(ch), block: U.block(c),
      u16: ch.length, u8: enc.length, u8hex: Array.from(enc).map(function (b) { return b.toString(16).toUpperCase().padStart(2, '0'); }).join(' '),
      u16hex: Array.from({ length: ch.length }, function (_, i) { return hex(ch.charCodeAt(i)); }).join(' '),
      nfkc: nfkc, like: like, flags: flags
    };
  };

  /* ---------- a whole nickname ---------- */
  var AMBIG = /[Il1|]/g;
  U.analyze = function (text) {
    text = String(text == null ? '' : text);
    var gs = P.graphemes(text), cps = Array.from(text);
    var out = { text: text, gCount: gs.length, cpCount: cps.length, u16: text.length, u8: new TextEncoder().encode(text).length, graphemes: [], scripts: [], dups: [], styledDups: [], checks: [] };
    out.nfc = text.normalize('NFC'); out.nfd = text.normalize('NFD'); out.nfkc = text.normalize('NFKC'); out.nfkd = text.normalize('NFKD');
    var counts = {}, scriptSet = {}, lookalikes = [], invisibles = [], combining = 0, pictos = [], emojiDefault = [], foldChars = [], oddSpaces = [];
    gs.forEach(function (g) {
      var parts = Array.from(g).map(U.describe);
      out.graphemes.push({ g: g, parts: parts });
      counts[g] = (counts[g] || 0) + 1;
      parts.forEach(function (d) {
        if (d.script !== 'Common' && d.script !== 'Inherited') scriptSet[d.script] = (scriptSet[d.script] || 0) + 1;
        if (d.flags.includes('lookalike')) lookalikes.push(d);
        if (d.flags.includes('invisible')) invisibles.push(d);
        if (d.flags.includes('odd-space')) oddSpaces.push(d);
        if (d.flags.includes('combining')) combining++;
        if (d.flags.includes('emoji-capable')) { pictos.push(d); if (/\p{Emoji_Presentation}/u.test(d.ch)) emojiDefault.push(d); }
        if (d.flags.includes('folds')) foldChars.push(d);
      });
    });
    out.scripts = Object.keys(scriptSet);
    Object.keys(counts).forEach(function (g) { if (counts[g] > 1 && !/^\s$/.test(g)) out.dups.push({ g: g, n: counts[g] }); });
    /* different characters that fold to the same plain letter (e.g. A and 𝐀) */
    var byFold = {}; Object.keys(counts).forEach(function (g) { var f = g.normalize('NFKC'); if (/^[A-Za-z0-9]$/.test(f)) (byFold[f.toLowerCase()] = byFold[f.toLowerCase()] || []).push(g); });
    Object.keys(byFold).forEach(function (k) { var set = byFold[k]; if (set.length > 1 && set.some(function (g) { return g !== g.normalize('NFKC'); })) out.styledDups.push({ letter: k, forms: set }); });

    var C = out.checks, add = function (l, b, t, d, extra) { var o = { l: l, b: b, t: t, d: d }; if (extra) Object.assign(o, extra); C.push(o); };
    var list = function (arr, n) { var seen = {}, o = []; arr.forEach(function (d) { if (!seen[d.hex]) { seen[d.hex] = 1; o.push(d); } }); return o.slice(0, n || 6); };
    var show = function (arr) { return list(arr).map(function (d) { return (d.ch.trim() ? d.ch + ' ' : '') + d.hex + (d.name ? ' ' + d.name : ''); }).join('; '); };

    if (!text) { add('info', 'Idle', 'Nothing to check yet', 'Type or paste a nickname to inspect every character in it.'); return out; }

    if (/^[\p{N}\s]+$/u.test(text)) add('warn', 'Heads-up', 'Numeric-only name', 'A PUBG MOBILE developer said numeric-only nicknames would be prevented. Add letters or symbols.');
    if (text !== text.trim()) add('warn', 'Heads-up', 'Leading or trailing space', 'Edge spaces are commonly trimmed by name fields, so the saved name may differ from what you typed.');
    if (/\s{2,}/.test(text)) add('info', 'Unknown', 'Consecutive spaces', 'Repeated spaces may be collapsed. Space handling is not officially specified.');
    else if (/\s/.test(text.trim())) add('info', 'Unknown', 'Contains spaces', 'Space handling is not officially specified. Test it in-game.');
    if (invisibles.length) add('warn', 'Heads-up', 'Invisible or blank-looking characters', 'These take up space in the count but show nothing, and name fields often strip or reject them: ' + show(invisibles) + '.', { chars: list(invisibles).map(function (d) { return d.ch; }) });
    if (oddSpaces.length) add('warn', 'Heads-up', 'Unusual space characters', 'These look like a space but are different characters, so they may be treated differently from a normal space: ' + show(oddSpaces) + '.');
    if (text.indexOf('�') >= 0) add('warn', 'Heads-up', 'Replacement character (�)', 'U+FFFD usually means a character was damaged when copied or decoded. Re-copy the original.');
    if (BIDI.test(text)) add('warn', 'Heads-up', 'Direction-control characters', 'Invisible left-to-right or right-to-left controls can reorder text and are a common source of display surprises.');
    else if (RTL.test(text)) add('info', 'Note', 'Right-to-left text', 'Arabic, Hebrew and similar scripts can reorder around neighbouring characters and display differently in-game.');
    if (emojiDefault.length) add('warn', 'Heads-up', 'Emoji characters', 'These are drawn as colour emoji by default, and emoji support in nicknames is not officially specified: ' + show(emojiDefault) + '.', { chars: list(emojiDefault).map(function (d) { return d.ch; }) });
    var textPicto = pictos.filter(function (d) { return emojiDefault.indexOf(d) < 0; });
    if (textPicto.length) add('info', 'Note', 'May render as emoji', 'These are plain symbols, but some phones and fonts draw them as colour emoji: ' + show(textPicto) + '.', { chars: list(textPicto).map(function (d) { return d.ch; }) });
    if (combining) {
      var stack = 0, maxStack = 0; cps.forEach(function (c) { if (/\p{M}/u.test(c)) { stack++; if (stack > maxStack) maxStack = stack; } else stack = 0; });
      add('warn', 'Heads-up', combining + ' combining mark' + (combining === 1 ? '' : 's') + (maxStack >= 3 ? ' (heavily stacked)' : ''), 'A combining mark attaches to the character before it. They can be stripped, stack oddly, or count differently. Visible characters: ' + out.gCount + '; code points: ' + out.cpCount + '.');
    }
    if (lookalikes.length) {
      var lk = list(lookalikes).map(function (d) { return d.ch + ' (' + d.script + ') looks like Latin “' + d.like + '”'; }).join('; ');
      add('warn', 'Heads-up', 'Lookalike letters', lk + '. They are different characters from the letters they imitate, so a name using them is a different name and may be filtered or normalised differently.', { chars: list(lookalikes).map(function (d) { return d.ch; }) });
    }
    var letterScripts = out.scripts.filter(function (s) { return s !== 'Braille'; });
    var jp = letterScripts.every(function (s) { return s === 'Han' || s === 'Hiragana' || s === 'Katakana'; });
    var CONFUSABLE_SCRIPTS = ['Cyrillic', 'Greek', 'Armenian', 'Cherokee', 'Canadian Aboriginal'];
    var risky = letterScripts.filter(function (s) { return CONFUSABLE_SCRIPTS.indexOf(s) >= 0; });
    if (letterScripts.indexOf('Latin') >= 0 && risky.length) {
      add('warn', 'Heads-up', 'Mixed scripts: ' + letterScripts.join(', '), 'Latin letters are mixed with ' + risky.join(' / ') + ' letters. Those scripts contain characters that look identical to Latin ones, which is the classic way to make two look-alike names, so mixed names are treated more strictly by some systems.');
    } else if (letterScripts.length > 1 && !jp) {
      add('info', 'Note', 'Several writing systems: ' + letterScripts.join(', '), 'Decorative characters often come from other scripts (for example ツ is Katakana and 亗 is Han). Each needs a font that the game can draw.');
    }
    var nonBmp = cps.filter(function (c) { return c.codePointAt(0) > 0xFFFF; });
    if (nonBmp.length) add('info', 'Note', nonBmp.length + ' supplementary-plane character' + (nonBmp.length === 1 ? '' : 's'), 'Each uses two UTF-16 units and four UTF-8 bytes, so a counter based on those units sees ' + out.u16 + ' where you see ' + out.gCount + '.');
    if (out.nfkc !== text) add('info', 'Unknown', 'NFKC would change this name', 'Normalised, it becomes “' + out.nfkc + '”. It is not confirmed whether PUBG MOBILE applies normalisation.', { fold: out.nfkc });
    if (out.styledDups.length) add('info', 'Note', 'Styled duplicates', out.styledDups.map(function (s) { return '“' + s.letter + '” appears as ' + s.forms.join(' and '); }).join('; ') + '. They look different but fold to the same letter.');
    if (out.dups.length) add('info', 'Note', 'Repeated characters', out.dups.map(function (d) { return d.g + ' ×' + d.n; }).join(', ') + '.');
    var amb = (text.match(AMBIG) || []).length, hasO = /O/.test(text) && /0/.test(text);
    if (amb >= 2 || hasO) add('info', 'Note', 'Easily confused characters', 'I (capital i), l (lowercase L), 1 and | look alike in many fonts, as do O and 0. Readers may mistype a name that mixes them.');
    if (letterScripts.length === 0 && !/\d/.test(text) && !/\p{L}/u.test(text)) add('info', 'Unknown', 'No letters or digits', 'A name made only of symbols may be rejected. Add at least a few letters.');
    var strict = Math.max(out.gCount, out.cpCount, out.u16, out.u8), counts = out.gCount + ' visible, ' + out.cpCount + ' code points, ' + out.u16 + ' UTF-16 units, ' + out.u8 + ' UTF-8 bytes';
    if (strict > 14 && out.gCount <= 14) add('warn', 'Heads-up', 'Over 14 by some counts, though it looks short', 'Counted as ' + counts + '. Players quote a 14-character limit, and one reported name with 11 visible characters but 16 UTF-8 bytes was rejected as too long, which suggests the game may count bytes, not what you see. Accented letters, symbols and CJK characters take 2 to 4 bytes each. This is a report, not a published rule: test the exact name in-game.');
    else add('info', 'Unknown', 'Length: ' + out.gCount + ' visible character' + (out.gCount === 1 ? '' : 's'), 'The maximum length and counting method are not officially specified. This name is ' + counts + '.');
    if (!C.some(function (c) { return c.l === 'warn'; })) C.unshift({ l: 'ok', b: 'Clear', t: 'No local flags raised', d: 'That does not guarantee acceptance. The in-game name field decides.' });
    else { var order = { warn: 0, ok: 1, info: 2 }; C.sort(function (a, b) { return order[a.l] - order[b.l]; }); }
    return out;
  };

  /* plain-English reasons two similar-looking characters differ */
  U.compare = function (a, b) {
    var da = U.describe(Array.from(a)[0] || ''), db = U.describe(Array.from(b)[0] || '');
    var why = [];
    if (da.cp === db.cp) why.push('These are the same character.');
    else {
      why.push('They are different code points (' + da.hex + ' vs ' + db.hex + '), so software treats them as different characters even when the glyphs look identical.');
      if (da.script !== db.script) why.push('They belong to different writing systems (' + da.script + ' vs ' + db.script + '), so scripts-based checks and fonts can treat them differently.');
      if (da.u8 !== db.u8) why.push('They take a different number of bytes (' + da.u8 + ' vs ' + db.u8 + ' in UTF-8), so a byte-based length limit counts them differently.');
      if (da.u16 !== db.u16) why.push('They take a different number of UTF-16 units (' + da.u16 + ' vs ' + db.u16 + ').');
      if (da.nfkc !== db.nfkc) why.push('Compatibility normalisation would turn them into different results (“' + da.nfkc + '” vs “' + db.nfkc + '”).');
      else if (da.nfkc === db.nfkc && da.ch !== da.nfkc) why.push('Compatibility normalisation would fold both to “' + da.nfkc + '”, so a system that normalises would see them as the same.');
      if (da.like === db.ch || db.like === da.ch) why.push('One is a known lookalike of the other.');
    }
    return { a: da, b: db, why: why };
  };
})(window.PNL);
