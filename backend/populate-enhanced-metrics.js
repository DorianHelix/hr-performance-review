const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const db = new sqlite3.Database(path.join(__dirname, 'database.db'));

console.log('🚀 Populating enhanced product performance metrics...');

// First, ensure the enhanced table exists
db.run(`
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
    
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    
    UNIQUE(product_id, date)
  )
`, (err) => {
  if (err) {
    console.error('Error creating enhanced table:', err);
    return;
  }
  
  // Clear existing data
  db.run('DELETE FROM product_performance_enhanced', (err) => {
    if (err) console.error('Error clearing data:', err);
    
    // Populate from existing product_performance data with cost calculations
    const query = `
      INSERT INTO product_performance_enhanced (
        product_id, date,
        gross_sales, net_sales, total_sales, units_sold, orders_count,
        total_discounts, discount_percentage,
        total_cost, gross_profit, net_profit, margin_percentage,
        average_order_value, fulfilled_orders, unfulfilled_orders
      )
      SELECT 
        pp.product_id,
        pp.date,
        pp.revenue as gross_sales,
        pp.revenue * 0.95 as net_sales, -- Assuming 5% discounts on average
        pp.revenue as total_sales,
        pp.units_sold,
        pp.orders_count,
        pp.revenue * 0.05 as total_discounts,
        5.0 as discount_percentage,
        COALESCE(p.cost, pp.revenue * 0.4) * pp.units_sold as total_cost,
        pp.revenue - (COALESCE(p.cost, pp.revenue * 0.4) * pp.units_sold) as gross_profit,
        pp.revenue - (COALESCE(p.cost, pp.revenue * 0.4) * pp.units_sold) - (pp.revenue * 0.1) as net_profit,
        CASE 
          WHEN pp.revenue > 0 
          THEN ((pp.revenue - (COALESCE(p.cost, pp.revenue * 0.4) * pp.units_sold)) / pp.revenue) * 100
          ELSE 0 
        END as margin_percentage,
        CASE 
          WHEN pp.orders_count > 0 
          THEN pp.revenue / pp.orders_count 
          ELSE 0 
        END as average_order_value,
        pp.orders_count as fulfilled_orders,
        0 as unfulfilled_orders
      FROM product_performance pp
      LEFT JOIN products p ON pp.product_id = p.shopify_id
    `;
    
    db.run(query, function(err) {
      if (err) {
        console.error('❌ Error populating enhanced metrics:', err);
      } else {
        console.log(`✅ Enhanced metrics populated: ${this.changes} records created`);
        
        // Update summary statistics
        db.get('SELECT COUNT(DISTINCT product_id) as products, COUNT(*) as records FROM product_performance_enhanced', (err, row) => {
          if (!err) {
            console.log(`📊 Summary: ${row.products} products, ${row.records} daily records`);
          }
        });
        
        // Show sample data
        db.all(`
          SELECT 
            product_id,
            SUM(gross_sales) as total_gross,
            SUM(net_sales) as total_net,
            SUM(total_cost) as total_cogs,
            SUM(gross_profit) as total_profit,
            AVG(margin_percentage) as avg_margin
          FROM product_performance_enhanced
          GROUP BY product_id
          LIMIT 5
        `, (err, rows) => {
          if (!err && rows.length > 0) {
            console.log('\n📈 Sample Product Metrics:');
            rows.forEach(row => {
              console.log(`  Product ${row.product_id}:`);
              console.log(`    Gross Sales: ${row.total_gross?.toFixed(2) || 0}`);
              console.log(`    COGS: ${row.total_cogs?.toFixed(2) || 0}`);
              console.log(`    Profit: ${row.total_profit?.toFixed(2) || 0}`);
              console.log(`    Margin: ${row.avg_margin?.toFixed(2) || 0}%`);
            });
          }
          
          db.close();
        });
      }
    });
  });
});