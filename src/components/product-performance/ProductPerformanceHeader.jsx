import React from 'react';
import { 
  TrendingUp, RefreshCw, Download, Calendar, 
  BarChart3, Settings, Menu, Filter, DollarSign, Package, AlertTriangle
} from 'lucide-react';
import { DATE_RANGES, COMPARISON_PERIODS, EXPORT_FORMATS } from './performanceConfig';
import SectionHeader from '../SectionHeader';

const ProductPerformanceHeader = ({ 
  dateRange, 
  setDateRange,
  comparisonPeriod,
  setComparisonPeriod,
  onSync,
  onExport,
  syncing,
  onToggleSidebar,
  totalProducts,
  filteredCount
}) => {
  return (
    <>
      <SectionHeader 
        icon={TrendingUp}
        iconColorClass="from-purple-400/20 to-pink-600/20"
        iconBorderClass="border-purple-400/30"
        iconColor="text-purple-300"
        title="Product Performance"
        subtitle={`Revenue, sales metrics, and product analytics ${
          filteredCount !== totalProducts ? 
          `• Showing ${filteredCount} of ${totalProducts} products` : 
          ''
        }`}
        showKPICards={true}
        onToggleKPICards={() => {}}
        showSidebar={true}
        onToggleSidebar={onToggleSidebar}
        actions={
          <div className="flex items-center gap-3">
            {/* Date Range Selector */}
            <div className="flex items-center gap-2">
              <Calendar size={16} className="text-white/50" />
              <select 
                value={dateRange} 
                onChange={(e) => setDateRange(e.target.value)}
                className="glass-input px-3 py-2 text-sm"
              >
                {DATE_RANGES?.map(range => (
                  <option key={range.value} value={range.value}>
                    {range.label}
                  </option>
                )) || <option>Last 30 days</option>}
              </select>
              
              {/* Comparison Period */}
              <select
                value={comparisonPeriod}
                onChange={(e) => setComparisonPeriod(e.target.value)}
                className="glass-input px-3 py-2 text-sm"
              >
                {COMPARISON_PERIODS?.map(period => (
                  <option key={period.value} value={period.value}>
                    vs {period.label}
                  </option>
                )) || <option>vs Previous Period</option>}
              </select>
            </div>

            {/* Action Buttons */}
            <button 
              onClick={onSync} 
              className="glass-button px-3 py-2 flex items-center gap-2 hover:scale-105 transition-transform"
              disabled={syncing}
              title="Sync with Shopify"
            >
              <RefreshCw size={16} className={syncing ? 'animate-spin' : ''} />
              {syncing ? 'Syncing...' : 'Sync'}
            </button>

            <button 
              onClick={() => onExport('csv')} 
              className="glass-button px-3 py-2 flex items-center gap-2 hover:scale-105 transition-transform"
            >
              <Download size={16} />
              Export
            </button>

            <button className="glass-button px-3 py-2 flex items-center gap-2 hover:scale-105 transition-transform" title="View Charts">
              <BarChart3 size={16} />
              Charts
            </button>

            <button className="glass-button px-3 py-2 flex items-center gap-2 hover:scale-105 transition-transform" title="Settings">
              <Settings size={16} />
              Settings
            </button>
          </div>
        }
      />

      
      {/* KPI Cards */}
      <div className="px-6 mb-4">
        <div className="flex gap-4 overflow-x-auto pb-2">
          {/* Period Sales */}
          <div className="glass-card p-3 rounded-xl bg-gradient-to-br from-green-500/10 to-emerald-500/10 relative overflow-hidden flex-shrink-0" style={{minWidth: '160px'}}>
            <div className="relative z-10">
              <div className="flex items-center gap-2 mb-2">
                <DollarSign className="text-green-400" size={16} />
                <h3 className="font-semibold text-white text-sm">Period Sales</h3>
              </div>
              <div className="flex items-baseline gap-1">
                <span className="text-2xl font-bold text-white">$0</span>
                <span className="text-xs text-green-400">+0%</span>
              </div>
            </div>
          </div>

          {/* Units Sold */}
          <div className="glass-card p-3 rounded-xl bg-gradient-to-br from-blue-500/10 to-cyan-500/10 relative overflow-hidden flex-shrink-0" style={{minWidth: '160px'}}>
            <div className="relative z-10">
              <div className="flex items-center gap-2 mb-2">
                <Package className="text-blue-400" size={16} />
                <h3 className="font-semibold text-white text-sm">Units Sold</h3>
              </div>
              <div className="flex items-baseline gap-1">
                <span className="text-2xl font-bold text-white">0</span>
                <span className="text-xs text-white/60">0%</span>
              </div>
            </div>
          </div>

          {/* Avg Order Value */}
          <div className="glass-card p-3 rounded-xl bg-gradient-to-br from-purple-500/10 to-pink-500/10 relative overflow-hidden flex-shrink-0" style={{minWidth: '160px'}}>
            <div className="relative z-10">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="text-purple-400" size={16} />
                <h3 className="font-semibold text-white text-sm">Avg Order Value</h3>
              </div>
              <div className="flex items-baseline gap-1">
                <span className="text-2xl font-bold text-white">$0</span>
                <span className="text-xs text-green-400">+0%</span>
              </div>
            </div>
          </div>

          {/* Conversion Rate */}
          <div className="glass-card p-3 rounded-xl bg-gradient-to-br from-orange-500/10 to-red-500/10 relative overflow-hidden flex-shrink-0" style={{minWidth: '160px'}}>
            <div className="relative z-10">
              <div className="flex items-center gap-2 mb-2">
                <BarChart3 className="text-orange-400" size={16} />
                <h3 className="font-semibold text-white text-sm">Conversion Rate</h3>
              </div>
              <div className="flex items-baseline gap-1">
                <span className="text-2xl font-bold text-white">0%</span>
                <span className="text-xs text-red-400">-0%</span>
              </div>
            </div>
          </div>

          {/* Return Rate */}
          <div className="glass-card p-3 rounded-xl bg-gradient-to-br from-yellow-500/10 to-orange-500/10 relative overflow-hidden flex-shrink-0" style={{minWidth: '160px'}}>
            <div className="relative z-10">
              <div className="flex items-center gap-2 mb-2">
                <AlertTriangle className="text-yellow-400" size={16} />
                <h3 className="font-semibold text-white text-sm">Return Rate</h3>
              </div>
              <div className="flex items-baseline gap-1">
                <span className="text-2xl font-bold text-white">0%</span>
                <span className="text-xs text-white/60">0%</span>
              </div>
            </div>
          </div>

          {/* Profit Margin */}
          <div className="glass-card p-3 rounded-xl bg-gradient-to-br from-teal-500/10 to-green-500/10 relative overflow-hidden flex-shrink-0" style={{minWidth: '160px'}}>
            <div className="relative z-10">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="text-teal-400" size={16} />
                <h3 className="font-semibold text-white text-sm">Profit Margin</h3>
              </div>
              <div className="flex items-baseline gap-1">
                <span className="text-2xl font-bold text-white">0%</span>
                <span className="text-xs text-green-400">+0%</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default ProductPerformanceHeader;