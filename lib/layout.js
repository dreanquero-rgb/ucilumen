import { CATEGORIES } from './catalog.js';

// Escape HTML di base per i valori dinamici inseriti nel markup.
export function esc(value) {
  if (value === undefined || value === null) return '';
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

// Raggruppa le migliaia con il punto (formato italiano), senza dipendere da Intl.
export function groupThousands(intStr) {
  let out = '';
  let c = 0;
  for (let i = intStr.length - 1; i >= 0; i--) {
    out = intStr[i] + out;
    c++;
    if (c % 3 === 0 && i > 0) out = '.' + out;
  }
  return out;
}

// Formatta i centesimi di euro come "€39,90".
export function formatPrice(cents) {
  const n = Math.round(Number(cents) || 0);
  const euros = Math.floor(n / 100);
  let dec = String(n % 100);
  if (dec.length < 2) dec = '0' + dec;
  return '€' + groupThousands(String(euros)) + ',' + dec;
}

// Base URL del sito (da SITE_URL, altrimenti dall'origine della richiesta).
export function siteBase(env, request) {
  let base = '';
  if (env && env.SITE_URL) base = env.SITE_URL;
  else {
    try { base = new URL(request.url).origin; } catch (e) { base = ''; }
  }
  if (base.endsWith('/')) base = base.slice(0, -1);
  return base;
}

export function htmlResponse(html, status = 200) {
  return new Response(html, {
    status,
    headers: { 'content-type': 'text/html; charset=utf-8' },
  });
}

// Rende l'intera pagina HTML con header, footer, meta SEO e JSON-LD.
export function renderPage(opts) {
  const o = opts || {};
  const base = siteBase(o.env, o.request);
  const canonicalPath = o.canonicalPath || '/';
  const canonical = base + canonicalPath;
  const fullTitle = o.title ? (o.title + ' | UcisLumen') : 'UcisLumen — illuminazione decorativa e lampade personalizzate';
  const description = o.description || 'UcisLumen: lampade al neon personalizzate con nome e luci di atmosfera per la casa. Idee regalo luminose, spedizione tracciata e anteprima prima della produzione.';
  const ogImage = base + (o.ogImagePath || '/img/og-default.svg');
  const bodyClass = o.bodyClass || '';
  const extraHead = o.extraHead || '';
  const extraScripts = o.extraScripts || '';

  const jsonLd = [].concat(o.jsonLd || []).filter(Boolean)
    .map((obj) => '<script type="application/ld+json">' + JSON.stringify(obj) + '</script>')
    .join('');

  const navLinks = Object.values(CATEGORIES)
    .map((c) => '<a href="/categoria/' + c.slug + '">' + esc(c.name) + '</a>')
    .join('');

  const footerCats = Object.values(CATEGORIES)
    .map((c) => '<a href="/categoria/' + c.slug + '">' + esc(c.name) + '</a>')
    .join('');

  const year = new Date().getFullYear();

  return '<!doctype html>\n'
    + '<html lang="it">\n'
    + '<head>\n'
    + '<meta charset="utf-8">\n'
    + '<meta name="viewport" content="width=device-width, initial-scale=1">\n'
    + '<title>' + esc(fullTitle) + '</title>\n'
    + '<meta name="description" content="' + esc(description) + '">\n'
    + '<link rel="canonical" href="' + esc(canonical) + '">\n'
    + '<meta property="og:type" content="website">\n'
    + '<meta property="og:site_name" content="UcisLumen">\n'
    + '<meta property="og:title" content="' + esc(fullTitle) + '">\n'
    + '<meta property="og:description" content="' + esc(description) + '">\n'
    + '<meta property="og:url" content="' + esc(canonical) + '">\n'
    + '<meta property="og:image" content="' + esc(ogImage) + '">\n'
    + '<meta name="twitter:card" content="summary_large_image">\n'
    + '<meta name="theme-color" content="#e8920c">\n'
    + '<link rel="icon" href="/img/logo.svg" type="image/svg+xml">\n'
    + '<link rel="stylesheet" href="/css/style.css">\n'
    + jsonLd
    + extraHead
    + '</head>\n'
    + '<body class="' + esc(bodyClass) + '">\n'
    + '<a class="skip-link" href="#main">Salta al contenuto</a>\n'
    + '<header class="site-header">\n'
    + '  <div class="container header-inner">\n'
    + '    <a class="logo" href="/"><img src="/img/logo.svg" alt="" width="30" height="30"><span>UcisLumen</span></a>\n'
    + '    <button class="nav-toggle" aria-label="Apri menu" aria-expanded="false" data-nav-toggle>☰</button>\n'
    + '    <nav class="site-nav" aria-label="Navigazione principale">\n'
    + navLinks
    + '      <a class="nav-cart" href="/carrello">Carrello <span class="cart-badge" data-cart-count hidden>0</span></a>\n'
    + '    </nav>\n'
    + '  </div>\n'
    + '</header>\n'
    + '<main id="main">\n'
    + (o.body || '')
    + '</main>\n'
    + '<footer class="site-footer">\n'
    + '  <div class="container footer-grid">\n'
    + '    <div class="footer-brand">\n'
    + '      <a class="logo" href="/"><img src="/img/logo.svg" alt="" width="28" height="28"><span>UcisLumen</span></a>\n'
    + '      <p class="muted">Illuminazione decorativa e lampade personalizzate per la casa.</p>\n'
    + '    </div>\n'
    + '    <nav aria-label="Catalogo"><h3>Catalogo</h3>' + footerCats + '</nav>\n'
    + '    <nav aria-label="Informazioni"><h3>Informazioni</h3>'
    + '<a href="/come-funziona">Come funziona</a>'
    + '<a href="/spedizioni-e-resi">Spedizioni e resi</a>'
    + '<a href="/contatti">Contatti</a></nav>\n'
    + '    <nav aria-label="Note legali"><h3>Note legali</h3>'
    + '<a href="/privacy">Privacy</a>'
    + '<a href="/cookie-policy">Cookie Policy</a>'
    + '<a href="/termini">Termini e condizioni</a>'
    + '<a href="/recesso">Diritto di recesso</a></nav>\n'
    + '  </div>\n'
    + '  <div class="container footer-bottom">\n'
    + '    <p class="muted">© ' + year + ' UcisLumen · Bozza Fase 0 — dati, testi e immagini segnaposto</p>\n'
    + '  </div>\n'
    + '</footer>\n'
    + '<script src="/js/cart-badge.js" defer></script>\n'
    + extraScripts
    + '</body>\n'
    + '</html>';
}
