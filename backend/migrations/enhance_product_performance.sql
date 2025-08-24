-- Enhanced Product Performance Metrics Table
-- This migration adds comprehensive Shopify analytics metrics

-- Create new enhanced product performance table
CREATE TABLE IF NOT EXISTS product_performance_enhanced (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  product_id TEXT NOT NULL,
  date TEXT NOT NULL,
  
  -- Sales Metrics
  gross_sales REAL DEFAULT 0,
  net_sales REAL DEFAULT 0,
  total_sales REAL DEFAULT 0,
  units_sold INTEGER DEFAULT 0,
  orders_count INTEGER DEFAULT 0,
  
  -- Financial Metrics
  total_discounts REAL DEFAULT 0,
  discount_percentage REAL DEFAULT 0,
  returns_amount REAL DEFAULT 0,
  returns_count INTEGER DEFAULT 0,
  refunds_amount REAL DEFAULT 0,
  refunds_count INTEGER DEFAULT 0,
  taxes REAL DEFAULT 0,
  shipping_charges REAL DEFAULT 0,
  
  -- Cost & Profit Metrics
  total_cost REAL DEFAULT 0,
  gross_profit REAL DEFAULT 0,
  net_profit REAL DEFAULT 0,
  margin_percentage REAL DEFAULT 0,
  markup_percentage REAL DEFAULT 0,
  
  -- Customer Metrics
  unique_customers INTEGER DEFAULT 0,
  new_customers INTEGER DEFAULT 0,
  returning_customers INTEGER DEFAULT 0,
  customer_lifetime_value REAL DEFAULT 0,
  
  -- Conversion Metrics
  product_page_views INTEGER DEFAULT 0,
  add_to_cart_count INTEGER DEFAULT 0,
  cart_abandonment_count INTEGER DEFAULT 0,
  conversion_rate REAL DEFAULT 0,
  add_to_cart_rate REAL DEFAULT 0,
  
  -- Average Metrics
  average_order_value REAL DEFAULT 0,
  average_items_per_order REAL DEFAULT 0,
  average_discount_per_order REAL DEFAULT 0,
  
  -- Inventory Metrics
  beginning_inventory INTEGER DEFAULT 0,
  ending_inventory INTEGER DEFAULT 0,
  inventory_turnover REAL DEFAULT 0,
  days_of_inventory REAL DEFAULT 0,
  stockout_days INTEGER DEFAULT 0,
  
  -- Fulfillment Metrics
  fulfilled_orders INTEGER DEFAULT 0,
  unfulfilled_orders INTEGER DEFAULT 0,
  partially_fulfilled_orders INTEGER DEFAULT 0,
  fulfillment_time_hours REAL DEFAULT 0,
  
  -- Rating & Reviews
  review_count INTEGER DEFAULT 0,
  average_rating REAL DEFAULT 0,
  five_star_reviews INTEGER DEFAULT 0,
  one_star_reviews INTEGER DEFAULT 0,
  
  -- Comparison Metrics (vs Previous Period)
  sales_growth_rate REAL DEFAULT 0,
  units_growth_rate REAL DEFAULT 0,
  revenue_growth_amount REAL DEFAULT 0,
  
  -- Shopify-specific fields
  shopify_analytics_token TEXT,
  shopify_report_id TEXT,
  
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  
  UNIQUE(product_id, date),
  FOREIGN KEY (product_id) REFERENCES products(shopify_id)
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_product_performance_enhanced_product_date 
  ON product_performance_enhanced(product_id, date);
CREATE INDEX IF NOT EXISTS idx_product_performance_enhanced_date 
  ON product_performance_enhanced(date);
CREATE INDEX IF NOT EXISTS idx_product_performance_enhanced_total_sales 
  ON product_performance_enhanced(total_sales);

-- Product Analytics Summary Table (for quick access)
CREATE TABLE IF NOT EXISTS product_analytics_summary (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  product_id TEXT NOT NULL UNIQUE,
  
  -- Lifetime Metrics
  lifetime_revenue REAL DEFAULT 0,
  lifetime_units_sold INTEGER DEFAULT 0,
  lifetime_orders INTEGER DEFAULT 0,
  lifetime_customers INTEGER DEFAULT 0,
  lifetime_profit REAL DEFAULT 0,
  
  -- Last 30 Days Metrics
  last_30_days_revenue REAL DEFAULT 0,
  last_30_days_units INTEGER DEFAULT 0,
  last_30_days_orders INTEGER DEFAULT 0,
  last_30_days_growth REAL DEFAULT 0,
  
  -- Last 7 Days Metrics
  last_7_days_revenue REAL DEFAULT 0,
  last_7_days_units INTEGER DEFAULT 0,
  last_7_days_orders INTEGER DEFAULT 0,
  
  -- Rankings (compared to other products)
  revenue_rank INTEGER,
  units_rank INTEGER,
  profit_rank INTEGER,
  growth_rank INTEGER,
  
  -- Performance Scores
  overall_score REAL DEFAULT 0,
  revenue_score REAL DEFAULT 0,
  velocity_score REAL DEFAULT 0,
  profitability_score REAL DEFAULT 0,
  customer_score REAL DEFAULT 0,
  
  -- Trends
  trend_direction TEXT, -- 'up', 'down', 'stable'
  trend_strength REAL DEFAULT 0,
  seasonality_factor REAL DEFAULT 1.0,
  
  -- Best/Worst Performance
  best_day_date TEXT,
  best_day_revenue REAL DEFAULT 0,
  worst_day_date TEXT,
  worst_day_revenue REAL DEFAULT 0,
  
  -- Forecasting
  predicted_next_7_days REAL DEFAULT 0,
  predicted_next_30_days REAL DEFAULT 0,
  confidence_score REAL DEFAULT 0,
  
  last_synced_at DATETIME,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (product_id) REFERENCES products(shopify_id)
);

-- Create index for summary table
CREATE INDEX IF NOT EXISTS idx_product_analytics_summary_scores 
  ON product_analytics_summary(overall_score DESC);

-- Migrate existing data to new table
INSERT OR IGNORE INTO product_performance_enhanced (
  product_id, date, total_sales, units_sold, orders_count
)
SELECT 
  product_id, 
  date, 
  revenue as total_sales, 
  units_sold, 
  orders_count
FROM product_performance;