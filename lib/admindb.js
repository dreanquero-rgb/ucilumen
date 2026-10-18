// Query usate solo dall'area Admin.

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
