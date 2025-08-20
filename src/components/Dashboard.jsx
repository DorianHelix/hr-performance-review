import React, { useState } from 'react';
import { ResponsiveLine } from '@nivo/line';
import { ResponsiveFunnel } from '@nivo/funnel';
import {
  TrendingUp, TrendingDown, ShoppingCart, Users, DollarSign,
  Package, CreditCard, Target, Activity, ArrowUp, ArrowDown
} from 'lucide-react';
import DatePicker from './DatePicker';

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

// KPI Card Component
function KPICard({ title, value, change, icon: Icon, color, prefix = '', suffix = '' }) {
  const isPositive = change >= 0;
  const gradientColors = {
    purple: 'from-purple-400/20 to-purple-600/20 border-purple-400/30',
    blue: 'from-blue-400/20 to-blue-600/20 border-blue-400/30',
    green: 'from-green-400/20 to-green-600/20 border-green-400/30',
    orange: 'from-orange-400/20 to-orange-600/20 border-orange-400/30',
    pink: 'from-pink-400/20 to-pink-600/20 border-pink-400/30',
    cyan: 'from-cyan-400/20 to-cyan-600/20 border-cyan-400/30'
  };

  const iconColors = {
    purple: 'text-purple-300',
    blue: 'text-blue-300',
    green: 'text-green-300',
    orange: 'text-orange-300',
    pink: 'text-pink-300',
    cyan: 'text-cyan-300'
  };

  return (
    <div className="glass-card p-4 group cursor-pointer hover:scale-105 transition-all duration-500">
      <div className="flex items-center justify-between mb-3">
        <div className={`glass-card p-2 rounded-xl bg-gradient-to-br ${gradientColors[color]}`}>
          <Icon className={`w-5 h-5 ${iconColors[color]}`} />
        </div>
        <div className={`flex items-center gap-1 text-sm font-medium ${isPositive ? 'text-green-400' : 'text-red-400'}`}>
          {isPositive ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />}
          {Math.abs(change)}%
        </div>
      </div>
      <div>
        <p className="text-white/60 text-xs mb-1">{title}</p>
        <p className="text-xl font-bold text-white">
          {prefix}{value}{suffix}
        </p>
      </div>
    </div>
  );
}

function Dashboard() {
  const [selectedPeriod, setSelectedPeriod] = useState('Today');
  
  // Sample data for area chart (matching the screenshot style)
  const areaChartData = [
    {
      id: "Revenue",
      color: "hsl(280, 70%, 50%)",
      data: [
        { x: "Aug 14", y: 4480000 },
        { x: "Aug 15", y: 4320000 },
        { x: "Aug 16", y: 3150000 },
        { x: "Aug 17", y: 3600000 },
        { x: "Aug 18", y: 4200000 },
        { x: "Aug 19", y: 2700000 },
        { x: "Aug 20", y: 2250000 }
      ]
    },
    {
      id: "Cost of goods",
      color: "hsl(320, 70%, 50%)",
      data: [
        { x: "Aug 14", y: 1350000 },
        { x: "Aug 15", y: 1440000 },
        { x: "Aug 16", y: 1350000 },
        { x: "Aug 17", y: 1530000 },
        { x: "Aug 18", y: 1620000 },
        { x: "Aug 19", y: 1350000 },
        { x: "Aug 20", y: 1170000 }
      ]
    },
    {
      id: "Ad spend",
      color: "hsl(200, 70%, 50%)",
      data: [
        { x: "Aug 14", y: 900000 },
        { x: "Aug 15", y: 945000 },
        { x: "Aug 16", y: 900000 },
        { x: "Aug 17", y: 855000 },
        { x: "Aug 18", y: 810000 },
        { x: "Aug 19", y: 450000 },
        { x: "Aug 20", y: 405000 }
      ]
    },
    {
      id: "Tax",
      color: "hsl(160, 70%, 50%)",
      data: [
        { x: "Aug 14", y: 450000 },
        { x: "Aug 15", y: 495000 },
        { x: "Aug 16", y: 450000 },
        { x: "Aug 17", y: 540000 },
        { x: "Aug 18", y: 585000 },
        { x: "Aug 19", y: 450000 },
        { x: "Aug 20", y: 360000 }
      ]
    },
    {
      id: "Profit",
      color: "hsl(280, 100%, 60%)",
      data: [
        { x: "Aug 14", y: 1800000 },
        { x: "Aug 15", y: 1440000 },
        { x: "Aug 16", y: 450000 },
        { x: "Aug 17", y: 675000 },
        { x: "Aug 18", y: 990000 },
        { x: "Aug 19", y: 450000 },
        { x: "Aug 20", y: 315000 }
      ]
    }
  ];

  // Funnel data (Revenue breakdown by channel)
  const funnelData = [
    {
      id: "Revenue",
      value: 3197708.04,
      label: "REVENUE"
    },
    {
      id: "Cost of Goods",
      value: 406615.56,
      label: "COST OF GOODS"
    },
    {
      id: "Facebook",
      value: 448329.00,
      label: "FACEBOOK"
    },
    {
      id: "Google",
      value: 307929.91,
      label: "GOOGLE"
    },
    {
      id: "TikTok",
      value: 37937.00,
      label: "TIKTOK"
    },
    {
      id: "Tax",
      value: 635720.89,
      label: "TAX"
    },
    {
      id: "Custom Costs",
      value: 290610.00,
      label: "CUSTOM COSTS"
    },
    {
      id: "Profit",
      value: 1070565.69,
      label: "PROFIT"
    }
  ];

  // Brand data for legends
  const brands = [
    { label: 'Mancsplaza.hu', color: 'hsl(280, 70%, 50%)' },
    { label: 'driubar.hu', color: 'hsl(320, 70%, 50%)' },
    { label: 'driubar.ro', color: 'hsl(200, 70%, 50%)' },
    { label: 'Basket.hu', color: 'hsl(160, 70%, 50%)' },
    { label: 'Blamini.hu', color: 'hsl(30, 70%, 50%)' }
  ];

  return (
    <div className="flex h-full flex-col p-6 overflow-auto">
      {/* Header Section with KPIs */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-white mb-2">
              Dashboard
            </h1>
            <div className="flex items-center gap-4">
              <div className="text-white/60">
                <span className="text-sm">Total Profit</span>
                <div className="flex items-center gap-2">
                  <span className="text-3xl font-bold text-white">1.07M Ft</span>
                  <span className="text-sm text-white/40">from 222 orders</span>
                </div>
              </div>
              <div className="text-white/60 ml-8">
                <span className="text-sm">eROAS</span>
                <div className="text-2xl font-bold text-white">4.03</div>
              </div>
              <div className="text-white/60 ml-8">
                <span className="text-sm">Profit Margin</span>
                <div className="text-2xl font-bold text-white">33.48%</div>
              </div>
            </div>
          </div>
          <DatePicker value={selectedPeriod} onChange={setSelectedPeriod} />
        </div>

        {/* KPI Cards Row */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
          <KPICard
            title="Revenue"
            value="23.45M"
            suffix=" Ft"
            change={12.5}
            icon={DollarSign}
            color="purple"
          />
          <KPICard
            title="Cost of goods"
            value="4.24M"
            suffix=" Ft"
            change={-8.3}
            icon={Package}
            color="pink"
          />
          <KPICard
            title="Ad spend"
            value="5.72M"
            suffix=" Ft"
            change={15.2}
            icon={Target}
            color="blue"
          />
          <KPICard
            title="Tax"
            value="4.32M"
            suffix=" Ft"
            change={0}
            icon={CreditCard}
            color="cyan"
          />
          <KPICard
            title="Profit"
            value="7.18M"
            suffix=" Ft"
            change={18.7}
            icon={TrendingUp}
            color="green"
          />
          <KPICard
            title="Orders"
            value="1,234"
            change={5.4}
            icon={ShoppingCart}
            color="orange"
          />
        </div>

        {/* Best and Worst Performing Products */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div className="glass-card p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-medium text-white/80">Best Performing Product</h3>
              <TrendingUp className="w-4 h-4 text-green-400" />
            </div>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-lg bg-white/10 flex items-center justify-center">
                <Package className="w-6 h-6 text-white/60" />
              </div>
              <div className="flex-1">
                <p className="text-white font-medium text-sm">Gerincsbarát Anatómiai Párna</p>
                <p className="text-green-400 text-xs">Most profitable product</p>
              </div>
              <div className="text-right">
                <p className="text-white text-sm font-medium">8.22K Ft</p>
                <p className="text-green-400 text-xs">+35.76%</p>
              </div>
            </div>
          </div>

          <div className="glass-card p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-medium text-white/80">Areas of Improvement</h3>
              <TrendingDown className="w-4 h-4 text-red-400" />
            </div>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-lg bg-white/10 flex items-center justify-center">
                <Package className="w-6 h-6 text-white/60" />
              </div>
              <div className="flex-1">
                <p className="text-white font-medium text-sm">Acélmerevítős Derékpárna</p>
                <p className="text-red-400 text-xs">Lowest performing product</p>
              </div>
              <div className="text-right">
                <p className="text-white text-sm font-medium">-15.04K Ft</p>
                <p className="text-red-400 text-xs">-125.31%</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Area Chart */}
        <div className="glass-card-large p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-white">Revenue Overview</h2>
            <select className="glass-card px-3 py-1 text-sm text-white/80 bg-transparent border-none outline-none">
              <option>Daily</option>
              <option>Weekly</option>
              <option>Monthly</option>
            </select>
          </div>
          
          {/* Legend */}
          <div className="flex flex-wrap gap-4 mb-4">
            {brands.map((brand) => (
              <div key={brand.label} className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: brand.color }}></div>
                <span className="text-xs text-white/60">{brand.label}</span>
              </div>
            ))}
          </div>

          <div style={{ height: '400px' }}>
            <ResponsiveLine
              data={areaChartData}
              theme={glassTheme}
              margin={{ top: 20, right: 20, bottom: 60, left: 80 }}
              xScale={{ type: 'point' }}
              yScale={{
                type: 'linear',
                min: 0,
                max: 'auto',
                stacked: false,
                reverse: false
              }}
              yFormat=" >-.2s"
              axisTop={null}
              axisRight={null}
              axisBottom={{
                tickSize: 5,
                tickPadding: 5,
                tickRotation: 0,
                legend: '',
                legendOffset: 36,
                legendPosition: 'middle'
              }}
              axisLeft={{
                tickSize: 5,
                tickPadding: 5,
                tickRotation: 0,
                legend: 'Amount (Ft)',
                legendOffset: -60,
                legendPosition: 'middle',
                format: value => `${(value / 1000000).toFixed(1)}M Ft`
              }}
              enableArea={true}
              areaOpacity={0.15}
              pointSize={6}
              pointColor={{ from: 'color', modifiers: [] }}
              pointBorderWidth={2}
              pointBorderColor={{ from: 'color', modifiers: [] }}
              pointLabelYOffset={-12}
              useMesh={true}
              legends={[]}
              motionConfig="gentle"
              curve="monotoneX"
              enableSlices="x"
            />
          </div>

          {/* Summary Stats */}
          <div className="grid grid-cols-5 gap-2 mt-4">
            <div className="text-center">
              <p className="text-xs text-white/40">Revenue</p>
              <p className="text-sm font-semibold text-white">23.4M Ft</p>
            </div>
            <div className="text-center">
              <p className="text-xs text-white/40">Cost of goods</p>
              <p className="text-sm font-semibold text-white">4.2M Ft</p>
            </div>
            <div className="text-center">
              <p className="text-xs text-white/40">Ad spend</p>
              <p className="text-sm font-semibold text-white">5.7M Ft</p>
            </div>
            <div className="text-center">
              <p className="text-xs text-white/40">Tax</p>
              <p className="text-sm font-semibold text-white">4.3M Ft</p>
            </div>
            <div className="text-center">
              <p className="text-xs text-white/40">Profit</p>
              <p className="text-sm font-semibold text-purple-400">7.2M Ft</p>
            </div>
          </div>
        </div>

        {/* Funnel Chart */}
        <div className="glass-card-large p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-white">Revenue Breakdown</h2>
            <Activity className="w-5 h-5 text-white/40" />
          </div>

          <div style={{ height: '500px' }}>
            <ResponsiveFunnel
              data={funnelData}
              theme={glassTheme}
              margin={{ top: 20, right: 20, bottom: 20, left: 20 }}
              direction="vertical"
              shapeBlending={0.7}
              spacing={8}
              valueFormat=" >-.2s"
              colors={{ scheme: 'purple_blue' }}
              borderWidth={20}
              borderColor={{ from: 'color', modifiers: [['darker', 0.3]] }}
              borderOpacity={0.5}
              labelColor={{
                from: 'color',
                modifiers: [['brighter', 3]]
              }}
              beforeSeparatorLength={100}
              beforeSeparatorOffset={20}
              afterSeparatorLength={100}
              afterSeparatorOffset={20}
              currentPartSizeExtension={10}
              currentBorderWidth={40}
              motionConfig="gentle"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;