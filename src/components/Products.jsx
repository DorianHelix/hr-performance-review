import React, { useState, useEffect } from 'react';
import {
  Package, Plus, Trash2, Settings, Upload, PlusCircle,
  Search, Filter, Tag, DollarSign, Box, BarChart,
  TrendingUp, ShoppingCart, Archive, AlertTriangle,
  ChevronDown, ChevronRight, Layers, FileDown
} from 'lucide-react';
import API from '../api';
import { TruncatedTooltip } from './LiquidTooltip';
import Papa from 'papaparse';

// Helper functions
function uid() { 
  return Date.now().toString(36) + Math.random().toString(36).substr(2); 
}

// Products Component with Variant Support
function Products() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedProducts, setExpandedProducts] = useState({});
  
  const [showAddModal, setShowAddModal] = useState(false);
  const [showBulkImportModal, setShowBulkImportModal] = useState(false);
  const [showShopifyImportModal, setShowShopifyImportModal] = useState(false);
  const [showStockImportModal, setShowStockImportModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showStockDetails, setShowStockDetails] = useState(null);
  const [filterCategory, setFilterCategory] = useState('');
  const [sortBy, setSortBy] = useState('name'); // name, price, stock, created

  // Load products from database
  useEffect(() => {
    const loadProducts = async () => {
      // First check localStorage for imported products
      const imported = localStorage.getItem('hr_products_imported');
      if (imported) {
        setProducts(JSON.parse(imported));
        setLoading(false);
        return;
      }
      
      try {
        const data = await API.products.getAll();
        setProducts(data);
        localStorage.setItem('hr_products', JSON.stringify(data));
      } catch (error) {
        console.error('Error loading products from database:', error);
        const saved = localStorage.getItem('hr_products');
        if (saved) setProducts(JSON.parse(saved));
      }
      setLoading(false);
    };
    
    loadProducts();
    // Don't refresh if we have imported products
    const imported = localStorage.getItem('hr_products_imported');
    if (!imported) {
      const interval = setInterval(loadProducts, 5000);
      return () => clearInterval(interval);
    }
  }, []);

  // Toggle product expansion for variants
  const toggleExpand = (productId) => {
    setExpandedProducts(prev => ({
      ...prev,
      [productId]: !prev[productId]
    }));
  };

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
        
        alert('Stock levels imported successfully!');
      },
      error: (error) => {
        console.error('Stock CSV parse error:', error);
        alert('Error parsing stock CSV file. Please check the format.');
      }
    });
  };

  // Import Shopify CSV
  const handleShopifyImport = (file) => {
    Papa.parse(file, {
      header: true,
      complete: async (results) => {
        console.log('Parsing CSV...', results.data.length, 'rows');
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
              category: row['Product Category'] || '',
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
        setShowShopifyImportModal(false);
      },
      error: (error) => {
        console.error('CSV parse error:', error);
        alert('Error parsing CSV file. Please check the format.');
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
      setProducts([...products, newProduct]);
      localStorage.setItem('hr_products', JSON.stringify([...products, newProduct]));
    } catch (error) {
      console.error('Error saving to database:', error);
      // Still update local state even if database fails
      setProducts([...products, newProduct]);
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
    localStorage.setItem('hr_products', JSON.stringify(updated));
    setEditingProduct(null);
  };

  // Delete product
  const handleDeleteProduct = async (id) => {
    if (!confirm("Are you sure you want to delete this product?")) return;
    
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
    localStorage.setItem('hr_products', JSON.stringify(updated));
  };

  // Filter products
  const filteredProducts = products.filter(prod => {
    const matchesSearch = prod.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          prod.sku?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = !filterCategory || prod.category === filterCategory;
    return matchesSearch && matchesCategory;
  });

  // Sort products
  const sortedProducts = [...filteredProducts].sort((a, b) => {
    switch(sortBy) {
      case 'name':
        return a.name.localeCompare(b.name);
      case 'price':
        return (b.price || 0) - (a.price || 0);
      case 'stock':
        return (b.stock || 0) - (a.stock || 0);
      case 'created':
        return new Date(b.createdAt) - new Date(a.createdAt);
      default:
        return 0;
    }
  });

  // Get unique categories
  const categories = [...new Set(products.map(prod => prod.category))].filter(Boolean);

  // Calculate stats
  const totalProducts = products.length;
  const totalVariants = products.reduce((sum, p) => sum + (p.variants?.length || 0), 0);
  const totalStock = products.reduce((sum, p) => {
    if (p.hasVariants && p.variants) {
      return sum + p.variants.reduce((vSum, v) => vSum + (v.stock || 0), 0);
    }
    return sum + (p.stock || 0);
  }, 0);
  const totalValue = products.reduce((sum, prod) => {
    if (prod.hasVariants && prod.variants) {
      return sum + prod.variants.reduce((vSum, v) => vSum + ((v.price || 0) * (v.stock || 0)), 0);
    }
    return sum + ((prod.price || 0) * (prod.stock || 0));
  }, 0);
  const lowStockCount = products.filter(prod => {
    const stock = prod.totalStock || prod.stock || 0;
    return stock < 10;
  }).length;

  return (
    <div className="flex h-full overflow-hidden">
      {/* Main Content - Fixed width container */}
      <div className="flex-1 min-w-0 max-w-[calc(100%-24rem)] p-4 md:p-6 overflow-hidden">
        <div className="w-full h-full flex flex-col">
          <header className="glass-card-large p-6 mb-6" style={{ minHeight: '170px' }}>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h1 className="text-2xl font-bold text-white mb-2 flex items-center gap-3">
                  <div className="glass-card p-2 rounded-2xl bg-gradient-to-br from-purple-400/20 to-pink-600/20 border-purple-400/30">
                    <Package size={24} className="text-purple-300" />
                  </div>
                  Product Management
                </h1>
                <p className="text-white/60">Manage your product catalog and inventory</p>
              </div>
              
              {/* Stats Cards */}
              <div className="flex gap-4">
                <div className="glass-card p-4 rounded-xl">
                  <div className="text-2xl font-bold text-white">{totalProducts}</div>
                  <div className="text-xs text-white/60">Products</div>
                </div>
                {totalVariants > 0 && (
                  <div className="glass-card p-4 rounded-xl">
                    <div className="text-2xl font-bold text-purple-400">{totalVariants}</div>
                    <div className="text-xs text-white/60">Variants</div>
                  </div>
                )}
                <div className="glass-card p-4 rounded-xl">
                  <div className="text-2xl font-bold text-blue-400">{totalStock}</div>
                  <div className="text-xs text-white/60">Total Stock</div>
                </div>
                {lowStockCount > 0 && (
                  <div className="glass-card p-4 rounded-xl border-orange-500/30">
                    <div className="text-2xl font-bold text-orange-400">{lowStockCount}</div>
                    <div className="text-xs text-white/60">Low Stock</div>
                  </div>
                )}
              </div>
            </div>

            {/* Search and Filter Bar */}
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
          </header>

          {/* Products Table */}
          <div className="glass-card-large flex flex-col overflow-hidden flex-1">
            <div className="flex-1 overflow-x-auto overflow-y-auto">
              <table className="w-max">
                <thead>
                  <tr className="border-b border-white/10">
                    <th className="text-left p-4 text-white/70 font-medium w-10"></th>
                    <th className="text-left p-4 text-white/70 font-medium min-w-[250px]">Product / Variant</th>
                    <th className="text-left p-4 text-white/70 font-medium min-w-[120px]">SKU</th>
                    <th className="text-left p-4 text-white/70 font-medium min-w-[120px]">Category</th>
                    <th className="text-right p-4 text-white/70 font-medium min-w-[100px]">Price</th>
                    <th className="text-right p-4 text-white/70 font-medium min-w-[100px]">Cost</th>
                    <th className="text-right p-4 text-white/70 font-medium min-w-[100px]">Stock</th>
                    <th className="text-left p-4 text-white/70 font-medium min-w-[100px]">Status</th>
                    <th className="text-center p-4 text-white/70 font-medium min-w-[100px]">Actions</th>
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
                          <td className="p-4">
                            {prod.hasVariants && (
                              <button
                                onClick={() => toggleExpand(prod.id)}
                                className="p-1 rounded hover:bg-white/10 transition-colors"
                              >
                                {expandedProducts[prod.id] ? (
                                  <ChevronDown size={16} className="text-white/60" />
                                ) : (
                                  <ChevronRight size={16} className="text-white/60" />
                                )}
                              </button>
                            )}
                          </td>
                          <td className="p-4">
                            <div className="flex items-start gap-2">
                              {prod.hasVariants && (
                                <Layers size={16} className="text-purple-400 mt-1" />
                              )}
                              <div className="min-w-0 flex-1">
                                <TruncatedTooltip content={prod.name} variant="default">
                                  <div className="font-medium text-white truncate max-w-[250px]">
                                    {prod.name}
                                  </div>
                                </TruncatedTooltip>
                                {prod.handle && (
                                  <div className="text-xs text-white/40 mt-1">Handle: {prod.handle}</div>
                                )}
                                {prod.hasVariants && prod.variants && (
                                  <div className="text-xs text-purple-400 mt-1">
                                    {prod.variants.length} variants
                                  </div>
                                )}
                              </div>
                            </div>
                          </td>
                          <td className="p-4">
                            <div className="text-sm text-white/60 font-mono">
                              {prod.hasVariants ? (
                                <span className="text-white/30">Multiple</span>
                              ) : (
                                prod.sku || 'N/A'
                              )}
                            </div>
                          </td>
                          <td className="p-4">
                            {prod.category && (
                              <span className="px-2 py-1 rounded-lg bg-purple-500/20 text-purple-300 text-xs">
                                {prod.category}
                              </span>
                            )}
                          </td>
                          <td className="p-4 text-right">
                            <div className="text-white font-medium">
                              {prod.hasVariants ? (
                                <span className="text-white/50">Various</span>
                              ) : (
                                `$${(prod.price || 0).toLocaleString()}`
                              )}
                            </div>
                          </td>
                          <td className="p-4 text-right">
                            <div className="text-white/60">
                              {prod.hasVariants ? (
                                <span className="text-white/30">Various</span>
                              ) : (
                                `$${(prod.cost || 0).toLocaleString()}`
                              )}
                            </div>
                          </td>
                          <td className="p-4 text-right">
                            <button
                              onClick={() => setShowStockDetails(prod)}
                              className={`font-medium flex items-center justify-end gap-2 hover:underline ${
                                (prod.totalStock || prod.stock || 0) < 10 ? 'text-orange-400' : 'text-white'
                              }`}
                            >
                              <span>{prod.totalStock || prod.stock || 0}</span>
                              {(prod.totalStock || prod.stock || 0) < 10 && (prod.totalStock || prod.stock || 0) > 0 && (
                                <AlertTriangle size={14} className="text-orange-400" />
                              )}
                              {(prod.totalStock || prod.stock || 0) === 0 && (
                                <span className="text-red-400 text-xs">Out</span>
                              )}
                            </button>
                          </td>
                          <td className="p-4">
                            <span className={`px-2 py-1 rounded-lg text-xs ${
                              prod.status === 'active' 
                                ? 'bg-green-500/20 text-green-300'
                                : prod.status === 'draft'
                                ? 'bg-yellow-500/20 text-yellow-300'
                                : 'bg-red-500/20 text-red-300'
                            }`}>
                              {prod.status || 'Active'}
                            </span>
                          </td>
                          <td className="p-4">
                            <div className="flex items-center justify-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                              <button
                                onClick={() => setEditingProduct(prod)}
                                className="p-1.5 rounded hover:bg-white/10 transition-colors"
                              >
                                <Settings size={14} className="text-white/70" />
                              </button>
                              <button
                                onClick={() => handleDeleteProduct(prod.id)}
                                className="p-1.5 rounded hover:bg-red-500/20 transition-colors"
                              >
                                <Trash2 size={14} className="text-red-400" />
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
                            <td className="p-4"></td>
                            <td className="p-4 pl-14">
                              <div className="flex items-center gap-3">
                                <div className="w-1.5 h-1.5 rounded-full bg-purple-400/60"></div>
                                <div>
                                  <div className="text-sm text-white/80">
                                    {variant.name}
                                  </div>
                                </div>
                              </div>
                            </td>
                            <td className="p-4">
                              <div className="text-xs text-white/50 font-mono">
                                {variant.sku || '-'}
                              </div>
                            </td>
                            <td className="p-4">
                              <span className="text-white/20 text-xs">Inherited</span>
                            </td>
                            <td className="p-4 text-right">
                              <div className="text-white/80 text-sm">
                                ${(variant.price || 0).toLocaleString()}
                              </div>
                            </td>
                            <td className="p-4 text-right">
                              <div className="text-white/60 text-sm">
                                ${(variant.cost || 0).toLocaleString()}
                              </div>
                            </td>
                            <td className="p-4 text-right">
                              <button
                                onClick={() => setShowStockDetails(variant)}
                                className={`text-sm font-medium hover:underline ${
                                  variant.stock < 10 ? 'text-orange-400' : 'text-white/80'
                                }`}
                              >
                                {variant.stock || 0}
                                {variant.stock === 0 && (
                                  <span className="ml-2 text-red-400 text-xs">Out</span>
                                )}
                              </button>
                            </td>
                            <td className="p-4">
                              <span className="text-white/20 text-xs">-</span>
                            </td>
                            <td className="p-4">
                              <div className="flex items-center justify-center">
                                <button className="p-1 rounded hover:bg-white/10 opacity-50 hover:opacity-100 transition-all">
                                  <Settings size={12} className="text-white/50" />
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
      </div>

      {/* Right Sidebar - Fixed position */}
      <div className="w-96 flex-shrink-0 p-4 md:p-6 space-y-6 h-full overflow-y-auto">
        <div className="glass-card-large p-6">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <PlusCircle size={20} className="text-purple-400" />
            Product Actions
          </h3>
          
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
              onClick={() => setShowShopifyImportModal(true)}
              className="w-full glass-button py-3 font-medium hover:scale-105 transition-transform flex items-center justify-center gap-2 bg-gradient-to-r from-purple-500/20 to-pink-500/20 border-purple-400/30"
            >
              <FileDown size={20} />
              Import Shopify CSV
            </button>
            
            {products.length > 0 && (
              <button
                onClick={() => setShowStockImportModal(true)}
                className="w-full glass-button py-3 font-medium hover:scale-105 transition-transform flex items-center justify-center gap-2 bg-gradient-to-r from-blue-500/20 to-cyan-500/20 border-blue-400/30"
              >
                <Package size={20} />
                Import Stock Levels
              </button>
            )}
            
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
              <>
                <button
                  onClick={() => {
                    if (window.confirm('Are you sure you want to delete ALL products? This action cannot be undone.')) {
                      setProducts([]);
                      localStorage.removeItem('hr_products_imported');
                      localStorage.removeItem('hr_products');
                    }
                  }}
                  className="w-full py-3 font-medium transition-all flex items-center justify-center gap-2 rounded-2xl border bg-red-900/80 hover:bg-red-800 border-red-700/50 text-white hover:scale-105"
                >
                  <Trash2 size={20} />
                  Delete All Products
                </button>
                
                {localStorage.getItem('hr_products_imported') && (
                  <button
                    onClick={() => {
                      localStorage.removeItem('hr_products_imported');
                      window.location.reload();
                    }}
                    className="w-full py-3 font-medium transition-all flex items-center justify-center gap-2 rounded-2xl border bg-yellow-900/50 hover:bg-yellow-800/50 border-yellow-700/30 text-yellow-400 hover:scale-105"
                  >
                    <Archive size={20} />
                    Clear Imported Data
                  </button>
                )}
              </>
            )}
          </div>

          {/* Quick Stats */}
          <div className="mt-6 space-y-4">
            <div className="p-4 rounded-xl bg-white/5 border border-white/10">
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
                    ${products.length > 0 
                      ? Math.round(products.reduce((sum, p) => sum + (p.price || 0), 0) / products.length)
                      : 0}
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
            <div className="p-4 rounded-xl bg-gradient-to-br from-purple-500/10 to-pink-500/10 border border-purple-400/20">
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
              <div className="p-4 rounded-xl bg-orange-500/10 border border-orange-400/20">
                <h4 className="text-sm font-medium text-orange-400 mb-2 flex items-center gap-2">
                  <AlertTriangle size={16} />
                  Low Stock Alert
                </h4>
                <p className="text-xs text-white/60">
                  {lowStockCount} product{lowStockCount > 1 ? 's' : ''} running low on stock
                </p>
              </div>
            )}
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

      {/* Stock Import Modal */}
      {showStockImportModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="glass-card-large w-full max-w-2xl">
            <div className="p-6 border-b border-white/20">
              <h2 className="text-xl font-bold text-white">Import Stock Levels</h2>
              <p className="text-sm text-white/60 mt-2">Import inventory levels from Shopify inventory export</p>
            </div>
            
            <div className="p-6">
              <div className="border-2 border-dashed border-blue-400/30 rounded-xl p-8 text-center bg-gradient-to-br from-blue-500/5 to-cyan-500/5">
                <Package size={48} className="mx-auto mb-4 text-blue-400" />
                <p className="text-white/60 mb-4">
                  Drag and drop your inventory CSV file here, or click to browse
                </p>
                <input
                  type="file"
                  accept=".csv"
                  onChange={(e) => {
                    if (e.target.files[0]) {
                      handleStockImport(e.target.files[0]);
                    }
                  }}
                  className="hidden"
                  id="stock-csv-upload"
                />
                <label
                  htmlFor="stock-csv-upload"
                  className="glass-button px-6 py-2 cursor-pointer inline-block bg-gradient-to-r from-blue-500/20 to-cyan-500/20 border-blue-400/30"
                >
                  Choose Inventory CSV
                </label>
              </div>
              
              <div className="mt-6 space-y-2 text-sm text-white/50">
                <p className="flex items-center gap-2">
                  <Box size={14} className="text-blue-400" />
                  Stock levels will be matched by Handle and Option1 Value
                </p>
                <p className="flex items-center gap-2">
                  <TrendingUp size={14} className="text-blue-400" />
                  Location-specific stock will be aggregated
                </p>
                <p className="flex items-center gap-2">
                  <BarChart size={14} className="text-blue-400" />
                  Click on stock numbers to see location breakdown
                </p>
              </div>
            </div>
            
            <div className="p-6 border-t border-white/20 flex justify-end gap-3">
              <button
                onClick={() => setShowStockImportModal(false)}
                className="px-6 py-2 glass-button rounded-xl"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
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

      {/* Shopify Import Modal */}
      {showShopifyImportModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="glass-card-large w-full max-w-2xl">
            <div className="p-6 border-b border-white/20">
              <h2 className="text-xl font-bold text-white">Import Shopify CSV</h2>
              <p className="text-sm text-white/60 mt-2">Import products with variants from Shopify export</p>
            </div>
            
            <div className="p-6">
              <div className="border-2 border-dashed border-purple-400/30 rounded-xl p-8 text-center bg-gradient-to-br from-purple-500/5 to-pink-500/5">
                <Upload size={48} className="mx-auto mb-4 text-purple-400" />
                <p className="text-white/60 mb-4">
                  Drag and drop your Shopify CSV file here, or click to browse
                </p>
                <input
                  type="file"
                  accept=".csv"
                  onChange={(e) => {
                    if (e.target.files[0]) {
                      handleShopifyImport(e.target.files[0]);
                      setShowShopifyImportModal(false);
                    }
                  }}
                  className="hidden"
                  id="shopify-csv-upload"
                />
                <label
                  htmlFor="shopify-csv-upload"
                  className="glass-button px-6 py-2 cursor-pointer inline-block bg-gradient-to-r from-purple-500/20 to-pink-500/20 border-purple-400/30"
                >
                  Choose CSV File
                </label>
              </div>
              
              <div className="mt-6 space-y-2 text-sm text-white/50">
                <p className="flex items-center gap-2">
                  <Layers size={14} className="text-purple-400" />
                  Products with the same Handle will be grouped as variants
                </p>
                <p className="flex items-center gap-2">
                  <Package size={14} className="text-purple-400" />
                  Variant options (like "1 darab", "2 darab") will be imported
                </p>
                <p className="flex items-center gap-2">
                  <DollarSign size={14} className="text-purple-400" />
                  Price and cost per item will be preserved for each variant
                </p>
              </div>
            </div>
            
            <div className="p-6 border-t border-white/20 flex justify-end gap-3">
              <button
                onClick={() => setShowShopifyImportModal(false)}
                className="px-6 py-2 glass-button rounded-xl"
              >
                Cancel
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
      alert('Product name is required');
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
              <label className="block text-sm font-medium text-white/70 mb-2">Price ($)</label>
              <input
                type="number"
                step="0.01"
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