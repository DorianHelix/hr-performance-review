import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useToast } from '../Toast';
import shopifyService from '../../services/shopifyService';

// Import sub-components
import ProductPerformanceHeader from './ProductPerformanceHeader';
import ProductPerformanceFilters from './ProductPerformanceFilters';
import ProductPerformanceTable from './ProductPerformanceTable';
import ProductPerformanceSidebar from './ProductPerformanceSidebar';
import ProductPerformanceModals from './ProductPerformanceModals';

// Import configuration
import { 
  PERFORMANCE_COLUMNS, 
  PERFORMANCE_VIEWS, 
  DATE_RANGES,
  COMPARISON_PERIODS,
  formatters 
} from './performanceConfig';

const ProductPerformance = () => {
  // State management
  const [products, setProducts] = useState([]);
  const [performanceData, setPerformanceData] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [syncing, setSyncing] = useState(false);
  
  // Filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedView, setSelectedView] = useState('overview');
  const [dateRange, setDateRange] = useState('30d');
  const [comparisonPeriod, setComparisonPeriod] = useState('previous_period');
  const [sortBy, setSortBy] = useState('totalSales_desc');
  const [filters, setFilters] = useState({});
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  
  // UI states
  const [visibleColumns, setVisibleColumns] = useState(
    PERFORMANCE_VIEWS.find(v => v.id === 'overview').columns
  );
  const [rightSidebarOpen, setRightSidebarOpen] = useState(true);
  const [selectedProducts, setSelectedProducts] = useState([]);
  
  // Modal states
  const [showReportModal, setShowReportModal] = useState(false);
  const [showChartModal, setShowChartModal] = useState(false);
  const [showProductDetails, setShowProductDetails] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  
  const { showToast } = useToast();
  const hasShownWarning = useRef(false);

  // Load products and performance data on mount
  useEffect(() => {
    loadProducts();
  }, []);

  // Apply filters when dependencies change
  useEffect(() => {
    applyFilters();
  }, [products, searchTerm, selectedView, sortBy, filters, dateRange]);

  // Update visible columns when view changes
  useEffect(() => {
    const view = PERFORMANCE_VIEWS.find(v => v.id === selectedView);
    if (view) {
      setVisibleColumns(view.columns);
    }
  }, [selectedView]);

  // Load products from backend
  const loadProducts = async () => {
    setLoading(true);
    try {
      const response = await fetch('http://localhost:3001/api/products');
      const data = await response.json();
      
      if (data && data.length > 0) {
        // Generate mock performance data for now
        const productsWithPerformance = data.map(product => ({
          ...product,
          ...generateMockPerformanceData(product)
        }));
        setProducts(productsWithPerformance);
        setPerformanceData(productsWithPerformance);
      } else {
        if (!hasShownWarning.current) {
          showToast('No products found. Sync with Shopify to load products.', 'warning');
          hasShownWarning.current = true;
        }
      }
    } catch (error) {
      console.error('Error loading products:', error);
      showToast('Failed to load products', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Generate mock performance data (to be replaced with real Shopify data)
  const generateMockPerformanceData = (product) => {
    const baseRevenue = Math.random() * 50000 + 5000;
    const unitsSold = Math.floor(Math.random() * 500 + 50);
    const orders = Math.floor(unitsSold * 0.8);
    const cost = product.cost || product.price * 0.6;
    const grossSales = baseRevenue * 1.1;
    const discounts = baseRevenue * 0.05;
    const returns = baseRevenue * 0.03;
    const taxes = baseRevenue * 0.08;
    const shipping = baseRevenue * 0.02;
    const netSales = grossSales - discounts - returns + shipping;
    const profit = netSales - (cost * unitsSold) - taxes;
    
    return {
      // Sales Metrics
      totalSales: netSales,
      unitsSold: unitsSold,
      ordersCount: orders,
      averageOrderValue: netSales / orders,
      firstTimeOrders: Math.floor(orders * 0.3),
      repeatOrders: Math.floor(orders * 0.7),
      
      // Revenue & Profit
      grossSales: grossSales,
      netSales: netSales,
      discounts: discounts,
      returns: returns,
      taxes: taxes,
      shipping: shipping,
      profit: profit,
      margin: (profit / netSales * 100),
      
      // Refunds & Returns
      refundedAmount: returns,
      refundedUnits: Math.floor(unitsSold * 0.03),
      refundRate: 3,
      returnRate: 3,
      
      // Conversion Metrics
      views: Math.floor(Math.random() * 10000 + 1000),
      addedToCart: Math.floor(Math.random() * 1000 + 100),
      conversionRate: Math.random() * 5 + 1,
      cartAbandonmentRate: Math.random() * 30 + 40,
      
      // Customer Metrics
      uniqueCustomers: Math.floor(orders * 0.9),
      newCustomers: Math.floor(orders * 0.3),
      returningCustomers: Math.floor(orders * 0.6),
      customerLifetimeValue: Math.random() * 500 + 100,
      
      // Fulfillment
      fulfilled: Math.floor(orders * 0.95),
      unfulfilled: Math.floor(orders * 0.03),
      partiallyFulfilled: Math.floor(orders * 0.02),
      fulfillmentRate: 95,
      
      // Trending
      salesTrend: (Math.random() - 0.5) * 40,
      growthRate: (Math.random() - 0.3) * 20,
      velocityScore: Math.random() * 10,
      
      // Time-based
      lastSaleDate: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000),
      daysActive: Math.floor(Math.random() * 365 + 30),
      seasonality: ['High', 'Medium', 'Low'][Math.floor(Math.random() * 3)]
    };
  };

  // Sync with Shopify
  const syncWithShopify = async () => {
    setSyncing(true);
    try {
      // Sync products first
      await shopifyService.syncProducts(true);
      
      // TODO: Implement Shopify Analytics API integration
      // This would fetch:
      // - Order data for revenue and sales metrics
      // - Customer data for customer metrics
      // - Refund/return data
      // - Traffic and conversion data
      
      showToast('Performance data synced successfully', 'success');
      await loadProducts();
    } catch (error) {
      console.error('Sync error:', error);
      showToast(error.message || 'Failed to sync performance data', 'error');
    } finally {
      setSyncing(false);
    }
  };

  // Apply filters and sorting
  const applyFilters = () => {
    let filtered = [...performanceData];
    
    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(product =>
        product.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.sku?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.vendor?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    // View filter
    const view = PERFORMANCE_VIEWS.find(v => v.id === selectedView);
    if (view && view.filter) {
      filtered = filtered.filter(view.filter);
    }
    
    // Advanced filters
    if (filters.minSales !== undefined) {
      filtered = filtered.filter(p => p.totalSales >= filters.minSales);
    }
    if (filters.maxSales !== undefined) {
      filtered = filtered.filter(p => p.totalSales <= filters.maxSales);
    }
    if (filters.minMargin !== undefined) {
      filtered = filtered.filter(p => p.margin >= filters.minMargin);
    }
    if (filters.maxMargin !== undefined) {
      filtered = filtered.filter(p => p.margin <= filters.maxMargin);
    }
    if (filters.minUnits !== undefined) {
      filtered = filtered.filter(p => p.unitsSold >= filters.minUnits);
    }
    if (filters.maxUnits !== undefined) {
      filtered = filtered.filter(p => p.unitsSold <= filters.maxUnits);
    }
    if (filters.vendor) {
      filtered = filtered.filter(p => p.vendor === filters.vendor);
    }
    if (filters.category) {
      filtered = filtered.filter(p => p.category === filters.category);
    }
    
    // Sorting
    if (sortBy) {
      const [key, direction] = sortBy.split('_');
      filtered.sort((a, b) => {
        const aVal = a[key] || 0;
        const bVal = b[key] || 0;
        if (direction === 'asc') {
          return aVal > bVal ? 1 : -1;
        } else {
          return bVal > aVal ? 1 : -1;
        }
      });
    } else if (view && view.sort) {
      // Apply view's default sort
      filtered.sort((a, b) => {
        const aVal = a[view.sort.key] || 0;
        const bVal = b[view.sort.key] || 0;
        if (view.sort.direction === 'asc') {
          return aVal > bVal ? 1 : -1;
        } else {
          return bVal > aVal ? 1 : -1;
        }
      });
    }
    
    setFilteredProducts(filtered);
  };

  // Export data
  const handleExport = (format) => {
    // TODO: Implement export in different formats
    showToast(`Exporting in ${format} format...`, 'info');
  };

  // Generate report
  const handleGenerateReport = (settings) => {
    // TODO: Implement report generation
    showToast('Generating report...', 'info');
  };

  // Product selection
  const handleSelectProduct = (productId, selected) => {
    if (selected) {
      setSelectedProducts([...selectedProducts, productId]);
    } else {
      setSelectedProducts(selectedProducts.filter(id => id !== productId));
    }
  };

  const handleSelectAll = (selected) => {
    if (selected) {
      setSelectedProducts(filteredProducts.map(p => p.id));
    } else {
      setSelectedProducts([]);
    }
  };

  // Product click handler
  const handleProductClick = (product) => {
    setSelectedProduct(product);
    setShowProductDetails(true);
  };

  // Calculate performance insights
  const performanceInsights = useMemo(() => {
    if (!filteredProducts.length) return {};
    
    const totalRevenue = filteredProducts.reduce((sum, p) => sum + (p.totalSales || 0), 0);
    const avgMargin = filteredProducts.reduce((sum, p) => sum + (p.margin || 0), 0) / filteredProducts.length;
    
    const topPerformer = filteredProducts.reduce((max, p) => 
      (p.totalSales || 0) > (max.totalSales || 0) ? p : max
    );
    
    const highestMargin = filteredProducts.reduce((max, p) => 
      (p.margin || 0) > (max.margin || 0) ? p : max
    );
    
    const mostReturns = filteredProducts.reduce((max, p) => 
      (p.returnRate || 0) > (max.returnRate || 0) ? p : max
    );
    
    const underperformer = filteredProducts.reduce((min, p) => 
      (p.totalSales || Infinity) < (min.totalSales || Infinity) ? p : min
    );
    
    return {
      totalRevenue: formatters.currency(totalRevenue),
      avgMargin: formatters.percentage(avgMargin),
      productCount: filteredProducts.length,
      topPerformer: topPerformer?.name,
      topPerformerSales: formatters.currency(topPerformer?.totalSales),
      highestMargin: highestMargin?.name,
      highestMarginValue: formatters.percentage(highestMargin?.margin),
      mostReturns: mostReturns?.name,
      returnRate: formatters.percentage(mostReturns?.returnRate),
      underperformer: underperformer?.name,
      underperformerIssue: underperformer?.conversionRate < 1 ? 'Low conversion' : 'Low sales'
    };
  }, [filteredProducts]);

  // Get current view description
  const currentViewDescription = PERFORMANCE_VIEWS.find(v => v.id === selectedView)?.description || '';

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <ProductPerformanceHeader
        dateRange={dateRange}
        setDateRange={setDateRange}
        comparisonPeriod={comparisonPeriod}
        setComparisonPeriod={setComparisonPeriod}
        onSync={syncWithShopify}
        onExport={handleExport}
        syncing={syncing}
        onToggleSidebar={() => setRightSidebarOpen(!rightSidebarOpen)}
        totalProducts={products.length}
        filteredCount={filteredProducts.length}
      />

      <div className={`flex-1 px-6 pb-6 overflow-hidden flex ${rightSidebarOpen ? 'gap-4' : ''}`}>
        <div className="flex-1 flex flex-col">
          <ProductPerformanceFilters
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            selectedView={selectedView}
            setSelectedView={setSelectedView}
            sortBy={sortBy}
            setSortBy={setSortBy}
            filters={filters}
            setFilters={setFilters}
            onColumnSettings={() => {}}
            showAdvancedFilters={showAdvancedFilters}
            setShowAdvancedFilters={setShowAdvancedFilters}
            filteredProducts={filteredProducts}
          />

          <ProductPerformanceTable
            products={filteredProducts}
            visibleColumns={visibleColumns}
            loading={loading}
            onProductClick={handleProductClick}
            selectedProducts={selectedProducts}
            onSelectProduct={handleSelectProduct}
            onSelectAll={handleSelectAll}
          />
        </div>

        {rightSidebarOpen && (
          <ProductPerformanceSidebar
            visibleColumns={visibleColumns}
            setVisibleColumns={setVisibleColumns}
            selectedView={selectedView}
            viewDescription={currentViewDescription}
            performanceInsights={performanceInsights}
            onGenerateReport={() => setShowReportModal(true)}
            onViewCharts={() => setShowChartModal(true)}
          />
        )}
      </div>

      <ProductPerformanceModals
        showReportModal={showReportModal}
        setShowReportModal={setShowReportModal}
        showChartModal={showChartModal}
        setShowChartModal={setShowChartModal}
        showProductDetails={showProductDetails}
        setShowProductDetails={setShowProductDetails}
        selectedProduct={selectedProduct}
        onGenerateReport={handleGenerateReport}
        products={filteredProducts}
      />
    </div>
  );
};

export default ProductPerformance;