// Logica della pagina prodotto: prezzo dinamico per variante, anteprima neon
// live, validazione del testo personalizzato e aggiunta al carrello.
(function () {
  var dataEl = document.getElementById('product-data');
  if (!dataEl) return;
  var product;
  try { product = JSON.parse(dataEl.textContent); } catch (e) { return; }
  var KEY = (window.UcisCart && window.UcisCart.KEY) || 'ucilumen_cart_v1';

  var variantInputs = document.querySelectorAll('input[name="variant"]');
  var priceEl = document.querySelector('[data-price]');
  var persInput = document.getElementById('personalization');
  var neonText = document.getElementById('neon-text');
  var counter = document.querySelector('[data-char-counter]');
  var addBtn = document.querySelector('[data-add-cart]');
  var msg = document.querySelector('[data-add-msg]');

  function byId(id) {
    for (var i = 0; i < product.variants.length; i++) if (product.variants[i].id === id) return product.variants[i];
    return product.variants[0];
  }
  function selectedVariant() {
    var id = null;
    for (var i = 0; i < variantInputs.length; i++) if (variantInputs[i].checked) id = parseInt(variantInputs[i].value, 10);
    if (!id && product.variants.length) id = product.variants[0].id;
    return byId(id);
  }
  function fmt(cents) {
    var e = Math.floor(cents / 100);
    var d = String(cents % 100);
    if (d.length < 2) d = '0' + d;
    return '€' + e.toLocaleString('it-IT') + ',' + d;
  }
  function updateCounter() {
    if (!counter || !persInput) return;
    var v = selectedVariant();
    counter.textContent = persInput.value.length + ' / ' + (v.maxLetters || '-') + ' caratteri';
  }
  function updatePreview() {
    if (!neonText) return;
    var t = (persInput && persInput.value.trim()) ? persInput.value.trim() : 'Nome';
    neonText.textContent = t;
  }
  function refresh() {
    var v = selectedVariant();
    if (priceEl) priceEl.textContent = fmt(v.priceCents);
    if (persInput && v.maxLetters) {
      persInput.setAttribute('maxlength', v.maxLetters);
      if (persInput.value.length > v.maxLetters) persInput.value = persInput.value.slice(0, v.maxLetters);
    }
    updateCounter();
    updatePreview();
  }
  for (var i = 0; i < variantInputs.length; i++) variantInputs[i].addEventListener('change', refresh);
  if (persInput) persInput.addEventListener('input', function () { updateCounter(); updatePreview(); });

  if (addBtn) addBtn.addEventListener('click', function () {
    var v = selectedVariant();
    var pers = persInput ? persInput.value.trim() : '';
    if (product.requiresPers && !pers) {
      if (msg) { msg.textContent = 'Inserisci il testo da personalizzare prima di aggiungere al carrello.'; msg.className = 'add-msg error'; }
      if (persInput) persInput.focus();
      return;
    }
    var cart;
    try { cart = JSON.parse(localStorage.getItem(KEY)) || []; } catch (e) { cart = []; }
    var itemKey = v.id + '|' + pers;
    var found = null;
    for (var j = 0; j < cart.length; j++) if (cart[j].key === itemKey) found = cart[j];
    if (found) { found.qty += 1; }
    else cart.push({ key: itemKey, variantId: v.id, productSlug: product.slug, productName: product.name, variantLabel: v.label, unitPriceCents: v.priceCents, qty: 1, personalization: pers, image: product.image, requiresPers: product.requiresPers });
    localStorage.setItem(KEY, JSON.stringify(cart));
    if (window.UcisCart) window.UcisCart.updateBadge();
    if (msg) { msg.innerHTML = 'Aggiunto al carrello. <a href="/carrello">Vai al carrello →</a>'; msg.className = 'add-msg ok'; }
  });

  refresh();
})();
