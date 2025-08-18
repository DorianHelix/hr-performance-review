import React, { useState, useEffect } from 'react';
import {
  Package, Plus, Trash2, Settings, Upload, PlusCircle,
  Search, Filter, Tag, DollarSign, Box, BarChart,
  TrendingUp, ShoppingCart, Archive, AlertTriangle
} from 'lucide-react';

// Helper functions
function uid() { 
  return Date.now().toString(36) + Math.random().toString(36).substr(2); 
}

// Products Component - Based on Employees but adapted for product management
function Products() {
  const [products, setProducts] = useState(() => {
    // Load from localStorage or use default
    const saved = localStorage.getItem('hr_products');
    return saved ? JSON.parse(saved) : [];
  });
  
  const [showAddModal, setShowAddModal] = useState(false);
  const [showBulkImportModal, setShowBulkImportModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [sortBy, setSortBy] = useState('name'); // name, price, stock, created

  // Save to localStorage whenever products change
  useEffect(() => {
    localStorage.setItem('hr_products', JSON.stringify(products));
  }, [products]);

  // Add new product
  const handleAddProduct = (productData) => {
    const newProduct = {
      id: `prod-${uid()}`,
      ...productData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    setProducts([...products, newProduct]);
    setShowAddModal(false);
  };

  // Update product
  const handleUpdateProduct = (id, updates) => {
    const updated = products.map(prod => 
      prod.id === id ? { ...prod, ...updates, updatedAt: new Date().toISOString() } : prod
    );
    setProducts(updated);
    setEditingProduct(null);
  };

  // Delete product
  const handleDeleteProduct = (id) => {
    if (!confirm("Are you sure you want to delete this product?")) return;
    
    const updated = products.filter(prod => prod.id !== id);
    setProducts(updated);
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
  const totalValue = products.reduce((sum, prod) => sum + ((prod.price || 0) * (prod.stock || 0)), 0);
  const lowStockCount = products.filter(prod => prod.stock < 10).length;
  const totalProducts = products.length;

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
                  <div className="text-xs text-white/60">Total Products</div>
                </div>
                <div className="glass-card p-4 rounded-xl">
                  <div className="text-2xl font-bold text-green-400">${totalValue.toLocaleString()}</div>
                  <div className="text-xs text-white/60">Total Inventory Value</div>
                </div>
                {lowStockCount > 0 && (
                  <div className="glass-card p-4 rounded-xl border-orange-500/30">
                    <div className="text-2xl font-bold text-orange-400">{lowStockCount}</div>
                    <div className="text-xs text-white/60">Low Stock Items</div>
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
                    <th className="text-left p-4 text-white/70 font-medium min-w-[100px]">SKU</th>
                    <th className="text-left p-4 text-white/70 font-medium min-w-[200px]">Product Name</th>
                    <th className="text-left p-4 text-white/70 font-medium min-w-[120px]">Category</th>
                    <th className="text-right p-4 text-white/70 font-medium min-w-[100px]">Price</th>
                    <th className="text-right p-4 text-white/70 font-medium min-w-[100px]">Stock</th>
                    <th className="text-right p-4 text-white/70 font-medium min-w-[120px]">Value</th>
                    <th className="text-left p-4 text-white/70 font-medium min-w-[100px]">Status</th>
                    <th className="text-center p-4 text-white/70 font-medium min-w-[100px]">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {sortedProducts.length === 0 ? (
                    <tr>
                      <td colSpan="8" className="text-center p-8 text-white/50">
                        No products found. Add your first product to get started.
                      </td>
                    </tr>
                  ) : (
                    sortedProducts.map(prod => (
                      <tr key={prod.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                        <td className="p-4">
                          <div className="font-mono text-sm text-blue-300">{prod.sku || 'N/A'}</div>
                        </td>
                        <td className="p-4">
                          <div className="font-medium text-white">{prod.name}</div>
                          {prod.description && (
                            <div className="text-xs text-white/50 mt-1 truncate max-w-xs">{prod.description}</div>
                          )}
                        </td>
                        <td className="p-4">
                          <span className="px-2 py-1 rounded-lg bg-purple-500/20 text-purple-300 text-xs">
                            {prod.category || 'Uncategorized'}
                          </span>
                        </td>
                        <td className="p-4 text-right">
                          <div className="text-white font-medium">
                            ${(prod.price || 0).toLocaleString()}
                          </div>
                        </td>
                        <td className="p-4 text-right">
                          <div className={`font-medium ${prod.stock < 10 ? 'text-orange-400' : 'text-white'}`}>
                            {prod.stock || 0}
                            {prod.stock < 10 && prod.stock > 0 && (
                              <AlertTriangle size={14} className="inline ml-1 text-orange-400" />
                            )}
                            {prod.stock === 0 && (
                              <span className="ml-2 text-red-400 text-xs">Out of Stock</span>
                            )}
                          </div>
                        </td>
                        <td className="p-4 text-right">
                          <div className="text-green-400 font-medium">
                            ${((prod.price || 0) * (prod.stock || 0)).toLocaleString()}
                          </div>
                        </td>
                        <td className="p-4">
                          <span className={`px-2 py-1 rounded-lg text-xs ${
                            prod.status === 'active' 
                              ? 'bg-green-500/20 text-green-300'
                              : prod.status === 'discontinued'
                              ? 'bg-red-500/20 text-red-300'
                              : 'bg-yellow-500/20 text-yellow-300'
                          }`}>
                            {prod.status || 'Active'}
                          </span>
                        </td>
                        <td className="p-4">
                          <div className="flex items-center justify-center gap-2">
                            <button
                              onClick={() => setEditingProduct(prod)}
                              className="p-2 rounded-lg hover:bg-white/10 transition-colors"
                              title="Edit"
                            >
                              <Settings size={16} className="text-white/70" />
                            </button>
                            <button
                              onClick={() => handleDeleteProduct(prod.id)}
                              className="p-2 rounded-lg hover:bg-red-500/20 transition-colors"
                              title="Delete"
                            >
                              <Trash2 size={16} className="text-red-400" />
                            </button>
                          </div>
                        </td>
                      </tr>
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
                  if (window.confirm('Are you sure you want to delete ALL products? This action cannot be undone.')) {
                    setProducts([]);
                  }
                }}
                className="w-full py-3 font-medium transition-all flex items-center justify-center gap-2 rounded-2xl border bg-red-900/80 hover:bg-red-800 border-red-700/50 text-white hover:scale-105"
              >
                <Trash2 size={20} />
                Delete All Products
              </button>
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