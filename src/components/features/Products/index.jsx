import React, { useState, useEffect, useMemo, useRef } from 'react';
import { 
  Package, Filter, Download, RefreshCw, Settings, Save, 
  Eye, EyeOff, ChevronDown, ChevronRight, Search, X,
  DollarSign, TrendingUp, AlertTriangle, Box, Tag,
  BarChart3, ShoppingCart, Zap, Database, Check,
  Key, Link, Image, Calendar, Hash, Store, Plug, Layers, Menu,
  Upload, FileText, ArrowRight, Trash2
} from 'lucide-react';
import shopifyService from '../../../services/shopifyService';
import { useToast } from '../../common/ui/Toast';
import SectionHeader from '../../common/layout/SectionHeader';
import Papa from 'papaparse';
import ProductsTable from './ProductsTable';
import ProductsPagination from './ProductsPagination';

// Column definitions with all Shopify fields
const ALL_COLUMNS = [
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

// Preset views with filters - Simplified to 5 essential views
const PRESET_VIEWS = [
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
    id: 'variants',
    name: 'With Variants',
    description: 'Multi-variant products',
    columns: ['images', 'name', 'sku', 'variants', 'totalStock', 'price', 'category'],
    icon: Layers,
    filter: (product) => product.hasVariants
  }
];

function ProductsAdvanced() {
  const { showSuccess, showError, showWarning } = useToast();
  
  // State
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedView, setSelectedView] = useState('default');
  const [statusFilter, setStatusFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [customViews, setCustomViews] = useState(() => {
    const saved = localStorage.getItem('product_custom_views');
    return saved ? JSON.parse(saved) : [];
  });
  const [visibleColumns, setVisibleColumns] = useState(() => {
    const defaultView = PRESET_VIEWS.find(v => v.id === 'default');
    return defaultView ? defaultView.columns : ALL_COLUMNS.filter(c => c.default).map(c => c.key);
  });
  const [columnSettingsOpen, setColumnSettingsOpen] = useState(false);
  const [newViewName, setNewViewName] = useState('');
  const [expandedRows, setExpandedRows] = useState({});
  const [shopifyConnected, setShopifyConnected] = useState(false);
  const [showShopifySettings, setShowShopifySettings] = useState(false);
  
  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(50);
  const [shopifyCredentials, setShopifyCredentials] = useState({
    storeDomain: '',
    accessToken: ''
  });
  const [showKPICards, setShowKPICards] = useState(() => {
    const saved = localStorage.getItem('products_kpi_visible');
    return saved !== null ? JSON.parse(saved) : true;
  });
  const [showSidebar, setShowSidebar] = useState(() => {
    const saved = localStorage.getItem('products_sidebar_visible');
    if (saved !== null) {
      return JSON.parse(saved);
    }
    return window.innerWidth >= 1024;
  });
  const hasShownWarning = useRef(false);

  // Load products on mount
  useEffect(() => {
    let mounted = true;
    
    const initializeComponent = async () => {
      if (!mounted) return;
      await loadSettingsFromDatabase();
      checkShopifyConnection();
      await loadProducts();
    };
    
    initializeComponent();
    
    return () => {
      mounted = false;
    };
  }, []); // Only run once on mount

  // Save KPI cards state
  useEffect(() => {
    localStorage.setItem('products_kpi_visible', JSON.stringify(showKPICards));
  }, [showKPICards]);

  // Save sidebar state
  useEffect(() => {
    localStorage.setItem('products_sidebar_visible', JSON.stringify(showSidebar));
  }, [showSidebar]);

  // Load settings from database
  const loadSettingsFromDatabase = async () => {
    try {
      const response = await fetch('http://localhost:3001/api/settings');
      if (response.ok) {
        const settings = await response.json();
        if (settings.shopify_store_domain && settings.shopify_access_token) {
          shopifyService.saveCredentials(settings.shopify_store_domain, settings.shopify_access_token);
          setShopifyCredentials({
            storeDomain: settings.shopify_store_domain,
            accessToken: settings.shopify_access_token
          });
          setShopifyConnected(true);
        }
      }
    } catch (error) {
      console.error('Failed to load settings from database:', error);
    }
  };

  // Check Shopify connection
  const checkShopifyConnection = () => {
    const hasCredentials = shopifyService.hasCredentials();
    setShopifyConnected(hasCredentials);
    if (hasCredentials) {
      const creds = shopifyService.loadCredentials();
      if (creds) {
        setShopifyCredentials({
          storeDomain: creds.storeDomain,
          accessToken: creds.accessToken
        });
      }
    }
  };

  // Save Shopify credentials
  const saveShopifyCredentials = async () => {
    if (!shopifyCredentials.storeDomain || !shopifyCredentials.accessToken) {
      showError('Please enter both store domain and access token');
      return;
    }

    try {
      // Test connection first
      shopifyService.saveCredentials(shopifyCredentials.storeDomain, shopifyCredentials.accessToken);
      await shopifyService.testConnection();
      
      setShopifyConnected(true);
      setShowShopifySettings(false);
      showSuccess('Shopify connection successful!');
      
      // Load products after connection
      syncWithShopify();
    } catch (error) {
      showError('Failed to connect to Shopify: ' + error.message);
      shopifyService.clearCredentials();
      setShopifyConnected(false);
    }
  };

  // Disconnect Shopify
  const disconnectShopify = () => {
    if (confirm('Are you sure you want to disconnect from Shopify? This will clear cached products.')) {
      shopifyService.clearCredentials();
      setShopifyConnected(false);
      setProducts([]);
      setShopifyCredentials({ storeDomain: '', accessToken: '' });
      showSuccess('Disconnected from Shopify');
    }
  };

  // Load products from database
  const loadProducts = async () => {
    setLoading(true);
    try {
      // First try to load from database
      const response = await fetch('http://localhost:3001/api/products');
      if (response.ok) {
        const dbProducts = await response.json();
        if (dbProducts && dbProducts.length > 0) {
          setProducts(dbProducts);
          console.log(`Loaded ${dbProducts.length} products from database`);
          return;
        }
      }
      
      // If database is empty, don't load from cache
      // Only show warning message once
      if (!hasShownWarning.current) {
        showWarning('No products in database. Please sync with Shopify to import products.');
        hasShownWarning.current = true;
      }
    } catch (error) {
      console.error('Failed to load products:', error);
      // Try cache as fallback
      const cached = shopifyService.getCachedProducts();
      if (cached && cached.products) {
        setProducts(cached.products);
      }
    } finally {
      setLoading(false);
    }
  };

  // Sync with Shopify
  const syncWithShopify = async (saveToDb = false) => {
    if (!shopifyService.hasCredentials()) {
      showError('Please configure Shopify credentials first');
      return;
    }

    setSyncing(true);
    try {
      const fetchedProducts = await shopifyService.fetchProducts({ saveToDb });
      setProducts(fetchedProducts);
      if (saveToDb) {
        showSuccess(`Synced and saved ${fetchedProducts.length} products to database`);
      } else {
        showSuccess(`Synced ${fetchedProducts.length} products from Shopify`);
      }
    } catch (error) {
      showError('Failed to sync with Shopify: ' + error.message);
    } finally {
      setSyncing(false);
    }
  };

  // Calculate computed fields
  const enhancedProducts = useMemo(() => {
    return products.map(product => {
      const enhanced = { ...product };
      
      // Calculate margin percentage
      if (enhanced.price && enhanced.cost) {
        enhanced.margin = ((enhanced.price - enhanced.cost) / enhanced.price * 100).toFixed(1);
        enhanced.profit = (enhanced.price - enhanced.cost).toFixed(2);
      } else if (enhanced.priceMin && enhanced.cost) {
        // For products with variants, use min price
        enhanced.margin = ((enhanced.priceMin - enhanced.cost) / enhanced.priceMin * 100).toFixed(1);
        enhanced.profit = (enhanced.priceMin - enhanced.cost).toFixed(2);
      }
      
      // Calculate stock value
      if (enhanced.totalStock && enhanced.cost) {
        enhanced.stockValue = (enhanced.totalStock * enhanced.cost).toFixed(2);
      } else if (enhanced.stock && enhanced.cost) {
        enhanced.stockValue = (enhanced.stock * enhanced.cost).toFixed(2);
      }
      
      // Low stock indicator
      const stockLevel = enhanced.totalStock || enhanced.stock || 0;
      enhanced.lowStock = stockLevel < 10 && stockLevel > 0;
      
      // Count variants
      if (enhanced.hasVariants && enhanced.variants) {
        enhanced.variantCount = enhanced.variants.length;
      }
      
      return enhanced;
    });
  }, [products]);

  // Get unique categories and types
  const categories = useMemo(() => {
    const cats = new Set();
    products.forEach(p => {
      if (p.type) cats.add(p.type); // Use type field as category
      if (p.category && p.category !== 'Uncategorized') cats.add(p.category);
    });
    return Array.from(cats).sort();
  }, [products]);

  // Filter products based on search and current view
  const filteredProducts = useMemo(() => {
    let filtered = enhancedProducts;
    
    // Apply view filter if exists
    const currentView = PRESET_VIEWS.find(v => v.id === selectedView) || 
                       customViews.find(v => v.id === selectedView);
    if (currentView && currentView.filter) {
      filtered = filtered.filter(currentView.filter);
    }
    
    // Apply status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(product => {
        const status = product.status?.toLowerCase();
        if (statusFilter === 'active') return status === 'active';
        if (statusFilter === 'draft') return status === 'draft';
        if (statusFilter === 'archived') return status === 'archived';
        return false;
      });
    }
    
    // Apply category filter
    if (categoryFilter !== 'all') {
      filtered = filtered.filter(product => 
        product.type === categoryFilter || product.category === categoryFilter
      );
    }
    
    // Apply search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(product => 
        product.name?.toLowerCase().includes(term) ||
        product.sku?.toLowerCase().includes(term) ||
        product.vendor?.toLowerCase().includes(term) ||
        product.category?.toLowerCase().includes(term) ||
        (Array.isArray(product.tags) && product.tags.some(tag => tag.toLowerCase().includes(term)))
      );
    }
    
    return filtered;
  }, [enhancedProducts, searchTerm, selectedView, customViews, statusFilter, categoryFilter]);

  // Paginated products
  const paginatedProducts = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return filteredProducts.slice(startIndex, endIndex);
  }, [filteredProducts, currentPage, itemsPerPage]);

  // Calculate total pages
  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, selectedView, statusFilter, categoryFilter]);

  // Handle view change
  const handleViewChange = (viewId) => {
    setSelectedView(viewId);
    const view = PRESET_VIEWS.find(v => v.id === viewId) || 
                 customViews.find(v => v.id === viewId);
    if (view) {
      setVisibleColumns(view.columns);
    }
  };

  // Save custom view
  const saveCustomView = () => {
    if (!newViewName) {
      showError('Please enter a view name');
      return;
    }
    
    const newView = {
      id: `custom-${Date.now()}`,
      name: newViewName,
      columns: visibleColumns,
      custom: true
    };
    
    const updatedViews = [...customViews, newView];
    setCustomViews(updatedViews);
    localStorage.setItem('product_custom_views', JSON.stringify(updatedViews));
    setNewViewName('');
    showSuccess(`Saved view: ${newViewName}`);
  };

  // Delete custom view
  const deleteCustomView = (viewId) => {
    const updatedViews = customViews.filter(v => v.id !== viewId);
    setCustomViews(updatedViews);
    localStorage.setItem('product_custom_views', JSON.stringify(updatedViews));
    
    if (selectedView === viewId) {
      handleViewChange('default');
    }
    showSuccess('View deleted');
  };

  // Toggle column visibility
  const toggleColumn = (columnKey) => {
    if (visibleColumns.includes(columnKey)) {
      setVisibleColumns(visibleColumns.filter(c => c !== columnKey));
    } else {
      setVisibleColumns([...visibleColumns, columnKey]);
    }
  };

  // Toggle row expansion (for variants)
  const toggleRowExpansion = (productId) => {
    setExpandedRows(prev => ({
      ...prev,
      [productId]: !prev[productId]
    }));
  };

  // Handle CSV import
  const handleCsvImport = (event) => {
    const file = event.target.files[0];
    if (!file) return;
    
    Papa.parse(file, {
      header: true,
      complete: (results) => {
        console.log('CSV parsed:', results.data.length, 'rows');
        
        const importedProducts = [];
        const productMap = new Map();
        
        results.data.forEach(row => {
          // Skip empty rows
          if (!row.Handle && !row.Title && !row.SKU) return;
          
          const handle = row.Handle || row.SKU || `product-${Date.now()}`;
          
          if (!productMap.has(handle)) {
            // New product
            productMap.set(handle, {
              id: `import-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
              handle: handle,
              name: row.Title || row.Name || '',
              sku: row.SKU || '',
              vendor: row.Vendor || '',
              type: row.Type || row['Product Type'] || '',
              category: row.Type || row['Product Type'] || 'Imported',
              tags: row.Tags ? row.Tags.split(',').map(t => t.trim()) : [],
              status: row.Status?.toLowerCase() || 'active',
              price: parseFloat(row.Price || row['Variant Price'] || 0),
              cost: parseFloat(row.Cost || row['Variant Cost'] || 0),
              comparePrice: parseFloat(row['Compare At Price'] || row['Variant Compare At Price'] || 0),
              stock: parseInt(row.Stock || row['Variant Inventory Qty'] || 0),
              barcode: row.Barcode || row['Variant Barcode'] || '',
              weight: parseFloat(row.Weight || row['Variant Grams'] || 0),
              weightUnit: row['Weight Unit'] || 'g',
              images: row['Image Src'] ? [row['Image Src']] : [],
              source: 'csv_import',
              hasVariants: false,
              variants: []
            });
          }
          
          // Check if this is a variant row
          if (row['Option1 Value']) {
            const product = productMap.get(handle);
            product.hasVariants = true;
            product.variants.push({
              id: `var-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
              name: row['Option1 Value'] || 'Default',
              sku: row['Variant SKU'] || row.SKU || '',
              price: parseFloat(row['Variant Price'] || row.Price || 0),
              cost: parseFloat(row['Variant Cost'] || row.Cost || 0),
              comparePrice: parseFloat(row['Variant Compare At Price'] || 0),
              stock: parseInt(row['Variant Inventory Qty'] || row.Stock || 0),
              barcode: row['Variant Barcode'] || row.Barcode || '',
              weight: parseFloat(row['Variant Grams'] || row.Weight || 0),
              option1: row['Option1 Value'],
              option2: row['Option2 Value'],
              option3: row['Option3 Value']
            });
          }
        });
        
        // Convert map to array
        productMap.forEach(product => {
          // If product has variants, update totals
          if (product.hasVariants && product.variants && Array.isArray(product.variants) && product.variants.length > 0) {
            product.totalStock = product.variants.reduce((sum, v) => sum + (v.stock || 0), 0);
            const prices = product.variants.map(v => v.price);
            product.priceMin = Math.min(...prices);
            product.priceMax = Math.max(...prices);
            // Use first variant's data for main product if not set
            if (!product.price && product.variants[0]) {
              product.price = product.variants[0].price;
              product.cost = product.variants[0].cost;
              product.sku = product.variants[0].sku;
            }
          }
          importedProducts.push(product);
        });
        
        // Update products list
        setProducts(importedProducts);
        showSuccess(`Imported ${importedProducts.length} products from CSV`);
        
        // Save to localStorage
        localStorage.setItem('csv_imported_products', JSON.stringify(importedProducts));
        
        // Reset file input
        event.target.value = '';
      },
      error: (error) => {
        console.error('CSV parse error:', error);
        showError('Failed to parse CSV file');
      }
    });
  };
  
  // Export data
  const exportData = () => {
    const csv = [
      visibleColumns.map(col => {
        const column = ALL_COLUMNS.find(c => c.key === col);
        return column ? column.label : col;
      }).join(','),
      ...filteredProducts.map(product => 
        visibleColumns.map(col => {
          const value = product[col];
          if (Array.isArray(value)) return `"${value.join('; ')}"`;
          if (typeof value === 'object') return `"${JSON.stringify(value)}"`;
          if (typeof value === 'string' && value.includes(',')) return `"${value}"`;
          return value || '';
        }).join(',')
      )
    ].join('\n');
    
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `products-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    showSuccess('Products exported to CSV');
  };

  // Render column value
  const renderColumnValue = (product, columnKey) => {
    const value = product[columnKey];
    
    switch(columnKey) {
      case 'images':
        if (!value || value.length === 0) {
          return (
            <div className="w-10 h-10 rounded bg-white/10 flex items-center justify-center">
              <Package size={16} className="text-white/30" />
            </div>
          );
        }
        return (
          <img 
            src={value[0]} 
            alt={product.name} 
            className="w-10 h-10 rounded object-cover border border-white/20"
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiBmaWxsPSIjMjAyMDIwIi8+CjxwYXRoIGQ9Ik0yMCAxMEwxMCAxNVYyNUwyMCAzMEwzMCAyNVYxNUwyMCAxMFoiIHN0cm9rZT0iIzQwNDA0MCIgc3Ryb2tlLXdpZHRoPSIyIi8+Cjwvc3ZnPg==';
            }}
          />
        );
      
      case 'name':
        if (!value) return '-';
        return (
          <div className="font-medium text-white">
            {value}
          </div>
        );
      
      case 'status':
        const isActive = value === 'active' || value === 'ACTIVE';
        return (
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
            isActive ? 'bg-green-500/20 text-green-300' : 'bg-gray-500/20 text-gray-300'
          }`}>
            {value || 'unknown'}
          </span>
        );
      
      case 'price':
      case 'comparePrice':
      case 'cost':
        // For products with variants, show average prices
        if (product.hasVariants && product.variants && Array.isArray(product.variants) && product.variants.length > 0) {
          let avgValue = 0;
          if (columnKey === 'price') {
            avgValue = product.variants.reduce((sum, v) => sum + (v.price || 0), 0) / product.variants.length;
            if (avgValue === 0) return '-';
            return (
              <span className="text-white/80">
                <span className="text-xs text-white/50">avg: </span>
                {Math.round(avgValue)} Ft
              </span>
            );
          } else if (columnKey === 'cost') {
            avgValue = product.variants.reduce((sum, v) => sum + (v.cost || 0), 0) / product.variants.length;
            if (avgValue === 0) return '-';
            return (
              <span className="text-white/80">
                <span className="text-xs text-white/50">avg: </span>
                {Math.round(avgValue)} Ft
              </span>
            );
          } else if (columnKey === 'comparePrice') {
            const validPrices = product.variants.filter(v => v.comparePrice);
            if (validPrices.length === 0) return '-';
            avgValue = validPrices.reduce((sum, v) => sum + v.comparePrice, 0) / validPrices.length;
            if (avgValue === 0) return '-';
            return (
              <span className="text-white/80">
                <span className="text-xs text-white/50">avg: </span>
                {Math.round(avgValue)} Ft
              </span>
            );
          }
        }
        if (!value || value === 0) return '-';
        return `${Math.round(parseFloat(value))} Ft`;
      
      case 'profit':
        // Calculate profit for products with variants
        if (product.hasVariants && product.variants && Array.isArray(product.variants) && product.variants.length > 0) {
          const avgPrice = product.variants.reduce((sum, v) => sum + (v.price || 0), 0) / product.variants.length;
          const avgCost = product.variants.reduce((sum, v) => sum + (v.cost || 0), 0) / product.variants.length;
          const profit = avgPrice - avgCost;
          if (profit <= 0) return '-';
          return (
            <span className="text-white/80">
              <span className="text-xs text-white/50">avg: </span>
              {Math.round(profit)} Ft
            </span>
          );
        }
        if (!value || value === 0) return '-';
        return `${Math.round(parseFloat(value))} Ft`;
      
      case 'stockValue':
        // Calculate stock value for products
        let stockValue = 0;
        if (product.hasVariants && product.variants && Array.isArray(product.variants) && product.variants.length > 0) {
          stockValue = product.variants.reduce((sum, v) => {
            return sum + ((v.stock || 0) * (v.cost || 0));
          }, 0);
        } else {
          stockValue = (product.stock || 0) * (product.cost || 0);
        }
        if (stockValue === 0) return '-';
        return `${Math.round(stockValue).toLocaleString()} Ft`;
      
      case 'margin':
        // Calculate margin for products with variants
        let marginValue = 0;
        if (product.hasVariants && product.variants && Array.isArray(product.variants) && product.variants.length > 0) {
          const margins = product.variants
            .filter(v => v.cost && v.price && v.price > 0)
            .map(v => ((v.price - v.cost) / v.price) * 100);
          if (margins.length === 0) return '-';
          marginValue = margins.reduce((sum, m) => sum + m, 0) / margins.length;
          return (
            <span className={`font-medium ${
              marginValue > 50 ? 'text-green-400' : 
              marginValue > 30 ? 'text-yellow-400' : 
              'text-red-400'
            }`}>
              <span className="text-xs text-white/50">avg: </span>
              {marginValue.toFixed(1)}%
            </span>
          );
        }
        if (!value) return '-';
        marginValue = parseFloat(value);
        return (
          <span className={`font-medium ${
            marginValue > 50 ? 'text-green-400' : 
            marginValue > 30 ? 'text-yellow-400' : 
            'text-red-400'
          }`}>
            {value}%
          </span>
        );
      
      case 'stock':
      case 'totalStock':
        const stockVal = value || 0;
        if (stockVal === 0) return '-';
        return (
          <span className={`font-medium ${
            stockVal < 10 ? 'text-yellow-400' : 
            'text-green-400'
          }`}>
            {stockVal}
          </span>
        );
      
      case 'lowStock':
        return value ? (
          <AlertTriangle size={16} className="text-yellow-400" />
        ) : null;
      
      case 'variants':
        if (!product.hasVariants) return <span className="text-white/50">-</span>;
        return (
          <span className="px-2 py-1 bg-blue-500/20 text-blue-300 rounded text-sm font-medium">
            {product.variantCount || product.variants?.length || 0} variants
          </span>
        );
      
      case 'tags':
        if (!value || value.length === 0) return '-';
        return (
          <div className="flex flex-wrap gap-1">
            {value.slice(0, 3).map((tag, i) => (
              <span key={i} className="px-2 py-0.5 bg-blue-500/20 text-blue-300 rounded text-xs">
                {tag}
              </span>
            ))}
            {value.length > 3 && (
              <span className="text-xs text-gray-400">+{value.length - 3}</span>
            )}
          </div>
        );
      
      
      case 'createdAt':
      case 'updatedAt':
        return value ? new Date(value).toLocaleDateString() : '-';
      
      case 'description':
        if (!value) return '-';
        const text = value.length > 100 ? value.substring(0, 100) + '...' : value;
        return (
          <span className="text-xs text-white/70" title={value}>
            {text}
          </span>
        );
      
      default:
        return value || '-';
    }
  };

  // Calculate metrics for KPI cards based on filtered products
  const metrics = useMemo(() => {
    const activeProducts = filteredProducts.filter(p => p.status === 'active' || p.status === 'ACTIVE');
    const lowStockProducts = filteredProducts.filter(p => {
      const stock = p.totalStock || p.stock || 0;
      return stock > 0 && stock < 10;
    });
    const outOfStock = filteredProducts.filter(p => {
      const stock = p.totalStock || p.stock || 0;
      return stock === 0;
    });
    
    // Calculate total stock value - properly handle variants
    const totalStockValue = filteredProducts.reduce((sum, p) => {
      if (p.hasVariants && p.variants && Array.isArray(p.variants) && p.variants.length > 0) {
        // For products with variants, sum up each variant's stock * cost
        return sum + p.variants.reduce((varSum, v) => {
          const varStock = v.stock || 0;
          const varCost = v.cost || 0;
          return varSum + (varStock * varCost);
        }, 0);
      } else {
        // For single products
        const stock = p.stock || 0;
        const cost = p.cost || 0;
        return sum + (stock * cost);
      }
    }, 0);
    
    // Calculate average margin - considering variants
    const margins = [];
    filteredProducts.forEach(p => {
      if (p.hasVariants && p.variants && Array.isArray(p.variants) && p.variants.length > 0) {
        p.variants.forEach(v => {
          if (v.cost && v.price && v.price > 0) {
            margins.push(((v.price - v.cost) / v.price) * 100);
          }
        });
      } else if (p.cost && p.price && p.price > 0) {
        margins.push(((p.price - p.cost) / p.price) * 100);
      }
    });
    const avgMargin = margins.length > 0 ? 
      margins.reduce((sum, m) => sum + m, 0) / margins.length : 0;
    
    return {
      totalProducts: filteredProducts.length,
      activeProducts: activeProducts.length,
      lowStock: lowStockProducts.length,
      outOfStock: outOfStock.length,
      totalValue: Math.round(totalStockValue),
      avgMargin: avgMargin.toFixed(1)
    };
  }, [filteredProducts]);

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Section Header */}
      <SectionHeader 
        icon={Package}
        iconColorClass="from-blue-400/20 to-cyan-600/20"
        iconBorderClass="border-blue-400/30"
        iconColor="text-blue-300"
        title="Product Management"
        subtitle="Complete Shopify product inventory and analytics"
        showKPICards={showKPICards}
        onToggleKPICards={() => setShowKPICards(prev => !prev)}
        showSidebar={showSidebar}
        onToggleSidebar={() => setShowSidebar(prev => !prev)}
      />

      {/* KPI Cards */}
      {showKPICards && (
        <div className="px-6 mb-4">
          <div className="flex gap-4 overflow-x-auto pb-2">
            {/* Total Products */}
            <div className="glass-card p-3 rounded-xl bg-gradient-to-br from-blue-500/10 to-cyan-500/10 relative overflow-hidden flex-shrink-0" style={{minWidth: '160px'}}>
              <div className="relative z-10">
                <div className="flex items-center gap-2 mb-2">
                  <Package className="text-blue-400" size={16} />
                  <h3 className="font-semibold text-white text-sm">Total Products</h3>
                </div>
                <div className="flex items-baseline gap-1">
                  <span className="text-2xl font-bold text-white">{metrics.totalProducts}</span>
                  <span className="text-xs text-green-400">{metrics.activeProducts} active</span>
                </div>
              </div>
            </div>

            {/* Stock Value */}
            <div className="glass-card p-3 rounded-xl bg-gradient-to-br from-green-500/10 to-emerald-500/10 relative overflow-hidden flex-shrink-0" style={{minWidth: '160px'}}>
              <div className="relative z-10">
                <div className="flex items-center gap-2 mb-2">
                  <DollarSign className="text-green-400" size={16} />
                  <h3 className="font-semibold text-white text-sm">Stock Value</h3>
                </div>
                <div className="flex items-baseline gap-1">
                  <span className="text-2xl font-bold text-white">{metrics.totalValue.toLocaleString()} Ft</span>
                </div>
              </div>
            </div>

            {/* Average Margin */}
            <div className="glass-card p-3 rounded-xl bg-gradient-to-br from-purple-500/10 to-pink-500/10 relative overflow-hidden flex-shrink-0" style={{minWidth: '160px'}}>
              <div className="relative z-10">
                <div className="flex items-center gap-2 mb-2">
                  <TrendingUp className="text-purple-400" size={16} />
                  <h3 className="font-semibold text-white text-sm">Avg Margin</h3>
                </div>
                <div className="flex items-baseline gap-1">
                  <span className="text-2xl font-bold text-white">{metrics.avgMargin}%</span>
                </div>
              </div>
            </div>

            {/* Low Stock Alert */}
            <div className="glass-card p-3 rounded-xl bg-gradient-to-br from-yellow-500/10 to-orange-500/10 relative overflow-hidden flex-shrink-0" style={{minWidth: '160px'}}>
              <div className="relative z-10">
                <div className="flex items-center gap-2 mb-2">
                  <AlertTriangle className="text-yellow-400" size={16} />
                  <h3 className="font-semibold text-white text-sm">Stock Alerts</h3>
                </div>
                <div className="flex items-baseline gap-1">
                  <span className="text-2xl font-bold text-yellow-400">{metrics.lowStock}</span>
                  <span className="text-xs text-white/60">low stock</span>
                  {metrics.outOfStock > 0 && (
                    <span className="text-xs text-red-400 ml-1">({metrics.outOfStock} out)</span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className={`flex-1 px-6 pb-6 overflow-hidden flex ${showSidebar ? 'gap-4' : ''}`}>
        <div className="flex-1 flex flex-col">
        {/* Controls Header */}
        <div className="glass-card-large p-4 mb-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <span className="px-3 py-1 bg-blue-500/20 text-blue-300 rounded-full text-sm">
                {filteredProducts.length} / {products.length} products
              </span>
            </div>
            
            <div className="flex items-center gap-3">
              {/* DELETE ALL BUTTON */}
              <button
                onClick={async () => {
                  if (confirm(`Are you sure you want to delete all ${products.length} products from the database? This cannot be undone!`)) {
                    try {
                      // Delete from database
                      const response = await fetch('http://localhost:3001/api/products', {
                        method: 'DELETE'
                      });
                      const data = await response.json();
                      
                      if (response.ok) {
                        // Clear all localStorage
                        localStorage.removeItem('shopify_products_cache');
                        localStorage.removeItem('shopify_products_active');
                        localStorage.removeItem('hr_products');
                        localStorage.removeItem('hr_products_imported');
                        // Reset products state
                        setProducts([]);
                        showSuccess(`Deleted ${data.count} products from database!`);
                      } else {
                        showError('Failed to delete products: ' + data.error);
                      }
                    } catch (error) {
                      console.error('Error:', error);
                      showError('Failed to delete products');
                    }
                  }
                }}
                className="glass-button px-3 py-2 flex items-center gap-2 hover:scale-105 transition-transform bg-red-500/20 border-red-400/30 hover:bg-red-500/30"
              >
                <X size={16} />
                Delete All ({products.length})
              </button>
              
              {/* Export button */}
              <button
                onClick={exportData}
                className="glass-button px-3 py-2 flex items-center gap-2 hover:scale-105 transition-transform"
              >
                <Download size={16} />
                Export
              </button>
              
              {/* Column settings */}
              <button
                onClick={() => setColumnSettingsOpen(!columnSettingsOpen)}
                className="glass-button px-3 py-2 flex items-center gap-2 hover:scale-105 transition-transform"
              >
                <Settings size={16} />
                Columns
              </button>
            </div>
          </div>
          
          {/* Search and Filters */}
          <div className="flex gap-3">
          {/* Search */}
          <div className="flex-1 relative">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/50" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search products..."
              className="w-full glass-input pl-10 pr-4 py-2"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-white/50 hover:text-white"
              >
                <X size={16} />
              </button>
            )}
          </div>
          
          {/* Status filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="glass-input px-4 py-2"
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="draft">Draft</option>
            <option value="archived">Archived</option>
          </select>
          
          {/* Category filter */}
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="glass-input px-4 py-2"
          >
            <option value="all">All Categories</option>
            {categories.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
          
          {/* View selector */}
          <select
            value={selectedView}
            onChange={(e) => handleViewChange(e.target.value)}
            className="glass-input px-4 py-2 min-w-[200px]"
          >
            <optgroup label="Preset Views">
              {PRESET_VIEWS.map(view => (
                <option key={view.id} value={view.id}>
                  {view.name}
                </option>
              ))}
            </optgroup>
            {customViews.length > 0 && (
              <optgroup label="Custom Views">
                {customViews.map(view => (
                  <option key={view.id} value={view.id}>
                    {view.name}
                  </option>
                ))}
              </optgroup>
            )}
          </select>
          </div>
        </div>
        
        {/* Column Settings Panel */}
        {columnSettingsOpen && (
          <div className="glass-card-large p-6 mb-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-white">Column Settings</h3>
              <div className="flex items-center gap-3">
                <input
                  type="text"
                  value={newViewName}
                  onChange={(e) => setNewViewName(e.target.value)}
                  placeholder="View name..."
                  className="glass-input px-3 py-1 text-sm"
                />
                <button
                  onClick={saveCustomView}
                  className="glass-button px-3 py-1 flex items-center gap-2 text-sm hover:scale-105"
                >
                  <Save size={14} />
                  Save View
                </button>
              </div>
            </div>
            
            {/* Column categories */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {Object.entries(
                ALL_COLUMNS.reduce((acc, col) => {
                  if (!acc[col.category]) acc[col.category] = [];
                  acc[col.category].push(col);
                  return acc;
                }, {})
              ).map(([category, columns]) => (
                <div key={category} className="glass-card p-3">
                  <h4 className="text-sm font-medium text-white/70 mb-2">{category}</h4>
                  <div className="space-y-1">
                    {columns.map(col => (
                      <label key={col.key} className="flex items-center gap-2 cursor-pointer hover:bg-white/5 p-1 rounded">
                        <input
                          type="checkbox"
                          checked={visibleColumns.includes(col.key)}
                          onChange={() => toggleColumn(col.key)}
                          className="rounded"
                        />
                        <span className="text-sm text-white/80">{col.label}</span>
                        {col.calculated && (
                          <Zap size={12} className="text-yellow-400" title="Calculated field" />
                        )}
                      </label>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
        
        {/* Products Table with Pagination */}
        <div className="flex-1 flex flex-col glass-card-large overflow-hidden">
          <div className="flex-1 overflow-auto">
            <ProductsTable 
              products={paginatedProducts}
              visibleColumns={visibleColumns}
              expandedRows={expandedRows}
              onToggleExpand={toggleRowExpansion}
              renderColumnValue={renderColumnValue}
              loading={loading}
            />
          </div>
          
          {/* Pagination */}
          {filteredProducts.length > 0 && (
            <ProductsPagination 
              currentPage={currentPage}
              totalPages={totalPages}
              totalItems={filteredProducts.length}
              itemsPerPage={itemsPerPage}
              onPageChange={setCurrentPage}
            />
          )}
        </div>
        
          {/* Custom Views Management */}
          {customViews.length > 0 && selectedView.startsWith('custom-') && (
            <div className="mt-4 flex justify-end">
              <button
                onClick={() => deleteCustomView(selectedView)}
                className="glass-button px-3 py-1 text-sm text-red-400 hover:text-red-300"
              >
                Delete Current View
              </button>
            </div>
          )}
        </div>
        
        {/* Right Sidebar */}
        {showSidebar && (
          <div className="w-80 flex-shrink-0 space-y-4">
            {/* DELETE ALL PRODUCTS SECTION */}
            <div className="glass-card-large p-4 bg-gradient-to-br from-red-500/10 to-orange-500/10 border border-red-400/20">
              <div className="flex items-center gap-2 mb-4">
                <X className="text-red-400" size={20} />
                <h3 className="font-semibold text-white">Product Actions</h3>
              </div>
              
              <button
                onClick={async () => {
                  if (confirm(`Are you sure you want to delete all ${products.length} products?\n\nThis will permanently delete all products from the database.`)) {
                    try {
                      // Delete from database
                      const response = await fetch('http://localhost:3001/api/products', {
                        method: 'DELETE'
                      });
                      const data = await response.json();
                      
                      if (response.ok) {
                        // Clear all localStorage
                        localStorage.removeItem('shopify_products_cache');
                        localStorage.removeItem('shopify_products_active');
                        localStorage.removeItem('hr_products');
                        localStorage.removeItem('hr_products_imported');
                        // Reset products state
                        setProducts([]);
                        showSuccess(`Deleted ${data.count} products from database!`);
                      } else {
                        showError('Failed to delete products: ' + data.error);
                      }
                    } catch (error) {
                      console.error('Error deleting products:', error);
                      showError('Failed to delete products');
                    }
                  }
                }}
                disabled={products.length === 0}
                className="w-full py-3 px-4 bg-red-900/80 hover:bg-red-800 text-white font-semibold rounded-xl transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 border border-red-700/50"
              >
                <Trash2 size={18} />
                Delete All Products ({products.length})
              </button>
              
              <p className="text-xs text-white/50 mt-3">
                This action will permanently delete all products from your local storage. This cannot be undone.
              </p>
            </div>
            
            {/* Import CSV Section */}
            <div className="glass-card-large p-4">
              <div className="flex items-center gap-2 mb-4">
                <Upload className="text-blue-400" size={20} />
                <h3 className="font-semibold text-white">Import CSV</h3>
              </div>
              
              <div className="space-y-3">
                <p className="text-sm text-white/60">
                  Import products from a CSV file exported from Shopify or other e-commerce platforms.
                </p>
                
                <input
                  type="file"
                  accept=".csv"
                  onChange={handleCsvImport}
                  className="hidden"
                  id="csv-upload"
                />
                <label
                  htmlFor="csv-upload"
                  className="glass-button w-full px-4 py-2 flex items-center justify-center gap-2 cursor-pointer hover:scale-105 transition-transform"
                >
                  <FileText size={16} />
                  Choose CSV File
                </label>
                
                <div className="text-xs text-white/40">
                  Supported columns: Handle, Title, Vendor, Type, Tags, Status, Price, Cost, SKU, Barcode, Stock
                </div>
              </div>
            </div>
            
            {/* Shopify API Section */}
            <div className="glass-card-large p-4">
              <div className="flex items-center gap-2 mb-4">
                <Store className="text-green-400" size={20} />
                <h3 className="font-semibold text-white">Shopify API</h3>
              </div>
              
              {shopifyConnected ? (
                <div className="space-y-3">
                  <div className="p-3 bg-green-500/10 border border-green-500/30 rounded-lg">
                    <div className="flex items-center gap-2 mb-1">
                      <Check size={16} className="text-green-400" />
                      <span className="text-sm font-medium text-green-400">Connected</span>
                    </div>
                    <p className="text-xs text-white/60">
                      {shopifyCredentials.storeDomain}.myshopify.com
                    </p>
                  </div>
                  
                  <button
                    onClick={() => syncWithShopify(false)}
                    disabled={syncing}
                    className="glass-button w-full px-4 py-2 flex items-center justify-center gap-2 hover:scale-105 transition-transform"
                  >
                    <RefreshCw size={16} className={syncing ? 'animate-spin' : ''} />
                    {syncing ? 'Syncing...' : 'Sync Products'}
                  </button>
                  
                  <button
                    onClick={() => syncWithShopify(true)}
                    disabled={syncing}
                    className="glass-button-success w-full px-4 py-2 flex items-center justify-center gap-2 hover:scale-105 transition-transform mt-2"
                  >
                    <Database size={16} className={syncing ? 'animate-spin' : ''} />
                    {syncing ? 'Saving...' : 'Sync & Save to DB'}
                  </button>
                  
                  <button
                    onClick={() => setShowShopifySettings(true)}
                    className="glass-button w-full px-4 py-2 flex items-center justify-center gap-2 text-white/60 hover:text-white transition-colors"
                  >
                    <Settings size={16} />
                    Settings
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  <p className="text-sm text-white/60">
                    Connect to your Shopify store to sync products automatically.
                  </p>
                  
                  <button
                    onClick={() => setShowShopifySettings(true)}
                    className="glass-button w-full px-4 py-2 flex items-center justify-center gap-2 bg-green-500/20 border-green-500/50 hover:bg-green-500/30 transition-colors"
                  >
                    <Plug size={16} />
                    Connect Shopify
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
      
      {/* Shopify Settings Modal */}
      {showShopifySettings && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="glass-card-large w-full max-w-lg">
            <div className="p-6 border-b border-white/20">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Store size={24} className="text-green-400" />
                  <h2 className="text-xl font-bold text-white">Shopify Settings</h2>
                </div>
                <button
                  onClick={() => setShowShopifySettings(false)}
                  className="p-2 rounded-lg hover:bg-white/10 transition-colors"
                >
                  <X size={20} className="text-white/70" />
                </button>
              </div>
            </div>
            
            <div className="p-6 space-y-6">
              {shopifyConnected ? (
                <>
                  <div className="p-4 bg-green-500/10 border border-green-500/30 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <Check size={20} className="text-green-400" />
                      <span className="font-medium text-green-400">Connected to Shopify</span>
                    </div>
                    <p className="text-sm text-white/70">
                      Store: {shopifyCredentials.storeDomain}.myshopify.com
                    </p>
                  </div>
                  
                  <div className="space-y-3">
                    <button
                      onClick={async () => {
                        setShowShopifySettings(false);
                        await syncWithShopify();
                      }}
                      className="w-full glass-button px-4 py-3 flex items-center justify-center gap-2 hover:scale-105 transition-transform"
                    >
                      <RefreshCw size={18} />
                      Sync Products Now
                    </button>
                    
                    <button
                      onClick={disconnectShopify}
                      className="w-full glass-button px-4 py-3 flex items-center justify-center gap-2 bg-red-500/20 border-red-500/50 hover:bg-red-500/30 transition-colors"
                    >
                      <Plug size={18} />
                      Disconnect Shopify
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-white/70 mb-2">
                        Store Domain
                      </label>
                      <input
                        type="text"
                        value={shopifyCredentials.storeDomain}
                        onChange={(e) => setShopifyCredentials(prev => ({ ...prev, storeDomain: e.target.value }))}
                        placeholder="your-store-name"
                        className="w-full glass-input px-4 py-2"
                      />
                      <p className="text-xs text-white/50 mt-1">
                        Enter your store name without .myshopify.com
                      </p>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-white/70 mb-2">
                        Access Token
                      </label>
                      <input
                        type="password"
                        value={shopifyCredentials.accessToken}
                        onChange={(e) => setShopifyCredentials(prev => ({ ...prev, accessToken: e.target.value }))}
                        placeholder="shpat_xxxxxxxxxxxxx"
                        className="w-full glass-input px-4 py-2"
                      />
                      <p className="text-xs text-white/50 mt-1">
                        Create a private app in Shopify Admin to get an access token
                      </p>
                    </div>
                  </div>
                  
                  <div className="p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg">
                    <h3 className="font-medium text-blue-400 mb-2">How to get Access Token:</h3>
                    <ol className="text-sm text-white/70 space-y-1 list-decimal list-inside">
                      <li>Go to Shopify Admin → Settings → Apps</li>
                      <li>Click "Develop apps" → "Create an app"</li>
                      <li>Configure Admin API scopes (read_products, read_inventory)</li>
                      <li>Install the app and copy the Admin API access token</li>
                    </ol>
                  </div>
                  
                  <button
                    onClick={saveShopifyCredentials}
                    className="w-full glass-button px-4 py-3 flex items-center justify-center gap-2 bg-green-500/20 border-green-500/50 hover:bg-green-500/30 transition-colors"
                  >
                    <Plug size={18} />
                    Connect to Shopify
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ProductsAdvanced;