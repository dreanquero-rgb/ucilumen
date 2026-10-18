import { esc } from './layout.js';

export const ORDER_STATUSES = [
  ['pending_fulfillment', 'Da evadere'],
  ['design_sent_to_supplier', 'Bozzetto inviato al fornitore'],
  ['awaiting_customer_approval', 'In attesa approvazione cliente'],
  ['in_production', 'In produzione'],
  ['shipped', 'Spedito'],
  ['delivered', 'Consegnato'],
  ['refunded', 'Rimborsato'],
  ['cancelled', 'Annullato'],
];

export function adminResponse(html, status) {
  return new Response(html, { status: status || 200, headers: { 'content-type': 'text/html; charset=utf-8', 'cache-control': 'no-store' } });
}

export function adminLayout(opts) {
  const o = opts || {};
  const items = [['/admin', 'Ordini'], ['/admin/prodotti', 'Prodotti'], ['/', 'Vedi sito'], ['/admin/logout', 'Esci']];
  const nav = items.map(function (it) {
    const cur = o.active === it[0] ? ' aria-current="page"' : '';
    return '<a href="' + it[0] + '"' + cur + '>' + esc(it[1]) + '</a>';
  }).join('');

  const css = 'body{background:var(--surface-2);margin:0}'
    + '.admin-bar{background:var(--surface);border-bottom:1px solid var(--border);position:sticky;top:0;z-index:10}'
    + '.admin-bar .inner{max-width:1100px;margin:0 auto;padding:12px 16px;display:flex;align-items:center;gap:20px;flex-wrap:wrap}'
    + '.admin-bar .brand{font-family:var(--serif);font-weight:700;color:var(--text)}'
    + '.admin-bar nav{display:flex;gap:18px;margin-left:auto;flex-wrap:wrap}'
    + '.admin-bar nav a{color:var(--text);font-weight:600;font-size:.95rem}'
    + '.admin-bar nav a[aria-current]{color:var(--accent-strong)}'
    + '.admin-main{max-width:1100px;margin:0 auto;padding:24px 16px 60px}'
    + '.admin-main h1{margin:.2em 0 .6em}'
    + '.stats{display:flex;flex-wrap:wrap;gap:12px;margin-bottom:24px}'
    + '.stat{background:var(--surface);border:1px solid var(--border);border-radius:12px;padding:12px 16px;min-width:120px}'
    + '.stat b{display:block;font-size:1.5rem;font-family:var(--serif)}'
    + '.stat span{font-size:.78rem;color:var(--muted)}'
    + '.panel{background:var(--surface);border:1px solid var(--border);border-radius:14px;padding:16px;margin-bottom:20px;overflow-x:auto}'
    + 'table{width:100%;border-collapse:collapse;font-size:.9rem}'
    + 'th,td{text-align:left;padding:8px 10px;border-bottom:1px solid var(--border);vertical-align:top}'
    + 'th{font-size:.72rem;text-transform:uppercase;letter-spacing:.05em;color:var(--muted)}'
    + 'input,select,textarea{font:inherit;padding:8px 10px;border:1px solid var(--border);border-radius:8px;background:var(--surface);color:var(--text);width:100%;max-width:100%;box-sizing:border-box}'
    + 'label{display:block;font-weight:600;font-size:.85rem;margin:10px 0 4px}'
    + '.btn-admin{font:inherit;font-weight:700;padding:9px 16px;border-radius:999px;border:1px solid transparent;background:linear-gradient(135deg,var(--glow),var(--accent-strong));color:#2A1B06;cursor:pointer}'
    + '.btn-sec{background:var(--surface);border:1px solid var(--border);color:var(--text);text-decoration:none;display:inline-block}'
    + '.msg{padding:10px 14px;border-radius:10px;margin-bottom:16px;border:1px solid var(--border)}'
    + '.msg.ok{background:#e9f7ef;color:#1f7a4d}.msg.err{background:#fdeaea;color:#b4232a}'
    + '.row2{display:grid;grid-template-columns:1fr 1fr;gap:14px}@media(max-width:680px){.row2{grid-template-columns:1fr}}'
    + '.pers{color:var(--accent-strong);font-size:.85rem}'
    + '.tools{display:flex;gap:10px;flex-wrap:wrap;align-items:center;margin-bottom:16px}'
    + 'a{color:var(--accent-strong)}';

  return '<!doctype html><html lang="it"><head>'
    + '<meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">'
    + '<title>' + esc(o.title || 'Admin') + ' | UcisLumen</title>'
    + '<meta name="robots" content="noindex, nofollow">'
    + '<link rel="icon" href="/img/logo.svg" type="image/svg+xml">'
    + '<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>'
    + '<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,600;12..96,700&amp;family=Hanken+Grotesk:wght@400;500;600;700&amp;display=swap">'
    + '<link rel="stylesheet" href="/css/style.css"><link rel="stylesheet" href="/css/type.css">'
    + '<style>' + css + '</style></head><body>'
    + '<div class="admin-bar"><div class="inner"><span class="brand">UcisLumen · Admin</span><nav>' + nav + '</nav></div></div>'
    + '<main class="admin-main">' + (o.body || '') + '</main></body></html>';
}
