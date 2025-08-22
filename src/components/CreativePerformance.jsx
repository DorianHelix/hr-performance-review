import React, { useState, useEffect, useRef } from 'react';
import { 
  Star, TrendingUp, Sparkles, Palette, 
  Lightbulb, Zap, Award, Target,
  Download, Plus, ChevronRight, Settings,
  Trash2, X, Clock, FileText, Briefcase,
  RefreshCw, MessageSquare, Users, Menu, Eye, EyeOff,
  BarChart3, LineChart
} from 'lucide-react';


// Low Stock Tooltip Component (specific implementation)
function LowStockTooltip({ emp }) {
  const warningIcon = (
    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
      <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
    </svg>
  );

  return (
    <LiquidTooltip 
      content={`Low Stock: ${emp.stock} remaining`}
      variant="warning"
      onClick={true}
      icon={warningIcon}
    >
      <button className="p-1 rounded hover:bg-orange-500/20 text-orange-400">
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
        </svg>
      </button>
    </LiquidTooltip>
  );
}
import API from '../api';
import LiquidTooltip, { TruncatedTooltip } from './LiquidTooltip';
import ScoreChartModal from './CreativePerformance/ScoreChartModal';
import TestTypesModal from './CreativePerformance/TestTypesModal';
import PlatformTypesModal from './CreativePerformance/PlatformTypesModal';
import SettingsModal from './CreativePerformance/SettingsModal';
import { getIcon } from './CreativePerformance/utils';
import SectionHeader from './SectionHeader';
import {
  initializeCreativeData,
  getTestTypes,
  getPlatformTypes,
  getAllowedPlatforms,
  getScore,
  saveScore
} from '../utils/creativeDataModel';
import {
  getGlobalTestTypes,
  getGlobalPlatforms,
  getGlobalAllowedPlatforms
} from '../utils/globalTestConfig';

// Helper functions (copied from main App)
function scoreToTier(score) {
  if (score >= 9) return 1;
  if (score >= 7) return 2;
  if (score >= 5) return 3;
  if (score >= 3) return 4;
  return 5;
}

function tierStyles(score) {
  if (score == null) return { bg: "bg-transparent", text: "text-white/50" };
  const t = scoreToTier(score);
  switch (t) {
    case 1: return { bg: "bg-green-500", text: "text-white" };
    case 2: return { bg: "bg-green-400", text: "text-white" };
    case 3: return { bg: "bg-yellow-400", text: "text-gray-900" };
    case 4: return { bg: "bg-orange-500", text: "text-white" };
    default: return { bg: "bg-red-600", text: "text-white" };
  }
}


// Creative Performance Module - Full version based on Performance, adapted for Products
function CreativePerformance({ 
  employees = [],  // Now contains products data instead of employees 
  categories = [],
  setCategories,  // Function to update categories
  weeks = [],  // Now contains days data instead of weeks
  startDate,
  setStartDate,
  endDate,
  setEndDate,
  cellSize = 100,
  setCellSize,
  filterMinTier = 5,
  setFilterMinTier,
  expanded = {},
  toggleExpand,
  newEmployeeName = '',
  setNewEmployeeName,
  bulkOpen = false,
  setBulkOpen,
  bulkText = '',
  setBulkText,
  handleAddEmployee,
  handleBulkAdd,
  handleDeleteEmployee,
  setWeeklyEvalModal,
  setQuickScoreModal,
  setEmployeeSettingsModal,
  setCategoryModal,
  getWeeklyScore,
  getEmployeeAverage,
  getCategoryScore,
  exportData,
  loading = false,
  DateRangePicker,
  presetThisMonth,
  presetPrevMonth,
  presetNextMonth,
  isDarkMode = true
}) {
  
  const scrollRef = useRef(null);
  
  // Initialize data model on mount
  useEffect(() => {
    initializeCreativeData();
  }, []);
  
  // Local state for Creative-specific features
  const [creativeMode, setCreativeMode] = useState('analytics'); // Changed default to 'analytics'
  const [showCreativeMetrics, setShowCreativeMetrics] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [chartModal, setChartModal] = useState(null);
  const [showTestTypesModal, setShowTestTypesModal] = useState(false);
  const [showPlatformTypesModal, setShowPlatformTypesModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [testTypes, setTestTypes] = useState(() => getGlobalTestTypes());
  const [platformTypes, setPlatformTypes] = useState(() => getGlobalPlatforms());
  const [activeTestType, setActiveTestType] = useState(() => {
    const types = getGlobalTestTypes();
    return types[0]?.id || 'vct';
  });
  const [scoringDesign, setScoringDesign] = useState(() => {
    const saved = localStorage.getItem('hr_creative_scoring_design');
    return saved !== null ? saved : 'liquid'; // 'minimal' or 'liquid'
  });
  const [cellHeight, setCellHeight] = useState(() => {
    const saved = localStorage.getItem('hr_creative_cell_height');
    return saved !== null ? parseInt(saved) : 70; // Default 70px height
  });
  const [showSidebar, setShowSidebar] = useState(() => {
    // Check localStorage first, then default based on screen size
    const saved = localStorage.getItem('hr_creative_sidebar_visible');
    if (saved !== null) {
      return JSON.parse(saved);
    }
    // Default to true on desktop, false on mobile
    return window.innerWidth >= 1024;
  });
  const [showKPICards, setShowKPICards] = useState(() => {
    // Check localStorage first, default to true
    const saved = localStorage.getItem('hr_creative_kpi_visible');
    return saved !== null ? JSON.parse(saved) : true;
  });
  
  // Save sidebar state to localStorage when it changes
  useEffect(() => {
    localStorage.setItem('hr_creative_sidebar_visible', JSON.stringify(showSidebar));
  }, [showSidebar]);
  
  // Save KPI cards state to localStorage when it changes
  useEffect(() => {
    localStorage.setItem('hr_creative_kpi_visible', JSON.stringify(showKPICards));
  }, [showKPICards]);
  
  // Save scoring design to localStorage when it changes
  useEffect(() => {
    localStorage.setItem('hr_creative_scoring_design', scoringDesign);
  }, [scoringDesign]);
  
  // Save cell height to localStorage when it changes
  useEffect(() => {
    localStorage.setItem('hr_creative_cell_height', cellHeight.toString());
  }, [cellHeight]);
  
  // Filter products based on search
  const filteredEmployees = employees.filter(emp => {
    if (!searchTerm) return true;
    const search = searchTerm.toLowerCase();
    return emp.name?.toLowerCase().includes(search) || 
           emp.sku?.toLowerCase().includes(search) ||
           emp.category?.toLowerCase().includes(search);
  });
  
  // Calculate metrics from actual table data
  const calculateMetrics = () => {
    const testMetrics = {};
    let overallCount = 0, overallTotal = 0;
    
    // Initialize metrics for each test type
    testTypes.forEach(test => {
      testMetrics[test.id] = { count: 0, total: 0 };
    });
    
    // Calculate scores for the active test type
    const activeTest = testTypes.find(t => t.id === activeTestType);
    if (activeTest) {
      const allowedPlatforms = getGlobalAllowedPlatforms(activeTestType);
      
      filteredEmployees.forEach(emp => {
        weeks.forEach(week => {
          allowedPlatforms.forEach(platformId => {
            const score = getScore(emp.id, activeTestType, platformId, week.key);
            if (score !== null) {
              testMetrics[activeTestType].count++;
              testMetrics[activeTestType].total += score;
              overallCount++;
              overallTotal += score;
            }
          });
        });
      });
    }
    
    // Build result object with test type data
    const result = {
      overallAvg: overallCount > 0 ? (overallTotal / overallCount).toFixed(1) : '0.0',
      testTypeData: {}
    };
    
    // Add metrics for each test type
    testTypes.forEach(test => {
      const metrics = testMetrics[test.id];
      result.testTypeData[test.id] = {
        count: metrics.count,
        avg: metrics.count > 0 ? (metrics.total / metrics.count).toFixed(1) : '0.0',
        percent: metrics.count > 0 ? Math.round((metrics.total / metrics.count) * 10) : 0
      };
    });
    
    return result;
  };
  
  const metrics = calculateMetrics();
  
  return (
    <div className="flex flex-col h-full w-full overflow-hidden" style={{ maxWidth: '100vw' }}>
      <SectionHeader 
        icon={Sparkles}
        iconColorClass="from-purple-400/20 to-pink-600/20"
        iconBorderClass="border-purple-400/30"
        iconColor="text-purple-300"
        title="Creative Product Scoring Matrix"
        subtitle="Enhanced product evaluation with creative metrics"
        mode={creativeMode}
        onModeChange={setCreativeMode}
        modes={[
          { value: 'analytics', label: 'Analytics', color: 'pink' },
          { value: 'configuration', label: 'Configuration', color: 'purple' }
        ]}
        showKPICards={showKPICards}
        onToggleKPICards={() => setShowKPICards(prev => !prev)}
        showSidebar={showSidebar}
        onToggleSidebar={() => setShowSidebar(prev => !prev)}
      />

      {/* Test Metrics Cards - Only show in analytics mode and when enabled */}
      {creativeMode === 'analytics' && showCreativeMetrics && showKPICards && (
        <div className="flex gap-2 lg:gap-4 mx-3 lg:mx-6 mb-3 lg:mb-4 overflow-x-auto">
          {/* Dynamic test type cards */}
          {testTypes.map(test => {
            const testData = metrics.testTypeData[test.id] || { count: 0, avg: '0.0', percent: 0 };
            const Icon = getIcon(test.iconName);
            const avgNum = parseFloat(testData.avg);
            const isActive = test.id === activeTestType;
            
            return (
              <div 
                key={test.id} 
                className={`glass-card p-2 lg:p-3 rounded-xl lg:rounded-2xl relative overflow-hidden flex-shrink-0 transition-all cursor-pointer ${
                  isActive ? 'ring-2 ring-purple-400 bg-gradient-to-br from-purple-500/20 to-pink-500/20' : 'bg-gradient-to-br from-purple-500/10 to-pink-500/10'
                }`} 
                style={{minWidth: '140px'}}
                onClick={() => setActiveTestType(test.id)}
              >
                <div className={`absolute inset-0 opacity-20 ${
                  avgNum >= 9 ? 'bg-gradient-to-br from-green-500 to-green-600' :
                  avgNum >= 7 ? 'bg-gradient-to-br from-green-400 to-green-500' :
                  avgNum >= 5 ? 'bg-gradient-to-br from-yellow-400 to-yellow-500' :
                  avgNum >= 3 ? 'bg-gradient-to-br from-orange-500 to-orange-600' :
                  avgNum > 0 ? 'bg-gradient-to-br from-red-500 to-red-600' : ''
                }`} />
                <div className="relative z-10">
                  <div className="flex items-center gap-2 mb-2">
                    <Icon className={`text-${test.color}-400`} size={16} />
                    <h3 className="font-semibold text-white text-sm">{test.short || test.name}</h3>
                  </div>
                  <div className="flex items-baseline gap-1">
                    <span className="text-2xl lg:text-3xl font-bold text-white">{testData.avg}</span>
                    <span className="text-xs text-white/50">/ 10</span>
                  </div>
                  <div className={`mt-1 h-1 rounded-full bg-white/10 overflow-hidden`}>
                    <div className={`h-full transition-all duration-500 ${
                      avgNum >= 9 ? 'bg-green-500' :
                      avgNum >= 7 ? 'bg-green-400' :
                      avgNum >= 5 ? 'bg-yellow-400' :
                      avgNum >= 3 ? 'bg-orange-500' :
                      avgNum > 0 ? 'bg-red-500' : 'bg-gray-500'
                    }`} style={{width: `${testData.percent}%`}} />
                  </div>
                  <div className="text-xs text-white/60 mt-1">{testData.count} tests completed</div>
                </div>
              </div>
            );
          })}

          <div className="glass-card p-2 lg:p-3 rounded-xl lg:rounded-2xl bg-gradient-to-br from-pink-500/10 to-orange-500/10 relative overflow-hidden flex-shrink-0" style={{minWidth: '140px'}}>
            <div className={`absolute inset-0 opacity-20 ${
              metrics.overallAvg >= 9 ? 'bg-gradient-to-br from-green-500 to-green-600' :
              metrics.overallAvg >= 7 ? 'bg-gradient-to-br from-green-400 to-green-500' :
              metrics.overallAvg >= 5 ? 'bg-gradient-to-br from-yellow-400 to-yellow-500' :
              metrics.overallAvg >= 3 ? 'bg-gradient-to-br from-orange-500 to-orange-600' :
              metrics.overallAvg > 0 ? 'bg-gradient-to-br from-red-500 to-red-600' : ''
            }`} />
            <div className="relative z-10">
              <div className="flex items-center gap-2 mb-2">
                <Award className="text-orange-400" size={16} />
                <h3 className="font-semibold text-white text-sm">Overall Score</h3>
              </div>
              <div className="flex items-baseline gap-1">
                <span className="text-2xl lg:text-3xl font-bold text-white">{metrics.overallAvg}</span>
                <span className="text-xs text-white/50">/ 10</span>
              </div>
              <div className={`mt-1 h-1 rounded-full bg-white/10 overflow-hidden`}>
                <div className={`h-full transition-all duration-500 ${
                  metrics.overallAvg >= 9 ? 'bg-green-500' :
                  metrics.overallAvg >= 7 ? 'bg-green-400' :
                  metrics.overallAvg >= 5 ? 'bg-yellow-400' :
                  metrics.overallAvg >= 3 ? 'bg-orange-500' :
                  metrics.overallAvg > 0 ? 'bg-red-500' : 'bg-gray-500'
                }`} style={{width: `${metrics.overallAvg * 10}%`}} />
              </div>
              <div className="text-xs text-white/60 mt-1">All tests combined</div>
            </div>
          </div>
        </div>
      )}

      <div className={`grid ${showSidebar ? 'lg:grid-cols-[1fr,18rem]' : 'lg:grid-cols-1'} grid-cols-1 gap-3 lg:gap-6 flex-1 min-h-0 px-3 lg:px-6 pb-3 lg:pb-6`}>
        {/* Main table - Fixed width container with horizontal scroll */}
        <div className="min-w-0 overflow-hidden flex flex-col gap-4">
          {/* Test Type Toggle Switch */}
          <div className="glass-card-large p-3 lg:p-4">
            <div className="flex items-center justify-center gap-2">
              {testTypes.map((testType, index) => (
                <button
                  key={testType.id}
                  onClick={() => setActiveTestType(testType.id)}
                  className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                    activeTestType === testType.id
                      ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg shadow-purple-500/30'
                      : 'glass-button text-white/70 hover:text-white'
                  }`}
                >
                  {testType.short || testType.name}
                </button>
              ))}
            </div>
          </div>
          
          {/* Table Controls Bar */}
          <div className="glass-card-large p-3 lg:p-4">
            <div className="flex flex-wrap gap-2 lg:gap-3 items-center justify-between">
              <div className="flex flex-wrap gap-3 items-center">
                {DateRangePicker && (
                  <DateRangePicker 
                    startDate={startDate} 
                    endDate={endDate} 
                    onRangeChange={(start, end) => {
                      setStartDate(start);
                      setEndDate(end);
                    }}
                  />
                )}

                {presetPrevMonth && (
                  <div className="flex gap-2">
                    <button onClick={presetPrevMonth} className="glass-button px-3 py-2 text-sm">
                      ◀
                    </button>
                    <button onClick={presetThisMonth} className="glass-button px-3 py-2 text-sm">
                      This Month
                    </button>
                    <button onClick={presetNextMonth} className="glass-button px-3 py-2 text-sm">
                      ▶
                    </button>
                  </div>
                )}
                
                {/* Search Bar */}
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search products..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="glass-input pl-8 pr-3 py-2 text-sm w-48"
                  />
                  <svg 
                    className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
              </div>

              <div className="flex flex-wrap gap-2 items-center">
                {/* Export Button */}
                {exportData && (
                  <button
                    onClick={exportData}
                    className="glass-button inline-flex items-center gap-2 px-3 py-2 text-sm font-medium hover:scale-105"
                  >
                    <Download size={14} /> Export
                  </button>
                )}
                
                {/* Settings Button */}
                <button
                  onClick={() => setShowSettingsModal(true)}
                  className="glass-button inline-flex items-center gap-2 px-3 py-2 text-sm font-medium hover:scale-105"
                >
                  <Settings size={14} /> Settings
                </button>
              </div>
            </div>
          </div>

          {/* Table */}
          <div ref={scrollRef} className="overflow-x-auto overflow-y-auto flex-1 glass-card-large p-2">
            {loading ? (
              <div className="p-8 text-white/60">Loading...</div>
            ) : (
              <table className="w-max" style={{ borderCollapse: "separate", borderSpacing: "8px" }}>
                <thead>
                  <tr>
                    <th id="product-header-column" className="sticky top-0 left-0 z-20 glass-card p-2 text-left rounded-xl" style={{ 
                      minWidth: '20rem', 
                      maxWidth: '20rem',
                      backdropFilter: 'blur(4px)',
                      WebkitBackdropFilter: 'blur(4px)',
                      background: isDarkMode ? 'rgba(0, 0, 0, 0.5)' : 'rgba(255, 255, 255, 0.8)',
                      borderRight: isDarkMode ? '1px solid rgba(255, 255, 255, 0.2)' : '1px solid rgba(0, 0, 0, 0.1)'
                    }}>
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-white text-sm">Product</span>
                        <span className="text-xs text-white/60">Average</span>
                      </div>
                    </th>
                    {weeks.map(week => {
                      return (
                        <th 
                          key={week.key}
                          className="sticky top-0 z-5 glass-card text-xs font-semibold text-white rounded-lg"
                          style={{ 
                            minWidth: cellSize, 
                            width: cellSize,
                            backdropFilter: 'blur(4px)',
                            WebkitBackdropFilter: 'blur(4px)',
                            background: isDarkMode ? 'rgba(0, 0, 0, 0.5)' : 'rgba(255, 255, 255, 0.8)'
                          }}
                        >
                          <div className="text-center py-1.5 px-1">
                            <div className="text-sm">{week.monthName} {week.day}</div>
                            <div className="text-[10px] text-white/50">
                              {week.dayName}
                            </div>
                          </div>
                        </th>
                      );
                    })}
                  </tr>
                </thead>
                <tbody>
                  {filteredEmployees.map(emp => {
                    const avgScore = getEmployeeAverage ? getEmployeeAverage(emp.id) : null;
                    const avgStyles = avgScore ? tierStyles(avgScore) : {};
                    const isExpanded = expanded ? expanded[emp.id] : false;
                    
                    return (
                      <React.Fragment key={emp.id}>
                        {/* Main employee row */}
                        <tr className="group hover:bg-white/5">
                          <td className="product-row-column sticky left-0 z-10 glass-card border-r border-white/10 border-b border-white/10 p-2" style={{ 
                            minWidth: '20rem', 
                            maxWidth: '20rem',
                            backdropFilter: 'blur(4px)',
                            WebkitBackdropFilter: 'blur(4px)',
                            background: isDarkMode ? 'rgba(0, 0, 0, 0.5)' : 'rgba(255, 255, 255, 0.8)',
                            borderRight: isDarkMode ? '1px solid rgba(255, 255, 255, 0.2)' : '1px solid rgba(0, 0, 0, 0.1)'
                          }}>
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                {toggleExpand && (
                                  <button
                                    onClick={() => toggleExpand(emp.id)}
                                    className="p-1 rounded hover:bg-white/10"
                                    title={isExpanded ? "Collapse" : "Expand"}
                                  >
                                    <ChevronRight 
                                      size={16} 
                                      className={`text-white/60 transition-transform ${isExpanded ? 'rotate-90' : ''}`}
                                    />
                                  </button>
                                )}
                                <button
                                  onClick={() => setEditingProduct(emp)}
                                  className="p-1 rounded hover:bg-white/10"
                                >
                                  <Settings size={16} className="text-white/60" />
                                </button>
                                <div className="min-w-0 flex-1">
                                  <TruncatedTooltip content={emp.name} variant="default">
                                    <div className="font-medium text-white leading-tight" 
                                         style={{ 
                                           display: '-webkit-box',
                                           WebkitLineClamp: '2',
                                           WebkitBoxOrient: 'vertical',
                                           overflow: 'hidden',
                                           lineHeight: '1.3',
                                           maxHeight: '2.6em'
                                         }}>
                                      {emp.name}
                                    </div>
                                  </TruncatedTooltip>
                                  <div className="flex items-center gap-1 text-xs">
                                    <span className={`${emp.stock <= (emp.minStock || 10) ? 'text-orange-400' : 'text-white/50'}`}>
                                      Stock: {emp.stock || 0}
                                    </span>
                                    {/* Low Stock Warning Icon */}
                                    {emp.stock <= (emp.minStock || 10) && (
                                      <LowStockTooltip emp={emp} />
                                    )}
                                  </div>
                                  {/* Creative Badge for high scoring products */}
                                  {creativeMode === 'creative' && avgScore && avgScore >= 8 && (
                                    <div className="inline-flex items-center gap-1 mt-1 px-2 py-0.5 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 text-white text-xs">
                                      <Sparkles size={10} />
                                      Top Product
                                    </div>
                                  )}
                                </div>
                              </div>
                              <div className="flex items-center gap-2">
                                {avgScore && (
                                  <div className="flex items-center gap-2">
                                    <span className="text-xs text-white/50">Avg:</span>
                                    <div className={`px-2 py-1 rounded-lg ${avgStyles.bg} ${avgStyles.text} text-sm font-bold`}>
                                      {avgScore}
                                    </div>
                                  </div>
                                )}
                                {handleDeleteEmployee && (
                                  <>
                                    <button
                                      onClick={() => setChartModal({ employee: emp, startDate, endDate })}
                                      className="p-1 rounded hover:bg-blue-500/20 text-blue-400 opacity-0 group-hover:opacity-100"
                                    >
                                      <LineChart size={14} />
                                    </button>
                                    <button
                                      onClick={() => handleDeleteEmployee(emp.id)}
                                      className="p-1 rounded hover:bg-red-500/20 text-red-400 opacity-0 group-hover:opacity-100"
                                    >
                                      <Trash2 size={14} />
                                    </button>
                                  </>
                                )}
                              </div>
                            </div>
                          </td>
                          
                          {weeks.map(week => {
                            // Get all category scores for this product and week
                            const categoryScores = categories.map(cat => ({
                              key: cat.key,
                              label: cat.key, // Use the key directly (VCT, SCT, ACT)
                              score: getCategoryScore ? getCategoryScore(emp.id, week.key, cat.key) : null,
                              color: cat.tag
                            })).filter(item => item.score !== null);
                            
                            return (
                              <td 
                                key={week.key}
                                className="border-b border-white/10 hover:bg-white/5"
                                style={{ minWidth: cellSize, width: cellSize, height: cellHeight }}
                              >
                                <div className={`flex flex-col items-center justify-center ${
                                  cellHeight <= 30 ? 'p-0 gap-0' : 
                                  cellHeight <= 50 ? 'p-0.5 gap-0.5' : 
                                  'p-1 gap-1'
                                }`}>
                                  {categoryScores.length > 0 ? (
                                    scoringDesign === 'minimal' ? (
                                      // Minimal Design (Original)
                                      <div className={`glass-card ${
                                        cellHeight <= 30 ? 'p-0.5 rounded-sm' : 
                                        cellHeight <= 50 ? 'p-1 rounded-md' : 
                                        'p-1.5 rounded-lg'
                                      } w-full`}>
                                        {platformScores.map((item, idx) => {
                                          // Get score-based colors
                                          const getBarColor = () => {
                                            const score = item.score;
                                            if (score >= 9) return 'bg-gradient-to-r from-green-400 to-green-500';
                                            if (score >= 7) return 'bg-gradient-to-r from-green-300 to-green-400';
                                            if (score >= 5) return 'bg-gradient-to-r from-yellow-300 to-yellow-400';
                                            if (score >= 3) return 'bg-gradient-to-r from-orange-400 to-orange-500';
                                            return 'bg-gradient-to-r from-red-400 to-red-500';
                                          };
                                          
                                          // Get test type color for label
                                          const getLabelColor = () => {
                                            if (item.key === 'VCT') return 'text-purple-300';
                                            if (item.key === 'SCT') return 'text-blue-300';
                                            if (item.key === 'ACT') return 'text-green-300';
                                            return 'text-gray-300';
                                          };
                                          
                                          return (
                                            <div 
                                              key={item.key}
                                              className={`group cursor-pointer hover:scale-[1.02] transition-all ${idx > 0 ? 'mt-1' : ''}`}
                                              onClick={(e) => {
                                                e.stopPropagation();
                                                if (setQuickScoreModal) {
                                                  setQuickScoreModal({
                                                    employee: emp,
                                                    week: week,
                                                    testType: activeTest,
                                                    platform: platformTypes.find(p => p.id === item.key),
                                                    currentScore: item.score
                                                  });
                                                }
                                              }}
                                            >
                                              <div className="flex items-center justify-between mb-0.5">
                                                <span className={`text-[9px] font-bold ${getLabelColor()} tracking-wide`}>
                                                  {item.label}
                                                </span>
                                                <span className="text-[10px] text-white font-bold">
                                                  {item.score}
                                                </span>
                                              </div>
                                              <div className="w-full bg-white/5 rounded-full h-1 overflow-hidden">
                                                <div 
                                                  className={`h-full ${getBarColor()} transition-all duration-500 rounded-full shadow-sm`}
                                                  style={{ width: `${item.score * 10}%` }}
                                                />
                                              </div>
                                            </div>
                                          );
                                        })}
                                      </div>
                                    ) : (
                                      // Liquid Glass Design
                                      <div className="w-full space-y-1">
                                        {platformScores.map((item, idx) => {
                                        // Get score-based gradient colors and backgrounds
                                        const getScoreStyle = () => {
                                          const score = item.score;
                                          if (score >= 9) return {
                                            background: 'linear-gradient(135deg, rgba(34, 197, 94, 0.25) 0%, rgba(21, 128, 61, 0.35) 100%)',
                                            border: '1px solid rgba(34, 197, 94, 0.4)',
                                            glow: 'drop-shadow(0 0 8px rgba(34, 197, 94, 0.3))',
                                            textColor: 'text-green-200'
                                          };
                                          if (score >= 7) return {
                                            background: 'linear-gradient(135deg, rgba(34, 197, 94, 0.2) 0%, rgba(22, 163, 74, 0.3) 100%)',
                                            border: '1px solid rgba(34, 197, 94, 0.35)',
                                            glow: 'drop-shadow(0 0 6px rgba(34, 197, 94, 0.25))',
                                            textColor: 'text-green-300'
                                          };
                                          if (score >= 5) return {
                                            background: 'linear-gradient(135deg, rgba(251, 191, 36, 0.2) 0%, rgba(245, 158, 11, 0.3) 100%)',
                                            border: '1px solid rgba(251, 191, 36, 0.35)',
                                            glow: 'drop-shadow(0 0 6px rgba(251, 191, 36, 0.25))',
                                            textColor: 'text-yellow-200'
                                          };
                                          if (score >= 3) return {
                                            background: 'linear-gradient(135deg, rgba(249, 115, 22, 0.2) 0%, rgba(234, 88, 12, 0.3) 100%)',
                                            border: '1px solid rgba(249, 115, 22, 0.35)',
                                            glow: 'drop-shadow(0 0 6px rgba(249, 115, 22, 0.25))',
                                            textColor: 'text-orange-200'
                                          };
                                          return {
                                            background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.2) 0%, rgba(220, 38, 38, 0.3) 100%)',
                                            border: '1px solid rgba(239, 68, 68, 0.35)',
                                            glow: 'drop-shadow(0 0 6px rgba(239, 68, 68, 0.25))',
                                            textColor: 'text-red-200'
                                          };
                                        };
                                        
                                        // Get test type specific styling
                                        const getTestTypeStyle = () => {
                                          if (item.key === 'VCT') return {
                                            accent: 'rgba(147, 51, 234, 0.3)',
                                            textColor: 'text-purple-200',
                                            iconBg: 'bg-gradient-to-br from-purple-500/20 to-purple-600/30'
                                          };
                                          if (item.key === 'SCT') return {
                                            accent: 'rgba(59, 130, 246, 0.3)',
                                            textColor: 'text-blue-200',
                                            iconBg: 'bg-gradient-to-br from-blue-500/20 to-blue-600/30'
                                          };
                                          if (item.key === 'ACT') return {
                                            accent: 'rgba(34, 197, 94, 0.3)',
                                            textColor: 'text-green-200',
                                            iconBg: 'bg-gradient-to-br from-green-500/20 to-green-600/30'
                                          };
                                          return {
                                            accent: 'rgba(156, 163, 175, 0.3)',
                                            textColor: 'text-gray-200',
                                            iconBg: 'bg-gradient-to-br from-gray-500/20 to-gray-600/30'
                                          };
                                        };
                                        
                                        const scoreStyle = getScoreStyle();
                                        const testStyle = getTestTypeStyle();
                                        
                                        return (
                                          <div 
                                            key={item.key}
                                            className="group cursor-pointer transition-all duration-300 hover:scale-[1.03] active:scale-[0.98]"
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              const category = categories.find(c => c.key === item.key);
                                              if (category && setQuickScoreModal) {
                                                setQuickScoreModal({
                                                  employee: emp,
                                                  week: week,
                                                  category: category,
                                                  currentScore: item.score
                                                });
                                              }
                                            }}
                                            style={{ 
                                              background: scoreStyle.background,
                                              border: scoreStyle.border,
                                              borderRadius: '12px',
                                              backdropFilter: 'blur(12px)',
                                              WebkitBackdropFilter: 'blur(12px)',
                                              boxShadow: '0 4px 16px rgba(0, 0, 0, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.1)',
                                              filter: scoreStyle.glow
                                            }}
                                          >
                                            <div className="flex items-center justify-between p-2">
                                              {/* Test Type Badge */}
                                              <div className="flex items-center gap-1.5">
                                                <div 
                                                  className={`w-4 h-4 rounded-full ${testStyle.iconBg} flex items-center justify-center`}
                                                  style={{
                                                    boxShadow: `0 0 6px ${testStyle.accent}`
                                                  }}
                                                >
                                                  <span className={`text-[8px] font-bold ${testStyle.textColor}`}>
                                                    {item.key[0]}
                                                  </span>
                                                </div>
                                                <span className={`text-[9px] font-bold ${testStyle.textColor} tracking-wide`}>
                                                  {item.label}
                                                </span>
                                              </div>
                                              
                                              {/* Score Display */}
                                              <div className="flex items-center gap-1">
                                                <div 
                                                  className={`px-2 py-0.5 rounded-full ${scoreStyle.textColor} font-bold text-[10px]`}
                                                  style={{
                                                    background: 'rgba(255, 255, 255, 0.15)',
                                                    backdropFilter: 'blur(8px)',
                                                    WebkitBackdropFilter: 'blur(8px)',
                                                    border: '1px solid rgba(255, 255, 255, 0.2)',
                                                    boxShadow: 'inset 0 1px 0 rgba(255, 255, 255, 0.2)'
                                                  }}
                                                >
                                                  {item.score}
                                                </div>
                                              </div>
                                            </div>
                                            
                                            {/* Animated Progress Line */}
                                            <div className="px-2 pb-2">
                                              <div 
                                                className="w-full h-1 rounded-full overflow-hidden"
                                                style={{
                                                  background: 'rgba(255, 255, 255, 0.1)',
                                                  backdropFilter: 'blur(4px)'
                                                }}
                                              >
                                                <div 
                                                  className="h-full rounded-full transition-all duration-1000 ease-out"
                                                  style={{ 
                                                    width: `${item.score * 10}%`,
                                                    background: `linear-gradient(90deg, ${testStyle.accent}, rgba(255, 255, 255, 0.4))`,
                                                    boxShadow: `0 0 4px ${testStyle.accent}`
                                                  }}
                                                />
                                              </div>
                                            </div>
                                          </div>
                                        );
                                        })}
                                      </div>
                                    )
                                  ) : (
                                    <div 
                                      className="w-full h-12 flex items-center justify-center rounded-xl transition-all duration-300 hover:scale-105 cursor-pointer border border-dashed border-white/20 hover:border-white/30"
                                      style={{
                                        background: 'rgba(255, 255, 255, 0.03)',
                                        backdropFilter: 'blur(8px)',
                                        WebkitBackdropFilter: 'blur(8px)'
                                      }}
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        const allowedPlatforms = getGlobalAllowedPlatforms(activeTestType);
                                        if (setQuickScoreModal && allowedPlatforms.length > 0) {
                                          const firstPlatform = platformTypes.find(p => p.id === allowedPlatforms[0]);
                                          setQuickScoreModal({
                                            employee: emp,
                                            week: week,
                                            testType: activeTest,
                                            platform: firstPlatform,
                                            currentScore: null
                                          });
                                        }
                                      }}
                                    >
                                      <span className="text-white/30 text-xs font-medium">+</span>
                                    </div>
                                  )}
                                </div>
                              </td>
                            );
                          })}
                        </tr>
                        
                        {/* Expanded platform rows */}
                        {isExpanded && getGlobalAllowedPlatforms(activeTestType).map(platformId => {
                          const platform = platformTypes.find(p => p.id === platformId);
                          if (!platform) return null;
                          const Icon = getIcon(platform.iconName);
                          
                          // Calculate platform average for this product
                          const platformScores = [];
                          weeks.forEach(week => {
                            const score = getScore(emp.id, activeTestType, platform.id, week.key);
                            if (score !== null) platformScores.push(score);
                          });
                          const platformAvg = platformScores.length > 0
                            ? (platformScores.reduce((sum, s) => sum + s, 0) / platformScores.length).toFixed(1)
                            : null;
                          
                          return (
                            <tr key={platform.id} className="bg-white/5">
                              <td className={`product-platform-column sticky left-0 z-10 glass-card border-r border-white/10 border-b border-white/10 p-2 pl-12 border-l-4 border-l-${platform.color}-500`} style={{ 
                                minWidth: '20rem', 
                                maxWidth: '20rem',
                                backdropFilter: 'blur(4px)',
                                WebkitBackdropFilter: 'blur(4px)',
                                background: isDarkMode ? 'rgba(0, 0, 0, 0.5)' : 'rgba(255, 255, 255, 0.8)',
                                borderRight: isDarkMode ? '1px solid rgba(255, 255, 255, 0.2)' : '1px solid rgba(0, 0, 0, 0.1)'
                              }}>
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-2">
                                    <div className={`p-1 rounded bg-${platform.color}-500`}>
                                      <Icon size={12} className="text-white" />
                                    </div>
                                    <span className="text-sm font-medium text-white/80">{platform.name}</span>
                                  </div>
                                  {platformAvg && (
                                    <div className="flex items-center gap-1">
                                      <span className="text-xs text-white/40">Avg:</span>
                                      <span className="text-xs font-bold text-white/60">{platformAvg}</span>
                                    </div>
                                  )}
                                </div>
                              </td>
                              
                              {weeks.map(week => {
                                const platformScore = getScore(emp.id, activeTestType, platform.id, week.key);
                                const styles = platformScore ? tierStyles(platformScore) : {};
                                
                                return (
                                  <td 
                                    key={week.key}
                                    className="border-b border-white/10 hover:bg-white/5 cursor-pointer group/cell"
                                    style={{ minWidth: cellSize, width: cellSize, height: cellHeight }}
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setQuickScoreModal && setQuickScoreModal({
                                        employee: emp,
                                        week: week,
                                        testType: activeTest,
                                        platform: platform,
                                        currentScore: platformScore
                                      });
                                    }}
                                  >
                                    <div className={`relative flex items-center justify-center ${
                                      cellHeight <= 30 ? 'py-0' : 
                                      cellHeight <= 50 ? 'py-0.5' : 
                                      'py-1'
                                    }`}>
                                      {platformScore ? (
                                        scoringDesign === 'minimal' ? (
                                          // Minimal Design for expanded category rows
                                          <div className={`${
                                            cellHeight <= 30 ? 'h-5 w-5 text-[10px]' : 
                                            cellHeight <= 50 ? 'h-6 w-6 text-xs' : 
                                            'h-8 w-8 text-sm'
                                          } rounded-lg ${styles.bg} ${styles.text} font-semibold grid place-items-center`}>
                                            {platformScore}
                                          </div>
                                        ) : (
                                          // Liquid Glass Design for expanded category rows
                                          <div 
                                            className="relative group cursor-pointer transition-all duration-300 hover:scale-105 active:scale-95"
                                            style={{
                                              width: cellHeight <= 30 ? '1.25rem' : cellHeight <= 50 ? '1.5rem' : '1.75rem',
                                              height: cellHeight <= 30 ? '1.25rem' : cellHeight <= 50 ? '1.5rem' : '1.75rem'
                                            }}
                                          >
                                            {(() => {
                                              // Get score-based styling
                                              const getScoreStyle = (score) => {
                                                if (score >= 9) return {
                                                  background: 'linear-gradient(135deg, rgba(34, 197, 94, 0.2) 0%, rgba(21, 128, 61, 0.3) 100%)',
                                                  border: '1px solid rgba(34, 197, 94, 0.4)',
                                                  glow: '0 0 6px rgba(34, 197, 94, 0.2)',
                                                  textColor: 'text-green-100'
                                                };
                                                if (score >= 7) return {
                                                  background: 'linear-gradient(135deg, rgba(34, 197, 94, 0.15) 0%, rgba(22, 163, 74, 0.25) 100%)',
                                                  border: '1px solid rgba(34, 197, 94, 0.35)',
                                                  glow: '0 0 5px rgba(34, 197, 94, 0.15)',
                                                  textColor: 'text-green-200'
                                                };
                                                if (score >= 5) return {
                                                  background: 'linear-gradient(135deg, rgba(251, 191, 36, 0.15) 0%, rgba(245, 158, 11, 0.25) 100%)',
                                                  border: '1px solid rgba(251, 191, 36, 0.35)',
                                                  glow: '0 0 5px rgba(251, 191, 36, 0.15)',
                                                  textColor: 'text-yellow-100'
                                                };
                                                if (score >= 3) return {
                                                  background: 'linear-gradient(135deg, rgba(249, 115, 22, 0.15) 0%, rgba(234, 88, 12, 0.25) 100%)',
                                                  border: '1px solid rgba(249, 115, 22, 0.35)',
                                                  glow: '0 0 5px rgba(249, 115, 22, 0.15)',
                                                  textColor: 'text-orange-100'
                                                };
                                                return {
                                                  background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.15) 0%, rgba(220, 38, 38, 0.25) 100%)',
                                                  border: '1px solid rgba(239, 68, 68, 0.35)',
                                                  glow: '0 0 5px rgba(239, 68, 68, 0.15)',
                                                  textColor: 'text-red-100'
                                                };
                                              };

                                              // Get platform-specific accent color
                                              const getPlatformAccent = (platformId) => {
                                                if (platformId === 'meta') return 'rgba(59, 130, 246, 0.2)';
                                                if (platformId === 'tiktok') return 'rgba(236, 72, 153, 0.2)';
                                                if (platformId === 'youtube') return 'rgba(239, 68, 68, 0.2)';
                                                return 'rgba(156, 163, 175, 0.2)';
                                              };

                                              const scoreStyle = getScoreStyle(platformScore);
                                              const platformAccent = getPlatformAccent(platform.id);

                                              return (
                                                <div
                                                  className={`w-full h-full rounded-lg flex items-center justify-center font-bold text-sm ${scoreStyle.textColor} relative overflow-hidden`}
                                                  style={{
                                                    background: scoreStyle.background,
                                                    border: scoreStyle.border,
                                                    backdropFilter: 'blur(16px)',
                                                    WebkitBackdropFilter: 'blur(16px)',
                                                    boxShadow: `${scoreStyle.glow}, inset 0 1px 0 rgba(255, 255, 255, 0.2)`,
                                                    position: 'relative'
                                                  }}
                                                >
                                                  
                                                  {/* Score number */}
                                                  <span className="relative z-10 drop-shadow-lg">
                                                    {platformScore}
                                                  </span>
                                                </div>
                                              );
                                            })()}
                                          </div>
                                        )
                                      ) : (
                                        scoringDesign === 'minimal' ? (
                                          // Minimal empty state
                                          <div className="h-8 w-8 rounded-lg border border-dashed border-white/30 text-white/40 grid place-items-center text-xs hover:border-white/50">
                                            +
                                          </div>
                                        ) : (
                                          // Liquid Glass empty state
                                          <div 
                                            className="w-7 h-7 rounded-lg border-2 border-dashed transition-all duration-300 hover:scale-105 hover:border-white/40 cursor-pointer grid place-items-center group"
                                            style={{
                                              borderColor: 'rgba(255, 255, 255, 0.2)',
                                              background: 'rgba(255, 255, 255, 0.05)',
                                              backdropFilter: 'blur(8px)',
                                              WebkitBackdropFilter: 'blur(8px)',
                                              boxShadow: 'inset 0 1px 0 rgba(255, 255, 255, 0.1)'
                                            }}
                                          >
                                            <span className="text-white/30 text-xs font-medium group-hover:text-white/50 transition-colors">+</span>
                                          </div>
                                        )
                                      )}
                                    </div>
                                  </td>
                                );
                              })}
                            </tr>
                          );
                        })}
                      </React.Fragment>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* Right sidebar - Collapsible */}
        {showSidebar && (
        <div className="space-y-3 lg:space-y-4 overflow-y-auto h-full lg:h-full lg:max-h-none max-h-96">
          {/* Test Insights Panel - Only in Analytics mode */}
          {creativeMode === 'analytics' && (
            <div className="glass-card-large p-4 lg:p-5 bg-gradient-to-br from-purple-500/5 to-pink-500/5">
              <h3 className="font-semibold text-white mb-4 flex items-center gap-2">
                <Sparkles className="text-purple-400" size={20} />
                Test Performance Insights
              </h3>
              <div className="space-y-3">
                <h4 className="text-xs text-white/60 uppercase tracking-wide">Active: {testTypes.find(t => t.id === activeTestType)?.name}</h4>
                {getGlobalAllowedPlatforms(activeTestType).map(platformId => {
                  const platform = platformTypes.find(p => p.id === platformId);
                  if (!platform) return null;
                  
                  // Calculate platform score average for active test type
                  let platformCount = 0;
                  let platformTotal = 0;
                  filteredEmployees.forEach(emp => {
                    weeks.forEach(week => {
                      const score = getScore(emp.id, activeTestType, platform.id, week.key);
                      if (score !== null) {
                        platformCount++;
                        platformTotal += score;
                      }
                    });
                  });
                  
                  const platformAvg = platformCount > 0 ? (platformTotal / platformCount).toFixed(1) : '0.0';
                  const platformPercent = platformCount > 0 ? Math.round((platformTotal / platformCount) * 10) : 0;
                  const textColor = `text-${platform.color}-400`;
                  const colorClass = `from-${platform.color}-400`;
                  
                  return (
                    <div key={platform.id} className="text-sm text-white/80">
                      <div className="flex justify-between mb-2">
                        <span>{platform.name}</span>
                        <span className={`font-bold ${textColor}`}>{platformPercent}%</span>
                      </div>
                      <div className="w-full bg-white/10 rounded-full h-2">
                        <div className={`bg-gradient-to-r ${colorClass} to-pink-400 h-2 rounded-full`} style={{width: `${platformPercent}%`}}></div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}


          {/* Test Types & Platform Types - Only in Configuration mode */}
          {creativeMode === 'configuration' && (
            <>
              {/* Test Types Section */}
              <div className="glass-card-large p-4 lg:p-5">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold text-white">Test Types</h3>
                  <button
                    onClick={() => setShowTestTypesModal(true)}
                    className="glass-button p-2 hover:scale-110"
                  >
                    <Settings size={16} />
                  </button>
                </div>
                
                <div className="space-y-2">
                  {testTypes.map(test => {
                    const Icon = getIcon(test.iconName);
                    const allowedPlatforms = getGlobalAllowedPlatforms(test.id);
                    return (
                      <div key={test.id} className="glass-card p-3 rounded-xl hover:scale-105 transition-all duration-300">
                        <div className="flex items-start gap-3">
                          <div className={`p-2 rounded-xl bg-${test.color}-500 shadow-lg`}>
                            <Icon size={16} className="text-white" />
                          </div>
                          <div className="flex-1">
                            <div className="font-semibold text-white">{test.name}</div>
                            <div className="text-xs text-white/60 mt-1">{test.description}</div>
                            <div className="flex gap-1 mt-2">
                              {allowedPlatforms.map(pid => {
                                const platform = platformTypes.find(p => p.id === pid);
                                return platform ? (
                                  <span key={pid} className={`text-xs px-2 py-0.5 rounded-full bg-${platform.color}-500/20 text-${platform.color}-300`}>
                                    {platform.name}
                                  </span>
                                ) : null;
                              })}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
              
              {/* Platform Types Section */}
              <div className="glass-card-large p-4 lg:p-5">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold text-white">Platform Types</h3>
                  <button
                    onClick={() => setShowPlatformTypesModal(true)}
                    className="glass-button p-2 hover:scale-110"
                  >
                    <Settings size={16} />
                  </button>
                </div>
                
                <div className="space-y-2">
                  {platformTypes.map(platform => {
                    const Icon = getIcon(platform.iconName);
                    return (
                      <div key={platform.id} className="glass-card p-3 rounded-xl hover:scale-105 transition-all duration-300">
                        <div className="flex items-start gap-3">
                          <div className={`p-2 rounded-xl bg-${platform.color}-500 shadow-lg`}>
                            <Icon size={16} className="text-white" />
                          </div>
                          <div className="flex-1">
                            <div className="font-semibold text-white">{platform.name}</div>
                            <div className="text-xs text-white/60 mt-1">{platform.description}</div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </>
          )}

          {/* Performance Scale - Only in Configuration mode */}
          {creativeMode === 'configuration' && (
            <div className="glass-card-large p-4 lg:p-5">
              <h3 className="font-semibold text-white mb-3">Performance Scale</h3>
              <div className="space-y-2">
              <div className="glass-card p-3 rounded-2xl flex items-center gap-3">
                <div className="h-6 w-6 rounded-full bg-gradient-to-br from-green-400 to-green-600 flex-shrink-0 shadow-lg shadow-green-500/30" />
                <div>
                  <div className="font-semibold text-white">Exceptional (9-10)</div>
                  <div className="text-xs text-white/60">Outstanding performance</div>
                </div>
              </div>
              <div className="glass-card p-3 rounded-2xl flex items-center gap-3">
                <div className="h-6 w-6 rounded-full bg-gradient-to-br from-green-300 to-green-500 flex-shrink-0 shadow-lg shadow-green-400/30" />
                <div>
                  <div className="font-semibold text-white">Exceeds (7-8)</div>
                  <div className="text-xs text-white/60">Above expectations</div>
                </div>
              </div>
              <div className="glass-card p-3 rounded-2xl flex items-center gap-3">
                <div className="h-6 w-6 rounded-full bg-gradient-to-br from-yellow-300 to-yellow-500 flex-shrink-0 shadow-lg shadow-yellow-400/30" />
                <div>
                  <div className="font-semibold text-white">Meets (5-6)</div>
                  <div className="text-xs text-white/60">Satisfactory</div>
                </div>
              </div>
              <div className="glass-card p-3 rounded-2xl flex items-center gap-3">
                <div className="h-6 w-6 rounded-full bg-gradient-to-br from-orange-400 to-orange-600 flex-shrink-0 shadow-lg shadow-orange-500/30" />
                <div>
                  <div className="font-semibold text-white">Needs Improvement (3-4)</div>
                  <div className="text-xs text-white/60">Below expectations</div>
                </div>
              </div>
              <div className="glass-card p-3 rounded-2xl flex items-center gap-3">
                <div className="h-6 w-6 rounded-full bg-gradient-to-br from-red-500 to-red-700 flex-shrink-0 shadow-lg shadow-red-600/30" />
                <div>
                  <div className="font-semibold text-white">Unsatisfactory (1-2)</div>
                  <div className="text-xs text-white/60">Immediate action required</div>
                </div>
              </div>
            </div>
          </div>
          )}
        </div>
        )}
      </div>
      
      {/* Test Types Configuration Modal */}
      {showTestTypesModal && (
        <TestTypesModal 
          onClose={() => setShowTestTypesModal(false)}
          onUpdate={(updated) => setTestTypes(updated)}
        />
      )}
      
      {/* Platform Types Configuration Modal */}
      {showPlatformTypesModal && (
        <PlatformTypesModal 
          onClose={() => setShowPlatformTypesModal(false)}
        />
      )}
      
      {/* Score Chart Modal */}
      {chartModal && (
        <ScoreChartModal 
          data={chartModal}
          categories={categories}
          getCategoryScore={getCategoryScore}
          onClose={() => setChartModal(null)}
          DateRangePicker={DateRangePicker}
        />
      )}
      
      {/* Settings Modal */}
      {showSettingsModal && (
        <SettingsModal 
          scoringDesign={scoringDesign}
          setScoringDesign={setScoringDesign}
          cellSize={cellSize}
          setCellSize={setCellSize}
          cellHeight={cellHeight}
          setCellHeight={setCellHeight}
          onClose={() => setShowSettingsModal(false)}
        />
      )}
      
      {/* Product Settings Modal */}
      {editingProduct && (
        <ProductSettingsModal
          product={editingProduct}
          onSave={async (updates) => {
            try {
              await API.products.update(editingProduct.id, updates);
              // Refresh the products list
              if (typeof handleAddEmployee === 'function') {
                // Trigger a refresh by calling the parent's refresh mechanism
                window.location.reload();
              }
            } catch (error) {
              console.error('Error updating product:', error);
            }
            setEditingProduct(null);
          }}
          onClose={() => setEditingProduct(null)}
        />
      )}
    </div>
  );
}

// Product Settings Modal Component
function ProductSettingsModal({ product, onSave, onClose }) {
  const [formData, setFormData] = useState({
    name: product?.name || '',
    sku: product?.sku || '',
    description: product?.description || '',
    category: product?.category || '',
    price: product?.price || '',
    stock: product?.stock || '',
    status: product?.status || 'active',
    supplier: product?.supplier || '',
    minStock: product?.minStock || 10
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name) {
      alert('Product name is required');
      return;
    }
    onSave(formData);
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="glass-card-large w-full max-w-2xl max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
        <div className="p-6 border-b border-white/20">
          <h2 className="text-xl font-bold text-white">
            Product Settings
          </h2>
          <p className="text-sm text-white/60 mt-1">Edit product information and inventory details</p>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-white/70 mb-2">Product Name *</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                className="w-full glass-input px-4 py-2"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-white/70 mb-2">SKU</label>
              <input
                type="text"
                value={formData.sku}
                onChange={(e) => setFormData({...formData, sku: e.target.value})}
                className="w-full glass-input px-4 py-2"
                placeholder="PRD-001"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-white/70 mb-2">Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
              className="w-full glass-input px-4 py-2"
              rows="3"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-white/70 mb-2">Category</label>
              <input
                type="text"
                value={formData.category}
                onChange={(e) => setFormData({...formData, category: e.target.value})}
                className="w-full glass-input px-4 py-2"
                placeholder="Electronics"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-white/70 mb-2">Status</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({...formData, status: e.target.value})}
                className="w-full glass-input px-4 py-2"
              >
                <option value="active">Active</option>
                <option value="draft">Draft</option>
                <option value="discontinued">Discontinued</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-white/70 mb-2">Price ($)</label>
              <input
                type="number"
                step="0.01"
                value={formData.price}
                onChange={(e) => setFormData({...formData, price: parseFloat(e.target.value) || 0})}
                className="w-full glass-input px-4 py-2"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-white/70 mb-2">Stock</label>
              <input
                type="number"
                value={formData.stock}
                onChange={(e) => setFormData({...formData, stock: parseInt(e.target.value) || 0})}
                className="w-full glass-input px-4 py-2"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-white/70 mb-2">Min Stock</label>
              <input
                type="number"
                value={formData.minStock}
                onChange={(e) => setFormData({...formData, minStock: parseInt(e.target.value) || 0})}
                className="w-full glass-input px-4 py-2"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-white/70 mb-2">Supplier</label>
            <input
              type="text"
              value={formData.supplier}
              onChange={(e) => setFormData({...formData, supplier: e.target.value})}
              className="w-full glass-input px-4 py-2"
              placeholder="Supplier name"
            />
          </div>
        </form>
        
        <div className="p-6 border-t border-white/20 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-6 py-2 rounded-xl border bg-red-900/80 hover:bg-red-800 border-red-700/50 text-white font-medium hover:scale-105 transition-all"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            className="px-6 py-2 rounded-xl bg-gradient-to-r from-blue-500 to-blue-600 text-white font-medium hover:scale-105 transition-transform"
          >
            Update Product
          </button>
        </div>
      </div>
    </div>
  );
}

export default CreativePerformance;