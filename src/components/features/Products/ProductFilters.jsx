import React from 'react';
import { Search, Filter, Grid, List } from 'lucide-react';

function ProductFilters({ 
  searchQuery, 
  onSearchChange, 
  categoryFilter, 
  onCategoryChange, 
  statusFilter, 
  onStatusChange, 
  viewMode, 
  onViewModeChange,
  categories 
}) {
  return (
    <div className="glass-card-large mb-6 p-4">
      <div className="flex items-center gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/40" size={20} />
          <input
            type="text"
            placeholder="Search products..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-10 pr-4 py-2 glass-input rounded-xl text-white placeholder-white/40"
          />
        </div>
        
        <select
          value={categoryFilter}
          onChange={(e) => onCategoryChange(e.target.value)}
          className="px-4 py-2 glass-input rounded-xl text-white bg-white/5"
        >
          <option value="">All Categories</option>
          {categories.map(cat => (
            <option key={cat} value={cat}>{cat}</option>
          ))}
        </select>
        
        <select
          value={statusFilter}
          onChange={(e) => onStatusChange(e.target.value)}
          className="px-4 py-2 glass-input rounded-xl text-white bg-white/5"
        >
          <option value="">All Status</option>
          <option value="active">Active</option>
          <option value="low_stock">Low Stock</option>
          <option value="out_of_stock">Out of Stock</option>
        </select>
        
        <div className="flex gap-2">
          <button
            onClick={() => onViewModeChange('grid')}
            className={`p-2 rounded-lg transition-all ${
              viewMode === 'grid' 
                ? 'glass-button-primary' 
                : 'glass-button'
            }`}
          >
            <Grid size={20} />
          </button>
          <button
            onClick={() => onViewModeChange('list')}
            className={`p-2 rounded-lg transition-all ${
              viewMode === 'list' 
                ? 'glass-button-primary' 
                : 'glass-button'
            }`}
          >
            <List size={20} />
          </button>
        </div>
      </div>
    </div>
  );
}

export default ProductFilters;