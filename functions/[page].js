import { renderPage, htmlResponse } from '../lib/layout.js';

// Nota: tutti i testi legali sono BOZZE standard da far verificare prima della
// pubblicazione definitiva. I segnaposto [DA COMPLETARE] vanno sostituiti con i
// dati aziendali reali.
const DRAFT = `<div class='notice'>⚠️ Bozza Fase 0 — testo standard da far verificare e completare prima della pubblicazione. Ultimo aggiornamento: ottobre 2026.</div>`;

const PAGES = {
  'come-funziona': {
    title: 'Come funziona',
    description: 'Come acquistare su UcisLumen: scelta, personalizzazione, anteprima del bozzetto e consegna.',
    html: `
      <h2>Acquistare in 3 passaggi</h2>
      <h3>1. Scegli e personalizza</h3>
      <p>Scegli il prodotto e la misura. Per le lampade personalizzate scrivi il nome o la dedica: vedi subito un'anteprima a schermo di come apparirà la tua luce.</p>
      <h3>2. Approvi il bozzetto</h3>
      <p>Per i prodotti personalizzati, dopo l'ordine ti inviamo via email un bozzetto grafico. La produzione parte solo dopo la tua approvazione, così eviti sorprese.</p>
      <h3>3. Ricevi a casa</h3>
      <p>Realizziamo e spediamo il tuo ordine con tracciamento. Prima della spedizione ti inviamo anche una foto del prodotto finito.</p>
      <h2>Domande frequenti</h2>
      <h3>Quanto tempo ci vuole?</h3>
      <p>I tempi indicativi sono riportati su ogni prodotto e comprendono lavorazione e trasporto. Per i prodotti personalizzati il conteggio parte dall'approvazione del bozzetto.</p>
      <h3>Come pago?</h3>
      <p>Il pagamento avviene con carta tramite Stripe, su pagina sicura. I dati della carta non transitano dal nostro sito.</p>
      <h3>Posso modificare o annullare un ordine personalizzato?</h3>
      <p>Sì, finché non hai approvato il bozzetto. Dopo l'avvio della produzione, trattandosi di un prodotto su misura, non è più possibile annullare (vedi <a href='/recesso'>Diritto di recesso</a>).</p>
    `,
  },
  'spedizioni-e-resi': {
    title: 'Spedizioni e resi',
    description: 'Tempi di spedizione, tracciamento, dazi doganali e politica di reso di UcisLumen.',
    html: DRAFT + `
      <h2>Spedizioni</h2>
      <p>Spediamo in Italia. I tempi stimati (lavorazione + trasporto) sono indicati su ciascun prodotto e non sono vincolanti. Ricevi il codice di tracciamento via email appena l'ordine parte.</p>
      <h3>Dazi e IVA per spedizioni extra-UE</h3>
      <p>Alcuni articoli possono essere spediti da fuori dall'Unione Europea. In questi casi possono essere applicati <strong>dazi doganali o IVA all'importazione a carico del destinatario</strong>. Te lo segnaliamo in modo chiaro per evitare sorprese.</p>
      <h2>Resi e rimborsi</h2>
      <p>Se il prodotto arriva <strong>difettoso o danneggiato</strong>, contattaci entro 14 giorni dalla consegna a [DA COMPLETARE: email] allegando foto: troviamo subito una soluzione (sostituzione o rimborso).</p>
      <p>Per i resi di prodotti non personalizzati, data la natura della spedizione, in molti casi applichiamo il <strong>rimborso senza reso fisico</strong> (non ti chiediamo di rispedire l'articolo). Le modalità ti vengono comunicate via email caso per caso.</p>
      <h3>Prodotti personalizzati</h3>
      <p>I prodotti realizzati su misura (es. neon con nome) <strong>non sono rimborsabili</strong> salvo difetto di fabbricazione, come previsto dall'art. 59 del Codice del Consumo. Vedi <a href='/recesso'>Diritto di recesso</a>.</p>
    `,
  },
  'contatti': {
    title: 'Contatti',
    description: 'Come contattare UcisLumen per assistenza su ordini, personalizzazioni e resi.',
    html: `
      <h2>Scrivici</h2>
      <p>Per domande su ordini, personalizzazioni, spedizioni o resi scrivici a:</p>
      <p><strong>Email:</strong> [DA COMPLETARE: indirizzo email di assistenza]</p>
      <p>Rispondiamo di norma entro 1-2 giorni lavorativi. Indica sempre il numero d'ordine (formato UL-XXXX) se hai già acquistato.</p>
      <p class='muted small'>UcisLumen · [DA COMPLETARE: ragione sociale / titolare] · P.IVA [DA COMPLETARE] · [DA COMPLETARE: indirizzo].</p>
    `,
  },
  'privacy': {
    title: 'Privacy Policy',
    description: 'Informativa sul trattamento dei dati personali di UcisLumen ai sensi del GDPR.',
    html: DRAFT + `
      <h2>Titolare del trattamento</h2>
      <p>Il titolare del trattamento è [DA COMPLETARE: ragione sociale / titolare], P.IVA [DA COMPLETARE], email [DA COMPLETARE].</p>
      <h2>Quali dati raccogliamo</h2>
      <ul>
        <li>Dati di contatto e spedizione (nome, email, indirizzo, telefono) forniti durante l'ordine;</li>
        <li>Testo di personalizzazione che inserisci per i prodotti su misura;</li>
        <li>Dati relativi al pagamento, gestiti direttamente da Stripe (non conserviamo i dati della carta);</li>
        <li>Dati tecnici minimi di navigazione necessari al funzionamento del sito.</li>
      </ul>
      <h2>Finalità e base giuridica</h2>
      <p>Trattiamo i dati per evadere l'ordine ed erogare il servizio (esecuzione del contratto), per adempiere agli obblighi di legge (es. fiscali) e, ove necessario, per rispondere alle tue richieste di assistenza.</p>
      <h2>Soggetti che trattano i dati</h2>
      <ul>
        <li><strong>Stripe</strong> — elaborazione dei pagamenti;</li>
        <li><strong>Cloudflare</strong> — hosting del sito;</li>
        <li>il fornitore incaricato della produzione/spedizione, limitatamente ai dati necessari alla consegna.</li>
      </ul>
      <h2>Conservazione</h2>
      <p>Conserviamo i dati per il tempo necessario a gestire l'ordine e per gli obblighi di legge successivi.</p>
      <h2>I tuoi diritti</h2>
      <p>Puoi chiedere accesso, rettifica, cancellazione, limitazione e portabilità dei tuoi dati, e opporti al trattamento, scrivendo a [DA COMPLETARE: email]. Puoi inoltre proporre reclamo al Garante per la protezione dei dati personali.</p>
    `,
  },
  'cookie-policy': {
    title: 'Cookie Policy',
    description: 'Informativa sui cookie e sulle tecnologie simili utilizzate da UcisLumen.',
    html: DRAFT + `
      <h2>Cookie utilizzati</h2>
      <p>Al momento UcisLumen utilizza esclusivamente tecnologie <strong>tecniche e necessarie</strong> al funzionamento del sito:</p>
      <ul>
        <li>archiviazione locale (localStorage) per ricordare il contenuto del tuo carrello sul tuo dispositivo;</li>
        <li>cookie tecnici impostati da Stripe durante la procedura di pagamento, necessari per la sicurezza della transazione.</li>
      </ul>
      <p>Non utilizziamo cookie di profilazione né strumenti di tracciamento pubblicitario. Se in futuro introdurremo strumenti di statistica o marketing, questa pagina verrà aggiornata e ti verrà chiesto il consenso.</p>
    `,
  },
  'termini': {
    title: 'Termini e condizioni',
    description: 'Termini e condizioni di vendita di UcisLumen.',
    html: DRAFT + `
      <h2>Venditore</h2>
      <p>Il sito è gestito da [DA COMPLETARE: ragione sociale / titolare], P.IVA [DA COMPLETARE], email [DA COMPLETARE].</p>
      <h2>Prodotti e prezzi</h2>
      <p>I prezzi sono espressi in euro e si intendono IVA inclusa, salvo diversa indicazione. Le immagini dei prodotti sono indicative. Ci riserviamo di aggiornare prezzi e disponibilità.</p>
      <h2>Ordine e pagamento</h2>
      <p>L'ordine si conclude con il pagamento, gestito in modo sicuro tramite Stripe. Per i prodotti personalizzati la lavorazione inizia dopo l'approvazione del bozzetto.</p>
      <h2>Consegna</h2>
      <p>I tempi indicati sono stime non vincolanti. Vedi <a href='/spedizioni-e-resi'>Spedizioni e resi</a>, inclusa la nota su eventuali dazi/IVA per spedizioni extra-UE.</p>
      <h2>Diritto di recesso</h2>
      <p>Si applica quanto indicato nella pagina <a href='/recesso'>Diritto di recesso</a>, con l'esclusione prevista per i prodotti personalizzati.</p>
      <h2>Legge applicabile</h2>
      <p>Il contratto è regolato dalla legge italiana. Per i consumatori restano fermi i diritti inderogabili previsti dal Codice del Consumo.</p>
    `,
  },
  'recesso': {
    title: 'Diritto di recesso',
    description: 'Diritto di recesso di 14 giorni ed esclusioni per i prodotti personalizzati.',
    html: DRAFT + `
      <h2>Recesso di 14 giorni</h2>
      <p>Per i prodotti <strong>non personalizzati</strong>, come consumatore hai diritto di recedere dall'acquisto entro 14 giorni dalla consegna, senza dover indicare il motivo, scrivendo a [DA COMPLETARE: email].</p>
      <h2>Come funziona il rimborso</h2>
      <p>Una volta accettato il recesso, ti rimborsiamo quanto pagato. Per alcuni articoli, dato il tipo di spedizione, potremo applicare il <strong>rimborso senza richiederti il reso fisico</strong>; in caso contrario ti indicheremo come restituire il prodotto. Le eventuali spese di restituzione sono a tuo carico salvo diversa indicazione.</p>
      <h2>Esclusione per i prodotti personalizzati</h2>
      <p>Ai sensi dell'art. 59 del Codice del Consumo, il diritto di recesso <strong>non si applica</strong> ai beni realizzati su misura o chiaramente personalizzati (ad esempio le insegne al neon con nome o dedica). Resta sempre valida la garanzia legale in caso di prodotto difettoso.</p>
    `,
  },
};

export function onRequestGet(context) {
  const { env, request, params } = context;
  const page = PAGES[params.page];
  if (!page) {
    const nf = `<section class='page-hero'><div class='container'><h1>Pagina non trovata</h1></div></section><section class='section'><div class='container prose'><p>La pagina che cerchi non esiste.</p><p><a class='btn btn-primary' href='/'>Torna alla home</a></p></div></section>`;
    return htmlResponse(renderPage({ env, request, title: 'Pagina non trovata', body: nf }), 404);
  }
  const body = `<section class='page-hero'><div class='container'><h1>` + page.title + `</h1></div></section>`
    + `<section class='section'><div class='container prose'>` + page.html + `</div></section>`;
  return htmlResponse(renderPage({
    env, request,
    title: page.title,
    description: page.description,
    canonicalPath: '/' + params.page,
    body,
  }));
}
