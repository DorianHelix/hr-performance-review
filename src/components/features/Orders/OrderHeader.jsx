import React from 'react';
import { ShoppingCart, Calendar, RefreshCw, Download, Filter, Settings, ChevronLeft, ChevronRight } from 'lucide-react';
import SectionHeader from '../../common/layout/SectionHeader';
import DateRangePicker from '../../common/forms/DateRangePicker';

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
  totalOrderCount,
  currentPage,
  totalPages,
  onPageChange
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

      <div className="px-3 sm:px-4 md:px-6">
        <div className="glass-card-large p-2 sm:p-3 md:p-4">
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2 sm:gap-3">
              <span className="px-2 sm:px-3 py-0.5 sm:py-1 bg-purple-500/20 text-purple-300 rounded-full text-xs sm:text-sm font-medium">
                {orderCount} / {totalOrderCount} orders
              </span>
              
              {/* Pagination controls */}
              {totalPages > 1 && (
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => onPageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="p-1.5 glass-button disabled:opacity-50 disabled:cursor-not-allowed hover:scale-105 transition-transform"
                  >
                    <ChevronLeft size={16} />
                  </button>
                  <span className="px-2 sm:px-3 py-0.5 sm:py-1 bg-gradient-to-r from-purple-500/10 to-pink-500/10 rounded-lg text-xs sm:text-sm">
                    Page {currentPage} of {totalPages}
                  </span>
                  <button
                    onClick={() => onPageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="p-1.5 glass-button disabled:opacity-50 disabled:cursor-not-allowed hover:scale-105 transition-transform"
                  >
                    <ChevronRight size={16} />
                  </button>
                </div>
              )}
              
              {/* Date Range Picker */}
              <DateRangePicker
                startDate={customDateRange?.start}
                endDate={customDateRange?.end}
                onRangeChange={(start, end) => {
                  // Parse the date strings and set proper times
                  const newStart = new Date(start + 'T00:00:00');
                  const newEnd = new Date(end + 'T23:59:59.999');
                  onCustomDateRangeChange({ start: newStart, end: newEnd });
                  onDateRangeChange('custom');
                }}
              />
            </div>

            <div className="flex flex-wrap items-center gap-2 sm:gap-3">
              <button
                onClick={onShowFilters}
                className="glass-button px-2 sm:px-3 py-1.5 sm:py-2 flex items-center gap-1 sm:gap-2 hover:scale-105 transition-transform text-xs sm:text-sm"
              >
                <Filter size={16} />
                Filters
              </button>

              <button
                onClick={onSync}
                disabled={syncing}
                className="glass-button px-2 sm:px-3 py-1.5 sm:py-2 flex items-center gap-1 sm:gap-2 hover:scale-105 transition-transform text-xs sm:text-sm"
              >
                <RefreshCw size={16} className={syncing ? 'animate-spin' : ''} />
                {syncing ? 'Syncing...' : 'Sync'}
              </button>

              <button
                onClick={onExport}
                className="glass-button px-2 sm:px-3 py-1.5 sm:py-2 flex items-center gap-1 sm:gap-2 hover:scale-105 transition-transform text-xs sm:text-sm"
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