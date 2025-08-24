#!/usr/bin/env node

/**
 * Database Initialization Script
 * Run this after cloning or when database is corrupted:
 * 
 * npm run db:init     - Initialize with empty database
 * npm run db:seed     - Initialize with sample data
 */

import Database from 'better-sqlite3';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuration
const DB_PATH = path.join(__dirname, 'helix.db');
const BACKUP_DIR = path.join(__dirname, 'backups');
const SEED_DATA = process.argv.includes('--seed');

console.log('🚀 Database Initialization Script');
console.log('=================================');

// 1. Backup existing database if it exists
if (fs.existsSync(DB_PATH)) {
  console.log('📦 Backing up existing database...');
  
  if (!fs.existsSync(BACKUP_DIR)) {
    fs.mkdirSync(BACKUP_DIR, { recursive: true });
  }
  
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const backupPath = path.join(BACKUP_DIR, `helix-backup-${timestamp}.db`);
  
  fs.copyFileSync(DB_PATH, backupPath);
  console.log(`✅ Backup saved to: ${backupPath}`);
  
  // Remove old database
  fs.unlinkSync(DB_PATH);
  console.log('🗑️  Old database removed');
}

// 2. Create new database
console.log('🔨 Creating new database...');
const db = new Database(DB_PATH);

// Enable foreign keys
db.pragma('foreign_keys = ON');

// 3. Create ALL tables (combining both schemas)
console.log('📊 Creating tables...');

// === EXPERIMENT TABLES (from database/helix.db) ===
db.exec(`
  -- Test Types table
  CREATE TABLE IF NOT EXISTS test_types (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    short_name TEXT NOT NULL,
    description TEXT,
    color TEXT,
    icon_name TEXT,
    display_order INTEGER DEFAULT 0,
    is_active INTEGER DEFAULT 1,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT DEFAULT CURRENT_TIMESTAMP
  );

  -- Platforms table
  CREATE TABLE IF NOT EXISTS platforms (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    icon_name TEXT,
    color TEXT,
    display_order INTEGER DEFAULT 0,
    is_active INTEGER DEFAULT 1,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT DEFAULT CURRENT_TIMESTAMP
  );

  -- Test Type-Platform mapping
  CREATE TABLE IF NOT EXISTS test_type_platforms (
    test_type_id TEXT NOT NULL,
    platform_id TEXT NOT NULL,
    is_default INTEGER DEFAULT 0,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (test_type_id, platform_id),
    FOREIGN KEY (test_type_id) REFERENCES test_types(id) ON DELETE CASCADE,
    FOREIGN KEY (platform_id) REFERENCES platforms(id) ON DELETE CASCADE
  );

  -- Experiments table
  CREATE TABLE IF NOT EXISTS experiments (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    test_type_id TEXT NOT NULL,
    platform_id TEXT NOT NULL,
    start_date TEXT NOT NULL,
    end_date TEXT,
    status TEXT DEFAULT 'draft',
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (test_type_id) REFERENCES test_types(id),
    FOREIGN KEY (platform_id) REFERENCES platforms(id)
  );

  -- Creative Scores table
  CREATE TABLE IF NOT EXISTS creative_scores (
    id TEXT PRIMARY KEY,
    product_id TEXT NOT NULL,
    test_type_id TEXT NOT NULL,
    platform_id TEXT NOT NULL,
    evaluation_date TEXT NOT NULL,
    score INTEGER CHECK (score >= 1 AND score <= 10),
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (test_type_id) REFERENCES test_types(id),
    FOREIGN KEY (platform_id) REFERENCES platforms(id)
  );

  -- Employees table
  CREATE TABLE IF NOT EXISTS employees (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    position TEXT,
    department TEXT,
    manager_id INTEGER,
    email TEXT,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (manager_id) REFERENCES employees(id)
  );

  -- General scores table
  CREATE TABLE IF NOT EXISTS scores (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    score INTEGER,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
  );
`);

// === SHOPIFY TABLES (from backend/database.db) ===
db.exec(`
  -- Products table
  CREATE TABLE IF NOT EXISTS products (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    shopify_id TEXT UNIQUE,
    name TEXT NOT NULL,
    handle TEXT,
    sku TEXT,
    vendor TEXT,
    product_type TEXT,
    category TEXT,
    description TEXT,
    description_html TEXT,
    price REAL,
    compare_at_price REAL,
    cost REAL,
    inventory_quantity INTEGER,
    min_stock INTEGER,
    status TEXT DEFAULT 'active',
    supplier TEXT,
    tags TEXT,
    images TEXT,
    featured_image TEXT,
    seo_title TEXT,
    seo_description TEXT,
    weight REAL,
    weight_unit TEXT,
    requires_shipping BOOLEAN,
    has_variants BOOLEAN,
    variants_count INTEGER,
    total_inventory INTEGER,
    source TEXT,
    shopify_created_at DATETIME,
    shopify_updated_at DATETIME,
    last_synced_at DATETIME,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  -- Product variants table
  CREATE TABLE IF NOT EXISTS product_variants (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    product_id INTEGER NOT NULL,
    shopify_variant_id TEXT,
    title TEXT,
    sku TEXT,
    barcode TEXT,
    position INTEGER,
    price REAL,
    compare_at_price REAL,
    cost REAL,
    inventory_quantity INTEGER,
    weight REAL,
    weight_unit TEXT,
    option1 TEXT,
    option2 TEXT,
    option3 TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
  );

  -- Orders table
  CREATE TABLE IF NOT EXISTS orders (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    shopify_id TEXT UNIQUE,
    order_number TEXT,
    customer_name TEXT,
    customer_email TEXT,
    customer_phone TEXT,
    status TEXT,
    financial_status TEXT,
    fulfillment_status TEXT,
    total_price REAL,
    subtotal_price REAL,
    total_tax REAL,
    total_discounts REAL,
    total_shipping REAL,
    currency TEXT,
    notes TEXT,
    tags TEXT,
    order_date DATETIME,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  -- Order items table
  CREATE TABLE IF NOT EXISTS order_items (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    order_id INTEGER NOT NULL,
    shopify_id TEXT,
    product_id TEXT,
    variant_id TEXT,
    title TEXT,
    sku TEXT,
    quantity INTEGER,
    price REAL,
    total_discount REAL,
    tax_lines TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE
  );

  -- Settings table
  CREATE TABLE IF NOT EXISTS settings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    key TEXT UNIQUE NOT NULL,
    value TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  -- Shopify sync log table
  CREATE TABLE IF NOT EXISTS shopify_sync_log (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    sync_type TEXT,
    status TEXT,
    records_processed INTEGER,
    records_created INTEGER,
    records_failed INTEGER,
    error_message TEXT,
    started_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    completed_at DATETIME
  );

  -- Categories table
  CREATE TABLE IF NOT EXISTS categories (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL UNIQUE,
    description TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  -- Product performance table
  CREATE TABLE IF NOT EXISTS product_performance (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    product_id INTEGER NOT NULL,
    date DATE NOT NULL,
    revenue REAL,
    units_sold INTEGER,
    profit_margin REAL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
  );

  -- Product scores table
  CREATE TABLE IF NOT EXISTS product_scores (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    product_id INTEGER NOT NULL,
    score_type TEXT NOT NULL,
    score_value REAL,
    evaluated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
  );
`);

// 4. Create indexes for better performance
console.log('🔍 Creating indexes...');
db.exec(`
  CREATE INDEX IF NOT EXISTS idx_products_shopify ON products(shopify_id);
  CREATE INDEX IF NOT EXISTS idx_orders_shopify ON orders(shopify_id);
  CREATE INDEX IF NOT EXISTS idx_orders_date ON orders(order_date);
  CREATE INDEX IF NOT EXISTS idx_experiments_status ON experiments(status);
  CREATE INDEX IF NOT EXISTS idx_experiments_dates ON experiments(start_date, end_date);
  CREATE INDEX IF NOT EXISTS idx_creative_scores_product ON creative_scores(product_id);
  CREATE INDEX IF NOT EXISTS idx_creative_scores_date ON creative_scores(evaluation_date);
`);

// 5. Insert default data
console.log('🌱 Inserting default data...');

// Default test types
const testTypes = [
  ['vct', 'Video Creative Test', 'VCT', 'Testing video creative performance', '#A78BFA', 'Video', 1],
  ['sct', 'Static Creative Test', 'SCT', 'Testing static image creative performance', '#60A5FA', 'Image', 2],
  ['act', 'Ad Copy Test', 'ACT', 'Testing ad copy effectiveness', '#34D399', 'FileText', 3],
];

const insertTestType = db.prepare(`
  INSERT OR IGNORE INTO test_types (id, name, short_name, description, color, icon_name, display_order)
  VALUES (?, ?, ?, ?, ?, ?, ?)
`);

testTypes.forEach(type => insertTestType.run(...type));

// Default platforms
const platforms = [
  ['meta', 'Meta', 'Facebook and Instagram Ads', 'Facebook', 'blue', 1],
  ['google', 'Google', 'Google Ads and YouTube', 'Chrome', 'yellow', 2],
  ['tiktok', 'TikTok', 'TikTok Ads', 'Music', 'pink', 3],
];

const insertPlatform = db.prepare(`
  INSERT OR IGNORE INTO platforms (id, name, description, icon_name, color, display_order)
  VALUES (?, ?, ?, ?, ?, ?)
`);

platforms.forEach(platform => insertPlatform.run(...platform));

// Default platform mappings
const mappings = [
  ['vct', 'meta', 1],
  ['vct', 'google', 1],
  ['vct', 'tiktok', 1],
  ['sct', 'meta', 1],
  ['sct', 'google', 1],
  ['act', 'meta', 1],
  ['act', 'google', 1],
];

const insertMapping = db.prepare(`
  INSERT OR IGNORE INTO test_type_platforms (test_type_id, platform_id, is_default)
  VALUES (?, ?, ?)
`);

mappings.forEach(mapping => insertMapping.run(...mapping));

// 6. Add seed data if requested
if (SEED_DATA) {
  console.log('🌾 Adding seed data...');
  
  // Sample products
  const sampleProducts = [
    ['Premium T-Shirt', 'premium-tshirt', 'SKU001', 'Helix Apparel', 'Apparel', 29.99, 100],
    ['Wireless Headphones', 'wireless-headphones', 'SKU002', 'Helix Electronics', 'Electronics', 89.99, 50],
    ['Organic Coffee Beans', 'organic-coffee', 'SKU003', 'Helix Coffee', 'Food & Beverage', 19.99, 200],
  ];
  
  const insertProduct = db.prepare(`
    INSERT INTO products (name, handle, sku, vendor, category, price, inventory_quantity)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `);
  
  sampleProducts.forEach(product => insertProduct.run(...product));
  
  console.log('✅ Seed data added');
}

// 7. Verify database
const tableCount = db.prepare("SELECT COUNT(*) as count FROM sqlite_master WHERE type='table'").get();
console.log(`\n✅ Database initialized with ${tableCount.count} tables`);

// 8. Show database info
const dbSize = fs.statSync(DB_PATH).size;
console.log(`📦 Database size: ${(dbSize / 1024).toFixed(2)} KB`);
console.log(`📍 Database location: ${DB_PATH}`);

// Close database
db.close();

console.log('\n🎉 Database initialization complete!');
console.log('\nNext steps:');
console.log('1. Restart your server: npm run dev:all');
console.log('2. Your app will use the new consolidated database');
console.log('3. To restore a backup: cp database/backups/[backup-file] database/helix.db');