/* My names: saved list with in-game test buttons, export/import. */
(function (P) {
  'use strict';
  var h = P.h, $ = P.$, ui = P.ui;
  function testRow(text) {
    var lv = P.compat.levelFor(text);
    var row = h('div', { class: 'testrow' }, h('span', null, 'Tried it in-game?'));
    [['ok', 'Accepted'], ['no', 'Rejected']].forEach(function (b) {
      row.append(h('button', { class: 'btn sm', type: 'button', onclick: function () { P.compat.addTest({ text: text, res: b[0] }); P.toast('Logged: ' + b[1]); paint(); } }, b[1]));
    });
    if (lv.indexOf('yours') === 0) row.append(ui.badge(lv));
    return row;
  }
  function paint() {
    var list = P.favs.all(), box = $('#mNames'); box.replaceChildren();
    $('#mCount').textContent = list.length + ' saved'; $('#mEmpty').hidden = list.length > 0;
    list.forEach(function (f) {
      var c = ui.nameCard({ text: f.t, state: f.r, onFav: function (on) { if (!on) paint(); } });
      c.insertBefore(testRow(f.t), $('.nfoot', c)); box.append(c);
    });
  }
  P.compat.on(function () { });
  $('#mExport').addEventListener('click', function () {
    var data = JSON.stringify({ format: 'pnl-names', version: 1, exported: new Date().toISOString(), names: P.favs.all() }, null, 1);
    var a = h('a', { href: URL.createObjectURL(new Blob([data], { type: 'application/json' })), download: 'pubg-name-lab-names.json' }); document.body.append(a); a.click(); a.remove();
  });
  $('#mImport').addEventListener('change', function () {
    var f = this.files[0]; if (!f) return; var r = new FileReader();
    r.onload = function () {
      try {
        var o = JSON.parse(r.result); if (!o || o.format !== 'pnl-names' || !Array.isArray(o.names)) throw 0;
        var n = 0; o.names.forEach(function (x) { if (x && typeof x.t === 'string' && x.t.length < 200 && P.favs.add(x.t.slice(0, 200), x.r ? P.normState(x.r) : undefined)) n++; });
        P.toast('Imported ' + n + ' new name' + (n === 1 ? '' : 's')); paint();
      } catch (e) { P.toast('That is not a PUBG Name Lab names file'); }
    };
    r.readAsText(f); this.value = '';
  });
  $('#mClear').addEventListener('click', function () { if (P.favs.all().length && confirm('Remove all saved names from this browser?')) { P.favs.replaceAll([]); paint(); } });
  P.favs.on(function () { });
  paint();
})(window.PNL);
