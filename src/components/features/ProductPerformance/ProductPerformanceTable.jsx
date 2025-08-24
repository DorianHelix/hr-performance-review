import React from 'react';
import { 
  ArrowUpRight, ArrowDownRight, TrendingUp, 
  TrendingDown, Minus, AlertCircle, CheckCircle, Package
} from 'lucide-react';
import { PERFORMANCE_COLUMNS, formatters } from './performanceConfig';

const ProductPerformanceTable = ({ 
  products, 
  visibleColumns, 
  loading,
  onProductClick,
  selectedProducts,
  onSelectProduct,
  onSelectAll
}) => {
  
  // Debug log first product to see actual data structure
  if (products && products.length > 0) {
    console.log('Product Performance - First product data:', products[0]);
  }
  
  // Get column configuration
  const getColumn = (key) => {
    return PERFORMANCE_COLUMNS.find(col => col.key === key);
  };

  // Render cell based on format type
  const renderCell = (product, columnKey) => {
    const column = getColumn(columnKey);
    const value = product[columnKey];
    
    if (!column) return <span>-</span>;
    
    // Special handling for product name with image
    if (columnKey === 'product_title' || columnKey === 'name' || columnKey === 'title') {
      const productName = product.product_title || product.title || product.name || 'Product Name';
      const productImage = product.image_url || product.featured_image || product.image || product.imageUrl || null;
      
      return (
        <div className="flex items-center gap-3">
          {/* Product Image */}
          <div className="flex-shrink-0">
            {productImage ? (
              <>
                <img 
                  src={productImage} 
                  alt={productName}
                  className="w-10 h-10 object-cover rounded-lg border border-white/10"
                  onError={(e) => {
                    e.target.style.display = 'none';
                    const placeholder = e.target.nextElementSibling;
                    if (placeholder) placeholder.style.display = 'flex';
                  }}
                />
                <div 
                  className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-500/20 to-pink-500/20 items-center justify-center"
                  style={{display: 'none'}}
                >
                  <Package size={16} className="text-purple-400" />
                </div>
              </>
            ) : (
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-500/20 to-pink-500/20 flex items-center justify-center">
                <Package size={16} className="text-purple-400" />
              </div>
            )}
          </div>
          
          {/* Product Info */}
          <div className="flex flex-col min-w-0">
            <button 
              className="font-medium text-white hover:text-blue-400 transition-colors text-left truncate"
              onClick={() => onProductClick(product)}
              title={productName}
            >
              {productName}
            </button>
            {(product.sku || product.vendor) && (
              <div className="flex items-center gap-2 text-xs text-white/50">
                {product.sku && product.sku !== 'null' && <span>SKU: {product.sku}</span>}
                {product.vendor && product.vendor !== 'null' && <span>{product.vendor}</span>}
              </div>
            )}
          </div>
        </div>
      );
    }
    
    // Format based on column type
    const format = column.format || 'text';
    const formatted = formatters[format] ? formatters[format](value) : value;
    
    // Special rendering for trends and changes
    if (format === 'percentage_change') {
      const isPositive = value > 0;
      const isNegative = value < 0;
      return (
        <span className={`flex items-center gap-1 ${
          isPositive ? 'text-green-400' : isNegative ? 'text-red-400' : 'text-white/60'
        }`}>
          {isPositive && <ArrowUpRight size={14} />}
          {isNegative && <ArrowDownRight size={14} />}
          {!isPositive && !isNegative && <Minus size={14} />}
          {formatted}
        </span>
      );
    }
    
    if (format === 'trend') {
      const trend = formatters.trend(value);
      return (
        <span className={`flex items-center gap-1 ${
          trend === 'up' ? 'text-green-400' : 
          trend === 'down' ? 'text-red-400' : 
          'text-white/60'
        }`}>
          {trend === 'up' && <TrendingUp size={14} />}
          {trend === 'down' && <TrendingDown size={14} />}
          {trend === 'stable' && <Minus size={14} />}
          <span className="capitalize">{trend}</span>
        </span>
      );
    }
    
    // Add color coding for certain metrics
    let className = '';
    if (columnKey === 'margin' || columnKey === 'profit') {
      const isPositive = value > 0;
      className = isPositive ? 'text-green-400 font-medium' : 
                   value < 0 ? 'text-red-400 font-medium' : 
                   'text-white/80';
    } else if (columnKey === 'returnRate' || columnKey === 'refundRate') {
      const isHigh = value > 15;
      const isMedium = value > 5;
      className = isHigh ? 'text-red-400 font-medium' : 
                   isMedium ? 'text-yellow-400 font-medium' : 
                   'text-green-400 font-medium';
    } else if (format === 'currency') {
      className = 'font-medium text-green-400';
    } else if (format === 'percentage') {
      className = 'text-blue-400';
    } else if (format === 'date') {
      className = 'text-white/60 text-xs';
    } else {
      className = 'text-white/80';
    }
    
    return <span className={className}>{formatted}</span>;
  };

  // Calculate totals for footer
  const calculateTotals = () => {
    if (!products || products.length === 0) return {};
    
    const totals = {};
    visibleColumns.forEach(columnKey => {
      const column = getColumn(columnKey);
      if (!column) return;
      
      // Sum up numeric columns
      if (['currency', 'number'].includes(column.format)) {
        totals[columnKey] = products.reduce((sum, product) => {
          return sum + (product[columnKey] || 0);
        }, 0);
      }
      
      // Average for percentage columns
      if (column.format === 'percentage') {
        const values = products.map(p => p[columnKey] || 0).filter(v => v > 0);
        if (values.length > 0) {
          totals[columnKey] = values.reduce((a, b) => a + b, 0) / values.length;
        }
      }
    });
    
    return totals;
  };

  const totals = calculateTotals();
  const allSelected = selectedProducts.length === products.length && products.length > 0;
  const someSelected = selectedProducts.length > 0 && selectedProducts.length < products.length;

  if (loading) {
    return (
      <div className="flex-1 glass-card-large flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-blue-400 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-white/60">Loading performance data...</p>
        </div>
      </div>
    );
  }

  if (!products || products.length === 0) {
    return (
      <div className="flex-1 glass-card-large flex flex-col items-center justify-center text-white/50">
        <AlertCircle size={48} className="mb-4" />
        <h3 className="text-lg font-medium text-white mb-2">No Performance Data Available</h3>
        <p className="text-sm">Sync with Shopify to load product performance metrics</p>
      </div>
    );
  }

  return (
    <div className="flex-1 glass-card-large overflow-hidden max-h-[calc(100vh-300px)]">
      <div className="overflow-x-auto overflow-y-auto h-full custom-scrollbar">
        <table className="w-full min-w-[1000px]">
          <thead className="sticky top-0 glass-card">
            <tr className="border-b border-white/10">
              <th className="text-left p-3">
                <input
                  type="checkbox"
                  checked={allSelected}
                  ref={el => {
                    if (el) el.indeterminate = someSelected;
                  }}
                  onChange={(e) => onSelectAll(e.target.checked)}
                  className="rounded"
                />
              </th>
              {visibleColumns.map(columnKey => {
                const column = getColumn(columnKey);
                return (
                  <th key={columnKey} className="text-left p-3 text-white/70 text-sm font-medium whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <span>{column?.label || columnKey}</span>
                      {column?.tooltip && (
                        <span title={column.tooltip}>
                          <AlertCircle size={14} className="text-white/40" />
                        </span>
                      )}
                    </div>
                  </th>
                );
              })}
            </tr>
          </thead>
          
          <tbody>
            {products.map((product, index) => {
              const isSelected = selectedProducts.includes(product.id);
              return (
                <tr 
                  key={product.id || index}
                  className={`border-b border-white/5 hover:bg-white/5 transition-colors ${
                    isSelected ? 'bg-blue-500/10' : ''
                  }`}
                >
                  <td className="p-3">
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={(e) => onSelectProduct(product.id, e.target.checked)}
                      className="rounded"
                    />
                  </td>
                  {visibleColumns.map(columnKey => (
                    <td key={columnKey} className="p-3 text-white/80 text-sm">
                      {renderCell(product, columnKey)}
                    </td>
                  ))}
                </tr>
              );
            })}
          </tbody>
          
          {/* Totals Footer */}
          {products.length > 1 && (
            <tfoot>
              <tr className="border-t border-white/20 bg-white/5">
                <td className="p-3"></td>
                {visibleColumns.map(columnKey => {
                  const column = getColumn(columnKey);
                  const total = totals[columnKey];
                  
                  if (columnKey === 'product_title' || columnKey === 'name') {
                    return (
                      <td key={columnKey} className="p-3 text-white font-medium">
                        Totals ({products.length} products)
                      </td>
                    );
                  }
                  
                  if (total !== undefined && column) {
                    const formatted = formatters[column.format] ? 
                      formatters[column.format](total) : total;
                    return (
                      <td key={columnKey} className="p-3 text-white font-medium">
                        {formatted}
                      </td>
                    );
                  }
                  
                  return <td key={columnKey} className="p-3"></td>;
                })}
              </tr>
            </tfoot>
          )}
        </table>
      </div>
      
      {/* Pagination or Load More could go here */}
      {products.length >= 50 && (
        <div className="p-4 border-t border-white/10">
          <p className="text-sm text-white/60 text-center">
            Showing {products.length} products
          </p>
        </div>
      )}
    </div>
  );
};

export default ProductPerformanceTable;