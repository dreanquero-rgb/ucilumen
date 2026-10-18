// Autenticazione admin a UTENTE SINGOLO.
// Le credenziali vivono nei secret dell'ambiente (impostati solo da chi ha
// accesso al pannello Cloudflare): nessuna registrazione dal sito, un solo account.
//   ADMIN_EMAIL, ADMIN_PASSWORD, SESSION_SECRET

const COOKIE = 'ucis_admin';
const MAX_AGE = 60 * 60 * 24 * 7; // 7 giorni

function timingSafeEqual(a, b) {
  if (typeof a !== 'string' || typeof b !== 'string' || a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

async function hmacHex(secret, message) {
  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey('raw', enc.encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
  const sig = await crypto.subtle.sign('HMAC', key, enc.encode(message));
  const bytes = new Uint8Array(sig);
  let hex = '';
  for (let i = 0; i < bytes.length; i++) hex += bytes[i].toString(16).padStart(2, '0');
  return hex;
}

export function adminConfigured(env) {
  return !!(env && env.ADMIN_EMAIL && env.ADMIN_PASSWORD && env.SESSION_SECRET);
}

export function checkCredentials(env, email, password) {
  const e = (email || '').toString().trim().toLowerCase();
  const expectedEmail = (env.ADMIN_EMAIL || '').toString().trim().toLowerCase();
  const okEmail = timingSafeEqual(e, expectedEmail);
  const okPass = timingSafeEqual((password || '').toString(), (env.ADMIN_PASSWORD || '').toString());
  return okEmail && okPass;
}

export async function createSessionCookie(env) {
  const exp = Math.floor(Date.now() / 1000) + MAX_AGE;
  const sig = await hmacHex(env.SESSION_SECRET, 'admin|' + exp);
  const value = exp + '.' + sig;
  return COOKIE + '=' + value + '; Path=/admin; HttpOnly; Secure; SameSite=Strict; Max-Age=' + MAX_AGE;
}

export function clearSessionCookie() {
  return COOKIE + '=; Path=/admin; HttpOnly; Secure; SameSite=Strict; Max-Age=0';
}

function parseCookie(header, name) {
  if (!header) return null;
  const parts = header.split(';');
  for (let i = 0; i < parts.length; i++) {
    const p = parts[i];
    const idx = p.indexOf('=');
    if (idx === -1) continue;
    if (p.slice(0, idx).trim() === name) return p.slice(idx + 1).trim();
  }
  return null;
}

export async function isAuthenticated(request, env) {
  if (!adminConfigured(env)) return false;
  const raw = parseCookie(request.headers.get('cookie'), COOKIE);
  if (!raw) return false;
  const dot = raw.lastIndexOf('.');
  if (dot === -1) return false;
  const exp = raw.slice(0, dot);
  const sig = raw.slice(dot + 1);
  const expNum = parseInt(exp, 10);
  if (!expNum || expNum < Math.floor(Date.now() / 1000)) return false;
  const expected = await hmacHex(env.SESSION_SECRET, 'admin|' + exp);
  return timingSafeEqual(sig, expected);
}
