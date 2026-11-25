/* Collection: curated names with search, filter, sort. */
(function (P) {
  'use strict';
  var h = P.h, $ = P.$, ui = P.ui;
  var all = P.nameList(), cats = P.NAME_CATS, catById = {}; cats.forEach(function (c) { catById[c.id] = c; });
  var q = new URLSearchParams(location.search);
  var S = { cat: catById[q.get('cat')] ? q.get('cat') : 'all', q: q.get('q') || '', f: q.get('f') || '', sort: '' }, limit = 48;
  var prof = {};
  all.forEach(function (n) { n.len = P.graphemes(n.text).length; n.u16 = n.text.length; });
  function pf(n) { return prof[n.id] || (prof[n.id] = ui.profile(n.text)); }
  function matches(n) {
    if (S.cat !== 'all' && n.cat !== S.cat) return false;
    if (S.q) { var t = S.q.toLowerCase(); if (n.text.toLowerCase().indexOf(t) < 0 && catById[n.cat].label.toLowerCase().indexOf(t) < 0 && P.UNI.analyze(n.text).nfkc.toLowerCase().indexOf(t) < 0) return false; }
    if (S.f) {
      var p = pf(n);
      if (S.f === 'short' && n.len > 6) return false;
      if (S.f === 'one' && !p.words) return false;
      if (S.f === 'plain' && !p.plain) return false;
      if (S.f === 'styled' && !p.styled) return false;
      if (S.f === 'symbols' && !p.symbols) return false;
      if (S.f === 'nonlatin' && !p.nonLatin) return false;
      if (S.f === 'saved' && !P.favs.has(n.text)) return false;
    }
    return true;
  }
  function sorted(l) {
    var c = l.slice();
    if (S.sort === 'az') c.sort(function (a, b) { return P.UNI.analyze(a.text).nfkc.localeCompare(P.UNI.analyze(b.text).nfkc); });
    else if (S.sort === 'short') c.sort(function (a, b) { return a.len - b.len || a.order - b.order; });
    else if (S.sort === 'long') c.sort(function (a, b) { return b.len - a.len || a.order - b.order; });
    else if (S.sort === 'u16') c.sort(function (a, b) { return a.u16 - b.u16 || a.order - b.order; });
    return c;
  }
  function paint() {
    var list = sorted(all.filter(matches)), box = $('#nNames'); box.replaceChildren();
    list.slice(0, limit).forEach(function (n) { box.append(ui.nameCard({ text: n.text, state: n.state, label: S.cat === 'all' ? catById[n.cat].label : '' })); });
    $('#nStatus').textContent = list.length ? 'Showing ' + Math.min(limit, list.length) + ' of ' + list.length + ' names' : '';
    if (!list.length) box.append(h('div', { class: 'emptystate', style: 'grid-column:1/-1' }, h('b', null, 'No names match'), 'Try a shorter search or reset the filters.'));
    var more = $('#nMore'); more.hidden = list.length <= limit; more.textContent = 'Show ' + Math.min(24, list.length - limit) + ' more';
    $('#nBlurb').textContent = S.cat === 'all' ? '' : catById[S.cat].blurb;
    $('#nReset').hidden = !(S.q || S.f || S.sort || S.cat !== 'all');
  }
  function counts() { var c = {}; all.forEach(function (n) { c[n.cat] = (c[n.cat] || 0) + 1; }); return c; }
  function chips() { var c = counts(); ui.chips($('#nCats'), [['all', 'All', all.length]].concat(cats.map(function (x) { return [x.id, x.label, c[x.id] || 0]; })), S.cat, function (v) { S.cat = v; limit = 48; paint(); }); }
  $('#nTotal').textContent = all.length + ' curated names';
  $('#nSearch').value = S.q; $('#nFilter').value = S.f;
  $('#nSearch').addEventListener('input', P.debounce(function () { S.q = $('#nSearch').value.trim(); limit = 48; paint(); }, 150));
  $('#nFilter').addEventListener('change', function () { S.f = this.value; limit = 48; paint(); });
  $('#nSort').addEventListener('change', function () { S.sort = this.value; paint(); });
  $('#nMore').addEventListener('click', function () { limit += 24; paint(); });
  $('#nReset').addEventListener('click', function () { S.cat = 'all'; S.q = ''; S.f = ''; S.sort = ''; $('#nSearch').value = ''; $('#nFilter').value = ''; $('#nSort').value = ''; limit = 48; chips(); paint(); });
  chips(); paint();
})(window.PNL);
