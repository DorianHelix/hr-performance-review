const fs = require('fs');
const readline = require('readline');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Database connection
const db = new sqlite3.Database(path.join(__dirname, 'database.db'));

// Parse JSONL files
async function parseJSONL(filePath) {
  const products = [];
  const fileStream = fs.createReadStream(filePath);
  const rl = readline.createInterface({
    input: fileStream,
    crlfDelay: Infinity
  });

  for await (const line of rl) {
    if (line.trim()) {
      products.push(JSON.parse(line));
    }
  }
  
  return products;
}

// Create Shopify metrics table
async function createShopifyMetricsTable() {
  return new Promise((resolve, reject) => {
    db.run(`
      CREATE TABLE IF NOT EXISTS shopify_metrics (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        product_title TEXT,
        product_vendor TEXT,
        product_type TEXT,
        period_type TEXT, -- 'all_time' or 'recent'
        period_start DATE,
        period_end DATE,
        net_items_sold INTEGER,
        gross_sales REAL,
        discounts REAL,
        returns REAL,
        net_sales REAL,
        taxes REAL,
        total_sales REAL,
        cost_of_goods_sold REAL,
        margin_percentage REAL,
        profit REAL,
        synced_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(product_title, period_type)
      )
    `, (err) => {
      if (err) reject(err);
      else resolve();
    });
  });
}

// Import Shopify data
async function importShopifyData() {
  console.log('🚀 IMPORTING SHOPIFY METRICS FOR 100% MATCH');
  console.log('===========================================\n');
  
  await createShopifyMetricsTable();
  
  // Clear existing data
  await new Promise((resolve) => {
    db.run('DELETE FROM shopify_metrics', resolve);
  });
  
  // Load both files
  const allTimeData = await parseJSONL('/Users/doriandaniel/Downloads/Total sales by product-7.jsonl');
  const recentData = await parseJSONL('/Users/doriandaniel/Downloads/Total sales by product-6.jsonl');
  
  console.log(`📊 Processing ${allTimeData.length} all-time products`);
  console.log(`📊 Processing ${recentData.length} recent products\n`);
  
  // Import all-time data
  for (const product of allTimeData) {
    const margin = product.net_sales > 0 
      ? ((product.net_sales - product.cost_of_goods_sold) / product.net_sales * 100)
      : 0;
    
    const profit = product.net_sales - product.cost_of_goods_sold;
    
    await new Promise((resolve, reject) => {
      db.run(`
        INSERT OR REPLACE INTO shopify_metrics (
          product_title, product_vendor, product_type, period_type,
          net_items_sold, gross_sales, discounts, returns,
          net_sales, taxes, total_sales, cost_of_goods_sold,
          margin_percentage, profit
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `, [
        product.product_title,
        product.product_vendor,
        product.product_type,
        'all_time',
        parseInt(product.net_items_sold),
        product.gross_sales,
        product.discounts,
        product.returns,
        product.net_sales,
        product.taxes,
        product.total_sales,
        product.cost_of_goods_sold,
        margin,
        profit
      ], (err) => {
        if (err) reject(err);
        else resolve();
      });
    });
  }
  
  // Import recent data
  for (const product of recentData) {
    const margin = product.net_sales > 0 
      ? ((product.net_sales - product.cost_of_goods_sold) / product.net_sales * 100)
      : 0;
    
    const profit = product.net_sales - product.cost_of_goods_sold;
    
    await new Promise((resolve, reject) => {
      db.run(`
        INSERT OR REPLACE INTO shopify_metrics (
          product_title, product_vendor, product_type, period_type,
          net_items_sold, gross_sales, discounts, returns,
          net_sales, taxes, total_sales, cost_of_goods_sold,
          margin_percentage, profit
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `, [
        product.product_title,
        product.product_vendor,
        product.product_type,
        'recent',
        parseInt(product.net_items_sold),
        product.gross_sales,
        product.discounts,
        product.returns,
        product.net_sales,
        product.taxes,
        product.total_sales,
        product.cost_of_goods_sold,
        margin,
        profit
      ], (err) => {
        if (err) reject(err);
        else resolve();
      });
    });
  }
  
  console.log('✅ Shopify metrics imported successfully\n');
}

// Update our calculations to match Shopify
async function updateOurCalculations() {
  console.log('🔧 UPDATING OUR CALCULATIONS TO MATCH SHOPIFY');
  console.log('============================================\n');
  
  // First, let's understand the date ranges
  const dateAnalysis = await new Promise((resolve, reject) => {
    db.all(`
      SELECT 
        MIN(date) as earliest_date,
        MAX(date) as latest_date,
        COUNT(DISTINCT date) as total_days,
        COUNT(DISTINCT product_id) as total_products
      FROM product_performance
    `, (err, rows) => {
      if (err) reject(err);
      else resolve(rows[0]);
    });
  });
  
  console.log('📅 Our Database Date Range:');
  console.log(`   From: ${dateAnalysis.earliest_date}`);
  console.log(`   To: ${dateAnalysis.latest_date}`);
  console.log(`   Total Days: ${dateAnalysis.total_days}`);
  console.log(`   Total Products: ${dateAnalysis.total_products}\n`);
  
  // Update product_performance_enhanced to match Shopify formulas
  console.log('📝 Applying Shopify Formula Corrections...');
  
  await new Promise((resolve, reject) => {
    db.run(`
      UPDATE product_performance_enhanced
      SET 
        -- Shopify formula: Net Sales = Gross Sales + Discounts + Returns (both negative)
        net_sales = gross_sales + COALESCE(total_discounts, 0) + COALESCE(returns_amount, 0),
        
        -- Shopify formula: Total Sales = Net Sales + Taxes
        total_sales = (gross_sales + COALESCE(total_discounts, 0) + COALESCE(returns_amount, 0)) + COALESCE(taxes, 0),
        
        -- Shopify formula: Profit = Net Sales - COGS
        net_profit = (gross_sales + COALESCE(total_discounts, 0) + COALESCE(returns_amount, 0)) - COALESCE(total_cost, 0),
        
        -- Shopify formula: Margin % = (Net Sales - COGS) / Net Sales × 100
        margin_percentage = CASE 
          WHEN (gross_sales + COALESCE(total_discounts, 0) + COALESCE(returns_amount, 0)) > 0 
          THEN (((gross_sales + COALESCE(total_discounts, 0) + COALESCE(returns_amount, 0)) - COALESCE(total_cost, 0)) 
                / (gross_sales + COALESCE(total_discounts, 0) + COALESCE(returns_amount, 0))) * 100
          ELSE 0
        END
    `, (err) => {
      if (err) reject(err);
      else resolve();
    });
  });
  
  console.log('✅ Formulas updated to match Shopify\n');
}

// Create comparison view
async function createComparisonView() {
  console.log('📊 CREATING COMPARISON VIEW');
  console.log('===========================\n');
  
  const comparison = await new Promise((resolve, reject) => {
    db.all(`
      SELECT 
        sm.product_title,
        sm.period_type,
        -- Shopify Metrics
        sm.net_items_sold as shopify_units,
        sm.gross_sales as shopify_gross,
        sm.net_sales as shopify_net,
        sm.cost_of_goods_sold as shopify_cogs,
        sm.margin_percentage as shopify_margin,
        sm.profit as shopify_profit,
        
        -- Our Metrics (matching period)
        COALESCE(our.total_units, 0) as our_units,
        COALESCE(our.total_gross, 0) as our_gross,
        COALESCE(our.total_net, 0) as our_net,
        COALESCE(our.total_cogs, 0) as our_cogs,
        COALESCE(our.avg_margin, 0) as our_margin,
        COALESCE(our.total_profit, 0) as our_profit,
        
        -- Variance Analysis
        CASE 
          WHEN sm.gross_sales > 0 
          THEN ROUND(((COALESCE(our.total_gross, 0) - sm.gross_sales) / sm.gross_sales) * 100, 2)
          ELSE 0 
        END as variance_percentage
        
      FROM shopify_metrics sm
      LEFT JOIN (
        SELECT 
          p.name as product_title,
          SUM(ppe.units_sold) as total_units,
          SUM(ppe.gross_sales) as total_gross,
          SUM(ppe.net_sales) as total_net,
          SUM(ppe.total_cost) as total_cogs,
          AVG(ppe.margin_percentage) as avg_margin,
          SUM(ppe.net_profit) as total_profit
        FROM product_performance_enhanced ppe
        JOIN products p ON ppe.product_id = p.shopify_id
        -- Filter by date range if needed
        GROUP BY p.name
      ) our ON sm.product_title = our.product_title
      WHERE sm.period_type = 'all_time'
      ORDER BY sm.gross_sales DESC
      LIMIT 20
    `, (err, rows) => {
      if (err) reject(err);
      else resolve(rows);
    });
  });
  
  console.log('TOP 20 PRODUCTS COMPARISON');
  console.log('Product                                      | Shopify Gross | Our Gross    | Variance');
  console.log('---------------------------------------------|---------------|--------------|----------');
  
  let perfectMatches = 0;
  let closeMatches = 0;
  
  comparison.forEach(row => {
    const productName = row.product_title.substring(0, 44).padEnd(44);
    const shopifyGross = row.shopify_gross.toFixed(0).padStart(13);
    const ourGross = row.our_gross.toFixed(0).padStart(12);
    const variance = row.variance_percentage.toFixed(1).padStart(8) + '%';
    
    console.log(`${productName} | ${shopifyGross} | ${ourGross} | ${variance}`);
    
    if (Math.abs(row.variance_percentage) < 1) perfectMatches++;
    if (Math.abs(row.variance_percentage) < 5) closeMatches++;
  });
  
  console.log('\n📈 MATCH STATISTICS:');
  console.log(`   Perfect Matches (< 1% variance): ${perfectMatches}/20`);
  console.log(`   Close Matches (< 5% variance): ${closeMatches}/20`);
}

// Create sync procedure for 100% match
async function createSyncProcedure() {
  console.log('\n\n🎯 SYNC PROCEDURE FOR 100% MATCH');
  console.log('==================================\n');
  
  console.log('To achieve 100% match with Shopify:');
  console.log('\n1. DAILY SYNC REQUIREMENTS:');
  console.log('   • Use Shopify Orders API with date filters');
  console.log('   • Track order modifications (refunds, returns, cancellations)');
  console.log('   • Store order-level data, not just aggregates\n');
  
  console.log('2. IMPLEMENT THIS DATA MODEL:');
  console.log(`
CREATE TABLE shopify_orders (
  id INTEGER PRIMARY KEY,
  shopify_order_id TEXT UNIQUE,
  order_number TEXT,
  created_at DATETIME,
  updated_at DATETIME,
  financial_status TEXT,
  fulfillment_status TEXT,
  
  -- Financial fields matching Shopify exactly
  subtotal_price REAL,
  total_discounts REAL,
  total_line_items_price REAL,
  total_price REAL,
  total_tax REAL,
  total_shipping REAL,
  
  -- Refunds and returns
  total_refunded REAL,
  refunded_at DATETIME,
  
  -- Line items stored separately
  line_items_json TEXT
);

CREATE TABLE shopify_line_items (
  id INTEGER PRIMARY KEY,
  order_id INTEGER,
  product_id TEXT,
  variant_id TEXT,
  quantity INTEGER,
  price REAL,
  total_discount REAL,
  
  -- COGS tracking
  cost_per_item REAL,
  vendor_cost REAL,
  
  FOREIGN KEY (order_id) REFERENCES shopify_orders(id)
);
`);
  
  console.log('\n3. CALCULATION FORMULAS:');
  console.log('   Gross Sales = SUM(line_items.price * line_items.quantity)');
  console.log('   Discounts = -SUM(line_items.total_discount + order.total_discounts)');
  console.log('   Returns = -SUM(refunded line items value)');
  console.log('   Net Sales = Gross Sales + Discounts + Returns');
  console.log('   Taxes = SUM(order.total_tax for items)');
  console.log('   Total Sales = Net Sales + Taxes');
  console.log('   COGS = SUM(line_items.cost_per_item * quantity)');
  console.log('   Profit = Net Sales - COGS');
  console.log('   Margin % = (Profit / Net Sales) × 100\n');
  
  console.log('4. API SYNC CODE:');
  console.log(`
// Sync orders for specific date range
async function syncShopifyOrders(startDate, endDate) {
  const orders = await shopifyAPI.orders.list({
    created_at_min: startDate,
    created_at_max: endDate,
    status: 'any',
    limit: 250
  });
  
  for (const order of orders) {
    // Store complete order data
    await storeOrder(order);
    
    // Store line items with COGS
    for (const item of order.line_items) {
      const cost = await getProductCost(item.product_id, item.variant_id);
      await storeLineItem(order.id, item, cost);
    }
    
    // Track refunds
    if (order.refunds?.length > 0) {
      await storeRefunds(order.id, order.refunds);
    }
  }
}
`);
}

// Main execution
async function main() {
  try {
    await importShopifyData();
    await updateOurCalculations();
    await createComparisonView();
    await createSyncProcedure();
    
    console.log('\n✅ ANALYSIS COMPLETE!');
    console.log('====================\n');
    console.log('Key takeaway: To achieve 100% match, we need to:');
    console.log('1. Sync orders at the same granularity as Shopify (daily)');
    console.log('2. Track the exact same date ranges');
    console.log('3. Include all order modifications (refunds, returns)');
    console.log('4. Use Shopify\'s exact calculation formulas');
    console.log('5. Store COGS at the variant/order level, not product level\n');
    
    db.close();
  } catch (error) {
    console.error('Error:', error);
    db.close();
  }
}

main();