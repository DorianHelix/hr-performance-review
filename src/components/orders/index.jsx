import React, { useState, useEffect, useMemo, useRef } from 'react';
import { DollarSign, ShoppingCart, TrendingUp, Package, Users, Settings } from 'lucide-react';
import { useToast } from '../Toast';
import shopifyService from '../../services/shopifyService';
import OrderHeader from './OrderHeader';
import OrderFilters from './OrderFilters';
import OrderTable from './OrderTable';
import OrderSidebar from './OrderSidebar';
import { OrderDetailModal, OrderColumnSettingsModal } from './OrderModals';
import { ORDER_COLUMNS, PRESET_VIEWS, DATE_RANGES } from './orderConfig';

function Orders() {
  const { showSuccess, showError, showWarning } = useToast();
  
  // State
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [syncing, setSyncing] = useState(false);
  
  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [fulfillmentFilter, setFulfillmentFilter] = useState('all');
  const [financialFilter, setFinancialFilter] = useState('all');
  const [minAmount, setMinAmount] = useState('');
  const [maxAmount, setMaxAmount] = useState('');
  const [customerFilter, setCustomerFilter] = useState('');
  const [dateRange, setDateRange] = useState('last30days');
  const [customDateRange, setCustomDateRange] = useState({ start: null, end: null });
  
  // UI State
  const [showFilters, setShowFilters] = useState(true);
  const [showKPICards, setShowKPICards] = useState(() => {
    const saved = localStorage.getItem('orders_kpi_visible');
    return saved !== null ? JSON.parse(saved) : true;
  });
  const [showSidebar, setShowSidebar] = useState(() => {
    const saved = localStorage.getItem('orders_sidebar_visible');
    return saved !== null ? JSON.parse(saved) : window.innerWidth >= 1024;
  });
  const [expandedRows, setExpandedRows] = useState({});
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showColumnSettings, setShowColumnSettings] = useState(false);
  
  // View Management
  const [selectedView, setSelectedView] = useState('default');
  const [customViews, setCustomViews] = useState(() => {
    const saved = localStorage.getItem('order_custom_views');
    return saved ? JSON.parse(saved) : [];
  });
  const [visibleColumns, setVisibleColumns] = useState(() => {
    const defaultView = PRESET_VIEWS.find(v => v.id === 'default');
    return defaultView ? defaultView.columns : ORDER_COLUMNS.filter(c => c.default).map(c => c.key);
  });
  
  // Shopify Connection
  const [shopifyConnected, setShopifyConnected] = useState(false);
  const [showShopifySettings, setShowShopifySettings] = useState(false);
  
  const hasShownWarning = useRef(false);

  // Load orders on mount
  useEffect(() => {
    checkShopifyConnection();
    loadOrders();
  }, []);

  // Save UI preferences
  useEffect(() => {
    localStorage.setItem('orders_kpi_visible', JSON.stringify(showKPICards));
  }, [showKPICards]);

  useEffect(() => {
    localStorage.setItem('orders_sidebar_visible', JSON.stringify(showSidebar));
  }, [showSidebar]);

  // Check Shopify connection
  const checkShopifyConnection = () => {
    const hasCredentials = shopifyService.hasCredentials();
    setShopifyConnected(hasCredentials);
  };

  // Load orders from database
  const loadOrders = async () => {
    setLoading(true);
    try {
      const response = await fetch('http://localhost:3001/api/orders');
      if (response.ok) {
        const dbOrders = await response.json();
        if (dbOrders && dbOrders.length > 0) {
          setOrders(dbOrders);
          console.log(`Loaded ${dbOrders.length} orders from database`);
          return;
        }
      }
      
      if (!hasShownWarning.current) {
        showWarning('No orders in database. Please sync with Shopify to import orders.');
        hasShownWarning.current = true;
      }
    } catch (error) {
      console.error('Failed to load orders:', error);
      showError('Failed to load orders');
    } finally {
      setLoading(false);
    }
  };

  // Sync with Shopify
  const syncWithShopify = async () => {
    if (!shopifyService.hasCredentials()) {
      showError('Please configure Shopify credentials first');
      setShowShopifySettings(true);
      return;
    }

    setSyncing(true);
    try {
      const response = await fetch('http://localhost:3001/api/orders/sync', {
        method: 'POST'
      });
      
      if (response.ok) {
        const result = await response.json();
        setOrders(result.orders);
        showSuccess(`Synced ${result.count} orders from Shopify`);
      } else {
        const error = await response.json();
        showError('Failed to sync orders: ' + error.message);
      }
    } catch (error) {
      showError('Failed to sync with Shopify: ' + error.message);
    } finally {
      setSyncing(false);
    }
  };

  // Get date range for filtering
  const getDateRange = () => {
    const now = new Date();
    const ranges = {
      today: {
        start: new Date(now.setHours(0, 0, 0, 0)),
        end: new Date(now.setHours(23, 59, 59, 999))
      },
      yesterday: {
        start: new Date(now.setDate(now.getDate() - 1)).setHours(0, 0, 0, 0),
        end: new Date(now.setHours(23, 59, 59, 999))
      },
      last7days: {
        start: new Date(now.setDate(now.getDate() - 7)),
        end: new Date()
      },
      last30days: {
        start: new Date(now.setDate(now.getDate() - 30)),
        end: new Date()
      },
      thisMonth: {
        start: new Date(now.getFullYear(), now.getMonth(), 1),
        end: new Date(now.getFullYear(), now.getMonth() + 1, 0)
      },
      lastMonth: {
        start: new Date(now.getFullYear(), now.getMonth() - 1, 1),
        end: new Date(now.getFullYear(), now.getMonth(), 0)
      },
      last90days: {
        start: new Date(now.setDate(now.getDate() - 90)),
        end: new Date()
      },
      thisYear: {
        start: new Date(now.getFullYear(), 0, 1),
        end: new Date(now.getFullYear(), 11, 31)
      },
      custom: customDateRange
    };
    
    return ranges[dateRange] || ranges.last30days;
  };

  // Enhance orders with calculated fields
  const enhancedOrders = useMemo(() => {
    return orders.map(order => {
      const enhanced = { ...order };
      
      // Calculate profit and margin if cost data is available
      if (order.lineItems) {
        const totalCost = order.lineItems.reduce((sum, item) => {
          return sum + ((item.cost || 0) * item.quantity);
        }, 0);
        
        if (totalCost > 0) {
          enhanced.profit = order.totalPrice - totalCost;
          enhanced.margin = ((enhanced.profit / order.totalPrice) * 100);
        }
      }
      
      // Count items
      enhanced.itemCount = order.lineItems ? 
        order.lineItems.reduce((sum, item) => sum + item.quantity, 0) : 0;
      
      return enhanced;
    });
  }, [orders]);

  // Filter orders
  const filteredOrders = useMemo(() => {
    let filtered = enhancedOrders;
    
    // Apply view filter
    const currentView = PRESET_VIEWS.find(v => v.id === selectedView) || 
                       customViews.find(v => v.id === selectedView);
    if (currentView && currentView.filter) {
      filtered = filtered.filter(currentView.filter);
    }
    
    // Date range filter
    const range = getDateRange();
    if (range.start && range.end) {
      filtered = filtered.filter(order => {
        const orderDate = new Date(order.createdAt);
        return orderDate >= range.start && orderDate <= range.end;
      });
    }
    
    // Search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(order => 
        order.orderNumber?.toString().includes(term) ||
        order.customerName?.toLowerCase().includes(term) ||
        order.customerEmail?.toLowerCase().includes(term)
      );
    }
    
    // Fulfillment filter
    if (fulfillmentFilter !== 'all') {
      filtered = filtered.filter(order => order.fulfillmentStatus === fulfillmentFilter);
    }
    
    // Financial filter
    if (financialFilter !== 'all') {
      filtered = filtered.filter(order => order.financialStatus === financialFilter);
    }
    
    // Amount filters
    if (minAmount) {
      filtered = filtered.filter(order => order.totalPrice >= parseFloat(minAmount));
    }
    if (maxAmount) {
      filtered = filtered.filter(order => order.totalPrice <= parseFloat(maxAmount));
    }
    
    // Customer filter
    if (customerFilter) {
      const term = customerFilter.toLowerCase();
      filtered = filtered.filter(order => 
        order.customerName?.toLowerCase().includes(term) ||
        order.customerEmail?.toLowerCase().includes(term)
      );
    }
    
    // Sort by date (newest first)
    filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    
    return filtered;
  }, [enhancedOrders, searchTerm, selectedView, customViews, fulfillmentFilter, 
      financialFilter, minAmount, maxAmount, customerFilter, dateRange, customDateRange]);

  // Calculate metrics
  const metrics = useMemo(() => {
    const totalRevenue = filteredOrders.reduce((sum, order) => sum + (order.totalPrice || 0), 0);
    const totalProfit = filteredOrders.reduce((sum, order) => sum + (order.profit || 0), 0);
    const averageOrderValue = filteredOrders.length > 0 ? totalRevenue / filteredOrders.length : 0;
    const averageMargin = filteredOrders.length > 0 ? 
      filteredOrders.reduce((sum, order) => sum + (order.margin || 0), 0) / filteredOrders.length : 0;
    
    const uniqueCustomers = new Set(filteredOrders.map(o => o.customerEmail || o.customerName)).size;
    const repeatCustomers = filteredOrders.filter((order, index, self) => 
      self.findIndex(o => (o.customerEmail || o.customerName) === (order.customerEmail || order.customerName)) !== index
    ).length;
    const repeatRate = uniqueCustomers > 0 ? (repeatCustomers / uniqueCustomers * 100) : 0;
    
    const fulfilledOrders = filteredOrders.filter(o => o.fulfillmentStatus === 'fulfilled').length;
    const pendingOrders = filteredOrders.filter(o => o.fulfillmentStatus === 'unfulfilled').length;
    const partialOrders = filteredOrders.filter(o => o.fulfillmentStatus === 'partial').length;
    const cancelledOrders = filteredOrders.filter(o => o.financialStatus === 'cancelled' || o.financialStatus === 'voided').length;
    
    return {
      totalOrders: filteredOrders.length,
      totalRevenue,
      totalProfit,
      averageOrderValue,
      averageMargin,
      uniqueCustomers,
      repeatRate,
      fulfilledOrders,
      pendingOrders,
      partialOrders,
      cancelledOrders,
      revenueGrowth: 12.5 // Mock data - would calculate from historical data
    };
  }, [filteredOrders]);

  // Get chart data
  const getRevenueChartData = () => {
    // Group orders by date
    const revenueByDate = {};
    filteredOrders.forEach(order => {
      const date = new Date(order.createdAt).toLocaleDateString();
      if (!revenueByDate[date]) {
        revenueByDate[date] = 0;
      }
      revenueByDate[date] += order.totalPrice || 0;
    });
    
    const dates = Object.keys(revenueByDate).slice(-7); // Last 7 days
    
    return {
      labels: dates,
      datasets: [{
        label: 'Revenue',
        data: dates.map(date => revenueByDate[date]),
        borderColor: 'rgb(147, 51, 234)',
        backgroundColor: 'rgba(147, 51, 234, 0.1)',
        tension: 0.4,
        fill: true
      }]
    };
  };

  const getStatusChartData = () => {
    const statusCounts = {
      Fulfilled: filteredOrders.filter(o => o.fulfillmentStatus === 'fulfilled').length,
      Pending: filteredOrders.filter(o => o.fulfillmentStatus === 'unfulfilled').length,
      Partial: filteredOrders.filter(o => o.fulfillmentStatus === 'partial').length,
      Cancelled: filteredOrders.filter(o => o.financialStatus === 'cancelled' || o.financialStatus === 'voided').length
    };
    
    return {
      labels: Object.keys(statusCounts),
      datasets: [{
        data: Object.values(statusCounts),
        backgroundColor: [
          'rgba(34, 197, 94, 0.5)',
          'rgba(234, 179, 8, 0.5)',
          'rgba(249, 115, 22, 0.5)',
          'rgba(239, 68, 68, 0.5)'
        ],
        borderColor: [
          'rgba(34, 197, 94, 1)',
          'rgba(234, 179, 8, 1)',
          'rgba(249, 115, 22, 1)',
          'rgba(239, 68, 68, 1)'
        ],
        borderWidth: 1
      }]
    };
  };

  // Get top products
  const getTopProducts = () => {
    const productStats = {};
    filteredOrders.forEach(order => {
      order.lineItems?.forEach(item => {
        if (!productStats[item.productId]) {
          productStats[item.productId] = {
            id: item.productId,
            name: item.name,
            quantity: 0,
            revenue: 0
          };
        }
        productStats[item.productId].quantity += item.quantity;
        productStats[item.productId].revenue += item.price * item.quantity;
      });
    });
    
    return Object.values(productStats)
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5);
  };

  // Get top customers
  const getTopCustomers = () => {
    const customerStats = {};
    filteredOrders.forEach(order => {
      const key = order.customerEmail || order.customerName || 'guest';
      if (!customerStats[key]) {
        customerStats[key] = {
          email: order.customerEmail,
          name: order.customerName,
          orderCount: 0,
          totalSpent: 0
        };
      }
      customerStats[key].orderCount++;
      customerStats[key].totalSpent += order.totalPrice || 0;
    });
    
    return Object.values(customerStats)
      .sort((a, b) => b.totalSpent - a.totalSpent)
      .slice(0, 5);
  };

  // Handle view change
  const handleViewChange = (viewId) => {
    setSelectedView(viewId);
    const view = PRESET_VIEWS.find(v => v.id === viewId) || 
                 customViews.find(v => v.id === viewId);
    if (view) {
      setVisibleColumns(view.columns);
    }
  };

  // Save custom view
  const saveCustomView = (name) => {
    const newView = {
      id: `custom-${Date.now()}`,
      name,
      columns: visibleColumns,
      custom: true
    };
    
    const updatedViews = [...customViews, newView];
    setCustomViews(updatedViews);
    localStorage.setItem('order_custom_views', JSON.stringify(updatedViews));
    showSuccess(`Saved view: ${name}`);
    setShowColumnSettings(false);
  };

  // Toggle column visibility
  const toggleColumn = (columnKey) => {
    if (visibleColumns.includes(columnKey)) {
      setVisibleColumns(visibleColumns.filter(c => c !== columnKey));
    } else {
      setVisibleColumns([...visibleColumns, columnKey]);
    }
  };

  // Toggle row expansion
  const toggleRowExpansion = (orderId) => {
    setExpandedRows(prev => ({
      ...prev,
      [orderId]: !prev[orderId]
    }));
  };

  // Clear all filters
  const clearFilters = () => {
    setSearchTerm('');
    setFulfillmentFilter('all');
    setFinancialFilter('all');
    setMinAmount('');
    setMaxAmount('');
    setCustomerFilter('');
  };

  // Count active filters
  const activeFiltersCount = [
    searchTerm,
    fulfillmentFilter !== 'all',
    financialFilter !== 'all',
    minAmount,
    maxAmount,
    customerFilter
  ].filter(Boolean).length;

  // Export data
  const exportData = () => {
    const csv = [
      visibleColumns.map(col => {
        const column = ORDER_COLUMNS.find(c => c.key === col);
        return column ? column.label : col;
      }).join(','),
      ...filteredOrders.map(order => 
        visibleColumns.map(col => {
          const value = order[col];
          if (Array.isArray(value)) return `"${value.join('; ')}"`;
          if (typeof value === 'object') return `"${JSON.stringify(value)}"`;
          if (typeof value === 'string' && value.includes(',')) return `"${value}"`;
          return value || '';
        }).join(',')
      )
    ].join('\n');
    
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `orders-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    showSuccess('Orders exported to CSV');
  };

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <OrderHeader
        showKPICards={showKPICards}
        onToggleKPICards={() => setShowKPICards(prev => !prev)}
        showSidebar={showSidebar}
        onToggleSidebar={() => setShowSidebar(prev => !prev)}
        dateRange={dateRange}
        onDateRangeChange={setDateRange}
        customDateRange={customDateRange}
        onCustomDateRangeChange={setCustomDateRange}
        onSync={syncWithShopify}
        syncing={syncing}
        onExport={exportData}
        onShowFilters={() => setShowFilters(prev => !prev)}
        orderCount={filteredOrders.length}
        totalOrderCount={orders.length}
      />

      {/* KPI Cards */}
      {showKPICards && (
        <div className="px-6 mb-4">
          <div className="flex gap-4 overflow-x-auto pb-2">
            <div className="glass-card p-3 rounded-xl bg-gradient-to-br from-green-500/10 to-emerald-500/10 relative overflow-hidden flex-shrink-0" style={{minWidth: '160px'}}>
              <div className="relative z-10">
                <div className="flex items-center gap-2 mb-2">
                  <DollarSign className="text-green-400" size={16} />
                  <h3 className="font-semibold text-white text-sm">Revenue</h3>
                </div>
                <div className="flex items-baseline gap-1">
                  <span className="text-2xl font-bold text-white">
                    {Math.round(metrics.totalRevenue / 1000)}k
                  </span>
                  <span className="text-xs text-green-400">+{metrics.revenueGrowth}%</span>
                </div>
              </div>
            </div>

            <div className="glass-card p-3 rounded-xl bg-gradient-to-br from-purple-500/10 to-pink-500/10 relative overflow-hidden flex-shrink-0" style={{minWidth: '160px'}}>
              <div className="relative z-10">
                <div className="flex items-center gap-2 mb-2">
                  <ShoppingCart className="text-purple-400" size={16} />
                  <h3 className="font-semibold text-white text-sm">Orders</h3>
                </div>
                <div className="flex items-baseline gap-1">
                  <span className="text-2xl font-bold text-white">{metrics.totalOrders}</span>
                  <span className="text-xs text-purple-400">
                    AOV: {Math.round(metrics.averageOrderValue)} Ft
                  </span>
                </div>
              </div>
            </div>

            <div className="glass-card p-3 rounded-xl bg-gradient-to-br from-blue-500/10 to-cyan-500/10 relative overflow-hidden flex-shrink-0" style={{minWidth: '160px'}}>
              <div className="relative z-10">
                <div className="flex items-center gap-2 mb-2">
                  <TrendingUp className="text-blue-400" size={16} />
                  <h3 className="font-semibold text-white text-sm">Profit</h3>
                </div>
                <div className="flex items-baseline gap-1">
                  <span className="text-2xl font-bold text-white">
                    {Math.round(metrics.totalProfit / 1000)}k
                  </span>
                  <span className="text-xs text-blue-400">{metrics.averageMargin.toFixed(1)}% margin</span>
                </div>
              </div>
            </div>

            <div className="glass-card p-3 rounded-xl bg-gradient-to-br from-yellow-500/10 to-orange-500/10 relative overflow-hidden flex-shrink-0" style={{minWidth: '160px'}}>
              <div className="relative z-10">
                <div className="flex items-center gap-2 mb-2">
                  <Package className="text-yellow-400" size={16} />
                  <h3 className="font-semibold text-white text-sm">Fulfillment</h3>
                </div>
                <div className="flex items-baseline gap-1">
                  <span className="text-2xl font-bold text-white">{metrics.fulfilledOrders}</span>
                  <span className="text-xs text-yellow-400">{metrics.pendingOrders} pending</span>
                </div>
              </div>
            </div>

            <div className="glass-card p-3 rounded-xl bg-gradient-to-br from-cyan-500/10 to-blue-500/10 relative overflow-hidden flex-shrink-0" style={{minWidth: '160px'}}>
              <div className="relative z-10">
                <div className="flex items-center gap-2 mb-2">
                  <Users className="text-cyan-400" size={16} />
                  <h3 className="font-semibold text-white text-sm">Customers</h3>
                </div>
                <div className="flex items-baseline gap-1">
                  <span className="text-2xl font-bold text-white">{metrics.uniqueCustomers}</span>
                  <span className="text-xs text-cyan-400">{metrics.repeatRate.toFixed(0)}% repeat</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Filters */}
      {showFilters && (
        <OrderFilters
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          fulfillmentFilter={fulfillmentFilter}
          onFulfillmentChange={setFulfillmentFilter}
          financialFilter={financialFilter}
          onFinancialChange={setFinancialFilter}
          minAmount={minAmount}
          maxAmount={maxAmount}
          onMinAmountChange={setMinAmount}
          onMaxAmountChange={setMaxAmount}
          customerFilter={customerFilter}
          onCustomerChange={setCustomerFilter}
          onClearFilters={clearFilters}
          activeFiltersCount={activeFiltersCount}
        />
      )}

      {/* Main Content */}
      <div className={`flex-1 px-6 pb-6 overflow-hidden flex ${showSidebar ? 'gap-4' : ''}`}>
        <div className="flex-1 flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <select
              value={selectedView}
              onChange={(e) => handleViewChange(e.target.value)}
              className="glass-input px-4 py-2 min-w-[200px]"
            >
              <optgroup label="Preset Views">
                {PRESET_VIEWS.map(view => (
                  <option key={view.id} value={view.id}>
                    {view.name}
                  </option>
                ))}
              </optgroup>
              {customViews.length > 0 && (
                <optgroup label="Custom Views">
                  {customViews.map(view => (
                    <option key={view.id} value={view.id}>
                      {view.name}
                    </option>
                  ))}
                </optgroup>
              )}
            </select>

            <button
              onClick={() => setShowColumnSettings(true)}
              className="glass-button px-3 py-2 flex items-center gap-2 hover:scale-105 transition-transform"
            >
              <Settings size={16} />
              Columns
            </button>
          </div>

          <OrderTable
            orders={filteredOrders}
            visibleColumns={visibleColumns}
            expandedRows={expandedRows}
            onToggleRowExpansion={toggleRowExpansion}
            onOrderClick={setSelectedOrder}
            loading={loading}
          />
        </div>

        {/* Sidebar */}
        {showSidebar && (
          <OrderSidebar
            metrics={metrics}
            revenueChartData={getRevenueChartData()}
            statusChartData={getStatusChartData()}
            topProducts={getTopProducts()}
            topCustomers={getTopCustomers()}
            onSync={syncWithShopify}
            syncing={syncing}
            shopifyConnected={shopifyConnected}
            onShowSettings={() => setShowShopifySettings(true)}
          />
        )}
      </div>

      {/* Modals */}
      {selectedOrder && (
        <OrderDetailModal
          order={selectedOrder}
          onClose={() => setSelectedOrder(null)}
        />
      )}

      {showColumnSettings && (
        <OrderColumnSettingsModal
          visibleColumns={visibleColumns}
          onToggleColumn={toggleColumn}
          onSaveView={saveCustomView}
          onClose={() => setShowColumnSettings(false)}
        />
      )}
    </div>
  );
}

export default Orders;