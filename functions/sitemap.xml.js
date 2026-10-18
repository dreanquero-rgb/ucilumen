import { getActiveProductsForSitemap } from '../lib/db.js';
import { CATEGORIES } from '../lib/catalog.js';

export async function onRequestGet(context) {
  const { env, request } = context;
  let base = (env && env.SITE_URL) ? env.SITE_URL : new URL(request.url).origin;
  if (base.endsWith('/')) base = base.slice(0, -1);

  const paths = ['/', '/come-funziona', '/spedizioni-e-resi', '/contatti', '/privacy', '/cookie-policy', '/termini', '/recesso'];
  for (const c of Object.values(CATEGORIES)) paths.push('/categoria/' + c.slug);
  let products = [];
  try { products = await getActiveProductsForSitemap(env.DB); } catch (e) { products = []; }
  for (const p of products) paths.push('/prodotto/' + p.slug);

  const urls = paths.map((p) => '  <url><loc>' + base + p + '</loc></url>').join('\n');
  const xml = '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n' + urls + '\n</urlset>\n';
  return new Response(xml, { headers: { 'content-type': 'application/xml; charset=utf-8' } });
}
