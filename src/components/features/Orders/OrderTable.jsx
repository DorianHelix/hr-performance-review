import React from 'react';
import { 
  ShoppingCart, ChevronRight, ChevronDown, Package, 
  CreditCard, DollarSign, Calendar, User, 
  CheckCircle, Clock, XCircle, AlertCircle,
  TrendingUp, TrendingDown, Minus
} from 'lucide-react';
import { ORDER_COLUMNS } from './orderConfig';

function OrderTable({
  orders,
  visibleColumns,
  expandedRows,
  onToggleRowExpansion,
  onOrderClick,
  loading
}) {
  const renderColumnValue = (order, columnKey) => {
    const value = order[columnKey];
    
    switch(columnKey) {
      case 'orderNumber':
        return (
          <div className="flex items-center gap-2">
            <button
              onClick={() => onToggleRowExpansion(order.id)}
              className="p-1 hover:bg-white/10 rounded transition-colors"
            >
              {expandedRows[order.id] ? 
                <ChevronDown size={16} className="text-purple-400" /> : 
                <ChevronRight size={16} className="text-purple-400" />
              }
            </button>
            <span 
              className="font-medium text-white hover:text-purple-400 cursor-pointer transition-colors"
              onClick={() => onOrderClick(order)}
            >
              #{value}
            </span>
          </div>
        );
      
      case 'customerName':
        return (
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500/20 to-pink-500/20 flex items-center justify-center">
              <User size={14} className="text-purple-300" />
            </div>
            <div>
              <div className="text-white font-medium">{value || 'Guest'}</div>
              {order.customerEmail && (
                <div className="text-xs text-white/50">{order.customerEmail}</div>
              )}
            </div>
          </div>
        );
      
      case 'createdAt':
      case 'processedAt':
      case 'fulfilledAt':
      case 'cancelledAt':
        if (!value) return '-';
        const date = new Date(value);
        return (
          <div className="text-white/80">
            <div className="text-sm">{date.toLocaleDateString()}</div>
            <div className="text-xs text-white/50">{date.toLocaleTimeString()}</div>
          </div>
        );
      
      case 'fulfillmentStatus':
        const fulfillmentIcons = {
          unfulfilled: <Clock size={14} />,
          partial: <AlertCircle size={14} />,
          fulfilled: <CheckCircle size={14} />,
          restocked: <Package size={14} />
        };
        const fulfillmentColors = {
          unfulfilled: 'bg-yellow-500/20 text-yellow-300 border-yellow-400/30',
          partial: 'bg-orange-500/20 text-orange-300 border-orange-400/30',
          fulfilled: 'bg-green-500/20 text-green-300 border-green-400/30',
          restocked: 'bg-blue-500/20 text-blue-300 border-blue-400/30'
        };
        return (
          <span className={`px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1 w-fit border ${fulfillmentColors[value] || 'bg-gray-500/20 text-gray-300'}`}>
            {fulfillmentIcons[value]}
            {value}
          </span>
        );
      
      case 'financialStatus':
        const financialIcons = {
          pending: <Clock size={14} />,
          authorized: <AlertCircle size={14} />,
          paid: <CheckCircle size={14} />,
          partially_paid: <AlertCircle size={14} />,
          partially_refunded: <AlertCircle size={14} />,
          refunded: <XCircle size={14} />,
          voided: <XCircle size={14} />
        };
        const financialColors = {
          pending: 'bg-yellow-500/20 text-yellow-300 border-yellow-400/30',
          authorized: 'bg-blue-500/20 text-blue-300 border-blue-400/30',
          paid: 'bg-green-500/20 text-green-300 border-green-400/30',
          partially_paid: 'bg-orange-500/20 text-orange-300 border-orange-400/30',
          partially_refunded: 'bg-orange-500/20 text-orange-300 border-orange-400/30',
          refunded: 'bg-red-500/20 text-red-300 border-red-400/30',
          voided: 'bg-gray-500/20 text-gray-300 border-gray-400/30'
        };
        return (
          <span className={`px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1 w-fit border ${financialColors[value] || 'bg-gray-500/20 text-gray-300'}`}>
            {financialIcons[value]}
            {value}
          </span>
        );
      
      case 'totalPrice':
      case 'subtotalPrice':
      case 'totalTax':
      case 'totalShipping':
      case 'totalDiscounts':
      case 'totalRefunded':
        return value ? (
          <span className="text-white font-medium">
            {Math.round(value).toLocaleString()} Ft
          </span>
        ) : '-';
      
      case 'profit':
        if (!value && value !== 0) return '-';
        const profitValue = parseFloat(value);
        return (
          <span className={`font-medium flex items-center gap-1 ${
            profitValue > 0 ? 'text-green-400' : 
            profitValue < 0 ? 'text-red-400' : 
            'text-white/60'
          }`}>
            {profitValue > 0 ? <TrendingUp size={14} /> : 
             profitValue < 0 ? <TrendingDown size={14} /> : 
             <Minus size={14} />}
            {Math.round(Math.abs(profitValue)).toLocaleString()} Ft
          </span>
        );
      
      case 'margin':
        if (!value && value !== 0) return '-';
        const marginValue = parseFloat(value);
        return (
          <span className={`font-medium ${
            marginValue > 50 ? 'text-green-400' : 
            marginValue > 30 ? 'text-yellow-400' : 
            marginValue > 0 ? 'text-orange-400' :
            'text-red-400'
          }`}>
            {marginValue.toFixed(1)}%
          </span>
        );
      
      case 'itemCount':
        return (
          <span className="px-2 py-1 bg-purple-500/20 text-purple-300 rounded text-sm font-medium">
            {value} {value === 1 ? 'item' : 'items'}
          </span>
        );
      
      case 'productNames':
        if (!order.lineItems || order.lineItems.length === 0) return '-';
        const names = order.lineItems.map(item => item.name);
        return (
          <div className="text-sm text-white/80">
            {names.slice(0, 2).join(', ')}
            {names.length > 2 && (
              <span className="text-white/50"> +{names.length - 2} more</span>
            )}
          </div>
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
      
      case 'shippingAddress':
      case 'billingAddress':
        if (!value) return '-';
        return (
          <div className="text-xs text-white/70">
            <div>{value.city}, {value.province}</div>
            <div className="text-white/50">{value.country}</div>
          </div>
        );
      
      case 'source':
      case 'channel':
        return value ? (
          <span className="px-2 py-1 bg-blue-500/20 text-blue-300 rounded text-xs">
            {value}
          </span>
        ) : '-';
      
      default:
        return value || '-';
    }
  };

  if (loading) {
    return (
      <div className="flex-1 glass-card-large overflow-hidden">
        <div className="flex items-center justify-center h-full">
          <div className="text-center">
            <ShoppingCart size={48} className="text-purple-400 mb-4 mx-auto animate-pulse" />
            <p className="text-white/60">Loading orders...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!orders || orders.length === 0) {
    return (
      <div className="flex-1 glass-card-large overflow-hidden">
        <div className="flex flex-col items-center justify-center h-full text-white/50">
          <ShoppingCart size={48} className="mb-4" />
          <p>No orders found</p>
          <p className="text-sm mt-2">Sync with Shopify to import orders</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 glass-card-large overflow-hidden">
      <div className="overflow-x-auto overflow-y-auto h-full custom-scrollbar">
        <table className="w-full min-w-[800px]">
          <thead className="sticky top-0 glass-card z-10 backdrop-blur-md">
            <tr className="border-b border-white/10">
              {visibleColumns.map(colKey => {
                const column = ORDER_COLUMNS.find(c => c.key === colKey);
                if (!column) return null;
                return (
                  <th key={colKey} className="text-left p-2 sm:p-3 text-white/70 text-xs sm:text-sm font-medium whitespace-nowrap">
                    {column.label}
                    {column.calculated && (
                      <span className="ml-1 text-yellow-400 text-xs">★</span>
                    )}
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody>
            {orders.map(order => (
              <React.Fragment key={order.id}>
                <tr className="border-b border-white/5 hover:bg-white/5 transition-colors cursor-pointer">
                  {visibleColumns.map(colKey => (
                    <td key={colKey} className="p-2 sm:p-3 text-white/80 text-xs sm:text-sm">
                      {renderColumnValue(order, colKey)}
                    </td>
                  ))}
                </tr>
                
                {/* Expanded row with line items */}
                {expandedRows[order.id] && order.lineItems && (
                  <tr className="bg-black/20">
                    <td colSpan={visibleColumns.length} className="p-0">
                      <div className="p-4 bg-gradient-to-r from-purple-500/5 to-pink-500/5">
                        <h4 className="text-sm font-semibold text-white mb-3">Order Items</h4>
                        <table className="w-full min-w-[800px]">
                          <thead>
                            <tr className="text-xs text-white/50 border-b border-white/10">
                              <th className="text-left pb-2 px-3">Product</th>
                              <th className="text-left pb-2 px-3">SKU</th>
                              <th className="text-right pb-2 px-3">Quantity</th>
                              <th className="text-right pb-2 px-3">Price</th>
                              <th className="text-right pb-2 px-3">Total</th>
                              <th className="text-left pb-2 px-3">Fulfillment</th>
                            </tr>
                          </thead>
                          <tbody>
                            {order.lineItems.map((item, idx) => (
                              <tr key={item.id || idx} className={`text-sm ${idx > 0 ? 'border-t border-white/5' : ''}`}>
                                <td className="py-2 px-3">
                                  <div className="flex items-center gap-2">
                                    {item.image && (
                                      <img 
                                        src={item.image} 
                                        alt={item.name}
                                        className="w-8 h-8 rounded object-cover border border-white/20"
                                      />
                                    )}
                                    <div>
                                      <div className="text-white font-medium">{item.name}</div>
                                      {item.variantTitle && (
                                        <div className="text-xs text-white/50">{item.variantTitle}</div>
                                      )}
                                    </div>
                                  </div>
                                </td>
                                <td className="py-2 px-3 text-white/60">{item.sku || '-'}</td>
                                <td className="py-2 px-3 text-right text-white">{item.quantity}</td>
                                <td className="py-2 px-3 text-right text-white/80">
                                  {Math.round(item.price)} Ft
                                </td>
                                <td className="py-2 px-3 text-right text-green-400 font-medium">
                                  {Math.round(item.price * item.quantity)} Ft
                                </td>
                                <td className="py-2 px-3">
                                  <span className={`px-2 py-0.5 rounded text-xs ${
                                    item.fulfillmentStatus === 'fulfilled' ? 
                                      'bg-green-500/20 text-green-300' : 
                                      'bg-yellow-500/20 text-yellow-300'
                                  }`}>
                                    {item.fulfillmentStatus || 'unfulfilled'}
                                  </span>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                          <tfoot className="border-t border-white/10">
                            <tr className="text-sm font-medium">
                              <td colSpan="4" className="py-2 px-3 text-right text-white/70">
                                Order Total:
                              </td>
                              <td className="py-2 px-3 text-right text-purple-400 text-lg">
                                {Math.round(order.totalPrice).toLocaleString()} Ft
                              </td>
                              <td></td>
                            </tr>
                          </tfoot>
                        </table>
                      </div>
                    </td>
                  </tr>
                )}
              </React.Fragment>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default OrderTable;