// Client minimale per l'API REST di Stripe, adatto al runtime dei Workers
// (niente SDK Node). Usato dalle Pages Functions.

function appendForm(params, key, value) {
  if (value === undefined || value === null) return;
  if (Array.isArray(value)) {
    value.forEach((v, i) => appendForm(params, key + '[' + i + ']', v));
  } else if (typeof value === 'object') {
    for (const k of Object.keys(value)) appendForm(params, key + '[' + k + ']', value[k]);
  } else {
    params.append(key, String(value));
  }
}

// Serializza un oggetto annidato nel formato x-www-form-urlencoded con la
// notazione a parentesi che Stripe si aspetta.
export function toFormBody(obj) {
  const params = new URLSearchParams();
  for (const k of Object.keys(obj)) appendForm(params, k, obj[k]);
  return params.toString();
}

export async function createCheckoutSession(secretKey, payload) {
  const res = await fetch('https://api.stripe.com/v1/checkout/sessions', {
    method: 'POST',
    headers: {
      'Authorization': 'Bearer ' + secretKey,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: toFormBody(payload),
  });
  const data = await res.json();
  if (!res.ok) {
    const msg = (data && data.error && data.error.message) || 'Errore nella creazione della sessione di pagamento';
    throw new Error(msg);
  }
  return data;
}

// Verifica la firma del webhook Stripe usando Web Crypto (HMAC-SHA256).
export async function verifyStripeSignature(payload, sigHeader, secret, toleranceSeconds = 300) {
  if (!sigHeader || !secret) return false;
  let t = null;
  const v1s = [];
  for (const item of sigHeader.split(',')) {
    const idx = item.indexOf('=');
    if (idx === -1) continue;
    const k = item.slice(0, idx).trim();
    const val = item.slice(idx + 1).trim();
    if (k === 't') t = val;
    else if (k === 'v1') v1s.push(val);
  }
  if (!t || !v1s.length) return false;

  const now = Math.floor(Date.now() / 1000);
  if (Math.abs(now - Number(t)) > toleranceSeconds) return false;

  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey('raw', enc.encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
  const sigBuf = await crypto.subtle.sign('HMAC', key, enc.encode(t + '.' + payload));
  const bytes = new Uint8Array(sigBuf);
  let expected = '';
  for (let i = 0; i < bytes.length; i++) expected += bytes[i].toString(16).padStart(2, '0');

  return v1s.some((v1) => timingSafeEqual(expected, v1));
}

function timingSafeEqual(a, b) {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}
