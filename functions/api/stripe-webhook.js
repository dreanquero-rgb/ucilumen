import { verifyStripeSignature } from '../../lib/stripe.js';
import { createOrder, orderExistsForPayment } from '../../lib/db.js';

export async function onRequestPost(context) {
  const { request, env } = context;
  const secret = env.STRIPE_WEBHOOK_SECRET;
  if (!secret) return new Response('Webhook non configurato', { status: 503 });

  const sig = request.headers.get('stripe-signature');
  const payload = await request.text();
  const valid = await verifyStripeSignature(payload, sig, secret);
  if (!valid) return new Response('Firma non valida', { status: 400 });

  let event;
  try { event = JSON.parse(payload); } catch (e) { return new Response('Payload non valido', { status: 400 }); }
  if (!event || event.type !== 'checkout.session.completed') return new Response('ignorato', { status: 200 });

  const session = (event.data && event.data.object) ? event.data.object : {};
  const paymentId = session.payment_intent || session.id;

  try {
    if (await orderExistsForPayment(env.DB, paymentId)) return new Response('gia registrato', { status: 200 });

    const cd = session.customer_details || {};
    const email = cd.email || null;
    const name = cd.name || null;
    const address = formatAddress(session);
    const amountTotal = (typeof session.amount_total === 'number') ? session.amount_total : null;

    let metaItems = [];
    try { if (session.metadata && session.metadata.items) metaItems = JSON.parse(session.metadata.items); } catch (e) { metaItems = []; }

    const base = genOrderBase();
    if (Array.isArray(metaItems) && metaItems.length) {
      let i = 0;
      for (const m of metaItems) {
        i += 1;
        const orderNumber = (metaItems.length > 1) ? (base + '-' + i) : base;
        await createOrder(env.DB, {
          order_number: orderNumber,
          customer_name: name,
          customer_email: email,
          shipping_address: address,
          product_id: m.p || null,
          variant_id: m.v || null,
          personalization_text: m.t || null,
          quantity: m.q || 1,
          total_paid_cents: (typeof m.a === 'number') ? m.a : null,
          stripe_payment_id: paymentId,
          status: 'pending_fulfillment',
        });
      }
    } else {
      await createOrder(env.DB, {
        order_number: base,
        customer_name: name,
        customer_email: email,
        shipping_address: address,
        total_paid_cents: amountTotal,
        stripe_payment_id: paymentId,
        status: 'pending_fulfillment',
        notes: 'Dettaglio articoli non disponibile nei metadata della sessione.',
      });
    }
    return new Response('ok', { status: 200 });
  } catch (e) {
    return new Response('Errore interno', { status: 500 });
  }
}

function formatAddress(session) {
  let ship = session.shipping_details || null;
  if (!ship && session.collected_information) ship = session.collected_information.shipping_details || null;
  let addr = (ship && ship.address) ? ship.address : null;
  let recipient = (ship && ship.name) ? ship.name : null;
  const cd = session.customer_details || {};
  if (!addr && cd.address) { addr = cd.address; recipient = recipient || cd.name || null; }
  if (!addr) return null;
  const parts = [recipient, addr.line1, addr.line2, ((addr.postal_code || '') + ' ' + (addr.city || '')).trim(), addr.state, addr.country];
  return parts.filter(Boolean).join(', ');
}

function genOrderBase() {
  const ts = Date.now().toString(36).toUpperCase();
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let rand = '';
  for (let i = 0; i < 4; i++) rand += chars.charAt(Math.floor(Math.random() * chars.length));
  return 'UL-' + ts + '-' + rand;
}
