import { esc, formatPrice } from './layout.js';
import { categoryByCode } from './catalog.js';

// Card prodotto per le griglie (home e categoria).
export function productCard(product) {
  const cat = categoryByCode(product.category);
  const badge = product.requires_manual_personalization
    ? '<span class="card-badge">Personalizzabile</span>'
    : '';
  return '<a class="product-card" href="/prodotto/' + esc(product.slug) + '">'
    + '<div class="product-card-media">'
    + '<img src="' + esc(product.image_url || '/img/og-default.svg') + '" alt="' + esc(product.name) + '" loading="lazy" width="400" height="300">'
    + badge
    + '</div>'
    + '<div class="product-card-body">'
    + '<span class="card-cat">' + esc(cat ? cat.name : '') + '</span>'
    + '<h3>' + esc(product.name) + '</h3>'
    + '<p class="price">da ' + formatPrice(product.base_price_cents) + '</p>'
    + '</div>'
    + '</a>';
}

export function productGrid(products) {
  if (!products || !products.length) {
    return '<p class="empty">Nessun prodotto disponibile al momento.</p>';
  }
  return '<div class="product-grid">' + products.map(productCard).join('') + '</div>';
}

// Striscia con i punti di fiducia (ricorre dalla ricerca: metterli vicino alla
// decisione d'acquisto).
export function trustStrip() {
  const items = [
    ['✍️', 'Anteprima prima della produzione', 'Per i prodotti personalizzati approvi il bozzetto prima che venga realizzato.'],
    ['📦', 'Spedizione tracciata', 'Ricevi il codice di tracciamento appena il tuo ordine parte.'],
    ['🔒', 'Pagamenti sicuri', 'Checkout gestito da Stripe: i dati della carta non passano dal nostro sito.'],
    ['💬', 'Assistenza in italiano', 'Ti seguiamo via email in ogni fase dell’ordine.'],
  ];
  return '<section class="trust-strip"><div class="container trust-grid">'
    + items.map((it) => '<div class="trust-item"><span class="trust-ico" aria-hidden="true">' + it[0] + '</span><div><strong>' + esc(it[1]) + '</strong><p>' + esc(it[2]) + '</p></div></div>').join('')
    + '</div></section>';
}

export function breadcrumb(items) {
  const parts = items.map((it, i) => {
    if (it.href && i < items.length - 1) return '<a href="' + esc(it.href) + '">' + esc(it.label) + '</a>';
    return '<span aria-current="page">' + esc(it.label) + '</span>';
  });
  return '<nav class="breadcrumb" aria-label="Percorso"><div class="container">' + parts.join('<span class="sep">/</span>') + '</div></nav>';
}
