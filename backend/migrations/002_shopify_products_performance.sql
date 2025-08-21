-- Migration: Shopify Products and Performance Data
-- Date: 2025-01-21
-- Description: Create comprehensive product management tables for Shopify integration

-- 1. Update products table to handle Shopify data
DROP TABLE IF EXISTS products_old;
ALTER TABLE products RENAME TO products_old;

CREATE TABLE IF NOT EXISTS products (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  shopify_id TEXT UNIQUE,
  name TEXT NOT NULL,
  handle TEXT,
  sku TEXT,
  barcode TEXT,
  vendor TEXT,
  product_type TEXT,
  status TEXT DEFAULT 'active',
  
  -- Pricing
  price REAL,
  compare_at_price REAL,
  cost REAL,
  
  -- Inventory
  inventory_quantity INTEGER DEFAULT 0,
  inventory_tracked BOOLEAN DEFAULT 1,
  
  -- Organization
  category TEXT,
  tags TEXT, -- JSON array as text
  collections TEXT, -- JSON array as text
  
  -- Media
  images TEXT, -- JSON array as text
  featured_image TEXT,
  
  -- Content
  description TEXT,
  description_html TEXT,
  
  -- SEO
  seo_title TEXT,
  seo_description TEXT,
  
  -- Shipping
  weight REAL,
  weight_unit TEXT DEFAULT 'kg',
  requires_shipping BOOLEAN DEFAULT 1,
  
  -- Variants info
  has_variants BOOLEAN DEFAULT 0,
  variants_count INTEGER DEFAULT 1,
  total_inventory INTEGER DEFAULT 0,
  
  -- Metadata
  source TEXT DEFAULT 'manual', -- 'shopify', 'manual', 'csv'
  shopify_created_at DATETIME,
  shopify_updated_at DATETIME,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  last_synced_at DATETIME
);

-- 2. Product Variants table (for products with multiple variants)
CREATE TABLE IF NOT EXISTS product_variants (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  product_id INTEGER NOT NULL,
  shopify_variant_id TEXT UNIQUE,
  title TEXT,
  sku TEXT,
  barcode TEXT,
  position INTEGER,
  
  -- Options
  option1 TEXT,
  option2 TEXT,
  option3 TEXT,
  
  -- Pricing
  price REAL,
  compare_at_price REAL,
  cost REAL,
  
  -- Inventory
  inventory_quantity INTEGER DEFAULT 0,
  inventory_item_id TEXT,
  
  -- Physical
  weight REAL,
  weight_unit TEXT,
  
  -- Status
  available BOOLEAN DEFAULT 1,
  
  -- Metadata
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
);

-- 3. Product Performance table (daily/weekly/monthly aggregated data)
CREATE TABLE IF NOT EXISTS product_performance (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  product_id INTEGER NOT NULL,
  date DATE NOT NULL,
  period_type TEXT DEFAULT 'daily', -- 'daily', 'weekly', 'monthly'
  
  -- Sales Metrics
  units_sold INTEGER DEFAULT 0,
  revenue REAL DEFAULT 0,
  gross_profit REAL DEFAULT 0,
  margin_percentage REAL DEFAULT 0,
  
  -- Returns & Refunds
  returns_count INTEGER DEFAULT 0,
  returns_value REAL DEFAULT 0,
  refunds_count INTEGER DEFAULT 0,
  refunds_value REAL DEFAULT 0,
  
  -- Conversion Metrics
  views INTEGER DEFAULT 0,
  add_to_carts INTEGER DEFAULT 0,
  conversion_rate REAL DEFAULT 0,
  cart_abandonment_rate REAL DEFAULT 0,
  
  -- Inventory Metrics
  stock_level INTEGER DEFAULT 0,
  stockout_days INTEGER DEFAULT 0,
  
  -- Cost Metrics
  ad_spend REAL DEFAULT 0,
  cac REAL DEFAULT 0, -- Customer Acquisition Cost
  roas REAL DEFAULT 0, -- Return on Ad Spend
  
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
  UNIQUE(product_id, date, period_type)
);

-- 4. Product Scores table (for creative performance tracking)
CREATE TABLE IF NOT EXISTS product_scores (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  product_id INTEGER NOT NULL,
  date DATE NOT NULL,
  
  -- Test Category Scores (1-10)
  vct_score INTEGER,
  act_score INTEGER,
  rct_score INTEGER,
  overall_score REAL,
  
  -- Performance Indicators
  performance_tier TEXT, -- 'top', 'good', 'average', 'poor'
  recommendation TEXT,
  
  -- Review & Notes
  media_buyer_review TEXT,
  performance_notes TEXT,
  creative_feedback TEXT,
  
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  reviewed_by TEXT,
  reviewed_at DATETIME,
  
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
  UNIQUE(product_id, date)
);

-- 5. Shopify Sync Log (for tracking sync operations)
CREATE TABLE IF NOT EXISTS shopify_sync_log (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  sync_type TEXT NOT NULL, -- 'products', 'orders', 'customers', 'inventory'
  status TEXT NOT NULL, -- 'started', 'completed', 'failed'
  records_processed INTEGER DEFAULT 0,
  records_created INTEGER DEFAULT 0,
  records_updated INTEGER DEFAULT 0,
  records_failed INTEGER DEFAULT 0,
  error_message TEXT,
  started_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  completed_at DATETIME,
  duration_seconds INTEGER
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_products_shopify_id ON products(shopify_id);
CREATE INDEX IF NOT EXISTS idx_products_status ON products(status);
CREATE INDEX IF NOT EXISTS idx_products_vendor ON products(vendor);
CREATE INDEX IF NOT EXISTS idx_product_variants_product_id ON product_variants(product_id);
CREATE INDEX IF NOT EXISTS idx_product_performance_product_date ON product_performance(product_id, date);
CREATE INDEX IF NOT EXISTS idx_product_scores_product_date ON product_scores(product_id, date);

-- Migrate existing data if any
INSERT INTO products (name, sku, category, description, price, inventory_quantity, status, vendor, created_at, updated_at)
SELECT name, sku, category, description, price, stock, status, supplier, created_at, updated_at
FROM products_old WHERE EXISTS (SELECT 1 FROM products_old);

DROP TABLE IF EXISTS products_old;