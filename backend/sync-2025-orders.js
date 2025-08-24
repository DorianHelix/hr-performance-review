const fetch = require('node-fetch');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Database connection
const db = new sqlite3.Database(path.join(__dirname, 'database.db'));

// Helper function to wait
const wait = (ms) => new Promise(resolve => setTimeout(resolve, ms));

async function syncAllOrders2025() {
  console.log('🚀 Starting full sync of 2025 orders...');
  
  // Get Shopify credentials
  const settings = await new Promise((resolve, reject) => {
    db.all(`SELECT key, value FROM settings WHERE key IN ('shopify_store_domain', 'shopify_access_token')`, (err, rows) => {
      if (err) reject(err);
      const settingsObj = {};
      rows.forEach(row => {
        settingsObj[row.key] = row.value;
      });
      resolve(settingsObj);
    });
  });
  
  if (!settings.shopify_store_domain || !settings.shopify_access_token) {
    console.error('❌ Shopify credentials not configured');
    process.exit(1);
  }
  
  const startDate = '2025-01-01T00:00:00Z';
  const endDate = new Date().toISOString();
  
  console.log(`📅 Syncing orders from ${startDate} to ${endDate}`);
  
  let allOrders = [];
  let pageInfo = null;
  let hasNextPage = true;
  const pageSize = 250; // Maximum allowed
  let pageCount = 0;
  let savedCount = 0;
  let errorCount = 0;
  
  // Fetch all orders
  while (hasNextPage) {
    pageCount++;
    let url;
    
    if (pageInfo) {
      url = `https://${settings.shopify_store_domain}.myshopify.com/admin/api/2024-10/orders.json?limit=${pageSize}&page_info=${pageInfo}`;
    } else {
      url = `https://${settings.shopify_store_domain}.myshopify.com/admin/api/2024-10/orders.json?limit=${pageSize}&status=any&created_at_min=${startDate}`;
    }
    
    try {
      const response = await fetch(url, {
        headers: {
          'X-Shopify-Access-Token': settings.shopify_access_token,
          'Content-Type': 'application/json'
        }
      });
      
      // Handle rate limiting
      if (response.status === 429) {
        const retryAfter = response.headers.get('Retry-After');
        const waitTime = retryAfter ? parseInt(retryAfter) * 1000 : 2000;
        console.log(`⏳ Rate limited. Waiting ${waitTime}ms...`);
        await wait(waitTime);
        continue;
      }
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${await response.text()}`);
      }
      
      const data = await response.json();
      const orders = data.orders;
      
      console.log(`📦 Page ${pageCount}: Fetched ${orders.length} orders`);
      
      // Process and save orders with enhanced metrics
      for (const order of orders) {
        try {
          // Check if order exists
          const exists = await new Promise((resolve) => {
            db.get('SELECT id FROM orders WHERE shopify_id = ?', [order.id], (err, row) => {
              resolve(!!row);
            });
          });
          
          if (!exists) {
            // Calculate enhanced metrics
            const metrics = calculateOrderMetrics(order);
            
            // Save order
            await saveOrderWithMetrics(order, metrics);
            savedCount++;
          }
        } catch (error) {
          console.error(`❌ Error processing order ${order.id}:`, error.message);
          errorCount++;
        }
      }
      
      allOrders = allOrders.concat(orders);
      
      // Check for next page
      const linkHeader = response.headers.get('link');
      if (linkHeader && linkHeader.includes('rel="next"')) {
        const links = linkHeader.split(',');
        const nextLink = links.find(link => link.includes('rel="next"'));
        if (nextLink) {
          const pageInfoMatch = nextLink.match(/page_info=([^&>]+)/);
          pageInfo = pageInfoMatch ? pageInfoMatch[1] : null;
          hasNextPage = pageInfo !== null;
        } else {
          hasNextPage = false;
        }
      } else {
        hasNextPage = false;
      }
      
      // Progress update
      console.log(`📊 Progress: ${allOrders.length} orders fetched, ${savedCount} new orders saved`);
      
      // Small delay between requests
      await wait(250);
      
    } catch (error) {
      console.error(`❌ Error fetching page ${pageCount}:`, error.message);
      hasNextPage = false;
    }
  }
  
  console.log(`\n✅ Sync completed!`);
  console.log(`📈 Total orders fetched: ${allOrders.length}`);
  console.log(`💾 New orders saved: ${savedCount}`);
  console.log(`⚠️  Errors: ${errorCount}`);
  
  // Now calculate product performance metrics
  await calculateProductPerformanceMetrics();
}

function calculateOrderMetrics(order) {
  const metrics = {
    gross_sales: 0,
    net_sales: 0,
    total_discounts: parseFloat(order.total_discounts || 0),
    taxes: parseFloat(order.total_tax || 0),
    shipping: 0,
    refunds: 0,
    returns: 0,
    profit: 0,
    cost: 0
  };
  
  // Calculate gross sales
  if (order.line_items) {
    metrics.gross_sales = order.line_items.reduce((sum, item) => {
      return sum + (parseFloat(item.price) * item.quantity);
    }, 0);
    
    // Estimate cost (you may need to fetch this from inventory)
    metrics.cost = order.line_items.reduce((sum, item) => {
      // Use variant cost if available, otherwise estimate at 40% of price
      const itemCost = item.variant_cost || (parseFloat(item.price) * 0.4);
      return sum + (itemCost * item.quantity);
    }, 0);
  }
  
  // Calculate shipping
  if (order.shipping_lines) {
    metrics.shipping = order.shipping_lines.reduce((sum, line) => {
      return sum + parseFloat(line.price || 0);
    }, 0);
  }
  
  // Calculate refunds
  if (order.refunds && order.refunds.length > 0) {
    metrics.refunds = order.refunds.reduce((sum, refund) => {
      return sum + Math.abs(parseFloat(refund.total || 0));
    }, 0);
  }
  
  // Net sales = gross - discounts - refunds
  metrics.net_sales = metrics.gross_sales - metrics.total_discounts - metrics.refunds;
  
  // Profit = net sales - cost - taxes
  metrics.profit = metrics.net_sales - metrics.cost - metrics.taxes;
  
  return metrics;
}

async function saveOrderWithMetrics(order, metrics) {
  return new Promise((resolve, reject) => {
    db.run(`
      INSERT INTO orders (
        shopify_id, order_number, customer_name, customer_email, customer_phone,
        financial_status, fulfillment_status, total_price, subtotal_price,
        total_tax, total_discounts, total_shipping, total_refunded,
        currency, note, customer_note, tags, source, channel,
        shipping_address, billing_address, shipping_method,
        tracking_number, carrier, created_at, processed_at,
        fulfilled_at, cancelled_at, synced_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
    `, [
      order.id,
      order.order_number || order.name,
      order.customer ? `${order.customer.first_name || ''} ${order.customer.last_name || ''}`.trim() : null,
      order.customer ? order.customer.email : order.email,
      order.customer ? order.customer.phone : order.phone,
      order.financial_status,
      order.fulfillment_status,
      parseFloat(order.total_price || 0),
      parseFloat(order.subtotal_price || 0),
      parseFloat(order.total_tax || 0),
      metrics.total_discounts,
      metrics.shipping,
      metrics.refunds,
      order.currency,
      order.note,
      order.note_attributes ? JSON.stringify(order.note_attributes) : null,
      order.tags ? JSON.stringify(order.tags.split(',').map(t => t.trim())) : '[]',
      order.source_name,
      order.source_identifier,
      order.shipping_address ? JSON.stringify(order.shipping_address) : null,
      order.billing_address ? JSON.stringify(order.billing_address) : null,
      order.shipping_lines && order.shipping_lines[0] ? order.shipping_lines[0].title : null,
      order.fulfillments && order.fulfillments[0] ? order.fulfillments[0].tracking_number : null,
      order.fulfillments && order.fulfillments[0] ? order.fulfillments[0].tracking_company : null,
      order.created_at,
      order.processed_at,
      order.fulfillments && order.fulfillments[0] ? order.fulfillments[0].created_at : null,
      order.cancelled_at
    ], function(err) {
      if (err) {
        reject(err);
      } else {
        const orderId = this.lastID;
        
        // Save line items
        if (order.line_items && order.line_items.length > 0) {
          for (const item of order.line_items) {
            db.run(`
              INSERT OR IGNORE INTO order_items (
                order_id, shopify_id, product_id, variant_id,
                name, variant_title, sku, quantity, price, cost,
                total_discount, fulfillment_status, image
              ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            `, [
              orderId,
              item.id,
              item.product_id,
              item.variant_id,
              item.name,
              item.variant_title,
              item.sku,
              item.quantity,
              parseFloat(item.price || 0),
              metrics.cost / order.line_items.length, // Distribute cost
              parseFloat(item.total_discount || 0),
              item.fulfillment_status,
              item.product_exists && item.image ? item.image.src : null
            ]);
          }
        }
        
        resolve(orderId);
      }
    });
  });
}

async function calculateProductPerformanceMetrics() {
  console.log('\n📊 Calculating enhanced product performance metrics...');
  
  return new Promise((resolve, reject) => {
    // Clear existing enhanced performance data
    db.run('DELETE FROM product_performance_enhanced', (err) => {
      if (err) console.error('Error clearing enhanced performance:', err);
      
      // Calculate comprehensive metrics
      const query = `
        INSERT INTO product_performance_enhanced (
          product_id, date, 
          gross_sales, net_sales, total_sales, units_sold, orders_count,
          total_discounts, returns_amount, returns_count,
          taxes, shipping_charges, total_cost, gross_profit, net_profit,
          margin_percentage, unique_customers, new_customers,
          average_order_value, fulfilled_orders, unfulfilled_orders
        )
        SELECT 
          oi.product_id,
          DATE(o.created_at) as date,
          SUM(oi.price * oi.quantity) as gross_sales,
          SUM((oi.price * oi.quantity) - COALESCE(oi.total_discount, 0)) as net_sales,
          SUM(oi.price * oi.quantity) as total_sales,
          SUM(oi.quantity) as units_sold,
          COUNT(DISTINCT o.id) as orders_count,
          SUM(COALESCE(oi.total_discount, 0)) as total_discounts,
          SUM(CASE WHEN o.financial_status = 'refunded' THEN oi.price * oi.quantity ELSE 0 END) as returns_amount,
          SUM(CASE WHEN o.financial_status = 'refunded' THEN 1 ELSE 0 END) as returns_count,
          SUM((o.total_tax / NULLIF(o.subtotal_price, 0)) * (oi.price * oi.quantity)) as taxes,
          SUM((o.total_shipping / NULLIF(o.subtotal_price, 0)) * (oi.price * oi.quantity)) as shipping_charges,
          SUM(COALESCE(oi.cost, oi.price * 0.4) * oi.quantity) as total_cost,
          SUM((oi.price * oi.quantity) - (COALESCE(oi.cost, oi.price * 0.4) * oi.quantity)) as gross_profit,
          SUM((oi.price * oi.quantity) - (COALESCE(oi.cost, oi.price * 0.4) * oi.quantity) - 
              ((o.total_tax / NULLIF(o.subtotal_price, 0)) * (oi.price * oi.quantity))) as net_profit,
          AVG(((oi.price * oi.quantity) - (COALESCE(oi.cost, oi.price * 0.4) * oi.quantity)) / 
              NULLIF(oi.price * oi.quantity, 0) * 100) as margin_percentage,
          COUNT(DISTINCT o.customer_email) as unique_customers,
          COUNT(DISTINCT CASE 
            WHEN o.customer_email NOT IN (
              SELECT DISTINCT customer_email FROM orders WHERE created_at < o.created_at
            ) THEN o.customer_email 
          END) as new_customers,
          AVG(o.total_price) as average_order_value,
          SUM(CASE WHEN o.fulfillment_status = 'fulfilled' THEN 1 ELSE 0 END) as fulfilled_orders,
          SUM(CASE WHEN o.fulfillment_status = 'unfulfilled' THEN 1 ELSE 0 END) as unfulfilled_orders
        FROM order_items oi
        JOIN orders o ON oi.order_id = o.id
        WHERE o.created_at >= '2025-01-01'
        GROUP BY oi.product_id, DATE(o.created_at)
      `;
      
      db.run(query, function(err) {
        if (err) {
          console.error('❌ Error calculating metrics:', err);
          reject(err);
        } else {
          console.log(`✅ Enhanced metrics calculated: ${this.changes} records created`);
          
          // Update analytics summary
          updateAnalyticsSummary();
          resolve();
        }
      });
    });
  });
}

async function updateAnalyticsSummary() {
  console.log('📈 Updating analytics summary...');
  
  const query = `
    INSERT OR REPLACE INTO product_analytics_summary (
      product_id,
      lifetime_revenue, lifetime_units_sold, lifetime_orders, lifetime_profit,
      last_30_days_revenue, last_30_days_units, last_30_days_orders,
      last_7_days_revenue, last_7_days_units, last_7_days_orders,
      overall_score, last_synced_at
    )
    SELECT 
      product_id,
      SUM(total_sales) as lifetime_revenue,
      SUM(units_sold) as lifetime_units_sold,
      SUM(orders_count) as lifetime_orders,
      SUM(net_profit) as lifetime_profit,
      SUM(CASE WHEN date >= date('now', '-30 days') THEN total_sales ELSE 0 END) as last_30_days_revenue,
      SUM(CASE WHEN date >= date('now', '-30 days') THEN units_sold ELSE 0 END) as last_30_days_units,
      SUM(CASE WHEN date >= date('now', '-30 days') THEN orders_count ELSE 0 END) as last_30_days_orders,
      SUM(CASE WHEN date >= date('now', '-7 days') THEN total_sales ELSE 0 END) as last_7_days_revenue,
      SUM(CASE WHEN date >= date('now', '-7 days') THEN units_sold ELSE 0 END) as last_7_days_units,
      SUM(CASE WHEN date >= date('now', '-7 days') THEN orders_count ELSE 0 END) as last_7_days_orders,
      -- Simple scoring algorithm (can be enhanced)
      (SUM(total_sales) / 1000 + SUM(units_sold) + SUM(net_profit) / 100) / 3 as overall_score,
      CURRENT_TIMESTAMP
    FROM product_performance_enhanced
    GROUP BY product_id
  `;
  
  db.run(query, (err) => {
    if (err) {
      console.error('❌ Error updating summary:', err);
    } else {
      console.log('✅ Analytics summary updated');
    }
  });
}

// Run the sync
syncAllOrders2025().catch(console.error);