import { renderPage, htmlResponse, esc } from '../lib/layout.js';
import { productGrid, trustStrip } from '../lib/components.js';
import { getFeaturedProducts } from '../lib/db.js';
import { CATEGORIES } from '../lib/catalog.js';

export async function onRequestGet(context) {
  const { env, request } = context;
  let products = [];
  try { products = await getFeaturedProducts(env.DB, 8); } catch (e) { products = []; }

  const occasions = ['Nascita', 'Battesimo', 'Compleanno', 'Anniversario', 'San Valentino', 'Casa nuova'];
  const occasionChips = occasions
    .map((o) => '<a class="chip" href="/categoria/' + CATEGORIES.personalized_gift.slug + '">' + esc(o) + '</a>')
    .join('');

  // Grafiche brand (SVG) per hero e card categoria. Le FOTO PRODOTTO arrivano
  // dagli URL del fornitore impostati su ogni prodotto (image_url).
  const catImages = { personalized_gift: '/img/neon-personalizzata.svg', mood_lighting: '/img/luna-3d.svg' };
  const catCards = Object.values(CATEGORIES).map((c) =>
    '<a class="cat-card" href="/categoria/' + c.slug + '">'
    + '<img src="' + catImages[c.code] + '" alt="" loading="lazy">'
    + '<div class="cat-card-body"><h3>' + esc(c.name) + '</h3><p>' + esc(c.tagline) + '</p><span class="btn btn-secondary">Esplora</span></div>'
    + '</a>'
  ).join('');

  const body = ''
    + '<section class="hero"><div class="container hero-inner">'
    + '<div class="hero-copy">'
    + '<p class="hero-eyebrow">Illuminazione decorativa</p>'
    + '<h1>Luce che racconta chi sei</h1>'
    + '<p class="lead">Lampade al neon personalizzate con il nome o la dedica che scegli tu, e luci di atmosfera per rendere unica ogni stanza. Il regalo luminoso che non passa inosservato.</p>'
    + '<div class="hero-cta"><a class="btn btn-primary" href="/categoria/' + CATEGORIES.personalized_gift.slug + '">Crea la tua luce personalizzata</a>'
    + '<a class="btn btn-ghost" href="/categoria/' + CATEGORIES.mood_lighting.slug + '">Scopri il mood lighting</a></div>'
    + '</div>'
    + '<div class="hero-art"><img src="/img/neon-personalizzata.svg" alt="Insegna al neon personalizzata con un nome" width="560" height="420"></div>'
    + '</div></section>'
    + trustStrip()
    + '<section class="section"><div class="container">'
    + '<div class="section-head"><h2>I preferiti del momento</h2><p>Una selezione dal nostro catalogo di luci decorative.</p></div>'
    + productGrid(products)
    + '</div></section>'
    + '<section class="section" style="padding-top:0"><div class="container">'
    + '<div class="section-head"><h2>Idee regalo per ogni occasione</h2><p>La lampada personalizzata giusta per ogni momento da ricordare.</p></div>'
    + '<div class="occasions">' + occasionChips + '</div>'
    + '</div></section>'
    + '<section class="section" style="background:var(--surface-2)"><div class="container">'
    + '<div class="section-head"><h2>Come funziona</h2><p>Dalla scelta alla consegna, ti accompagniamo passo passo.</p></div>'
    + '<div class="steps">'
    + '<div class="step"><span class="step-num">1</span><h3>Scegli e personalizza</h3><p>Seleziona il prodotto, la misura e scrivi il nome o la dedica. Vedi subito l’anteprima.</p></div>'
    + '<div class="step"><span class="step-num">2</span><h3>Approvi il bozzetto</h3><p>Per i prodotti personalizzati ti inviamo un’anteprima grafica da confermare prima della produzione.</p></div>'
    + '<div class="step"><span class="step-num">3</span><h3>Ricevi a casa</h3><p>Realizziamo e spediamo con tracciamento. Ti teniamo aggiornato via email.</p></div>'
    + '</div></div></section>'
    + '<section class="section"><div class="container">'
    + '<div class="section-head"><h2>Esplora il catalogo</h2></div>'
    + '<div class="cat-cards">' + catCards + '</div>'
    + '</div></section>'
    + '<section class="section reviews"><div class="container">'
    + '<div class="section-head"><h2>Recensioni</h2>'
    + '<p class="review-note">UcisLumen è appena nato: le recensioni verificate dei clienti appariranno qui dopo i primi ordini. Nessuna recensione inventata, promesso.</p></div>'
    + '</div></section>';

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Store',
    name: 'UcisLumen',
    description: 'Illuminazione decorativa e lampade personalizzate per la casa.',
    url: (env && env.SITE_URL) || 'https://ucilumen.pages.dev',
  };

  return htmlResponse(renderPage({ env, request, title: '', canonicalPath: '/', body, jsonLd }));
}
