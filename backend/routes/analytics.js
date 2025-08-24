const express = require('express');
const router = express.Router();

// Get comprehensive product analytics
router.get('/product-analytics/comprehensive', (req, res) => {
  const { 
    product_id, 
    start_date, 
    end_date, 
    metrics = 'all',
    comparison = true 
  } = req.query;
  
  const db = req.app.locals.db;
  
  // Build WHERE clause
  let whereConditions = ['1=1'];
  let params = [];
  
  if (product_id) {
    whereConditions.push('pe.product_id = ?');
    params.push(product_id);
  }
  
  if (start_date) {
    whereConditions.push('pe.date >= ?');
    params.push(start_date);
  }
  
  if (end_date) {
    whereConditions.push('pe.date <= ?');
    params.push(end_date);
  }
  
  const whereClause = whereConditions.join(' AND ');
  
  // Query for enhanced metrics
  const query = `
    SELECT 
      pe.*,
      p.name as product_name,
      p.vendor,
      p.product_type,
      p.featured_image,
      p.sku,
      pas.lifetime_revenue,
      pas.lifetime_units_sold,
      pas.lifetime_profit,
      pas.last_30_days_revenue,
      pas.last_30_days_growth,
      pas.revenue_rank,
      pas.overall_score,
      pas.trend_direction,
      pas.predicted_next_7_days
    FROM product_performance_enhanced pe
    LEFT JOIN products p ON pe.product_id = p.shopify_id
    LEFT JOIN product_analytics_summary pas ON pe.product_id = pas.product_id
    WHERE ${whereClause}
    ORDER BY pe.date DESC, pe.total_sales DESC
    LIMIT 1000
  `;
  
  db.all(query, params, (err, rows) => {
    if (err) {
      console.error('Error fetching comprehensive analytics:', err);
      return res.status(500).json({ error: 'Failed to fetch analytics' });
    }
    
    // Group by product if needed
    const productMetrics = {};
    rows.forEach(row => {
      if (!productMetrics[row.product_id]) {
        productMetrics[row.product_id] = {
          product_id: row.product_id,
          product_name: row.product_name,
          vendor: row.vendor,
          product_type: row.product_type,
          featured_image: row.featured_image,
          sku: row.sku,
          lifetime_metrics: {
            revenue: row.lifetime_revenue,
            units_sold: row.lifetime_units_sold,
            profit: row.lifetime_profit,
            score: row.overall_score,
            rank: row.revenue_rank
          },
          recent_performance: {
            last_30_days_revenue: row.last_30_days_revenue,
            last_30_days_growth: row.last_30_days_growth,
            trend: row.trend_direction,
            prediction_next_7_days: row.predicted_next_7_days
          },
          daily_metrics: []
        };
      }
      
      // Add daily metrics
      productMetrics[row.product_id].daily_metrics.push({
        date: row.date,
        sales: {
          gross_sales: row.gross_sales,
          net_sales: row.net_sales,
          total_sales: row.total_sales,
          units_sold: row.units_sold,
          orders_count: row.orders_count
        },
        financial: {
          discounts: row.total_discounts,
          discount_rate: row.discount_percentage,
          returns: row.returns_amount,
          refunds: row.refunds_amount,
          taxes: row.taxes,
          shipping: row.shipping_charges,
          cost: row.total_cost,
          gross_profit: row.gross_profit,
          net_profit: row.net_profit,
          margin: row.margin_percentage
        },
        customers: {
          unique: row.unique_customers,
          new: row.new_customers,
          returning: row.returning_customers,
          lifetime_value: row.customer_lifetime_value
        },
        conversion: {
          page_views: row.product_page_views,
          add_to_cart: row.add_to_cart_count,
          conversion_rate: row.conversion_rate,
          cart_abandonment: row.cart_abandonment_count
        },
        fulfillment: {
          fulfilled: row.fulfilled_orders,
          unfulfilled: row.unfulfilled_orders,
          fulfillment_time: row.fulfillment_time_hours
        }
      });
    });
    
    // Calculate aggregated insights
    const insights = calculateInsights(Object.values(productMetrics));
    
    res.json({
      products: Object.values(productMetrics),
      insights,
      period: { start_date, end_date },
      total_products: Object.keys(productMetrics).length
    });
  });
});

// Compare with Shopify Analytics
router.get('/shopify-comparison', async (req, res) => {
  const { start_date, end_date } = req.query;
  const db = req.app.locals.db;
  
  // Get our metrics
  const ourMetricsQuery = `
    SELECT 
      SUM(total_sales) as our_total_sales,
      SUM(units_sold) as our_units_sold,
      SUM(orders_count) as our_orders,
      SUM(gross_profit) as our_gross_profit,
      SUM(net_profit) as our_net_profit,
      AVG(margin_percentage) as our_avg_margin,
      SUM(unique_customers) as our_customers,
      AVG(conversion_rate) as our_conversion_rate
    FROM product_performance_enhanced
    WHERE date >= ? AND date <= ?
  `;
  
  db.get(ourMetricsQuery, [start_date, end_date], async (err, ourMetrics) => {
    if (err) {
      return res.status(500).json({ error: 'Failed to fetch our metrics' });
    }
    
    // Here you would fetch Shopify's analytics
    // For now, we'll simulate with a comparison
    const shopifyMetrics = await fetchShopifyAnalytics(start_date, end_date);
    
    const comparison = {
      revenue: {
        ours: ourMetrics.our_total_sales,
        shopify: shopifyMetrics.total_sales,
        difference: ourMetrics.our_total_sales - shopifyMetrics.total_sales,
        difference_percentage: ((ourMetrics.our_total_sales - shopifyMetrics.total_sales) / shopifyMetrics.total_sales * 100).toFixed(2)
      },
      units: {
        ours: ourMetrics.our_units_sold,
        shopify: shopifyMetrics.units_sold,
        difference: ourMetrics.our_units_sold - shopifyMetrics.units_sold
      },
      orders: {
        ours: ourMetrics.our_orders,
        shopify: shopifyMetrics.orders,
        difference: ourMetrics.our_orders - shopifyMetrics.orders
      },
      profit: {
        ours: ourMetrics.our_net_profit,
        shopify: shopifyMetrics.net_profit || 'Not available',
        difference: ourMetrics.our_net_profit - (shopifyMetrics.net_profit || 0)
      },
      insights: {
        data_quality: calculateDataQuality(ourMetrics, shopifyMetrics),
        recommendations: generateRecommendations(ourMetrics, shopifyMetrics)
      }
    };
    
    res.json(comparison);
  });
});

// Get top performing products
router.get('/top-products', (req, res) => {
  const { metric = 'revenue', limit = 10, period = '30' } = req.query;
  const db = req.app.locals.db;
  
  const metricMap = {
    revenue: 'SUM(total_sales)',
    units: 'SUM(units_sold)',
    profit: 'SUM(net_profit)',
    margin: 'AVG(margin_percentage)',
    growth: '(SUM(CASE WHEN date >= date("now", "-7 days") THEN total_sales ELSE 0 END) / NULLIF(SUM(CASE WHEN date < date("now", "-7 days") AND date >= date("now", "-14 days") THEN total_sales ELSE 0 END), 0) - 1) * 100'
  };
  
  const query = `
    SELECT 
      pe.product_id,
      p.name as product_name,
      p.vendor,
      p.featured_image,
      ${metricMap[metric]} as metric_value,
      SUM(total_sales) as total_revenue,
      SUM(units_sold) as total_units,
      SUM(orders_count) as total_orders,
      AVG(margin_percentage) as avg_margin
    FROM product_performance_enhanced pe
    LEFT JOIN products p ON pe.product_id = p.shopify_id
    WHERE pe.date >= date('now', '-${period} days')
    GROUP BY pe.product_id
    ORDER BY metric_value DESC
    LIMIT ?
  `;
  
  db.all(query, [parseInt(limit)], (err, rows) => {
    if (err) {
      return res.status(500).json({ error: 'Failed to fetch top products' });
    }
    
    res.json({
      metric,
      period: `Last ${period} days`,
      products: rows
    });
  });
});

// Helper functions
function calculateInsights(products) {
  if (!products || products.length === 0) return {};
  
  const totalRevenue = products.reduce((sum, p) => sum + (p.lifetime_metrics?.revenue || 0), 0);
  const avgMargin = products.reduce((sum, p) => {
    const margins = p.daily_metrics.map(d => d.financial.margin).filter(m => m > 0);
    return sum + (margins.length > 0 ? margins.reduce((a, b) => a + b, 0) / margins.length : 0);
  }, 0) / products.length;
  
  return {
    total_revenue: totalRevenue,
    average_margin: avgMargin,
    top_performer: products.sort((a, b) => (b.lifetime_metrics?.revenue || 0) - (a.lifetime_metrics?.revenue || 0))[0]?.product_name,
    products_analyzed: products.length,
    trending_up: products.filter(p => p.recent_performance?.trend === 'up').length,
    trending_down: products.filter(p => p.recent_performance?.trend === 'down').length
  };
}

async function fetchShopifyAnalytics(start_date, end_date) {
  // This would normally call Shopify's Analytics API
  // For now, return mock data
  return {
    total_sales: 0,
    units_sold: 0,
    orders: 0,
    net_profit: 0
  };
}

function calculateDataQuality(ourMetrics, shopifyMetrics) {
  // Simple data quality score
  let score = 100;
  
  if (Math.abs(ourMetrics.our_total_sales - shopifyMetrics.total_sales) > shopifyMetrics.total_sales * 0.05) {
    score -= 20; // More than 5% difference
  }
  
  if (ourMetrics.our_orders !== shopifyMetrics.orders) {
    score -= 10;
  }
  
  return {
    score,
    status: score >= 90 ? 'Excellent' : score >= 70 ? 'Good' : 'Needs Review'
  };
}

function generateRecommendations(ourMetrics, shopifyMetrics) {
  const recommendations = [];
  
  if (ourMetrics.our_avg_margin < 30) {
    recommendations.push('Consider reviewing product pricing - average margin is below 30%');
  }
  
  if (ourMetrics.our_conversion_rate < 2) {
    recommendations.push('Conversion rate is low - consider optimizing product pages');
  }
  
  return recommendations;
}

module.exports = router;