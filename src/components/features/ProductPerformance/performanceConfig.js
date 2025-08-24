// Performance metrics configuration based on Shopify Orders & Analytics API
export const PERFORMANCE_COLUMNS = [
  // Product Basic Info
  { key: 'product_title', label: 'Product Name', category: 'Product', default: true, frozen: true },
  { key: 'sku', label: 'SKU', category: 'Product', default: false },
  { key: 'vendor', label: 'Vendor', category: 'Product', default: false },
  { key: 'product_type', label: 'Type', category: 'Product', default: false },
  
  // Sales Metrics (from aggregated data)
  { key: 'total_revenue', label: 'Total Revenue', category: 'Sales', default: true, format: 'currency' },
  { key: 'total_units', label: 'Units Sold', category: 'Sales', default: true, format: 'number' },
  { key: 'total_orders', label: 'Orders', category: 'Sales', default: true, format: 'number' },
  { key: 'avg_price', label: 'Avg Price', category: 'Sales', default: true, format: 'currency', tooltip: 'Average Price per Unit' },
  { key: 'days_sold', label: 'Active Days', category: 'Sales', default: false, format: 'number' },
  { key: 'firstTimeOrders', label: 'New Customer Orders', category: 'Sales', default: false, format: 'number' },
  { key: 'repeatOrders', label: 'Repeat Orders', category: 'Sales', default: false, format: 'number' },
  
  // Revenue & Profit
  { key: 'grossSales', label: 'Gross Sales', category: 'Revenue', default: true, format: 'currency' },
  { key: 'netSales', label: 'Net Sales', category: 'Revenue', default: true, format: 'currency' },
  { key: 'discounts', label: 'Discounts', category: 'Revenue', default: false, format: 'currency' },
  { key: 'returns', label: 'Returns', category: 'Revenue', default: false, format: 'currency' },
  { key: 'taxes', label: 'Taxes', category: 'Revenue', default: false, format: 'currency' },
  { key: 'shipping', label: 'Shipping Revenue', category: 'Revenue', default: false, format: 'currency' },
  { key: 'profit', label: 'Profit', category: 'Revenue', default: true, format: 'currency', calculated: true },
  { key: 'margin', label: 'Margin %', category: 'Revenue', default: true, format: 'percentage', calculated: true },
  
  // Refunds & Returns (from Orders API)
  { key: 'refundedAmount', label: 'Refunded Amount', category: 'Returns', default: false, format: 'currency' },
  { key: 'refundedUnits', label: 'Refunded Units', category: 'Returns', default: false, format: 'number' },
  { key: 'refundRate', label: 'Refund Rate', category: 'Returns', default: false, format: 'percentage' },
  { key: 'returnRate', label: 'Return Rate', category: 'Returns', default: false, format: 'percentage' },
  
  // Conversion Metrics
  { key: 'views', label: 'Product Views', category: 'Conversion', default: false, format: 'number' },
  { key: 'addedToCart', label: 'Added to Cart', category: 'Conversion', default: false, format: 'number' },
  { key: 'conversionRate', label: 'Conversion Rate', category: 'Conversion', default: true, format: 'percentage' },
  { key: 'cartAbandonmentRate', label: 'Cart Abandonment', category: 'Conversion', default: false, format: 'percentage' },
  
  // Customer Metrics
  { key: 'uniqueCustomers', label: 'Unique Customers', category: 'Customers', default: false, format: 'number' },
  { key: 'newCustomers', label: 'New Customers', category: 'Customers', default: false, format: 'number' },
  { key: 'returningCustomers', label: 'Returning Customers', category: 'Customers', default: false, format: 'number' },
  { key: 'customerLifetimeValue', label: 'CLV', category: 'Customers', default: false, format: 'currency', tooltip: 'Customer Lifetime Value' },
  
  // Fulfillment
  { key: 'fulfilled', label: 'Fulfilled Orders', category: 'Fulfillment', default: false, format: 'number' },
  { key: 'unfulfilled', label: 'Unfulfilled', category: 'Fulfillment', default: false, format: 'number' },
  { key: 'partiallyFulfilled', label: 'Partially Fulfilled', category: 'Fulfillment', default: false, format: 'number' },
  { key: 'fulfillmentRate', label: 'Fulfillment Rate', category: 'Fulfillment', default: false, format: 'percentage' },
  
  // Trending
  { key: 'salesTrend', label: 'Sales Trend', category: 'Trends', default: true, format: 'trend' },
  { key: 'growthRate', label: 'Growth Rate', category: 'Trends', default: false, format: 'percentage_change' },
  { key: 'velocityScore', label: 'Velocity Score', category: 'Trends', default: false, format: 'score' },
  
  // Time-based
  { key: 'lastSaleDate', label: 'Last Sale', category: 'Time', default: false, format: 'date' },
  { key: 'daysActive', label: 'Days Active', category: 'Time', default: false, format: 'number' },
  { key: 'seasonality', label: 'Seasonality', category: 'Time', default: false, format: 'text' }
];

// Performance view presets
export const PERFORMANCE_VIEWS = [
  {
    id: 'overview',
    name: 'Performance Overview',
    description: 'Key sales and revenue metrics',
    columns: ['product_title', 'total_revenue', 'total_units', 'total_orders', 'avg_price', 'margin', 'salesTrend'],
    icon: 'TrendingUp'
  },
  {
    id: 'revenue-analysis',
    name: 'Revenue Analysis',
    description: 'Detailed revenue breakdown',
    columns: ['product_title', 'total_revenue', 'total_units', 'avg_price', 'days_sold'],
    icon: 'DollarSign',
    filter: (product) => product.total_revenue > 0
  },
  {
    id: 'top-performers',
    name: 'Top Performers',
    description: 'Best selling and most profitable products',
    columns: ['product_title', 'total_revenue', 'total_units', 'total_orders', 'avg_price'],
    icon: 'Target',
    filter: (product) => product.total_revenue > 10000,
    sort: { key: 'total_revenue', direction: 'desc' }
  },
  {
    id: 'underperformers',
    name: 'Underperformers',
    description: 'Products needing attention',
    columns: ['name', 'totalSales', 'unitsSold', 'conversionRate', 'returnRate', 'lastSaleDate', 'daysActive'],
    icon: 'AlertTriangle',
    filter: (product) => product.conversionRate < 1 || product.unitsSold < 10,
    sort: { key: 'totalSales', direction: 'asc' }
  },
  {
    id: 'returns-refunds',
    name: 'Returns & Refunds',
    description: 'Products with high return rates',
    columns: ['name', 'totalSales', 'returns', 'refundedAmount', 'refundedUnits', 'refundRate', 'returnRate'],
    icon: 'Package',
    filter: (product) => product.refundedAmount > 0 || product.returns > 0
  },
  {
    id: 'customer-insights',
    name: 'Customer Insights',
    description: 'Customer behavior and lifetime value',
    columns: ['name', 'uniqueCustomers', 'newCustomers', 'returningCustomers', 'firstTimeOrders', 'repeatOrders', 'customerLifetimeValue'],
    icon: 'Users'
  },
  {
    id: 'fulfillment-status',
    name: 'Fulfillment Status',
    description: 'Order fulfillment tracking',
    columns: ['name', 'ordersCount', 'fulfilled', 'unfulfilled', 'partiallyFulfilled', 'fulfillmentRate'],
    icon: 'Truck'
  }
];

// Date range presets
export const DATE_RANGES = [
  { value: 'today', label: 'Today' },
  { value: 'yesterday', label: 'Yesterday' },
  { value: '7d', label: 'Last 7 Days' },
  { value: '30d', label: 'Last 30 Days' },
  { value: '90d', label: 'Last 90 Days' },
  { value: 'mtd', label: 'Month to Date' },
  { value: 'qtd', label: 'Quarter to Date' },
  { value: 'ytd', label: 'Year to Date' },
  { value: 'last_month', label: 'Last Month' },
  { value: 'last_quarter', label: 'Last Quarter' },
  { value: 'last_year', label: 'Last Year' },
  { value: 'custom', label: 'Custom Range' }
];

// Comparison periods
export const COMPARISON_PERIODS = [
  { value: 'previous_period', label: 'Previous Period' },
  { value: 'previous_year', label: 'Previous Year' },
  { value: 'previous_month', label: 'Previous Month' },
  { value: 'none', label: 'No Comparison' }
];

// Export formats
export const EXPORT_FORMATS = [
  { value: 'csv', label: 'CSV', icon: 'FileText' },
  { value: 'excel', label: 'Excel', icon: 'FileSpreadsheet' },
  { value: 'pdf', label: 'PDF Report', icon: 'FileText' },
  { value: 'json', label: 'JSON', icon: 'Code' }
];

// Sort options
export const SORT_OPTIONS = [
  { value: 'totalSales_desc', label: 'Sales (High to Low)', key: 'totalSales', direction: 'desc' },
  { value: 'totalSales_asc', label: 'Sales (Low to High)', key: 'totalSales', direction: 'asc' },
  { value: 'unitsSold_desc', label: 'Units Sold (High to Low)', key: 'unitsSold', direction: 'desc' },
  { value: 'profit_desc', label: 'Profit (High to Low)', key: 'profit', direction: 'desc' },
  { value: 'margin_desc', label: 'Margin % (High to Low)', key: 'margin', direction: 'desc' },
  { value: 'conversionRate_desc', label: 'Conversion Rate (High to Low)', key: 'conversionRate', direction: 'desc' },
  { value: 'name_asc', label: 'Name (A to Z)', key: 'name', direction: 'asc' }
];

// Chart types for visualization
export const CHART_TYPES = [
  { value: 'line', label: 'Line Chart', icon: 'LineChart' },
  { value: 'bar', label: 'Bar Chart', icon: 'BarChart' },
  { value: 'area', label: 'Area Chart', icon: 'AreaChart' },
  { value: 'pie', label: 'Pie Chart', icon: 'PieChart' },
  { value: 'table', label: 'Table View', icon: 'Table' }
];

// Metric aggregations
export const AGGREGATIONS = {
  sum: (values) => values.reduce((a, b) => a + b, 0),
  avg: (values) => values.reduce((a, b) => a + b, 0) / values.length,
  min: (values) => Math.min(...values),
  max: (values) => Math.max(...values),
  count: (values) => values.length
};

// Format functions
export const formatters = {
  currency: (value) => {
    if (value === null || value === undefined) return '-';
    return new Intl.NumberFormat('hu-HU', {
      style: 'currency',
      currency: 'HUF',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  },
  
  number: (value) => {
    if (value === null || value === undefined) return '-';
    return new Intl.NumberFormat('en-US').format(value);
  },
  
  percentage: (value) => {
    if (value === null || value === undefined) return '-';
    return `${value.toFixed(1)}%`;
  },
  
  percentage_change: (value) => {
    if (value === null || value === undefined) return '-';
    const formatted = `${Math.abs(value).toFixed(1)}%`;
    if (value > 0) return `+${formatted}`;
    if (value < 0) return `-${formatted}`;
    return formatted;
  },
  
  date: (value) => {
    if (!value) return '-';
    const date = new Date(value);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  },
  
  trend: (value) => {
    if (value === null || value === undefined) return 'stable';
    if (value > 0) return 'up';
    if (value < 0) return 'down';
    return 'stable';
  },
  
  score: (value) => {
    if (value === null || value === undefined) return '-';
    return value.toFixed(1);
  },
  
  text: (value) => value || '-'
};