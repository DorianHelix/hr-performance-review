import React, { useState, useEffect, useRef } from 'react';
import { 
  Star, TrendingUp, Sparkles, Palette, 
  Lightbulb, Zap, Award, Target,
  Download, Plus, ChevronRight, Settings,
  Trash2, X, Clock, FileText, Briefcase,
  RefreshCw, MessageSquare, Users, Menu, Eye, EyeOff,
  PanelRightClose, PanelRightOpen, BarChart3, BarChartHorizontal,
  LineChart
} from 'lucide-react';
import API from '../api';

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

// Icon mapping helper
const getIcon = (iconName) => {
  const icons = {
    TrendingUp,
    Users,
    Clock,
    FileText,
    Briefcase,
    Star,
    Zap,
    Lightbulb,
    RefreshCw,
    MessageSquare
  };
  return icons[iconName] || Star;
};

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
  presetNextMonth
}) {
  
  const scrollRef = useRef(null);
  
  // Local state for Creative-specific features
  const [creativeMode, setCreativeMode] = useState('analytics'); // Changed default to 'analytics'
  const [showCreativeMetrics, setShowCreativeMetrics] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [chartModal, setChartModal] = useState(null);
  const [showTestTypesModal, setShowTestTypesModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [scoringDesign, setScoringDesign] = useState(() => {
    const saved = localStorage.getItem('hr_creative_scoring_design');
    return saved !== null ? saved : 'liquid'; // 'minimal' or 'liquid'
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
    const categoryMetrics = {};
    let overallCount = 0, overallTotal = 0;
    
    // Initialize metrics for each category
    categories.forEach(cat => {
      categoryMetrics[cat.key] = { count: 0, total: 0 };
    });
    
    // Calculate scores
    filteredEmployees.forEach(emp => {
      weeks.forEach(week => {
        categories.forEach(cat => {
          const score = getCategoryScore ? getCategoryScore(emp.id, week.key, cat.key) : null;
          if (score !== null) {
            categoryMetrics[cat.key].count++;
            categoryMetrics[cat.key].total += score;
            overallCount++;
            overallTotal += score;
          }
        });
      });
    });
    
    // Build result object with dynamic categories
    const result = {
      overallAvg: overallCount > 0 ? (overallTotal / overallCount).toFixed(1) : '0.0',
      categoryData: {}
    };
    
    // Add metrics for each category
    categories.forEach(cat => {
      const metrics = categoryMetrics[cat.key];
      result.categoryData[cat.key] = {
        count: metrics.count,
        avg: metrics.count > 0 ? (metrics.total / metrics.count).toFixed(1) : '0.0',
        percent: metrics.count > 0 ? Math.round((metrics.total / metrics.count) * 10) : 0
      };
    });
    
    // Keep backward compatibility for VCT, SCT, ACT
    result.vctCount = result.categoryData.VCT?.count || 0;
    result.vctAvg = result.categoryData.VCT?.avg || '0.0';
    result.vctPercent = result.categoryData.VCT?.percent || 0;
    result.sctCount = result.categoryData.SCT?.count || 0;
    result.sctAvg = result.categoryData.SCT?.avg || '0.0';
    result.sctPercent = result.categoryData.SCT?.percent || 0;
    result.actCount = result.categoryData.ACT?.count || 0;
    result.actAvg = result.categoryData.ACT?.avg || '0.0';
    result.actPercent = result.categoryData.ACT?.percent || 0;
    
    return result;
  };
  
  const metrics = calculateMetrics();
  
  return (
    <div className="flex flex-col h-full w-full overflow-hidden" style={{ maxWidth: '100vw' }}>
      <header className="glass-card-large px-4 py-3 mx-3 lg:mx-6 mb-2 lg:mb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="glass-card p-1.5 rounded-xl bg-gradient-to-br from-purple-400/20 to-pink-600/20 border-purple-400/30">
              <Sparkles size={18} className="text-purple-300" />
            </div>
            <div>
              <h1 className="text-lg lg:text-xl font-bold text-white">
                Creative Product Scoring Matrix
              </h1>
              <p className="text-white/50 text-xs hidden lg:block">
                Enhanced product evaluation with creative metrics
              </p>
            </div>
          </div>

          {/* View Mode Toggle - Analytics vs Configuration */}
          <div className="flex items-center gap-2">
            <div className="glass-card p-1 rounded-xl flex items-center gap-1">
              <button
                onClick={() => setCreativeMode('analytics')}
                className={`px-2.5 py-1 rounded-lg text-xs ${creativeMode === 'analytics' ? 'bg-pink-500 text-white' : 'text-white/60'}`}
              >
                Analytics
              </button>
              <button
                onClick={() => setCreativeMode('configuration')}
                className={`px-2.5 py-1 rounded-lg text-xs ${creativeMode === 'configuration' ? 'bg-purple-500 text-white' : 'text-white/60'}`}
              >
                Configuration
              </button>
            </div>
            
            {/* Toggle buttons */}
            <div className="flex items-center gap-1">
              <button 
                onClick={() => setShowKPICards(!showKPICards)}
                className="glass-card p-1.5 rounded-xl hover:bg-white/10 transition-all"
                title={showKPICards ? 'Hide metrics cards' : 'Show metrics cards'}
              >
                {showKPICards ? <BarChartHorizontal size={16} className="rotate-180" /> : <BarChartHorizontal size={16} />}
              </button>
              
              <button 
                onClick={() => setShowSidebar(!showSidebar)}
                className="glass-card p-1.5 rounded-xl hover:bg-white/10 transition-all"
                title={showSidebar ? 'Hide sidebar' : 'Show sidebar'}
              >
                {showSidebar ? <PanelRightClose size={16} /> : <PanelRightOpen size={16} />}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Test Metrics Cards - Only show in analytics mode and when enabled */}
      {creativeMode === 'analytics' && showCreativeMetrics && showKPICards && (
        <div className="flex gap-2 lg:gap-4 mx-3 lg:mx-6 mb-3 lg:mb-4 overflow-x-auto">
          {/* Dynamic category cards */}
          {categories.map(cat => {
            const catData = metrics.categoryData[cat.key] || { count: 0, avg: '0.0', percent: 0 };
            const Icon = getIcon(cat.iconName);
            const avgNum = parseFloat(catData.avg);
            
            return (
              <div key={cat.key} className="glass-card p-2 lg:p-3 rounded-xl lg:rounded-2xl bg-gradient-to-br from-purple-500/10 to-pink-500/10 relative overflow-hidden flex-shrink-0" style={{minWidth: '140px'}}>
                <div className={`absolute inset-0 opacity-20 ${
                  avgNum >= 9 ? 'bg-gradient-to-br from-green-500 to-green-600' :
                  avgNum >= 7 ? 'bg-gradient-to-br from-green-400 to-green-500' :
                  avgNum >= 5 ? 'bg-gradient-to-br from-yellow-400 to-yellow-500' :
                  avgNum >= 3 ? 'bg-gradient-to-br from-orange-500 to-orange-600' :
                  avgNum > 0 ? 'bg-gradient-to-br from-red-500 to-red-600' : ''
                }`} />
                <div className="relative z-10">
                  <div className="flex items-center gap-2 mb-2">
                    <Icon className={`text-purple-400`} size={16} />
                    <h3 className="font-semibold text-white text-sm">{cat.short || cat.key}</h3>
                  </div>
                  <div className="flex items-baseline gap-1">
                    <span className="text-2xl lg:text-3xl font-bold text-white">{catData.avg}</span>
                    <span className="text-xs text-white/50">/ 10</span>
                  </div>
                  <div className={`mt-1 h-1 rounded-full bg-white/10 overflow-hidden`}>
                    <div className={`h-full transition-all duration-500 ${
                      avgNum >= 9 ? 'bg-green-500' :
                      avgNum >= 7 ? 'bg-green-400' :
                      avgNum >= 5 ? 'bg-yellow-400' :
                      avgNum >= 3 ? 'bg-orange-500' :
                      avgNum > 0 ? 'bg-red-500' : 'bg-gray-500'
                    }`} style={{width: `${catData.percent}%`}} />
                  </div>
                  <div className="text-xs text-white/60 mt-1">{catData.count} tests completed</div>
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
                      ◀ Month
                    </button>
                    <button onClick={presetThisMonth} className="glass-button px-3 py-2 text-sm">
                      This Month
                    </button>
                    <button onClick={presetNextMonth} className="glass-button px-3 py-2 text-sm">
                      Month ▶
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
                  title="Table Settings"
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
                    <th className="sticky top-0 left-0 z-20 glass-card p-2 text-left rounded-xl" style={{ 
                      minWidth: '20rem', 
                      maxWidth: '20rem',
                      backdropFilter: 'blur(40px)',
                      WebkitBackdropFilter: 'blur(40px)',
                      background: 'rgba(255, 255, 255, 0.15)',
                      borderRight: '1px solid rgba(255, 255, 255, 0.2)'
                    }}>
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-white text-sm">Product</span>
                        <span className="text-xs text-white/60">Average</span>
                      </div>
                    </th>
                    {weeks.map(week => {
                      // Calculate daily average across all products and categories
                      const dailyScores = [];
                      employees.forEach(emp => {
                        categories.forEach(cat => {
                          const score = getCategoryScore ? getCategoryScore(emp.id, week.key, cat.key) : null;
                          if (score !== null) dailyScores.push(score);
                        });
                      });
                      const dailyAvg = dailyScores.length > 0 
                        ? (dailyScores.reduce((sum, s) => sum + s, 0) / dailyScores.length).toFixed(1)
                        : null;
                      
                      return (
                        <th 
                          key={week.key}
                          className="sticky top-0 z-5 glass-card text-xs font-semibold text-white rounded-lg"
                          style={{ minWidth: cellSize, width: cellSize }}
                        >
                          <div className="text-center py-1.5 px-1">
                            <div className="text-sm">{week.monthName} {week.day}</div>
                            <div className="text-[10px] text-white/50">
                              {week.dayName}
                            </div>
                            {dailyAvg && (
                              <div className="text-[9px] text-white/30">
                                Avg: {dailyAvg}
                              </div>
                            )}
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
                          <td className="sticky left-0 z-10 glass-card border-r border-white/10 border-b border-white/10 p-2" style={{ 
                            minWidth: '20rem', 
                            maxWidth: '20rem',
                            backdropFilter: 'blur(40px)',
                            WebkitBackdropFilter: 'blur(40px)',
                            background: 'rgba(255, 255, 255, 0.15)',
                            borderRight: '1px solid rgba(255, 255, 255, 0.2)'
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
                                {setEmployeeSettingsModal && (
                                  <button
                                    onClick={() => setEmployeeSettingsModal(emp)}
                                    className="p-1 rounded hover:bg-white/10"
                                  >
                                    <Settings size={16} className="text-white/60" />
                                  </button>
                                )}
                                <div>
                                  <div className="font-medium text-white">{emp.name}</div>
                                  <div className="text-xs text-white/60">
                                    {emp.sku && <span className="font-mono">{emp.sku} · </span>}
                                    {[emp.category, `$${emp.price || 0}`, `Stock: ${emp.stock || 0}`].filter(Boolean).join(" · ")}
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
                                      title="View score trends"
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
                                style={{ minWidth: cellSize, width: cellSize }}
                              >
                                <div className="flex flex-col items-center justify-center p-1 gap-1">
                                  {categoryScores.length > 0 ? (
                                    scoringDesign === 'minimal' ? (
                                      // Minimal Design (Original)
                                      <div className="glass-card p-1.5 rounded-lg w-full">
                                        {categoryScores.map((item, idx) => {
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
                                        {categoryScores.map((item, idx) => {
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
                                        if (setQuickScoreModal && categories.length > 0) {
                                          setQuickScoreModal({
                                            employee: emp,
                                            week: week,
                                            category: categories[0],
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
                        
                        {/* Expanded category rows */}
                        {isExpanded && categories.map(cat => {
                          const Icon = getIcon(cat.iconName);
                          
                          // Calculate category average for this product
                          const categoryScores = [];
                          weeks.forEach(week => {
                            const score = getCategoryScore ? getCategoryScore(emp.id, week.key, cat.key) : null;
                            if (score !== null) categoryScores.push(score);
                          });
                          const categoryAvg = categoryScores.length > 0
                            ? (categoryScores.reduce((sum, s) => sum + s, 0) / categoryScores.length).toFixed(1)
                            : null;
                          
                          return (
                            <tr key={cat.key} className="bg-white/5">
                              <td className={`sticky left-0 z-10 glass-card border-r border-white/10 border-b border-white/10 p-2 pl-12 border-l-4 ${cat.accent}`} style={{ 
                                minWidth: '20rem', 
                                maxWidth: '20rem',
                                backdropFilter: 'blur(40px)',
                                WebkitBackdropFilter: 'blur(40px)',
                                background: 'rgba(255, 255, 255, 0.15)',
                                borderRight: '1px solid rgba(255, 255, 255, 0.2)'
                              }}>
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-2">
                                    <div className={`p-1 rounded ${cat.tag}`}>
                                      <Icon size={12} className="text-white" />
                                    </div>
                                    <span className="text-sm font-medium text-white/80">{cat.label}</span>
                                  </div>
                                  {categoryAvg && (
                                    <div className="flex items-center gap-1">
                                      <span className="text-xs text-white/40">Avg:</span>
                                      <span className="text-xs font-bold text-white/60">{categoryAvg}</span>
                                    </div>
                                  )}
                                </div>
                              </td>
                              
                              {weeks.map(week => {
                                const catScore = getCategoryScore ? getCategoryScore(emp.id, week.key, cat.key) : null;
                                const styles = catScore ? tierStyles(catScore) : {};
                                
                                return (
                                  <td 
                                    key={week.key}
                                    className="border-b border-white/10 hover:bg-white/5 cursor-pointer group/cell"
                                    style={{ minWidth: cellSize, width: cellSize }}
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setQuickScoreModal && setQuickScoreModal({
                                        employee: emp,
                                        week: week,
                                        category: cat,
                                        currentScore: catScore
                                      });
                                    }}
                                  >
                                    <div className="relative flex items-center justify-center py-1">
                                      {catScore ? (
                                        <div className={`h-8 w-8 rounded-lg ${styles.bg} ${styles.text} text-sm font-semibold grid place-items-center`}>
                                          {catScore}
                                        </div>
                                      ) : (
                                        <div className="h-8 w-8 rounded-lg border border-dashed border-white/30 text-white/40 grid place-items-center text-xs hover:border-white/50">
                                          +
                                        </div>
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
                {categories.map(cat => {
                  const catData = metrics.categoryData[cat.key] || { percent: 0 };
                  const colorClass = cat.tag.replace('bg-', 'from-').replace('500', '400');
                  const textColor = cat.tag.replace('bg-', 'text-').replace('500', '400');
                  
                  return (
                    <div key={cat.key} className="text-sm text-white/80">
                      <div className="flex justify-between mb-2">
                        <span>{cat.label}</span>
                        <span className={`font-bold ${textColor}`}>{catData.percent}%</span>
                      </div>
                      <div className="w-full bg-white/10 rounded-full h-2">
                        <div className={`bg-gradient-to-r ${colorClass} to-pink-400 h-2 rounded-full`} style={{width: `${catData.percent}%`}}></div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}


          {/* Test Types - Only in Configuration mode */}
          {creativeMode === 'configuration' && (
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
                {categories.map(cat => {
                  const Icon = getIcon(cat.iconName);
                  return (
                    <div key={cat.id} className="glass-card p-3 rounded-xl hover:scale-105 transition-all duration-300">
                      <div className="flex items-start gap-3">
                        <div className={`p-2 rounded-xl ${cat.tag} shadow-lg`}>
                          <Icon size={16} className="text-white" />
                        </div>
                        <div className="flex-1">
                          <div className="font-semibold text-white">{cat.label}</div>
                          <div className="text-xs text-white/60 mt-1">{cat.description}</div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
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
          categories={categories}
          setCategories={setCategories}
          onClose={() => setShowTestTypesModal(false)}
        />
      )}
      
      {/* Score Chart Modal */}
      {chartModal && (
        <ScoreChartModal 
          data={chartModal}
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
          onClose={() => setShowSettingsModal(false)}
        />
      )}
    </div>
  );
}

// Test Types Configuration Modal Component
function TestTypesModal({ categories, setCategories, onClose }) {
  const [localCategories, setLocalCategories] = useState([...categories]);
  
  const handleUpdate = (index, field, value) => {
    const updated = [...localCategories];
    updated[index] = { ...updated[index], [field]: value };
    setLocalCategories(updated);
  };
  
  const handleSave = () => {
    // Save to parent state
    if (setCategories) {
      setCategories(localCategories);
    }
    onClose();
  };
  
  const handleAddNew = () => {
    const newTest = {
      id: `test-${Date.now()}`,
      key: 'NEW',
      label: 'New Test Type',
      short: 'NEW',
      accent: 'border-l-gray-500',
      tag: 'bg-gray-500',
      iconName: 'Star',
      description: 'New test description'
    };
    setLocalCategories([...localCategories, newTest]);
  };
  
  const handleDelete = (index) => {
    if (localCategories.length <= 1) {
      alert('You must have at least one test type');
      return;
    }
    const updated = localCategories.filter((_, i) => i !== index);
    setLocalCategories(updated);
  };
  
  const iconOptions = ['Zap', 'Lightbulb', 'MessageSquare', 'Star', 'TrendingUp', 'Users', 'Clock', 'FileText'];
  const colorOptions = [
    { label: 'Purple', tag: 'bg-purple-500', accent: 'border-l-purple-500' },
    { label: 'Blue', tag: 'bg-blue-500', accent: 'border-l-blue-500' },
    { label: 'Green', tag: 'bg-green-500', accent: 'border-l-green-500' },
    { label: 'Red', tag: 'bg-red-500', accent: 'border-l-red-500' },
    { label: 'Yellow', tag: 'bg-yellow-500', accent: 'border-l-yellow-500' },
    { label: 'Pink', tag: 'bg-pink-500', accent: 'border-l-pink-500' },
    { label: 'Orange', tag: 'bg-orange-500', accent: 'border-l-orange-500' },
  ];
  
  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="glass-card-large w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        <div className="p-6 border-b border-white/20">
          <h2 className="text-xl font-bold text-white flex items-center gap-3">
            <Settings size={20} />
            Manage Test Types
          </h2>
          <p className="text-sm text-white/60 mt-1">
            Configure the test types for creative product evaluation
          </p>
        </div>
        
        <div className="flex-1 overflow-y-auto p-6">
          <div className="space-y-4">
            {localCategories.map((cat, index) => {
              const Icon = getIcon(cat.iconName);
              const colorOption = colorOptions.find(c => c.tag === cat.tag) || colorOptions[0];
              
              return (
                <div key={cat.id} className="glass-card p-4 rounded-xl">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {/* Test Key */}
                    <div>
                      <label className="block text-xs font-medium text-white/70 mb-1">Test Key (Short)</label>
                      <input
                        type="text"
                        value={cat.key}
                        onChange={(e) => handleUpdate(index, 'key', e.target.value.toUpperCase().slice(0, 3))}
                        className="w-full glass-input px-3 py-2 text-sm"
                        placeholder="VCT"
                        maxLength={3}
                      />
                    </div>
                    
                    {/* Test Label */}
                    <div>
                      <label className="block text-xs font-medium text-white/70 mb-1">Test Name</label>
                      <input
                        type="text"
                        value={cat.label}
                        onChange={(e) => handleUpdate(index, 'label', e.target.value)}
                        className="w-full glass-input px-3 py-2 text-sm"
                        placeholder="Video Creative Test"
                      />
                    </div>
                    
                    {/* Color */}
                    <div>
                      <label className="block text-xs font-medium text-white/70 mb-1">Color</label>
                      <select
                        value={cat.tag}
                        onChange={(e) => {
                          const selected = colorOptions.find(c => c.tag === e.target.value);
                          handleUpdate(index, 'tag', selected.tag);
                          handleUpdate(index, 'accent', selected.accent);
                        }}
                        className="w-full glass-input px-3 py-2 text-sm"
                      >
                        {colorOptions.map(color => (
                          <option key={color.tag} value={color.tag}>
                            {color.label}
                          </option>
                        ))}
                      </select>
                    </div>
                    
                    {/* Icon */}
                    <div>
                      <label className="block text-xs font-medium text-white/70 mb-1">Icon</label>
                      <select
                        value={cat.iconName}
                        onChange={(e) => handleUpdate(index, 'iconName', e.target.value)}
                        className="w-full glass-input px-3 py-2 text-sm"
                      >
                        {iconOptions.map(icon => (
                          <option key={icon} value={icon}>{icon}</option>
                        ))}
                      </select>
                    </div>
                    
                    {/* Description */}
                    <div className="md:col-span-2">
                      <label className="block text-xs font-medium text-white/70 mb-1">Description</label>
                      <input
                        type="text"
                        value={cat.description}
                        onChange={(e) => handleUpdate(index, 'description', e.target.value)}
                        className="w-full glass-input px-3 py-2 text-sm"
                        placeholder="Test description"
                      />
                    </div>
                  </div>
                  
                  {/* Preview and Delete */}
                  <div className="mt-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-xs text-white/50">Preview:</span>
                      <div className={`inline-flex items-center gap-1 px-2 py-1 rounded-md ${cat.tag} text-white text-xs font-bold`}>
                        <Icon size={12} />
                        <span>{cat.key}</span>
                      </div>
                    </div>
                    
                    <button
                      onClick={() => handleDelete(index)}
                      className="p-2 rounded-lg hover:bg-red-500/20 text-red-400 transition-colors"
                      title="Delete test type"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
          
          {/* Add New Test Type Button */}
          <button
            onClick={handleAddNew}
            className="mt-4 w-full glass-button py-3 flex items-center justify-center gap-2 hover:scale-[1.02] transition-transform"
          >
            <Plus size={20} />
            Add New Test Type
          </button>
        </div>
        
        <div className="p-6 border-t border-white/20 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-6 py-2 glass-button rounded-xl"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-6 py-2 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 text-white font-medium hover:scale-105 transition-transform"
          >
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
}

// Score Chart Modal Component
function ScoreChartModal({ data, getCategoryScore, onClose, DateRangePicker }) {
  if (!data) return null;
  
  const { employee, startDate: initialStart, endDate: initialEnd } = data;
  const [startDate, setStartDate] = useState(initialStart);
  const [endDate, setEndDate] = useState(initialEnd);
  const [chartData, setChartData] = useState([]);
  
  // Get scoring data for the date range from database
  useEffect(() => {
    if (!data) return;
    
    const fetchScores = async () => {
      try {
        // Fetch scores from database
        const response = await API.scores.getScores({
          employee_id: employee.id,
          start_date: startDate.replace(/-/g, ''),
          end_date: endDate.replace(/-/g, '')
        });
        
        // Get all days in the date range
        const start = new Date(startDate);
        const end = new Date(endDate);
        const days = [];
        
        for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
          days.push(new Date(d).toISOString().slice(0, 10));
        }
        
        // Map database scores to chart data
        const scores = days.map(day => {
          const dayKey = day.replace(/-/g, '');
          
          // Find scores for this day
          const dayScores = response.filter(s => s.date === dayKey);
          
          const vctScore = dayScores.find(s => s.category === 'VCT')?.score || null;
          const actScore = dayScores.find(s => s.category === 'ACT')?.score || null;
          const rctScore = dayScores.find(s => s.category === 'RCT')?.score || null;
          
          return {
            date: day,
            VCT: vctScore,
            ACT: actScore,
            RCT: rctScore
          };
        });
        
        setChartData(scores);
      } catch (error) {
        console.error('Error fetching scores:', error);
        // Fallback to getCategoryScore if API fails
        const days = [];
        const start = new Date(startDate);
        const end = new Date(endDate);
        
        for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
          days.push(new Date(d).toISOString().slice(0, 10));
        }
        
        const scores = days.map(day => {
          const dayKey = day.replace(/-/g, '');
          return {
            date: day,
            VCT: getCategoryScore?.(employee.id, dayKey, 'VCT'),
            ACT: getCategoryScore?.(employee.id, dayKey, 'ACT'),
            RCT: getCategoryScore?.(employee.id, dayKey, 'RCT')
          };
        });
        
        setChartData(scores);
      }
    };
    
    fetchScores();
  }, [startDate, endDate, employee, data, getCategoryScore]);
  
  // Simple line chart rendering
  const maxScore = 10;
  const chartHeight = 300;
  const chartWidth = 600;
  const padding = 40;
  
  // Filter out days with no scores
  const dataWithScores = chartData.filter(d => d.VCT || d.ACT || d.RCT);
  
  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="glass-card-large w-full max-w-5xl max-h-[90vh] overflow-hidden flex flex-col" onClick={e => e.stopPropagation()}>
        <div className="p-6 border-b border-white/20">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <LineChart size={24} className="text-blue-400" />
                Score Trends - {employee.name}
              </h2>
              <p className="text-sm text-white/60 mt-1">Track performance over time</p>
            </div>
            <button onClick={onClose} className="glass-button p-2 rounded-lg hover:scale-110">
              <X size={18} className="text-white/80" />
            </button>
          </div>
        </div>
        
        <div className="p-6 space-y-6 overflow-y-auto">
          {/* Date Range Selector */}
          <div className="flex items-center gap-4">
            {DateRangePicker && (
              <DateRangePicker
                label="Select Date Range"
                startDate={startDate}
                endDate={endDate}
                onRangeChange={(start, end) => {
                  setStartDate(start);
                  setEndDate(end);
                }}
              />
            )}
          </div>
          
          {/* Chart */}
          <div className="glass-card p-6 rounded-xl bg-gradient-to-br from-blue-500/5 to-purple-500/5">
            {dataWithScores.length > 0 ? (
              <div className="space-y-4">
                {/* Legend */}
                <div className="flex items-center gap-6 justify-center mb-6">
                  <div className="flex items-center gap-2 glass-card px-3 py-1.5 rounded-lg">
                    <div className="w-3 h-3 rounded-full bg-gradient-to-r from-blue-400 to-blue-600 shadow-lg shadow-blue-500/50"></div>
                    <span className="text-sm text-white font-medium">VCT</span>
                  </div>
                  <div className="flex items-center gap-2 glass-card px-3 py-1.5 rounded-lg">
                    <div className="w-3 h-3 rounded-full bg-gradient-to-r from-green-400 to-green-600 shadow-lg shadow-green-500/50"></div>
                    <span className="text-sm text-white font-medium">ACT</span>
                  </div>
                  <div className="flex items-center gap-2 glass-card px-3 py-1.5 rounded-lg">
                    <div className="w-3 h-3 rounded-full bg-gradient-to-r from-purple-400 to-purple-600 shadow-lg shadow-purple-500/50"></div>
                    <span className="text-sm text-white font-medium">RCT</span>
                  </div>
                </div>
                
                {/* Enhanced SVG Chart with gradients and animations */}
                <svg width="100%" height={chartHeight} viewBox={`0 0 ${chartWidth} ${chartHeight}`} className="w-full overflow-visible">
                  {/* Define gradients */}
                  <defs>
                    <linearGradient id="vctGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.8"/>
                      <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.1"/>
                    </linearGradient>
                    <linearGradient id="actGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#10b981" stopOpacity="0.8"/>
                      <stop offset="100%" stopColor="#10b981" stopOpacity="0.1"/>
                    </linearGradient>
                    <linearGradient id="rctGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#a855f7" stopOpacity="0.8"/>
                      <stop offset="100%" stopColor="#a855f7" stopOpacity="0.1"/>
                    </linearGradient>
                    <filter id="glow">
                      <feGaussianBlur stdDeviation="4" result="coloredBlur"/>
                      <feMerge>
                        <feMergeNode in="coloredBlur"/>
                        <feMergeNode in="SourceGraphic"/>
                      </feMerge>
                    </filter>
                  </defs>
                  {/* Grid lines with better styling */}
                  {[0, 2, 4, 6, 8, 10].map(score => {
                    const y = padding + ((10 - score) / 10) * (chartHeight - 2 * padding);
                    return (
                      <g key={score}>
                        <line
                          x1={padding}
                          y1={y}
                          x2={chartWidth - padding}
                          y2={y}
                          stroke={score === 0 || score === 10 ? "rgba(255,255,255,0.2)" : "rgba(255,255,255,0.05)"}
                          strokeDasharray={score === 5 ? "5,5" : "2,2"}
                        />
                        <text
                          x={padding - 10}
                          y={y + 5}
                          fill="rgba(255,255,255,0.7)"
                          fontSize="11"
                          fontWeight={score === 0 || score === 10 ? "bold" : "normal"}
                          textAnchor="end"
                        >
                          {score}
                        </text>
                      </g>
                    );
                  })}
                  
                  {/* Area charts and lines for each category */}
                  {['VCT', 'ACT', 'RCT'].map((category, idx) => {
                    const color = idx === 0 ? '#3b82f6' : idx === 1 ? '#10b981' : '#a855f7';
                    const gradientId = idx === 0 ? 'vctGradient' : idx === 1 ? 'actGradient' : 'rctGradient';
                    
                    const validPoints = dataWithScores
                      .map((d, i) => {
                        if (!d[category]) return null;
                        const x = padding + (i / (dataWithScores.length - 1 || 1)) * (chartWidth - 2 * padding);
                        const y = padding + ((10 - d[category]) / 10) * (chartHeight - 2 * padding);
                        return { x, y, value: d[category], date: d.date };
                      })
                      .filter(Boolean);
                    
                    if (validPoints.length === 0) return null;
                    
                    const pathPoints = validPoints.map(p => `${p.x},${p.y}`).join(' ');
                    const areaPath = `M ${validPoints[0].x},${chartHeight - padding} L ${pathPoints} L ${validPoints[validPoints.length - 1].x},${chartHeight - padding} Z`;
                    
                    return (
                      <g key={category}>
                        {/* Area fill */}
                        <path
                          d={areaPath}
                          fill={`url(#${gradientId})`}
                          opacity="0.3"
                          className="animate-fade-in"
                        />
                        
                        {/* Line */}
                        <polyline
                          points={pathPoints}
                          fill="none"
                          stroke={color}
                          strokeWidth="3"
                          strokeLinejoin="round"
                          strokeLinecap="round"
                          filter="url(#glow)"
                          className="animate-draw-line"
                        />
                        
                        {/* Data points with hover effect */}
                        {validPoints.map((point, i) => (
                          <g key={`${category}-${i}`}>
                            {/* Outer glow circle */}
                            <circle
                              cx={point.x}
                              cy={point.y}
                              r="8"
                              fill={color}
                              opacity="0.2"
                              className="animate-pulse"
                            />
                            {/* Main point */}
                            <circle
                              cx={point.x}
                              cy={point.y}
                              r="5"
                              fill="white"
                              stroke={color}
                              strokeWidth="2"
                              className="hover:r-7 transition-all cursor-pointer"
                            >
                              <title>{`${new Date(point.date).toLocaleDateString()}: ${point.value}/10`}</title>
                            </circle>
                            {/* Value label on hover */}
                            <text
                              x={point.x}
                              y={point.y - 15}
                              fill={color}
                              fontSize="12"
                              fontWeight="bold"
                              textAnchor="middle"
                              className="opacity-0 hover:opacity-100 transition-opacity pointer-events-none"
                            >
                              {point.value}
                            </text>
                          </g>
                        ))}
                      </g>
                    );
                  })}
                  
                  {/* X-axis dates */}
                  {dataWithScores.map((d, i) => {
                    if (i % Math.ceil(dataWithScores.length / 6) !== 0) return null;
                    const x = padding + (i / (dataWithScores.length - 1 || 1)) * (chartWidth - 2 * padding);
                    return (
                      <text
                        key={i}
                        x={x}
                        y={chartHeight - padding + 20}
                        fill="rgba(255,255,255,0.5)"
                        fontSize="10"
                        textAnchor="middle"
                      >
                        {new Date(d.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      </text>
                    );
                  })}
                </svg>
                
                {/* Data Table */}
                <div className="mt-6">
                  <h3 className="text-sm font-medium text-white/80 mb-3">Score Details</h3>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-white/10">
                          <th className="text-left p-2 text-white/60">Date</th>
                          <th className="text-center p-2 text-white/60">VCT</th>
                          <th className="text-center p-2 text-white/60">ACT</th>
                          <th className="text-center p-2 text-white/60">RCT</th>
                        </tr>
                      </thead>
                      <tbody>
                        {dataWithScores.map((d, i) => (
                          <tr key={i} className="border-b border-white/5 hover:bg-white/5">
                            <td className="p-2 text-white/80">
                              {new Date(d.date).toLocaleDateString('en-US', { 
                                weekday: 'short',
                                month: 'short', 
                                day: 'numeric' 
                              })}
                            </td>
                            <td className="text-center p-2">
                              {d.VCT ? (
                                <span className="px-2 py-1 rounded bg-blue-500/20 text-blue-300 font-bold">
                                  {d.VCT}
                                </span>
                              ) : '-'}
                            </td>
                            <td className="text-center p-2">
                              {d.ACT ? (
                                <span className="px-2 py-1 rounded bg-green-500/20 text-green-300 font-bold">
                                  {d.ACT}
                                </span>
                              ) : '-'}
                            </td>
                            <td className="text-center p-2">
                              {d.RCT ? (
                                <span className="px-2 py-1 rounded bg-purple-500/20 text-purple-300 font-bold">
                                  {d.RCT}
                                </span>
                              ) : '-'}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-12 text-white/50">
                No scoring data available for the selected date range
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// Settings Modal Component
function SettingsModal({ scoringDesign, setScoringDesign, cellSize, setCellSize, onClose }) {
  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="glass-card-large w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col" onClick={e => e.stopPropagation()}>
        <div className="p-6 border-b border-white/20">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <Settings size={20} className="text-blue-400" />
                Table Settings
              </h2>
              <p className="text-sm text-white/60 mt-1">Customize table appearance and behavior</p>
            </div>
            <button onClick={onClose} className="glass-button p-2 rounded-lg hover:scale-110">
              <X size={18} className="text-white/80" />
            </button>
          </div>
        </div>
        
        <div className="p-6 space-y-6 overflow-y-auto">
          {/* Scoring Design Section */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-white flex items-center gap-2">
              <Sparkles size={18} className="text-purple-400" />
              Scoring Display Style
            </h3>
            <p className="text-sm text-white/60">Choose how scoring information is displayed in the table cells</p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Minimal Design Option */}
              <div 
                className={`glass-card p-4 rounded-xl cursor-pointer transition-all duration-300 hover:scale-[1.02] ${
                  scoringDesign === 'minimal' 
                    ? 'ring-2 ring-blue-400 bg-blue-500/10' 
                    : 'hover:bg-white/5'
                }`}
                onClick={() => setScoringDesign('minimal')}
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className={`w-4 h-4 rounded-full border-2 ${
                    scoringDesign === 'minimal' 
                      ? 'border-blue-400 bg-blue-400' 
                      : 'border-white/30'
                  }`}>
                    {scoringDesign === 'minimal' && (
                      <div className="w-full h-full rounded-full bg-white"></div>
                    )}
                  </div>
                  <h4 className="font-semibold text-white">Minimal</h4>
                </div>
                
                {/* Preview */}
                <div className="glass-card p-2 rounded-lg mb-3">
                  <div className="space-y-1">
                    <div className="flex items-center justify-between mb-0.5">
                      <span className="text-[9px] font-bold text-purple-300 tracking-wide">VCT</span>
                      <span className="text-[10px] text-white font-bold">8</span>
                    </div>
                    <div className="w-full bg-white/5 rounded-full h-1">
                      <div className="h-full bg-gradient-to-r from-green-300 to-green-400 rounded-full" style={{width: '80%'}}></div>
                    </div>
                  </div>
                </div>
                
                <p className="text-xs text-white/60">Clean and simple progress bars with category labels</p>
              </div>
              
              {/* Liquid Glass Design Option */}
              <div 
                className={`glass-card p-4 rounded-xl cursor-pointer transition-all duration-300 hover:scale-[1.02] ${
                  scoringDesign === 'liquid' 
                    ? 'ring-2 ring-purple-400 bg-purple-500/10' 
                    : 'hover:bg-white/5'
                }`}
                onClick={() => setScoringDesign('liquid')}
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className={`w-4 h-4 rounded-full border-2 ${
                    scoringDesign === 'liquid' 
                      ? 'border-purple-400 bg-purple-400' 
                      : 'border-white/30'
                  }`}>
                    {scoringDesign === 'liquid' && (
                      <div className="w-full h-full rounded-full bg-white"></div>
                    )}
                  </div>
                  <h4 className="font-semibold text-white">Liquid Glass</h4>
                </div>
                
                {/* Preview */}
                <div 
                  className="p-2 rounded-lg mb-3 border"
                  style={{
                    background: 'linear-gradient(135deg, rgba(34, 197, 94, 0.2) 0%, rgba(22, 163, 74, 0.3) 100%)',
                    border: '1px solid rgba(34, 197, 94, 0.35)',
                    backdropFilter: 'blur(8px)'
                  }}
                >
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-1">
                      <div className="w-3 h-3 rounded-full bg-gradient-to-br from-purple-500/20 to-purple-600/30 flex items-center justify-center">
                        <span className="text-[7px] font-bold text-purple-200">V</span>
                      </div>
                      <span className="text-[8px] font-bold text-purple-200">VCT</span>
                    </div>
                    <div className="px-1.5 py-0.5 rounded-full bg-white/15 text-green-200 font-bold text-[8px]">8</div>
                  </div>
                  <div className="w-full h-0.5 rounded-full bg-white/10">
                    <div className="h-full rounded-full bg-gradient-to-r from-purple-300/50 to-white/30" style={{width: '80%'}}></div>
                  </div>
                </div>
                
                <p className="text-xs text-white/60">Glass morphism cards with blur effects and glowing elements</p>
              </div>
            </div>
          </div>
          
          {/* Cell Size Section */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-white flex items-center gap-2">
              <BarChart3 size={18} className="text-green-400" />
              Table Cell Size
            </h3>
            <p className="text-sm text-white/60">Adjust the width of date columns in the scoring table</p>
            
            <div className="glass-card p-4 rounded-xl">
              <div className="flex items-center gap-4">
                <label className="text-sm text-white/70 min-w-[60px]">Size:</label>
                <div className="flex-1">
                  <input 
                    type="range" 
                    min={80} 
                    max={150} 
                    step={10} 
                    value={cellSize}
                    onChange={e => setCellSize(Number(e.target.value))}
                    className="w-full"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-white/80 font-mono w-12">{cellSize}px</span>
                  <button 
                    onClick={() => setCellSize(100)}
                    className="glass-button px-2 py-1 text-xs hover:scale-105"
                  >
                    Reset
                  </button>
                </div>
              </div>
              
              <div className="mt-3 flex items-center gap-2 text-xs text-white/50">
                <span>Narrow (80px)</span>
                <div className="flex-1 h-px bg-white/10"></div>
                <span>Wide (150px)</span>
              </div>
            </div>
          </div>
          
          {/* Quick Actions */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-white flex items-center gap-2">
              <Zap size={18} className="text-yellow-400" />
              Quick Actions
            </h3>
            
            <div className="grid grid-cols-2 gap-3">
              <button 
                onClick={() => {
                  setScoringDesign('minimal');
                  setCellSize(100);
                }}
                className="glass-button flex items-center gap-2 px-3 py-2 text-sm hover:scale-105"
              >
                <RefreshCw size={14} />
                Reset to Defaults
              </button>
              
              <button 
                onClick={() => setScoringDesign('liquid')}
                className="glass-button flex items-center gap-2 px-3 py-2 text-sm hover:scale-105 bg-gradient-to-r from-purple-500/20 to-pink-500/20"
              >
                <Sparkles size={14} />
                Enable Liquid Mode
              </button>
            </div>
          </div>
        </div>
        
        <div className="p-6 border-t border-white/20 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-6 py-2 rounded-xl bg-gradient-to-r from-blue-500 to-purple-500 text-white font-medium hover:scale-105 transition-transform"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}

export default CreativePerformance;