// Order configuration and constants
export const ORDER_STATUSES = {
  PENDING: 'pending',
  PROCESSING: 'processing',
  FULFILLED: 'fulfilled',
  PARTIALLY_FULFILLED: 'partially_fulfilled',
  SHIPPED: 'shipped',
  DELIVERED: 'delivered',
  CANCELLED: 'cancelled',
  REFUNDED: 'refunded',
  PARTIALLY_REFUNDED: 'partially_refunded'
};

export const FULFILLMENT_STATUSES = {
  UNFULFILLED: 'unfulfilled',
  PARTIAL: 'partial',
  FULFILLED: 'fulfilled',
  RESTOCKED: 'restocked'
};

export const FINANCIAL_STATUSES = {
  PENDING: 'pending',
  AUTHORIZED: 'authorized',
  PARTIALLY_PAID: 'partially_paid',
  PAID: 'paid',
  PARTIALLY_REFUNDED: 'partially_refunded',
  REFUNDED: 'refunded',
  VOIDED: 'voided'
};

export const ORDER_COLUMNS = [
  // Basic Info
  { key: 'orderNumber', label: 'Order #', category: 'Basic', default: true },
  { key: 'customerName', label: 'Customer', category: 'Basic', default: true },
  { key: 'createdAt', label: 'Date', category: 'Basic', default: true },
  { key: 'fulfillmentStatus', label: 'Fulfillment', category: 'Basic', default: true },
  { key: 'financialStatus', label: 'Payment', category: 'Basic', default: true },
  
  // Financial
  { key: 'totalPrice', label: 'Total', category: 'Financial', default: true },
  { key: 'subtotalPrice', label: 'Subtotal', category: 'Financial', default: false },
  { key: 'totalTax', label: 'Tax', category: 'Financial', default: false },
  { key: 'totalShipping', label: 'Shipping', category: 'Financial', default: false },
  { key: 'totalDiscounts', label: 'Discounts', category: 'Financial', default: false },
  { key: 'totalRefunded', label: 'Refunded', category: 'Financial', default: false },
  { key: 'profit', label: 'Profit', category: 'Financial', default: true, calculated: true },
  { key: 'margin', label: 'Margin %', category: 'Financial', default: true, calculated: true },
  
  // Items
  { key: 'itemCount', label: 'Items', category: 'Items', default: true },
  { key: 'productNames', label: 'Products', category: 'Items', default: true },
  { key: 'skus', label: 'SKUs', category: 'Items', default: false },
  
  // Customer
  { key: 'customerEmail', label: 'Email', category: 'Customer', default: false },
  { key: 'customerPhone', label: 'Phone', category: 'Customer', default: false },
  { key: 'shippingAddress', label: 'Shipping Address', category: 'Customer', default: false },
  { key: 'billingAddress', label: 'Billing Address', category: 'Customer', default: false },
  { key: 'customerNote', label: 'Customer Note', category: 'Customer', default: false },
  
  // Shipping
  { key: 'shippingMethod', label: 'Shipping Method', category: 'Shipping', default: false },
  { key: 'trackingNumber', label: 'Tracking #', category: 'Shipping', default: false },
  { key: 'carrier', label: 'Carrier', category: 'Shipping', default: false },
  
  // Meta
  { key: 'tags', label: 'Tags', category: 'Meta', default: false },
  { key: 'source', label: 'Source', category: 'Meta', default: false },
  { key: 'channel', label: 'Channel', category: 'Meta', default: false },
  { key: 'note', label: 'Internal Note', category: 'Meta', default: false },
  
  // Timestamps
  { key: 'processedAt', label: 'Processed At', category: 'Timestamps', default: false },
  { key: 'fulfilledAt', label: 'Fulfilled At', category: 'Timestamps', default: false },
  { key: 'cancelledAt', label: 'Cancelled At', category: 'Timestamps', default: false },
  
  // IDs
  { key: 'shopifyId', label: 'Shopify ID', category: 'System', default: false },
  { key: 'id', label: 'Internal ID', category: 'System', default: false }
];

export const PRESET_VIEWS = [
  {
    id: 'default',
    name: 'All Orders',
    description: 'Complete order overview',
    columns: ['orderNumber', 'customerName', 'createdAt', 'productNames', 'itemCount', 'totalPrice', 'profit', 'margin', 'fulfillmentStatus', 'financialStatus'],
    icon: 'ShoppingCart'
  },
  {
    id: 'recent',
    name: 'Recent Orders',
    description: 'Orders from last 7 days',
    columns: ['orderNumber', 'customerName', 'createdAt', 'totalPrice', 'fulfillmentStatus', 'financialStatus'],
    icon: 'Calendar',
    filter: (order) => {
      const orderDate = new Date(order.createdAt);
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      return orderDate >= sevenDaysAgo;
    }
  },
  {
    id: 'pending',
    name: 'Pending Fulfillment',
    description: 'Orders awaiting fulfillment',
    columns: ['orderNumber', 'customerName', 'createdAt', 'itemCount', 'totalPrice', 'fulfillmentStatus'],
    icon: 'Clock',
    filter: (order) => order.fulfillmentStatus === 'unfulfilled' || order.fulfillmentStatus === 'partial'
  },
  {
    id: 'unpaid',
    name: 'Unpaid Orders',
    description: 'Orders with pending payment',
    columns: ['orderNumber', 'customerName', 'createdAt', 'totalPrice', 'financialStatus'],
    icon: 'AlertTriangle',
    filter: (order) => order.financialStatus !== 'paid'
  },
  {
    id: 'highvalue',
    name: 'High Value',
    description: 'Orders over 50,000 Ft',
    columns: ['orderNumber', 'customerName', 'createdAt', 'totalPrice', 'profit', 'margin', 'fulfillmentStatus'],
    icon: 'TrendingUp',
    filter: (order) => order.totalPrice > 50000
  }
];

export const DATE_RANGES = [
  { value: 'today', label: 'Today' },
  { value: 'yesterday', label: 'Yesterday' },
  { value: 'last7days', label: 'Last 7 Days' },
  { value: 'last30days', label: 'Last 30 Days' },
  { value: 'thisMonth', label: 'This Month' },
  { value: 'lastMonth', label: 'Last Month' },
  { value: 'last90days', label: 'Last 90 Days' },
  { value: 'thisYear', label: 'This Year' },
  { value: 'custom', label: 'Custom Range' }
];