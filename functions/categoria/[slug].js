import { renderPage, htmlResponse, esc } from '../../lib/layout.js';
import { productGrid, breadcrumb } from '../../lib/components.js';
import { getProductsByCategory } from '../../lib/db.js';
import { categoryBySlug } from '../../lib/catalog.js';

// Banner di categoria: foto reali (da caricare in public/img/).
const BANNERS = { personalized_gift: '/img/cat-personalizzata.jpg', mood_lighting: '/img/cat-mood.jpg' };

export async function onRequestGet(context) {
  const { env, request, params } = context;
  const cat = categoryBySlug(params.slug);
  if (!cat) {
    const nf = '<div class="container"><div class="prose"><h1>Categoria non trovata</h1><p><a class="btn btn-primary" href="/">Torna alla home</a></p></div></div>';
    return htmlResponse(renderPage({ env, request, title: 'Categoria non trovata', body: nf }), 404);
  }
  let products = [];
  try { products = await getProductsByCategory(env.DB, cat.code); } catch (e) { products = []; }

  const banner = BANNERS[cat.code] || '/img/og-default.svg';
  const heroStyle = 'background:linear-gradient(rgba(20,12,6,.5),rgba(20,12,6,.6)),url(' + banner + ') center/cover;color:#fff;border-bottom:0';

  const body = ''
    + breadcrumb([{ label: 'Home', href: '/' }, { label: cat.name }])
    + '<section class="page-hero" style="' + heroStyle + '"><div class="container"><h1 style="color:#fff">' + esc(cat.name) + '</h1><p style="color:rgba(255,250,244,.9)">' + esc(cat.tagline) + '</p></div></section>'
    + '<section class="section"><div class="container">' + productGrid(products) + '</div></section>';

  const jsonLd = { '@context': 'https://schema.org', '@type': 'CollectionPage', name: cat.name, description: cat.tagline };

  return htmlResponse(renderPage({
    env, request,
    title: cat.name,
    description: cat.tagline,
    canonicalPath: '/categoria/' + cat.slug,
    body,
    jsonLd,
  }));
}
