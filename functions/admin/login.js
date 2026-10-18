import { checkCredentials, createSessionCookie, adminConfigured, isAuthenticated } from '../../lib/auth.js';
import { esc } from '../../lib/layout.js';

function loginHtml(error) {
  return '<!doctype html><html lang="it"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">'
    + '<title>Accesso Admin | UcisLumen</title><meta name="robots" content="noindex, nofollow">'
    + '<link rel="icon" href="/img/logo.svg" type="image/svg+xml">'
    + '<link rel="stylesheet" href="/css/style.css"><link rel="stylesheet" href="/css/type.css">'
    + '<style>body{display:flex;min-height:100vh;align-items:center;justify-content:center;background:var(--surface-2);margin:0}'
    + '.card{background:var(--surface);border:1px solid var(--border);border-radius:16px;padding:28px;max-width:360px;width:92%;box-sizing:border-box;box-shadow:var(--shadow-lg)}'
    + '.card h1{font-size:1.4rem;margin:0 0 4px}.card p.sub{color:var(--muted);margin:0 0 16px;font-size:.92rem}'
    + 'label{display:block;font-weight:600;font-size:.85rem;margin:12px 0 4px}'
    + 'input{font:inherit;width:100%;box-sizing:border-box;padding:11px 12px;border:1px solid var(--border);border-radius:10px;background:var(--surface);color:var(--text)}'
    + 'button{margin-top:18px;width:100%;font:inherit;font-weight:700;padding:12px;border:0;border-radius:999px;background:linear-gradient(135deg,var(--glow),var(--accent-strong));color:#2A1B06;cursor:pointer}'
    + '.err{background:#fdeaea;color:#b4232a;border-radius:10px;padding:10px 12px;font-size:.9rem;margin-bottom:12px}</style></head><body>'
    + '<form class="card" method="post" action="/admin/login">'
    + '<h1>Accesso riservato</h1><p class="sub">Area di gestione di UcisLumen.</p>'
    + (error ? '<div class="err">' + esc(error) + '</div>' : '')
    + '<label for="email">Email</label><input id="email" name="email" type="email" autocomplete="username" required>'
    + '<label for="password">Password</label><input id="password" name="password" type="password" autocomplete="current-password" required>'
    + '<button type="submit">Entra</button></form></body></html>';
}

function page(html, status) {
  return new Response(html, { status: status || 200, headers: { 'content-type': 'text/html; charset=utf-8', 'cache-control': 'no-store' } });
}

export async function onRequestGet(context) {
  const { env, request } = context;
  if (adminConfigured(env) && await isAuthenticated(request, env)) {
    return new Response(null, { status: 302, headers: { Location: '/admin' } });
  }
  return page(loginHtml(null));
}

export async function onRequestPost(context) {
  const { env, request } = context;
  if (!adminConfigured(env)) return page(loginHtml('Admin non ancora configurato.'), 503);
  let form;
  try { form = await request.formData(); } catch (e) { return page(loginHtml('Richiesta non valida.'), 400); }
  if (checkCredentials(env, form.get('email'), form.get('password'))) {
    const cookie = await createSessionCookie(env);
    return new Response(null, { status: 302, headers: { Location: '/admin', 'Set-Cookie': cookie } });
  }
  return page(loginHtml('Email o password non corretti.'), 401);
}
