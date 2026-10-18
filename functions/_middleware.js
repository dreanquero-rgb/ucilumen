// Aggiunge header di sicurezza a tutte le risposte e una CSP alle pagine HTML.
export async function onRequest(context) {
  const response = await context.next();
  const headers = new Headers(response.headers);
  const ct = headers.get('content-type') || '';
  if (ct.indexOf('text/html') !== -1) {
    headers.set('Content-Security-Policy', "default-src 'self'; img-src 'self' data:; style-src 'self' 'unsafe-inline'; script-src 'self'; connect-src 'self'; frame-ancestors 'none'; base-uri 'self'; form-action 'self'; object-src 'none'");
  }
  headers.set('X-Content-Type-Options', 'nosniff');
  headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  headers.set('Permissions-Policy', 'geolocation=(), microphone=(), camera=()');
  headers.set('X-Frame-Options', 'DENY');
  return new Response(response.body, { status: response.status, statusText: response.statusText, headers });
}
