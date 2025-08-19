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

  // Sales Funnel data
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
        {/* Funnel Chart - Sales Conversion */}
        <div className="glass-card-large p-6">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <Target size={20} className="text-pink-400" />
            Sales Conversion Funnel
          </h3>
          <div style={{ height: '300px' }}>
            <ResponsiveFunnel
              data={funnelData}
              theme={glassTheme}
              margin={{ top: 20, right: 20, bottom: 20, left: 20 }}
              direction="vertical"
              valueFormat=">,.0f"
              colors={{ scheme: 'spectral' }}
              borderWidth={20}
              labelColor={{ from: 'color', modifiers: [['darker', 3]] }}
              beforeSeparatorLength={100}
              beforeSeparatorOffset={20}
              afterSeparatorLength={100}
              afterSeparatorOffset={20}
              currentPartSizeExtension={10}
              currentBorderWidth={20}
              motionConfig="gentle"
            />
          </div>
          <div className="mt-4 grid grid-cols-2 gap-4 text-xs">
            <div className="glass-card p-2 rounded-lg">
              <div className="text-white/60">Conversion Rate</div>
              <div className="text-lg font-bold text-green-400">
                {((1687 / 12450) * 100).toFixed(1)}%
              </div>
            </div>
            <div className="glass-card p-2 rounded-lg">
              <div className="text-white/60">Cart Abandonment</div>
              <div className="text-lg font-bold text-orange-400">
                {((1 - (1687 / 4512)) * 100).toFixed(1)}%
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