-- Schema del catalogo UcisLumen (Cloudflare D1 / SQLite)
-- Idempotente: usa CREATE TABLE IF NOT EXISTS, puo' essere rieseguito senza rischi.
-- Applica con:  npm run db:schema      (remoto)
--               npm run db:schema:local (locale)

-- Prodotti del catalogo.
CREATE TABLE IF NOT EXISTS products (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  slug TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('personalized_gift', 'mood_lighting')),
  description TEXT,
  base_price_cents INTEGER NOT NULL,
  supplier_name TEXT,
  supplier_url TEXT,
  supplier_cost_cents INTEGER,
  shipping_days_min INTEGER,
  shipping_days_max INTEGER,
  requires_manual_personalization INTEGER NOT NULL DEFAULT 0,
  image_url TEXT,
  active INTEGER NOT NULL DEFAULT 1,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_products_category ON products (category, active);
CREATE INDEX IF NOT EXISTS idx_products_active ON products (active);

-- Varianti di prodotto (taglie / formati con prezzo e, se personalizzato,
-- numero massimo di lettere).
CREATE TABLE IF NOT EXISTS product_variants (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  product_id INTEGER NOT NULL REFERENCES products (id) ON DELETE CASCADE,
  variant_label TEXT NOT NULL,
  price_cents INTEGER NOT NULL,
  max_letters INTEGER,
  active INTEGER NOT NULL DEFAULT 1
);

CREATE INDEX IF NOT EXISTS idx_variants_product ON product_variants (product_id, active);

-- Ordini. Il workflow dello stato segue la roadmap operativa:
-- pending_fulfillment -> design_sent_to_supplier -> awaiting_customer_approval
--   -> in_production -> shipped -> delivered
-- piu' gli stati terminali refunded / cancelled.
CREATE TABLE IF NOT EXISTS orders (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  order_number TEXT NOT NULL UNIQUE,
  customer_name TEXT,
  customer_email TEXT,
  shipping_address TEXT,
  product_id INTEGER REFERENCES products (id),
  variant_id INTEGER REFERENCES product_variants (id),
  personalization_text TEXT,
  quantity INTEGER NOT NULL DEFAULT 1,
  total_paid_cents INTEGER,
  stripe_payment_id TEXT,
  status TEXT NOT NULL DEFAULT 'pending_fulfillment' CHECK (status IN (
    'pending_fulfillment',
    'design_sent_to_supplier',
    'awaiting_customer_approval',
    'in_production',
    'shipped',
    'delivered',
    'refunded',
    'cancelled'
  )),
  supplier_order_reference TEXT,
  tracking_number TEXT,
  notes TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_orders_status ON orders (status);
CREATE INDEX IF NOT EXISTS idx_orders_stripe ON orders (stripe_payment_id);
CREATE INDEX IF NOT EXISTS idx_orders_email ON orders (customer_email);
