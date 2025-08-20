import React, { useState, useEffect } from 'react';
import { ResponsiveBar } from '@nivo/bar';
import { ResponsiveLine } from '@nivo/line';
import { ResponsivePie } from '@nivo/pie';
import { ResponsiveRadar } from '@nivo/radar';
import { ResponsiveHeatMap } from '@nivo/heatmap';
import { ResponsiveCalendar } from '@nivo/calendar';
import { ResponsiveStream } from '@nivo/stream';
import { ResponsiveFunnel } from '@nivo/funnel';
import {
  BarChart3, TrendingUp, PieChart, Activity, Calendar,
  Package, Users, DollarSign, ShoppingCart, ArrowUp, ArrowDown,
  RefreshCw, Target
} from 'lucide-react';

// Glass theme for Nivo charts
const glassTheme = {
  background: 'transparent',
  textColor: '#ffffff',
  fontSize: 11,
  axis: {
    domain: {
      line: {
        stroke: '#ffffff30',
        strokeWidth: 1
      }
    },
    legend: {
      text: {
        fontSize: 12,
        fill: '#ffffff90'
      }
    },
    ticks: {
      line: {
        stroke: '#ffffff20',
        strokeWidth: 1
      },
      text: {
        fontSize: 10,
        fill: '#ffffff60'
      }
    }
  },
  grid: {
    line: {
      stroke: '#ffffff10',
      strokeWidth: 1
    }
  },
  legends: {
    title: {
      text: {
        fontSize: 11,
        fill: '#ffffff90'
      }
    },
    text: {
      fontSize: 11,
      fill: '#ffffff70'
    }
  },
  annotations: {
    text: {
      fontSize: 13,
      fill: '#ffffff',
      outlineWidth: 2,
      outlineColor: '#000000'
    },
    link: {
      stroke: '#ffffff60',
      strokeWidth: 1,
      outlineWidth: 2,
      outlineColor: '#000000'
    },
    outline: {
      stroke: '#ffffff60',
      strokeWidth: 2,
      outlineWidth: 2,
      outlineColor: '#000000'
    },
    symbol: {
      fill: '#ffffff60',
      outlineWidth: 2,
      outlineColor: '#000000'
    }
  },
  tooltip: {
    container: {
      background: 'rgba(0, 0, 0, 0.9)',
      color: '#ffffff',
      fontSize: 12,
      borderRadius: '8px',
      border: '1px solid rgba(255, 255, 255, 0.2)',
      padding: '8px 12px'
    }
  }
};

function Analytics() {
  const [selectedPeriod, setSelectedPeriod] = useState('month');
  const [isLoading, setIsLoading] = useState(false);
  
  // Sample data - in real app, this would come from your API
  const [analyticsData, setAnalyticsData] = useState({
    revenue: 847500,
    revenueChange: 12.5,
    orders: 1234,
    ordersChange: 8.3,
    customers: 456,
    customersChange: -2.1,
    products: 89,
    productsChange: 5.0
  });

  // Sales by month data
  const salesData = [
    {
      id: "sales",
      color: "hsl(280, 70%, 50%)",
      data: [
        { x: "Jan", y: 65000 },
        { x: "Feb", y: 72000 },
        { x: "Mar", y: 68000 },
        { x: "Apr", y: 78000 },
        { x: "May", y: 84000 },
        { x: "Jun", y: 91000 },
        { x: "Jul", y: 87000 },
        { x: "Aug", y: 92000 },
        { x: "Sep", y: 89000 },
        { x: "Oct", y: 96000 },
        { x: "Nov", y: 98000 },
        { x: "Dec", y: 105000 }
      ]
    },
    {
      id: "costs",
      color: "hsl(20, 70%, 50%)",
      data: [
        { x: "Jan", y: 45000 },
        { x: "Feb", y: 48000 },
        { x: "Mar", y: 47000 },
        { x: "Apr", y: 52000 },
        { x: "May", y: 54000 },
        { x: "Jun", y: 58000 },
        { x: "Jul", y: 56000 },
        { x: "Aug", y: 59000 },
        { x: "Sep", y: 57000 },
        { x: "Oct", y: 61000 },
        { x: "Nov", y: 62000 },
        { x: "Dec", y: 65000 }
      ]
    }
  ];

  // Category distribution for pie chart
  const categoryData = [
    { id: "Electronics", label: "Electronics", value: 35, color: "hsl(280, 70%, 50%)" },
    { id: "Clothing", label: "Clothing", value: 28, color: "hsl(200, 70%, 50%)" },
    { id: "Home", label: "Home & Garden", value: 20, color: "hsl(150, 70%, 50%)" },
    { id: "Sports", label: "Sports", value: 12, color: "hsl(30, 70%, 50%)" },
    { id: "Other", label: "Other", value: 5, color: "hsl(350, 70%, 50%)" }
  ];

  // Product performance for bar chart
  const productPerformance = [
    { product: "iPhone 14", sales: 234, profit: 45000 },
    { product: "Samsung TV", sales: 189, profit: 38000 },
    { product: "Nike Shoes", sales: 312, profit: 28000 },
    { product: "Coffee Maker", sales: 156, profit: 15000 },
    { product: "Gaming Chair", sales: 98, profit: 12000 }
  ];

  // Employee performance radar
  const performanceData = [
    { metric: "Sales", John: 85, Sarah: 92, Mike: 78, Emma: 88, David: 75 },
    { metric: "Customer Service", John: 90, Sarah: 85, Mike: 88, Emma: 92, David: 80 },
    { metric: "Efficiency", John: 78, Sarah: 88, Mike: 85, Emma: 82, David: 90 },
    { metric: "Teamwork", John: 88, Sarah: 90, Mike: 92, Emma: 85, David: 78 },
    { metric: "Innovation", John: 75, Sarah: 82, Mike: 70, Emma: 88, David: 85 }
  ];

  // Sales Funnel data - Split by Brand
  const [brandSplit, setBrandSplit] = useState(60); // Brand A percentage (Brand B = 100 - brandSplit)
  const [revenueSplit, setRevenueSplit] = useState(55); // Brand A revenue percentage
  
  // Original total values
  const funnelTotals = {
    'Website Visitors': 12450,
    'Product Views': 8234,
    'Add to Cart': 4512,
    'Checkout': 2341,
    'Purchase': 1687
  };
  
  // Calculate split data for both brands
  const calculateBrandData = (brandAPercentage) => {
    const brandBPercentage = 100 - brandAPercentage;
    
    return Object.entries(funnelTotals).map(([stage, total]) => ({
      stage,
      'Brand A': Math.round(total * (brandAPercentage / 100)),
      'Brand B': Math.round(total * (brandBPercentage / 100)),
      total
    }));
  };
  
  const splitFunnelData = calculateBrandData(brandSplit);
  
  // Base revenue constant
  const baseRevenue = 4500000;
  
  // Revenue funnel data - NEW
  const revenueFunnelData = [
    {
      id: 'Revenue',
      value: Math.round(baseRevenue * revenueSplit / 100),
      label: 'Revenue'
    },
    {
      id: 'After Ad Spend',
      value: Math.round(baseRevenue * revenueSplit / 100 * 0.8),
      label: 'After Ad Spend'
    },
    {
      id: 'After Shipping',
      value: Math.round(baseRevenue * revenueSplit / 100 * 0.7),
      label: 'After Shipping'
    },
    {
      id: 'After COGS',
      value: Math.round(baseRevenue * revenueSplit / 100 * 0.4),
      label: 'After COGS'
    },
    {
      id: 'Profit',
      value: Math.round(baseRevenue * revenueSplit / 100 * 0.3),
      label: 'Net Profit'
    }
  ];

  const revenueFunnelDataBrandB = [
    {
      id: 'Revenue',
      value: Math.round(baseRevenue * (100 - revenueSplit) / 100),
      label: 'Revenue'
    },
    {
      id: 'After Ad Spend',
      value: Math.round(baseRevenue * (100 - revenueSplit) / 100 * 0.8),
      label: 'After Ad Spend'
    },
    {
      id: 'After Shipping',
      value: Math.round(baseRevenue * (100 - revenueSplit) / 100 * 0.7),
      label: 'After Shipping'
    },
    {
      id: 'After COGS',
      value: Math.round(baseRevenue * (100 - revenueSplit) / 100 * 0.4),
      label: 'After COGS'
    },
    {
      id: 'Profit',
      value: Math.round(baseRevenue * (100 - revenueSplit) / 100 * 0.3),
      label: 'Net Profit'
    }
  ];
  
  // Data for the original funnel visualization
  const funnelData = [
    {
      id: 'Website Visitors',
      value: 12450,
      label: 'Website Visitors'
    },
    {
      id: 'Product Views',
      value: 8234,
      label: 'Product Views'
    },
    {
      id: 'Add to Cart',
      value: 4512,
      label: 'Add to Cart'
    },
    {
      id: 'Checkout',
      value: 2341,
      label: 'Checkout'
    },
    {
      id: 'Purchase',
      value: 1687,
      label: 'Purchase'
    }
  ];

  // Customer Retention Rate data - NEW
  const retentionData = [
    {
      id: "retention",
      color: "hsl(160, 70%, 50%)",
      data: [
        { x: "Jan", y: 92 },
        { x: "Feb", y: 89 },
        { x: "Mar", y: 91 },
        { x: "Apr", y: 88 },
        { x: "May", y: 90 },
        { x: "Jun", y: 93 },
        { x: "Jul", y: 94 },
        { x: "Aug", y: 91 },
        { x: "Sep", y: 92 },
        { x: "Oct", y: 95 },
        { x: "Nov", y: 94 },
        { x: "Dec", y: 96 }
      ]
    },
    {
      id: "new_customers",
      color: "hsl(220, 70%, 50%)",
      data: [
        { x: "Jan", y: 15 },
        { x: "Feb", y: 18 },
        { x: "Mar", y: 22 },
        { x: "Apr", y: 19 },
        { x: "May", y: 25 },
        { x: "Jun", y: 28 },
        { x: "Jul", y: 24 },
        { x: "Aug", y: 26 },
        { x: "Sep", y: 23 },
        { x: "Oct", y: 29 },
        { x: "Nov", y: 31 },
        { x: "Dec", y: 35 }
      ]
    }
  ];

  // Heatmap data for weekly activity
  const heatmapData = [
    { id: "Monday", data: [
      { x: "9AM", y: 45 }, { x: "10AM", y: 68 }, { x: "11AM", y: 82 }, { x: "12PM", y: 72 },
      { x: "1PM", y: 55 }, { x: "2PM", y: 78 }, { x: "3PM", y: 88 }, { x: "4PM", y: 92 }, { x: "5PM", y: 65 }
    ]},
    { id: "Tuesday", data: [
      { x: "9AM", y: 52 }, { x: "10AM", y: 72 }, { x: "11AM", y: 88 }, { x: "12PM", y: 78 },
      { x: "1PM", y: 58 }, { x: "2PM", y: 82 }, { x: "3PM", y: 92 }, { x: "4PM", y: 88 }, { x: "5PM", y: 68 }
    ]},
    { id: "Wednesday", data: [
      { x: "9AM", y: 48 }, { x: "10AM", y: 75 }, { x: "11AM", y: 85 }, { x: "12PM", y: 75 },
      { x: "1PM", y: 52 }, { x: "2PM", y: 85 }, { x: "3PM", y: 95 }, { x: "4PM", y: 90 }, { x: "5PM", y: 70 }
    ]},
    { id: "Thursday", data: [
      { x: "9AM", y: 55 }, { x: "10AM", y: 78 }, { x: "11AM", y: 90 }, { x: "12PM", y: 80 },
      { x: "1PM", y: 60 }, { x: "2PM", y: 88 }, { x: "3PM", y: 98 }, { x: "4PM", y: 95 }, { x: "5PM", y: 72 }
    ]},
    { id: "Friday", data: [
      { x: "9AM", y: 42 }, { x: "10AM", y: 65 }, { x: "11AM", y: 78 }, { x: "12PM", y: 68 },
      { x: "1PM", y: 48 }, { x: "2PM", y: 72 }, { x: "3PM", y: 82 }, { x: "4PM", y: 78 }, { x: "5PM", y: 55 }
    ]}
  ];

  const refreshData = () => {
    setIsLoading(true);
    setTimeout(() => {
      // Simulate data refresh
      setAnalyticsData({
        revenue: Math.floor(Math.random() * 200000) + 800000,
        revenueChange: (Math.random() * 30 - 10).toFixed(1),
        orders: Math.floor(Math.random() * 500) + 1000,
        ordersChange: (Math.random() * 20 - 5).toFixed(1),
        customers: Math.floor(Math.random() * 200) + 400,
        customersChange: (Math.random() * 15 - 5).toFixed(1),
        products: Math.floor(Math.random() * 30) + 80,
        productsChange: (Math.random() * 10).toFixed(1)
      });
      setIsLoading(false);
    }, 1000);
  };

  // Draw funnel graph when component mounts or revenueSplit changes
  useEffect(() => {
    // Wait for FunnelGraph to be available
    const checkAndDraw = () => {
      const container = document.getElementById('unified-funnel');
      if (container && typeof window !== 'undefined' && window.FunnelGraph) {
        try {
          // Clear previous content
          container.innerHTML = '';
          
          // Create funnel data with brand split
          const funnelData = {
            labels: ['Revenue', 'After Ad Spend', 'After Shipping', 'After COGS', 'Profit'],
            subLabels: ['Brand A', 'Brand B'],
            colors: [
              ['#a855f7', '#06b6d4'],
              ['#9333ea', '#0891b2'],
              ['#7c3aed', '#0e7490'],
              ['#6d28d9', '#155e75'],
              ['#5b21b6', '#164e63']
            ],
            values: [
              [Math.round(baseRevenue * revenueSplit / 100), Math.round(baseRevenue * (100 - revenueSplit) / 100)],
              [Math.round(baseRevenue * 0.8 * revenueSplit / 100), Math.round(baseRevenue * 0.8 * (100 - revenueSplit) / 100)],
              [Math.round(baseRevenue * 0.7 * revenueSplit / 100), Math.round(baseRevenue * 0.7 * (100 - revenueSplit) / 100)],
              [Math.round(baseRevenue * 0.4 * revenueSplit / 100), Math.round(baseRevenue * 0.4 * (100 - revenueSplit) / 100)],
              [Math.round(baseRevenue * 0.3 * revenueSplit / 100), Math.round(baseRevenue * 0.3 * (100 - revenueSplit) / 100)]
            ]
          };
          
          // Create and draw the funnel
          const graph = new window.FunnelGraph({
            container: '#unified-funnel',
            gradientDirection: 'vertical',
            data: funnelData,
            displayPercent: true,
            direction: 'vertical',
            width: 400,
            height: 300,
            subLabelValue: 'raw'
          });
          
          graph.draw();
          
          // Add custom styling and animations
          setTimeout(() => {
            const svgElement = container.querySelector('svg');
            if (svgElement) {
              svgElement.style.filter = 'drop-shadow(0 4px 6px rgba(0, 0, 0, 0.1))';
              svgElement.style.transition = 'all 0.3s ease';
            }
            
            // Style the funnel segments
            const paths = container.querySelectorAll('path');
            paths.forEach(path => {
              path.style.transition = 'all 0.3s ease';
              path.style.cursor = 'pointer';
              
              // Add hover effects
              path.addEventListener('mouseenter', function() {
                this.style.filter = 'brightness(1.2)';
                this.style.transform = 'scale(1.02)';
                this.style.transformOrigin = 'center';
              });
              
              path.addEventListener('mouseleave', function() {
                this.style.filter = 'brightness(1)';
                this.style.transform = 'scale(1)';
              });
            });
            
            // Style the text elements
            const textElements = container.querySelectorAll('text');
            textElements.forEach(text => {
              text.style.fill = '#ffffff';
              text.style.fontWeight = '600';
              text.style.fontSize = '11px';
              text.style.textShadow = '0 1px 2px rgba(0, 0, 0, 0.4)';
            });
            
            // Style percentage labels
            const percentLabels = container.querySelectorAll('.label__percentage');
            percentLabels.forEach(label => {
              label.style.fill = '#ffffff';
              label.style.opacity = '0.9';
              label.style.fontSize = '10px';
              label.style.fontWeight = '500';
            });
            
            // Style value labels
            const valueLabels = container.querySelectorAll('.label__value');
            valueLabels.forEach(label => {
              label.style.fill = '#ffffff';
              label.style.fontSize = '10px';
              label.style.fontWeight = '600';
            });
            
            // Add subtle animation on load
            const allPaths = container.querySelectorAll('path');
            allPaths.forEach((path, index) => {
              path.style.opacity = '0';
              path.style.animation = `fadeInScale 0.5s ease-out ${index * 0.1}s forwards`;
            });
            
            // Add animation keyframes
            if (!document.querySelector('#funnel-animations')) {
              const style = document.createElement('style');
              style.id = 'funnel-animations';
              style.textContent = `
                @keyframes fadeInScale {
                  from {
                    opacity: 0;
                    transform: scale(0.95);
                  }
                  to {
                    opacity: 1;
                    transform: scale(1);
                  }
                }
                
                #unified-funnel path {
                  filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.2));
                }
                
                #unified-funnel .label__percentage,
                #unified-funnel .label__value {
                  pointer-events: none;
                }
                
                #unified-funnel svg {
                  overflow: visible;
                }
              `;
              document.head.appendChild(style);
            }
          }, 100);
        } catch (error) {
          console.error('Error drawing funnel graph:', error);
        }
      }
    };
    
    // Try immediately
    checkAndDraw();
    
    // If FunnelGraph is not available yet, wait a bit and try again
    if (!window.FunnelGraph) {
      const timer = setTimeout(checkAndDraw, 500);
      return () => clearTimeout(timer);
    }
  }, [revenueSplit]);

  return (
    <div className="h-full flex flex-col bg-gradient-to-br from-gray-900 via-black to-gray-900 p-4 md:p-6 overflow-auto">
      {/* Header */}
      <div className="glass-card-large p-6 mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="glass-card p-3 rounded-2xl bg-gradient-to-br from-purple-400/20 to-pink-600/20 border-purple-400/30">
              <BarChart3 size={24} className="text-purple-300" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">Analytics Dashboard</h1>
              <p className="text-sm text-white/60 mt-1">Real-time business insights</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <select
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value)}
              className="glass-input px-4 py-2"
            >
              <option value="day">Today</option>
              <option value="week">This Week</option>
              <option value="month">This Month</option>
              <option value="year">This Year</option>
            </select>
            <button
              onClick={refreshData}
              className={`glass-button px-4 py-2 flex items-center gap-2 hover:scale-105 transition-transform ${
                isLoading ? 'animate-pulse' : ''
              }`}
            >
              <RefreshCw size={18} className={isLoading ? 'animate-spin' : ''} />
              Refresh
            </button>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="glass-card-large p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-white/60">Total Revenue</p>
              <p className="text-2xl font-bold text-white mt-1">
                {analyticsData.revenue.toLocaleString()} Ft
              </p>
              <div className={`flex items-center gap-1 mt-2 text-sm ${
                analyticsData.revenueChange > 0 ? 'text-green-400' : 'text-red-400'
              }`}>
                {analyticsData.revenueChange > 0 ? <ArrowUp size={14} /> : <ArrowDown size={14} />}
                <span>{Math.abs(analyticsData.revenueChange)}%</span>
              </div>
            </div>
            <div className="glass-card p-3 rounded-xl bg-gradient-to-br from-green-500/20 to-emerald-500/20">
              <DollarSign size={24} className="text-green-400" />
            </div>
          </div>
        </div>

        <div className="glass-card-large p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-white/60">Total Orders</p>
              <p className="text-2xl font-bold text-white mt-1">
                {analyticsData.orders.toLocaleString()}
              </p>
              <div className={`flex items-center gap-1 mt-2 text-sm ${
                analyticsData.ordersChange > 0 ? 'text-green-400' : 'text-red-400'
              }`}>
                {analyticsData.ordersChange > 0 ? <ArrowUp size={14} /> : <ArrowDown size={14} />}
                <span>{Math.abs(analyticsData.ordersChange)}%</span>
              </div>
            </div>
            <div className="glass-card p-3 rounded-xl bg-gradient-to-br from-blue-500/20 to-cyan-500/20">
              <ShoppingCart size={24} className="text-blue-400" />
            </div>
          </div>
        </div>

        <div className="glass-card-large p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-white/60">Customers</p>
              <p className="text-2xl font-bold text-white mt-1">
                {analyticsData.customers.toLocaleString()}
              </p>
              <div className={`flex items-center gap-1 mt-2 text-sm ${
                analyticsData.customersChange > 0 ? 'text-green-400' : 'text-red-400'
              }`}>
                {analyticsData.customersChange > 0 ? <ArrowUp size={14} /> : <ArrowDown size={14} />}
                <span>{Math.abs(analyticsData.customersChange)}%</span>
              </div>
            </div>
            <div className="glass-card p-3 rounded-xl bg-gradient-to-br from-purple-500/20 to-pink-500/20">
              <Users size={24} className="text-purple-400" />
            </div>
          </div>
        </div>

        <div className="glass-card-large p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-white/60">Products</p>
              <p className="text-2xl font-bold text-white mt-1">
                {analyticsData.products.toLocaleString()}
              </p>
              <div className={`flex items-center gap-1 mt-2 text-sm ${
                analyticsData.productsChange > 0 ? 'text-green-400' : 'text-red-400'
              }`}>
                {analyticsData.productsChange > 0 ? <ArrowUp size={14} /> : <ArrowDown size={14} />}
                <span>{Math.abs(analyticsData.productsChange)}%</span>
              </div>
            </div>
            <div className="glass-card p-3 rounded-xl bg-gradient-to-br from-orange-500/20 to-yellow-500/20">
              <Package size={24} className="text-orange-400" />
            </div>
          </div>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Line Chart - Sales Trend */}
        <div className="glass-card-large p-6">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <TrendingUp size={20} className="text-purple-400" />
            Sales & Costs Trend
          </h3>
          <div style={{ height: '300px' }}>
            <ResponsiveLine
              data={salesData}
              theme={glassTheme}
              margin={{ top: 20, right: 20, bottom: 50, left: 60 }}
              xScale={{ type: 'point' }}
              yScale={{ type: 'linear', min: 'auto', max: 'auto', stacked: false }}
              axisTop={null}
              axisRight={null}
              axisBottom={{
                tickSize: 5,
                tickPadding: 5,
                tickRotation: 0,
                legend: 'Month',
                legendOffset: 36,
                legendPosition: 'middle'
              }}
              axisLeft={{
                tickSize: 5,
                tickPadding: 5,
                tickRotation: 0,
                legend: 'Amount (Ft)',
                legendOffset: -40,
                legendPosition: 'middle',
                format: value => `${value / 1000}k`
              }}
              colors={['#a855f7', '#fb923c']}
              pointSize={10}
              pointColor={{ theme: 'background' }}
              pointBorderWidth={2}
              pointBorderColor={{ from: 'serieColor' }}
              pointLabelYOffset={-12}
              useMesh={true}
              legends={[
                {
                  anchor: 'top',
                  direction: 'row',
                  justify: false,
                  translateX: 0,
                  translateY: -20,
                  itemsSpacing: 0,
                  itemDirection: 'left-to-right',
                  itemWidth: 80,
                  itemHeight: 20,
                  itemOpacity: 0.75,
                  symbolSize: 12,
                  symbolShape: 'circle',
                  symbolBorderColor: 'rgba(0, 0, 0, .5)',
                  effects: [
                    {
                      on: 'hover',
                      style: {
                        itemBackground: 'rgba(0, 0, 0, .03)',
                        itemOpacity: 1
                      }
                    }
                  ]
                }
              ]}
              animate={true}
              motionConfig="gentle"
            />
          </div>
        </div>

        {/* Pie Chart - Category Distribution */}
        <div className="glass-card-large p-6">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <PieChart size={20} className="text-blue-400" />
            Sales by Category
          </h3>
          <div style={{ height: '300px' }}>
            <ResponsivePie
              data={categoryData}
              theme={glassTheme}
              margin={{ top: 20, right: 80, bottom: 20, left: 80 }}
              innerRadius={0.5}
              padAngle={0.7}
              cornerRadius={3}
              activeOuterRadiusOffset={8}
              colors={{ scheme: 'paired' }}
              borderWidth={1}
              borderColor={{ from: 'color', modifiers: [['darker', 0.2]] }}
              arcLinkLabelsSkipAngle={10}
              arcLinkLabelsTextColor="#ffffff"
              arcLinkLabelsThickness={2}
              arcLinkLabelsColor={{ from: 'color' }}
              arcLabelsSkipAngle={10}
              arcLabelsTextColor="#ffffff"
              animate={true}
              motionConfig="gentle"
            />
          </div>
        </div>
      </div>

      {/* Bar Chart - Product Performance */}
      <div className="glass-card-large p-6 mb-6">
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <Package size={20} className="text-green-400" />
          Top Product Performance
        </h3>
        <div style={{ height: '300px' }}>
          <ResponsiveBar
            data={productPerformance}
            theme={glassTheme}
            keys={['sales', 'profit']}
            indexBy="product"
            margin={{ top: 20, right: 130, bottom: 50, left: 60 }}
            padding={0.3}
            valueScale={{ type: 'linear' }}
            indexScale={{ type: 'band', round: true }}
            colors={['#60a5fa', '#34d399']}
            borderColor={{ from: 'color', modifiers: [['darker', 1.6]] }}
            axisTop={null}
            axisRight={null}
            axisBottom={{
              tickSize: 5,
              tickPadding: 5,
              tickRotation: -15,
              legend: 'Product',
              legendPosition: 'middle',
              legendOffset: 40
            }}
            axisLeft={{
              tickSize: 5,
              tickPadding: 5,
              tickRotation: 0,
              legend: 'Value',
              legendPosition: 'middle',
              legendOffset: -40
            }}
            labelSkipWidth={12}
            labelSkipHeight={12}
            labelTextColor="#ffffff"
            legends={[
              {
                dataFrom: 'keys',
                anchor: 'bottom-right',
                direction: 'column',
                justify: false,
                translateX: 120,
                translateY: 0,
                itemsSpacing: 2,
                itemWidth: 100,
                itemHeight: 20,
                itemDirection: 'left-to-right',
                itemOpacity: 0.85,
                symbolSize: 20,
                effects: [
                  {
                    on: 'hover',
                    style: {
                      itemOpacity: 1
                    }
                  }
                ]
              }
            ]}
            animate={true}
            motionConfig="gentle"
          />
        </div>
      </div>

      {/* Funnel and Radar Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Split Funnel Chart - Brand Comparison */}
        <div className="glass-card-large p-6">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <Target size={20} className="text-pink-400" />
            Brand Comparison Funnel
          </h3>
          
          {/* Brand Split Slider */}
          <div className="mb-4">
            <div className="flex items-center justify-between text-xs text-white/60 mb-2">
              <span className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-purple-500"></div>
                Brand A: {brandSplit}%
              </span>
              <span className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-cyan-500"></div>
                Brand B: {100 - brandSplit}%
              </span>
            </div>
            <input
              type="range"
              min="10"
              max="90"
              value={brandSplit}
              onChange={(e) => setBrandSplit(Number(e.target.value))}
              className="w-full h-2 bg-white/20 rounded-lg appearance-none cursor-pointer slider"
              style={{
                background: `linear-gradient(to right, #a855f7 0%, #a855f7 ${brandSplit}%, #06b6d4 ${brandSplit}%, #06b6d4 100%)`
              }}
            />
          </div>
          
          {/* Custom Split Funnel Visualization */}
          <div className="space-y-3">
            {splitFunnelData.map((level, index) => {
              const maxWidth = index === 0 ? 100 : (funnelTotals[level.stage] / funnelTotals['Website Visitors']) * 100;
              const brandAWidth = (level['Brand A'] / level.total) * 100;
              const brandBWidth = (level['Brand B'] / level.total) * 100;
              
              return (
                <div key={level.stage} className="relative">
                  <div className="text-xs text-white/60 mb-1">{level.stage}</div>
                  <div 
                    className="relative h-12 rounded-lg overflow-hidden flex transition-all duration-300"
                    style={{ width: `${maxWidth}%`, margin: '0 auto' }}
                  >
                    {/* Brand A */}
                    <div 
                      className="bg-gradient-to-r from-purple-600 to-purple-500 flex items-center justify-center transition-all duration-300 hover:brightness-110"
                      style={{ width: `${brandAWidth}%` }}
                      title={`Brand A: ${level['Brand A'].toLocaleString()}`}
                    >
                      <span className="text-white text-xs font-medium px-1 truncate">
                        {level['Brand A'] > 500 ? level['Brand A'].toLocaleString() : ''}
                      </span>
                    </div>
                    
                    {/* Separator */}
                    <div className="w-0.5 bg-white/30"></div>
                    
                    {/* Brand B */}
                    <div 
                      className="bg-gradient-to-r from-cyan-600 to-cyan-500 flex items-center justify-center transition-all duration-300 hover:brightness-110"
                      style={{ width: `${brandBWidth}%` }}
                      title={`Brand B: ${level['Brand B'].toLocaleString()}`}
                    >
                      <span className="text-white text-xs font-medium px-1 truncate">
                        {level['Brand B'] > 500 ? level['Brand B'].toLocaleString() : ''}
                      </span>
                    </div>
                  </div>
                  
                  {/* Total value */}
                  <div className="text-right text-xs text-white/40 mt-1">
                    Total: {level.total.toLocaleString()}
                  </div>
                </div>
              );
            })}
          </div>
          
          {/* Metrics */}
          <div className="mt-6 grid grid-cols-2 gap-4">
            <div className="glass-card p-3 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-white/60">Brand A</span>
                <div className="w-3 h-3 rounded-full bg-purple-500"></div>
              </div>
              <div className="text-sm font-bold text-purple-400">
                Conversion: {((splitFunnelData[4]['Brand A'] / splitFunnelData[0]['Brand A']) * 100).toFixed(1)}%
              </div>
              <div className="text-xs text-white/50 mt-1">
                {splitFunnelData[4]['Brand A'].toLocaleString()} purchases
              </div>
            </div>
            
            <div className="glass-card p-3 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-white/60">Brand B</span>
                <div className="w-3 h-3 rounded-full bg-cyan-500"></div>
              </div>
              <div className="text-sm font-bold text-cyan-400">
                Conversion: {((splitFunnelData[4]['Brand B'] / splitFunnelData[0]['Brand B']) * 100).toFixed(1)}%
              </div>
              <div className="text-xs text-white/50 mt-1">
                {splitFunnelData[4]['Brand B'].toLocaleString()} purchases
              </div>
            </div>
          </div>
        </div>
        
        {/* Radar Chart - Employee Performance */}
        <div className="glass-card-large p-6">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <Users size={20} className="text-yellow-400" />
            Employee Performance
          </h3>
          <div style={{ height: '300px' }}>
            <ResponsiveRadar
              data={performanceData}
              theme={glassTheme}
              keys={['John', 'Sarah', 'Mike', 'Emma', 'David']}
              indexBy="metric"
              valueFormat=">-.2f"
              margin={{ top: 70, right: 80, bottom: 40, left: 80 }}
              borderColor={{ from: 'color' }}
              gridLabelOffset={36}
              dotSize={10}
              dotColor={{ theme: 'background' }}
              dotBorderWidth={2}
              colors={{ scheme: 'paired' }}
              blendMode="multiply"
              motionConfig="gentle"
              legends={[
                {
                  anchor: 'top',
                  direction: 'row',
                  translateY: -50,
                  itemWidth: 80,
                  itemHeight: 20,
                  itemTextColor: '#ffffff',
                  symbolSize: 12,
                  symbolShape: 'circle',
                  effects: [
                    {
                      on: 'hover',
                      style: {
                        itemTextColor: '#ffffff'
                      }
                    }
                  ]
                }
              ]}
            />
          </div>
        </div>
      </div>

      {/* Single Funnel with Brand Split - NEW APPROACH */}
      <div className="glass-card-large p-6 mb-6">
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <Target size={20} className="text-orange-400" />
          Unified Brand Revenue Funnel
        </h3>
        
        {/* Revenue Split Slider for Single Funnel */}
        <div className="mb-6">
          <div className="flex items-center justify-between text-xs text-white/60 mb-2">
            <span className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-purple-500"></div>
              Brand A: {revenueSplit}%
            </span>
            <span className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-cyan-500"></div>
              Brand B: {100 - revenueSplit}%
            </span>
          </div>
          <input
            type="range"
            min="10"
            max="90"
            value={revenueSplit}
            onChange={(e) => setRevenueSplit(Number(e.target.value))}
            className="w-full h-2 bg-white/20 rounded-lg appearance-none cursor-pointer slider"
            style={{
              background: `linear-gradient(to right, #a855f7 0%, #a855f7 ${revenueSplit}%, #06b6d4 ${revenueSplit}%, #06b6d4 100%)`
            }}
          />
        </div>

        {/* Funnel Graph JS Implementation */}
        <div className="funnel-container" style={{ height: '350px' }}>
          <div id="unified-funnel" className="flex justify-center items-center h-full" />
        </div>

        {/* Brand Breakdown Summary */}
        <div className="mt-6 grid grid-cols-2 gap-4">
          <div className="glass-card p-4 rounded-xl bg-gradient-to-br from-purple-500/10 to-purple-600/10">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-medium text-purple-400">Brand A ({revenueSplit}%)</span>
              <div className="w-3 h-3 rounded-full bg-purple-500"></div>
            </div>
            <div className="space-y-2 text-xs">
              <div className="flex justify-between text-white/60">
                <span>Revenue:</span>
                <span className="text-purple-400">{Math.round(baseRevenue * revenueSplit / 100).toLocaleString()} Ft</span>
              </div>
              <div className="flex justify-between text-white/60">
                <span>Final Profit:</span>
                <span className="text-green-400 font-semibold">{Math.round(baseRevenue * 0.3 * revenueSplit / 100).toLocaleString()} Ft</span>
              </div>
            </div>
          </div>
          
          <div className="glass-card p-4 rounded-xl bg-gradient-to-br from-cyan-500/10 to-cyan-600/10">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-medium text-cyan-400">Brand B ({100 - revenueSplit}%)</span>
              <div className="w-3 h-3 rounded-full bg-cyan-500"></div>
            </div>
            <div className="space-y-2 text-xs">
              <div className="flex justify-between text-white/60">
                <span>Revenue:</span>
                <span className="text-cyan-400">{Math.round(baseRevenue * (100 - revenueSplit) / 100).toLocaleString()} Ft</span>
              </div>
              <div className="flex justify-between text-white/60">
                <span>Final Profit:</span>
                <span className="text-green-400 font-semibold">{Math.round(baseRevenue * 0.3 * (100 - revenueSplit) / 100).toLocaleString()} Ft</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Revenue Funnel Section - NEW */}
      <div className="glass-card-large p-6 mb-6">
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <DollarSign size={20} className="text-green-400" />
          Revenue Breakdown by Brand (Side by Side)
        </h3>
        
        {/* Revenue Split Slider */}
        <div className="mb-6">
          <div className="flex items-center justify-between text-xs text-white/60 mb-2">
            <span className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-purple-500"></div>
              Brand A Revenue: {revenueSplit}%
            </span>
            <span className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-cyan-500"></div>
              Brand B Revenue: {100 - revenueSplit}%
            </span>
          </div>
          <input
            type="range"
            min="10"
            max="90"
            value={revenueSplit}
            onChange={(e) => setRevenueSplit(Number(e.target.value))}
            className="w-full h-2 bg-white/20 rounded-lg appearance-none cursor-pointer slider"
            style={{
              background: `linear-gradient(to right, #a855f7 0%, #a855f7 ${revenueSplit}%, #06b6d4 ${revenueSplit}%, #06b6d4 100%)`
            }}
          />
        </div>
        
        {/* Nivo Funnel Charts Side by Side */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Brand A Funnel */}
          <div>
            <div className="text-sm font-medium text-purple-400 mb-3 text-center">Brand A</div>
            <div style={{ height: '400px' }}>
              <ResponsiveFunnel
                data={revenueFunnelData}
                theme={glassTheme}
                margin={{ top: 20, right: 20, bottom: 20, left: 20 }}
                shapeBlending={0.66}
                valueFormat=" >-.0f"
                colors={['#a855f7', '#d946ef', '#c026d3', '#9333ea', '#7c3aed']}
                borderWidth={20}
                borderColor={{ from: 'color', modifiers: [['darker', 0.3]] }}
                borderOpacity={0.5}
                labelColor={{ from: 'color', modifiers: [['brighter', 3]] }}
                beforeSeparatorLength={100}
                beforeSeparatorOffset={20}
                afterSeparatorLength={100}
                afterSeparatorOffset={20}
                currentPartSizeExtension={10}
                currentBorderWidth={40}
                motionConfig="gentle"
                isInteractive={true}
                enableLabel={true}
                animate={true}
              />
            </div>
            <div className="mt-4 space-y-2 text-xs">
              <div className="flex justify-between text-white/60">
                <span>Revenue:</span>
                <span className="text-purple-400 font-semibold">{Math.round(4500000 * revenueSplit / 100).toLocaleString()} Ft</span>
              </div>
              <div className="flex justify-between text-white/60">
                <span>Ad Spend:</span>
                <span className="text-orange-400">-{Math.round(900000 * revenueSplit / 100).toLocaleString()} Ft</span>
              </div>
              <div className="flex justify-between text-white/60">
                <span>Shipping:</span>
                <span className="text-yellow-400">-{Math.round(450000 * revenueSplit / 100).toLocaleString()} Ft</span>
              </div>
              <div className="flex justify-between text-white/60">
                <span>COGS:</span>
                <span className="text-red-400">-{Math.round(1800000 * revenueSplit / 100).toLocaleString()} Ft</span>
              </div>
              <div className="flex justify-between text-white/60 pt-2 border-t border-white/20">
                <span className="font-semibold">Profit:</span>
                <span className="text-green-400 font-bold">{Math.round(1350000 * revenueSplit / 100).toLocaleString()} Ft</span>
              </div>
            </div>
          </div>
          
          {/* Brand B Funnel */}
          <div>
            <div className="text-sm font-medium text-cyan-400 mb-3 text-center">Brand B</div>
            <div style={{ height: '400px' }}>
              <ResponsiveFunnel
                data={revenueFunnelDataBrandB}
                theme={glassTheme}
                margin={{ top: 20, right: 20, bottom: 20, left: 20 }}
                shapeBlending={0.66}
                valueFormat=" >-.0f"
                colors={['#06b6d4', '#0891b2', '#0e7490', '#155e75', '#164e63']}
                borderWidth={20}
                borderColor={{ from: 'color', modifiers: [['darker', 0.3]] }}
                borderOpacity={0.5}
                labelColor={{ from: 'color', modifiers: [['brighter', 3]] }}
                beforeSeparatorLength={100}
                beforeSeparatorOffset={20}
                afterSeparatorLength={100}
                afterSeparatorOffset={20}
                currentPartSizeExtension={10}
                currentBorderWidth={40}
                motionConfig="gentle"
                isInteractive={true}
                enableLabel={true}
                animate={true}
              />
            </div>
            <div className="mt-4 space-y-2 text-xs">
              <div className="flex justify-between text-white/60">
                <span>Revenue:</span>
                <span className="text-cyan-400 font-semibold">{Math.round(4500000 * (100 - revenueSplit) / 100).toLocaleString()} Ft</span>
              </div>
              <div className="flex justify-between text-white/60">
                <span>Ad Spend:</span>
                <span className="text-orange-400">-{Math.round(900000 * (100 - revenueSplit) / 100).toLocaleString()} Ft</span>
              </div>
              <div className="flex justify-between text-white/60">
                <span>Shipping:</span>
                <span className="text-yellow-400">-{Math.round(450000 * (100 - revenueSplit) / 100).toLocaleString()} Ft</span>
              </div>
              <div className="flex justify-between text-white/60">
                <span>COGS:</span>
                <span className="text-red-400">-{Math.round(1800000 * (100 - revenueSplit) / 100).toLocaleString()} Ft</span>
              </div>
              <div className="flex justify-between text-white/60 pt-2 border-t border-white/20">
                <span className="font-semibold">Profit:</span>
                <span className="text-green-400 font-bold">{Math.round(1350000 * (100 - revenueSplit) / 100).toLocaleString()} Ft</span>
              </div>
            </div>
          </div>
        </div>
        
        {/* Combined Totals */}
        <div className="mt-6 glass-card p-4 rounded-xl bg-gradient-to-r from-purple-500/10 to-cyan-500/10">
          <div className="grid grid-cols-5 gap-4 text-center">
            <div>
              <div className="text-xs text-white/60">Total Revenue</div>
              <div className="text-lg font-bold text-white">4,500,000 Ft</div>
            </div>
            <div>
              <div className="text-xs text-white/60">Total Ad Spend</div>
              <div className="text-lg font-bold text-orange-400">-900,000 Ft</div>
            </div>
            <div>
              <div className="text-xs text-white/60">Total Shipping</div>
              <div className="text-lg font-bold text-yellow-400">-450,000 Ft</div>
            </div>
            <div>
              <div className="text-xs text-white/60">Total COGS</div>
              <div className="text-lg font-bold text-red-400">-1,800,000 Ft</div>
            </div>
            <div>
              <div className="text-xs text-white/60">Total Profit</div>
              <div className="text-lg font-bold text-green-400">1,350,000 Ft</div>
            </div>
          </div>
        </div>
      </div>

      {/* Customer Retention Rate Chart - NEW */}
      <div className="glass-card-large p-6 mb-6">
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <Users size={20} className="text-emerald-400" />
          Customer Retention & Growth
        </h3>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
          <div className="glass-card p-4 rounded-xl bg-gradient-to-br from-emerald-500/10 to-green-600/10">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-white/60">Avg Retention Rate</p>
                <p className="text-2xl font-bold text-emerald-400 mt-1">92.3%</p>
                <p className="text-xs text-white/50 mt-2">Industry avg: 85%</p>
              </div>
              <div className="glass-card p-3 rounded-xl bg-gradient-to-br from-emerald-500/20 to-green-500/20">
                <TrendingUp size={24} className="text-emerald-400" />
              </div>
            </div>
          </div>
          
          <div className="glass-card p-4 rounded-xl bg-gradient-to-br from-blue-500/10 to-indigo-600/10">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-white/60">Customer Lifetime Value</p>
                <p className="text-2xl font-bold text-blue-400 mt-1">385,000 Ft</p>
                <p className="text-xs text-green-400 mt-2">+12% vs last year</p>
              </div>
              <div className="glass-card p-3 rounded-xl bg-gradient-to-br from-blue-500/20 to-indigo-500/20">
                <DollarSign size={24} className="text-blue-400" />
              </div>
            </div>
          </div>
          
          <div className="glass-card p-4 rounded-xl bg-gradient-to-br from-purple-500/10 to-violet-600/10">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-white/60">Churn Rate</p>
                <p className="text-2xl font-bold text-purple-400 mt-1">7.7%</p>
                <p className="text-xs text-green-400 mt-2">-2.3% improvement</p>
              </div>
              <div className="glass-card p-3 rounded-xl bg-gradient-to-br from-purple-500/20 to-violet-500/20">
                <ArrowDown size={24} className="text-purple-400" />
              </div>
            </div>
          </div>
        </div>
        
        <div style={{ height: '350px' }}>
          <ResponsiveLine
            data={retentionData}
            theme={glassTheme}
            margin={{ top: 20, right: 110, bottom: 50, left: 60 }}
            xScale={{ type: 'point' }}
            yScale={{ 
              type: 'linear', 
              min: 0, 
              max: 100, 
              stacked: false,
              reverse: false
            }}
            yFormat=" >-.1f"
            axisTop={null}
            axisRight={null}
            axisBottom={{
              tickSize: 5,
              tickPadding: 5,
              tickRotation: 0,
              legend: 'Month',
              legendOffset: 36,
              legendPosition: 'middle'
            }}
            axisLeft={{
              tickSize: 5,
              tickPadding: 5,
              tickRotation: 0,
              legend: 'Percentage (%)',
              legendOffset: -45,
              legendPosition: 'middle',
              format: value => `${value}%`
            }}
            colors={['#10b981', '#3b82f6']}
            lineWidth={3}
            pointSize={8}
            pointColor={{ theme: 'background' }}
            pointBorderWidth={2}
            pointBorderColor={{ from: 'serieColor' }}
            pointLabelYOffset={-12}
            enableArea={true}
            areaOpacity={0.15}
            useMesh={true}
            legends={[
              {
                anchor: 'bottom-right',
                direction: 'column',
                justify: false,
                translateX: 100,
                translateY: 0,
                itemsSpacing: 0,
                itemDirection: 'left-to-right',
                itemWidth: 90,
                itemHeight: 23,
                itemOpacity: 0.75,
                symbolSize: 12,
                symbolShape: 'circle',
                symbolBorderColor: 'rgba(0, 0, 0, .5)',
                effects: [
                  {
                    on: 'hover',
                    style: {
                      itemBackground: 'rgba(0, 0, 0, .03)',
                      itemOpacity: 1
                    }
                  }
                ],
                data: [
                  {
                    id: 'retention',
                    label: 'Retention %',
                    color: '#10b981'
                  },
                  {
                    id: 'new_customers',
                    label: 'New Customer %',
                    color: '#3b82f6'
                  }
                ]
              }
            ]}
            animate={true}
            motionConfig="gentle"
            crosshairType="cross"
          />
        </div>
        
        <div className="mt-6 grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="glass-card p-3 rounded-lg">
            <p className="text-xs text-white/60 mb-1">Best Month</p>
            <p className="text-sm font-bold text-emerald-400">December (96%)</p>
          </div>
          <div className="glass-card p-3 rounded-lg">
            <p className="text-xs text-white/60 mb-1">Worst Month</p>
            <p className="text-sm font-bold text-orange-400">April (88%)</p>
          </div>
          <div className="glass-card p-3 rounded-lg">
            <p className="text-xs text-white/60 mb-1">YoY Growth</p>
            <p className="text-sm font-bold text-blue-400">+4.2%</p>
          </div>
          <div className="glass-card p-3 rounded-lg">
            <p className="text-xs text-white/60 mb-1">Q4 Average</p>
            <p className="text-sm font-bold text-purple-400">95%</p>
          </div>
        </div>
      </div>

      {/* Heatmap Section - Full Width */}
      <div className="glass-card-large p-6">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <Activity size={20} className="text-red-400" />
            Weekly Activity Heatmap
          </h3>
          <div style={{ height: '350px' }}>
            <ResponsiveHeatMap
              data={heatmapData}
              theme={glassTheme}
              margin={{ top: 20, right: 90, bottom: 60, left: 90 }}
              valueFormat=">-.2s"
              axisTop={{
                tickSize: 5,
                tickPadding: 5,
                tickRotation: -90,
                legend: '',
                legendOffset: 46
              }}
              axisRight={null}
              axisBottom={null}
              axisLeft={{
                tickSize: 5,
                tickPadding: 5,
                tickRotation: 0,
                legend: 'Day',
                legendPosition: 'middle',
                legendOffset: -72
              }}
              colors={{
                type: 'sequential',
                scheme: 'purple_blue'
              }}
              emptyColor="#555555"
              legends={[
                {
                  anchor: 'right',
                  translateX: 30,
                  translateY: 0,
                  length: 200,
                  thickness: 10,
                  direction: 'column',
                  tickPosition: 'after',
                  tickSize: 3,
                  tickSpacing: 4,
                  tickOverlap: false,
                  tickFormat: '>-.2s',
                  title: 'Activity →',
                  titleAlign: 'start',
                  titleOffset: 4
                }
              ]}
            />
          </div>
      </div>
    </div>
  );
}

export default Analytics;