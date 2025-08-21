import { Package, Box, DollarSign, AlertTriangle, Truck } from 'lucide-react';

// Column definitions with all Shopify fields
export const ALL_COLUMNS = [
  // Basic Info
  { key: 'name', label: 'Product Name', category: 'Basic', default: true },
  { key: 'sku', label: 'SKU', category: 'Basic', default: true },
  { key: 'status', label: 'Status', category: 'Basic', default: true },
  { key: 'vendor', label: 'Vendor', category: 'Basic', default: true },
  { key: 'type', label: 'Product Type', category: 'Basic', default: false },
  
  // Pricing
  { key: 'price', label: 'Price', category: 'Pricing', default: true },
  { key: 'comparePrice', label: 'Compare Price', category: 'Pricing', default: false },
  { key: 'cost', label: 'Cost', category: 'Pricing', default: true },
  { key: 'margin', label: 'Margin %', category: 'Pricing', default: true, calculated: true },
  { key: 'profit', label: 'Profit', category: 'Pricing', default: false, calculated: true },
  
  // Inventory
  { key: 'stock', label: 'Stock', category: 'Inventory', default: true },
  { key: 'stockValue', label: 'Stock Value', category: 'Inventory', default: false, calculated: true },
  { key: 'lowStock', label: 'Low Stock Alert', category: 'Inventory', default: false },
  { key: 'variants', label: 'Variants', category: 'Inventory', default: true },
  { key: 'totalStock', label: 'Total Stock', category: 'Inventory', default: false },
  
  // Organization
  { key: 'category', label: 'Category', category: 'Organization', default: true },
  { key: 'tags', label: 'Tags', category: 'Organization', default: false },
  { key: 'collections', label: 'Collections', category: 'Organization', default: false },
  
  // Media & Content
  { key: 'images', label: 'Images', category: 'Media', default: false },
  { key: 'description', label: 'Description', category: 'Media', default: false },
  { key: 'handle', label: 'URL Handle', category: 'Media', default: false },
  
  // Shipping & Fulfillment  
  { key: 'weight', label: 'Weight', category: 'Shipping', default: false },
  { key: 'weightUnit', label: 'Weight Unit', category: 'Shipping', default: false },
  { key: 'requiresShipping', label: 'Requires Shipping', category: 'Shipping', default: false },
  { key: 'barcode', label: 'Barcode', category: 'Shipping', default: false },
  
  // SEO & Marketing
  { key: 'seoTitle', label: 'SEO Title', category: 'SEO', default: false },
  { key: 'seoDescription', label: 'SEO Description', category: 'SEO', default: false },
  
  // Timestamps
  { key: 'createdAt', label: 'Created Date', category: 'Timestamps', default: false },
  { key: 'updatedAt', label: 'Last Updated', category: 'Timestamps', default: false },
  
  // IDs
  { key: 'shopifyId', label: 'Shopify ID', category: 'System', default: false },
  { key: 'id', label: 'Internal ID', category: 'System', default: false }
];

// Preset views with filters
export const PRESET_VIEWS = [
  {
    id: 'default',
    name: 'All Products',
    description: 'Complete product overview',
    columns: ['images', 'name', 'sku', 'status', 'price', 'cost', 'margin', 'stock', 'category', 'vendor'],
    icon: Package
  },
  {
    id: 'inventory',
    name: 'Inventory',
    description: 'Stock management view',
    columns: ['images', 'name', 'sku', 'stock', 'totalStock', 'stockValue', 'status', 'vendor'],
    icon: Box,
    filter: (product) => product.status === 'active' || product.status === 'ACTIVE'
  },
  {
    id: 'pricing',
    name: 'Pricing',
    description: 'Price and profitability analysis',
    columns: ['images', 'name', 'price', 'comparePrice', 'cost', 'margin', 'profit', 'category'],
    icon: DollarSign
  },
  {
    id: 'low-stock',
    name: 'Low Stock',
    description: 'Products needing restock',
    columns: ['images', 'name', 'sku', 'stock', 'cost', 'vendor', 'status'],
    icon: AlertTriangle,
    filter: (product) => {
      const stockLevel = product.totalStock || product.stock || 0;
      return stockLevel < 10 && stockLevel >= 0;
    }
  },
  {
    id: 'shipping',
    name: 'Shipping',
    description: 'Shipping and fulfillment details',
    columns: ['images', 'name', 'weight', 'weightUnit', 'requiresShipping', 'barcode', 'vendor'],
    icon: Truck
  }
];