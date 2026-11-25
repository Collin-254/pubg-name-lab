/* PUBG Name Lab — the Unicode text-style engine.
   One source of truth for styles, frames, case, composition and the reverse ("unstyle") mapping.
   No DOM access, so it can be unit-tested in Node. */
window.PNL = window.PNL || {};
(function (P) {
  'use strict';
  var cp = function (n) { return String.fromCodePoint(n); };
  var LOWER = 'abcdefghijklmnopqrstuvwxyz', UPPER = LOWER.toUpperCase(), DIGITS = '0123456789';

  /* Mathematical Alphanumeric Symbols: contiguous runs with a few holes filled from Letterlike Symbols */
  function mathMap(U, L, ex, D) {
    var m = {}; ex = ex || {};
    for (var i = 0; i < 26; i++) { m[UPPER[i]] = ex[UPPER[i]] || cp(U + i); m[LOWER[i]] = ex[LOWER[i]] || cp(L + i); }
    if (D != null) for (var j = 0; j < 10; j++) m[DIGITS[j]] = cp(D + j);
    return m;
  }
  function fromLists(src, dst) { var m = {}, a = Array.from(src), b = Array.from(dst); a.forEach(function (c, i) { m[c] = b[i]; }); return m; }
  function both(upperDst) { var m = {}, b = Array.from(upperDst); for (var i = 0; i < 26; i++) { m[UPPER[i]] = b[i]; m[LOWER[i]] = b[i]; } return m; }
  function merge() { var o = {}; for (var i = 0; i < arguments.length; i++) Object.assign(o, arguments[i]); return o; }

  var smallcaps = both('ᴀʙᴄᴅᴇꜰɢʜɪᴊᴋʟᴍɴᴏᴘǫʀꜱᴛᴜᴠᴡxʏᴢ');
  var sup = merge(fromLists(LOWER + DIGITS, 'ᵃᵇᶜᵈᵉᶠᵍʰⁱʲᵏˡᵐⁿᵒᵖqʳˢᵗᵘᵛʷˣʸᶻ⁰¹²³⁴⁵⁶⁷⁸⁹'));
  var supUpper = merge(sup, fromLists('ABDEGHIJKLMNOPRTUVW', 'ᴬᴮᴰᴱᴳᴴᴵᴶᴷᴸᴹᴺᴼᴾᴿᵀᵁⱽᵂ'));
  ['C', 'F', 'Q', 'S', 'X', 'Y', 'Z'].forEach(function (c) { supUpper[c] = sup[c.toLowerCase()]; });
  var sub = fromLists('aehijklmnoprstuvx' + DIGITS, 'ₐₑₕᵢⱼₖₗₘₙₒₚᵣₛₜᵤᵥₓ₀₁₂₃₄₅₆₇₈₉');
  var subU = {}; Object.keys(sub).forEach(function (k) { subU[k] = sub[k]; if (/[a-z]/.test(k)) subU[k.toUpperCase()] = sub[k]; });
  var fullwidth = {}; for (var c = 0x21; c <= 0x7E; c++) fullwidth[String.fromCharCode(c)] = cp(c + 0xFEE0);
  var circled = merge(fromLists(UPPER, P.R(0x24B6, 0x24CF)), fromLists(LOWER, P.R(0x24D0, 0x24E9)), fromLists('123456789', P.R(0x2460, 0x2468)), { '0': '⓪' });
  var negcircled = merge(both(P.R(0x1F150, 0x1F169)), fromLists('123456789', P.R(0x2776, 0x277E)), { '0': '⓿' });
  var squared = both(P.R(0x1F130, 0x1F149));
  var negsquared = both(P.R(0x1F170, 0x1F189));
  var cjk = both('卂乃匚刀乇下厶卄工丁长乚从ん口尸㔿尺丂丅凵リ山乂丫乙');
  var canadian = both('ᗩᗷᑕᗪᗴᖴᘜᕼᓰᒍᛕᒪᗰᑎᗝᑭᑫᖇᔕ丅ᑌᐯᗯ᙭Ƴ乙');
  var flipMap = merge(fromLists(LOWER, 'ɐqɔpǝɟƃɥᴉɾʞlɯuodbɹsʇnʌʍxʎz'), fromLists('1234567890!?.,&', 'ƖᄅƐㄣϛ9ㄥ860¡¿˙\'⅋'));
  UPPER.split('').forEach(function (u) { flipMap[u] = flipMap[u.toLowerCase()]; });

  function perChar(map) { return function (t) { return Array.from(t).map(function (c) { return map[c] != null ? map[c] : c; }).join(''); }; }
  function addMark(m) { return function (t) { return Array.from(t).map(function (c) { return /\s/.test(c) ? c : c + m; }).join(''); }; }
  function flip(t) { return Array.from(t).map(function (c) { return flipMap[c] != null ? flipMap[c] : c; }).reverse().join(''); }

  /* id, label, category, description, character map (or function) */
  var defs = [
    ['bold', 'Bold', 'weight', 'Mathematical bold', mathMap(0x1D400, 0x1D41A, null, 0x1D7CE)],
    ['italic', 'Italic', 'weight', 'Mathematical italic', mathMap(0x1D434, 0x1D44E, { h: 'ℎ' })],
    ['bolditalic', 'Bold italic', 'weight', 'Mathematical bold italic', mathMap(0x1D468, 0x1D482)],
    ['sans', 'Sans', 'weight', 'Mathematical sans-serif', mathMap(0x1D5A0, 0x1D5BA, null, 0x1D7E2)],
    ['sansbold', 'Sans bold', 'weight', 'Mathematical sans-serif bold', mathMap(0x1D5D4, 0x1D5EE, null, 0x1D7EC)],
    ['sansitalic', 'Sans italic', 'weight', 'Mathematical sans-serif italic', mathMap(0x1D608, 0x1D622)],
    ['sansbolditalic', 'Sans bold italic', 'weight', 'Mathematical sans-serif bold italic', mathMap(0x1D63C, 0x1D656)],
    ['script', 'Script', 'script', 'Mathematical script', mathMap(0x1D49C, 0x1D4B6, { B: 'ℬ', E: 'ℰ', F: 'ℱ', H: 'ℋ', I: 'ℐ', L: 'ℒ', M: 'ℳ', R: 'ℛ', e: 'ℯ', g: 'ℊ', o: 'ℴ' })],
    ['boldscript', 'Bold script', 'script', 'Mathematical bold script', mathMap(0x1D4D0, 0x1D4EA)],
    ['fraktur', 'Gothic', 'script', 'Mathematical fraktur', mathMap(0x1D504, 0x1D51E, { C: 'ℭ', H: 'ℌ', I: 'ℑ', R: 'ℜ', Z: 'ℨ' })],
    ['boldfraktur', 'Bold gothic', 'script', 'Mathematical bold fraktur', mathMap(0x1D56C, 0x1D586)],
    ['double', 'Outline', 'script', 'Mathematical double-struck', mathMap(0x1D538, 0x1D552, { C: 'ℂ', H: 'ℍ', N: 'ℕ', P: 'ℙ', Q: 'ℚ', R: 'ℝ', Z: 'ℤ' }, 0x1D7D8)],
    ['mono', 'Monospace', 'small', 'Mathematical monospace', mathMap(0x1D670, 0x1D68A, null, 0x1D7F6)],
    ['smallcaps', 'Small caps', 'small', 'Small capitals (IPA / Phonetic Extensions). No true small-cap Q or X exists, so ǫ and x stand in.', smallcaps],
    ['superscript', 'Superscript', 'small', 'Superscript forms. There is no standard superscript q, so q stays as it is.', supUpper],
    ['subscript', 'Subscript', 'small', 'Subscript forms. Only some letters exist; the rest stay unchanged.', subU],
    ['circled', 'Circled', 'enclosed', 'Enclosed Alphanumerics', circled],
    ['negcircled', 'Filled circles', 'enclosed', 'Negative circled capitals. May render as emoji on some devices.', negcircled],
    ['squared', 'Squared', 'enclosed', 'Squared capitals. May render as emoji on some devices.', squared],
    ['negsquared', 'Filled squares', 'enclosed', 'Negative squared capitals. Several render as colour emoji on many devices.', negsquared],
    ['fullwidth', 'Wide', 'enclosed', 'Fullwidth forms', fullwidth],
    ['cjk', 'CJK lookalike', 'lookalike', 'Han and kana characters that resemble Latin capitals. They are not the letters they look like.', cjk],
    ['canadian', 'Syllabic lookalike', 'lookalike', 'Canadian syllabics, runic and Latin Extended characters that resemble capitals.', canadian],
    ['flip', 'Upside down', 'lookalike', 'Turned letters, with the text order reversed.', flip],
    ['strike', 'Strikethrough', 'lines', 'Adds U+0336 combining long stroke overlay to each character.', addMark('̶')],
    ['underline', 'Underline', 'lines', 'Adds U+0332 combining low line to each character.', addMark('̲')],
    ['overline', 'Overline', 'lines', 'Adds U+0305 combining overline to each character.', addMark('̅')]
  ];
  P.STYLE_CATS = [['all', 'All'], ['weight', 'Bold & italic'], ['script', 'Script & gothic'], ['small', 'Small & mono'], ['enclosed', 'Enclosed & wide'], ['lookalike', 'Lookalike'], ['lines', 'Lines']];
  P.STYLES = defs.map(function (a) {
    var fn = typeof a[4] === 'function' ? a[4] : perChar(a[4]);
    return { id: a[0], label: a[1], cat: a[2], desc: a[3], map: typeof a[4] === 'function' ? null : a[4], fn: fn, marks: a[2] === 'lines' };
  });
  var byId = {}; P.STYLES.forEach(function (s) { byId[s.id] = s; });
  P.style = function (id) { return byId[id] || null; };
  P.applyStyle = function (text, id) { var s = byId[id]; return s ? s.fn(text) : text; };

  /* reverse mapping: styled character -> plain ASCII, so a styled name can be re-styled without starting over */
  var rev = {};
  P.STYLES.forEach(function (s) {
    if (!s.map || s.id === 'flip') return;
    Object.keys(s.map).forEach(function (k) { var v = s.map[k]; if (v !== k && !rev[v]) rev[v] = (s.id === 'circled' || s.id === 'negcircled' || s.id === 'squared' || s.id === 'negsquared' || s.id === 'cjk' || s.id === 'canadian' || s.id === 'smallcaps') ? k : k; });
  });
  /* styles that fold upper+lower into one glyph: prefer the uppercase source */
  ['cjk', 'canadian', 'negcircled', 'squared', 'negsquared', 'smallcaps'].forEach(function (id) {
    var s = byId[id]; Object.keys(s.map).forEach(function (k) { if (/[A-Z]/.test(k)) rev[s.map[k]] = k; });
  });
  P.unstyle = function (text) {
    return Array.from(String(text).replace(/[̶̲̅]/g, '')).map(function (c) {
      if (c.charCodeAt(0) < 128) return c;
      if (rev[c] != null) return rev[c];
      var n = c.normalize('NFKC'); return /^[A-Za-z0-9]$/.test(n) ? n : c;
    }).join('');
  };
  P.styleOf = function (text) {       /* best guess at which style a string is in */
    var best = null, n = 0;
    P.STYLES.forEach(function (s) { if (!s.map) return; var c = 0; Array.from(text).forEach(function (ch) { if (ch.charCodeAt(0) > 127 && Object.keys(s.map).some(function (k) { return s.map[k] === ch; })) c++; }); if (c > n) { n = c; best = s.id; } });
    return best;
  };

  /* case */
  P.CASES = [['', 'As typed'], ['upper', 'UPPER'], ['lower', 'lower'], ['title', 'Title'], ['alt', 'aLtErNaTe']];
  P.applyCase = function (t, c) {
    if (c === 'upper') return t.toUpperCase();
    if (c === 'lower') return t.toLowerCase();
    if (c === 'title') return t.toLowerCase().replace(/(^|\s)(\S)/g, function (m, a, b) { return a + b.toUpperCase(); });
    if (c === 'alt') { var i = 0; return Array.from(t).map(function (ch) { if (!/\p{L}/u.test(ch)) return ch; return (i++ % 2) ? ch.toUpperCase() : ch.toLowerCase(); }).join(''); }
    return t;
  };

  /* decorative frames: [id, left, right, label] */
  P.FRAMES = [
    ['none', '', '', 'None'], ['classic', '亗', 'ツ', 'Classic'], ['corner', '『', '』', 'Corner brackets'], ['lenticular', '【', '】', 'Lenticular'],
    ['swoosh', '彡', '彡', 'Swoosh'], ['stars', '★', '★', 'Stars'], ['sparkle', '✦', '✦', 'Sparkle'], ['ornate', '༺', '༻', 'Ornate'],
    ['wings', '꧁', '꧂', 'Wings'], ['tsu', '', 'ツ', 'Tsu tag'], ['otsu', '', '乙', 'Otsu tag'], ['kanji', '亗', '', 'Kanji prefix'],
    ['hearts', '♡', '♡', 'Hearts'], ['flowers', '❀', '❀', 'Flowers'], ['arrows', '→', '←', 'Arrows'], ['skull', '☠', '☠', 'Skulls'],
    ['moon', '☾', '☽', 'Moon'], ['blades', '⚔', '⚔', 'Blades'], ['angle', '《', '》', 'Double angle'], ['fade', '░▒▓', '▓▒░', 'Fade'],
    ['spades', '♠', '♠', 'Spades'], ['crown', '♛', '♛', 'Crowns'], ['dots', '•', '•', 'Dots'], ['gamer', 'xX', 'Xx', 'xX…Xx'], ['wide', '〖', '〗', 'Round brackets'], ['bolt', 'ϟ', 'ϟ', 'Bolts']
  ].map(function (a) { return { id: a[0], l: a[1], r: a[2], label: a[3] }; });
  var frameById = {}; P.FRAMES.forEach(function (f) { frameById[f.id] = f; });
  P.frame = function (id) { return frameById[id] || frameById.none; };

  /* ---------- recipes ----------
     state = { segs:[{t,s}], c:'', l:'', r:'', p:'', x:'' }
     final  = l + p + (styled segments) + x + r                                                */
  P.newState = function (o) { o = o || {}; return { segs: [{ t: '', s: '' }], c: '', l: '', r: '', p: '', x: '' }; };
  P.normState = function (st) {
    var o = P.newState(); if (!st || typeof st !== 'object') return o;
    if (Array.isArray(st.segs) && st.segs.length) o.segs = st.segs.slice(0, 5).map(function (g) { return { t: String(g && g.t || '').slice(0, 60), s: g && byId[g.s] ? g.s : '' }; });
    ['c', 'l', 'r', 'p', 'x'].forEach(function (k) { if (typeof st[k] === 'string') o[k] = st[k].slice(0, 40); });
    if (!['', 'upper', 'lower', 'title', 'alt'].includes(o.c)) o.c = '';
    return o;
  };
  P.compose = function (st) {
    st = P.normState(st);
    return st.l + st.p + st.segs.map(function (g) { return P.applyStyle(P.applyCase(g.t, st.c), g.s); }).join('') + st.x + st.r;
  };
  /* recipe from a collection entry: [base, styleId, frameId]; a base starting with "=" is taken literally */
  P.recipe = function (base, style, frame) {
    var f = P.frame(frame || 'none'), lit = base.charAt(0) === '=';
    return { segs: [{ t: lit ? base.slice(1) : base, s: lit ? '' : (style || '') }], c: '', l: f.l, r: f.r, p: '', x: '' };
  };
  P.stateFromText = function (t) { var s = P.newState(); s.segs[0].t = t; return s; };

  /* studio links: simple recipes use readable params, anything else is packed as JSON */
  P.studioURL = function (src) {
    var st = typeof src === 'string' ? P.stateFromText(src) : P.normState(src), q = new URLSearchParams();
    var simple = st.segs.length === 1 && !st.c && !st.p && !st.x;
    if (simple) { q.set('n', st.segs[0].t); if (st.segs[0].s) q.set('s', st.segs[0].s); if (st.l) q.set('l', st.l); if (st.r) q.set('r', st.r); }
    else q.set('j', JSON.stringify(st));
    return 'studio.html?' + q.toString();
  };
  P.stateFromParams = function (params) {
    try {
      if (params.get('j')) return P.normState(JSON.parse(params.get('j')));
      if (params.get('t')) return P.stateFromText(params.get('t').slice(0, 80));
      if (params.get('n') != null) {
        var st = P.newState(); st.segs[0].t = params.get('n').slice(0, 60); st.segs[0].s = byId[params.get('s')] ? params.get('s') : '';
        st.l = (params.get('l') || '').slice(0, 40); st.r = (params.get('r') || '').slice(0, 40); return st;
      }
    } catch (e) { }
    return null;
  };
})(window.PNL);
