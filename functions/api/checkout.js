import { getVariantsByIds } from '../../lib/db.js';
import { createCheckoutSession } from '../../lib/stripe.js';

function json(obj, status = 200) {
  return new Response(JSON.stringify(obj), {
    status,
    headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' },
  });
}

export async function onRequestPost(context) {
  const { request, env } = context;
  if (!env.STRIPE_SECRET_KEY) return json({ error: 'Pagamenti non ancora configurati.' }, 503);

  let payload;
  try { payload = await request.json(); } catch (e) { return json({ error: 'Richiesta non valida.' }, 400); }
  const items = Array.isArray(payload && payload.items) ? payload.items : [];
  if (!items.length) return json({ error: 'Il carrello è vuoto.' }, 400);

  const wanted = [];
  for (const it of items) {
    const variantId = parseInt(it && it.variantId, 10);
    if (!variantId) continue;
    const qty = Math.min(Math.max(parseInt(it.qty, 10) || 1, 1), 20);
    const personalization = (it.personalization || '').toString().slice(0, 60).trim();
    wanted.push({ variantId, qty, personalization });
  }
  if (!wanted.length) return json({ error: 'Nessun articolo valido nel carrello.' }, 400);

  const ids = [];
  for (const w of wanted) if (ids.indexOf(w.variantId) === -1) ids.push(w.variantId);

  let variants = [];
  try { variants = await getVariantsByIds(env.DB, ids); } catch (e) { return json({ error: 'Errore nel recupero dei prodotti.' }, 500); }
  const byId = new Map(variants.map((v) => [v.id, v]));

  const lineItems = [];
  const orderMeta = [];
  for (const w of wanted) {
    const v = byId.get(w.variantId);
    if (!v) return json({ error: 'Un articolo nel carrello non è più disponibile.' }, 400);
    if (v.requires_manual_personalization) {
      if (!w.personalization) return json({ error: 'Manca il testo di personalizzazione per “' + v.product_name + '”.' }, 400);
      if (v.max_letters && w.personalization.length > v.max_letters) {
        return json({ error: 'Il testo per “' + v.product_name + '” supera i ' + v.max_letters + ' caratteri.' }, 400);
      }
    }
    const name = v.product_name + ' — ' + v.variant_label;
    const productData = { name: name };
    if (v.requires_manual_personalization && w.personalization) {
      productData.description = 'Personalizzazione: ' + w.personalization;
    }
    lineItems.push({ quantity: w.qty, price_data: { currency: 'eur', unit_amount: v.price_cents, product_data: productData } });
    orderMeta.push({ p: v.product_id, v: v.id, q: w.qty, t: w.personalization || '', a: v.price_cents * w.qty });
  }

  let base = (env && env.SITE_URL) ? env.SITE_URL : new URL(request.url).origin;
  if (base.endsWith('/')) base = base.slice(0, -1);

  const sessionPayload = {
    mode: 'payment',
    locale: 'it',
    success_url: base + '/ordine-confermato?session_id={CHECKOUT_SESSION_ID}',
    cancel_url: base + '/carrello',
    line_items: lineItems,
    shipping_address_collection: { allowed_countries: ['IT'] },
    phone_number_collection: { enabled: true },
    metadata: { source: 'ucilumen' },
  };
  const metaItems = JSON.stringify(orderMeta);
  if (metaItems.length <= 480) sessionPayload.metadata.items = metaItems;

  try {
    const session = await createCheckoutSession(env.STRIPE_SECRET_KEY, sessionPayload);
    return json({ url: session.url });
  } catch (e) {
    return json({ error: (e && e.message) || 'Errore durante la creazione del pagamento.' }, 502);
  }
}
