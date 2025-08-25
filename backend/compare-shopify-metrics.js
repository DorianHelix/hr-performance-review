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

// Get our data from database
async function getOurProductData(productName) {
  return new Promise((resolve, reject) => {
    const query = `
      SELECT 
        p.name as product_title,
        p.vendor,
        p.cost as unit_cost,
        SUM(pp.revenue) as our_gross_sales,
        SUM(pp.units_sold) as our_units_sold,
        SUM(pp.orders_count) as our_orders,
        SUM(ppe.gross_sales) as enhanced_gross_sales,
        SUM(ppe.net_sales) as enhanced_net_sales,
        SUM(ppe.total_discounts) as enhanced_discounts,
        SUM(ppe.returns_amount) as enhanced_returns,
        SUM(ppe.taxes) as enhanced_taxes,
        SUM(ppe.total_cost) as enhanced_cogs,
        COUNT(DISTINCT pp.date) as days_active
      FROM products p
      LEFT JOIN product_performance pp ON p.shopify_id = pp.product_id
      LEFT JOIN product_performance_enhanced ppe ON pp.product_id = ppe.product_id AND pp.date = ppe.date
      WHERE p.name = ?
      GROUP BY p.name, p.vendor
    `;
    
    db.get(query, [productName], (err, row) => {
      if (err) reject(err);
      else resolve(row);
    });
  });
}

// Compare metrics
async function compareMetrics() {
  console.log('📊 SHOPIFY METRICS COMPARISON ANALYSIS');
  console.log('=====================================\n');
  
  // Load both Shopify files
  const file1Path = '/Users/doriandaniel/Downloads/Total sales by product-7.jsonl';
  const file2Path = '/Users/doriandaniel/Downloads/Total sales by product-6.jsonl';
  
  console.log('📁 Loading Shopify export files...');
  const shopifyAllTime = await parseJSONL(file1Path);
  const shopifyRecent = await parseJSONL(file2Path);
  
  console.log(`✅ Loaded ${shopifyAllTime.length} products from all-time data`);
  console.log(`✅ Loaded ${shopifyRecent.length} products from recent data\n`);
  
  // Analyze top 10 products
  console.log('🔍 DETAILED PRODUCT COMPARISON (Top 10 Products)');
  console.log('================================================\n');
  
  const topProducts = shopifyAllTime.slice(0, 10);
  const comparisonResults = [];
  
  for (const shopifyProduct of topProducts) {
    console.log(`\n📦 ${shopifyProduct.product_title}`);
    console.log('─'.repeat(60));
    
    // Get our data
    const ourData = await getOurProductData(shopifyProduct.product_title);
    
    // Find in recent data
    const recentData = shopifyRecent.find(p => p.product_title === shopifyProduct.product_title);
    
    // Calculate metrics relationships in Shopify
    const shopifyCalcs = {
      net_sales_calc: shopifyProduct.gross_sales + shopifyProduct.discounts + shopifyProduct.returns,
      total_sales_calc: shopifyProduct.net_sales + shopifyProduct.taxes,
      margin: ((shopifyProduct.net_sales - shopifyProduct.cost_of_goods_sold) / shopifyProduct.net_sales * 100).toFixed(2)
    };
    
    console.log('\n📈 SHOPIFY ALL-TIME METRICS:');
    console.log(`   Items Sold:     ${shopifyProduct.net_items_sold.toLocaleString()}`);
    console.log(`   Gross Sales:    ${shopifyProduct.gross_sales.toFixed(2).toLocaleString()} HUF`);
    console.log(`   Discounts:      ${shopifyProduct.discounts.toFixed(2).toLocaleString()} HUF`);
    console.log(`   Returns:        ${shopifyProduct.returns.toFixed(2).toLocaleString()} HUF`);
    console.log(`   Net Sales:      ${shopifyProduct.net_sales.toFixed(2).toLocaleString()} HUF`);
    console.log(`   Taxes:          ${shopifyProduct.taxes.toFixed(2).toLocaleString()} HUF`);
    console.log(`   Total Sales:    ${shopifyProduct.total_sales.toFixed(2).toLocaleString()} HUF`);
    console.log(`   COGS:           ${shopifyProduct.cost_of_goods_sold.toFixed(2).toLocaleString()} HUF`);
    console.log(`   Margin:         ${shopifyCalcs.margin}%`);
    
    console.log('\n✓ SHOPIFY CALCULATION VERIFICATION:');
    console.log(`   Net Sales = Gross + Discounts + Returns`);
    console.log(`   ${shopifyProduct.net_sales.toFixed(2)} = ${shopifyProduct.gross_sales.toFixed(2)} + ${shopifyProduct.discounts.toFixed(2)} + ${shopifyProduct.returns.toFixed(2)}`);
    console.log(`   Calculated: ${shopifyCalcs.net_sales_calc.toFixed(2)} (${Math.abs(shopifyCalcs.net_sales_calc - shopifyProduct.net_sales) < 0.01 ? '✅ MATCH' : '❌ MISMATCH'})`);
    
    console.log(`\n   Total Sales = Net Sales + Taxes`);
    console.log(`   ${shopifyProduct.total_sales.toFixed(2)} = ${shopifyProduct.net_sales.toFixed(2)} + ${shopifyProduct.taxes.toFixed(2)}`);
    console.log(`   Calculated: ${shopifyCalcs.total_sales_calc.toFixed(2)} (${Math.abs(shopifyCalcs.total_sales_calc - shopifyProduct.total_sales) < 0.01 ? '✅ MATCH' : '❌ MISMATCH'})`);
    
    if (recentData) {
      console.log('\n📊 SHOPIFY RECENT PERIOD:');
      console.log(`   Items Sold:     ${recentData.net_items_sold.toLocaleString()}`);
      console.log(`   Gross Sales:    ${recentData.gross_sales.toFixed(2).toLocaleString()} HUF`);
      console.log(`   Net Sales:      ${recentData.net_sales.toFixed(2).toLocaleString()} HUF`);
      console.log(`   COGS:           ${recentData.cost_of_goods_sold.toFixed(2).toLocaleString()} HUF`);
    }
    
    if (ourData) {
      console.log('\n💻 OUR SYSTEM DATA:');
      console.log(`   Units Sold:     ${ourData.our_units_sold || 0}`);
      console.log(`   Gross Sales:    ${(ourData.our_gross_sales || 0).toFixed(2).toLocaleString()} HUF`);
      console.log(`   Enhanced Gross: ${(ourData.enhanced_gross_sales || 0).toFixed(2).toLocaleString()} HUF`);
      console.log(`   Enhanced Net:   ${(ourData.enhanced_net_sales || 0).toFixed(2).toLocaleString()} HUF`);
      console.log(`   Enhanced COGS:  ${(ourData.enhanced_cogs || 0).toFixed(2).toLocaleString()} HUF`);
      
      // Calculate differences
      const diff = {
        units: ((ourData.our_units_sold || 0) - parseInt(shopifyProduct.net_items_sold)),
        gross: ((ourData.our_gross_sales || 0) - shopifyProduct.gross_sales),
        percentage: (((ourData.our_gross_sales || 0) / shopifyProduct.gross_sales - 1) * 100).toFixed(2)
      };
      
      console.log('\n⚖️ VARIANCE ANALYSIS:');
      console.log(`   Units Diff:     ${diff.units} (${diff.units > 0 ? '+' : ''}${((diff.units / parseInt(shopifyProduct.net_items_sold)) * 100).toFixed(2)}%)`);
      console.log(`   Gross Diff:     ${diff.gross.toFixed(2)} HUF (${diff.percentage}%)`);
      
      comparisonResults.push({
        product: shopifyProduct.product_title,
        shopify_units: parseInt(shopifyProduct.net_items_sold),
        our_units: ourData.our_units_sold || 0,
        shopify_gross: shopifyProduct.gross_sales,
        our_gross: ourData.our_gross_sales || 0,
        variance_percentage: parseFloat(diff.percentage)
      });
    } else {
      console.log('\n⚠️ Product not found in our database');
    }
  }
  
  // Summary Analysis
  console.log('\n\n🎯 SUMMARY ANALYSIS');
  console.log('==================\n');
  
  // Key findings
  console.log('📌 KEY FINDINGS:');
  console.log('1. SHOPIFY METRIC FORMULAS:');
  console.log('   • Net Sales = Gross Sales + Discounts (negative) + Returns (negative)');
  console.log('   • Total Sales = Net Sales + Taxes');
  console.log('   • Profit = Net Sales - COGS');
  console.log('   • Margin % = (Net Sales - COGS) / Net Sales × 100\n');
  
  console.log('2. DISCREPANCY PATTERNS:');
  const avgVariance = comparisonResults.reduce((sum, r) => sum + r.variance_percentage, 0) / comparisonResults.length;
  console.log(`   • Average Variance: ${avgVariance.toFixed(2)}%`);
  
  const perfectMatches = comparisonResults.filter(r => Math.abs(r.variance_percentage) < 1).length;
  console.log(`   • Perfect Matches (< 1% variance): ${perfectMatches}/${comparisonResults.length}`);
  
  console.log('\n3. RECOMMENDATIONS TO ACHIEVE 100% MATCH:');
  console.log('   ✓ Use Shopify Orders API for real-time data');
  console.log('   ✓ Track discounts at line-item level');
  console.log('   ✓ Include refunds/returns in calculations');
  console.log('   ✓ Apply taxes after net sales calculation');
  console.log('   ✓ Store COGS per variant, not just product level');
  console.log('   ✓ Sync daily to capture all order modifications');
  
  // Create correction SQL
  console.log('\n\n🔧 SQL CORRECTIONS TO MATCH SHOPIFY:');
  console.log('=====================================\n');
  
  console.log(`-- Update calculation formulas to match Shopify
UPDATE product_performance_enhanced
SET 
  net_sales = gross_sales + total_discounts + returns_amount,
  total_sales = (gross_sales + total_discounts + returns_amount) + taxes,
  margin_percentage = CASE 
    WHEN (gross_sales + total_discounts + returns_amount) > 0 
    THEN ((gross_sales + total_discounts + returns_amount - total_cost) / (gross_sales + total_discounts + returns_amount)) * 100
    ELSE 0
  END;`);
  
  db.close();
}

// Run comparison
compareMetrics().catch(console.error);