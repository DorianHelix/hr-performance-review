import React from 'react';
import { 
  TrendingUp, Package, AlertTriangle, DollarSign, Truck, 
  BarChart3, ShoppingCart, Store, Trash2, ToggleLeft, ToggleRight 
} from 'lucide-react';

function ProductSidebar({ 
  products, 
  isImportedMode, 
  onModeToggle, 
  onDeleteAll,
  formatCurrency 
}) {
  const totalValue = products.reduce((sum, p) => sum + ((p.price || 0) * (p.stock || 0)), 0);
  const lowStockCount = products.filter(p => p.stock > 0 && p.stock <= (p.minStock || 10)).length;
  const outOfStockCount = products.filter(p => p.stock === 0).length;
  const avgPrice = products.length > 0 
    ? products.reduce((sum, p) => sum + (p.price || 0), 0) / products.length 
    : 0;

  const categories = [...new Set(products.map(p => p.category || 'Uncategorized'))];
  const categoryStats = categories.map(cat => ({
    name: cat,
    count: products.filter(p => (p.category || 'Uncategorized') === cat).length,
    value: products
      .filter(p => (p.category || 'Uncategorized') === cat)
      .reduce((sum, p) => sum + ((p.price || 0) * (p.stock || 0)), 0)
  }));

  return (
    <div className="w-80 space-y-4">
      {/* Product Source Toggle */}
      <div className="glass-card-large p-4">
        <h3 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
          <Store size={16} />
          Product Source
        </h3>
        <div className="flex items-center justify-between p-3 glass-card rounded-xl">
          <span className="text-sm text-white/80">
            {isImportedMode ? 'Shopify Products' : 'Manual Products'}
          </span>
          <button
            onClick={onModeToggle}
            className="p-1 hover:bg-white/10 rounded-lg transition-colors"
          >
            {isImportedMode ? 
              <ToggleRight size={24} className="text-blue-400" /> : 
              <ToggleLeft size={24} className="text-white/60" />
            }
          </button>
        </div>
      </div>

      {/* Product Actions Widget */}
      <div className="glass-card-large p-4">
        <h3 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
          <Trash2 size={16} />
          Product Actions
        </h3>
        <button
          onClick={onDeleteAll}
          disabled={products.length === 0}
          className="w-full py-3 px-4 bg-red-900/80 hover:bg-red-800 text-white font-semibold rounded-xl transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 border border-red-700/50"
        >
          <Trash2 size={18} />
          Delete All Products ({products.length})
        </button>
      </div>

      {/* Inventory Summary */}
      <div className="glass-card-large p-4">
        <h3 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
          <Package size={16} />
          Inventory Summary
        </h3>
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-white/60 text-sm">Total Products</span>
            <span className="font-semibold text-white">{products.length}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-white/60 text-sm">Total Value</span>
            <span className="font-semibold text-white">{formatCurrency(totalValue)}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-white/60 text-sm">Avg. Price</span>
            <span className="font-semibold text-white">{formatCurrency(avgPrice)}</span>
          </div>
        </div>
      </div>

      {/* Stock Alerts */}
      {(lowStockCount > 0 || outOfStockCount > 0) && (
        <div className="glass-card-large p-4 border-l-4 border-yellow-400/50">
          <h3 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
            <AlertTriangle size={16} className="text-yellow-400" />
            Stock Alerts
          </h3>
          <div className="space-y-2">
            {lowStockCount > 0 && (
              <div className="flex justify-between items-center p-2 bg-yellow-400/10 rounded-lg">
                <span className="text-yellow-400 text-sm">Low Stock</span>
                <span className="font-semibold text-yellow-400">{lowStockCount} items</span>
              </div>
            )}
            {outOfStockCount > 0 && (
              <div className="flex justify-between items-center p-2 bg-red-400/10 rounded-lg">
                <span className="text-red-400 text-sm">Out of Stock</span>
                <span className="font-semibold text-red-400">{outOfStockCount} items</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Category Distribution */}
      <div className="glass-card-large p-4">
        <h3 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
          <BarChart3 size={16} />
          Category Distribution
        </h3>
        <div className="space-y-2">
          {categoryStats.slice(0, 5).map(cat => (
            <div key={cat.name} className="space-y-1">
              <div className="flex justify-between items-center">
                <span className="text-white/60 text-sm truncate">{cat.name}</span>
                <span className="text-white text-sm font-medium">{cat.count}</span>
              </div>
              <div className="w-full bg-white/10 rounded-full h-1.5">
                <div 
                  className="bg-gradient-to-r from-blue-400 to-purple-400 h-1.5 rounded-full"
                  style={{ width: `${(cat.count / products.length) * 100}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Top Products */}
      <div className="glass-card-large p-4">
        <h3 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
          <TrendingUp size={16} />
          Top Products by Value
        </h3>
        <div className="space-y-2">
          {products
            .sort((a, b) => ((b.price || 0) * (b.stock || 0)) - ((a.price || 0) * (a.stock || 0)))
            .slice(0, 5)
            .map((product, index) => (
              <div key={product.id} className="flex items-center gap-3 p-2 hover:bg-white/5 rounded-lg">
                <span className="text-white/40 text-sm w-6">#{index + 1}</span>
                <div className="flex-1 min-w-0">
                  <div className="text-white text-sm truncate">{product.name}</div>
                  <div className="text-white/40 text-xs">
                    {formatCurrency((product.price || 0) * (product.stock || 0))}
                  </div>
                </div>
              </div>
            ))}
        </div>
      </div>

      {/* Quick Stats */}
      <div className="glass-card-large p-4">
        <h3 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
          <BarChart3 size={16} />
          Quick Stats
        </h3>
        <div className="grid grid-cols-2 gap-3">
          <div className="glass-card p-3 text-center">
            <ShoppingCart size={20} className="mx-auto mb-1 text-blue-400" />
            <div className="text-xs text-white/60">Active</div>
            <div className="text-lg font-semibold text-white">
              {products.filter(p => p.status === 'active').length}
            </div>
          </div>
          <div className="glass-card p-3 text-center">
            <Truck size={20} className="mx-auto mb-1 text-green-400" />
            <div className="text-xs text-white/60">In Stock</div>
            <div className="text-lg font-semibold text-white">
              {products.filter(p => p.stock > 0).length}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProductSidebar;