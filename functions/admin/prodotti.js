import { adminLayout, adminResponse } from '../../lib/adminui.js';
import { esc, formatPrice } from '../../lib/layout.js';
import { getAllProducts } from '../../lib/admindb.js';
import { categoryByCode } from '../../lib/catalog.js';

export async function onRequestGet(context) {
  const { env } = context;
  let products = [];
  try { products = await getAllProducts(env.DB); } catch (e) { products = []; }

  const rows = products.map(function (p) {
    const cat = categoryByCode(p.category);
    const img = p.image_url
      ? '<img src="' + esc(p.image_url) + '" alt="" style="width:48px;height:48px;object-fit:cover;border-radius:8px">'
      : '—';
    return '<tr>'
      + '<td>' + img + '</td>'
      + '<td><strong>' + esc(p.name) + '</strong><div class="pers" style="color:var(--muted)">/prodotto/' + esc(p.slug) + '</div></td>'
      + '<td>' + esc(cat ? cat.name : p.category) + '</td>'
      + '<td>' + formatPrice(p.base_price_cents) + '</td>'
      + '<td>' + (p.active ? 'Sì' : 'No') + '</td>'
      + '<td><a class="btn-admin btn-sec" style="padding:6px 12px" href="/admin/prodotto/' + p.id + '">Modifica</a></td>'
      + '</tr>';
  }).join('');

  const body = '<div class="tools"><h1 style="margin:0;margin-right:auto">Prodotti</h1>'
    + '<a class="btn-admin" href="/admin/prodotto/nuovo">+ Nuovo prodotto</a></div>'
    + '<div class="panel">'
    + (products.length
      ? '<table><thead><tr><th></th><th>Nome</th><th>Categoria</th><th>Prezzo base</th><th>Attivo</th><th></th></tr></thead><tbody>' + rows + '</tbody></table>'
      : '<p class="muted">Nessun prodotto. Creane uno con “+ Nuovo prodotto”.</p>')
    + '</div>';

  return adminResponse(adminLayout({ title: 'Prodotti', active: '/admin/prodotti', body: body }));
}
