// Invio email tramite API Resend (https://resend.com). Best-effort: se non
// configurato (manca RESEND_API_KEY) o fallisce, non solleva errori.
// Variabili d'ambiente:
//   RESEND_API_KEY   (secret)   chiave API Resend
//   EMAIL_FROM                  mittente, es. "UcisLumen <ordini@ucislumen.it>"
//   NOTIFY_EMAIL                (opz.) dove ricevere gli avvisi di nuovo ordine
//   EMAIL_REPLY_TO              (opz.) indirizzo di risposta
import { formatPrice } from './layout.js';

export function emailConfigured(env) {
  return !!(env && env.RESEND_API_KEY);
}

function fromAddress(env) {
  return (env && env.EMAIL_FROM) || 'UcisLumen <onboarding@resend.dev>';
}

export async function sendEmail(env, msg) {
  if (!emailConfigured(env)) return false;
  try {
    const body = {
      from: fromAddress(env),
      to: Array.isArray(msg.to) ? msg.to : [msg.to],
      subject: msg.subject,
      html: msg.html,
    };
    if (msg.replyTo) body.reply_to = msg.replyTo;
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { 'Authorization': 'Bearer ' + env.RESEND_API_KEY, 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    return res.ok;
  } catch (e) {
    return false;
  }
}

function esc(s) {
  return String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function shell(inner) {
  return '<div style="background:#FBF7EF;padding:24px 0;font-family:Arial,Helvetica,sans-serif;color:#241E1A">'
    + '<div style="max-width:560px;margin:0 auto;background:#FFFDF9;border:1px solid #EBE2D2;border-radius:16px;overflow:hidden">'
    + '<div style="padding:18px 24px;border-bottom:1px solid #EBE2D2;font-size:20px;font-weight:bold">UcisLumen</div>'
    + '<div style="padding:24px">' + inner + '</div>'
    + '<div style="padding:16px 24px;border-top:1px solid #EBE2D2;font-size:12px;color:#7A6E64">UcisLumen · illuminazione decorativa e lampade personalizzate</div>'
    + '</div></div>';
}

function itemsTable(items) {
  if (!items || !items.length) return '';
  const rows = items.map(function (it) {
    const pers = it.personalization
      ? '<div style="color:#C9790A;font-size:13px">Personalizzazione: “' + esc(it.personalization) + '”</div>'
      : '';
    return '<tr>'
      + '<td style="padding:8px 0;border-bottom:1px solid #EBE2D2">' + esc(it.name) + (it.variant ? ' · ' + esc(it.variant) : '') + pers + '</td>'
      + '<td style="padding:8px 0;border-bottom:1px solid #EBE2D2;text-align:right;white-space:nowrap">x' + (it.qty || 1) + '</td>'
      + '<td style="padding:8px 0;border-bottom:1px solid #EBE2D2;text-align:right;white-space:nowrap">' + formatPrice(it.lineCents) + '</td>'
      + '</tr>';
  }).join('');
  return '<table style="width:100%;border-collapse:collapse;font-size:14px;margin:12px 0">' + rows + '</table>';
}

export function customerOrderEmail(o) {
  const hello = o.name ? ('Ciao ' + esc(o.name) + ',') : 'Ciao,';
  const persNote = o.hasPersonalized
    ? '<p style="background:#F4ECDD;border-radius:10px;padding:12px 14px;font-size:14px">Per i prodotti personalizzati ti invieremo a breve un’<strong>anteprima grafica da approvare</strong> prima della produzione.</p>'
    : '';
  const total = (typeof o.totalCents === 'number')
    ? '<p style="text-align:right;font-size:16px;margin:8px 0"><strong>Totale: ' + formatPrice(o.totalCents) + '</strong></p>'
    : '';
  return shell(
    '<p style="font-size:16px;margin-top:0">' + hello + '</p>'
    + '<p>Grazie per il tuo ordine! Lo abbiamo ricevuto e il pagamento è andato a buon fine.</p>'
    + '<p style="font-size:14px;color:#7A6E64">Numero ordine: <strong style="color:#241E1A">' + esc(o.orderNumber) + '</strong></p>'
    + itemsTable(o.items)
    + total
    + persNote
    + '<p style="font-size:14px;color:#7A6E64">Ti terremo aggiornato via email sullo stato della spedizione. Per qualsiasi cosa, rispondi pure a questa email.</p>'
  );
}

export function adminOrderEmail(o) {
  const total = (typeof o.totalCents === 'number') ? (' — ' + formatPrice(o.totalCents)) : '';
  const link = o.adminUrl
    ? '<p style="margin-top:16px"><a href="' + esc(o.adminUrl) + '" style="display:inline-block;background:#E8920C;color:#231604;text-decoration:none;font-weight:bold;padding:10px 18px;border-radius:999px">Apri in Admin</a></p>'
    : '';
  return shell(
    '<p style="font-size:16px;margin-top:0"><strong>Nuovo ordine!</strong></p>'
    + '<p>Ordine <strong>' + esc(o.orderNumber) + '</strong>' + total + '</p>'
    + '<p style="font-size:14px">Cliente: ' + esc(o.name || '—') + ' (' + esc(o.email || '—') + ')</p>'
    + itemsTable(o.items)
    + link
  );
}
