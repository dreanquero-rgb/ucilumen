import { renderPage, htmlResponse, esc, formatPrice } from '../../lib/layout.js';
import { breadcrumb } from '../../lib/components.js';
import { getProductBySlug } from '../../lib/db.js';
import { categoryByCode } from '../../lib/catalog.js';

export async function onRequestGet(context) {
  const { env, request, params } = context;
  let product = null;
  try { product = await getProductBySlug(env.DB, params.slug); } catch (e) { product = null; }
  if (!product) return notFound(env, request);

  const cat = categoryByCode(product.category);
  const variants = product.variants || [];
  const requiresPers = !!product.requires_manual_personalization;
  const prices = variants.length ? variants.map((v) => v.price_cents) : [product.base_price_cents];
  const minPrice = Math.min.apply(null, prices);
  const showVariants = variants.length > 1;

  const variantList = variants.map((v, i) =>
    '<label class="variant"><span class="variant-label"><input type="radio" name="variant" value="' + v.id + '"' + (i === 0 ? ' checked' : '') + '> ' + esc(v.variant_label) + '</span><span class="variant-price">' + formatPrice(v.price_cents) + '</span></label>'
  ).join('');

  const firstMax = (variants.length && variants[0].max_letters) ? variants[0].max_letters : null;
  const persBlock = requiresPers
    ? ('<div class="field-group">'
      + '<label class="field-label" for="personalization">Testo da personalizzare</label>'
      + '<input type="text" id="personalization" placeholder="Es. Sofia"' + (firstMax ? ' maxlength="' + firstMax + '"' : '') + '>'
      + '<div class="char-counter" data-char-counter>0 / ' + (firstMax || '-') + ' caratteri</div>'
      + '<div class="neon-preview"><span class="neon-text" id="neon-text">Nome</span></div>'
      + '</div>')
    : '';

  const shipping = (product.shipping_days_min && product.shipping_days_max)
    ? ('Spedizione in ' + product.shipping_days_min + '-' + product.shipping_days_max + ' giorni lavorativi (tracciata)')
    : 'Spedizione tracciata';
  const trustPoints = [
    requiresPers ? 'Anteprima grafica da approvare prima della produzione' : 'Prodotto pronto per la spedizione',
    requiresPers ? 'Foto del prodotto finito prima della spedizione' : 'Imballo protetto',
    shipping,
    'Pagamento sicuro con Stripe',
  ];
  const trustList = '<ul class="trust-points">' + trustPoints.map((p) => '<li>' + esc(p) + '</li>').join('') + '</ul>';

  const productData = {
    slug: product.slug,
    name: product.name,
    image: product.image_url || '/img/og-default.svg',
    requiresPers: requiresPers,
    variants: variants.map((v) => ({ id: v.id, label: v.variant_label, priceCents: v.price_cents, maxLetters: v.max_letters || null })),
  };

  const recessoNotice = requiresPers
    ? '<div class="notice">I prodotti personalizzati sono realizzati su misura: per questo motivo non è previsto il diritto di recesso (art. 59 Codice del Consumo). Controlla bene il testo prima di ordinare.</div>'
    : '';

  const body = ''
    + breadcrumb([
      { label: 'Home', href: '/' },
      { label: cat ? cat.name : 'Catalogo', href: cat ? ('/categoria/' + cat.slug) : '/' },
      { label: product.name },
    ])
    + '<div class="container"><div class="product-detail">'
    + '<div class="product-media"><img src="' + esc(product.image_url || '/img/og-default.svg') + '" alt="' + esc(product.name) + '" width="600" height="600">' + (requiresPers ? '<span class="card-badge">Personalizzabile</span>' : '') + '</div>'
    + '<div class="product-info">'
    + '<span class="cat-label">' + esc(cat ? cat.name : '') + '</span>'
    + '<h1>' + esc(product.name) + '</h1>'
    + '<p class="product-price"><span data-price>' + formatPrice(minPrice) + '</span></p>'
    + '<p class="product-lead">' + esc(firstSentence(product.description)) + '</p>'
    + (showVariants
        ? ('<div class="field-group"><span class="field-label">Scegli la misura</span><div class="variant-list">' + variantList + '</div></div>')
        : ('<div class="variant-list" hidden>' + variantList + '</div>'))
    + persBlock
    + '<div class="addcart-row"><button class="btn btn-primary" data-add-cart>Aggiungi al carrello</button></div>'
    + '<p class="add-msg" data-add-msg></p>'
    + trustList
    + recessoNotice
    + '</div>'
    + '</div>'
    + '<div class="product-long"><h2>Descrizione</h2><p>' + esc(product.description) + '</p>'
    + '<div class="notice">Per spedizioni da fuori Unione Europea possono essere applicati dazi o IVA doganali a carico del destinatario. I tempi indicati sono stime e non vincolanti.</div>'
    + '</div></div>';

  let base = (env && env.SITE_URL) ? env.SITE_URL : '';
  if (base.endsWith('/')) base = base.slice(0, -1);
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    description: product.description,
    image: [base + (product.image_url || '/img/og-default.svg')],
    offers: {
      '@type': 'Offer',
      priceCurrency: 'EUR',
      price: (minPrice / 100).toFixed(2),
      availability: 'https://schema.org/InStock',
    },
  };

  const extraScripts = '<script type="application/json" id="product-data">' + JSON.stringify(productData) + '</script><script src="/js/product.js" defer></script>';

  return htmlResponse(renderPage({
    env, request,
    title: product.name,
    description: firstSentence(product.description),
    canonicalPath: '/prodotto/' + product.slug,
    ogImagePath: product.image_url || '/img/og-default.svg',
    body,
    jsonLd,
    extraScripts,
  }));
}

function firstSentence(text) {
  if (!text) return '';
  const idx = text.indexOf('. ');
  const s = (idx > 40) ? text.slice(0, idx + 1) : text;
  return s.length > 180 ? (s.slice(0, 177) + '...') : s;
}

function notFound(env, request) {
  const body = '<div class="container"><div class="prose"><h1>Prodotto non trovato</h1><p>Il prodotto che cerchi non esiste o non è più disponibile.</p><p><a class="btn btn-primary" href="/">Torna alla home</a></p></div></div>';
  return htmlResponse(renderPage({ env, request, title: 'Prodotto non trovato', canonicalPath: '/', body }), 404);
}
