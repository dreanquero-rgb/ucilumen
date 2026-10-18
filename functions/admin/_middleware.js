import { isAuthenticated, adminConfigured } from '../../lib/auth.js';

function setupResponse() {
  const html = '<!doctype html><html lang="it"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">'
    + '<title>Admin da configurare | UcisLumen</title><meta name="robots" content="noindex, nofollow">'
    + '<link rel="stylesheet" href="/css/style.css"><link rel="stylesheet" href="/css/type.css">'
    + '<style>body{background:var(--surface-2)}.box{max-width:640px;margin:40px auto;padding:0 16px}.card{background:var(--surface);border:1px solid var(--border);border-radius:16px;padding:24px}code{background:var(--surface-2);padding:2px 6px;border-radius:6px}</style></head><body>'
    + '<div class="box"><div class="card"><h1>Area admin da configurare</h1>'
    + '<p>Per attivare l’accesso, imposta questi <strong>secret</strong> nel progetto Cloudflare Pages '
    + '(Settings › Variables and secrets), poi rifai il deploy:</p>'
    + '<ul><li><code>ADMIN_EMAIL</code> — la tua email di accesso</li>'
    + '<li><code>ADMIN_PASSWORD</code> — una password robusta</li>'
    + '<li><code>SESSION_SECRET</code> — una stringa lunga e casuale (32+ caratteri)</li></ul>'
    + '<p class="muted">Solo chi ha accesso al pannello Cloudflare può impostarli o cambiarli: nessuno può registrarsi dal sito.</p>'
    + '</div></div></body></html>';
  return new Response(html, { status: 503, headers: { 'content-type': 'text/html; charset=utf-8', 'cache-control': 'no-store' } });
}

export async function onRequest(context) {
  const { request, env } = context;
  const url = new URL(request.url);
  if (url.pathname === '/admin/login') return context.next();
  if (!adminConfigured(env)) return setupResponse();
  const ok = await isAuthenticated(request, env);
  if (!ok) return new Response(null, { status: 302, headers: { Location: '/admin/login' } });
  return context.next();
}
