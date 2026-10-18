# UcisLumen — Brand & sistema visivo

Direzione: **Luce Serena** — minimal-luxury caldo. Tanto spazio panna, ambra
usata con parsimonia come "luce del prodotto", rumore visivo quasi nullo.
Obiettivo: rassicurare chi compra un regalo e distinguersi dai packshot generici.

## Palette

### Light
| Token | Hex | Uso |
|-------|-----|-----|
| `--bg` | `#FBF7EF` | sfondo pagina (panna) |
| `--surface` | `#FFFDF9` | card, box prodotto, checkout (bianco latte) |
| `--surface-2` | `#F4ECDD` | sezioni alternate, fasce (sabbia) |
| `--text` | `#241E1A` | testo e titoli (espresso) |
| `--muted` | `#7A6E64` | testo secondario (tortora) |
| `--accent` | `#E8920C` | CTA, prezzi, badge, link (ambra) |
| `--accent-strong` | `#C9790A` | hover / stato attivo (caramello) |
| `--glow` | `#F6B24A` | SOLO aloni, focus-ring, ombre luminose (miele) |
| `--border` | `#EBE2D2` | hairline, divisori |

### Dark
| Token | Hex |
|-------|-----|
| `--bg` | `#16110C` (espresso-nero) |
| `--surface` | `#211A12` |
| `--surface-2` | `#2C2318` |
| `--text` | `#F4ECE0` |
| `--muted` | `#B3A290` |
| `--accent` | `#F2A42A` (ambra ravvivata per leggibilità) |
| `--accent-strong` | `#E8920C` |
| `--border` | `#3A2F22` |

Regola d'oro: l'ambra resta un accento parsimonioso; il **glow** vive solo come
bagliore/box-shadow degli elementi luminosi e come focus-ring, mai come riempimento
di testo o sfondo esteso.

## Tipografia

- **Titoli:** Fraunces (serif caldo variabile, ad alto contrasto) — taglio Display.
- **Corpo:** Figtree (sans umanista, ottima leggibilità mobile e diacritici IT).
- Entrambi **open-source (SIL OFL)**: vanno **self-hostati** come `.woff2` serviti
  da ucislumen.it (niente Google Fonts CDN, per il GDPR). Fallback: Georgia /
  system-ui finché i woff2 non sono caricati via `@font-face`.

## Logo

- **Wordmark** "UcisLumen" in Fraunces; il puntino della "i" di Lumen può diventare
  un piccolo orbe ambra (un punto di luce nel nome).
- **Mark** (favicon/social, `public/img/logo.svg`): una falce di luna che si chiude
  in un orbe di luce ambra con un solo alone miele — legge come neon acceso, lampada
  luna e punto di luce insieme. Niente 3D, niente bagliori aggressivi.

## Immagini

Fotografia lifestyle reale e contestuale (prodotto acceso in una stanza vera), MAI
packshot isolato su fondo bianco. Interni italiani caldi (legno chiaro, lino,
ceramica), luce 2700K calda come UNICA sorgente accesa, alone ambra naturale, molto
spazio negativo per copy e CTA. Per i personalizzati: sempre un mock-up del nome
sull'insegna nella stanza. Niente dominanti fredde/blu, niente bianco clinico.

## Asset generati (Canva)

| Asset | Canva media id |
|-------|----------------|
| Hero (cameretta, neon "Sofia") | `MAHYUqSNk4Y` |
| Banner personalizzati ("Giulia") | `MAHYUhn36uA` |
| Banner mood lighting | `MAHYUq5wvPI` |
| Logo mark | `MAHYUgzx7Do` |

> Le foto full-res sono nell'account Canva di Andrea. Per il sito vanno esportate
> ad alta risoluzione e ottimizzate (es. 1600px, JPG/WebP) prima di essere incluse.
