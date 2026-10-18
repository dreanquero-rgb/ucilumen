-- Prodotti segnaposto per la Fase 0 (prezzi in centesimi di euro).
-- Idempotente: INSERT OR IGNORE con id espliciti, puo' essere rieseguito.
-- Applica con:  npm run db:seed      (remoto)
--               npm run db:seed:local (locale)
--
-- NOTA: catalogo di prova. I testi, i prezzi e i fornitori reali vanno
-- sostituiti in Fase 1.

-- 1) Lampada neon personalizzata (motore SEO principale).
INSERT OR IGNORE INTO products
  (id, slug, name, category, description, base_price_cents, supplier_name, supplier_url, supplier_cost_cents, shipping_days_min, shipping_days_max, requires_manual_personalization, image_url, active)
VALUES
  (1, 'lampada-neon-led-personalizzata', 'Lampada Neon LED Personalizzata con Nome', 'personalized_gift',
   'Insegna al neon LED con il nome o la dedica che scegli tu. Perfetta come regalo di nascita, battesimo, compleanno o per decorare cameretta e casa con una luce calda e soffusa. Ogni pezzo viene realizzato su misura: dopo l''ordine ti inviamo un''anteprima grafica da approvare prima della produzione.',
   3990, 'AliExpress - Custom Neon Sign Store', 'https://www.aliexpress.com/', 1600, 10, 18, 1,
   '/img/neon-personalizzata.svg', 1);

INSERT OR IGNORE INTO product_variants (id, product_id, variant_label, price_cents, max_letters, active) VALUES
  (1, 1, '25 cm - fino a 4 lettere', 3990, 4, 1),
  (2, 1, '40 cm - fino a 7 lettere', 5490, 7, 1),
  (3, 1, '55 cm - fino a 10 lettere', 6990, 10, 1);

-- 2) Lampada luna 3D (mood lighting).
INSERT OR IGNORE INTO products
  (id, slug, name, category, description, base_price_cents, supplier_name, supplier_url, supplier_cost_cents, shipping_days_min, shipping_days_max, requires_manual_personalization, image_url, active)
VALUES
  (2, 'lampada-luna-3d', 'Lampada Luna 3D Ricaricabile', 'mood_lighting',
   'Riproduzione realistica della superficie lunare stampata in 3D. Luce a intensita'' regolabile con tonalita'' dal bianco caldo al freddo, base in legno inclusa e ricarica USB. Crea un''atmosfera rilassante in camera o in salotto.',
   2490, 'AliExpress', 'https://www.aliexpress.com/', 900, 8, 15, 0,
   '/img/luna-3d.svg', 1);

INSERT OR IGNORE INTO product_variants (id, product_id, variant_label, price_cents, max_letters, active) VALUES
  (4, 2, 'Diametro 15 cm', 2490, NULL, 1),
  (5, 2, 'Diametro 20 cm', 3290, NULL, 1);

-- 3) Proiettore tramonto / sunset lamp (mood lighting).
INSERT OR IGNORE INTO products
  (id, slug, name, category, description, base_price_cents, supplier_name, supplier_url, supplier_cost_cents, shipping_days_min, shipping_days_max, requires_manual_personalization, image_url, active)
VALUES
  (3, 'proiettore-tramonto-sunset', 'Proiettore Luce Tramonto (Sunset Lamp)', 'mood_lighting',
   'Proietta sulle pareti un alone di luce dai toni del tramonto: arancio, rosso e rosa. Testa orientabile a 360 gradi per creare lo sfondo perfetto per foto, video e serate rilassanti.',
   1990, 'AliExpress', 'https://www.aliexpress.com/', 650, 8, 15, 0,
   '/img/sunset.svg', 1);

INSERT OR IGNORE INTO product_variants (id, product_id, variant_label, price_cents, max_letters, active) VALUES
  (6, 3, 'Formato standard', 1990, NULL, 1);
