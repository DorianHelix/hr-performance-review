import React, { useState } from 'react';
import { 
  X, Download, FileText, Calendar, Clock, 
  TrendingUp, DollarSign, Package, Users, 
  BarChart3, PieChart, Settings, Send
} from 'lucide-react';

const ProductPerformanceModals = ({
  showReportModal,
  setShowReportModal,
  showChartModal,
  setShowChartModal,
  showProductDetails,
  setShowProductDetails,
  selectedProduct,
  onGenerateReport,
  products
}) => {
  const [reportSettings, setReportSettings] = useState({
    format: 'pdf',
    includeCharts: true,
    includeDetails: true,
    periodComparison: true,
    email: ''
  });

  const [chartSettings, setChartSettings] = useState({
    chartType: 'line',
    metric: 'totalSales',
    groupBy: 'day',
    showTrend: true
  });

  // Report Generation Modal
  if (showReportModal) {
    return (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={() => setShowReportModal(false)}>
        <div className="glass-card-large w-full max-w-2xl" onClick={(e) => e.stopPropagation()}>
          <div className="p-6 border-b border-white/20">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <FileText size={24} className="text-blue-400" />
                <h2 className="text-xl font-bold text-white">Generate Performance Report</h2>
              </div>
              <button 
                onClick={() => setShowReportModal(false)}
                className="p-2 rounded-lg hover:bg-white/10 transition-colors"
              >
                <X size={20} className="text-white/70" />
              </button>
            </div>
          </div>

          
          <div className="p-6 space-y-6">
            <div className="space-y-4">
              {/* Report Type */}
              <div className="space-y-3">
                <label className="block text-sm font-medium text-white/70">Report Type</label>
                <div className="grid grid-cols-2 gap-3">
                  <button className="glass-card p-4 flex items-center gap-3 text-left bg-blue-500/10 border border-blue-400/30">
                    <TrendingUp size={18} className="text-blue-400" />
                    <span className="text-white font-medium">Performance Summary</span>
                  </button>
                  <button className="glass-card p-4 flex items-center gap-3 text-left hover:bg-white/5">
                    <DollarSign size={18} className="text-green-400" />
                    <span className="text-white font-medium">Revenue Analysis</span>
                  </button>
                  <button className="glass-card p-4 flex items-center gap-3 text-left hover:bg-white/5">
                    <Package size={18} className="text-purple-400" />
                    <span className="text-white font-medium">Product Details</span>
                  </button>
                  <button className="glass-card p-4 flex items-center gap-3 text-left hover:bg-white/5">
                    <Users size={18} className="text-orange-400" />
                    <span className="text-white font-medium">Customer Insights</span>
                  </button>
                </div>
              </div>

              {/* Format Selection */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-white/70">Export Format</label>
                <select 
                  value={reportSettings.format}
                  onChange={(e) => setReportSettings({...reportSettings, format: e.target.value})}
                  className="glass-input px-4 py-2 w-full"
                >
                  <option value="pdf">PDF Report</option>
                  <option value="excel">Excel Spreadsheet</option>
                  <option value="csv">CSV Data</option>
                  <option value="powerpoint">PowerPoint Presentation</option>
                </select>
              </div>

              {/* Include Options */}
              <div className="space-y-3">
                <label className="block text-sm font-medium text-white/70">Include in Report</label>
                <div className="space-y-2">
                  <label className="flex items-center gap-2 cursor-pointer hover:bg-white/5 p-2 rounded">
                    <input 
                      type="checkbox" 
                      checked={reportSettings.includeCharts}
                      onChange={(e) => setReportSettings({...reportSettings, includeCharts: e.target.checked})}
                      className="rounded"
                    />
                    <span className="text-white/80">Charts & Visualizations</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer hover:bg-white/5 p-2 rounded">
                    <input 
                      type="checkbox" 
                      checked={reportSettings.includeDetails}
                      onChange={(e) => setReportSettings({...reportSettings, includeDetails: e.target.checked})}
                      className="rounded"
                    />
                    <span className="text-white/80">Detailed Product Tables</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer hover:bg-white/5 p-2 rounded">
                    <input 
                      type="checkbox" 
                      checked={reportSettings.periodComparison}
                      onChange={(e) => setReportSettings({...reportSettings, periodComparison: e.target.checked})}
                      className="rounded"
                    />
                    <span className="text-white/80">Period Comparison</span>
                  </label>
                </div>
              </div>

              {/* Schedule Options */}
              <div className="space-y-3">
                <label className="block text-sm font-medium text-white/70">Schedule Delivery</label>
                <div className="flex gap-2">
                  <button className="glass-button px-4 py-2 flex items-center gap-2 bg-blue-500/10 border-blue-400/30">
                    <Clock size={16} />
                    One-time
                  </button>
                  <button className="glass-button px-4 py-2 flex items-center gap-2">
                    <Calendar size={16} />
                    Daily
                  </button>
                  <button className="glass-button px-4 py-2 flex items-center gap-2">
                    <Calendar size={16} />
                    Weekly
                  </button>
                  <button className="glass-button px-4 py-2 flex items-center gap-2">
                    <Calendar size={16} />
                    Monthly
                  </button>
                </div>
              </div>

              {/* Email Delivery */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-white/70">Email To (optional)</label>
                <input 
                  type="email"
                  placeholder="email@example.com"
                  value={reportSettings.email}
                  onChange={(e) => setReportSettings({...reportSettings, email: e.target.value})}
                  className="glass-input px-4 py-2 w-full"
                />
              </div>
            </div>
          </div>

          
          <div className="p-6 border-t border-white/20 flex items-center justify-end gap-3">
            <button 
              onClick={() => setShowReportModal(false)}
              className="glass-button px-4 py-2 text-white/60 hover:text-white"
            >
              Cancel
            </button>
            <button 
              onClick={() => {
                onGenerateReport(reportSettings);
                setShowReportModal(false);
              }}
              className="glass-button-success px-4 py-2 flex items-center gap-2 hover:scale-105 transition-transform"
            >
              <Download size={16} />
              Generate Report
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Chart Visualization Modal
  if (showChartModal) {
    return (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={() => setShowChartModal(false)}>
        <div className="glass-card-large w-full max-w-4xl" onClick={(e) => e.stopPropagation()}>
          <div className="p-6 border-b border-white/20">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <BarChart3 size={24} className="text-purple-400" />
                <h2 className="text-xl font-bold text-white">Performance Visualization</h2>
              </div>
              <button 
                onClick={() => setShowChartModal(false)}
                className="p-2 rounded-lg hover:bg-white/10 transition-colors"
              >
                <X size={20} className="text-white/70" />
              </button>
            </div>
          </div>

          
          <div className="p-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-white/70">Chart Type</label>
                <select 
                  value={chartSettings.chartType}
                  onChange={(e) => setChartSettings({...chartSettings, chartType: e.target.value})}
                  className="glass-input px-4 py-2 w-full"
                >
                  <option value="line">Line Chart</option>
                  <option value="bar">Bar Chart</option>
                  <option value="area">Area Chart</option>
                  <option value="pie">Pie Chart</option>
                  <option value="scatter">Scatter Plot</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-white/70">Metric</label>
                <select 
                  value={chartSettings.metric}
                  onChange={(e) => setChartSettings({...chartSettings, metric: e.target.value})}
                  className="glass-input px-4 py-2 w-full"
                >
                  <option value="totalSales">Total Sales</option>
                  <option value="unitsSold">Units Sold</option>
                  <option value="profit">Profit</option>
                  <option value="margin">Margin %</option>
                  <option value="conversionRate">Conversion Rate</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-white/70">Group By</label>
                <select 
                  value={chartSettings.groupBy}
                  onChange={(e) => setChartSettings({...chartSettings, groupBy: e.target.value})}
                  className="glass-input px-4 py-2 w-full"
                >
                  <option value="day">Day</option>
                  <option value="week">Week</option>
                  <option value="month">Month</option>
                  <option value="category">Category</option>
                  <option value="vendor">Vendor</option>
                </select>
              </div>
            </div>

            <label className="flex items-center gap-2 cursor-pointer hover:bg-white/5 p-2 rounded">
              <input 
                type="checkbox" 
                checked={chartSettings.showTrend}
                onChange={(e) => setChartSettings({...chartSettings, showTrend: e.target.checked})}
                className="rounded"
              />
              <span className="text-white/80">Show Trend Line</span>
            </label>

            <div className="glass-card p-8">
              {/* Chart would be rendered here */}
              <div className="flex flex-col items-center justify-center text-white/50 min-h-[300px]">
                <PieChart size={100} className="mb-4" />
                <p>Chart visualization will appear here</p>
              </div>
            </div>
          </div>

          
          <div className="p-6 border-t border-white/20 flex items-center justify-end gap-3">
            <button 
              onClick={() => setShowChartModal(false)}
              className="glass-button px-4 py-2 text-white/60 hover:text-white"
            >
              Close
            </button>
            <button className="glass-button px-4 py-2 flex items-center gap-2 hover:scale-105 transition-transform">
              <Download size={16} />
              Export Chart
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Product Details Modal
  if (showProductDetails && selectedProduct) {
    return (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={() => setShowProductDetails(false)}>
        <div className="glass-card-large w-full max-w-3xl" onClick={(e) => e.stopPropagation()}>
          <div className="p-6 border-b border-white/20">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Package size={24} className="text-green-400" />
                <h2 className="text-xl font-bold text-white">{selectedProduct.name}</h2>
              </div>
              <button 
                onClick={() => setShowProductDetails(false)}
                className="p-2 rounded-lg hover:bg-white/10 transition-colors"
              >
                <X size={20} className="text-white/70" />
              </button>
            </div>
          </div>

          
          <div className="p-6 space-y-6">
            <div className="space-y-6">
              {/* Performance Summary */}
              <div className="glass-card p-4">
                <h3 className="text-lg font-semibold text-white mb-4">Performance Summary</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <span className="text-sm text-white/60">Total Sales</span>
                    <span className="text-lg font-semibold text-green-400">${selectedProduct.totalSales || 0}</span>
                  </div>
                  <div className="space-y-1">
                    <span className="text-sm text-white/60">Units Sold</span>
                    <span className="text-lg font-semibold text-blue-400">{selectedProduct.unitsSold || 0}</span>
                  </div>
                  <div className="space-y-1">
                    <span className="text-sm text-white/60">Average Order Value</span>
                    <span className="text-lg font-semibold text-purple-400">${selectedProduct.averageOrderValue || 0}</span>
                  </div>
                  <div className="space-y-1">
                    <span className="text-sm text-white/60">Profit Margin</span>
                    <span className="text-lg font-semibold text-yellow-400">{selectedProduct.margin || 0}%</span>
                  </div>
                </div>
              </div>

              {/* Revenue Breakdown */}
              <div className="glass-card p-4">
                <h3 className="text-lg font-semibold text-white mb-4">Revenue Breakdown</h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-white/80">Gross Sales</span>
                    <span className="text-white font-medium">${selectedProduct.grossSales || 0}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-white/80">- Discounts</span>
                    <span className="text-red-400 font-medium">-${selectedProduct.discounts || 0}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-white/80">- Returns</span>
                    <span className="text-red-400 font-medium">-${selectedProduct.returns || 0}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-white/80">+ Shipping</span>
                    <span className="text-green-400 font-medium">+${selectedProduct.shipping || 0}</span>
                  </div>
                  <div className="flex justify-between items-center pt-3 border-t border-white/20">
                    <span className="text-white font-semibold">Net Sales</span>
                    <span className="text-white font-bold text-lg">${selectedProduct.netSales || 0}</span>
                  </div>
                </div>
              </div>

              {/* Customer Metrics */}
              <div className="glass-card p-4">
                <h3 className="text-lg font-semibold text-white mb-4">Customer Metrics</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <span className="text-sm text-white/60">Unique Customers</span>
                    <span className="text-lg font-semibold text-orange-400">{selectedProduct.uniqueCustomers || 0}</span>
                  </div>
                  <div className="space-y-1">
                    <span className="text-sm text-white/60">Repeat Purchase Rate</span>
                    <span className="text-lg font-semibold text-cyan-400">{selectedProduct.repeatRate || 0}%</span>
                  </div>
                  <div className="space-y-1">
                    <span className="text-sm text-white/60">Conversion Rate</span>
                    <span className="text-lg font-semibold text-green-400">{selectedProduct.conversionRate || 0}%</span>
                  </div>
                  <div className="space-y-1">
                    <span className="text-sm text-white/60">Return Rate</span>
                    <span className="text-lg font-semibold text-red-400">{selectedProduct.returnRate || 0}%</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          
          <div className="p-6 border-t border-white/20 flex items-center justify-between">
            <button 
              onClick={() => setShowProductDetails(false)}
              className="glass-button px-4 py-2 text-white/60 hover:text-white"
            >
              Close
            </button>
            <div className="flex items-center gap-3">
              <button className="glass-button px-4 py-2 flex items-center gap-2 hover:scale-105 transition-transform">
                <Settings size={16} />
                Edit Product
              </button>
              <button className="glass-button px-4 py-2 flex items-center gap-2 hover:scale-105 transition-transform">
                <TrendingUp size={16} />
                View Trends
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return null;
};

export default ProductPerformanceModals;