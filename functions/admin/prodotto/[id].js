import { adminLayout, adminResponse } from '../../../lib/adminui.js';
import { esc } from '../../../lib/layout.js';
import { getProductForAdmin, createProduct, updateProduct, updateVariant, createVariant, slugExists } from '../../../lib/admindb.js';

function euroToCents(v) {
  if (v == null) return null;
  const s = String(v).trim().replace(',', '.');
  if (s === '') return null;
  const n = parseFloat(s);
  if (!isFinite(n) || n < 0) return null;
  return Math.round(n * 100);
}
function centsToEuro(c) {
  if (c == null || c === '') return '';
  return (Number(c) / 100).toFixed(2);
}
function toIntOrNull(v) {
  const n = parseInt(v, 10);
  return isNaN(n) ? null : n;
}
function slugify(s) {
  return String(s || '').toLowerCase()
    .replace(/[àáâãä]/g, 'a').replace(/[èéêë]/g, 'e').replace(/[ìíîï]/g, 'i')
    .replace(/[òóôõö]/g, 'o').replace(/[ùúûü]/g, 'u').replace(/[ç]/g, 'c')
    .replace(/[^a-z0-9]+/g, '-').replace(/^-+/, '').replace(/-+$/, '');
}

function productForm(v, opts) {
  v = v || {};
  opts = opts || {};
  const isNew = !!opts.isNew;
  const activeChecked = (v.active === undefined ? isNew : !!v.active) ? 'checked' : '';
  const persChecked = v.requires_manual_personalization ? 'checked' : '';
  const cur = v.category || 'personalized_gift';
  const catOpt = function (code, label) { return '<option value="' + code + '"' + (cur === code ? ' selected' : '') + '>' + label + '</option>'; };

  const variants = v.variants || [];
  const vids = variants.map(function (x) { return x.id; }).join(',');
  const existingRows = variants.map(function (x) {
    return '<div class="panel" style="margin:0 0 10px;background:var(--surface-2)"><div class="row2">'
      + '<div><label>Etichetta variante</label><input type="text" name="variant_' + x.id + '_label" value="' + esc(x.variant_label) + '"></div>'
      + '<div><label>Prezzo (€)</label><input type="text" name="variant_' + x.id + '_price" value="' + centsToEuro(x.price_cents) + '"></div>'
      + '</div><div class="row2">'
      + '<div><label>Max lettere (0 o vuoto = nessun limite)</label><input type="number" min="0" name="variant_' + x.id + '_maxletters" value="' + (x.max_letters == null ? '' : x.max_letters) + '"></div>'
      + '<div><label>Attiva</label><input type="checkbox" name="variant_' + x.id + '_active" ' + (x.active ? 'checked' : '') + ' style="width:auto"></div>'
      + '</div></div>';
  }).join('');
  const newRows = [1, 2, 3].map(function (i) {
    return '<div class="row2" style="margin-bottom:8px">'
      + '<input type="text" name="newvariant_' + i + '_label" placeholder="Nuova variante: etichetta">'
      + '<input type="text" name="newvariant_' + i + '_price" placeholder="Prezzo €">'
      + '</div>';
  }).join('');

  return (opts.ok ? '<div class="msg ok">Prodotto salvato.</div>' : '')
    + (opts.error ? '<div class="msg err">' + esc(opts.error) + '</div>' : '')
    + '<div class="tools"><h1 style="margin:0;margin-right:auto">' + (isNew ? 'Nuovo prodotto' : 'Modifica prodotto') + '</h1>'
    + '<a class="btn-admin btn-sec" href="/admin/prodotti">← Prodotti</a></div>'
    + '<form method="post">'
    + '<div class="panel"><div class="row2">'
    + '<div><label for="name">Nome</label><input id="name" name="name" type="text" value="' + esc(v.name || '') + '" required></div>'
    + '<div><label for="slug">Slug URL (vuoto = automatico)</label><input id="slug" name="slug" type="text" value="' + esc(v.slug || '') + '"></div>'
    + '</div><div class="row2">'
    + '<div><label for="category">Categoria</label><select id="category" name="category">' + catOpt('personalized_gift', 'Illuminazione personalizzata') + catOpt('mood_lighting', 'Mood lighting') + '</select></div>'
    + '<div><label for="base_price">Prezzo base (€)</label><input id="base_price" name="base_price" type="text" inputmode="decimal" value="' + centsToEuro(v.base_price_cents) + '" required></div>'
    + '</div>'
    + '<label for="image_url">URL immagine (dal fornitore, es. AliExpress)</label>'
    + '<input id="image_url" name="image_url" type="url" value="' + esc(v.image_url || '') + '" placeholder="https://ae01.alicdn.com/...">'
    + (v.image_url ? '<div style="margin-top:8px"><img src="' + esc(v.image_url) + '" alt="" style="max-width:160px;border-radius:10px"></div>' : '')
    + '<label for="description">Descrizione</label><textarea id="description" name="description" rows="4">' + esc(v.description || '') + '</textarea>'
    + '<div class="row2" style="margin-top:10px">'
    + '<div><label>Personalizzabile (richiede testo del cliente)</label><input type="checkbox" name="requires_pers" ' + persChecked + ' style="width:auto"></div>'
    + '<div><label>Attivo (visibile sul sito)</label><input type="checkbox" name="active" ' + activeChecked + ' style="width:auto"></div>'
    + '</div></div>'
    + '<div class="panel"><h3 style="margin-top:0">Dati fornitore (interni, non visibili ai clienti)</h3><div class="row2">'
    + '<div><label for="supplier_name">Fornitore</label><input id="supplier_name" name="supplier_name" type="text" value="' + esc(v.supplier_name || '') + '"></div>'
    + '<div><label for="supplier_url">URL prodotto fornitore</label><input id="supplier_url" name="supplier_url" type="url" value="' + esc(v.supplier_url || '') + '"></div>'
    + '</div><div class="row2">'
    + '<div><label for="supplier_cost">Costo fornitore (€)</label><input id="supplier_cost" name="supplier_cost" type="text" inputmode="decimal" value="' + centsToEuro(v.supplier_cost_cents) + '"></div>'
    + '<div></div>'
    + '</div><div class="row2">'
    + '<div><label for="ship_min">Spedizione min (giorni)</label><input id="ship_min" name="ship_min" type="number" min="0" value="' + (v.shipping_days_min == null ? '' : v.shipping_days_min) + '"></div>'
    + '<div><label for="ship_max">Spedizione max (giorni)</label><input id="ship_max" name="ship_max" type="number" min="0" value="' + (v.shipping_days_max == null ? '' : v.shipping_days_max) + '"></div>'
    + '</div></div>'
    + '<div class="panel"><h3 style="margin-top:0">Varianti (taglie / formati)</h3>'
    + '<input type="hidden" name="variant_ids" value="' + esc(vids) + '">'
    + (existingRows || '<p class="muted">Nessuna variante: aggiungine almeno una qui sotto (serve per i prezzi).</p>')
    + '<h3>Aggiungi varianti</h3><p class="muted" style="margin-top:0;font-size:.85rem">Compila etichetta e prezzo per crearne di nuove.</p>' + newRows
    + '</div>'
    + '<button class="btn-admin" type="submit">Salva prodotto</button>'
    + '</form>';
}

export async function onRequestGet(context) {
  const { env, request, params } = context;
  const isNew = params.id === 'nuovo';
  let p = null;
  if (!isNew) {
    const id = parseInt(params.id, 10);
    try { p = await getProductForAdmin(env.DB, id); } catch (e) { p = null; }
    if (!p) {
      return adminResponse(adminLayout({ title: 'Prodotto', active: '/admin/prodotti', body: '<h1>Prodotto non trovato</h1><p><a href="/admin/prodotti">← Torna ai prodotti</a></p>' }), 404);
    }
  }
  const ok = new URL(request.url).searchParams.get('ok');
  return adminResponse(adminLayout({
    title: isNew ? 'Nuovo prodotto' : 'Modifica prodotto',
    active: '/admin/prodotti',
    body: productForm(p, { isNew: isNew, ok: ok }),
  }));
}

export async function onRequestPost(context) {
  const { env, request, params } = context;
  const isNew = params.id === 'nuovo';
  let form;
  try { form = await request.formData(); } catch (e) { return new Response(null, { status: 303, headers: { Location: '/admin/prodotti' } }); }

  const name = (form.get('name') || '').toString().trim();
  let slug = (form.get('slug') || '').toString().trim().toLowerCase();
  slug = slug ? slugify(slug) : slugify(name);
  const category = (form.get('category') || '').toString();
  const base_price_cents = euroToCents(form.get('base_price'));

  let error = null;
  if (!name) error = 'Il nome è obbligatorio.';
  else if (['personalized_gift', 'mood_lighting'].indexOf(category) === -1) error = 'Categoria non valida.';
  else if (base_price_cents == null) error = 'Prezzo base non valido (usa es. 39.90).';
  else if (!slug) error = 'Slug non valido (prova a inserirne uno manualmente).';
  else {
    try { if (await slugExists(env.DB, slug, isNew ? 0 : parseInt(params.id, 10))) error = 'Slug già usato da un altro prodotto.'; } catch (e) {}
  }

  if (error) {
    let existing = null;
    if (!isNew) { try { existing = await getProductForAdmin(env.DB, parseInt(params.id, 10)); } catch (e) {} }
    const vErr = {
      id: existing ? existing.id : undefined,
      name: name,
      slug: (form.get('slug') || '').toString(),
      category: category || 'personalized_gift',
      description: (form.get('description') || '').toString(),
      base_price_cents: base_price_cents,
      image_url: (form.get('image_url') || '').toString(),
      supplier_name: (form.get('supplier_name') || '').toString(),
      supplier_url: (form.get('supplier_url') || '').toString(),
      supplier_cost_cents: euroToCents(form.get('supplier_cost')),
      shipping_days_min: toIntOrNull(form.get('ship_min')),
      shipping_days_max: toIntOrNull(form.get('ship_max')),
      requires_manual_personalization: form.get('requires_pers') ? 1 : 0,
      active: form.get('active') ? 1 : 0,
      variants: existing ? existing.variants : [],
    };
    return adminResponse(adminLayout({
      title: isNew ? 'Nuovo prodotto' : 'Modifica prodotto',
      active: '/admin/prodotti',
      body: productForm(vErr, { isNew: isNew, error: error }),
    }), 400);
  }

  const fields = {
    slug: slug, name: name, category: category,
    description: (form.get('description') || '').toString().trim(),
    base_price_cents: base_price_cents,
    supplier_name: (form.get('supplier_name') || '').toString().trim(),
    supplier_url: (form.get('supplier_url') || '').toString().trim(),
    supplier_cost_cents: euroToCents(form.get('supplier_cost')),
    shipping_days_min: toIntOrNull(form.get('ship_min')),
    shipping_days_max: toIntOrNull(form.get('ship_max')),
    requires_manual_personalization: form.get('requires_pers') ? 1 : 0,
    image_url: (form.get('image_url') || '').toString().trim(),
    active: form.get('active') ? 1 : 0,
  };

  let id;
  try {
    if (isNew) { id = await createProduct(env.DB, fields); }
    else { id = parseInt(params.id, 10); await updateProduct(env.DB, id, fields); }
  } catch (e) {
    return adminResponse(adminLayout({ title: 'Errore', active: '/admin/prodotti', body: '<div class="msg err">Errore nel salvataggio del prodotto.</div><p><a href="/admin/prodotti">← Prodotti</a></p>' }), 500);
  }

  // Varianti esistenti
  const vids = (form.get('variant_ids') || '').toString().split(',').filter(Boolean);
  for (let i = 0; i < vids.length; i++) {
    const vid = parseInt(vids[i], 10);
    if (!vid) continue;
    const label = (form.get('variant_' + vid + '_label') || '').toString().trim();
    const price = euroToCents(form.get('variant_' + vid + '_price'));
    if (!label || price == null) continue;
    const maxl = toIntOrNull(form.get('variant_' + vid + '_maxletters'));
    try { await updateVariant(env.DB, vid, { variant_label: label, price_cents: price, max_letters: (maxl && maxl > 0) ? maxl : null, active: form.get('variant_' + vid + '_active') ? 1 : 0 }); } catch (e) {}
  }
  // Nuove varianti
  for (let i = 1; i <= 3; i++) {
    const label = (form.get('newvariant_' + i + '_label') || '').toString().trim();
    const price = euroToCents(form.get('newvariant_' + i + '_price'));
    if (!label || price == null) continue;
    const maxl = toIntOrNull(form.get('newvariant_' + i + '_maxletters'));
    try { await createVariant(env.DB, id, { variant_label: label, price_cents: price, max_letters: (maxl && maxl > 0) ? maxl : null, active: 1 }); } catch (e) {}
  }

  return new Response(null, { status: 303, headers: { Location: '/admin/prodotto/' + id + '?ok=1' } });
}
