import React from 'react';
import { 
  Search, X, Filter, TrendingUp, DollarSign, 
  AlertTriangle, Package, Users, Truck, Target,
  SlidersHorizontal, ChevronDown, Settings
} from 'lucide-react';
import { PERFORMANCE_VIEWS, SORT_OPTIONS } from './performanceConfig';

const ProductPerformanceFilters = ({
  searchTerm,
  setSearchTerm,
  selectedView,
  setSelectedView,
  sortBy,
  setSortBy,
  filters,
  setFilters,
  onColumnSettings,
  showAdvancedFilters,
  setShowAdvancedFilters,
  filteredProducts
}) => {
  
  // Icon mapping for views
  const iconMap = {
    TrendingUp: TrendingUp,
    DollarSign: DollarSign,
    Target: Target,
    AlertTriangle: AlertTriangle,
    Package: Package,
    Users: Users,
    Truck: Truck
  };

  return (
    <div className="glass-card-large p-4 mb-4">
      {/* Main Filters Bar */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <span className="px-3 py-1 bg-blue-500/20 text-blue-300 rounded-full text-sm">
            {filteredProducts?.length || 0} products
          </span>
        </div>
      </div>
      
      {/* Search and Filter Controls */}
      <div className="flex gap-3">
        {/* Search Box */}
        <div className="flex-1 relative">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/50" />
          <input
            type="text"
            placeholder="Search products by name or SKU..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full glass-input pl-10 pr-4 py-2"
          />
          {searchTerm && (
            <button 
              onClick={() => setSearchTerm('')} 
              className="absolute right-3 top-1/2 -translate-y-1/2 text-white/50 hover:text-white"
            >
              <X size={16} />
            </button>
          )}
        </div>

        {/* View Selector */}
        <select
          value={selectedView}
          onChange={(e) => setSelectedView(e.target.value)}
          className="glass-input px-4 py-2 min-w-[180px]"
        >
          {PERFORMANCE_VIEWS.map(view => (
            <option key={view.id} value={view.id}>
              {view.name}
            </option>
          ))}
        </select>

        {/* Sort Dropdown */}
        <select 
          value={sortBy} 
          onChange={(e) => setSortBy(e.target.value)}
          className="glass-input px-4 py-2 min-w-[150px]"
        >
          <option value="">Sort by...</option>
          {SORT_OPTIONS.map(option => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>

        {/* Advanced Filters Toggle */}
        <button 
          onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
          className={`glass-button px-3 py-2 flex items-center gap-2 hover:scale-105 transition-transform ${
            showAdvancedFilters ? 'bg-blue-500/20 border-blue-400/30' : ''
          }`}
        >
          <SlidersHorizontal size={16} />
          Filters
          {Object.keys(filters).length > 0 && (
            <span className="bg-blue-400/20 text-blue-300 px-1.5 py-0.5 rounded-full text-xs ml-1">
              {Object.keys(filters).length}
            </span>
          )}
        </button>

        {/* Column Settings */}
        <button 
          onClick={onColumnSettings} 
          className="glass-button px-3 py-2 flex items-center gap-2 hover:scale-105 transition-transform"
        >
          <Settings size={16} />
          Columns
        </button>
      </div>

      {/* Advanced Filters Panel */}
      {showAdvancedFilters && (
        <div className="mt-4 glass-card p-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Sales Range Filter */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-white/70">Sales Range</label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  placeholder="Min"
                  value={filters.minSales || ''}
                  onChange={(e) => setFilters({
                    ...filters,
                    minSales: e.target.value ? parseFloat(e.target.value) : undefined
                  })}
                  className="glass-input px-3 py-2 text-sm flex-1"
                />
                <span className="text-white/50 text-sm">to</span>
                <input
                  type="number"
                  placeholder="Max"
                  value={filters.maxSales || ''}
                  onChange={(e) => setFilters({
                    ...filters,
                    maxSales: e.target.value ? parseFloat(e.target.value) : undefined
                  })}
                  className="glass-input px-3 py-2 text-sm flex-1"
                />
              </div>
            </div>

            {/* Margin Range Filter */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-white/70">Margin %</label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  placeholder="Min %"
                  value={filters.minMargin || ''}
                  onChange={(e) => setFilters({
                    ...filters,
                    minMargin: e.target.value ? parseFloat(e.target.value) : undefined
                  })}
                  className="glass-input px-3 py-2 text-sm flex-1"
                />
                <span className="text-white/50 text-sm">to</span>
                <input
                  type="number"
                  placeholder="Max %"
                  value={filters.maxMargin || ''}
                  onChange={(e) => setFilters({
                    ...filters,
                    maxMargin: e.target.value ? parseFloat(e.target.value) : undefined
                  })}
                  className="glass-input px-3 py-2 text-sm flex-1"
                />
              </div>
            </div>

            {/* Units Sold Filter */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-white/70">Units Sold</label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  placeholder="Min"
                  value={filters.minUnits || ''}
                  onChange={(e) => setFilters({
                    ...filters,
                    minUnits: e.target.value ? parseInt(e.target.value) : undefined
                  })}
                  className="glass-input px-3 py-2 text-sm flex-1"
                />
                <span className="text-white/50 text-sm">to</span>
                <input
                  type="number"
                  placeholder="Max"
                  value={filters.maxUnits || ''}
                  onChange={(e) => setFilters({
                    ...filters,
                    maxUnits: e.target.value ? parseInt(e.target.value) : undefined
                  })}
                  className="glass-input px-3 py-2 text-sm flex-1"
                />
              </div>
            </div>

            {/* Conversion Rate Filter */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-white/70">Conversion Rate</label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  placeholder="Min %"
                  value={filters.minConversion || ''}
                  onChange={(e) => setFilters({
                    ...filters,
                    minConversion: e.target.value ? parseFloat(e.target.value) : undefined
                  })}
                  className="glass-input px-3 py-2 text-sm flex-1"
                />
                <span className="text-white/50 text-sm">to</span>
                <input
                  type="number"
                  placeholder="Max %"
                  value={filters.maxConversion || ''}
                  onChange={(e) => setFilters({
                    ...filters,
                    maxConversion: e.target.value ? parseFloat(e.target.value) : undefined
                  })}
                  className="glass-input px-3 py-2 text-sm flex-1"
                />
              </div>
            </div>

            {/* Vendor Filter */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-white/70">Vendor</label>
              <select
                value={filters.vendor || ''}
                onChange={(e) => setFilters({
                  ...filters,
                  vendor: e.target.value || undefined
                })}
                className="glass-input px-3 py-2 text-sm w-full"
              >
                <option value="">All Vendors</option>
                <option value="vendor1">Vendor 1</option>
                <option value="vendor2">Vendor 2</option>
              </select>
            </div>

            {/* Category Filter */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-white/70">Category</label>
              <select
                value={filters.category || ''}
                onChange={(e) => setFilters({
                  ...filters,
                  category: e.target.value || undefined
                })}
                className="glass-input px-3 py-2 text-sm w-full"
              >
                <option value="">All Categories</option>
                <option value="electronics">Electronics</option>
                <option value="clothing">Clothing</option>
              </select>
            </div>
          </div>

          {/* Filter Actions */}
          <div className="flex items-center justify-between mt-4 pt-4 border-t border-white/10">
            <span className="text-sm text-white/60">
              {Object.keys(filters).length > 0 && 
                `${Object.keys(filters).length} filter${Object.keys(filters).length > 1 ? 's' : ''} applied`
              }
            </span>
            <button 
              onClick={() => setFilters({})}
              className="glass-button px-3 py-2 text-sm text-red-400 hover:text-red-300 bg-red-500/10 border-red-400/20 hover:bg-red-500/20"
              disabled={Object.keys(filters).length === 0}
            >
              Clear All Filters
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductPerformanceFilters;