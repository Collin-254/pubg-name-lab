/* Guide: reference table encodings and the rename checklist. */
(function (P) {
  'use strict';
  var $ = P.$;
  P.$$('#refBody tr').forEach(function (tr) {
    var ch = tr.dataset.ch; tr.querySelector('.u16').textContent = ch.length; tr.querySelector('.u8').textContent = P.utf8(ch);
  });
  var boxes = P.$$('#checklist input'), saved = P.store.get('pnl-check', []) || [];
  boxes.forEach(function (b, i) { b.checked = !!saved[i]; });
  function upd() {
    var n = boxes.filter(function (b) { return b.checked; }).length;
    $('#checkCount').textContent = n + ' of ' + boxes.length + ' confirmed'; $('#checkBar').style.width = (n / boxes.length * 100) + '%';
    P.store.set('pnl-check', boxes.map(function (b) { return b.checked; }));
  }
  boxes.forEach(function (b) { b.addEventListener('change', upd); }); upd();
})(window.PNL);
