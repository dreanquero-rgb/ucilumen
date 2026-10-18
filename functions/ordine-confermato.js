import { renderPage, htmlResponse } from '../lib/layout.js';

export async function onRequestGet(context) {
  const { env, request } = context;
  const body = ''
    + '<section class="page-hero"><div class="container"><h1>Grazie per il tuo ordine! 🎉</h1></div></section>'
    + '<section class="section"><div class="container prose">'
    + '<p>Abbiamo ricevuto il tuo ordine e il pagamento è andato a buon fine. Riceverai a breve una email di conferma.</p>'
    + '<p>Per i prodotti <strong>personalizzati</strong> ti invieremo un’anteprima grafica da approvare prima della produzione.</p>'
    + '<p><a class="btn btn-primary" href="/">Torna allo shop</a></p>'
    + '</div></section>';
  const extraScripts = '<script src="/js/order-confirmed.js" defer></script>';
  return htmlResponse(renderPage({
    env, request,
    title: 'Ordine confermato',
    canonicalPath: '/ordine-confermato',
    body,
    extraScripts,
  }));
}
