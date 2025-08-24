import React from 'react';
import { ChevronDown, ChevronRight, Package, AlertCircle } from 'lucide-react';

const ProductsTable = ({ 
  products, 
  visibleColumns, 
  expandedRows, 
  onToggleExpand,
  renderColumnValue,
  loading 
}) => {
  
  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-blue-400 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-white/60">Loading products...</p>
        </div>
      </div>
    );
  }

  if (!products || products.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-96 text-white/50">
        <Package size={48} className="mb-4" />
        <h3 className="text-lg font-medium text-white mb-2">No Products Found</h3>
        <p className="text-sm">Import products from Shopify or add them manually</p>
      </div>
    );
  }

  const getColumnHeader = (colKey) => {
    const headers = {
      name: 'Product',
      sku: 'SKU',
      status: 'Status',
      price: 'Price',
      cost: 'Cost',
      margin: 'Margin %',
      stock: 'Stock',
      category: 'Category',
      vendor: 'Vendor',
      source: 'Source',
      stockValue: 'Stock Value'
    };
    return headers[colKey] || colKey;
  };

  return (
    <table className="w-full">
      <thead className="sticky top-0 glass-card z-10">
        <tr className="border-b border-white/10">
              {visibleColumns.map(colKey => (
                <th key={colKey} className="text-left p-3 text-white/70 text-sm font-medium">
                  {getColumnHeader(colKey)}
                </th>
              ))}
            </tr>
      </thead>
      <tbody>
            {products.map(product => (
              <React.Fragment key={product.id}>
                <tr className="border-b border-white/5 hover:bg-white/5 transition-colors">
                  {visibleColumns.map(colKey => (
                    <td key={colKey} className="p-3 text-white/80 text-sm">
                      {colKey === 'name' && product.hasVariants ? (
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => onToggleExpand(product.id)}
                            className="p-1 hover:bg-white/10 rounded transition-colors"
                          >
                            {expandedRows[product.id] ? 
                              <ChevronDown size={16} className="text-blue-400" /> : 
                              <ChevronRight size={16} className="text-blue-400" />
                            }
                          </button>
                          {renderColumnValue(product, colKey)}
                        </div>
                      ) : (
                        renderColumnValue(product, colKey)
                      )}
                    </td>
                  ))}
                </tr>
                
                {/* Variants expansion */}
                {!!product.hasVariants && expandedRows[product.id] && (
                  <tr className="bg-black/20">
                    <td colSpan={visibleColumns.length} className="p-0">
                      <div className="p-4">
                        <div className="text-xs font-medium text-white/50 mb-2">
                          VARIANTS ({product.variants?.length || 0})
                        </div>
                        <div className="overflow-x-auto">
                          <table className="w-full text-sm">
                            <thead>
                              <tr className="border-b border-white/10">
                                <th className="text-left py-2 px-3 text-white/50 text-xs">ID</th>
                                <th className="text-left py-2 px-3 text-white/50 text-xs">Title</th>
                                <th className="text-left py-2 px-3 text-white/50 text-xs">SKU</th>
                                <th className="text-right py-2 px-3 text-white/50 text-xs">Price</th>
                                <th className="text-right py-2 px-3 text-white/50 text-xs">Cost</th>
                                <th className="text-right py-2 px-3 text-white/50 text-xs">Margin</th>
                                <th className="text-right py-2 px-3 text-white/50 text-xs">Stock</th>
                                <th className="text-right py-2 px-3 text-white/50 text-xs">Value</th>
                                <th className="text-left py-2 px-3 text-white/50 text-xs">Barcode</th>
                              </tr>
                            </thead>
                            <tbody>
                              {product.variants?.map((variant, idx) => {
                                const margin = variant.cost && variant.price ? 
                                  ((variant.price - variant.cost) / variant.price * 100).toFixed(1) : null;
                                const stockValue = (variant.stock || 0) * (variant.cost || 0);
                                
                                return (
                                  <tr key={variant.id} className={idx > 0 ? 'border-t border-white/5' : ''}>
                                    <td className="py-2 px-3 text-white/50 font-mono text-xs">
                                      {variant.shopifyId || variant.id}
                                    </td>
                                    <td className="py-2 px-3">
                                      {variant.title || variant.name}
                                      {variant.option1 && (
                                        <span className="ml-2 text-white/40 text-xs">
                                          {variant.option1}
                                          {variant.option2 && ` / ${variant.option2}`}
                                          {variant.option3 && ` / ${variant.option3}`}
                                        </span>
                                      )}
                                    </td>
                                    <td className="py-2 px-3 text-white/60 font-mono text-xs">
                                      {variant.sku || '-'}
                                    </td>
                                    <td className="py-2 px-3 text-right font-medium">
                                      {variant.price && variant.price > 0 ? `${Math.round(variant.price)} Ft` : '-'}
                                    </td>
                                    <td className="py-2 px-3 text-right text-white/60">
                                      {variant.cost && variant.cost > 0 ? `${Math.round(variant.cost)} Ft` : '-'}
                                    </td>
                                    <td className="py-2 px-3 text-right">
                                      {margin !== null ? (
                                        <span className={`font-medium ${
                                          parseFloat(margin) > 50 ? 'text-green-400' :
                                          parseFloat(margin) > 30 ? 'text-yellow-400' :
                                          'text-red-400'
                                        }`}>
                                          {margin}%
                                        </span>
                                      ) : '-'}
                                    </td>
                                    <td className="py-2 px-3 text-right">
                                      <span className={`font-medium ${
                                        variant.stock === 0 ? 'text-red-400' :
                                        variant.stock < 10 ? 'text-yellow-400' :
                                        'text-green-400'
                                      }`}>
                                        {variant.stock || '-'}
                                      </span>
                                    </td>
                                    <td className="py-2 px-3 text-right text-blue-400 font-medium">
                                      {stockValue > 0 ? `${Math.round(stockValue).toLocaleString()} Ft` : '-'}
                                    </td>
                                    <td className="py-2 px-3 text-white/40 text-xs">
                                      {variant.barcode || '-'}
                                    </td>
                                  </tr>
                                );
                              })}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    </td>
                  </tr>
                )}
              </React.Fragment>
            ))}
      </tbody>
    </table>
  );
};

export default ProductsTable;