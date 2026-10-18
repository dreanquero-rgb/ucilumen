export function onRequestGet(context) {
  const { env, request } = context;
  let base = (env && env.SITE_URL) ? env.SITE_URL : new URL(request.url).origin;
  if (base.endsWith('/')) base = base.slice(0, -1);
  const body = 'User-agent: *\nAllow: /\nDisallow: /api/\nDisallow: /carrello\nDisallow: /ordine-confermato\n\nSitemap: ' + base + '/sitemap.xml\n';
  return new Response(body, { headers: { 'content-type': 'text/plain; charset=utf-8' } });
}
