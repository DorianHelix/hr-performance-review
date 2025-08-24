import React from 'react';
import { 
  X, ShoppingCart, User, Package, CreditCard, 
  MapPin, Phone, Mail, Calendar, Clock,
  CheckCircle, AlertCircle, Truck, FileText,
  DollarSign, Tag, Hash, Globe
} from 'lucide-react';
import { ORDER_COLUMNS } from './orderConfig';

function OrderDetailModal({ order, onClose }) {
  if (!order) return null;

  const getStatusColor = (status) => {
    const colors = {
      fulfilled: 'text-green-400',
      unfulfilled: 'text-yellow-400',
      partial: 'text-orange-400',
      paid: 'text-green-400',
      pending: 'text-yellow-400',
      refunded: 'text-red-400',
      cancelled: 'text-red-400'
    };
    return colors[status] || 'text-gray-400';
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="glass-card-large w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-white/20">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <ShoppingCart size={24} className="text-purple-400" />
              <div>
                <h2 className="text-xl font-bold text-white">Order #{order.orderNumber}</h2>
                <p className="text-sm text-white/60">
                  {new Date(order.createdAt).toLocaleString()}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-white/10 transition-colors"
            >
              <X size={20} className="text-white/70" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Order Status */}
              <div className="glass-card p-4">
                <h3 className="font-semibold text-white mb-3 flex items-center gap-2">
                  <Package size={18} className="text-purple-400" />
                  Order Status
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-white/60 mb-1">Fulfillment Status</p>
                    <span className={`font-medium ${getStatusColor(order.fulfillmentStatus)}`}>
                      {order.fulfillmentStatus}
                    </span>
                  </div>
                  <div>
                    <p className="text-xs text-white/60 mb-1">Payment Status</p>
                    <span className={`font-medium ${getStatusColor(order.financialStatus)}`}>
                      {order.financialStatus}
                    </span>
                  </div>
                </div>
              </div>

              {/* Line Items */}
              <div className="glass-card p-4">
                <h3 className="font-semibold text-white mb-3 flex items-center gap-2">
                  <Package size={18} className="text-purple-400" />
                  Order Items
                </h3>
                <div className="space-y-3">
                  {order.lineItems?.map((item, index) => (
                    <div key={item.id || index} className="flex items-center gap-4 p-3 glass-card">
                      {item.image && (
                        <img 
                          src={item.image} 
                          alt={item.name}
                          className="w-16 h-16 rounded object-cover border border-white/20"
                        />
                      )}
                      <div className="flex-1">
                        <h4 className="font-medium text-white">{item.name}</h4>
                        {item.variantTitle && (
                          <p className="text-sm text-white/60">{item.variantTitle}</p>
                        )}
                        <p className="text-sm text-white/50">SKU: {item.sku || 'N/A'}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-white font-medium">
                          {item.quantity} × {Math.round(item.price)} Ft
                        </p>
                        <p className="text-green-400 font-semibold">
                          {Math.round(item.price * item.quantity)} Ft
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Financial Summary */}
              <div className="glass-card p-4">
                <h3 className="font-semibold text-white mb-3 flex items-center gap-2">
                  <DollarSign size={18} className="text-green-400" />
                  Financial Summary
                </h3>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-white/60">Subtotal</span>
                    <span className="text-white">{Math.round(order.subtotalPrice || 0)} Ft</span>
                  </div>
                  {order.totalShipping > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-white/60">Shipping</span>
                      <span className="text-white">{Math.round(order.totalShipping)} Ft</span>
                    </div>
                  )}
                  {order.totalTax > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-white/60">Tax</span>
                      <span className="text-white">{Math.round(order.totalTax)} Ft</span>
                    </div>
                  )}
                  {order.totalDiscounts > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-white/60">Discounts</span>
                      <span className="text-red-400">-{Math.round(order.totalDiscounts)} Ft</span>
                    </div>
                  )}
                  <div className="pt-2 border-t border-white/10">
                    <div className="flex justify-between">
                      <span className="font-semibold text-white">Total</span>
                      <span className="text-xl font-bold text-purple-400">
                        {Math.round(order.totalPrice)} Ft
                      </span>
                    </div>
                  </div>
                  {order.profit && (
                    <div className="flex justify-between text-sm pt-2">
                      <span className="text-white/60">Profit</span>
                      <span className={`font-medium ${order.profit > 0 ? 'text-green-400' : 'text-red-400'}`}>
                        {Math.round(order.profit)} Ft ({order.margin?.toFixed(1)}%)
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Customer Info */}
              <div className="glass-card p-4">
                <h3 className="font-semibold text-white mb-3 flex items-center gap-2">
                  <User size={18} className="text-blue-400" />
                  Customer
                </h3>
                <div className="space-y-2">
                  <p className="text-white font-medium">{order.customerName || 'Guest'}</p>
                  {order.customerEmail && (
                    <div className="flex items-center gap-2 text-sm text-white/60">
                      <Mail size={14} />
                      {order.customerEmail}
                    </div>
                  )}
                  {order.customerPhone && (
                    <div className="flex items-center gap-2 text-sm text-white/60">
                      <Phone size={14} />
                      {order.customerPhone}
                    </div>
                  )}
                </div>
              </div>

              {/* Shipping Address */}
              {order.shippingAddress && (
                <div className="glass-card p-4">
                  <h3 className="font-semibold text-white mb-3 flex items-center gap-2">
                    <MapPin size={18} className="text-orange-400" />
                    Shipping Address
                  </h3>
                  <div className="text-sm text-white/80 space-y-1">
                    <p>{order.shippingAddress.name}</p>
                    <p>{order.shippingAddress.address1}</p>
                    {order.shippingAddress.address2 && (
                      <p>{order.shippingAddress.address2}</p>
                    )}
                    <p>
                      {order.shippingAddress.city}, {order.shippingAddress.province} {order.shippingAddress.zip}
                    </p>
                    <p>{order.shippingAddress.country}</p>
                  </div>
                </div>
              )}

              {/* Shipping Info */}
              {(order.shippingMethod || order.trackingNumber) && (
                <div className="glass-card p-4">
                  <h3 className="font-semibold text-white mb-3 flex items-center gap-2">
                    <Truck size={18} className="text-cyan-400" />
                    Shipping Info
                  </h3>
                  <div className="space-y-2 text-sm">
                    {order.shippingMethod && (
                      <div>
                        <p className="text-white/60">Method</p>
                        <p className="text-white">{order.shippingMethod}</p>
                      </div>
                    )}
                    {order.trackingNumber && (
                      <div>
                        <p className="text-white/60">Tracking</p>
                        <p className="text-white font-mono">{order.trackingNumber}</p>
                      </div>
                    )}
                    {order.carrier && (
                      <div>
                        <p className="text-white/60">Carrier</p>
                        <p className="text-white">{order.carrier}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Notes */}
              {(order.customerNote || order.note) && (
                <div className="glass-card p-4">
                  <h3 className="font-semibold text-white mb-3 flex items-center gap-2">
                    <FileText size={18} className="text-yellow-400" />
                    Notes
                  </h3>
                  {order.customerNote && (
                    <div className="mb-3">
                      <p className="text-xs text-white/60 mb-1">Customer Note</p>
                      <p className="text-sm text-white/80">{order.customerNote}</p>
                    </div>
                  )}
                  {order.note && (
                    <div>
                      <p className="text-xs text-white/60 mb-1">Internal Note</p>
                      <p className="text-sm text-white/80">{order.note}</p>
                    </div>
                  )}
                </div>
              )}

              {/* Meta Info */}
              <div className="glass-card p-4">
                <h3 className="font-semibold text-white mb-3 flex items-center gap-2">
                  <Hash size={18} className="text-purple-400" />
                  Meta Information
                </h3>
                <div className="space-y-2 text-sm">
                  {order.source && (
                    <div className="flex justify-between">
                      <span className="text-white/60">Source</span>
                      <span className="text-white">{order.source}</span>
                    </div>
                  )}
                  {order.channel && (
                    <div className="flex justify-between">
                      <span className="text-white/60">Channel</span>
                      <span className="text-white">{order.channel}</span>
                    </div>
                  )}
                  {order.tags && order.tags.length > 0 && (
                    <div>
                      <p className="text-white/60 mb-1">Tags</p>
                      <div className="flex flex-wrap gap-1">
                        {order.tags.map((tag, i) => (
                          <span key={i} className="px-2 py-0.5 bg-purple-500/20 text-purple-300 rounded text-xs">
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function OrderColumnSettingsModal({ 
  visibleColumns, 
  onToggleColumn, 
  onSaveView, 
  onClose 
}) {
  const [viewName, setViewName] = React.useState('');

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="glass-card-large w-full max-w-3xl max-h-[80vh] overflow-hidden flex flex-col">
        <div className="p-6 border-b border-white/20">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-white">Column Settings</h2>
            <button
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-white/10 transition-colors"
            >
              <X size={20} className="text-white/70" />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {Object.entries(
              ORDER_COLUMNS.reduce((acc, col) => {
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
                        onChange={() => onToggleColumn(col.key)}
                        className="rounded"
                      />
                      <span className="text-sm text-white/80">{col.label}</span>
                      {col.calculated && (
                        <span className="text-yellow-400 text-xs">★</span>
                      )}
                    </label>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="p-6 border-t border-white/20">
          <div className="flex items-center gap-3">
            <input
              type="text"
              value={viewName}
              onChange={(e) => setViewName(e.target.value)}
              placeholder="View name..."
              className="flex-1 glass-input px-3 py-2"
            />
            <button
              onClick={() => {
                if (viewName) {
                  onSaveView(viewName);
                  setViewName('');
                }
              }}
              className="glass-button px-4 py-2"
            >
              Save View
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export { OrderDetailModal, OrderColumnSettingsModal };