import React from 'react';
import { Edit, Trash2, AlertCircle, Package, DollarSign, Hash } from 'lucide-react';

function ProductTable({ 
  products, 
  viewMode, 
  onEdit, 
  onDelete,
  formatCurrency 
}) {
  const getStockStatus = (stock, minStock) => {
    if (stock === 0) return { color: 'text-red-400', bg: 'bg-red-400/20', label: 'Out of Stock' };
    if (stock <= minStock) return { color: 'text-yellow-400', bg: 'bg-yellow-400/20', label: 'Low Stock' };
    return { color: 'text-green-400', bg: 'bg-green-400/20', label: 'In Stock' };
  };

  if (viewMode === 'grid') {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {products.map(product => {
          const status = getStockStatus(product.stock || 0, product.minStock || 10);
          return (
            <div key={product.id} className="glass-card-large p-4 hover:scale-105 transition-all">
              <div className="flex justify-between items-start mb-3">
                <div className="flex-1">
                  <h3 className="font-semibold text-white">{product.name}</h3>
                  <p className="text-sm text-white/60">{product.sku}</p>
                </div>
                <div className="flex gap-1">
                  <button
                    onClick={() => onEdit(product)}
                    className="p-1 hover:bg-white/10 rounded-lg transition-colors"
                  >
                    <Edit size={16} className="text-white/60" />
                  </button>
                  <button
                    onClick={() => onDelete(product.id)}
                    className="p-1 hover:bg-white/10 rounded-lg transition-colors"
                  >
                    <Trash2 size={16} className="text-white/60" />
                  </button>
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-white/60">Category</span>
                  <span className="text-sm text-white">{product.category || 'Uncategorized'}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-white/60">Price</span>
                  <span className="text-sm font-semibold text-white">
                    {formatCurrency(product.price || 0)}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-white/60">Stock</span>
                  <span className={`text-sm font-medium ${status.color}`}>
                    {product.stock || 0} units
                  </span>
                </div>
                <div className={`mt-3 px-2 py-1 rounded-lg text-xs font-medium ${status.bg} ${status.color} text-center`}>
                  {status.label}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    );
  }

  return (
    <div className="glass-card-large rounded-3xl overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-white/10">
              <th className="text-left p-4 text-white/80 font-medium">Product</th>
              <th className="text-left p-4 text-white/80 font-medium">SKU</th>
              <th className="text-left p-4 text-white/80 font-medium">Category</th>
              <th className="text-right p-4 text-white/80 font-medium">Price</th>
              <th className="text-right p-4 text-white/80 font-medium">Stock</th>
              <th className="text-center p-4 text-white/80 font-medium">Status</th>
              <th className="text-center p-4 text-white/80 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {products.map((product, index) => {
              const status = getStockStatus(product.stock || 0, product.minStock || 10);
              return (
                <tr 
                  key={product.id} 
                  className={`border-b border-white/5 hover:bg-white/5 transition-colors ${
                    index % 2 === 0 ? 'bg-white/[0.02]' : ''
                  }`}
                >
                  <td className="p-4">
                    <div>
                      <div className="font-medium text-white">{product.name}</div>
                      {product.description && (
                        <div className="text-sm text-white/60 mt-1 max-w-xs truncate">
                          {product.description}
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="p-4 text-white/80">
                    <div className="flex items-center gap-2">
                      <Hash size={14} className="text-white/40" />
                      {product.sku || '-'}
                    </div>
                  </td>
                  <td className="p-4 text-white/80">{product.category || 'Uncategorized'}</td>
                  <td className="p-4 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <DollarSign size={14} className="text-white/40" />
                      <span className="font-semibold text-white">
                        {formatCurrency(product.price || 0)}
                      </span>
                    </div>
                  </td>
                  <td className="p-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Package size={14} className="text-white/40" />
                      <span className={`font-medium ${status.color}`}>
                        {product.stock || 0}
                      </span>
                      <span className="text-white/40 text-sm">/ {product.minStock || 10}</span>
                    </div>
                  </td>
                  <td className="p-4 text-center">
                    <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-medium ${status.bg} ${status.color}`}>
                      {product.stock === 0 && <AlertCircle size={12} />}
                      {status.label}
                    </span>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center justify-center gap-2">
                      <button
                        onClick={() => onEdit(product)}
                        className="p-1.5 hover:bg-white/10 rounded-lg transition-colors"
                      >
                        <Edit size={16} className="text-white/60 hover:text-white" />
                      </button>
                      <button
                        onClick={() => onDelete(product.id)}
                        className="p-1.5 hover:bg-red-400/20 rounded-lg transition-colors"
                      >
                        <Trash2 size={16} className="text-white/60 hover:text-red-400" />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default ProductTable;