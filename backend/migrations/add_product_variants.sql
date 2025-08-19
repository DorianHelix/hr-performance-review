-- Add variant support to products table
ALTER TABLE products ADD COLUMN handle TEXT;
ALTER TABLE products ADD COLUMN parent_id TEXT;
ALTER TABLE products ADD COLUMN variant_name TEXT;
ALTER TABLE products ADD COLUMN variant_price REAL;
ALTER TABLE products ADD COLUMN cost_per_item REAL;
ALTER TABLE products ADD COLUMN variant_sku TEXT;
ALTER TABLE products ADD COLUMN is_variant BOOLEAN DEFAULT 0;
ALTER TABLE products ADD COLUMN images TEXT; -- JSON array of image URLs

-- Create index for faster variant queries
CREATE INDEX IF NOT EXISTS idx_products_handle ON products(handle);
CREATE INDEX IF NOT EXISTS idx_products_parent_id ON products(parent_id);