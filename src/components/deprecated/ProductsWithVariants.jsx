import React, { useState, useEffect } from 'react';
import {
  Package, Plus, Trash2, Settings, Upload, PlusCircle,
  Search, Filter, Tag, DollarSign, Box, BarChart,
  TrendingUp, ShoppingCart, Archive, AlertTriangle,
  ChevronDown, ChevronRight, FileDown, Layers
} from 'lucide-react';
import API from '../api';
import { TruncatedTooltip } from './LiquidTooltip';
import Papa from 'papaparse';

// Helper functions
function uid() { 
  return Date.now().toString(36) + Math.random().toString(36).substr(2); 
}

// Products with Variants Component
function ProductsWithVariants() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedProducts, setExpandedProducts] = useState({});
  
  const [showAddModal, setShowAddModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [sortBy, setSortBy] = useState('name');

  // Load products from database
  useEffect(() => {
    const loadProducts = async () => {
      try {
        const data = await API.products.getAll();
        // Group products by parent/variant relationship
        const grouped = groupProductsWithVariants(data);
        setProducts(grouped);
        localStorage.setItem('hr_products_variants', JSON.stringify(grouped));
      } catch (error) {
        console.error('Error loading products:', error);
        const saved = localStorage.getItem('hr_products_variants');
        if (saved) setProducts(JSON.parse(saved));
      }
      setLoading(false);
    };
    
    loadProducts();
    const interval = setInterval(loadProducts, 5000);
    return () => clearInterval(interval);
  }, []);

  // Group products with their variants
  const groupProductsWithVariants = (data) => {
    const parentProducts = data.filter(p => !p.is_variant);
    const variants = data.filter(p => p.is_variant);
    
    return parentProducts.map(parent => {
      const productVariants = variants.filter(v => v.parent_id === parent.id);
      // Calculate total stock from variants if they exist
      const totalStock = productVariants.length > 0 
        ? productVariants.reduce((sum, v) => sum + (v.stock || 0), 0)
        : parent.stock || 0;
      
      return {
        ...parent,
        variants: productVariants,
        totalStock,
        hasVariants: productVariants.length > 0
      };
    });
  };

  // Toggle product expansion
  const toggleExpand = (productId) => {
    setExpandedProducts(prev => ({
      ...prev,
      [productId]: !prev[productId]
    }));
  };

  // Import Shopify CSV
  const handleShopifyImport = (file) => {
    Papa.parse(file, {
      header: true,
      complete: async (results) => {
        const rows = results.data;
        const productsToImport = [];
        let currentProduct = null;

        for (const row of rows) {
          if (row.Handle && row.Title && row['Variant Price']) {
            // This is a main product or first variant
            if (!currentProduct || currentProduct.handle !== row.Handle) {
              // New product
              currentProduct = {
                id: `prod-${uid()}`,
                handle: row.Handle,
                name: row.Title,
                category: row['Product Category'] || '',
                description: row['Body (HTML)'] || '',
                vendor: row.Vendor || '',
                status: row.Status?.toLowerCase() || 'active',
                variants: [],
                images: []
              };
              productsToImport.push(currentProduct);
            }
            
            // Add variant (including the first row as a variant)
            if (row['Option1 Value']) {
              const variant = {
                id: `var-${uid()}`,
                parent_id: currentProduct.id,
                variant_name: row['Option1 Value'],
                variant_sku: row['Variant SKU'] || '',
                variant_price: parseFloat(row['Variant Price']) || 0,
                cost_per_item: parseFloat(row['Cost per item']) || 0,
                stock: parseInt(row['Variant Inventory Qty']) || 0,
                is_variant: true
              };
              currentProduct.variants.push(variant);
            }
            
            // Add images
            if (row['Image Src'] && !currentProduct.images.includes(row['Image Src'])) {
              currentProduct.images.push(row['Image Src']);
            }
          }
        }

        // Save to database
        for (const product of productsToImport) {
          try {
            // Save parent product
            await API.products.create({
              ...product,
              images: JSON.stringify(product.images)
            });
            
            // Save variants
            for (const variant of product.variants) {
              await API.products.create(variant);
            }
          } catch (error) {
            console.error('Error importing product:', error);
          }
        }

        // Reload products
        window.location.reload();
      }
    });
  };

  // Filter products
  const filteredProducts = products.filter(prod => {
    const matchesSearch = prod.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          prod.handle?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = !filterCategory || prod.category === filterCategory;
    return matchesSearch && matchesCategory;
  });

  // Sort products
  const sortedProducts = [...filteredProducts].sort((a, b) => {
    switch(sortBy) {
      case 'name':
        return a.name.localeCompare(b.name);
      case 'stock':
        return (b.totalStock || 0) - (a.totalStock || 0);
      case 'created':
        return new Date(b.created_at) - new Date(a.created_at);
      default:
        return 0;
    }
  });

  // Get unique categories
  const categories = [...new Set(products.map(prod => prod.category))].filter(Boolean);

  // Calculate stats
  const totalProducts = products.length;
  const totalVariants = products.reduce((sum, p) => sum + p.variants.length, 0);
  const totalStock = products.reduce((sum, p) => sum + p.totalStock, 0);
  const lowStockCount = products.filter(p => p.totalStock < 10).length;

  return (
    <div className="flex h-full overflow-hidden">
      {/* Main Content */}
      <div className="flex-1 min-w-0 max-w-[calc(100%-24rem)] p-4 md:p-6 overflow-hidden">
        <div className="w-full h-full flex flex-col">
          <header className="glass-card-large p-6 mb-6" style={{ minHeight: '170px' }}>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h1 className="text-2xl font-bold text-white mb-2 flex items-center gap-3">
                  <div className="glass-card p-2 rounded-2xl bg-gradient-to-br from-purple-400/20 to-pink-600/20 border-purple-400/30">
                    <Package size={24} className="text-purple-300" />
                  </div>
                  Product Management with Variants
                </h1>
                <p className="text-white/60">Manage products and their variants from Shopify</p>
              </div>
              
              {/* Stats Cards */}
              <div className="flex gap-4">
                <div className="glass-card p-4 rounded-xl">
                  <div className="text-2xl font-bold text-white">{totalProducts}</div>
                  <div className="text-xs text-white/60">Products</div>
                </div>
                <div className="glass-card p-4 rounded-xl">
                  <div className="text-2xl font-bold text-purple-400">{totalVariants}</div>
                  <div className="text-xs text-white/60">Variants</div>
                </div>
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
                  placeholder="Search products or handles..."
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
                    <th className="text-left p-4 text-white/70 font-medium min-w-[40px]"></th>
                    <th className="text-left p-4 text-white/70 font-medium min-w-[300px]">Product / Variant</th>
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
                  {sortedProducts.map(prod => (
                    <React.Fragment key={prod.id}>
                      {/* Main Product Row */}
                      <tr className="border-b border-white/5 hover:bg-white/5 transition-colors">
                        <td className="p-4">
                          {prod.hasVariants && (
                            <button
                              onClick={() => toggleExpand(prod.id)}
                              className="p-1 rounded hover:bg-white/10"
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
                          <div className="flex items-center gap-2">
                            {prod.hasVariants && (
                              <Layers size={14} className="text-purple-400" />
                            )}
                            <div>
                              <TruncatedTooltip content={prod.name} variant="default">
                                <div className="font-medium text-white truncate max-w-[250px]">
                                  {prod.name}
                                </div>
                              </TruncatedTooltip>
                              {prod.handle && (
                                <div className="text-xs text-white/40">Handle: {prod.handle}</div>
                              )}
                              {prod.hasVariants && (
                                <div className="text-xs text-purple-400 mt-1">
                                  {prod.variants.length} variants
                                </div>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="p-4">
                          <div className="text-sm text-white/60">
                            {prod.hasVariants ? '-' : prod.sku || 'N/A'}
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
                            {prod.hasVariants ? '-' : `$${(prod.price || 0).toLocaleString()}`}
                          </div>
                        </td>
                        <td className="p-4 text-right">
                          <div className="text-white/60">
                            {prod.hasVariants ? '-' : `$${(prod.cost_per_item || 0).toLocaleString()}`}
                          </div>
                        </td>
                        <td className="p-4 text-right">
                          <div className={`font-medium ${prod.totalStock < 10 ? 'text-orange-400' : 'text-white'}`}>
                            {prod.totalStock || 0}
                            {prod.totalStock < 10 && prod.totalStock > 0 && (
                              <AlertTriangle size={14} className="inline ml-1 text-orange-400" />
                            )}
                          </div>
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
                          <div className="flex items-center justify-center gap-2">
                            <button
                              onClick={() => setEditingProduct(prod)}
                              className="p-2 rounded-lg hover:bg-white/10 transition-colors"
                            >
                              <Settings size={16} className="text-white/70" />
                            </button>
                            <button
                              onClick={() => handleDeleteProduct(prod.id)}
                              className="p-2 rounded-lg hover:bg-red-500/20 transition-colors"
                            >
                              <Trash2 size={16} className="text-red-400" />
                            </button>
                          </div>
                        </td>
                      </tr>

                      {/* Variant Rows */}
                      {expandedProducts[prod.id] && prod.variants.map(variant => (
                        <tr key={variant.id} className="border-b border-white/5 bg-black/20 hover:bg-white/5">
                          <td className="p-4"></td>
                          <td className="p-4 pl-12">
                            <div className="flex items-center gap-2">
                              <div className="w-2 h-2 rounded-full bg-purple-400/50"></div>
                              <div>
                                <div className="text-sm text-white/80">{variant.variant_name}</div>
                              </div>
                            </div>
                          </td>
                          <td className="p-4">
                            <div className="text-sm text-white/50 font-mono">
                              {variant.variant_sku || '-'}
                            </div>
                          </td>
                          <td className="p-4">-</td>
                          <td className="p-4 text-right">
                            <div className="text-white/80 text-sm">
                              ${(variant.variant_price || 0).toLocaleString()}
                            </div>
                          </td>
                          <td className="p-4 text-right">
                            <div className="text-white/60 text-sm">
                              ${(variant.cost_per_item || 0).toLocaleString()}
                            </div>
                          </td>
                          <td className="p-4 text-right">
                            <div className={`text-sm ${variant.stock < 10 ? 'text-orange-400' : 'text-white/80'}`}>
                              {variant.stock || 0}
                            </div>
                          </td>
                          <td className="p-4">-</td>
                          <td className="p-4">
                            <div className="flex items-center justify-center gap-2">
                              <button
                                onClick={() => setEditingProduct(variant)}
                                className="p-1 rounded hover:bg-white/10"
                              >
                                <Settings size={14} className="text-white/50" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </React.Fragment>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* Right Sidebar */}
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
              onClick={() => setShowImportModal(true)}
              className="w-full glass-button py-3 font-medium hover:scale-105 transition-transform flex items-center justify-center gap-2"
            >
              <Upload size={20} />
              Import Shopify CSV
            </button>
            
            <button
              onClick={() => {
                // Export logic here
              }}
              className="w-full glass-button py-3 font-medium hover:scale-105 transition-transform flex items-center justify-center gap-2"
            >
              <FileDown size={20} />
              Export Data
            </button>
          </div>
        </div>
      </div>

      {/* Import Modal */}
      {showImportModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="glass-card-large w-full max-w-2xl">
            <div className="p-6 border-b border-white/20">
              <h2 className="text-xl font-bold text-white">Import Shopify CSV</h2>
            </div>
            
            <div className="p-6">
              <div className="border-2 border-dashed border-white/20 rounded-xl p-8 text-center">
                <Upload size={48} className="mx-auto mb-4 text-white/40" />
                <p className="text-white/60 mb-4">
                  Drag and drop your Shopify CSV file here, or click to browse
                </p>
                <input
                  type="file"
                  accept=".csv"
                  onChange={(e) => {
                    if (e.target.files[0]) {
                      handleShopifyImport(e.target.files[0]);
                      setShowImportModal(false);
                    }
                  }}
                  className="hidden"
                  id="csv-upload"
                />
                <label
                  htmlFor="csv-upload"
                  className="glass-button px-6 py-2 cursor-pointer inline-block"
                >
                  Choose File
                </label>
              </div>
              
              <div className="mt-6 space-y-2 text-sm text-white/50">
                <p>• The CSV should be exported from Shopify's product export</p>
                <p>• Products with the same Handle will be grouped as variants</p>
                <p>• Stock levels will be automatically calculated from variants</p>
              </div>
            </div>
            
            <div className="p-6 border-t border-white/20 flex justify-end gap-3">
              <button
                onClick={() => setShowImportModal(false)}
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

export default ProductsWithVariants;