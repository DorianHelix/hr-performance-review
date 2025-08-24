import React from 'react';
import { 
  Store, RefreshCw, Database, Settings, TrendingUp, 
  DollarSign, ShoppingCart, Users, Package, Clock,
  CheckCircle, XCircle, AlertTriangle, Calendar,
  BarChart3, PieChart, Activity, Target
} from 'lucide-react';
import { Line, Bar, Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

function OrderSidebar({
  metrics,
  revenueChartData,
  statusChartData,
  topProducts,
  topCustomers,
  onSync,
  syncing,
  shopifyConnected,
  onShowSettings
}) {
  // Chart options
  const lineChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleColor: '#fff',
        bodyColor: '#fff',
        borderColor: 'rgba(147, 51, 234, 0.5)',
        borderWidth: 1,
        padding: 12,
        displayColors: false,
        callbacks: {
          label: function(context) {
            return `Revenue: ${context.parsed.y.toLocaleString()} Ft`;
          }
        }
      }
    },
    scales: {
      x: {
        grid: {
          color: 'rgba(255, 255, 255, 0.05)',
          drawBorder: false
        },
        ticks: {
          color: 'rgba(255, 255, 255, 0.5)',
          font: {
            size: 10
          }
        }
      },
      y: {
        grid: {
          color: 'rgba(255, 255, 255, 0.05)',
          drawBorder: false
        },
        ticks: {
          color: 'rgba(255, 255, 255, 0.5)',
          font: {
            size: 10
          },
          callback: function(value) {
            return value.toLocaleString() + ' Ft';
          }
        }
      }
    }
  };

  const doughnutChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          color: 'rgba(255, 255, 255, 0.7)',
          padding: 10,
          font: {
            size: 11
          }
        }
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleColor: '#fff',
        bodyColor: '#fff',
        borderColor: 'rgba(147, 51, 234, 0.5)',
        borderWidth: 1,
        padding: 12
      }
    }
  };

  return (
    <div className="w-full lg:w-80 flex-shrink-0 space-y-3 sm:space-y-4 overflow-y-auto max-h-full">
      {/* KPI Summary */}
      <div className="glass-card-large p-4">
        <div className="flex items-center gap-2 mb-4">
          <Activity className="text-purple-400" size={20} />
          <h3 className="font-semibold text-white">Performance Summary</h3>
        </div>
        
        <div className="grid grid-cols-2 gap-3">
          <div className="glass-card p-3 bg-gradient-to-br from-green-500/10 to-emerald-500/10">
            <div className="flex items-center gap-2 mb-1">
              <DollarSign size={14} className="text-green-400" />
              <span className="text-xs text-white/60">Revenue</span>
            </div>
            <div className="text-xl font-bold text-white">
              {metrics.totalRevenue ? `${Math.round(metrics.totalRevenue / 1000)}k` : '0'}
            </div>
            <div className="text-xs text-green-400 mt-1">
              +{metrics.revenueGrowth || 0}% vs last period
            </div>
          </div>

          <div className="glass-card p-3 bg-gradient-to-br from-purple-500/10 to-pink-500/10">
            <div className="flex items-center gap-2 mb-1">
              <ShoppingCart size={14} className="text-purple-400" />
              <span className="text-xs text-white/60">Orders</span>
            </div>
            <div className="text-xl font-bold text-white">
              {metrics.totalOrders || 0}
            </div>
            <div className="text-xs text-purple-400 mt-1">
              {metrics.averageOrderValue ? `AOV: ${Math.round(metrics.averageOrderValue)} Ft` : 'AOV: 0 Ft'}
            </div>
          </div>

          <div className="glass-card p-3 bg-gradient-to-br from-blue-500/10 to-cyan-500/10">
            <div className="flex items-center gap-2 mb-1">
              <TrendingUp size={14} className="text-blue-400" />
              <span className="text-xs text-white/60">Profit</span>
            </div>
            <div className="text-xl font-bold text-white">
              {metrics.totalProfit ? `${Math.round(metrics.totalProfit / 1000)}k` : '0'}
            </div>
            <div className="text-xs text-blue-400 mt-1">
              {metrics.averageMargin || 0}% margin
            </div>
          </div>

          <div className="glass-card p-3 bg-gradient-to-br from-yellow-500/10 to-orange-500/10">
            <div className="flex items-center gap-2 mb-1">
              <Users size={14} className="text-yellow-400" />
              <span className="text-xs text-white/60">Customers</span>
            </div>
            <div className="text-xl font-bold text-white">
              {metrics.uniqueCustomers || 0}
            </div>
            <div className="text-xs text-yellow-400 mt-1">
              {metrics.repeatRate || 0}% repeat
            </div>
          </div>
        </div>
      </div>

      {/* Revenue Chart */}
      {revenueChartData && (
        <div className="glass-card-large p-4">
          <div className="flex items-center gap-2 mb-4">
            <BarChart3 className="text-green-400" size={20} />
            <h3 className="font-semibold text-white">Revenue Trend</h3>
          </div>
          
          <div className="h-48">
            <Line 
              data={revenueChartData} 
              options={lineChartOptions}
            />
          </div>
        </div>
      )}

      {/* Order Status Distribution */}
      {statusChartData && (
        <div className="glass-card-large p-4">
          <div className="flex items-center gap-2 mb-4">
            <PieChart className="text-blue-400" size={20} />
            <h3 className="font-semibold text-white">Order Status</h3>
          </div>
          
          <div className="h-48">
            <Doughnut 
              data={statusChartData} 
              options={doughnutChartOptions}
            />
          </div>
        </div>
      )}

      {/* Fulfillment Status */}
      <div className="glass-card-large p-4">
        <div className="flex items-center gap-2 mb-4">
          <Package className="text-orange-400" size={20} />
          <h3 className="font-semibold text-white">Fulfillment Status</h3>
        </div>
        
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CheckCircle size={14} className="text-green-400" />
              <span className="text-sm text-white/70">Fulfilled</span>
            </div>
            <span className="text-sm font-medium text-white">
              {metrics.fulfilledOrders || 0}
            </span>
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Clock size={14} className="text-yellow-400" />
              <span className="text-sm text-white/70">Pending</span>
            </div>
            <span className="text-sm font-medium text-white">
              {metrics.pendingOrders || 0}
            </span>
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertTriangle size={14} className="text-orange-400" />
              <span className="text-sm text-white/70">Partial</span>
            </div>
            <span className="text-sm font-medium text-white">
              {metrics.partialOrders || 0}
            </span>
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <XCircle size={14} className="text-red-400" />
              <span className="text-sm text-white/70">Cancelled</span>
            </div>
            <span className="text-sm font-medium text-white">
              {metrics.cancelledOrders || 0}
            </span>
          </div>
        </div>
      </div>

      {/* Top Products */}
      {topProducts && topProducts.length > 0 && (
        <div className="glass-card-large p-4">
          <div className="flex items-center gap-2 mb-4">
            <Target className="text-pink-400" size={20} />
            <h3 className="font-semibold text-white">Top Products</h3>
          </div>
          
          <div className="space-y-2">
            {topProducts.slice(0, 5).map((product, index) => (
              <div key={product.id || index} className="flex items-center justify-between p-2 glass-card">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-white/50">#{index + 1}</span>
                  <div>
                    <div className="text-sm text-white font-medium">{product.name}</div>
                    <div className="text-xs text-white/50">{product.quantity} sold</div>
                  </div>
                </div>
                <span className="text-sm font-medium text-green-400">
                  {Math.round(product.revenue).toLocaleString()} Ft
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Top Customers */}
      {topCustomers && topCustomers.length > 0 && (
        <div className="glass-card-large p-4">
          <div className="flex items-center gap-2 mb-4">
            <Users className="text-cyan-400" size={20} />
            <h3 className="font-semibold text-white">Top Customers</h3>
          </div>
          
          <div className="space-y-2">
            {topCustomers.slice(0, 5).map((customer, index) => (
              <div key={customer.email || index} className="flex items-center justify-between p-2 glass-card">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-cyan-500/20 to-blue-500/20 flex items-center justify-center text-xs font-bold text-cyan-300">
                    {customer.name ? customer.name[0].toUpperCase() : 'G'}
                  </div>
                  <div>
                    <div className="text-sm text-white font-medium">{customer.name || 'Guest'}</div>
                    <div className="text-xs text-white/50">{customer.orderCount} orders</div>
                  </div>
                </div>
                <span className="text-sm font-medium text-cyan-400">
                  {Math.round(customer.totalSpent).toLocaleString()} Ft
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Shopify Sync */}
      <div className="glass-card-large p-4">
        <div className="flex items-center gap-2 mb-4">
          <Store className="text-green-400" size={20} />
          <h3 className="font-semibold text-white">Shopify Sync</h3>
        </div>
        
        {shopifyConnected ? (
          <div className="space-y-3">
            <div className="p-3 bg-green-500/10 border border-green-500/30 rounded-lg">
              <div className="flex items-center gap-2 mb-1">
                <CheckCircle size={16} className="text-green-400" />
                <span className="text-sm font-medium text-green-400">Connected</span>
              </div>
              <p className="text-xs text-white/60">
                Ready to sync orders
              </p>
            </div>
            
            <button
              onClick={onSync}
              disabled={syncing}
              className="glass-button w-full px-4 py-2 flex items-center justify-center gap-2 hover:scale-105 transition-transform"
            >
              <RefreshCw size={16} className={syncing ? 'animate-spin' : ''} />
              {syncing ? 'Syncing...' : 'Sync Orders'}
            </button>
            
            <button
              onClick={onShowSettings}
              className="glass-button w-full px-4 py-2 flex items-center justify-center gap-2 text-white/60 hover:text-white transition-colors"
            >
              <Settings size={16} />
              Settings
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            <p className="text-sm text-white/60">
              Connect to Shopify to sync orders
            </p>
            
            <button
              onClick={onShowSettings}
              className="glass-button w-full px-4 py-2 flex items-center justify-center gap-2 bg-green-500/20 border-green-500/50 hover:bg-green-500/30 transition-colors"
            >
              <Store size={16} />
              Connect Shopify
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default OrderSidebar;