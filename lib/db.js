// Helper per le query su D1 (binding env.DB).

export async function getFeaturedProducts(DB, limit = 6) {
  const stmt = DB.prepare(
    'SELECT * FROM products WHERE active = 1 ORDER BY category DESC, id ASC LIMIT ?'
  ).bind(limit);
  const { results } = await stmt.all();
  return results || [];
}

export async function getProductsByCategory(DB, category) {
  const stmt = DB.prepare(
    'SELECT * FROM products WHERE active = 1 AND category = ? ORDER BY id ASC'
  ).bind(category);
  const { results } = await stmt.all();
  return results || [];
}

export async function getProductBySlug(DB, slug) {
  const product = await DB.prepare(
    'SELECT * FROM products WHERE slug = ? AND active = 1'
  ).bind(slug).first();
  if (!product) return null;
  const { results } = await DB.prepare(
    'SELECT * FROM product_variants WHERE product_id = ? AND active = 1 ORDER BY price_cents ASC'
  ).bind(product.id).all();
  product.variants = results || [];
  return product;
}

// Rilegge le varianti richieste al checkout: i prezzi usati per il pagamento
// vengono SEMPRE da qui, mai dal client.
export async function getVariantsByIds(DB, ids) {
  if (!ids || !ids.length) return [];
  const placeholders = ids.map(() => '?').join(',');
  const stmt = DB.prepare(
    'SELECT v.id, v.product_id, v.variant_label, v.price_cents, v.max_letters, '
    + 'p.name AS product_name, p.slug AS product_slug, p.requires_manual_personalization '
    + 'FROM product_variants v JOIN products p ON p.id = v.product_id '
    + 'WHERE v.active = 1 AND p.active = 1 AND v.id IN (' + placeholders + ')'
  ).bind(...ids);
  const { results } = await stmt.all();
  return results || [];
}

export async function getActiveProductsForSitemap(DB) {
  const { results } = await DB.prepare(
    'SELECT slug FROM products WHERE active = 1 ORDER BY id ASC'
  ).all();
  return results || [];
}

export async function orderExistsForPayment(DB, stripePaymentId) {
  if (!stripePaymentId) return false;
  const row = await DB.prepare(
    'SELECT 1 AS x FROM orders WHERE stripe_payment_id = ? LIMIT 1'
  ).bind(stripePaymentId).first();
  return !!row;
}

export async function createOrder(DB, o) {
  await DB.prepare(
    'INSERT INTO orders '
    + '(order_number, customer_name, customer_email, shipping_address, product_id, variant_id, '
    + 'personalization_text, quantity, total_paid_cents, stripe_payment_id, status, notes) '
    + 'VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)'
  ).bind(
    o.order_number,
    o.customer_name || null,
    o.customer_email || null,
    o.shipping_address || null,
    o.product_id || null,
    o.variant_id || null,
    o.personalization_text || null,
    o.quantity || 1,
    (typeof o.total_paid_cents === 'number') ? o.total_paid_cents : null,
    o.stripe_payment_id || null,
    o.status || 'pending_fulfillment',
    o.notes || null
  ).run();
}
