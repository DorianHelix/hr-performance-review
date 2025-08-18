import React, { useState, useEffect, useRef } from 'react';
import { 
  Star, TrendingUp, Sparkles, Palette, 
  Lightbulb, Zap, Award, Target,
  Download, Plus, ChevronRight, Settings,
  Trash2, X, Clock, FileText, Briefcase,
  RefreshCw, MessageSquare, Users
} from 'lucide-react';

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
  const [creativeMode, setCreativeMode] = useState('standard');
  const [showCreativeMetrics, setShowCreativeMetrics] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Filter products based on search
  const filteredEmployees = employees.filter(emp => {
    if (!searchTerm) return true;
    const search = searchTerm.toLowerCase();
    return emp.name?.toLowerCase().includes(search) || 
           emp.sku?.toLowerCase().includes(search) ||
           emp.category?.toLowerCase().includes(search);
  });
  
  return (
    <div className="flex flex-col h-full w-full overflow-hidden" style={{ maxWidth: '100vw' }}>
      <header className="glass-card-large p-6 m-6 mb-4">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-3 text-white mb-2">
              <div className="glass-card p-2 rounded-2xl bg-gradient-to-br from-purple-400/20 to-pink-600/20 border-purple-400/30">
                <Sparkles size={24} className="text-purple-300" />
              </div>
              Creative Product Scoring Matrix
            </h1>
            <p className="text-white/60 text-lg">
              Enhanced product evaluation with creative metrics and insights
            </p>
          </div>

          {/* Creative Mode Toggle - Keep in header */}
          <div className="glass-card p-2 rounded-2xl flex items-center gap-2">
            <button
              onClick={() => setCreativeMode('standard')}
              className={`px-3 py-1 rounded-lg text-sm ${creativeMode === 'standard' ? 'bg-purple-500 text-white' : 'text-white/60'}`}
            >
              Standard
            </button>
            <button
              onClick={() => setCreativeMode('creative')}
              className={`px-3 py-1 rounded-lg text-sm ${creativeMode === 'creative' ? 'bg-pink-500 text-white' : 'text-white/60'}`}
            >
              Creative
            </button>
          </div>
        </div>
      </header>

      {/* Test Metrics Cards - Only show in creative mode */}
      {creativeMode === 'creative' && showCreativeMetrics && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mx-6 mb-4">
          <div className="glass-card p-4 rounded-2xl bg-gradient-to-br from-purple-500/10 to-pink-500/10">
            <div className="flex items-center gap-3 mb-3">
              <Zap className="text-purple-400" size={20} />
              <h3 className="font-semibold text-white">Video Tests</h3>
            </div>
            <div className="text-3xl font-bold text-white">24</div>
            <div className="text-sm text-white/60">Completed this week</div>
          </div>

          <div className="glass-card p-4 rounded-2xl bg-gradient-to-br from-blue-500/10 to-purple-500/10">
            <div className="flex items-center gap-3 mb-3">
              <Lightbulb className="text-blue-400" size={20} />
              <h3 className="font-semibold text-white">Static Tests</h3>
            </div>
            <div className="text-3xl font-bold text-white">18</div>
            <div className="text-sm text-white/60">Completed this week</div>
          </div>

          <div className="glass-card p-4 rounded-2xl bg-gradient-to-br from-green-500/10 to-blue-500/10">
            <div className="flex items-center gap-3 mb-3">
              <MessageSquare className="text-green-400" size={20} />
              <h3 className="font-semibold text-white">Copy Tests</h3>
            </div>
            <div className="text-3xl font-bold text-white">31</div>
            <div className="text-sm text-white/60">Completed this week</div>
          </div>

          <div className="glass-card p-4 rounded-2xl bg-gradient-to-br from-pink-500/10 to-orange-500/10">
            <div className="flex items-center gap-3 mb-3">
              <Award className="text-orange-400" size={20} />
              <h3 className="font-semibold text-white">Avg. Score</h3>
            </div>
            <div className="text-3xl font-bold text-white">8.7</div>
            <div className="text-sm text-white/60">All tests combined</div>
          </div>
        </div>
      )}

      <div className="grid lg:grid-cols-[1fr,24rem] grid-cols-1 gap-6 flex-1 min-h-0 px-6 pb-6">
        {/* Main table - Fixed width container with horizontal scroll */}
        <div className="min-w-0 overflow-hidden flex flex-col gap-4">
          {/* Table Controls Bar */}
          <div className="glass-card-large p-4">
            <div className="flex flex-wrap gap-3 items-center justify-between">
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

              <div className="flex flex-wrap gap-3 items-center">
                {setFilterMinTier && (
                  <select 
                    value={filterMinTier} 
                    onChange={e => setFilterMinTier(Number(e.target.value))}
                    className="glass-input px-3 py-2 text-sm"
                  >
                    <option value={5}>Show all</option>
                    <option value={1}>Exceptional only</option>
                    <option value={2}>Exceeds+</option>
                    <option value={3}>Meets+</option>
                    <option value={4}>Needs Improvement+</option>
                  </select>
                )}

                {setCellSize && (
                  <div className="flex items-center gap-2">
                    <label className="text-xs text-white/70">Cell size</label>
                    <input 
                      type="range" 
                      min={80} 
                      max={150} 
                      step={10} 
                      value={cellSize}
                      onChange={e => setCellSize(Number(e.target.value))}
                      className="w-20"
                    />
                    <span className="text-xs text-white/50 w-8">{cellSize}</span>
                  </div>
                )}

                {exportData && (
                  <button
                    onClick={exportData}
                    className="glass-button inline-flex items-center gap-2 px-3 py-2 text-sm font-medium hover:scale-105"
                  >
                    <Download size={14} /> Export
                  </button>
                )}
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
                    <th className="sticky top-0 left-0 z-20 glass-card p-4 text-left rounded-2xl" style={{ minWidth: '20rem', maxWidth: '20rem' }}>
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-white">Product</span>
                        <span className="text-sm text-white/60">Average</span>
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
                          className="sticky top-0 z-5 glass-card text-sm font-semibold text-white rounded-2xl"
                          style={{ minWidth: cellSize, width: cellSize }}
                        >
                          <div className="text-center py-3">
                            <div>{week.monthName} {week.day}</div>
                            <div className="text-xs text-white/60">
                              {week.dayName}
                            </div>
                            {dailyAvg && (
                              <div className="text-xs text-white/40 mt-1">
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
                          <td className="sticky left-0 z-10 glass-card border-r border-white/10 border-b border-white/10 p-3" style={{ minWidth: '20rem', maxWidth: '20rem' }}>
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
                                  <button
                                    onClick={() => handleDeleteEmployee(emp.id)}
                                    className="p-1 rounded hover:bg-red-500/20 text-red-400 opacity-0 group-hover:opacity-100"
                                  >
                                    <Trash2 size={14} />
                                  </button>
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
                                <div className="flex flex-wrap items-center justify-center gap-1 p-1.5">
                                  {categoryScores.length > 0 ? (
                                    categoryScores.map(item => {
                                      // Custom badge colors based on test type
                                      const getBadgeColor = () => {
                                        if (item.key === 'VCT') return 'bg-purple-500 text-white';
                                        if (item.key === 'SCT') return 'bg-blue-500 text-white';
                                        if (item.key === 'ACT') return 'bg-green-500 text-white';
                                        return 'bg-gray-500 text-white';
                                      };
                                      
                                      return (
                                        <div 
                                          key={item.key}
                                          className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md text-[10px] font-bold ${getBadgeColor()} shadow-sm hover:scale-110 transition-transform cursor-pointer`}
                                          title={`${item.label}: ${item.score}/10 - Click to edit`}
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
                                          <span className="opacity-90">{item.label}</span>
                                          <span className="text-[11px]">{item.score}</span>
                                        </div>
                                      );
                                    })
                                  ) : (
                                    <div className="text-white/20 text-[10px]">-</div>
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
                              <td className={`sticky left-0 z-10 glass-card border-r border-white/10 border-b border-white/10 p-2 pl-12 border-l-4 ${cat.accent}`} style={{ minWidth: '20rem', maxWidth: '20rem' }}>
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

        {/* Right sidebar - Fixed position */}
        <div className="space-y-6 overflow-y-auto h-full lg:h-full lg:max-h-none max-h-96">
          {/* Test Insights Panel */}
          {creativeMode === 'creative' && (
            <div className="glass-card-large p-6 bg-gradient-to-br from-purple-500/5 to-pink-500/5">
              <h3 className="font-semibold text-white mb-4 flex items-center gap-2">
                <Sparkles className="text-purple-400" size={20} />
                Test Performance Insights
              </h3>
              <div className="space-y-3">
                <div className="text-sm text-white/80">
                  <div className="flex justify-between mb-2">
                    <span>Video Test Success Rate</span>
                    <span className="font-bold text-purple-400">87%</span>
                  </div>
                  <div className="w-full bg-white/10 rounded-full h-2">
                    <div className="bg-gradient-to-r from-purple-400 to-pink-400 h-2 rounded-full" style={{width: '87%'}}></div>
                  </div>
                </div>
                <div className="text-sm text-white/80">
                  <div className="flex justify-between mb-2">
                    <span>Static Creative Performance</span>
                    <span className="font-bold text-blue-400">76%</span>
                  </div>
                  <div className="w-full bg-white/10 rounded-full h-2">
                    <div className="bg-gradient-to-r from-blue-400 to-purple-400 h-2 rounded-full" style={{width: '76%'}}></div>
                  </div>
                </div>
                <div className="text-sm text-white/80">
                  <div className="flex justify-between mb-2">
                    <span>Copy Test Effectiveness</span>
                    <span className="font-bold text-green-400">95%</span>
                  </div>
                  <div className="w-full bg-white/10 rounded-full h-2">
                    <div className="bg-gradient-to-r from-green-400 to-blue-400 h-2 rounded-full" style={{width: '95%'}}></div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Add Employee */}
          {(handleAddEmployee || handleBulkAdd) && (
            <div className="glass-card-large p-6">
              <h3 className="font-semibold text-white mb-4">Add Product</h3>
              
              {handleAddEmployee && (
                <div className="flex gap-3">
                  <input 
                    value={newEmployeeName} 
                    onChange={e => setNewEmployeeName && setNewEmployeeName(e.target.value)}
                    placeholder="Product name" 
                    className="flex-1 glass-input px-4 py-3 text-sm"
                    onKeyDown={e => e.key === 'Enter' && handleAddEmployee()}
                  />
                  <button 
                    onClick={handleAddEmployee} 
                    className="glass-button px-6 py-3 text-sm font-medium hover:scale-105"
                  >
                    Add
                  </button>
                </div>
              )}

              {setBulkOpen && (
                <>
                  <button 
                    onClick={() => setBulkOpen(!bulkOpen)} 
                    className="mt-4 text-sm text-blue-300 hover:text-blue-200 transition-colors"
                  >
                    {bulkOpen ? "Hide bulk add" : "Quick bulk add..."}
                  </button>
                  
                  {bulkOpen && handleBulkAdd && (
                    <div className="mt-4 space-y-3">
                      <textarea
                        value={bulkText}
                        onChange={e => setBulkText && setBulkText(e.target.value)}
                        rows={5}
                        placeholder="Enter names, one per line"
                        className="w-full glass-input px-4 py-3 resize-none text-sm"
                      />
                      <button 
                        onClick={handleBulkAdd} 
                        className="w-full glass-button px-4 py-3 text-sm font-medium hover:scale-105"
                      >
                        Add All
                      </button>
                    </div>
                  )}
                </>
              )}
            </div>
          )}

          {/* Test Types */}
          <div className="glass-card-large p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-white">Test Types</h3>
              {setCategoryModal && (
                <button
                  onClick={() => setCategoryModal(true)}
                  className="glass-button p-2 hover:scale-110"
                >
                  <Settings size={16} />
                </button>
              )}
            </div>
            
            <div className="space-y-3">
              {categories.map(cat => {
                const Icon = getIcon(cat.iconName);
                return (
                  <div key={cat.id} className="glass-card p-4 rounded-2xl hover:scale-105 transition-all duration-300">
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

          {/* Performance Scale */}
          <div className="glass-card-large p-6">
            <h3 className="font-semibold text-white mb-4">Performance Scale</h3>
            <div className="space-y-3">
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
        </div>
      </div>
    </div>
  );
}

export default CreativePerformance;