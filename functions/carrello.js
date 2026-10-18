import { renderPage, htmlResponse } from '../lib/layout.js';

export async function onRequestGet(context) {
  const { env, request } = context;
  const body = ''
    + '<section class="page-hero"><div class="container"><h1>Il tuo carrello</h1></div></section>'
    + '<section class="cart"><div class="container"><div data-cart-root><p class="empty">Caricamento del carrello…</p></div></div></section>';
  const extraScripts = '<script src="/js/cart.js" defer></script>';
  return htmlResponse(renderPage({
    env, request,
    title: 'Carrello',
    description: 'Rivedi gli articoli nel carrello e procedi al pagamento sicuro con Stripe.',
    canonicalPath: '/carrello',
    body,
    extraScripts,
  }));
}
