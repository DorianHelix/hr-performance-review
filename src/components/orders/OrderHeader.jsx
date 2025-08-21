import React from 'react';
import { ShoppingCart, Calendar, RefreshCw, Download, Filter, Settings } from 'lucide-react';
import SectionHeader from '../SectionHeader';
import DateRangePicker from '../DateRangePicker';

function OrderHeader({ 
  showKPICards, 
  onToggleKPICards, 
  showSidebar, 
  onToggleSidebar,
  dateRange,
  onDateRangeChange,
  customDateRange,
  onCustomDateRangeChange,
  onSync,
  syncing,
  onExport,
  onShowFilters,
  orderCount,
  totalOrderCount
}) {
  return (
    <div className="space-y-4">
      <SectionHeader 
        icon={ShoppingCart}
        iconColorClass="from-purple-400/20 to-pink-600/20"
        iconBorderClass="border-purple-400/30"
        iconColor="text-purple-300"
        title="Order Management"
        subtitle="Track and analyze your Shopify orders and revenue"
        showKPICards={showKPICards}
        onToggleKPICards={onToggleKPICards}
        showSidebar={showSidebar}
        onToggleSidebar={onToggleSidebar}
      />

      <div className="px-6">
        <div className="glass-card-large p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="px-3 py-1 bg-purple-500/20 text-purple-300 rounded-full text-sm font-medium">
                {orderCount} / {totalOrderCount} orders
              </span>
              
              <DateRangePicker
                value={dateRange}
                onChange={onDateRangeChange}
                customRange={customDateRange}
                onCustomRangeChange={onCustomDateRangeChange}
                className="min-w-[200px]"
              />
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={onShowFilters}
                className="glass-button px-3 py-2 flex items-center gap-2 hover:scale-105 transition-transform"
              >
                <Filter size={16} />
                Filters
              </button>

              <button
                onClick={onSync}
                disabled={syncing}
                className="glass-button px-3 py-2 flex items-center gap-2 hover:scale-105 transition-transform"
              >
                <RefreshCw size={16} className={syncing ? 'animate-spin' : ''} />
                {syncing ? 'Syncing...' : 'Sync'}
              </button>

              <button
                onClick={onExport}
                className="glass-button px-3 py-2 flex items-center gap-2 hover:scale-105 transition-transform"
              >
                <Download size={16} />
                Export
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default OrderHeader;