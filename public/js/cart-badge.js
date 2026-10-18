// Aggiorna il contatore del carrello (presente in ogni pagina) e gestisce il
// menu mobile. Espone window.UcisCart per gli altri script.
(function () {
  var KEY = 'ucilumen_cart_v1';
  function readCart() {
    try { return JSON.parse(localStorage.getItem(KEY)) || []; } catch (e) { return []; }
  }
  function updateBadge() {
    var cart = readCart();
    var count = 0;
    for (var i = 0; i < cart.length; i++) count += parseInt(cart[i].qty, 10) || 0;
    var els = document.querySelectorAll('[data-cart-count]');
    for (var j = 0; j < els.length; j++) {
      els[j].textContent = String(count);
      if (count > 0) els[j].removeAttribute('hidden'); else els[j].setAttribute('hidden', '');
    }
  }
  function wireNav() {
    var btn = document.querySelector('[data-nav-toggle]');
    var nav = document.querySelector('.site-nav');
    if (!btn || !nav) return;
    btn.addEventListener('click', function () {
      var open = nav.classList.toggle('open');
      btn.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
  }
  window.UcisCart = { KEY: KEY, read: readCart, updateBadge: updateBadge };
  document.addEventListener('DOMContentLoaded', function () { updateBadge(); wireNav(); });
})();
