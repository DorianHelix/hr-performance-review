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

  // Revenue breakdown funnel data
  const revenueFunnelData = [
    {
      id: 'Revenue',
      value: 3197708,
      label: 'Revenue'
    },
    {
      id: 'After COGS',
      value: 2791092, 
      label: 'After COGS'
    },
    {
      id: 'After Ad Spend',
      value: 1996896,
      label: 'After Ad Spend'
    },
    {
      id: 'After Tax',
      value: 1361175,
      label: 'After Tax'
    },
    {
      id: 'Net Profit',
      value: 1070565,
      label: 'Net Profit'
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
    <div className="flex h-full w-full flex-col p-6 overflow-auto bg-transparent min-h-screen">
      {/* Header Section with KPIs */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-6">
          {/* Profit Metrics Card */}
          <div className="glass-card-large p-4 flex items-center gap-8">
            <div>
              <span className="text-xs text-white/50 uppercase tracking-wider">Total Profit</span>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-3xl font-bold text-white">1.07M Ft</span>
                <span className="text-sm text-white/40">from 222 orders</span>
              </div>
            </div>
            <div className="h-12 w-px bg-white/10"></div>
            <div>
              <span className="text-xs text-white/50 uppercase tracking-wider">eROAS</span>
              <div className="text-2xl font-bold text-green-400 mt-1">4.03</div>
            </div>
            <div className="h-12 w-px bg-white/10"></div>
            <div>
              <span className="text-xs text-white/50 uppercase tracking-wider">Profit Margin</span>
              <div className="text-2xl font-bold text-purple-400 mt-1">33.48%</div>
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

      {/* Daily Product Sales Section */}
      <div className="glass-card-large p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-4">
            <h2 className="text-lg font-semibold text-white">Daily Product Sales</h2>
            <div className="flex items-center gap-2">
              <button className="glass-button px-3 py-1 text-xs hover:scale-105">
                <TrendingUp className="w-3 h-3" />
              </button>
              <button className="glass-button px-3 py-1 text-xs hover:scale-105">
                <Activity className="w-3 h-3" />
              </button>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <input
              type="text"
              placeholder="Search by name..."
              className="glass-input px-3 py-1 text-sm w-64"
            />
            <select className="glass-input px-3 py-1 text-sm">
              <option>Most Profitable</option>
              <option>Best ROAS</option>
              <option>Highest Revenue</option>
              <option>Lowest CPA</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Chart Section */}
          <div>
            <div className="flex items-center gap-4 mb-4">
              {['Revenue', 'Cogs', 'Profit'].map((metric) => (
                <label key={metric} className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" defaultChecked className="rounded" />
                  <span className="text-xs text-white/60">{metric}</span>
                </label>
              ))}
            </div>
            <div style={{ height: '350px', minHeight: '350px', width: '100%' }}>
              <ResponsiveLine
                data={areaChartData.slice(0, 3)}
                theme={glassTheme}
                margin={{ top: 10, right: 10, bottom: 40, left: 60 }}
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
                  legend: '',
                  legendOffset: -40,
                  legendPosition: 'middle',
                  format: value => `${(value / 1000).toFixed(0)}K Ft`
                }}
                enableArea={true}
                areaOpacity={0.15}
                pointSize={0}
                useMesh={true}
                legends={[]}
                motionConfig="gentle"
                curve="monotoneX"
                enableSlices="x"
              />
            </div>
          </div>

          {/* Product Performance Table */}
          <div className="overflow-hidden">
            <div className="space-y-2 max-h-[350px] overflow-y-auto custom-scrollbar">
              {/* Product 1 */}
              <div className="glass-card p-3 rounded-lg hover:bg-white/5 transition-colors cursor-pointer">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-lg bg-white/10 flex items-center justify-center">
                    <Package className="w-6 h-6 text-white/60" />
                  </div>
                  <div className="flex-1">
                    <h4 className="text-sm font-medium text-white">Gerincbarát Anatómiai Párna</h4>
                    <div className="flex items-center gap-4 mt-1">
                      <span className="text-xs text-white/50">PROFIT</span>
                      <span className="text-xs font-semibold text-green-400">254,922 Ft</span>
                      <span className="text-xs text-white/50">COGS</span>
                      <span className="text-xs text-white/60">128,567 Ft</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center gap-3">
                      <div>
                        <span className="text-xs text-white/50">CPA</span>
                        <p className="text-sm font-semibold text-white">4,443 Ft</p>
                      </div>
                      <div>
                        <span className="text-xs text-white/50">ROAS</span>
                        <p className="text-sm font-semibold text-purple-400">5.18</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 mt-1">
                      <span className="text-xs text-white/50">PPU</span>
                      <span className="text-xs font-semibold text-green-400">8,223 Ft</span>
                      <span className="text-xs text-green-400">+35.76%</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Product 2 */}
              <div className="glass-card p-3 rounded-lg hover:bg-white/5 transition-colors cursor-pointer">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-lg bg-white/10 flex items-center justify-center">
                    <Package className="w-6 h-6 text-white/60" />
                  </div>
                  <div className="flex-1">
                    <h4 className="text-sm font-medium text-white">Ortopéd Pro Talpbetét</h4>
                    <div className="flex items-center gap-4 mt-1">
                      <span className="text-xs text-white/50">PROFIT</span>
                      <span className="text-xs font-semibold text-green-400">149,378 Ft</span>
                      <span className="text-xs text-white/50">COGS</span>
                      <span className="text-xs text-white/60">36,799 Ft</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center gap-3">
                      <div>
                        <span className="text-xs text-white/50">CPA</span>
                        <p className="text-sm font-semibold text-white">2,315 Ft</p>
                      </div>
                      <div>
                        <span className="text-xs text-white/50">ROAS</span>
                        <p className="text-sm font-semibold text-purple-400">3.59</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 mt-1">
                      <span className="text-xs text-white/50">PPU</span>
                      <span className="text-xs font-semibold text-green-400">3,046 Ft</span>
                      <span className="text-xs text-green-400">+35.71%</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Product 3 */}
              <div className="glass-card p-3 rounded-lg hover:bg-white/5 transition-colors cursor-pointer">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-lg bg-white/10 flex items-center justify-center">
                    <Package className="w-6 h-6 text-white/60" />
                  </div>
                  <div className="flex-1">
                    <h4 className="text-sm font-medium text-white">SERENI Pikkelysömör Krém</h4>
                    <div className="flex items-center gap-4 mt-1">
                      <span className="text-xs text-white/50">PROFIT</span>
                      <span className="text-xs font-semibold text-green-400">97,818 Ft</span>
                      <span className="text-xs text-white/50">COGS</span>
                      <span className="text-xs text-white/60">42,618 Ft</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center gap-3">
                      <div>
                        <span className="text-xs text-white/50">CPA</span>
                        <p className="text-sm font-semibold text-white">1,397 Ft</p>
                      </div>
                      <div>
                        <span className="text-xs text-white/50">ROAS</span>
                        <p className="text-sm font-semibold text-purple-400">6.27</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 mt-1">
                      <span className="text-xs text-white/50">PPU</span>
                      <span className="text-xs font-semibold text-green-400">5,782 Ft</span>
                      <span className="text-xs text-green-400">+42.94%</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Product 4 */}
              <div className="glass-card p-3 rounded-lg hover:bg-white/5 transition-colors cursor-pointer">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-lg bg-white/10 flex items-center justify-center">
                    <Package className="w-6 h-6 text-white/60" />
                  </div>
                  <div className="flex-1">
                    <h4 className="text-sm font-medium text-white">Vibráló Masszázshenger</h4>
                    <div className="flex items-center gap-4 mt-1">
                      <span className="text-xs text-white/50">PROFIT</span>
                      <span className="text-xs font-semibold text-green-400">72,999 Ft</span>
                      <span className="text-xs text-white/50">COGS</span>
                      <span className="text-xs text-white/60">41,206 Ft</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center gap-3">
                      <div>
                        <span className="text-xs text-white/50">CPA</span>
                        <p className="text-sm font-semibold text-white">3,546 Ft</p>
                      </div>
                      <div>
                        <span className="text-xs text-white/50">ROAS</span>
                        <p className="text-sm font-semibold text-purple-400">5.43</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 mt-1">
                      <span className="text-xs text-white/50">PPU</span>
                      <span className="text-xs font-semibold text-green-400">6,636 Ft</span>
                      <span className="text-xs text-green-400">+34.44%</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Product 5 */}
              <div className="glass-card p-3 rounded-lg hover:bg-white/5 transition-colors cursor-pointer">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-lg bg-white/10 flex items-center justify-center">
                    <Package className="w-6 h-6 text-white/60" />
                  </div>
                  <div className="flex-1">
                    <h4 className="text-sm font-medium text-white">EarthFlow Földeléses Szőnyeg</h4>
                    <div className="flex items-center gap-4 mt-1">
                      <span className="text-xs text-white/50">PROFIT</span>
                      <span className="text-xs font-semibold text-green-400">51,435 Ft</span>
                      <span className="text-xs text-white/50">COGS</span>
                      <span className="text-xs text-white/60">31,368 Ft</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center gap-3">
                      <div>
                        <span className="text-xs text-white/50">CPA</span>
                        <p className="text-sm font-semibold text-white">2,764 Ft</p>
                      </div>
                      <div>
                        <span className="text-xs text-white/50">ROAS</span>
                        <p className="text-sm font-semibold text-purple-400">6.10</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 mt-1">
                      <span className="text-xs text-white/50">PPU</span>
                      <span className="text-xs font-semibold text-green-400">6,433 Ft</span>
                      <span className="text-xs text-green-400">+38.13%</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <button className="glass-button w-full mt-3 py-2 text-sm hover:scale-[1.02] transition-transform">
              Load more
            </button>
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

          <div style={{ height: '400px', minHeight: '400px', width: '100%' }}>
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

          <div style={{ height: '450px', minHeight: '450px', width: '100%' }}>
            <ResponsiveFunnel
              data={revenueFunnelData}
              theme={glassTheme}
              margin={{ top: 20, right: 30, bottom: 20, left: 30 }}
              shapeBlending={0.66}
              valueFormat=" >-.2s"
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
              tooltip={({ id, value, color }) => (
                <div style={{
                  background: 'rgba(0, 0, 0, 0.9)',
                  color: '#ffffff',
                  padding: '12px',
                  borderRadius: '8px',
                  border: '1px solid rgba(255, 255, 255, 0.2)'
                }}>
                  <strong>{id}</strong>
                  <br />
                  <span style={{ color }}>{value.toLocaleString('en-US')} Ft</span>
                </div>
              )}
            />
          </div>
          
          {/* Compact Net Profit Display */}
          <div className="mt-4 glass-card p-3 rounded-xl bg-gradient-to-r from-green-500/10 to-emerald-500/10">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-6">
                <div>
                  <span className="text-xs text-white/60 uppercase tracking-wider">Net Profit</span>
                  <p className="text-xl font-bold text-green-400">1.07M Ft</p>
                </div>
                <div className="h-8 w-px bg-white/10"></div>
                <div>
                  <span className="text-xs text-white/60 uppercase tracking-wider">Profit Margin</span>
                  <p className="text-xl font-bold text-emerald-400">33.5%</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;