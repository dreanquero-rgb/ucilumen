// Svuota il carrello dopo un pagamento andato a buon fine.
(function () {
  try { localStorage.removeItem('ucilumen_cart_v1'); } catch (e) {}
  if (window.UcisCart) window.UcisCart.updateBadge();
})();
