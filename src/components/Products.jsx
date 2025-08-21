import React, { useState, useEffect, useMemo } from 'react';
import { 
  Package, Filter, Download, RefreshCw, Settings, Save, 
  Eye, EyeOff, ChevronDown, ChevronRight, Search, X,
  DollarSign, TrendingUp, AlertTriangle, Box, Tag,
  BarChart3, ShoppingCart, Zap, Database, Check,
  Plus, Trash2, Upload, PlusCircle, Archive, Layers,
  FileDown, Menu, Mail, Bell, Send, BarChart
} from 'lucide-react';
import API from '../api';
import { TruncatedTooltip } from './LiquidTooltip';
import { useToast } from './Toast';
import Papa from 'papaparse';
import emailService from '../services/emailService';
import shopifyService from '../services/shopifyService';

// Helper functions
function uid() { 
  return Date.now().toString(36) + Math.random().toString(36).substr(2); 
}

// Products Component with Variant Support
function Products() {
  const { showSuccess, showError, showWarning, showInfo } = useToast();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedProducts, setExpandedProducts] = useState({});
  const [isHeaderExpanded, setIsHeaderExpanded] = useState(true);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  
  const [showAddModal, setShowAddModal] = useState(false);
  const [showBulkImportModal, setShowBulkImportModal] = useState(false);
  const [showShopifyImportModal, setShowShopifyImportModal] = useState(false);
  const [showStockImportModal, setShowStockImportModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showStockDetails, setShowStockDetails] = useState(null);
  const [filterCategory, setFilterCategory] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterType, setFilterType] = useState('');
  const [sortBy, setSortBy] = useState('name'); // name, price, stock, created
  const [dataSource, setDataSource] = useState(() => {
    // Check data source: 'manual', 'imported', or 'shopify'
    if (localStorage.getItem('shopify_products_active')) return 'shopify';
    if (localStorage.getItem('hr_products_imported')) return 'imported';
    return 'manual';
  });
  const [showImportedProducts, setShowImportedProducts] = useState(() => {
    // Legacy support
    return dataSource === 'imported';
  });
  
  // Confirmation modal state
  const [confirmDialog, setConfirmDialog] = useState({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: null,
    confirmText: 'Confirm',
    cancelText: 'Cancel',
    type: 'danger' // danger, warning, info
  });
  
  // Email alert state
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [emailRecipient, setEmailRecipient] = useState('manager@company.com');
  const [sendingEmail, setSendingEmail] = useState(false);
  const [sentEmails, setSentEmails] = useState([]);
  
  // Shopify API state
  const [showShopifySetupModal, setShowShopifySetupModal] = useState(false);
  const [shopifyCredentials, setShopifyCredentials] = useState({
    storeDomain: '',
    accessToken: ''
  });
  const [syncingShopify, setSyncingShopify] = useState(false);
  const [lastShopifySync, setLastShopifySync] = useState(null);

  // Load products from database
  useEffect(() => {
    const loadProducts = async () => {
      // Check data source
      if (dataSource === 'shopify') {
        // Load from Shopify API cache
        const cached = shopifyService.getCachedProducts();
        if (cached) {
          console.log('Loading Shopify products from cache');
          setProducts(cached.products);
          setLastShopifySync(cached.fetchedAt);
          setLoading(false);
        } else if (shopifyService.hasCredentials()) {
          // If no cache but has credentials, trigger sync
          await syncShopifyProducts();
        } else {
          setProducts([]);
          setLoading(false);
        }
        return;
      } else if (dataSource === 'imported') {
        // Check if we have imported products and should show them
        const imported = localStorage.getItem('hr_products_imported');
        if (imported) {
          console.log('Loading imported products from localStorage');
          const importedData = JSON.parse(imported);
          console.log('Imported products:', importedData.length, 'items');
          setProducts(importedData);
          setLoading(false);
          return;
        }
      }
      
      // Otherwise load manual products from database/localStorage
      try {
        console.log('Loading manual products from database...');
        const data = await API.products.getAll();
        console.log('Loaded from database:', data.length, 'items');
        setProducts(data);
        localStorage.setItem('hr_products', JSON.stringify(data));
      } catch (error) {
        console.error('Error loading products from database:', error);
        const saved = localStorage.getItem('hr_products');
        if (saved) {
          const savedData = JSON.parse(saved);
          console.log('Loaded from localStorage fallback:', savedData.length, 'items');
          setProducts(savedData);
        }
      }
      setLoading(false);
    };
    
    loadProducts();
    // Don't refresh if we're showing imported products or Shopify products
    if (dataSource === 'manual') {
      const interval = setInterval(loadProducts, 5000);
      return () => clearInterval(interval);
    }
  }, [dataSource]);

  // Toggle product expansion for variants
  const toggleExpand = (productId) => {
    setExpandedProducts(prev => ({
      ...prev,
      [productId]: !prev[productId]
    }));
  };
  
  // Sync products from Shopify API
  const syncShopifyProducts = async () => {
    setSyncingShopify(true);
    try {
      const shopifyProducts = await shopifyService.fetchProducts();
      setProducts(shopifyProducts);
      localStorage.setItem('shopify_products_active', 'true');
      setLastShopifySync(new Date().toISOString());
      showSuccess(`Synced ${shopifyProducts.length} products from Shopify`);
    } catch (error) {
      console.error('Error syncing Shopify products:', error);
      showError('Failed to sync products from Shopify. Check your credentials.');
    } finally {
      setSyncingShopify(false);
    }
  };
  
  // Save Shopify credentials and test connection
  const saveShopifyCredentials = async () => {
    if (!shopifyCredentials.storeDomain || !shopifyCredentials.accessToken) {
      showError('Please enter both store domain and access token');
      return;
    }
    
    try {
      // Save credentials
      shopifyService.saveCredentials(shopifyCredentials.storeDomain, shopifyCredentials.accessToken);
      
      // Test connection
      const testResult = await shopifyService.testConnection();
      if (testResult.success) {
        showSuccess(`Connected to ${testResult.shop.name}!`);
        setShowShopifySetupModal(false);
        
        // Automatically sync products
        await syncShopifyProducts();
        setDataSource('shopify');
      }
    } catch (error) {
      console.error('Error testing Shopify connection:', error);
      showError('Failed to connect to Shopify. Please check your credentials.');
    }
  };
  
  // Handle data source change
  const handleDataSourceChange = (newSource) => {
    setDataSource(newSource);
    
    // Update localStorage flags
    if (newSource === 'shopify') {
      localStorage.setItem('shopify_products_active', 'true');
      localStorage.removeItem('hr_products_imported');
      setShowImportedProducts(false);
    } else if (newSource === 'imported') {
      localStorage.removeItem('shopify_products_active');
      setShowImportedProducts(true);
    } else {
      localStorage.removeItem('shopify_products_active');
      localStorage.removeItem('hr_products_imported');
      setShowImportedProducts(false);
    }
  };

  // Show confirmation dialog
  const showConfirm = (title, message, onConfirm, type = 'danger', confirmText = 'Confirm', cancelText = 'Cancel') => {
    setConfirmDialog({
      isOpen: true,
      title,
      message,
      onConfirm,
      confirmText,
      cancelText,
      type
    });
  };
  
  // Send low stock email alert
  const sendLowStockAlert = async () => {
    if (!emailRecipient) {
      showError('Please enter a recipient email address');
      return;
    }
    
    setSendingEmail(true);
    try {
      const result = await emailService.sendLowStockAlert(products, emailRecipient);
      
      if (result.success) {
        showSuccess(`Stock alert sent to ${emailRecipient}`);
        setShowEmailModal(false);
        
        // Refresh sent emails list
        const emails = emailService.getSentEmails();
        setSentEmails(emails);
      } else {
        if (result.reason === 'No low stock items') {
          showInfo('All products have sufficient stock levels');
        } else {
          showError('Failed to send email alert');
        }
      }
    } catch (error) {
      console.error('Error sending email:', error);
      showError('Error sending email alert');
    } finally {
      setSendingEmail(false);
    }
  };
  
  // Load sent emails
  useEffect(() => {
    const emails = emailService.getSentEmails();
    setSentEmails(emails);
  }, [showEmailModal]);

  // Import Stock Levels CSV
  const handleStockImport = (file) => {
    Papa.parse(file, {
      header: true,
      complete: (results) => {
        console.log('Parsing stock CSV...', results.data.length, 'rows');
        
        // Get location columns (all columns except Handle, Title, Option names/values, SKU, HS Code, COO)
        const excludeColumns = ['Handle', 'Title', 'Option1 Name', 'Option1 Value', 'Option2 Name', 'Option2 Value', 'Option3 Name', 'Option3 Value', 'SKU', 'HS Code', 'COO', 'HS Code / AU', 'HS Code / HU'];
        const locationColumns = Object.keys(results.data[0] || {}).filter(col => !excludeColumns.includes(col));
        
        console.log('Found locations:', locationColumns);
        
        // Update products with stock data
        const updatedProducts = products.map(product => {
          const updatedProduct = { ...product };
          
          if (product.hasVariants && product.variants) {
            // Update variant stocks
            updatedProduct.variants = product.variants.map(variant => {
              // Find matching row by handle and variant name
              const stockRow = results.data.find(row => 
                row.Handle === product.handle && 
                row['Option1 Value'] === variant.name
              );
              
              if (stockRow) {
                // Calculate total stock and store location details
                let totalStock = 0;
                const locationStock = {};
                
                locationColumns.forEach(location => {
                  const qty = parseInt(stockRow[location]) || 0;
                  if (qty > 0) {
                    locationStock[location] = qty;
                    totalStock += qty;
                  }
                });
                
                return {
                  ...variant,
                  stock: totalStock,
                  locationStock: locationStock
                };
              }
              
              return variant;
            });
            
            // Update product total stock
            updatedProduct.totalStock = updatedProduct.variants.reduce((sum, v) => sum + (v.stock || 0), 0);
          } else {
            // Single product without variants
            const stockRow = results.data.find(row => row.Handle === product.handle);
            
            if (stockRow) {
              let totalStock = 0;
              const locationStock = {};
              
              locationColumns.forEach(location => {
                const qty = parseInt(stockRow[location]) || 0;
                if (qty > 0) {
                  locationStock[location] = qty;
                  totalStock += qty;
                }
              });
              
              updatedProduct.stock = totalStock;
              updatedProduct.totalStock = totalStock;
              updatedProduct.locationStock = locationStock;
            }
          }
          
          return updatedProduct;
        });
        
        console.log('Updated products with stock:', updatedProducts);
        
        // Update state
        setProducts(updatedProducts);
        localStorage.setItem('hr_products_imported', JSON.stringify(updatedProducts));
        setShowStockImportModal(false);
        
        showSuccess(`Stock levels imported successfully! Updated ${updatedProducts.filter(p => p.locationStock || (p.variants && p.variants.some(v => v.locationStock))).length} products.`);
      },
      error: (error) => {
        console.error('Stock CSV parse error:', error);
        showError('Error parsing stock CSV file. Please check the format.');
      }
    });
  };

  // Import Shopify CSV
  const handleShopifyImport = (file) => {
    console.log('Starting Shopify import, file:', file.name);
    Papa.parse(file, {
      header: true,
      complete: async (results) => {
        console.log('CSV parsed successfully:', results.data.length, 'rows');
        const productMap = new Map();
        
        results.data.forEach(row => {
          // Skip empty rows
          if (!row.Handle) return;
          
          const handle = row.Handle;
          
          if (!productMap.has(handle)) {
            // New product - first row with this handle
            productMap.set(handle, {
              id: `prod-${uid()}`,
              handle: handle,
              name: row.Title || '',
              category: row['Product Category']?.includes('>') 
                ? row['Product Category'].split('>')[0].trim()
                : row['Product Category'] || '',
              fullCategory: row['Product Category'] || '',
              type: row.Type || '',
              vendor: row.Vendor || '',
              status: row.Status?.toLowerCase() || 'active',
              variants: [],
              images: [],
              hasVariants: false
            });
          }
          
          const product = productMap.get(handle);
          
          // If Title is empty, this is a continuation row (variant or image)
          if (!row.Title) {
            // This is a variant row if it has Option1 Value
            if (row['Option1 Value'] && row['Option1 Value'] !== 'Default Title') {
              product.hasVariants = true;
              product.variants.push({
                id: `var-${uid()}`,
                name: row['Option1 Value'],
                sku: row['Variant SKU'] || '',
                price: parseFloat(row['Variant Price']) || 0,
                cost: parseFloat(row['Cost per item']) || 0,
                stock: parseInt(row['Variant Inventory Qty']) || 0
              });
            }
          } else {
            // This is the first row for this product
            // Check if it has a real variant or just "Default Title"
            if (row['Option1 Value'] && row['Option1 Value'] !== 'Default Title') {
              // It's a product with variants, and this is the first variant
              product.hasVariants = true;
              product.variants.push({
                id: `var-${uid()}`,
                name: row['Option1 Value'],
                sku: row['Variant SKU'] || '',
                price: parseFloat(row['Variant Price']) || 0,
                cost: parseFloat(row['Cost per item']) || 0,
                stock: parseInt(row['Variant Inventory Qty']) || 0
              });
            } else {
              // It's a simple product without variants
              product.sku = row['Variant SKU'] || '';
              product.price = parseFloat(row['Variant Price']) || 0;
              product.cost = parseFloat(row['Cost per item']) || 0;
              product.stock = parseInt(row['Variant Inventory Qty']) || 0;
            }
          }
          
          // Add image if exists
          if (row['Image Src'] && !product.images.includes(row['Image Src'])) {
            product.images.push(row['Image Src']);
          }
        });
        
        // Convert map to array and calculate total stock
        const importedProducts = Array.from(productMap.values()).map(product => {
          if (product.hasVariants && product.variants.length > 0) {
            product.totalStock = product.variants.reduce((sum, v) => sum + v.stock, 0);
          } else {
            product.totalStock = product.stock || 0;
          }
          return product;
        });
        
        console.log('Imported products:', importedProducts);
        
        // Update local state and mark as imported
        setProducts(importedProducts);
        localStorage.setItem('hr_products_imported', JSON.stringify(importedProducts));
        setShowImportedProducts(true); // Automatically switch to imported view
        
        // Show success message
        showSuccess(`Successfully imported ${importedProducts.length} products with ${importedProducts.reduce((sum, p) => sum + (p.variants?.length || 0), 0)} variants!`);
        
        // Don't close modal yet - allow inventory import
        // setShowShopifyImportModal(false);
      },
      error: (error) => {
        console.error('CSV parse error:', error);
        showError('Error parsing CSV file. Please check the format.');
      }
    });
  };

  // Add new product
  const handleAddProduct = async (productData) => {
    const newProduct = {
      id: `prod-${uid()}`,
      name: productData.name,
      category: productData.category || '',
      sku: productData.sku || '',
      description: productData.description || '',
      price: productData.price || 0,
      stock: productData.stock || 0,
      minStock: productData.minStock || 10,
      status: productData.status || 'active',
      supplier: productData.supplier || '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    try {
      // Save to database
      await API.products.create(newProduct);
      console.log('✅ Product added to database');
      
      // Update local state
      const updated = [...products, newProduct];
      setProducts(updated);
      localStorage.setItem('hr_products', JSON.stringify(updated));
    } catch (error) {
      console.error('Error saving to database:', error);
      // Still update local state even if database fails
      const updated = [...products, newProduct];
      setProducts(updated);
      localStorage.setItem('hr_products', JSON.stringify(updated));
    }
    
    setShowAddModal(false);
  };

  // Update product
  const handleUpdateProduct = async (id, updates) => {
    try {
      // Update in database
      await API.products.update(id, updates);
      console.log('✅ Product updated in database');
    } catch (error) {
      console.error('Error updating in database:', error);
    }
    
    // Update local state
    const updated = products.map(prod => 
      prod.id === id ? { ...prod, ...updates, updatedAt: new Date().toISOString() } : prod
    );
    setProducts(updated);
    
    // Save to appropriate storage
    if (showImportedProducts) {
      localStorage.setItem('hr_products_imported', JSON.stringify(updated));
    } else {
      localStorage.setItem('hr_products', JSON.stringify(updated));
    }
    setEditingProduct(null);
  };

  // Delete product
  const handleDeleteProduct = async (id) => {
    const product = products.find(p => p.id === id);
    showConfirm(
      'Delete Product',
      `Are you sure you want to delete "${product?.name || 'this product'}"? This action cannot be undone.`,
      async () => {
        try {
          // Delete from database
          await API.products.delete(id);
          console.log('✅ Product deleted from database');
        } catch (error) {
          console.error('Error deleting from database:', error);
        }
        
        // Update local state
        const updated = products.filter(prod => prod.id !== id);
        setProducts(updated);
        
        // Save to appropriate storage
        if (showImportedProducts) {
          localStorage.setItem('hr_products_imported', JSON.stringify(updated));
        } else {
          localStorage.setItem('hr_products', JSON.stringify(updated));
        }
        
        showSuccess('Product deleted successfully');
      },
      'danger',
      'Delete',
      'Cancel'
    );
  };

  // Filter products
  const filteredProducts = products.filter(prod => {
    const matchesSearch = prod.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          prod.sku?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          prod.handle?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = !filterCategory || prod.category === filterCategory;
    const matchesStatus = !filterStatus || prod.status === filterStatus;
    const matchesType = !filterType || prod.type === filterType;
    return matchesSearch && matchesCategory && matchesStatus && matchesType;
  });

  // Sort products
  const sortedProducts = [...filteredProducts].sort((a, b) => {
    switch(sortBy) {
      case 'name':
        return a.name.localeCompare(b.name);
      case 'price':
        return (b.price || 0) - (a.price || 0);
      case 'stock':
        return (b.totalStock || b.stock || 0) - (a.totalStock || a.stock || 0);
      case 'created':
        return new Date(b.createdAt || b.created_at || 0) - new Date(a.createdAt || a.created_at || 0);
      default:
        return 0;
    }
  });
  
  // Get unique categories and types from ALL products
  const categories = [...new Set(products.map(prod => prod.category))].filter(Boolean);
  const types = [...new Set(products.map(prod => prod.type))].filter(Boolean);
  
  // Calculate stats based on FILTERED products (dynamic)
  const totalProducts = sortedProducts.length;
  const totalVariants = sortedProducts.reduce((sum, p) => sum + (p.variants?.length || 0), 0);
  const totalStock = sortedProducts.reduce((sum, p) => {
    if (p.hasVariants && p.variants) {
      return sum + p.variants.reduce((vSum, v) => vSum + (v.stock || 0), 0);
    }
    return sum + (p.stock || 0);
  }, 0);
  const totalValue = sortedProducts.reduce((sum, prod) => {
    if (prod.hasVariants && prod.variants) {
      return sum + prod.variants.reduce((vSum, v) => vSum + ((v.cost || 0) * (v.stock || 0)), 0);
    }
    return sum + ((prod.cost || 0) * (prod.stock || 0));
  }, 0);
  const lowStockCount = sortedProducts.filter(prod => {
    const stock = prod.totalStock || prod.stock || 0;
    return stock < 10;
  }).length;

  return (
    <div className="h-full flex relative overflow-hidden">
      {/* Main Content */}
      <div className="flex-1 p-4 md:p-6 flex flex-col overflow-hidden transition-all duration-500">
          {/* Collapsible Header */}
          <header className="glass-card-large mb-4 overflow-hidden transition-all duration-500" 
            style={{ maxHeight: isHeaderExpanded ? '300px' : '70px' }}>
            <div className="flex items-center justify-between p-4">
              <div className="flex items-center gap-3">
                {/* Sidebar Toggle */}
                <button
                  onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
                  className="p-2 rounded-lg hover:bg-white/10 transition-colors"
                  title={isSidebarCollapsed ? "Show sidebar" : "Hide sidebar"}
                >
                  <Menu size={20} className="text-white/60" />
                </button>
                
                <div className="glass-card p-2 rounded-2xl bg-gradient-to-br from-purple-400/20 to-pink-600/20 border-purple-400/30">
                  <Package size={20} className="text-purple-300" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-white">Product Management</h1>
                  {!isHeaderExpanded && (
                    <p className="text-xs text-white/60">
                      {totalProducts} products • {totalStock} items • {totalValue.toLocaleString()} Ft
                    </p>
                  )}
                </div>
              </div>
              
              <button
                onClick={() => setIsHeaderExpanded(!isHeaderExpanded)}
                className="p-2 rounded-lg hover:bg-white/10 transition-colors"
                title={isHeaderExpanded ? "Collapse header" : "Expand header"}
              >
                <ChevronDown 
                  size={20} 
                  className={`text-white/60 transform transition-transform ${isHeaderExpanded ? '' : '-rotate-180'}`} 
                />
              </button>
            </div>
            
            {/* Stats Cards - Only visible when expanded */}
            {isHeaderExpanded && (
              <div className="px-4 pb-4">
                <div className="flex gap-3 flex-wrap">
                  <div className="glass-card p-3 rounded-xl flex-1 min-w-[120px]">
                    <div className="text-xl font-bold text-white">{totalProducts}</div>
                    <div className="text-xs text-white/60">Products</div>
                  </div>
                  {totalVariants > 0 && (
                    <div className="glass-card p-3 rounded-xl flex-1 min-w-[120px]">
                      <div className="text-xl font-bold text-purple-400">{totalVariants}</div>
                      <div className="text-xs text-white/60">Variants</div>
                    </div>
                  )}
                  <div className="glass-card p-3 rounded-xl flex-1 min-w-[120px]">
                    <div className="text-xl font-bold text-blue-400">{totalStock}</div>
                    <div className="text-xs text-white/60">Total Stock</div>
                  </div>
                  <div className="glass-card p-3 rounded-xl flex-1 min-w-[140px]">
                    <div className="text-xl font-bold text-green-400">
                      {totalValue.toLocaleString()} Ft
                    </div>
                    <div className="text-xs text-white/60">Inventory Value</div>
                  </div>
                  {lowStockCount > 0 && (
                    <div className="glass-card p-3 rounded-xl flex-1 min-w-[120px] border-orange-500/30">
                      <div className="text-xl font-bold text-orange-400">{lowStockCount}</div>
                      <div className="text-xs text-white/60">Low Stock</div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </header>

          {/* Search and Filter Section */}
          <div className="glass-card-large p-4 mb-4">
            <div className="flex gap-3">
              <div className="flex-1 relative">
                <input
                  type="text"
                  placeholder="Search products by name or SKU..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full glass-input pl-10 pr-4 py-2"
                />
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/50" />
              </div>
              
              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                className="glass-input px-4 py-2"
              >
                <option value="">All Categories</option>
                {categories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
              
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="glass-input px-4 py-2"
              >
                <option value="">All Status</option>
                <option value="active">Active</option>
                <option value="draft">Draft</option>
                <option value="discontinued">Discontinued</option>
              </select>
              
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="glass-input px-4 py-2"
              >
                <option value="">All Types</option>
                {types.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
              
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="glass-input px-4 py-2"
              >
                <option value="name">Sort by Name</option>
                <option value="price">Sort by Price</option>
                <option value="stock">Sort by Stock</option>
                <option value="created">Sort by Date Added</option>
              </select>
            </div>
          </div>

          {/* Products Table - Flexible width with scroll */}
          <div className="glass-card-large flex flex-col overflow-hidden flex-1 p-2" style={{ minHeight: 0 }}>
            <div className="overflow-x-auto overflow-y-auto custom-scrollbar h-full" style={{ maxHeight: 'calc(100vh - 320px)' }}>
              <table className="w-full" style={{ minWidth: 'max-content' }}>
                <thead className="sticky top-0 z-10">
                  <tr>
                    <th className="text-left p-3 text-white/70 font-medium bg-black/60 backdrop-blur-md first:rounded-l-xl" style={{ width: '40px', minWidth: '40px' }}></th>
                    <th className="text-left p-3 text-white/70 font-medium bg-black/60 backdrop-blur-md" style={{ width: '35%', minWidth: '250px' }}>Product / Variant</th>
                    <th className="text-left p-3 text-white/70 font-medium bg-black/60 backdrop-blur-md" style={{ width: '120px', minWidth: '120px' }}>SKU</th>
                    <th className="text-left p-3 text-white/70 font-medium bg-black/60 backdrop-blur-md" style={{ width: '120px', minWidth: '120px' }}>Category</th>
                    <th className="text-left p-3 text-white/70 font-medium bg-black/60 backdrop-blur-md" style={{ width: '90px', minWidth: '90px' }}>Type</th>
                    <th className="text-right p-3 text-white/70 font-medium bg-black/60 backdrop-blur-md" style={{ width: '90px', minWidth: '90px' }}>Price</th>
                    <th className="text-right p-3 text-white/70 font-medium bg-black/60 backdrop-blur-md" style={{ width: '90px', minWidth: '90px' }}>Cost</th>
                    <th className="text-right p-3 text-white/70 font-medium bg-black/60 backdrop-blur-md" style={{ width: '80px', minWidth: '80px' }}>Stock</th>
                    <th className="text-left p-3 text-white/70 font-medium bg-black/60 backdrop-blur-md" style={{ width: '90px', minWidth: '90px' }}>Status</th>
                    <th className="text-center p-3 text-white/70 font-medium bg-black/60 backdrop-blur-md last:rounded-r-xl" style={{ width: '90px', minWidth: '90px' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {sortedProducts.length === 0 ? (
                    <tr>
                      <td colSpan="9" className="text-center p-8 text-white/50">
                        No products found. Add your first product to get started.
                      </td>
                    </tr>
                  ) : (
                    sortedProducts.map(prod => (
                      <React.Fragment key={prod.id}>
                        {/* Main Product Row */}
                        <tr className="border-b border-white/5 hover:bg-white/5 transition-colors group">
                          <td className="p-3 w-10">
                            {prod.hasVariants && (
                              <button
                                onClick={() => toggleExpand(prod.id)}
                                className="p-1 rounded hover:bg-white/10 transition-colors"
                              >
                                {expandedProducts[prod.id] ? (
                                  <ChevronDown size={14} className="text-white/60" />
                                ) : (
                                  <ChevronRight size={14} className="text-white/60" />
                                )}
                              </button>
                            )}
                          </td>
                          <td className="p-3" style={{ minWidth: '250px', maxWidth: '300px' }}>
                            <div className="flex items-start gap-2">
                              {prod.hasVariants && (
                                <Layers size={14} className="text-purple-400 mt-1 flex-shrink-0" />
                              )}
                              <div className="min-w-0 flex-1 overflow-hidden">
                                <TruncatedTooltip content={prod.name} variant="default">
                                  <div className="font-medium text-white text-sm truncate">
                                    {prod.name}
                                  </div>
                                </TruncatedTooltip>
                                {prod.handle && (
                                  <div className="text-xs text-white/40 mt-0.5 truncate" title={`Handle: ${prod.handle}`}>
                                    Handle: {prod.handle}
                                  </div>
                                )}
                                {prod.hasVariants && prod.variants && (
                                  <div className="text-xs text-purple-400 mt-0.5">
                                    {prod.variants.length} variants
                                  </div>
                                )}
                              </div>
                            </div>
                          </td>
                          <td className="p-3" style={{ width: '120px' }}>
                            <div className="text-sm text-white/60 font-mono">
                              {prod.hasVariants ? (
                                <span className="text-white/30">Multiple</span>
                              ) : (
                                prod.sku || 'N/A'
                              )}
                            </div>
                          </td>
                          <td className="p-3" style={{ width: '120px' }}>
                            {prod.category && (
                              <span className="px-2 py-1 rounded-lg bg-purple-500/20 text-purple-300 text-xs" 
                                title={prod.fullCategory}>
                                {prod.category}
                              </span>
                            )}
                          </td>
                          <td className="p-3" style={{ width: '90px' }}>
                            {prod.type && (
                              <span className="text-xs text-white/60">
                                {prod.type}
                              </span>
                            )}
                          </td>
                          <td className="p-3 text-right" style={{ width: '90px' }}>
                            <div className="text-white font-medium text-sm">
                              {prod.hasVariants && prod.variants ? (
                                <div className="flex flex-col items-end">
                                  <span className="text-white">
                                    {Math.round(prod.variants.reduce((sum, v) => sum + v.price, 0) / prod.variants.length).toLocaleString()} Ft
                                  </span>
                                  <span className="text-[10px] text-white/40">avg</span>
                                </div>
                              ) : (
                                `${(prod.price || 0).toLocaleString()} Ft`
                              )}
                            </div>
                          </td>
                          <td className="p-3 text-right" style={{ width: '90px' }}>
                            <div className="text-white/60 text-sm">
                              {prod.hasVariants && prod.variants ? (
                                <div className="flex flex-col items-end">
                                  <span className="text-white/60">
                                    {Math.round(prod.variants.reduce((sum, v) => sum + v.cost, 0) / prod.variants.length).toLocaleString()} Ft
                                  </span>
                                  <span className="text-[10px] text-white/40">avg</span>
                                </div>
                              ) : (
                                `${(prod.cost || 0).toLocaleString()} Ft`
                              )}
                            </div>
                          </td>
                          <td className="p-3 text-right" style={{ width: '80px' }}>
                            <button
                              onClick={() => setShowStockDetails(prod)}
                              className={`font-medium text-sm flex items-center justify-end gap-1 hover:underline ${
                                (prod.totalStock || prod.stock || 0) < 10 ? 'text-orange-400' : 'text-white'
                              }`}
                            >
                              <span>{prod.totalStock || prod.stock || 0}</span>
                              {(prod.totalStock || prod.stock || 0) < 10 && (prod.totalStock || prod.stock || 0) > 0 && (
                                <AlertTriangle size={12} className="text-orange-400" />
                              )}
                              {(prod.totalStock || prod.stock || 0) === 0 && (
                                <span className="text-red-400 text-xs">Out</span>
                              )}
                            </button>
                          </td>
                          <td className="p-3" style={{ width: '90px' }}>
                            <span className={`px-2 py-1 rounded-lg text-xs font-medium ${
                              prod.status === 'active' 
                                ? 'bg-green-500/20 text-green-300'
                                : prod.status === 'draft'
                                ? 'bg-yellow-500/20 text-yellow-300'
                                : 'bg-red-500/20 text-red-300'
                            }`}>
                              {prod.status || 'Active'}
                            </span>
                          </td>
                          <td className="p-3" style={{ width: '90px' }}>
                            <div className="flex items-center justify-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                              <button
                                onClick={() => setEditingProduct(prod)}
                                className="p-1.5 rounded hover:bg-white/10 transition-colors"
                              >
                                <Settings size={12} className="text-white/70" />
                              </button>
                              <button
                                onClick={() => handleDeleteProduct(prod.id)}
                                className="p-1.5 rounded hover:bg-red-500/20 transition-colors"
                              >
                                <Trash2 size={12} className="text-red-400" />
                              </button>
                            </div>
                          </td>
                        </tr>

                        {/* Variant Rows (when expanded) */}
                        {expandedProducts[prod.id] && prod.variants && prod.variants.map((variant, idx) => (
                          <tr 
                            key={variant.id} 
                            className={`border-b border-white/5 bg-black/20 hover:bg-white/5 transition-colors ${
                              idx === prod.variants.length - 1 ? 'border-b-2 border-white/10' : ''
                            }`}
                          >
                            <td className="p-3 w-10"></td>
                            <td className="p-3 pl-12" style={{ minWidth: '250px', maxWidth: '300px' }}>
                              <div className="flex items-center gap-3">
                                <div className="w-1.5 h-1.5 rounded-full bg-purple-400/60 flex-shrink-0"></div>
                                <div className="min-w-0 flex-1">
                                  <div className="text-sm text-white/80 truncate" title={variant.name}>
                                    {variant.name}
                                  </div>
                                </div>
                              </div>
                            </td>
                            <td className="p-3" style={{ width: '120px' }}>
                              <div className="text-xs text-white/50 font-mono">
                                {variant.sku || '-'}
                              </div>
                            </td>
                            <td className="p-3" style={{ width: '120px' }}>
                              <span className="text-white/20 text-xs">Inherited</span>
                            </td>
                            <td className="p-3" style={{ width: '90px' }}>
                              <span className="text-white/20 text-xs">-</span>
                            </td>
                            <td className="p-3 text-right w-24">
                              <div className="text-white/80 text-xs">
                                {(variant.price || 0).toLocaleString()} Ft
                              </div>
                            </td>
                            <td className="p-3 text-right w-24">
                              <div className="text-white/60 text-xs">
                                {(variant.cost || 0).toLocaleString()} Ft
                              </div>
                            </td>
                            <td className="p-3 text-right w-20">
                              <button
                                onClick={() => setShowStockDetails(variant)}
                                className={`text-xs font-medium hover:underline ${
                                  variant.stock < 10 ? 'text-orange-400' : 'text-white/80'
                                }`}
                              >
                                {variant.stock || 0}
                                {variant.stock === 0 && (
                                  <span className="ml-2 text-red-400 text-xs">Out</span>
                                )}
                              </button>
                            </td>
                            <td className="p-3" style={{ width: '90px' }}>
                              <span className="text-white/20 text-xs">-</span>
                            </td>
                            <td className="p-3" style={{ width: '90px' }}>
                              <div className="flex items-center justify-center">
                                <button className="p-1 rounded hover:bg-white/10 opacity-50 hover:opacity-100 transition-all">
                                  <Settings size={10} className="text-white/50" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </React.Fragment>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
      </div>

      {/* Right Sidebar */}
      <div className={`${isSidebarCollapsed ? 'w-0' : 'w-80'} transition-all duration-500 py-6 pr-6`}>
        <div className={`${isSidebarCollapsed ? 'hidden' : 'block'} h-full overflow-y-auto custom-scrollbar rounded-3xl bg-black/40 backdrop-blur-xl border border-white/10`}>
          <div className="p-6 space-y-6">
        {/* Sidebar Header */}
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-xl font-bold text-white">Controls</h2>
          <Settings size={20} className="text-white/60 hover:text-white cursor-pointer transition-colors" />
        </div>
        
        {/* Data Source Selection */}
        <div className="p-5 rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10 hover:bg-white/10 transition-all">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center">
              <Layers size={20} className="text-white" />
            </div>
            <span className="text-sm font-medium text-white">Data Source</span>
          </div>
          
          <div className="space-y-2">
            <button
              onClick={() => handleDataSourceChange('manual')}
              className={`w-full p-3 rounded-xl transition-all flex items-center gap-3 ${
                dataSource === 'manual' 
                  ? 'bg-gradient-to-r from-blue-500/20 to-cyan-500/20 border border-blue-400/30' 
                  : 'bg-white/5 border border-white/10 hover:bg-white/10'
              }`}
            >
              <Plus size={16} className="text-white/60" />
              <div className="text-left flex-1">
                <div className="text-sm font-medium text-white">Manual Products</div>
                <div className="text-xs text-white/50">Create & manage locally</div>
              </div>
            </button>
            
            <button
              onClick={() => handleDataSourceChange('imported')}
              className={`w-full p-3 rounded-xl transition-all flex items-center gap-3 ${
                dataSource === 'imported' 
                  ? 'bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-400/30' 
                  : 'bg-white/5 border border-white/10 hover:bg-white/10'
              }`}
            >
              <Upload size={16} className="text-white/60" />
              <div className="text-left flex-1">
                <div className="text-sm font-medium text-white">CSV Import</div>
                <div className="text-xs text-white/50">From Shopify export</div>
              </div>
            </button>
            
            <button
              onClick={() => {
                if (shopifyService.hasCredentials()) {
                  handleDataSourceChange('shopify');
                } else {
                  setShowShopifySetupModal(true);
                }
              }}
              className={`w-full p-3 rounded-xl transition-all flex items-center gap-3 ${
                dataSource === 'shopify' 
                  ? 'bg-gradient-to-r from-green-500/20 to-emerald-500/20 border border-green-400/30' 
                  : 'bg-white/5 border border-white/10 hover:bg-white/10'
              }`}
            >
              <ShoppingCart size={16} className="text-white/60" />
              <div className="text-left flex-1">
                <div className="text-sm font-medium text-white">Shopify API</div>
                <div className="text-xs text-white/50">
                  {shopifyService.hasCredentials() ? 'Connected' : 'Setup required'}
                </div>
              </div>
            </button>
          </div>
        </div>

        {/* Shopify API Controls - Only show when using Shopify API */}
        {dataSource === 'shopify' && (
        <div className="p-6 rounded-2xl bg-gradient-to-br from-green-500/10 to-emerald-500/10 backdrop-blur-sm border border-green-400/20 hover:from-green-500/15 hover:to-emerald-500/15 transition-all">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center">
              <ShoppingCart size={20} className="text-white" />
            </div>
            <h3 className="text-lg font-semibold text-white">Shopify API</h3>
          </div>
          
          <div className="space-y-3">
            <button
              onClick={syncShopifyProducts}
              disabled={syncingShopify}
              className="w-full glass-button py-3 font-medium hover:scale-105 transition-transform flex items-center justify-center gap-2 bg-gradient-to-r from-green-500/20 to-emerald-500/20 border-green-400/30 disabled:opacity-50"
            >
              {syncingShopify ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Syncing...
                </>
              ) : (
                <>
                  <TrendingUp size={18} />
                  Sync Products
                </>
              )}
            </button>
            
            <button
              onClick={() => setShowShopifySetupModal(true)}
              className="w-full glass-button py-3 font-medium hover:scale-105 transition-transform flex items-center justify-center gap-2"
            >
              <Settings size={18} />
              Configure API
            </button>
            
            {lastShopifySync && (
              <div className="text-xs text-white/50 text-center mt-2">
                Last sync: {new Date(lastShopifySync).toLocaleString()}
              </div>
            )}
            
            <button
              onClick={() => {
                showConfirm(
                  'Disconnect Shopify',
                  'Are you sure you want to disconnect from Shopify? This will clear your API credentials.',
                  () => {
                    shopifyService.clearCredentials();
                    setDataSource('manual');
                    showInfo('Disconnected from Shopify');
                    window.location.reload();
                  },
                  'warning',
                  'Disconnect',
                  'Cancel'
                );
              }}
              className="w-full py-3 font-medium transition-all flex items-center justify-center gap-2 rounded-2xl border bg-red-900/50 hover:bg-red-800/50 border-red-700/30 text-red-400"
            >
              <Archive size={18} />
              Disconnect
            </button>
          </div>
        </div>
        )}
        
        {/* Shopify Import Widget - Only show when viewing imported products */}
        {dataSource === 'imported' && (
        <div className="p-6 rounded-2xl bg-gradient-to-br from-purple-500/10 to-pink-500/10 backdrop-blur-sm border border-purple-400/20 hover:from-purple-500/15 hover:to-pink-500/15 transition-all">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
              <FileDown size={20} className="text-white" />
            </div>
            <h3 className="text-lg font-semibold text-white">Shopify Import</h3>
          </div>
          
          <div className="space-y-3">
            <button
              onClick={() => setShowShopifyImportModal(true)}
              className="w-full glass-button py-3 font-medium hover:scale-105 transition-transform flex items-center justify-center gap-2 bg-gradient-to-r from-purple-500/20 to-pink-500/20 border-purple-400/30"
            >
              <Upload size={18} />
              Import Shopify Data
            </button>
            
            {localStorage.getItem('hr_products_imported') && (
              <button
                onClick={() => {
                  showConfirm(
                    'Clear Imported Data',
                    'Are you sure you want to clear all imported data? This will switch back to manual products.',
                    () => {
                      localStorage.removeItem('hr_products_imported');
                      setShowImportedProducts(false);
                      showInfo('Imported data cleared. Showing manual products.');
                      // Reload to refresh the products
                      window.location.reload();
                    },
                    'warning',
                    'Clear Data',
                    'Cancel'
                  );
                }}
                className="w-full py-3 font-medium transition-all flex items-center justify-center gap-2 rounded-2xl border bg-yellow-900/50 hover:bg-yellow-800/50 border-yellow-700/30 text-yellow-400"
              >
                <Archive size={18} />
                Clear Imported Data
              </button>
            )}
          </div>
        </div>
        )}

        {/* Product Actions - Only show when viewing manual products */}
        {dataSource === 'manual' && (
        <div className="p-6 rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10 hover:bg-white/10 transition-all">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center">
              <PlusCircle size={20} className="text-white" />
            </div>
            <h3 className="text-lg font-semibold text-white">Product Actions</h3>
          </div>
          
          <div className="space-y-3">
            <button
              onClick={() => setShowAddModal(true)}
              className="w-full glass-button py-3 font-medium hover:scale-105 transition-transform flex items-center justify-center gap-2"
            >
              <Plus size={20} />
              Add Product
            </button>
            
            <button
              onClick={() => setShowBulkImportModal(true)}
              className="w-full glass-button py-3 font-medium hover:scale-105 transition-transform flex items-center justify-center gap-2"
            >
              <Upload size={20} />
              Bulk Import
            </button>
            
            <button
              onClick={() => {
                const data = JSON.stringify(products, null, 2);
                const blob = new Blob([data], { type: 'application/json' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `products-export-${new Date().toISOString().split('T')[0]}.json`;
                a.click();
              }}
              className="w-full glass-button py-3 font-medium hover:scale-105 transition-transform flex items-center justify-center gap-2"
            >
              <Archive size={20} />
              Export Data
            </button>
            
            {products.length > 0 && (
              <button
                onClick={() => {
                  showConfirm(
                    'Delete All Products',
                    'Are you sure you want to delete ALL products? This action cannot be undone.',
                    () => {
                      setProducts([]);
                      if (showImportedProducts) {
                        localStorage.removeItem('hr_products_imported');
                      } else {
                        localStorage.removeItem('hr_products');
                      }
                      showSuccess('All products deleted successfully');
                    },
                    'danger',
                    'Delete All',
                    'Cancel'
                  );
                }}
                className="w-full py-3 font-medium transition-all flex items-center justify-center gap-2 rounded-2xl border bg-red-900/80 hover:bg-red-800 border-red-700/50 text-white hover:scale-105"
              >
                <Trash2 size={20} />
                Delete All Products
              </button>
            )}
          </div>
        </div>
        )}

        {/* Statistics Section - Always visible */}
        <div className="space-y-4">
            <div className="p-4 rounded-xl bg-white/5 border border-white/10 backdrop-blur-sm">
              <h4 className="text-sm font-medium text-white/70 mb-3">Inventory Overview</h4>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-white/50">Total Products</span>
                  <span className="text-sm font-medium text-white">{products.length}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-white/50">Categories</span>
                  <span className="text-sm font-medium text-white">{categories.length}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-white/50">Avg. Price</span>
                  <span className="text-sm font-medium text-white">
                    {products.length > 0 
                      ? Math.round(products.reduce((sum, p) => sum + (p.price || 0), 0) / products.length).toLocaleString()
                      : 0} Ft
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-white/50">Total Stock</span>
                  <span className="text-sm font-medium text-white">
                    {products.reduce((sum, p) => sum + (p.stock || 0), 0)}
                  </span>
                </div>
              </div>
            </div>

            {/* Category Distribution */}
            <div className="p-4 rounded-xl bg-gradient-to-br from-purple-500/10 to-pink-500/10 border border-purple-400/20 backdrop-blur-sm">
              <h4 className="text-sm font-medium text-white mb-3">Category Distribution</h4>
              <div className="space-y-2">
                {categories.slice(0, 5).map(cat => {
                  const count = products.filter(p => p.category === cat).length;
                  const percentage = (count / products.length) * 100;
                  return (
                    <div key={cat}>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-white/70">{cat}</span>
                        <span className="text-white/50">{count} items</span>
                      </div>
                      <div className="w-full bg-white/10 rounded-full h-1.5">
                        <div 
                          className="bg-gradient-to-r from-purple-400 to-pink-400 h-1.5 rounded-full"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Low Stock Alert */}
            {lowStockCount > 0 && (
              <div className="p-4 rounded-xl bg-orange-500/10 border border-orange-400/20 backdrop-blur-sm">
                <h4 className="text-sm font-medium text-orange-400 mb-2 flex items-center gap-2">
                  <AlertTriangle size={16} />
                  Low Stock Alert
                </h4>
                <p className="text-xs text-white/60 mb-3">
                  {lowStockCount} product{lowStockCount > 1 ? 's' : ''} running low on stock
                </p>
                <button
                  onClick={() => setShowEmailModal(true)}
                  className="w-full glass-button py-2 flex items-center justify-center gap-2 text-xs hover:scale-105 transition-transform bg-orange-500/20 border-orange-400/30"
                >
                  <Mail size={14} />
                  Send Email Alert
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>

      {/* Add/Edit Product Modal */}
      {(showAddModal || editingProduct) && (
        <ProductModal
          product={editingProduct}
          onSave={(data) => {
            if (editingProduct) {
              handleUpdateProduct(editingProduct.id, data);
            } else {
              handleAddProduct(data);
            }
          }}
          onClose={() => {
            setShowAddModal(false);
            setEditingProduct(null);
          }}
        />
      )}

      {/* Bulk Import Modal */}
      {showBulkImportModal && (
        <BulkImportModal
          onSave={(importedProducts) => {
            const newProducts = importedProducts.map(p => ({
              ...p,
              id: `prod-${uid()}`,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString()
            }));
            setProducts([...products, ...newProducts]);
            setShowBulkImportModal(false);
          }}
          onClose={() => setShowBulkImportModal(false)}
        />
      )}


      {/* Stock Details Modal */}
      {showStockDetails && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="glass-card-large w-full max-w-md">
            <div className="p-6 border-b border-white/20">
              <h2 className="text-xl font-bold text-white">Stock Details</h2>
              <p className="text-sm text-white/60 mt-1">
                {showStockDetails.name || showStockDetails.handle}
              </p>
            </div>
            
            <div className="p-6">
              <div className="space-y-3">
                <div className="flex justify-between items-center p-3 rounded-lg bg-white/5">
                  <span className="text-white font-medium">Total Stock</span>
                  <span className="text-xl font-bold text-blue-400">
                    {showStockDetails.stock || showStockDetails.totalStock || 0}
                  </span>
                </div>
                
                {showStockDetails.locationStock && Object.keys(showStockDetails.locationStock).length > 0 ? (
                  <div className="space-y-2">
                    <div className="text-sm text-white/60 mb-2">Location Breakdown:</div>
                    {Object.entries(showStockDetails.locationStock).map(([location, qty]) => (
                      <div key={location} className="flex justify-between items-center p-2 rounded bg-white/5">
                        <span className="text-white/80 text-sm">{location}</span>
                        <span className="text-white font-medium">{qty}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center text-white/50 py-4">
                    No location data available. Import stock levels to see breakdown.
                  </div>
                )}
              </div>
            </div>
            
            <div className="p-6 border-t border-white/20 flex justify-end">
              <button
                onClick={() => setShowStockDetails(null)}
                className="px-6 py-2 glass-button rounded-xl"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Shopify Import Modal - Combined Products & Inventory */}
      {/* Confirmation Modal */}
      {confirmDialog.isOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[60] p-4">
          <div className="glass-card-large w-full max-w-md animate-in fade-in zoom-in duration-200">
            <div className={`p-6 border-b border-white/20 ${
              confirmDialog.type === 'danger' ? 'bg-gradient-to-r from-red-500/10 to-pink-500/10' :
              confirmDialog.type === 'warning' ? 'bg-gradient-to-r from-yellow-500/10 to-orange-500/10' :
              'bg-gradient-to-r from-blue-500/10 to-cyan-500/10'
            }`}>
              <h2 className="text-xl font-bold text-white flex items-center gap-3">
                {confirmDialog.type === 'danger' && <AlertTriangle size={24} className="text-red-400" />}
                {confirmDialog.type === 'warning' && <AlertTriangle size={24} className="text-yellow-400" />}
                {confirmDialog.type === 'info' && <AlertTriangle size={24} className="text-blue-400" />}
                {confirmDialog.title}
              </h2>
            </div>
            
            <div className="p-6">
              <p className="text-white/80 text-sm leading-relaxed">
                {confirmDialog.message}
              </p>
            </div>
            
            <div className="p-6 border-t border-white/20 flex justify-end gap-3">
              <button
                onClick={() => setConfirmDialog({ ...confirmDialog, isOpen: false })}
                className="px-6 py-2 glass-button rounded-xl hover:scale-105 transition-transform"
              >
                {confirmDialog.cancelText}
              </button>
              <button
                onClick={() => {
                  if (confirmDialog.onConfirm) {
                    confirmDialog.onConfirm();
                  }
                  setConfirmDialog({ ...confirmDialog, isOpen: false });
                }}
                className={`px-6 py-2 rounded-xl font-medium hover:scale-105 transition-transform ${
                  confirmDialog.type === 'danger' 
                    ? 'bg-gradient-to-r from-red-500 to-pink-500 text-white'
                    : confirmDialog.type === 'warning'
                    ? 'bg-gradient-to-r from-yellow-500 to-orange-500 text-white'
                    : 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white'
                }`}
              >
                {confirmDialog.confirmText}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Email Alert Modal */}
      {showEmailModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="glass-card-large w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-white/20 bg-gradient-to-r from-orange-500/10 to-yellow-500/10">
              <h2 className="text-xl font-bold text-white flex items-center gap-3">
                <Mail size={24} className="text-orange-400" />
                Send Low Stock Alert
              </h2>
              <p className="text-sm text-white/60 mt-2">
                Send email notification for products with low or no stock
              </p>
            </div>
            
            <div className="p-6">
              {/* Preview Section */}
              <div className="mb-6">
                <h3 className="text-white font-semibold mb-3">Alert Preview</h3>
                <div className="glass-card p-4 rounded-xl">
                  <div className="space-y-3">
                    {products.filter(p => (p.totalStock || p.stock || 0) === 0).length > 0 && (
                      <div>
                        <div className="text-red-400 font-medium text-sm mb-2">
                          🚨 Out of Stock ({products.filter(p => (p.totalStock || p.stock || 0) === 0).length} items)
                        </div>
                        <div className="text-xs text-white/60">
                          {products.filter(p => (p.totalStock || p.stock || 0) === 0)
                            .slice(0, 3)
                            .map(p => p.name)
                            .join(', ')}
                          {products.filter(p => (p.totalStock || p.stock || 0) === 0).length > 3 && '...'}
                        </div>
                      </div>
                    )}
                    
                    {products.filter(p => {
                      const stock = p.totalStock || p.stock || 0;
                      return stock > 0 && stock < 10;
                    }).length > 0 && (
                      <div>
                        <div className="text-orange-400 font-medium text-sm mb-2">
                          ⚠️ Low Stock ({products.filter(p => {
                            const stock = p.totalStock || p.stock || 0;
                            return stock > 0 && stock < 10;
                          }).length} items)
                        </div>
                        <div className="text-xs text-white/60">
                          {products.filter(p => {
                            const stock = p.totalStock || p.stock || 0;
                            return stock > 0 && stock < 10;
                          })
                            .slice(0, 3)
                            .map(p => `${p.name} (${p.totalStock || p.stock} left)`)
                            .join(', ')}
                          {products.filter(p => {
                            const stock = p.totalStock || p.stock || 0;
                            return stock > 0 && stock < 10;
                          }).length > 3 && '...'}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              
              {/* Recipient Input */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-white/70 mb-2">
                  Recipient Email Address
                </label>
                <input
                  type="email"
                  value={emailRecipient}
                  onChange={(e) => setEmailRecipient(e.target.value)}
                  placeholder="manager@company.com"
                  className="w-full glass-input px-4 py-2"
                />
              </div>
              
              {/* Recent Sent Emails */}
              {sentEmails.length > 0 && (
                <div>
                  <h3 className="text-white font-semibold mb-3">Recent Alerts</h3>
                  <div className="space-y-2 max-h-40 overflow-y-auto">
                    {sentEmails.slice(-5).reverse().map((email) => (
                      <div key={email.id} className="glass-card p-3 rounded-lg">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Bell size={14} className="text-white/60" />
                            <span className="text-xs text-white/80">{email.to}</span>
                          </div>
                          <span className="text-xs text-white/40">
                            {new Date(email.timestamp).toLocaleString()}
                          </span>
                        </div>
                        <div className="text-xs text-white/60 mt-1 truncate">
                          {email.subject}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {/* Info Box */}
              <div className="mt-6 p-4 rounded-xl bg-blue-500/10 border border-blue-400/20">
                <div className="flex items-start gap-3">
                  <AlertTriangle size={16} className="text-blue-400 mt-0.5" />
                  <div className="text-xs text-white/70">
                    <p>This will send an automated email alert with all products that have:</p>
                    <ul className="mt-2 space-y-1 ml-4">
                      <li>• Zero stock (out of stock)</li>
                      <li>• Less than 10 items in stock (low stock)</li>
                    </ul>
                    <p className="mt-2 text-white/50">
                      Note: In demo mode, emails are stored locally instead of being sent.
                    </p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="p-6 border-t border-white/20 flex justify-end gap-3">
              <button
                onClick={() => setShowEmailModal(false)}
                className="px-6 py-2 glass-button rounded-xl"
                disabled={sendingEmail}
              >
                Cancel
              </button>
              <button
                onClick={sendLowStockAlert}
                disabled={sendingEmail || !emailRecipient}
                className="px-6 py-2 rounded-xl bg-gradient-to-r from-orange-500 to-yellow-500 text-white font-medium hover:scale-105 transition-transform disabled:opacity-50 flex items-center gap-2"
              >
                {sendingEmail ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Sending...
                  </>
                ) : (
                  <>
                    <Send size={18} />
                    Send Alert
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Shopify API Setup Modal */}
      {showShopifySetupModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="glass-card-large w-full max-w-2xl">
            <div className="p-6 border-b border-white/20 bg-gradient-to-r from-green-500/10 to-emerald-500/10">
              <h2 className="text-xl font-bold text-white flex items-center gap-3">
                <ShoppingCart size={24} className="text-green-400" />
                Connect to Shopify API
              </h2>
              <p className="text-sm text-white/60 mt-2">
                Connect your Shopify store to sync products directly via API
              </p>
            </div>
            
            <div className="p-6 space-y-6">
              {/* Instructions */}
              <div className="p-4 rounded-xl bg-blue-500/10 border border-blue-400/20">
                <h3 className="text-sm font-medium text-white mb-3">How to get your API credentials:</h3>
                <ol className="text-xs text-white/70 space-y-2">
                  <li>1. Go to your Shopify Admin → Settings → Apps and sales channels</li>
                  <li>2. Click "Develop apps" (you may need to enable this first)</li>
                  <li>3. Create a new app or use an existing one</li>
                  <li>4. In Configuration, set these API scopes:
                    <ul className="ml-4 mt-1">
                      <li>• read_products</li>
                      <li>• read_inventory</li>
                    </ul>
                  </li>
                  <li>5. Install the app and copy the Admin API access token</li>
                </ol>
              </div>
              
              {/* Store Domain Input */}
              <div>
                <label className="block text-sm font-medium text-white/70 mb-2">
                  Store Domain
                </label>
                <input
                  type="text"
                  value={shopifyCredentials.storeDomain}
                  onChange={(e) => setShopifyCredentials({...shopifyCredentials, storeDomain: e.target.value})}
                  placeholder="your-store-name (without .myshopify.com)"
                  className="w-full glass-input px-4 py-2"
                />
                <p className="text-xs text-white/50 mt-1">
                  Example: if your store is my-store.myshopify.com, enter "my-store"
                </p>
              </div>
              
              {/* Access Token Input */}
              <div>
                <label className="block text-sm font-medium text-white/70 mb-2">
                  Admin API Access Token
                </label>
                <input
                  type="password"
                  value={shopifyCredentials.accessToken}
                  onChange={(e) => setShopifyCredentials({...shopifyCredentials, accessToken: e.target.value})}
                  placeholder="shpat_xxxxxxxxxxxxx"
                  className="w-full glass-input px-4 py-2 font-mono"
                />
                <p className="text-xs text-white/50 mt-1">
                  This will be stored securely in your browser's local storage
                </p>
              </div>
              
              {/* Security Note */}
              <div className="p-4 rounded-xl bg-yellow-500/10 border border-yellow-400/20">
                <div className="flex items-start gap-3">
                  <AlertTriangle size={16} className="text-yellow-400 mt-0.5" />
                  <div className="text-xs text-white/70">
                    <p className="font-medium text-yellow-400 mb-1">Security Note:</p>
                    <p>Your API credentials are stored locally in your browser and sent only to your backend server. They are never sent to any external services.</p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="p-6 border-t border-white/20 flex justify-end gap-3">
              <button
                onClick={() => {
                  setShowShopifySetupModal(false);
                  setShopifyCredentials({ storeDomain: '', accessToken: '' });
                }}
                className="px-6 py-2 glass-button rounded-xl"
              >
                Cancel
              </button>
              <button
                onClick={saveShopifyCredentials}
                disabled={!shopifyCredentials.storeDomain || !shopifyCredentials.accessToken}
                className="px-6 py-2 rounded-xl bg-gradient-to-r from-green-500 to-emerald-500 text-white font-medium hover:scale-105 transition-transform disabled:opacity-50"
              >
                Connect to Shopify
              </button>
            </div>
          </div>
        </div>
      )}
      
      {showShopifyImportModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="glass-card-large w-full max-w-3xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-white/20">
              <h2 className="text-xl font-bold text-white">Import Shopify Data</h2>
              <p className="text-sm text-white/60 mt-2">Import products and inventory levels from Shopify</p>
            </div>
            
            <div className="p-6 space-y-6">
              {/* Products CSV Drop Zone */}
              <div>
                <h3 className="text-white font-medium mb-3 flex items-center gap-2">
                  <Package size={18} className="text-purple-400" />
                  1. Products Export (Required)
                </h3>
                <div 
                  className="border-2 border-dashed border-purple-400/30 rounded-xl p-6 text-center bg-gradient-to-br from-purple-500/5 to-pink-500/5 transition-all hover:border-purple-400/50 hover:bg-purple-500/10"
                  onDragOver={(e) => {
                    e.preventDefault();
                    e.currentTarget.classList.add('border-purple-400', 'bg-purple-500/20');
                  }}
                  onDragLeave={(e) => {
                    e.preventDefault();
                    e.currentTarget.classList.remove('border-purple-400', 'bg-purple-500/20');
                  }}
                  onDrop={(e) => {
                    e.preventDefault();
                    e.currentTarget.classList.remove('border-purple-400', 'bg-purple-500/20');
                    const file = e.dataTransfer.files[0];
                    if (file && file.type === 'text/csv') {
                      handleShopifyImport(file);
                      // Don't close modal yet, allow inventory import
                    } else {
                      showWarning('Please drop a CSV file');
                    }
                  }}
                >
                  <Upload size={36} className="mx-auto mb-3 text-purple-400" />
                  <p className="text-white/60 mb-3 text-sm">
                    Drag and drop your Products CSV here
                  </p>
                  <input
                    type="file"
                    accept=".csv"
                    onChange={(e) => {
                      if (e.target.files[0]) {
                        handleShopifyImport(e.target.files[0]);
                      }
                    }}
                    className="hidden"
                    id="shopify-products-upload"
                  />
                  <label
                    htmlFor="shopify-products-upload"
                    className="glass-button px-4 py-1.5 cursor-pointer inline-block bg-gradient-to-r from-purple-500/20 to-pink-500/20 border-purple-400/30 hover:scale-105 transition-transform text-sm"
                  >
                    Choose Products CSV
                  </label>
                </div>
              </div>

              {/* Inventory CSV Drop Zone */}
              <div>
                <h3 className="text-white font-medium mb-3 flex items-center gap-2">
                  <Box size={18} className="text-blue-400" />
                  2. Inventory Export (Optional)
                </h3>
                <div 
                  className="border-2 border-dashed border-blue-400/30 rounded-xl p-6 text-center bg-gradient-to-br from-blue-500/5 to-cyan-500/5 transition-all hover:border-blue-400/50 hover:bg-blue-500/10"
                  onDragOver={(e) => {
                    e.preventDefault();
                    e.currentTarget.classList.add('border-blue-400', 'bg-blue-500/20');
                  }}
                  onDragLeave={(e) => {
                    e.preventDefault();
                    e.currentTarget.classList.remove('border-blue-400', 'bg-blue-500/20');
                  }}
                  onDrop={(e) => {
                    e.preventDefault();
                    e.currentTarget.classList.remove('border-blue-400', 'bg-blue-500/20');
                    const file = e.dataTransfer.files[0];
                    if (file && file.type === 'text/csv') {
                      handleStockImport(file);
                      setTimeout(() => setShowShopifyImportModal(false), 1000);
                    } else {
                      showWarning('Please drop a CSV file');
                    }
                  }}
                >
                  <Archive size={36} className="mx-auto mb-3 text-blue-400" />
                  <p className="text-white/60 mb-3 text-sm">
                    Drag and drop your Inventory CSV here
                  </p>
                  <input
                    type="file"
                    accept=".csv"
                    onChange={(e) => {
                      if (e.target.files[0]) {
                        handleStockImport(e.target.files[0]);
                        setTimeout(() => setShowShopifyImportModal(false), 1000);
                      }
                    }}
                    className="hidden"
                    id="shopify-inventory-upload"
                  />
                  <label
                    htmlFor="shopify-inventory-upload"
                    className="glass-button px-4 py-1.5 cursor-pointer inline-block bg-gradient-to-r from-blue-500/20 to-cyan-500/20 border-blue-400/30 hover:scale-105 transition-transform text-sm"
                  >
                    Choose Inventory CSV
                  </label>
                </div>
              </div>
              
              <div className="space-y-2 text-xs text-white/40 pt-2">
                <p className="flex items-center gap-2">
                  <Layers size={12} className="text-purple-400" />
                  Products will be grouped by Handle, variants by Option1 Value
                </p>
                <p className="flex items-center gap-2">
                  <TrendingUp size={12} className="text-blue-400" />
                  Stock levels will be matched and aggregated by location
                </p>
              </div>
            </div>
            
            <div className="p-6 border-t border-white/20 flex justify-between items-center">
              <div className="text-xs text-white/50">
                You can import products first, then add inventory levels
              </div>
              <button
                onClick={() => setShowShopifyImportModal(false)}
                className="px-6 py-2 glass-button rounded-xl"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Product Modal Component
function ProductModal({ product, onSave, onClose }) {
  const [formData, setFormData] = useState({
    name: product?.name || '',
    sku: product?.sku || '',
    description: product?.description || '',
    category: product?.category || '',
    price: product?.price || '',
    stock: product?.stock || '',
    status: product?.status || 'active',
    supplier: product?.supplier || '',
    minStock: product?.minStock || 10
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name) {
      return;
    }
    onSave(formData);
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="glass-card-large w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-white/20">
          <h2 className="text-xl font-bold text-white">
            {product ? 'Edit Product' : 'Add New Product'}
          </h2>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-white/70 mb-2">Product Name *</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                className="w-full glass-input px-4 py-2"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-white/70 mb-2">SKU</label>
              <input
                type="text"
                value={formData.sku}
                onChange={(e) => setFormData({...formData, sku: e.target.value})}
                className="w-full glass-input px-4 py-2"
                placeholder="PRD-001"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-white/70 mb-2">Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
              className="w-full glass-input px-4 py-2"
              rows="3"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-white/70 mb-2">Category</label>
              <input
                type="text"
                value={formData.category}
                onChange={(e) => setFormData({...formData, category: e.target.value})}
                className="w-full glass-input px-4 py-2"
                placeholder="Electronics"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-white/70 mb-2">Status</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({...formData, status: e.target.value})}
                className="w-full glass-input px-4 py-2"
              >
                <option value="active">Active</option>
                <option value="draft">Draft</option>
                <option value="discontinued">Discontinued</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-white/70 mb-2">Price (Ft)</label>
              <input
                type="number"
                step="1"
                value={formData.price}
                onChange={(e) => setFormData({...formData, price: parseFloat(e.target.value) || 0})}
                className="w-full glass-input px-4 py-2"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-white/70 mb-2">Stock</label>
              <input
                type="number"
                value={formData.stock}
                onChange={(e) => setFormData({...formData, stock: parseInt(e.target.value) || 0})}
                className="w-full glass-input px-4 py-2"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-white/70 mb-2">Min Stock</label>
              <input
                type="number"
                value={formData.minStock}
                onChange={(e) => setFormData({...formData, minStock: parseInt(e.target.value) || 0})}
                className="w-full glass-input px-4 py-2"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-white/70 mb-2">Supplier</label>
            <input
              type="text"
              value={formData.supplier}
              onChange={(e) => setFormData({...formData, supplier: e.target.value})}
              className="w-full glass-input px-4 py-2"
              placeholder="Supplier name"
            />
          </div>
        </form>
        
        <div className="p-6 border-t border-white/20 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-6 py-2 glass-button rounded-xl"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            className="px-6 py-2 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 text-white font-medium hover:scale-105 transition-transform"
          >
            {product ? 'Update' : 'Add'} Product
          </button>
        </div>
      </div>
    </div>
  );
}

// Bulk Import Modal
function BulkImportModal({ onSave, onClose }) {
  const [importText, setImportText] = useState('');
  const [previewData, setPreviewData] = useState(null);

  const handleParse = () => {
    try {
      // Try JSON first
      const data = JSON.parse(importText);
      setPreviewData(Array.isArray(data) ? data : [data]);
    } catch {
      // Try CSV format
      const lines = importText.trim().split('\n');
      const headers = ['name', 'sku', 'category', 'price', 'stock'];
      const products = lines.map(line => {
        const values = line.split(',').map(v => v.trim());
        const product = {};
        headers.forEach((header, i) => {
          const value = values[i];
          if (header === 'price' || header === 'stock') {
            product[header] = parseFloat(value) || 0;
          } else {
            product[header] = value || '';
          }
        });
        return product;
      });
      setPreviewData(products);
    }
  };

  const handleImport = () => {
    if (previewData && previewData.length > 0) {
      onSave(previewData);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="glass-card-large w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-white/20">
          <h2 className="text-xl font-bold text-white">Bulk Import Products</h2>
        </div>
        
        <div className="p-6 space-y-6">
          <div>
            <label className="block text-sm font-medium text-white/70 mb-2">
              Import Data (JSON or CSV format)
            </label>
            <textarea
              value={importText}
              onChange={(e) => setImportText(e.target.value)}
              className="w-full glass-input px-4 py-3 font-mono text-sm"
              rows="10"
              placeholder='[{"name": "Product 1", "sku": "PRD-001", "category": "Electronics", "price": 99.99, "stock": 50}]
OR
Product 1, PRD-001, Electronics, 99.99, 50
Product 2, PRD-002, Accessories, 19.99, 100'
            />
          </div>

          <button
            onClick={handleParse}
            className="glass-button px-6 py-2"
          >
            Parse Data
          </button>

          {previewData && (
            <div>
              <h3 className="text-sm font-medium text-white/70 mb-2">
                Preview ({previewData.length} products)
              </h3>
              <div className="overflow-auto max-h-60 glass-card rounded-xl p-4">
                <pre className="text-xs text-white/60">
                  {JSON.stringify(previewData.slice(0, 5), null, 2)}
                  {previewData.length > 5 && '\n...and more'}
                </pre>
              </div>
            </div>
          )}
        </div>
        
        <div className="p-6 border-t border-white/20 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-6 py-2 glass-button rounded-xl"
          >
            Cancel
          </button>
          <button
            onClick={handleImport}
            disabled={!previewData || previewData.length === 0}
            className="px-6 py-2 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 text-white font-medium hover:scale-105 transition-transform disabled:opacity-50"
          >
            Import {previewData ? previewData.length : 0} Products
          </button>
        </div>
      </div>
    </div>
  );
}

export default Products;