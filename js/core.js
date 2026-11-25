/* PUBG Name Lab — core helpers shared by every page.
   Plain classic script (no build step). Everything lives on window.PNL. */
window.PNL = window.PNL || {};
(function (P) {
  'use strict';
  var d = typeof document !== 'undefined' ? document : null;

  /* ---------- DOM helpers ---------- */
  P.$ = function (s, r) { return (r || d).querySelector(s); };
  P.$$ = function (s, r) { return Array.prototype.slice.call((r || d).querySelectorAll(s)); };
  /* h('button', {class:'btn', onclick:fn, 'aria-label':'x'}, 'text' | node | [nodes]) */
  P.h = function (tag, props) {
    var e = d.createElement(tag);
    if (props) Object.keys(props).forEach(function (k) {
      var v = props[k];
      if (v == null || v === false) return;
      if (k === 'class') e.className = v;
      else if (k === 'text') e.textContent = v;
      else if (k.slice(0, 2) === 'on' && typeof v === 'function') e.addEventListener(k.slice(2), v);
      else if (k === 'dataset') Object.keys(v).forEach(function (dk) { e.dataset[dk] = v[dk]; });
      else if (v === true) e.setAttribute(k, '');
      else e.setAttribute(k, v);
    });
    for (var i = 2; i < arguments.length; i++) append(e, arguments[i]);
    return e;
  };
  function append(e, kid) {
    if (kid == null || kid === false) return;
    if (Array.isArray(kid)) kid.forEach(function (k) { append(e, k); });
    else e.append(kid.nodeType ? kid : d.createTextNode(String(kid)));
  }
  P.el = function (tag, cls, text) { var e = d.createElement(tag); if (cls) e.className = cls; if (text != null) e.textContent = text; return e; };
  P.debounce = function (fn, ms) { var t; return function () { var a = arguments, c = this; clearTimeout(t); t = setTimeout(function () { fn.apply(c, a); }, ms); }; };

  /* ---------- storage (always wrapped: it can throw or come back empty) ---------- */
  P.store = {
    get: function (k, dflt) { try { var v = localStorage.getItem(k); return v == null ? dflt : JSON.parse(v); } catch (e) { return dflt; } },
    set: function (k, v) { try { localStorage.setItem(k, JSON.stringify(v)); return true; } catch (e) { return false; } }
  };

  /* ---------- text helpers ---------- */
  var seg = typeof Intl !== 'undefined' && Intl.Segmenter ? new Intl.Segmenter(undefined, { granularity: 'grapheme' }) : null;
  P.graphemes = function (s) { return seg ? Array.from(seg.segment(s), function (x) { return x.segment; }) : Array.from(s); };
  P.hx = function (n) { return n.toString(16).toUpperCase().padStart(4, '0'); };
  P.cpOf = function (ch) { return Array.from(ch).map(function (c) { return 'U+' + P.hx(c.codePointAt(0)); }).join(' '); };
  P.utf8 = function (s) { return new TextEncoder().encode(s).length; };
  /* every way a name can be counted. Which one the game uses is not published: a report of a name with 11 visible characters but 16 UTF-8 bytes being called too long for a 14-character limit points at bytes. */
  P.measure = function (t) { var g = P.graphemes(t).length, cp = Array.from(t).length, u16 = t.length, u8 = P.utf8(t); return { g: g, cp: cp, u16: u16, u8: u8, strict: Math.max(g, cp, u16, u8) }; };
  P.R = function (a, b) { var o = ''; for (var i = a; i <= b; i++) o += String.fromCodePoint(i); return o; };

  /* ---------- feedback ---------- */
  var toastEl, toastT;
  P.toast = function (msg) {
    if (!toastEl) { toastEl = d.getElementById('toast'); if (!toastEl) { toastEl = P.h('div', { class: 'toast', id: 'toast', role: 'status', 'aria-live': 'polite' }); d.body.append(toastEl); } }
    toastEl.textContent = msg; toastEl.classList.add('show');
    clearTimeout(toastT); toastT = setTimeout(function () { toastEl.classList.remove('show'); }, 2200);
  };
  P.copy = function (text, okMsg) {
    if (!text) { P.toast('Nothing to copy yet'); return Promise.resolve(false); }
    function fallback() {
      try {
        var t = d.createElement('textarea'); t.value = text; t.setAttribute('readonly', ''); t.style.cssText = 'position:fixed;opacity:0;top:0';
        d.body.appendChild(t); t.select(); var ok = d.execCommand('copy'); t.remove();
        P.toast(ok ? (okMsg || 'Copied') : 'Copy blocked by the browser. Select and copy manually.'); return ok;
      } catch (_) { P.toast('Copy blocked by the browser. Select and copy manually.'); return false; }
    }
    if (navigator.clipboard && navigator.clipboard.writeText) {
      return navigator.clipboard.writeText(text).then(function () { P.toast(okMsg || 'Copied'); return true; }, function () { return fallback(); });
    }
    return Promise.resolve(fallback());
  };
  /* A button that briefly confirms itself after copying */
  P.flash = function (btn, label) {
    if (!btn) return; var o = btn.dataset.label || btn.textContent; btn.dataset.label = o;
    btn.textContent = label || 'Copied ✓'; clearTimeout(btn._ft); btn._ft = setTimeout(function () { btn.textContent = o; }, 1300);
  };

  /* ---------- theme ---------- */
  P.setTheme = function (t) {
    document.documentElement.dataset.theme = t;
    try { localStorage.setItem('pnl-theme', t); } catch (e) { }
    var m = d.querySelector('meta[name=theme-color]'); if (m) m.content = t === 'dark' ? '#0f1210' : '#f2eee3';
  };

  /* ---------- favourites (one list used everywhere; replaces the old "saved names") ---------- */
  var FKEY = 'pnl-favs', favList = null, favSubs = [];
  function loadFavs() {
    var l = P.store.get(FKEY, null);
    if (!Array.isArray(l)) {
      l = [];
      var old = P.store.get('pnl-saved', []);          // migrate names saved by the previous version
      if (Array.isArray(old)) old.forEach(function (t) { if (typeof t === 'string' && t) l.push({ t: t, ts: Date.now() }); });
      if (l.length) P.store.set(FKEY, l);
    }
    return l.filter(function (x) { return x && typeof x.t === 'string' && x.t; });
  }
  function emitFavs() { favSubs.forEach(function (f) { try { f(favList); } catch (e) { } }); }
  P.favs = {
    all: function () { if (!favList) favList = loadFavs(); return favList; },
    has: function (t) { return P.favs.all().some(function (x) { return x.t === t; }); },
    add: function (t, recipe) {
      if (!t || P.favs.has(t)) return false;
      var it = { t: t, ts: Date.now() }; if (recipe) it.r = recipe;
      favList = [it].concat(P.favs.all()).slice(0, 200); P.store.set(FKEY, favList); emitFavs(); return true;
    },
    remove: function (t) { favList = P.favs.all().filter(function (x) { return x.t !== t; }); P.store.set(FKEY, favList); emitFavs(); },
    toggle: function (t, recipe) { if (P.favs.has(t)) { P.favs.remove(t); return false; } P.favs.add(t, recipe); return true; },
    replaceAll: function (list) { favList = list; P.store.set(FKEY, favList); emitFavs(); },
    on: function (f) { favSubs.push(f); }
  };
  if (typeof window !== 'undefined' && window.addEventListener) window.addEventListener('storage', function (e) { if (e.key === FKEY) { favList = null; emitFavs(); } });

  /* ---------- links between tools ---------- */
  P.inspectURL = function (text) { return 'inspect.html?t=' + encodeURIComponent(text); };

  /* ---------- shell (header / footer behaviour) ---------- */
  P.initShell = function () {
    var tb = P.$('#themeBtn');
    if (tb) tb.addEventListener('click', function () { P.setTheme(document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark'); });
    var fc = P.$('#favCount');
    function paint() { if (!fc) return; var n = P.favs.all().length; fc.textContent = n; fc.hidden = !n; var l = fc.closest('a'); if (l) l.setAttribute('aria-label', 'My names, ' + n + ' saved'); }
    P.favs.on(paint); paint();
    var cur = P.$('.nav a[aria-current=page]');
    if (cur && cur.scrollIntoView) { var nav = cur.parentElement; if (nav.scrollWidth > nav.clientWidth) nav.scrollLeft = Math.max(0, cur.offsetLeft - 24); }
  };
  if (d) d.addEventListener('DOMContentLoaded', function () { P.initShell(); });
})(window.PNL);
