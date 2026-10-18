# UcisLumen

Shop **home living** (illuminazione decorativa) per il mercato italiano, costruito su
**Cloudflare Pages + D1 + Stripe**. Modello dropshipping, gestito manualmente nella
fase a basso volume.

> Brand: **UcisLumen** - dominio di destinazione `ucislumen.it`.
> ⚠️ **Da confermare:** il repository si chiama `ucilumen` (senza la "s"), nome diverso
> dal dominio `ucislumen.it`. Verificare con Andrea se e' un refuso prima di collegare il
> dominio.

## Nicchia

Due filoni sotto lo stesso tema "luce":

1. **Illuminazione personalizzata da regalo** (`personalized_gift`) - lampade/neon con
   nome o dedica. Motore di crescita SEO principale.
2. **Mood lighting** (`mood_lighting`) - lampade luna 3D, proiettori tramonto. Catalogo
   ad ampio raggio / cross-sell.

## Stack & architettura

- **Cloudflare Pages** serve il sito. Deploy tramite integrazione Git (GitHub -> Cloudflare),
  non via Wrangler manuale.
- **Pages Functions** (cartella `functions/`) generano l'HTML lato server interrogando D1.
  La resa server-side e' voluta: e' fondamentale per la **SEO organica**, che e' l'intera
  strategia di crescita.
- **D1** (`homeliving-shop-catalog`) e' il database del catalogo e degli ordini.
- **Stripe Checkout** gestisce i pagamenti (in questa fase in modalita' TEST). Non si usa
  l'SDK Node: le Functions chiamano direttamente l'API REST di Stripe via `fetch`.

```
/
├── wrangler.toml          # config Pages + binding D1 (source of truth)
├── schema.sql             # DDL del catalogo e degli ordini
├── seed.sql               # prodotti segnaposto
├── lib/                   # moduli condivisi (NON instradati: fuori da functions/)
│   ├── layout.js          # layout HTML, header/footer, meta SEO
│   ├── components.js      # card prodotto e frammenti riutilizzabili
│   ├── db.js              # query D1
│   ├── catalog.js         # mappatura categorie <-> slug URL
│   └── stripe.js          # client REST Stripe + verifica firma webhook
├── functions/             # Pages Functions (una route per file)
│   ├── _middleware.js     # header di sicurezza
│   ├── index.js           # home (/)
│   ├── categoria/[slug].js
│   ├── prodotto/[slug].js
│   ├── carrello.js
│   ├── ordine-confermato.js
│   ├── privacy.js, cookie-policy.js, termini.js, recesso.js,
│   │   spedizioni-e-resi.js, contatti.js   # pagine legali/segnaposto
│   ├── api/
│   │   ├── checkout.js        # POST: crea la sessione Stripe Checkout
│   │   └── stripe-webhook.js  # POST: crea l'ordine su D1 a pagamento riuscito
│   ├── robots.txt.js
│   └── sitemap.xml.js
└── public/                # asset statici (output dir)
    ├── css/style.css
    ├── js/                # JS lato client (carrello, pagina prodotto)
    └── img/               # immagini segnaposto (SVG)
```

## Database (D1)

Database gia' creato: `homeliving-shop-catalog`
(uuid `4d2c07cd-da8e-4b3a-a6bd-a9252c470691`, regione Western Europe).

Applicare schema e dati segnaposto (una tantum, dopo aver installato le dipendenze):

```bash
npm install
npm run db:schema   # crea le tabelle sul DB remoto
npm run db:seed     # inserisce i 3 prodotti segnaposto
```

Per lo sviluppo locale usa le varianti `:local`.

### Tabelle

- `products` - catalogo (slug, nome, categoria, prezzo base, fornitore, costo, tempi di
  spedizione, flag personalizzazione manuale, immagine, attivo).
- `product_variants` - formati/taglie con prezzo e `max_letters` (per i prodotti
  personalizzati).
- `orders` - ordini, con workflow di stato:
  `pending_fulfillment -> design_sent_to_supplier -> awaiting_customer_approval ->
  in_production -> shipped -> delivered` (+ `refunded` / `cancelled`).

## Stripe (modalita' TEST)

Impostare questi **secret** nel progetto Pages
(dashboard: *Settings > Variables and Secrets*, oppure `wrangler pages secret put`):

| Nome | Valore |
|------|--------|
| `STRIPE_SECRET_KEY` | chiave segreta di test (inizia con `sk_test_`) |
| `STRIPE_WEBHOOK_SECRET` | secret dell'endpoint webhook (inizia con `whsec_`) |

Configurare su Stripe un **endpoint webhook** verso
`https://<dominio>/api/stripe-webhook` in ascolto sull'evento
`checkout.session.completed`. A pagamento riuscito la Function crea la riga in `orders`.

Il flusso di pagamento valida **sempre i prezzi lato server** (rilettura da D1): i prezzi
inviati dal client non vengono mai considerati affidabili.

## Deploy su Cloudflare Pages

1. Collegare il repository GitHub al progetto Pages (risolvere l'errore *"Missing git
   connection"* autorizzando la GitHub App "Cloudflare Workers and Pages" sul repo
   `dreanquero-rgb/ucilumen`).
2. Impostazioni di build:
   - **Framework preset:** None
   - **Build command:** *(vuoto)*
   - **Build output directory:** `public` (gia' definito da `wrangler.toml`).
3. Il binding D1 e' gia' definito in `wrangler.toml`. Impostare i secret Stripe come sopra.
4. Deploy. L'anteprima sara' su `https://ucilumen.pages.dev`.

### Dominio (Fase 1)

Collegare `ucislumen.it` al progetto Pages (DNS su Cloudflare) e aggiornare
`SITE_URL` in `wrangler.toml` a `https://ucislumen.it`.

## SEO

- HTML reso lato server con `<title>`, meta description e URL puliti per ogni pagina.
- `robots.txt` e `sitemap.xml` generati dinamicamente (`/robots.txt`, `/sitemap.xml`).
- Dati strutturati JSON-LD (`Product` / `Offer`) nelle pagine prodotto.
- Link canonici basati su `SITE_URL`.

## Gestione ordini (manuale, Fase 3)

Gli ordini arrivano in `orders` con stato `pending_fulfillment`. Il flusso operativo
manuale segue gli stati della tabella fino a `delivered`. Resi: policy di rimborso senza
reso fisico (vedi pagina *Spedizioni e resi*).

## Problemi / decisioni aperte

- ⚠️ Nome repo `ucilumen` vs dominio `ucislumen.it` - da confermare.
- ⚠️ Fatturazione Keliweb (Proforma n. 1162434) da risolvere prima di pagare il dominio.
- ⚠️ Cloudflare Pages: autorizzare la GitHub App per abilitare il deploy da Git.
- Testi legali attuali = **segnaposto**. Da sostituire con i testi definitivi in Fase 1.
- Immagini prodotto = SVG segnaposto. Da sostituire con foto reali (JPG/PNG) in Fase 1.
- Dazi/IVA extra-UE sugli ordini spediti dalla Cina: da chiarire in policy.
