// Query usate solo dall'area Admin.

/* ---- Ordini ---- */

export async function getOrders(DB, limit) {
  const { results } = await DB.prepare(
    'SELECT o.id, o.order_number, o.created_at, o.customer_name, o.customer_email, o.shipping_address, '
    + 'o.personalization_text, o.quantity, o.total_paid_cents, o.status, o.tracking_number, o.supplier_order_reference, o.notes, '
    + 'p.name AS product_name, v.variant_label '
    + 'FROM orders o LEFT JOIN products p ON p.id = o.product_id LEFT JOIN product_variants v ON v.id = o.variant_id '
    + 'ORDER BY o.id DESC LIMIT ?'
  ).bind(limit || 100).all();
  return results || [];
}

export async function getOrderStats(DB) {
  const { results } = await DB.prepare('SELECT status, COUNT(*) AS n FROM orders GROUP BY status').all();
  return results || [];
}

export async function updateOrder(DB, id, f) {
  await DB.prepare('UPDATE orders SET status = ?, tracking_number = ?, supplier_order_reference = ? WHERE id = ?')
    .bind(f.status, f.tracking_number || null, f.supplier_order_reference || null, id)
    .run();
}

/* ---- Prodotti ---- */

export async function getAllProducts(DB) {
  const { results } = await DB.prepare(
    'SELECT id, slug, name, category, base_price_cents, image_url, requires_manual_personalization, active '
    + 'FROM products ORDER BY active DESC, id ASC'
  ).all();
  return results || [];
}

export async function getProductForAdmin(DB, id) {
  const product = await DB.prepare('SELECT * FROM products WHERE id = ?').bind(id).first();
  if (!product) return null;
  const { results } = await DB.prepare('SELECT * FROM product_variants WHERE product_id = ? ORDER BY id ASC').bind(id).all();
  product.variants = results || [];
  return product;
}

export async function slugExists(DB, slug, excludeId) {
  const row = await DB.prepare('SELECT id FROM products WHERE slug = ? AND id != ?').bind(slug, excludeId || 0).first();
  return !!row;
}

export async function createProduct(DB, f) {
  const res = await DB.prepare(
    'INSERT INTO products (slug, name, category, description, base_price_cents, supplier_name, supplier_url, supplier_cost_cents, shipping_days_min, shipping_days_max, requires_manual_personalization, image_url, active) '
    + 'VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)'
  ).bind(
    f.slug, f.name, f.category, f.description || null, f.base_price_cents,
    f.supplier_name || null, f.supplier_url || null, f.supplier_cost_cents,
    f.shipping_days_min, f.shipping_days_max, f.requires_manual_personalization,
    f.image_url || null, f.active
  ).run();
  return res && res.meta ? res.meta.last_row_id : null;
}

export async function updateProduct(DB, id, f) {
  await DB.prepare(
    'UPDATE products SET slug = ?, name = ?, category = ?, description = ?, base_price_cents = ?, '
    + 'supplier_name = ?, supplier_url = ?, supplier_cost_cents = ?, shipping_days_min = ?, shipping_days_max = ?, '
    + 'requires_manual_personalization = ?, image_url = ?, active = ? WHERE id = ?'
  ).bind(
    f.slug, f.name, f.category, f.description || null, f.base_price_cents,
    f.supplier_name || null, f.supplier_url || null, f.supplier_cost_cents,
    f.shipping_days_min, f.shipping_days_max, f.requires_manual_personalization,
    f.image_url || null, f.active, id
  ).run();
}

export async function updateVariant(DB, id, f) {
  await DB.prepare('UPDATE product_variants SET variant_label = ?, price_cents = ?, max_letters = ?, active = ? WHERE id = ?')
    .bind(f.variant_label, f.price_cents, f.max_letters, f.active, id).run();
}

export async function createVariant(DB, productId, f) {
  await DB.prepare('INSERT INTO product_variants (product_id, variant_label, price_cents, max_letters, active) VALUES (?, ?, ?, ?, ?)')
    .bind(productId, f.variant_label, f.price_cents, f.max_letters, f.active).run();
}
