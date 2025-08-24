import React, { useState } from "react";
import { ResponsiveLine } from "@nivo/line";
import { ResponsiveFunnel } from "@nivo/funnel";
import {
  TrendingUp,
  TrendingDown,
  ShoppingCart,
  Users,
  DollarSign,
  Package,
  CreditCard,
  Target,
  Activity,
  ArrowUp,
  ArrowDown,
  ChevronDown,
  ChevronUp,
  Box,
} from "lucide-react";
import DatePicker from "../../common/forms/DatePicker";

// Glass theme for Nivo charts
const glassTheme = {
  background: "transparent",
  textColor: "#ffffff",
  fontSize: 11,
  axis: {
    domain: {
      line: {
        stroke: "#ffffff30",
        strokeWidth: 1,
      },
    },
    legend: {
      text: {
        fontSize: 12,
        fill: "#ffffff90",
      },
    },
    ticks: {
      line: {
        stroke: "#ffffff20",
        strokeWidth: 1,
      },
      text: {
        fontSize: 10,
        fill: "#ffffff60",
      },
    },
  },
  grid: {
    line: {
      stroke: "#ffffff10",
      strokeWidth: 1,
    },
  },
  legends: {
    title: {
      text: {
        fontSize: 11,
        fill: "#ffffff90",
      },
    },
    text: {
      fontSize: 11,
      fill: "#ffffff70",
    },
  },
  tooltip: {
    container: {
      background: "rgba(0, 0, 0, 0.9)",
      color: "#ffffff",
      fontSize: 12,
      borderRadius: "8px",
      border: "1px solid rgba(255, 255, 255, 0.2)",
      padding: "8px 12px",
    },
  },
};

// KPI Card Component
function KPICard({
  title,
  value,
  change,
  icon: Icon,
  color,
  prefix = "",
  suffix = "",
}) {
  const isPositive = change >= 0;
  const gradientColors = {
    purple: "from-purple-400/20 to-purple-600/20 border-purple-400/30",
    blue: "from-blue-400/20 to-blue-600/20 border-blue-400/30",
    green: "from-green-400/20 to-green-600/20 border-green-400/30",
    orange: "from-orange-400/20 to-orange-600/20 border-orange-400/30",
    pink: "from-pink-400/20 to-pink-600/20 border-pink-400/30",
    cyan: "from-cyan-400/20 to-cyan-600/20 border-cyan-400/30",
  };

  const iconColors = {
    purple: "text-purple-300",
    blue: "text-blue-300",
    green: "text-green-300",
    orange: "text-orange-300",
    pink: "text-pink-300",
    cyan: "text-cyan-300",
  };

  return (
    <div className="glass-card p-4 group cursor-pointer hover:scale-105 transition-all duration-500">
      <div className="flex items-center justify-between mb-3">
        <div
          className={`glass-card p-2 rounded-xl bg-gradient-to-br ${gradientColors[color]}`}
        >
          <Icon className={`w-5 h-5 ${iconColors[color]}`} />
        </div>
        <div
          className={`flex items-center gap-1 text-sm font-medium ${isPositive ? "text-green-400" : "text-red-400"}`}
        >
          {isPositive ? (
            <ArrowUp className="w-3 h-3" />
          ) : (
            <ArrowDown className="w-3 h-3" />
          )}
          {Math.abs(change)}%
        </div>
      </div>
      <div>
        <p className="text-white/60 text-xs mb-1">{title}</p>
        <p className="text-xl font-bold text-white">
          {prefix}
          {value}
          {suffix}
        </p>
      </div>
    </div>
  );
}

// Sample data for area chart (matching the screenshot style) - moved outside to prevent recreation
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
      { x: "Aug 20", y: 2250000 },
    ],
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
      { x: "Aug 20", y: 1170000 },
    ],
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
      { x: "Aug 20", y: 405000 },
    ],
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
      { x: "Aug 20", y: 360000 },
    ],
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
      { x: "Aug 20", y: 315000 },
    ],
  },
];

// Revenue breakdown funnel data - moved outside to prevent recreation
const revenueFunnelData = [
  {
    id: "Revenue",
    value: 3197708,
    label: "Revenue",
  },
  {
    id: "After COGS",
    value: 2791092,
    label: "After COGS",
  },
  {
    id: "After Ad Spend",
    value: 1996896,
    label: "After Ad Spend",
  },
  {
    id: "After Tax",
    value: 1361175,
    label: "After Tax",
  },
  {
    id: "Net Profit",
    value: 1070565,
    label: "Net Profit",
  },
];

// Brand data for legends - moved outside to prevent recreation
const brands = [
  { label: "Mancsplaza.hu", color: "hsl(280, 70%, 50%)" },
  { label: "driubar.hu", color: "hsl(320, 70%, 50%)" },
  { label: "driubar.ro", color: "hsl(200, 70%, 50%)" },
  { label: "Basket.hu", color: "hsl(160, 70%, 50%)" },
  { label: "Blamini.hu", color: "hsl(30, 70%, 50%)" },
];

function Dashboard() {
  const [selectedPeriod, setSelectedPeriod] = useState("Today");
  const [expandedProduct1, setExpandedProduct1] = useState(false);
  const [expandedProduct2, setExpandedProduct2] = useState(false);
  const [expandedProduct3, setExpandedProduct3] = useState(false);

  return (
    <div className="flex h-screen max-h-screen w-full flex-col p-3 sm:p-4 md:p-6 overflow-y-auto overflow-x-hidden bg-transparent">
      {/* Header Section with KPIs */}
      <div className="mb-4 sm:mb-6">
        {/* Full Width Profit Metrics Card with DatePicker */}
        <div className="glass-card-large p-3 sm:p-4 mb-4 sm:mb-6 w-full">
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-4 sm:gap-6 lg:gap-8">
              <div>
                <span className="text-xs text-white/50 uppercase tracking-wider">
                  Total Profit
                </span>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-3xl font-bold text-white">1.07M Ft</span>
                  <span className="text-sm text-white/40">from 222 orders</span>
                </div>
              </div>
              <div className="h-12 w-px bg-white/10"></div>
              <div>
                <span className="text-xs text-white/50 uppercase tracking-wider">
                  eROAS
                </span>
                <div className="text-2xl font-bold text-green-400 mt-1">4.03</div>
              </div>
              <div className="h-12 w-px bg-white/10"></div>
              <div>
                <span className="text-xs text-white/50 uppercase tracking-wider">
                  Profit Margin
                </span>
                <div className="text-2xl font-bold text-purple-400 mt-1">
                  33.48%
                </div>
              </div>
            </div>
            <DatePicker value={selectedPeriod} onChange={setSelectedPeriod} />
          </div>
        </div>

        {/* Revenue Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 sm:gap-4 md:gap-6 mb-4 sm:mb-6">
          {/* Area Chart - Spans 2 columns */}
          <div className="glass-card-large p-3 sm:p-4 md:p-6 lg:col-span-2">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-white">
                Revenue Overview
              </h2>
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
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: brand.color }}
                  ></div>
                  <span className="text-xs text-white/60">{brand.label}</span>
                </div>
              ))}
            </div>

            <div style={{ height: "400px", minHeight: "400px", width: "100%" }}>
              <ResponsiveLine
                data={areaChartData}
                theme={glassTheme}
                margin={{ top: 20, right: 20, bottom: 60, left: 80 }}
                xScale={{ type: "point" }}
                yScale={{
                  type: "linear",
                  min: 0,
                  max: "auto",
                  stacked: false,
                  reverse: false,
                }}
                yFormat=" >-.2s"
                axisTop={null}
                axisRight={null}
                axisBottom={{
                  tickSize: 5,
                  tickPadding: 5,
                  tickRotation: 0,
                  legend: "",
                  legendOffset: 36,
                  legendPosition: "middle",
                }}
                axisLeft={{
                  tickSize: 5,
                  tickPadding: 5,
                  tickRotation: 0,
                  legend: "Amount (Ft)",
                  legendOffset: -60,
                  legendPosition: "middle",
                  format: (value) => `${(value / 1000000).toFixed(1)}M Ft`,
                }}
                enableArea={true}
                areaOpacity={0.15}
                pointSize={6}
                pointColor={{ from: "color", modifiers: [] }}
                pointBorderWidth={2}
                pointBorderColor={{ from: "color", modifiers: [] }}
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
          <div className="glass-card-large p-3 sm:p-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-white">
                Revenue Breakdown
              </h2>
              <Activity className="w-5 h-5 text-white/40" />
            </div>

            <div style={{ height: "400px", minHeight: "400px", width: "100%" }}>
              <ResponsiveFunnel
                data={revenueFunnelData}
                theme={glassTheme}
                margin={{ top: 25, right: 15, bottom: 10, left: 15 }}
                shapeBlending={0.66}
                valueFormat=" >-.2s"
                colors={["#a855f7", "#d946ef", "#c026d3", "#9333ea", "#7c3aed"]}
                borderWidth={15}
                borderColor={{ from: "color", modifiers: [["darker", 0.3]] }}
                borderOpacity={0.5}
                labelColor={{ from: "color", modifiers: [["brighter", 3]] }}
                beforeSeparatorLength={0}
                beforeSeparatorOffset={0}
                afterSeparatorLength={0}
                afterSeparatorOffset={0}
                currentPartSizeExtension={5}
                currentBorderWidth={20}
                motionConfig="gentle"
                isInteractive={true}
                enableLabel={true}
                animate={false}
                tooltip={({ id, value, color }) => {
                  if (!value && value !== 0) return null;
                  return (
                    <div
                      style={{
                        background: "rgba(0, 0, 0, 0.9)",
                        color: "#ffffff",
                        padding: "12px",
                        borderRadius: "8px",
                        border: "1px solid rgba(255, 255, 255, 0.2)",
                      }}
                    >
                      <strong>{id}</strong>
                      <br />
                      <span style={{ color }}>
                        {value.toLocaleString("en-US")} Ft
                      </span>
                    </div>
                  );
                }}
              />
            </div>

            {/* Compact Net Profit Display */}
            <div className="mt-4 glass-card p-3 rounded-xl bg-gradient-to-r from-green-500/10 to-emerald-500/10">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-6">
                  <div>
                    <span className="text-xs text-white/60 uppercase tracking-wider">
                      Net Profit
                    </span>
                    <p className="text-xl font-bold text-green-400">1.07M Ft</p>
                  </div>
                  <div className="h-8 w-px bg-white/10"></div>
                  <div>
                    <span className="text-xs text-white/60 uppercase tracking-wider">
                      Profit Margin
                    </span>
                    <p className="text-xl font-bold text-emerald-400">33.5%</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* KPI Cards Row */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2 sm:gap-3 md:gap-4 mb-4 sm:mb-6">
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
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4 mb-4 sm:mb-6">
          <div className="glass-card p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-medium text-white/80">
                Best Performing Product
              </h3>
              <TrendingUp className="w-4 h-4 text-green-400" />
            </div>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-lg bg-white/10 flex items-center justify-center">
                <Package className="w-6 h-6 text-white/60" />
              </div>
              <div className="flex-1">
                <p className="text-white font-medium text-sm">
                  Gerincsbarát Anatómiai Párna
                </p>
                <p className="text-green-400 text-xs">
                  Most profitable product
                </p>
              </div>
              <div className="text-right">
                <p className="text-white text-sm font-medium">8.22K Ft</p>
                <p className="text-green-400 text-xs">+35.76%</p>
              </div>
            </div>
          </div>

          <div className="glass-card p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-medium text-white/80">
                Areas of Improvement
              </h3>
              <TrendingDown className="w-4 h-4 text-red-400" />
            </div>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-lg bg-white/10 flex items-center justify-center">
                <Package className="w-6 h-6 text-white/60" />
              </div>
              <div className="flex-1">
                <p className="text-white font-medium text-sm">
                  Acélmerevítős Derékpárna
                </p>
                <p className="text-red-400 text-xs">
                  Lowest performing product
                </p>
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
      <div className="glass-card-large p-3 sm:p-4 md:p-6 mb-4 sm:mb-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-4">
            <h2 className="text-lg font-semibold text-white">
              Daily Product Sales
            </h2>
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
              {["Revenue", "Cogs", "Profit"].map((metric) => (
                <label
                  key={metric}
                  className="flex items-center gap-2 cursor-pointer"
                >
                  <input type="checkbox" defaultChecked className="rounded" />
                  <span className="text-xs text-white/60">{metric}</span>
                </label>
              ))}
            </div>
            <div style={{ height: "350px", minHeight: "350px", width: "100%" }}>
              <ResponsiveLine
                data={areaChartData.slice(0, 3)}
                theme={glassTheme}
                margin={{ top: 10, right: 10, bottom: 40, left: 60 }}
                xScale={{ type: "point" }}
                yScale={{
                  type: "linear",
                  min: 0,
                  max: "auto",
                  stacked: false,
                  reverse: false,
                }}
                yFormat=" >-.2s"
                axisTop={null}
                axisRight={null}
                axisBottom={{
                  tickSize: 5,
                  tickPadding: 5,
                  tickRotation: 0,
                  legend: "",
                  legendOffset: 36,
                  legendPosition: "middle",
                }}
                axisLeft={{
                  tickSize: 5,
                  tickPadding: 5,
                  tickRotation: 0,
                  legend: "",
                  legendOffset: -40,
                  legendPosition: "middle",
                  format: (value) => `${(value / 1000).toFixed(0)}K Ft`,
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
            <div className="space-y-1.5 max-h-[350px] overflow-y-auto custom-scrollbar">
              {/* Product 1 - Premium Full Width Design with Side Toggle */}
              <div className="relative">
                <div className="glass-card p-1 rounded-lg hover:bg-white/5 transition-all duration-300 border border-white/10 hover:border-purple-400/30 relative">
                  {/* Toggle Button - Right side middle */}
                  <button
                    onClick={() => setExpandedProduct1(!expandedProduct1)}
                    className="absolute -right-1 top-1/2 transform -translate-y-1/2 z-20 w-2 h-6 bg-gradient-to-r from-white/5 to-transparent border-r border-white/20 rounded-r hover:border-purple-400/40 hover:bg-purple-400/10 transition-all duration-200 flex items-center justify-center group"
                  >
                    <div className="w-1.5 h-4 flex items-center justify-center">
                      {expandedProduct1 ? (
                        <div className="h-2.5 w-0.5 bg-purple-400/40 group-hover:bg-purple-400/60 rounded-full" />
                      ) : (
                        <div className="flex flex-col gap-0.5">
                          <div className="w-0.5 h-0.5 bg-purple-400/40 group-hover:bg-purple-400/60 rounded-full" />
                          <div className="w-0.5 h-0.5 bg-purple-400/40 group-hover:bg-purple-400/60 rounded-full" />
                          <div className="w-0.5 h-0.5 bg-purple-400/40 group-hover:bg-purple-400/60 rounded-full" />
                        </div>
                      )}
                    </div>
                  </button>

                  <div className="flex gap-1.5">
                    {/* Left Content Area */}
                    <div className="flex-1">
                      {/* Product Header */}
                      <div className="flex items-center gap-1.5 mb-1">
                        <div className="relative">
                          <div className="w-8 h-8 rounded-lg bg-white/10 overflow-hidden border border-white/20">
                            <div className="w-full h-full bg-gradient-to-br from-gray-300 to-gray-400 flex items-center justify-center">
                              <svg
                                className="w-5 h-5 text-gray-600"
                                fill="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path d="M20 6h-2.18c.11-.31.18-.65.18-1a2.996 2.996 0 0 0-5.5-1.65l-.5.67-.5-.68C10.96 2.54 10.05 2 9 2 7.34 2 6 3.34 6 5c0 .35.07.69.18 1H4c-1.11 0-1.99.89-1.99 2L2 19c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V8c0-1.11-.89-2-2-2zM9 4c.55 0 1 .45 1 1s-.45 1-1 1-1-.45-1-1 .45-1 1-1zm6 0c.55 0 1 .45 1 1s-.45 1-1 1-1-.45-1-1 .45-1 1-1z" />
                              </svg>
                            </div>
                          </div>
                          <div className="absolute -top-0.5 -right-0.5 w-3 h-3 bg-green-500 border border-white rounded-full flex items-center justify-center">
                            <span className="text-[6px] text-white font-bold">31</span>
                          </div>
                        </div>
                        <div className="min-w-0 flex-1">
                          <h4 className="text-[10px] font-semibold text-white truncate leading-tight">
                            Gerincbarát Anatómiai Párna
                          </h4>
                          <span className="text-[7px] text-white/50">Most Profitable</span>
                        </div>
                      </div>

                      {/* Main Metrics - Compact */}
                      <div className="grid grid-cols-4 gap-0.5">
                        <div className="rounded-lg bg-gradient-to-br from-green-500/10 to-emerald-500/10 border border-green-500/20 p-0.5">
                          <p className="text-[5px] text-white/60 text-center">PROFIT</p>
                          <p className="text-green-400 font-bold text-[8px] text-center">254.8K</p>
                        </div>
                        
                        <div className="rounded-lg bg-gradient-to-br from-purple-500/10 to-pink-500/10 border border-purple-500/20 p-0.5">
                          <p className="text-[5px] text-white/60 text-center">REVENUE</p>
                          <p className="text-white font-bold text-[8px] text-center">713K</p>
                        </div>
                        
                        <div className="rounded-lg bg-gradient-to-br from-orange-500/10 to-red-500/10 border border-orange-500/20 p-0.5">
                          <p className="text-[5px] text-white/60 text-center">SPEND</p>
                          <p className="text-white font-bold text-[8px] text-center">137.9K</p>
                        </div>
                        
                        <div className="rounded-lg bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border border-blue-500/20 p-0.5">
                          <p className="text-[5px] text-white/60 text-center">COGS</p>
                          <p className="text-white font-bold text-[8px] text-center">128.9K</p>
                        </div>
                      </div>
                    </div>
                    
                    {/* Right Side - Vertical Metrics */}
                    <div className="flex gap-0.5">
                      <div className="flex flex-col gap-0.5">
                        {/* CPA */}
                        <div className="flex-1 rounded-lg bg-gradient-to-br from-purple-500/10 to-pink-500/10 border border-purple-500/20 px-1.5 flex flex-col justify-center">
                          <p className="text-[5px] text-white/60 text-center">CPA</p>
                          <p className="text-purple-400 font-bold text-[7px] text-center">4.4K</p>
                        </div>
                        
                        {/* PPU */}
                        <div className="flex-1 rounded-lg bg-gradient-to-br from-green-500/10 to-emerald-500/10 border border-green-500/20 px-1.5 flex flex-col justify-center">
                          <p className="text-[5px] text-white/60 text-center">PPU</p>
                          <p className="text-green-400 font-bold text-[7px] text-center">8.2K</p>
                        </div>
                      </div>
                      
                      <div className="flex flex-col gap-0.5">
                        {/* ROAS */}
                        <div className="flex-1 rounded-lg bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border border-blue-500/20 px-1.5 flex flex-col justify-center">
                          <p className="text-[5px] text-white/60 text-center">ROAS</p>
                          <p className="text-white font-bold text-[7px] text-center">5.17</p>
                        </div>
                        
                        {/* GPM */}
                        <div className="flex-1 rounded-lg bg-gradient-to-br from-yellow-500/10 to-orange-500/10 border border-yellow-500/20 px-1.5 flex flex-col justify-center">
                          <p className="text-[5px] text-white/60 text-center">GPM</p>
                          <p className="text-green-400 font-bold text-[7px] text-center">36%</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Expandable Variants Panel - Same clean design as Product 2 */}
                  {expandedProduct1 && (
                    <div className="mt-2 pt-2 border-t border-white/10">
                      <div className="mb-1.5">
                        <span className="text-[7px] text-white/50 uppercase tracking-wider">Variants Overview</span>
                      </div>
                      
                      {/* Variants Table Header */}
                      <div className="grid grid-cols-6 gap-0.5 mb-1 px-1">
                        <div className="text-[5px] text-white/40">Type</div>
                        <div className="text-[5px] text-white/40 text-center">Sold</div>
                        <div className="text-[5px] text-white/40 text-right">Revenue</div>
                        <div className="text-[5px] text-white/40 text-right">Cost</div>
                        <div className="text-[5px] text-white/40 text-center">Stock</div>
                        <div className="text-[5px] text-white/40 text-right">Value</div>
                      </div>
                      
                      {/* Variant Rows */}
                      <div className="space-y-0.5">
                        <div className="grid grid-cols-6 gap-0.5 py-0.5 px-1 rounded bg-white/5 hover:bg-white/10 transition-colors">
                          <div className="text-[7px] text-white/80">Standard</div>
                          <div className="text-[7px] text-white/70 text-center">245</div>
                          <div className="text-[7px] text-green-400 text-right">392K</div>
                          <div className="text-[7px] text-orange-400 text-right">70.8K</div>
                          <div className="text-[7px] text-blue-400 text-center">89</div>
                          <div className="text-[7px] text-purple-400 text-right">142.4K</div>
                        </div>
                        
                        <div className="grid grid-cols-6 gap-0.5 py-0.5 px-1 rounded bg-white/5 hover:bg-white/10 transition-colors">
                          <div className="text-[7px] text-white/80">Premium</div>
                          <div className="text-[7px] text-white/70 text-center">156</div>
                          <div className="text-[7px] text-green-400 text-right">321K</div>
                          <div className="text-[7px] text-orange-400 text-right">58.1K</div>
                          <div className="text-[7px] text-blue-400 text-center">67</div>
                          <div className="text-[7px] text-purple-400 text-right">138K</div>
                        </div>
                      </div>
                      
                      {/* Total Row */}
                      <div className="grid grid-cols-6 gap-0.5 mt-1 pt-1 px-1 border-t border-white/10">
                        <div className="text-[6px] text-white/60 font-medium">TOTAL</div>
                        <div className="text-[6px] text-white/80 font-bold text-center">401</div>
                        <div className="text-[6px] text-green-400 font-bold text-right">713K</div>
                        <div className="text-[6px] text-orange-400 font-bold text-right">128.9K</div>
                        <div className="text-[6px] text-blue-400 font-bold text-center">156</div>
                        <div className="text-[6px] text-purple-400 font-bold text-right">280.4K</div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Product 2 - With Expandable Variants */}
              <div className="relative">
                <div className="glass-card p-1 rounded-lg hover:bg-white/5 transition-all duration-300 border border-white/10 hover:border-blue-400/30 relative overflow-visible">
                  {/* Toggle Button */}
                  <button
                    onClick={() => setExpandedProduct2(!expandedProduct2)}
                    className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-6 h-2 bg-gradient-to-b from-white/10 to-transparent border-l border-r border-b border-white/10 rounded-b hover:border-blue-400/40 hover:bg-blue-400/10 transition-all duration-200 flex items-center justify-center group"
                  >
                    <div className="w-3 h-1.5 flex items-center justify-center">
                      {expandedProduct2 ? (
                        <div className="w-2 h-0.5 bg-white/30 group-hover:bg-blue-400/60 rounded-full" />
                      ) : (
                        <div className="flex gap-0.5">
                          <div className="w-0.5 h-0.5 bg-white/30 group-hover:bg-blue-400/60 rounded-full" />
                          <div className="w-0.5 h-0.5 bg-white/30 group-hover:bg-blue-400/60 rounded-full" />
                          <div className="w-0.5 h-0.5 bg-white/30 group-hover:bg-blue-400/60 rounded-full" />
                        </div>
                      )}
                    </div>
                  </button>
                  
                  <div className="flex gap-1.5">
                    {/* Left - Product Image (Square) */}
                    <div className="relative flex-shrink-0">
                      <div className="w-12 h-12 rounded-lg bg-white/10 overflow-hidden border border-white/20">
                        <div className="w-full h-full bg-gradient-to-br from-blue-300 to-blue-500 flex items-center justify-center">
                          <svg
                            className="w-7 h-7 text-white"
                            fill="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" />
                            <circle cx="12" cy="9" r="2.5" />
                          </svg>
                        </div>
                      </div>
                      <div className="absolute -top-0.5 -right-0.5 w-3 h-3 bg-blue-500 border border-white rounded-full flex items-center justify-center">
                        <span className="text-[6px] text-white font-bold">49</span>
                      </div>
                    </div>

                    {/* Middle Content Area */}
                    <div className="flex-1">
                      {/* Product Header */}
                      <h4 className="text-[10px] font-semibold text-white truncate leading-tight mb-1">
                        Ortopéd Pro Talpbetét
                      </h4>

                      {/* Main Metrics - Better Height (Neutral Colors) */}
                      <div className="grid grid-cols-4 gap-0.5">
                        <div className="rounded-lg bg-white/5 border border-white/10 p-0.5">
                          <p className="text-[5px] text-white/60 text-center">PROFIT</p>
                          <p className="text-white/90 font-bold text-[8px] text-center">149.3K</p>
                        </div>
                        
                        <div className="rounded-lg bg-white/5 border border-white/10 p-0.5">
                          <p className="text-[5px] text-white/60 text-center">REVENUE</p>
                          <p className="text-white/90 font-bold text-[8px] text-center">407K</p>
                        </div>
                        
                        <div className="rounded-lg bg-white/5 border border-white/10 p-0.5">
                          <p className="text-[5px] text-white/60 text-center">SPEND</p>
                          <p className="text-white/90 font-bold text-[8px] text-center">113.5K</p>
                        </div>
                        
                        <div className="rounded-lg bg-white/5 border border-white/10 p-0.5">
                          <p className="text-[5px] text-white/60 text-center">COGS</p>
                          <p className="text-white/90 font-bold text-[8px] text-center">36.8K</p>
                        </div>
                      </div>
                    </div>
                    
                    {/* Right Side - Vertical Metrics (Gray/Neutral) */}
                    <div className="flex gap-0.5">
                      <div className="flex flex-col gap-0.5">
                        {/* CPA */}
                        <div className="flex-1 rounded-lg bg-white/5 border border-white/10 px-1.5 flex flex-col justify-center">
                          <p className="text-[5px] text-white/60 text-center">CPA</p>
                          <p className="text-white/80 font-bold text-[7px] text-center">2.3K</p>
                        </div>
                        
                        {/* PPU */}
                        <div className="flex-1 rounded-lg bg-white/5 border border-white/10 px-1.5 flex flex-col justify-center">
                          <p className="text-[5px] text-white/60 text-center">PPU</p>
                          <p className="text-white/80 font-bold text-[7px] text-center">3K</p>
                        </div>
                      </div>
                      
                      <div className="flex flex-col gap-0.5">
                        {/* ROAS */}
                        <div className="flex-1 rounded-lg bg-white/5 border border-white/10 px-1.5 flex flex-col justify-center">
                          <p className="text-[5px] text-white/60 text-center">ROAS</p>
                          <p className="text-white/80 font-bold text-[7px] text-center">3.59</p>
                        </div>
                        
                        {/* GPM */}
                        <div className="flex-1 rounded-lg bg-white/5 border border-white/10 px-1.5 flex flex-col justify-center">
                          <p className="text-[5px] text-white/60 text-center">GPM</p>
                          <p className="text-white/80 font-bold text-[7px] text-center">37%</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Expandable Variants Panel - Clean Design */}
                  {expandedProduct2 && (
                    <div className="mt-2 pt-2 border-t border-white/10">
                      <div className="mb-1.5">
                        <span className="text-[7px] text-white/50 uppercase tracking-wider">Variants Overview</span>
                      </div>
                      
                      {/* Variants Table Header */}
                      <div className="grid grid-cols-6 gap-0.5 mb-1 px-1">
                        <div className="text-[5px] text-white/40">Size</div>
                        <div className="text-[5px] text-white/40 text-center">Sold</div>
                        <div className="text-[5px] text-white/40 text-right">Revenue</div>
                        <div className="text-[5px] text-white/40 text-right">Cost</div>
                        <div className="text-[5px] text-white/40 text-center">Stock</div>
                        <div className="text-[5px] text-white/40 text-right">Value</div>
                      </div>
                      
                      {/* Variant Rows */}
                      <div className="space-y-0.5">
                        <div className="grid grid-cols-6 gap-0.5 py-0.5 px-1 rounded bg-white/5 hover:bg-white/10 transition-colors">
                          <div className="text-[7px] text-white/80">S (36-38)</div>
                          <div className="text-[7px] text-white/70 text-center">124</div>
                          <div className="text-[7px] text-green-400 text-right">186K</div>
                          <div className="text-[7px] text-orange-400 text-right">12.4K</div>
                          <div className="text-[7px] text-blue-400 text-center">48</div>
                          <div className="text-[7px] text-purple-400 text-right">72K</div>
                        </div>
                        
                        <div className="grid grid-cols-6 gap-0.5 py-0.5 px-1 rounded bg-white/5 hover:bg-white/10 transition-colors">
                          <div className="text-[7px] text-white/80">M (39-41)</div>
                          <div className="text-[7px] text-white/70 text-center">87</div>
                          <div className="text-[7px] text-green-400 text-right">130.5K</div>
                          <div className="text-[7px] text-orange-400 text-right">8.7K</div>
                          <div className="text-[7px] text-blue-400 text-center">112</div>
                          <div className="text-[7px] text-purple-400 text-right">168K</div>
                        </div>
                        
                        <div className="grid grid-cols-6 gap-0.5 py-0.5 px-1 rounded bg-white/5 hover:bg-white/10 transition-colors">
                          <div className="text-[7px] text-white/80">L (42-44)</div>
                          <div className="text-[7px] text-white/70 text-center">56</div>
                          <div className="text-[7px] text-green-400 text-right">84K</div>
                          <div className="text-[7px] text-orange-400 text-right">5.6K</div>
                          <div className="text-[7px] text-blue-400 text-center">76</div>
                          <div className="text-[7px] text-purple-400 text-right">114K</div>
                        </div>
                        
                        <div className="grid grid-cols-6 gap-0.5 py-0.5 px-1 rounded bg-white/5 hover:bg-white/10 transition-colors">
                          <div className="text-[7px] text-white/80">XL (45+)</div>
                          <div className="text-[7px] text-white/70 text-center">21</div>
                          <div className="text-[7px] text-green-400 text-right">31.5K</div>
                          <div className="text-[7px] text-orange-400 text-right">2.1K</div>
                          <div className="text-[7px] text-blue-400 text-center">23</div>
                          <div className="text-[7px] text-purple-400 text-right">34.5K</div>
                        </div>
                      </div>
                      
                      {/* Total Row */}
                      <div className="grid grid-cols-6 gap-0.5 mt-1 pt-1 px-1 border-t border-white/10">
                        <div className="text-[6px] text-white/60 font-medium">TOTAL</div>
                        <div className="text-[6px] text-white/80 font-bold text-center">288</div>
                        <div className="text-[6px] text-green-400 font-bold text-right">432K</div>
                        <div className="text-[6px] text-orange-400 font-bold text-right">28.8K</div>
                        <div className="text-[6px] text-blue-400 font-bold text-center">259</div>
                        <div className="text-[6px] text-purple-400 font-bold text-right">388.5K</div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Product 3 - Icon Design with Expandable Variants */}
              <div className="relative">
                <div className="glass-card p-1.5 rounded-lg hover:bg-white/5 transition-all duration-300 border border-white/10 hover:border-purple-400/30 relative overflow-visible">
                  {/* Toggle Button - Small tab extending from bottom border */}
                  <button
                    onClick={() => setExpandedProduct3(!expandedProduct3)}
                    className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-6 h-2 bg-gradient-to-b from-white/10 to-transparent border-l border-r border-b border-white/10 rounded-b hover:border-purple-400/40 hover:bg-purple-400/10 transition-all duration-200 flex items-center justify-center group"
                  >
                    <div className="w-3 h-1.5 flex items-center justify-center">
                      {expandedProduct3 ? (
                        <div className="w-2 h-0.5 bg-white/30 group-hover:bg-purple-400/60 rounded-full" />
                      ) : (
                        <div className="flex gap-0.5">
                          <div className="w-0.5 h-0.5 bg-white/30 group-hover:bg-purple-400/60 rounded-full" />
                          <div className="w-0.5 h-0.5 bg-white/30 group-hover:bg-purple-400/60 rounded-full" />
                          <div className="w-0.5 h-0.5 bg-white/30 group-hover:bg-purple-400/60 rounded-full" />
                        </div>
                      )}
                    </div>
                  </button>
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                      <div className="relative">
                        <div className="w-10 h-10 rounded-lg bg-white/10 overflow-hidden border border-white/20">
                          <div className="w-full h-full bg-gradient-to-br from-purple-300 to-purple-500 flex items-center justify-center">
                            <svg
                              className="w-6 h-6 text-white"
                              fill="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                            </svg>
                          </div>
                        </div>
                        <div className="absolute -top-0.5 -right-0.5 w-3.5 h-3.5 bg-purple-500 border border-white rounded-full flex items-center justify-center">
                          <span className="text-[7px] text-white font-bold">
                            26
                          </span>
                        </div>
                      </div>
                      <div className="min-w-0 flex-1">
                        <h4 className="text-[11px] font-semibold text-white truncate leading-tight">
                          SERENI Pikkelysömör és Ekcéma Krém
                        </h4>
                        <span className="text-[8px] text-white/50">
                          Highest GPM
                        </span>
                      </div>
                    </div>
                  </div>

                {/* Icon-based Metrics Design */}
                <div className="grid grid-cols-4 gap-0.5 mb-1">
                  <div className="glass-card p-0.5 flex items-center gap-0.5">
                    <TrendingUp className="w-2.5 h-2.5 text-green-400" />
                    <p className="text-green-400 font-bold text-[8px]">97.8K</p>
                  </div>
                  <div className="glass-card p-0.5 flex items-center gap-0.5">
                    <DollarSign className="w-2.5 h-2.5 text-blue-400" />
                    <p className="text-blue-400 font-bold text-[8px]">227.8K</p>
                  </div>
                  <div className="glass-card p-0.5 flex items-center gap-0.5">
                    <CreditCard className="w-2.5 h-2.5 text-red-400" />
                    <p className="text-red-400 font-bold text-[8px]">36.4K</p>
                  </div>
                  <div className="glass-card p-0.5 flex items-center gap-0.5">
                    <Package className="w-2.5 h-2.5 text-orange-400" />
                    <p className="text-orange-400 font-bold text-[8px]">42.6K</p>
                  </div>
                </div>
                
                <div className="flex gap-1">
                  <div className="flex-1 glass-card p-0.5 flex items-center justify-between">
                    <span className="text-[6px] text-gray-400">CPA</span>
                    <span className="text-purple-400 font-bold text-[7px]">1.4K</span>
                  </div>
                  <div className="flex-1 glass-card p-0.5 flex items-center justify-between">
                    <span className="text-[6px] text-gray-400">PPU</span>
                    <span className="text-indigo-400 font-bold text-[7px]">3.8K</span>
                  </div>
                  <div className="flex-1 glass-card p-0.5 flex items-center justify-between">
                    <span className="text-[6px] text-gray-400">ROAS</span>
                    <span className="text-teal-400 font-bold text-[7px]">6.27</span>
                  </div>
                  <div className="flex-1 glass-card p-0.5 flex items-center justify-between">
                    <span className="text-[6px] text-gray-400">GPM</span>
                    <span className="text-yellow-400 font-bold text-[7px]">43%</span>
                  </div>
                </div>

                {/* Expandable Variants Panel */}
                {expandedProduct3 && (
                  <div className="mt-2 pt-2 border-t border-white/10">
                    <div className="flex items-center gap-1 mb-1.5">
                      <Box className="w-3 h-3 text-purple-400" />
                      <span className="text-[8px] text-white/70 font-medium">Product Variants</span>
                    </div>
                    
                    {/* Variant 1 */}
                    <div className="glass-card p-1 mb-1">
                      <div className="flex items-center justify-between mb-0.5">
                        <span className="text-[8px] text-white/80 font-medium">50ml - Standard</span>
                        <span className="text-[7px] text-green-400">Best Seller</span>
                      </div>
                      <div className="grid grid-cols-5 gap-0.5">
                        <div className="text-center">
                          <p className="text-[5px] text-white/40">Sold</p>
                          <p className="text-[7px] text-white/70 font-bold">18</p>
                        </div>
                        <div className="text-center">
                          <p className="text-[5px] text-white/40">Revenue</p>
                          <p className="text-[7px] text-green-400 font-bold">108K</p>
                        </div>
                        <div className="text-center">
                          <p className="text-[5px] text-white/40">COGS</p>
                          <p className="text-[7px] text-orange-400 font-bold">20.3K</p>
                        </div>
                        <div className="text-center">
                          <p className="text-[5px] text-white/40">Stock</p>
                          <p className="text-[7px] text-blue-400 font-bold">142</p>
                        </div>
                        <div className="text-center">
                          <p className="text-[5px] text-white/40">Value</p>
                          <p className="text-[7px] text-purple-400 font-bold">852K</p>
                        </div>
                      </div>
                    </div>

                    {/* Variant 2 */}
                    <div className="glass-card p-1 mb-1">
                      <div className="flex items-center justify-between mb-0.5">
                        <span className="text-[8px] text-white/80 font-medium">100ml - Premium</span>
                        <span className="text-[7px] text-blue-400">High Margin</span>
                      </div>
                      <div className="grid grid-cols-5 gap-0.5">
                        <div className="text-center">
                          <p className="text-[5px] text-white/40">Sold</p>
                          <p className="text-[7px] text-white/70 font-bold">8</p>
                        </div>
                        <div className="text-center">
                          <p className="text-[5px] text-white/40">Revenue</p>
                          <p className="text-[7px] text-green-400 font-bold">119.8K</p>
                        </div>
                        <div className="text-center">
                          <p className="text-[5px] text-white/40">COGS</p>
                          <p className="text-[7px] text-orange-400 font-bold">22.3K</p>
                        </div>
                        <div className="text-center">
                          <p className="text-[5px] text-white/40">Stock</p>
                          <p className="text-[7px] text-blue-400 font-bold">87</p>
                        </div>
                        <div className="text-center">
                          <p className="text-[5px] text-white/40">Value</p>
                          <p className="text-[7px] text-purple-400 font-bold">1.3M</p>
                        </div>
                      </div>
                    </div>

                    {/* Summary Row */}
                    <div className="glass-card p-1 bg-gradient-to-r from-purple-500/5 to-pink-500/5 border border-purple-500/20">
                      <div className="flex items-center justify-between">
                        <span className="text-[7px] text-white/60 font-medium">Total Stock Value:</span>
                        <span className="text-[8px] text-purple-400 font-bold">2.15M Ft</span>
                      </div>
                    </div>
                  </div>
                )}
                </div>
              </div>

              {/* Product 4 - Pill/Badge Design */}
              <div className="glass-card p-1.5 rounded-lg hover:bg-white/5 transition-all duration-300 cursor-pointer border border-white/10 hover:border-orange-400/30">
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2">
                    <div className="relative">
                      <div className="w-10 h-10 rounded-lg bg-white/10 overflow-hidden border border-white/20">
                        <div className="w-full h-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center">
                          <svg
                            className="w-6 h-6 text-white"
                            fill="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path d="M2 12c0 5.52 4.48 10 10 10s10-4.48 10-10S17.52 2 12 2 2 6.48 2 12zm9.55-6c1.2 0 2.45 1 2.45 2.5S12.75 11 11.55 11c-1.2 0-2.45-1-2.45-2.5S10.35 6 11.55 6zm6.45 10.5c0 .83-.67 1.5-1.5 1.5h-9c-.83 0-1.5-.67-1.5-1.5v-1c0-.83.67-1.5 1.5-1.5h9c.83 0 1.5.67 1.5 1.5v1z" />
                          </svg>
                        </div>
                      </div>
                      <div className="absolute -top-0.5 -right-0.5 w-3.5 h-3.5 bg-cyan-500 border border-white rounded-full flex items-center justify-center">
                        <span className="text-[7px] text-white font-bold">
                          11
                        </span>
                      </div>
                    </div>
                    <div className="min-w-0 flex-1">
                      <h4 className="text-[11px] font-semibold text-white truncate leading-tight">
                        Vibráló Masszázshenger
                      </h4>
                      <span className="text-[8px] text-white/50">
                        High ROAS
                      </span>
                    </div>
                  </div>
                </div>

                {/* Pill/Badge Metrics Design */}
                <div className="flex flex-wrap gap-0.5 mb-1">
                  <div className="px-1.5 py-0.5 rounded-full bg-green-500/20 border border-green-400/30">
                    <span className="text-green-400 font-bold text-[7px]">P: 73K</span>
                  </div>
                  <div className="px-1.5 py-0.5 rounded-full bg-blue-500/20 border border-blue-400/30">
                    <span className="text-blue-400 font-bold text-[7px]">R: 212K</span>
                  </div>
                  <div className="px-1.5 py-0.5 rounded-full bg-red-500/20 border border-red-400/30">
                    <span className="text-red-400 font-bold text-[7px]">S: 39K</span>
                  </div>
                  <div className="px-1.5 py-0.5 rounded-full bg-orange-500/20 border border-orange-400/30">
                    <span className="text-orange-400 font-bold text-[7px]">C: 41.2K</span>
                  </div>
                </div>
                
                <div className="flex flex-wrap gap-0.5">
                  <div className="px-1 py-0.5 rounded bg-purple-500/15 border border-purple-400/20">
                    <span className="text-purple-400 font-medium text-[6px]">CPA 3.5K</span>
                  </div>
                  <div className="px-1 py-0.5 rounded bg-indigo-500/15 border border-indigo-400/20">
                    <span className="text-indigo-400 font-medium text-[6px]">PPU 6.6K</span>
                  </div>
                  <div className="px-1 py-0.5 rounded bg-teal-500/15 border border-teal-400/20">
                    <span className="text-teal-400 font-medium text-[6px]">ROAS 5.43</span>
                  </div>
                  <div className="px-1 py-0.5 rounded bg-yellow-500/15 border border-yellow-400/20">
                    <span className="text-yellow-400 font-medium text-[6px]">GPM 34%</span>
                  </div>
                </div>
              </div>

              {/* Product 5 - Compact Bar Design */}
              <div className="glass-card p-1.5 rounded-lg hover:bg-white/5 transition-all duration-300 cursor-pointer border border-white/10 hover:border-cyan-400/30">
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2">
                    <div className="relative">
                      <div className="w-10 h-10 rounded-lg bg-white/10 overflow-hidden border border-white/20">
                        <div className="w-full h-full bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center">
                          <svg
                            className="w-6 h-6 text-white"
                            fill="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
                          </svg>
                        </div>
                      </div>
                      <div className="absolute -top-0.5 -right-0.5 w-3.5 h-3.5 bg-green-500 border border-white rounded-full flex items-center justify-center">
                        <span className="text-[7px] text-white font-bold">
                          8
                        </span>
                      </div>
                    </div>
                    <div className="min-w-0 flex-1">
                      <h4 className="text-[11px] font-semibold text-white truncate leading-tight">
                        EarthFlow Földeléses Szőnyeg
                      </h4>
                      <span className="text-[8px] text-white/50">
                        Premium GPM
                      </span>
                    </div>
                  </div>
                </div>

                {/* Compact Bar Metrics Design */}
                <div className="space-y-0.5">
                  <div className="flex gap-0.5">
                    <div className="flex-1 relative h-4 rounded bg-green-500/10 overflow-hidden">
                      <div className="absolute inset-0 bg-gradient-to-r from-green-500/30 to-green-500/10" style={{width: '38%'}}></div>
                      <div className="absolute inset-0 flex items-center justify-between px-1">
                        <span className="text-[6px] text-green-400/80">P</span>
                        <span className="text-green-400 font-bold text-[7px]">51.5K</span>
                      </div>
                    </div>
                    <div className="flex-1 relative h-4 rounded bg-blue-500/10 overflow-hidden">
                      <div className="absolute inset-0 bg-gradient-to-r from-blue-500/30 to-blue-500/10" style={{width: '63%'}}></div>
                      <div className="absolute inset-0 flex items-center justify-between px-1">
                        <span className="text-[6px] text-blue-400/80">R</span>
                        <span className="text-blue-400 font-bold text-[7px]">135K</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-0.5">
                    <div className="flex-1 relative h-4 rounded bg-red-500/10 overflow-hidden">
                      <div className="absolute inset-0 bg-gradient-to-r from-red-500/30 to-red-500/10" style={{width: '16%'}}></div>
                      <div className="absolute inset-0 flex items-center justify-between px-1">
                        <span className="text-[6px] text-red-400/80">S</span>
                        <span className="text-red-400 font-bold text-[7px]">22.1K</span>
                      </div>
                    </div>
                    <div className="flex-1 relative h-4 rounded bg-orange-500/10 overflow-hidden">
                      <div className="absolute inset-0 bg-gradient-to-r from-orange-500/30 to-orange-500/10" style={{width: '23%'}}></div>
                      <div className="absolute inset-0 flex items-center justify-between px-1">
                        <span className="text-[6px] text-orange-400/80">C</span>
                        <span className="text-orange-400 font-bold text-[7px]">31.4K</span>
                      </div>
                    </div>
                  </div>
                  <div className="grid grid-cols-4 gap-0.5">
                    <div className="text-center py-0.5 rounded bg-purple-500/10">
                      <p className="text-purple-400 font-bold text-[6px]">2.8K</p>
                    </div>
                    <div className="text-center py-0.5 rounded bg-indigo-500/10">
                      <p className="text-indigo-400 font-bold text-[6px]">4.2K</p>
                    </div>
                    <div className="text-center py-0.5 rounded bg-teal-500/10">
                      <p className="text-teal-400 font-bold text-[6px]">6.10</p>
                    </div>
                    <div className="text-center py-0.5 rounded bg-yellow-500/10">
                      <p className="text-yellow-400 font-bold text-[6px]">38%</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* "Load More" Button */}
            <button className="w-full mt-3 py-1.5 glass-card hover:bg-white/10 transition-colors duration-200 rounded-lg border border-white/20 text-white/70 text-xs font-medium">
              Load More Products
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
