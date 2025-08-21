import React from 'react';
import { Search, X, Filter, DollarSign, Package, CreditCard, Truck } from 'lucide-react';
import { FULFILLMENT_STATUSES, FINANCIAL_STATUSES } from './orderConfig';

function OrderFilters({
  searchTerm,
  onSearchChange,
  fulfillmentFilter,
  onFulfillmentChange,
  financialFilter,
  onFinancialChange,
  minAmount,
  maxAmount,
  onMinAmountChange,
  onMaxAmountChange,
  customerFilter,
  onCustomerChange,
  onClearFilters,
  activeFiltersCount
}) {
  return (
    <div className="px-6 mb-4">
      <div className="glass-card-large p-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <Filter size={18} className="text-purple-400" />
            <h3 className="font-semibold text-white">Filters</h3>
            {activeFiltersCount > 0 && (
              <span className="px-2 py-1 bg-purple-500/20 text-purple-300 rounded-full text-xs font-medium">
                {activeFiltersCount} active
              </span>
            )}
          </div>
          
          {activeFiltersCount > 0 && (
            <button
              onClick={onClearFilters}
              className="text-sm text-white/60 hover:text-white transition-colors flex items-center gap-1"
            >
              <X size={14} />
              Clear all
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-3">
          {/* Search */}
          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/50" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Order #, customer..."
              className="w-full glass-input pl-9 pr-4 py-2 text-sm"
            />
            {searchTerm && (
              <button
                onClick={() => onSearchChange('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-white/50 hover:text-white"
              >
                <X size={14} />
              </button>
            )}
          </div>

          {/* Fulfillment Status */}
          <div className="relative">
            <Package size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/50 pointer-events-none" />
            <select
              value={fulfillmentFilter}
              onChange={(e) => onFulfillmentChange(e.target.value)}
              className="w-full glass-input pl-9 pr-4 py-2 text-sm appearance-none"
            >
              <option value="all">All Fulfillment</option>
              <option value="unfulfilled">Unfulfilled</option>
              <option value="partial">Partially Fulfilled</option>
              <option value="fulfilled">Fulfilled</option>
              <option value="restocked">Restocked</option>
            </select>
          </div>

          {/* Financial Status */}
          <div className="relative">
            <CreditCard size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/50 pointer-events-none" />
            <select
              value={financialFilter}
              onChange={(e) => onFinancialChange(e.target.value)}
              className="w-full glass-input pl-9 pr-4 py-2 text-sm appearance-none"
            >
              <option value="all">All Payments</option>
              <option value="pending">Pending</option>
              <option value="authorized">Authorized</option>
              <option value="paid">Paid</option>
              <option value="partially_paid">Partially Paid</option>
              <option value="partially_refunded">Partially Refunded</option>
              <option value="refunded">Refunded</option>
              <option value="voided">Voided</option>
            </select>
          </div>

          {/* Min Amount */}
          <div className="relative">
            <DollarSign size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/50" />
            <input
              type="number"
              value={minAmount}
              onChange={(e) => onMinAmountChange(e.target.value)}
              placeholder="Min amount"
              className="w-full glass-input pl-9 pr-4 py-2 text-sm"
            />
          </div>

          {/* Max Amount */}
          <div className="relative">
            <DollarSign size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/50" />
            <input
              type="number"
              value={maxAmount}
              onChange={(e) => onMaxAmountChange(e.target.value)}
              placeholder="Max amount"
              className="w-full glass-input pl-9 pr-4 py-2 text-sm"
            />
          </div>
        </div>

        {/* Customer Filter - Full Width */}
        <div className="mt-3">
          <div className="relative">
            <input
              type="text"
              value={customerFilter}
              onChange={(e) => onCustomerChange(e.target.value)}
              placeholder="Filter by customer name or email..."
              className="w-full glass-input pl-4 pr-4 py-2 text-sm"
            />
            {customerFilter && (
              <button
                onClick={() => onCustomerChange('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-white/50 hover:text-white"
              >
                <X size={14} />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default OrderFilters;