// Pagina carrello: render da localStorage, modifica quantita', rimozione e
// avvio del pagamento (POST a /api/checkout, poi redirect a Stripe).
(function () {
  var KEY = (window.UcisCart && window.UcisCart.KEY) || 'ucilumen_cart_v1';
  var root = document.querySelector('[data-cart-root]');
  if (!root) return;

  function read() { try { return JSON.parse(localStorage.getItem(KEY)) || []; } catch (e) { return []; } }
  function write(c) { localStorage.setItem(KEY, JSON.stringify(c)); if (window.UcisCart) window.UcisCart.updateBadge(); }
  function fmt(cents) {
    var e = Math.floor(cents / 100);
    var d = String(cents % 100);
    if (d.length < 2) d = '0' + d;
    return '€' + e.toLocaleString('it-IT') + ',' + d;
  }
  function escapeHtml(s) {
    return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  }

  function render() {
    var cart = read();
    if (!cart.length) {
      root.innerHTML = '<p class="empty">Il tuo carrello è vuoto. <a href="/">Scopri il catalogo</a>.</p>';
      return;
    }
    var total = 0;
    var rows = cart.map(function (it, idx) {
      var line = it.unitPriceCents * it.qty;
      total += line;
      var pers = it.personalization ? '<span class="cart-pers">Personalizzazione: “' + escapeHtml(it.personalization) + '”</span>' : '';
      return '<div class="cart-item">'
        + '<img src="' + escapeHtml(it.image || '/img/og-default.svg') + '" alt="">'
        + '<div class="cart-item-main"><strong>' + escapeHtml(it.productName) + '</strong>'
        + '<span class="muted small">' + escapeHtml(it.variantLabel) + '</span>' + pers + '</div>'
        + '<div class="cart-qty"><button data-dec="' + idx + '" aria-label="Riduci quantita">−</button><span>' + it.qty + '</span><button data-inc="' + idx + '" aria-label="Aumenta quantita">+</button></div>'
        + '<div class="cart-line">' + fmt(line) + '</div>'
        + '<button class="cart-remove" data-rm="' + idx + '" aria-label="Rimuovi">✕</button>'
        + '</div>';
    }).join('');
    root.innerHTML = '<div class="cart-list">' + rows + '</div>'
      + '<div class="cart-summary">'
      + '<div class="cart-total"><span>Totale</span><strong>' + fmt(total) + '</strong></div>'
      + '<p class="muted small">Spedizione inclusa nel prezzo. Per spedizioni extra-UE eventuali dazi o IVA doganali sono a carico del destinatario.</p>'
      + '<button class="btn btn-primary checkout-btn" data-checkout>Procedi al pagamento</button>'
      + '<p class="add-msg" data-checkout-msg></p>'
      + '<p class="secure-note">🔒 Pagamento sicuro con Stripe</p>'
      + '</div>';
    wire();
  }

  function wire() {
    root.querySelectorAll('[data-inc]').forEach(function (b) { b.addEventListener('click', function () { var c = read(); c[+b.getAttribute('data-inc')].qty++; write(c); render(); }); });
    root.querySelectorAll('[data-dec]').forEach(function (b) { b.addEventListener('click', function () { var c = read(); var i = +b.getAttribute('data-dec'); c[i].qty--; if (c[i].qty < 1) c.splice(i, 1); write(c); render(); }); });
    root.querySelectorAll('[data-rm]').forEach(function (b) { b.addEventListener('click', function () { var c = read(); c.splice(+b.getAttribute('data-rm'), 1); write(c); render(); }); });
    var co = root.querySelector('[data-checkout]');
    if (co) co.addEventListener('click', checkout);
  }

  function checkout() {
    var cart = read();
    if (!cart.length) return;
    var msg = root.querySelector('[data-checkout-msg]');
    var btn = root.querySelector('[data-checkout]');
    btn.disabled = true;
    btn.textContent = 'Attendi…';
    if (msg) { msg.textContent = ''; msg.className = 'add-msg'; }
    fetch('/api/checkout', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ items: cart.map(function (it) { return { variantId: it.variantId, qty: it.qty, personalization: it.personalization }; }) })
    }).then(function (r) {
      return r.json().then(function (d) { return { ok: r.ok, d: d }; });
    }).then(function (res) {
      if (res.ok && res.d && res.d.url) { window.location.href = res.d.url; }
      else { throw new Error((res.d && res.d.error) || 'Errore durante il pagamento.'); }
    }).catch(function (e) {
      if (msg) { msg.textContent = e.message; msg.className = 'add-msg error'; }
      btn.disabled = false;
      btn.textContent = 'Procedi al pagamento';
    });
  }

  document.addEventListener('DOMContentLoaded', render);
})();
