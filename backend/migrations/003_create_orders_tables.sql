-- Create orders table
CREATE TABLE IF NOT EXISTS orders (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  shopify_id TEXT UNIQUE,
  order_number TEXT,
  customer_name TEXT,
  customer_email TEXT,
  customer_phone TEXT,
  financial_status TEXT,
  fulfillment_status TEXT,
  total_price REAL,
  subtotal_price REAL,
  total_tax REAL,
  total_discounts REAL,
  total_shipping REAL,
  total_refunded REAL,
  currency TEXT,
  note TEXT,
  customer_note TEXT,
  tags TEXT,
  source TEXT,
  channel TEXT,
  shipping_address TEXT,
  billing_address TEXT,
  shipping_method TEXT,
  tracking_number TEXT,
  carrier TEXT,
  created_at TEXT,
  processed_at TEXT,
  fulfilled_at TEXT,
  cancelled_at TEXT,
  updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
  synced_at TEXT DEFAULT CURRENT_TIMESTAMP
);

-- Create order_items table
CREATE TABLE IF NOT EXISTS order_items (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  order_id INTEGER,
  shopify_id TEXT,
  product_id TEXT,
  variant_id TEXT,
  name TEXT,
  variant_title TEXT,
  sku TEXT,
  quantity INTEGER,
  price REAL,
  cost REAL,
  total_discount REAL,
  fulfillment_status TEXT,
  image TEXT,
  properties TEXT,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_orders_shopify_id ON orders(shopify_id);
CREATE INDEX IF NOT EXISTS idx_orders_order_number ON orders(order_number);
CREATE INDEX IF NOT EXISTS idx_orders_customer_email ON orders(customer_email);
CREATE INDEX IF NOT EXISTS idx_orders_financial_status ON orders(financial_status);
CREATE INDEX IF NOT EXISTS idx_orders_fulfillment_status ON orders(fulfillment_status);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at);
CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_order_items_product_id ON order_items(product_id);