import { adminLayout, adminResponse, ORDER_STATUSES } from '../../lib/adminui.js';
import { esc, formatPrice } from '../../lib/layout.js';
import { getOrders, getOrderStats, updateOrder } from '../../lib/admindb.js';

const VALID = ORDER_STATUSES.map(function (s) { return s[0]; });

export async function onRequestPost(context) {
  const { request, env } = context;
  try {
    const form = await request.formData();
    const id = parseInt(form.get('order_id'), 10);
    const status = (form.get('status') || '').toString();
    if (id && VALID.indexOf(status) !== -1) {
      await updateOrder(env.DB, id, {
        status: status,
        tracking_number: (form.get('tracking_number') || '').toString().trim(),
        supplier_order_reference: (form.get('supplier_order_reference') || '').toString().trim(),
      });
    }
  } catch (e) { /* ignora: torna alla lista */ }
  return new Response(null, { status: 303, headers: { Location: '/admin?ok=1' } });
}

export async function onRequestGet(context) {
  const { env, request } = context;
  let orders = [];
  let stats = [];
  try { orders = await getOrders(env.DB, 100); } catch (e) { orders = []; }
  try { stats = await getOrderStats(env.DB); } catch (e) { stats = []; }

  const saved = new URL(request.url).searchParams.get('ok');
  const statMap = {};
  stats.forEach(function (r) { statMap[r.status] = r.n; });
  const statsHtml = ORDER_STATUSES.map(function (s) {
    return '<div class="stat"><b>' + (statMap[s[0]] || 0) + '</b><span>' + esc(s[1]) + '</span></div>';
  }).join('');

  const rows = orders.map(function (o) {
    const art = esc(o.product_name || '—')
      + (o.variant_label ? ' · ' + esc(o.variant_label) : '')
      + (o.personalization_text ? '<div class="pers">“' + esc(o.personalization_text) + '”</div>' : '');
    const opts = ORDER_STATUSES.map(function (s) {
      return '<option value="' + s[0] + '"' + (o.status === s[0] ? ' selected' : '') + '>' + esc(s[1]) + '</option>';
    }).join('');
    const addr = o.shipping_address ? '<div class="pers" style="color:var(--muted)">' + esc(o.shipping_address) + '</div>' : '';
    return '<tr>'
      + '<td><strong>' + esc(o.order_number) + '</strong><div class="pers" style="color:var(--muted)">' + esc((o.created_at || '').slice(0, 16)) + '</div></td>'
      + '<td>' + esc(o.customer_name || '—') + '<div class="pers" style="color:var(--muted)">' + esc(o.customer_email || '') + '</div>' + addr + '</td>'
      + '<td>' + art + '</td>'
      + '<td>' + (o.quantity || 1) + '</td>'
      + '<td>' + (typeof o.total_paid_cents === 'number' ? formatPrice(o.total_paid_cents) : '—') + '</td>'
      + '<td><form method="post" action="/admin">'
      + '<input type="hidden" name="order_id" value="' + o.id + '">'
      + '<select name="status">' + opts + '</select>'
      + '<input type="text" name="tracking_number" placeholder="Tracking" value="' + esc(o.tracking_number || '') + '" style="margin-top:6px">'
      + '<input type="text" name="supplier_order_reference" placeholder="Rif. ordine fornitore" value="' + esc(o.supplier_order_reference || '') + '" style="margin-top:6px">'
      + '<button class="btn-admin" style="margin-top:8px" type="submit">Salva</button>'
      + '</form></td>'
      + '</tr>';
  }).join('');

  const table = orders.length
    ? '<table><thead><tr><th>Ordine</th><th>Cliente</th><th>Articolo</th><th>Qtà</th><th>Totale</th><th>Stato / spedizione</th></tr></thead><tbody>' + rows + '</tbody></table>'
    : '<p class="muted">Nessun ordine ancora. Appariranno qui dopo i primi pagamenti.</p>';

  const body = (saved ? '<div class="msg ok">Ordine aggiornato.</div>' : '')
    + '<h1>Ordini</h1>'
    + '<div class="stats">' + statsHtml + '</div>'
    + '<div class="panel">' + table + '</div>';

  return adminResponse(adminLayout({ title: 'Ordini', active: '/admin', body: body }));
}
