import React, { useState } from 'react';
import { 
  Settings, Eye, EyeOff, ChevronDown, ChevronRight,
  TrendingUp, DollarSign, Package, AlertTriangle,
  BarChart3, PieChart, Activity, Target, Info,
  Download, FileText, Calendar, Users
} from 'lucide-react';
import { PERFORMANCE_COLUMNS, CHART_TYPES } from './performanceConfig';

const ProductPerformanceSidebar = ({
  visibleColumns,
  setVisibleColumns,
  selectedView,
  viewDescription,
  performanceInsights,
  onGenerateReport,
  onViewCharts
}) => {
  const [expandedSections, setExpandedSections] = useState({
    columns: true,
    insights: true,
    analysis: false,
    actions: false
  });

  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  // Group columns by category
  const columnsByCategory = PERFORMANCE_COLUMNS.reduce((acc, column) => {
    if (!acc[column.category]) {
      acc[column.category] = [];
    }
    acc[column.category].push(column);
    return acc;
  }, {});

  const handleColumnToggle = (columnKey) => {
    if (visibleColumns.includes(columnKey)) {
      setVisibleColumns(visibleColumns.filter(key => key !== columnKey));
    } else {
      setVisibleColumns([...visibleColumns, columnKey]);
    }
  };

  const selectPresetColumns = (preset) => {
    switch (preset) {
      case 'minimal':
        setVisibleColumns(['name', 'totalSales', 'unitsSold', 'profit', 'margin']);
        break;
      case 'detailed':
        setVisibleColumns([
          'name', 'totalSales', 'unitsSold', 'ordersCount', 'averageOrderValue',
          'grossSales', 'netSales', 'profit', 'margin', 'conversionRate', 'salesTrend'
        ]);
        break;
      case 'all':
        setVisibleColumns(PERFORMANCE_COLUMNS.map(col => col.key));
        break;
      default:
        break;
    }
  };

  return (
    <div className="w-full space-y-3 md:space-y-4">
      {/* View Info */}
      <div className="glass-card-large p-4">
        <h3 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
          <Info size={16} />
          Current View
        </h3>
        <p className="text-sm text-white/70">{viewDescription}</p>
      </div>

      {/* Column Manager */}
      <div className="glass-card-large p-4">
        <div 
          className="flex items-center justify-between cursor-pointer mb-3"
          onClick={() => toggleSection('columns')}
        >
          <h3 className="text-sm font-semibold text-white flex items-center gap-2">
            <Settings size={16} />
            Visible Columns ({visibleColumns.length})
          </h3>
          {expandedSections.columns ? 
            <ChevronDown size={16} className="text-white/60" /> : 
            <ChevronRight size={16} className="text-white/60" />
          }
        </div>
        
        {expandedSections.columns && (
          <div className="space-y-3">
            {/* Quick Presets */}
            <div className="grid grid-cols-3 gap-2">
              <button 
                onClick={() => selectPresetColumns('minimal')}
                className="glass-button px-2 py-1.5 text-xs flex flex-col items-center gap-1 hover:scale-105 transition-all hover:bg-purple-500/20"
              >
                <Eye size={14} className="text-purple-400" />
                <span>Basic</span>
              </button>
              <button 
                onClick={() => selectPresetColumns('detailed')}
                className="glass-button px-2 py-1.5 text-xs flex flex-col items-center gap-1 hover:scale-105 transition-all hover:bg-blue-500/20"
              >
                <Settings size={14} className="text-blue-400" />
                <span>Detailed</span>
              </button>
              <button 
                onClick={() => selectPresetColumns('all')}
                className="glass-button px-2 py-1.5 text-xs flex flex-col items-center gap-1 hover:scale-105 transition-all hover:bg-green-500/20"
              >
                <Activity size={14} className="text-green-400" />
                <span>All</span>
              </button>
            </div>

            {/* Column Selector with Better UI */}
            <div className="space-y-2 max-h-[400px] overflow-y-auto custom-scrollbar pr-2">
              {Object.entries(columnsByCategory).map(([category, columns]) => {
                const categoryIcons = {
                  'Basic': Package,
                  'Sales': DollarSign,
                  'Performance': TrendingUp,
                  'Customer': Users,
                  'Time': Calendar
                };
                const CategoryIcon = categoryIcons[category] || Settings;
                
                return (
                  <div key={category} className="glass-card p-3 hover:bg-white/5 transition-colors rounded-xl">
                    <div className="flex items-center gap-2 mb-2">
                      <CategoryIcon size={14} className="text-purple-400" />
                      <h4 className="text-xs font-semibold text-white/90">{category}</h4>
                      <span className="text-xs text-white/40 ml-auto">
                        {columns.filter(c => visibleColumns.includes(c.key)).length}/{columns.length}
                      </span>
                    </div>
                    <div className="grid grid-cols-1 gap-1">
                      {columns.map(column => {
                        const isChecked = visibleColumns.includes(column.key);
                        return (
                          <label 
                            key={column.key} 
                            className={`flex items-center gap-2 cursor-pointer p-2 rounded-lg transition-all ${
                              isChecked ? 'bg-purple-500/10 border border-purple-500/30' : 'hover:bg-white/5'
                            } ${column.frozen ? 'opacity-50 cursor-not-allowed' : ''}`}
                          >
                            <input
                              type="checkbox"
                              checked={isChecked}
                              onChange={() => handleColumnToggle(column.key)}
                              disabled={column.frozen}
                              className="w-3 h-3 rounded border-white/30 bg-white/10 checked:bg-purple-500 checked:border-purple-500 transition-colors"
                            />
                            <div className="flex-1 flex items-center justify-between">
                              <span className={`text-xs ${
                                column.frozen ? 'text-white/40' : isChecked ? 'text-white' : 'text-white/70'
                              }`}>
                                {column.label}
                              </span>
                              <div className="flex items-center gap-1">
                                {column.calculated && 
                                  <span className="px-1.5 py-0.5 bg-yellow-500/20 text-yellow-400 rounded text-[10px] font-medium">CALC</span>
                                }
                                {column.format === 'currency' && 
                                  <DollarSign size={10} className="text-green-400" />
                                }
                                {column.format === 'percentage' && 
                                  <span className="text-blue-400 text-[10px]">%</span>
                                }
                              </div>
                            </div>
                          </label>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Performance Insights */}
      <div className="glass-card-large p-4">
        <div 
          className="flex items-center justify-between cursor-pointer mb-3"
          onClick={() => toggleSection('insights')}
        >
          <h3 className="text-sm font-semibold text-white flex items-center gap-2">
            <TrendingUp size={16} />
            Performance Insights
          </h3>
          {expandedSections.insights ? 
            <ChevronDown size={16} className="text-white/60" /> : 
            <ChevronRight size={16} className="text-white/60" />
          }
        </div>
        
        {expandedSections.insights && (
          <div className="space-y-3">
            <div className="space-y-2">
              <div className="flex items-center gap-3 p-2 hover:bg-white/5 rounded-lg">
                <div className="p-2 bg-green-500/20 rounded-lg">
                  <TrendingUp size={16} className="text-green-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-xs text-white/60">Top Performer</div>
                  <div className="text-sm font-medium text-white truncate">
                    {performanceInsights?.topPerformer || 'N/A'}
                  </div>
                  <div className="text-xs text-green-400">
                    {performanceInsights?.topPerformerSales || '$0'}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3 p-2 hover:bg-white/5 rounded-lg">
                <div className="p-2 bg-yellow-500/20 rounded-lg">
                  <AlertTriangle size={16} className="text-yellow-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-xs text-white/60">Needs Attention</div>
                  <div className="text-sm font-medium text-white truncate">
                    {performanceInsights?.underperformer || 'N/A'}
                  </div>
                  <div className="text-xs text-yellow-400">
                    {performanceInsights?.underperformerIssue || 'Low sales'}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3 p-2 hover:bg-white/5 rounded-lg">
                <div className="p-2 bg-blue-500/20 rounded-lg">
                  <DollarSign size={16} className="text-blue-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-xs text-white/60">Highest Margin</div>
                  <div className="text-sm font-medium text-white truncate">
                    {performanceInsights?.highestMargin || 'N/A'}
                  </div>
                  <div className="text-xs text-blue-400">
                    {performanceInsights?.highestMarginValue || '0%'}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3 p-2 hover:bg-white/5 rounded-lg">
                <div className="p-2 bg-red-500/20 rounded-lg">
                  <Package size={16} className="text-red-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-xs text-white/60">Most Returns</div>
                  <div className="text-sm font-medium text-white truncate">
                    {performanceInsights?.mostReturns || 'N/A'}
                  </div>
                  <div className="text-xs text-red-400">
                    {performanceInsights?.returnRate || '0%'} return rate
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Analysis Tools */}
      <div className="glass-card-large p-4">
        <div 
          className="flex items-center justify-between cursor-pointer mb-3"
          onClick={() => toggleSection('analysis')}
        >
          <h3 className="text-sm font-semibold text-white flex items-center gap-2">
            <BarChart3 size={16} />
            Analysis Tools
          </h3>
          {expandedSections.analysis ? 
            <ChevronDown size={16} className="text-white/60" /> : 
            <ChevronRight size={16} className="text-white/60" />
          }
        </div>
        
        {expandedSections.analysis && (
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-2">
              <button 
                className="glass-button p-3 text-center hover:scale-105 transition-transform" 
                onClick={onViewCharts}
              >
                <PieChart size={20} className="mx-auto mb-1 text-blue-400" />
                <div className="text-xs text-white/80">Charts</div>
              </button>
              <button className="glass-button p-3 text-center hover:scale-105 transition-transform">
                <Activity size={20} className="mx-auto mb-1 text-purple-400" />
                <div className="text-xs text-white/80">Trends</div>
              </button>
              <button className="glass-button p-3 text-center hover:scale-105 transition-transform">
                <Target size={20} className="mx-auto mb-1 text-green-400" />
                <div className="text-xs text-white/80">Goals</div>
              </button>
              <button className="glass-button p-3 text-center hover:scale-105 transition-transform">
                <Users size={20} className="mx-auto mb-1 text-orange-400" />
                <div className="text-xs text-white/80">Segments</div>
              </button>
            </div>

            {/* Chart Type Selector */}
            <div className="space-y-2">
              <label className="text-xs font-medium text-white/70">Visualization</label>
              <select className="glass-input px-3 py-2 text-sm w-full">
                {CHART_TYPES?.map(type => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                )) || <option>Line Chart</option>}
              </select>
            </div>
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="glass-card-large p-4">
        <div 
          className="flex items-center justify-between cursor-pointer mb-3"
          onClick={() => toggleSection('actions')}
        >
          <h3 className="text-sm font-semibold text-white flex items-center gap-2">
            <Activity size={16} />
            Quick Actions
          </h3>
          {expandedSections.actions ? 
            <ChevronDown size={16} className="text-white/60" /> : 
            <ChevronRight size={16} className="text-white/60" />
          }
        </div>
        
        {expandedSections.actions && (
          <div className="space-y-2">
            <button 
              className="w-full glass-button px-4 py-2 flex items-center gap-2 hover:scale-105 transition-transform" 
              onClick={onGenerateReport}
            >
              <FileText size={16} />
              Generate Report
            </button>
            <button className="w-full glass-button px-4 py-2 flex items-center gap-2 hover:scale-105 transition-transform">
              <Download size={16} />
              Export Analysis
            </button>
            <button className="w-full glass-button px-4 py-2 flex items-center gap-2 hover:scale-105 transition-transform">
              <Calendar size={16} />
              Schedule Report
            </button>
            <button className="w-full glass-button px-4 py-2 flex items-center gap-2 hover:scale-105 transition-transform">
              <Users size={16} />
              Share Dashboard
            </button>
          </div>
        )}
      </div>

      {/* Period Summary */}
      <div className="glass-card-large p-4">
        <h3 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
          <BarChart3 size={16} />
          Period Summary
        </h3>
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-white/60 text-sm">Total Revenue</span>
            <span className="font-semibold text-white">{performanceInsights?.totalRevenue || '$0'}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-white/60 text-sm">Avg Margin</span>
            <span className="font-semibold text-white">{performanceInsights?.avgMargin || '0%'}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-white/60 text-sm">Products Analyzed</span>
            <span className="font-semibold text-white">{performanceInsights?.productCount || 0}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductPerformanceSidebar;