import React, { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import {
  Download, Trash2, Pencil, Settings, PlusCircle, X,
  ChevronLeft, ChevronRight, Calendar, Plus, Users, 
  TrendingUp, Clock, FileText, Briefcase, Upload,
  Bot, Save, Edit2, Star, Home, BarChart3, Sun, Moon, Menu, ArrowLeft
} from "lucide-react";

/* -----------------------------------------------------------
   HR Weekly Performance Evaluation System
----------------------------------------------------------- */

// Company Logo Component
function CompanyLogo({ className = "w-8 h-8" }) {
  return (
    <svg 
      className={className}
      viewBox="0 0 646.4 702.4" 
      xmlns="http://www.w3.org/2000/svg"
    >
      <path 
        fill="currentColor" 
        d="M360.4,82v124.5l-36.5,71.7l-38.7-71.7V0L0,163.1v376.3l285,163v-204l37.6-73l37.6,73v204l286.3-163.2V163.1
        L360.4,0L360.4,82z M75.2,496V206.5l133.4-76.3v76.3L285,353.6l-76.3,144.7v74.1L75.2,496z M570.1,427.6v68.2l-133.4,76.3v-74.1
        l-74.1-149.4l0,0v-3.5L436.7,206v-76.1l133.4,76.3V427.6z"
      />
    </svg>
  );
}

/* -----------------------------------------------------------
   Sidebar Component
----------------------------------------------------------- */
function Sidebar({ isCollapsed, onToggle, currentView, onViewChange, isDarkMode, onThemeToggle }) {
  const menuItems = [
    {
      id: 'dashboard',
      label: 'Dashboard', 
      icon: Home,
      active: currentView === 'dashboard'
    },
    {
      id: 'employees',
      label: 'Employees',
      icon: Users,
      active: currentView === 'employees'
    },
    {
      id: 'performance',
      label: 'Performance',
      icon: BarChart3,
      active: currentView === 'performance'
    }
  ];

  return (
    <div className={`${isCollapsed ? 'w-20' : 'w-72'} glass-sidebar h-screen flex flex-col transition-all duration-500 ease-out fixed left-0 top-0 z-50 ml-2 mt-4 mb-4 mr-2 rounded-3xl relative`}>
      {/* Hover edge trigger - positioned at sidebar center (always visible for consistent workflow) */}
      <div 
        className="absolute top-1/2 -translate-y-1/2 -right-2 w-4 h-16 bg-transparent hover:bg-white/5 cursor-pointer transition-colors duration-300 flex items-center justify-center group rounded-r-xl"
        onClick={onToggle}
        title={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
      >
        <div className="w-1 h-8 bg-white/20 rounded-full group-hover:bg-white/40 group-hover:w-1.5 transition-all duration-300"></div>
      </div>
      {/* Header with Logo Toggle */}
      <div className="p-6 relative" style={{ borderBottom: '1px solid var(--glass-border)' }}>
        <div className={`flex items-center gap-3 ${isCollapsed ? 'justify-center' : ''}`}>
          <button
            onClick={onToggle}
            className="group relative glass-card p-2 rounded-2xl liquid-float hover:scale-110 transition-all duration-500 cursor-pointer"
            title={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            <CompanyLogo className={`${isCollapsed ? 'w-8 h-8' : 'w-10 h-10'} text-white transition-all duration-500 group-hover:rotate-12`} />
            
            {/* Subtle indicator */}
            <div className="absolute -bottom-1 -right-1 w-3 h-3 glass-card rounded-full flex items-center justify-center opacity-70 group-hover:opacity-100 transition-opacity">
              {isCollapsed ? (
                <ChevronRight size={8} className="text-white/80" />
              ) : (
                <ChevronLeft size={8} className="text-white/80" />
              )}
            </div>
          </button>
          
          {!isCollapsed && (
            <div className="text-xl font-bold bg-gradient-to-r from-white to-white/80 bg-clip-text text-transparent">
              Helix Digital
            </div>
          )}
        </div>
      </div>

      {/* Navigation Menu */}
      <nav className="flex-1" style={{ padding: '10px' }}>
        <ul className="space-y-3">
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <li key={item.id}>
                <button
                  onClick={() => onViewChange(item.id)}
                  className={`${isCollapsed ? 'flex-none min-w-[56px] max-w-[56px] h-14 justify-center p-0' : 'w-full flex gap-4 p-4'} flex items-center rounded-2xl transition-all duration-300 group relative overflow-hidden ${
                    item.active 
                      ? 'glass-card bg-gradient-to-r from-blue-500/20 to-purple-500/20 border-blue-400/30 shadow-lg shadow-blue-500/20 text-white' 
                      : 'text-white/70 hover:text-white hover:glass-card hover:bg-white/5'
                  }`}
                  title={isCollapsed ? item.label : ''}
                >
                  <div className={`p-3 w-14 h-14 rounded-xl transition-all duration-300 flex items-center justify-center ${
                    item.active 
                      ? 'bg-gradient-to-br from-blue-400 to-blue-600 shadow-lg shadow-blue-500/30' 
                      : 'bg-white/10 group-hover:bg-white/20'
                  }`}>
                    <Icon size={20} className={`flex-shrink-0 ${item.active ? 'text-white' : 'text-white/80'}`} />
                  </div>
                  {!isCollapsed && (
                    <span className="font-semibold text-lg tracking-wide">{item.label}</span>
                  )}
                  {item.active && (
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent animate-pulse rounded-2xl" />
                  )}
                </button>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Theme Toggle at Bottom */}
      <div className="p-6" style={{ borderTop: '1px solid var(--glass-border)' }}>
        <button 
          onClick={onThemeToggle}
          className={`${isCollapsed ? 'flex-none min-w-[56px] max-w-[56px] h-14 justify-center p-0' : 'w-full flex gap-4 p-4'} flex items-center rounded-2xl transition-all duration-300 group hover:glass-card hover:bg-yellow-500/10 hover:border-yellow-400/20`}
          style={{ color: 'var(--text-secondary)' }}
          title={isCollapsed ? (isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode') : ''}
        >
          <div className="p-3 w-14 h-14 rounded-xl bg-white/10 group-hover:bg-yellow-500/20 transition-all duration-300 flex items-center justify-center">
            {isDarkMode ? <Sun size={20} className="flex-shrink-0" /> : <Moon size={20} className="flex-shrink-0" />}
          </div>
          {!isCollapsed && (
            <span className="font-semibold text-lg tracking-wide">
              {isDarkMode ? 'Light Mode' : 'Dark Mode'}
            </span>
          )}
        </button>
      </div>
    </div>
  );
}

// ---------- helpers ----------
function uid() { return Math.random().toString(36).slice(2, 9); }

function getWeekNumber(date) {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() + 4 - (d.getDay() || 7));
  const yearStart = new Date(d.getFullYear(), 0, 1);
  const weekNo = Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
  return weekNo;
}

function getWeekRange(date) {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  const monday = new Date(d.setDate(diff));
  const sunday = new Date(monday);
  sunday.setDate(sunday.getDate() + 6);
  return {
    start: monday.toISOString().slice(0, 10),
    end: sunday.toISOString().slice(0, 10),
    week: getWeekNumber(monday),
    year: monday.getFullYear()
  };
}

function getWeeksInRange(startDate, endDate) {
  const weeks = [];
  const current = new Date(startDate);
  const end = new Date(endDate);
  
  while (current <= end) {
    const weekInfo = getWeekRange(current);
    const weekKey = `${weekInfo.year}-W${String(weekInfo.week).padStart(2, '0')}`;
    if (!weeks.find(w => w.key === weekKey)) {
      weeks.push({
        key: weekKey,
        ...weekInfo
      });
    }
    current.setDate(current.getDate() + 7);
  }
  return weeks;
}

function startOfMonth(date = new Date()) {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

function endOfMonth(date = new Date()) {
  return new Date(date.getFullYear(), date.getMonth() + 1, 0);
}

function addMonths(date = new Date(), n = 1) {
  return new Date(date.getFullYear(), date.getMonth() + n, 1);
}

// Performance tier calculation
function scoreToTier(score) {
  if (score >= 9) return 1;
  if (score >= 7) return 2;
  if (score >= 5) return 3;
  if (score >= 3) return 4;
  return 5;
}

function tierStyles(score) {
  if (score == null) return { bg: "bg-transparent", text: "text-gray-700" };
  const t = scoreToTier(score);
  switch (t) {
    case 1: return { bg: "bg-green-500", text: "text-white" };
    case 2: return { bg: "bg-green-400", text: "text-white" };
    case 3: return { bg: "bg-yellow-400", text: "text-black" };
    case 4: return { bg: "bg-orange-500", text: "text-white" };
    default: return { bg: "bg-red-600", text: "text-white" };
  }
}

function download(filename, text, type = "application/json") {
  const blob = new Blob([text], { type });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a"); 
  a.href = url; 
  a.download = filename; 
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1500);
}

/* -----------------------------------------------------------
   DEFAULT EVALUATION CATEGORIES
----------------------------------------------------------- */
const DEFAULT_CATEGORIES = [
  { 
    id: "cat-1",
    key: "PERF", 
    label: "Performance", 
    short: "P", 
    accent: "border-l-blue-500", 
    tag: "bg-blue-500", 
    iconName: "TrendingUp",
    description: "Overall work output and quality",
    weight: 25
  },
  { 
    id: "cat-2",
    key: "ETHIC", 
    label: "Work Ethic", 
    short: "W", 
    accent: "border-l-purple-500", 
    tag: "bg-purple-500", 
    iconName: "Users",
    description: "Dedication, reliability, and professionalism",
    weight: 20
  },
  { 
    id: "cat-3",
    key: "EFF", 
    label: "Efficiency", 
    short: "E", 
    accent: "border-l-green-500", 
    tag: "bg-green-500", 
    iconName: "Clock",
    description: "Time management and productivity",
    weight: 20
  },
  { 
    id: "cat-4",
    key: "REP", 
    label: "Reporting", 
    short: "R", 
    accent: "border-l-orange-500", 
    tag: "bg-orange-500", 
    iconName: "FileText",
    description: "Communication and documentation quality",
    weight: 20
  },
  { 
    id: "cat-5",
    key: "MGMT", 
    label: "Management", 
    short: "M", 
    accent: "border-l-red-500", 
    tag: "bg-red-500", 
    iconName: "Briefcase",
    description: "Leadership and team coordination",
    weight: 15
  },
];

// Icon mapping helper
const getIcon = (iconName) => {
  const icons = {
    TrendingUp,
    Users,
    Clock,
    FileText,
    Briefcase,
    Star
  };
  return icons[iconName] || Star;
};

/* -----------------------------------------------------------
   LOCAL STORAGE DATA LAYER
----------------------------------------------------------- */
const LS_EMPLOYEES = "hr_weekly_employees";
const LS_EVALUATIONS = "hr_weekly_evaluations";
const LS_CATEGORIES = "hr_weekly_categories";
const LS_REVIEWS = "hr_weekly_reviews";

// Initialize data
(function seedInitialData() {
  if (!localStorage.getItem(LS_EMPLOYEES)) {
    const seedEmployees = [
      { 
        id: "emp-001", 
        name: "Sarah Johnson", 
        department: "Engineering", 
        role: "Senior Developer",
        seniority: "Senior",
        startDate: "2022-03-15",
        managerId: null
      },
      { 
        id: "emp-002", 
        name: "Michael Chen", 
        department: "Product", 
        role: "Product Manager",
        seniority: "Mid",
        startDate: "2023-01-10",
        managerId: "emp-001"
      },
      { 
        id: "emp-003", 
        name: "Emily Davis", 
        department: "Design", 
        role: "UX Designer",
        seniority: "Junior",
        startDate: "2024-09-01",
        managerId: "emp-001"
      },
    ];
    localStorage.setItem(LS_EMPLOYEES, JSON.stringify(seedEmployees));
  }
  
  if (!localStorage.getItem(LS_CATEGORIES)) {
    localStorage.setItem(LS_CATEGORIES, JSON.stringify(DEFAULT_CATEGORIES));
  }
  
  if (!localStorage.getItem(LS_EVALUATIONS)) {
    localStorage.setItem(LS_EVALUATIONS, JSON.stringify({}));
  }
  
  if (!localStorage.getItem(LS_REVIEWS)) {
    localStorage.setItem(LS_REVIEWS, JSON.stringify({}));
  }
})();

function lsRead(key, fallback) {
  try { return JSON.parse(localStorage.getItem(key)) ?? fallback; }
  catch { return fallback; }
}

function lsWrite(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

/* -----------------------------------------------------------
   Quick Score Modal Component
----------------------------------------------------------- */
function QuickScoreModal({ employee, week, category, currentScore, onSave, onDelete, onClose }) {
  const [score, setScore] = useState(currentScore || 5);
  
  useEffect(() => {
    const handleKeyPress = (e) => {
      // Direct number keys without shift
      if (!e.shiftKey && !e.ctrlKey && !e.altKey && !e.metaKey) {
        // 1-9 for scores 1-9
        if (e.key >= '1' && e.key <= '9') {
          const newScore = parseInt(e.key);
          setScore(newScore);
          onSave(newScore);
          onClose();
          return;
        }
        // 0 for score 10
        if (e.key === '0') {
          setScore(10);
          onSave(10);
          onClose();
          return;
        }
      }
      
      // Escape to close
      if (e.key === 'Escape') {
        onClose();
      }
      
      // Backspace to delete
      if (e.key === 'Backspace') {
        e.preventDefault();
        onDelete();
        onClose();
      }
    };
    
    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [onSave, onDelete, onClose]);
  
  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/50 backdrop-blur-sm" onClick={onClose}>
      <div className="glass-card-large rounded-2xl shadow-2xl p-6 min-w-[400px] border border-white/20" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-semibold text-white">{employee.name}</h3>
            <p className="text-sm text-white/60">
              {category.label} • Week {week.week}
            </p>
          </div>
          <button onClick={onClose} className="glass-button p-2 rounded-lg hover:scale-110">
            <X size={18} className="text-white/80" />
          </button>
        </div>
        
        <div className="space-y-4">
          {/* Score Slider */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-medium text-white/80">Score</label>
              <span className="text-2xl font-bold text-white">{score}</span>
            </div>
            <input
              type="range"
              min="1"
              max="10"
              value={score}
              onChange={(e) => setScore(Number(e.target.value))}
              className="w-full"
            />
          </div>
          
          {/* Weighted Average Display */}
          <div className="p-3 glass-card rounded-lg">
            <div className="text-sm text-white/70">
              <span>Category Weight: {category.weight}%</span>
              <div className="mt-1 font-medium text-white">
                Current Score: <span className="text-lg">{score}/10</span>
              </div>
            </div>
          </div>
          
          {/* Delete Button */}
          {currentScore && (
            <button
              onClick={() => {
                onDelete();
                onClose();
              }}
              className="w-full py-2 glass-button border border-red-400/30 text-red-400 rounded-lg hover:bg-red-500/20"
            >
              Delete Score
            </button>
          )}
          
          {/* Number Grid */}
          <div className="grid grid-cols-10 gap-1">
            {[1,2,3,4,5,6,7,8,9,10].map(n => {
              const styles = tierStyles(n);
              return (
                <button
                  key={n}
                  onClick={() => {
                    onSave(n);
                    onClose();
                  }}
                  className={`h-10 rounded-lg ${styles.bg} ${styles.text} font-bold hover:scale-110 transition-transform ${score === n ? 'ring-2 ring-offset-2 ring-gray-400' : ''}`}
                >
                  {n === 10 ? '10' : n}
                </button>
              );
            })}
          </div>
          
          {/* Keyboard Shortcuts */}
          <div className="text-xs text-white/50 space-y-1 border-t border-white/20 pt-3">
            <p>• Press <kbd className="px-1 py-0.5 glass-card rounded text-white/80">1-9</kbd> for scores 1-9</p>
            <p>• Press <kbd className="px-1 py-0.5 glass-card rounded text-white/80">0</kbd> for score 10</p>
            <p>• Press <kbd className="px-1 py-0.5 glass-card rounded text-white/80">Backspace</kbd> to remove score</p>
            <p>• Press <kbd className="px-1 py-0.5 glass-card rounded text-white/80">Esc</kbd> to close</p>
          </div>
        </div>
      </div>
    </div>
  );
}

/* -----------------------------------------------------------
   Weekly Evaluation Modal
----------------------------------------------------------- */
function WeeklyEvaluationModal({ employee, week, categories, onSave, onClose }) {
  const evaluations = lsRead(LS_EVALUATIONS, {});
  const reviews = lsRead(LS_REVIEWS, {});
  const evalKey = `${employee.id}|${week.key}`;
  const existing = evaluations[evalKey] || {};
  const existingReview = reviews[evalKey] || {};
  
  const [scores, setScores] = useState(() => {
    const initial = {};
    categories.forEach(cat => {
      initial[cat.key] = existing[cat.key] || null;
    });
    return initial;
  });
  
  const [reports, setReports] = useState({
    daily: existingReview.dailyReports || "",
    weekly: existingReview.weeklyReports || "",
    monthly: existingReview.monthlyReports || ""
  });
  
  const [manualReview, setManualReview] = useState(existingReview.manualReview || "");
  const [aiReview, setAiReview] = useState(existingReview.aiReview || "");
  const [showAI, setShowAI] = useState(false);

  const isNewEmployee = () => {
    if (!employee.startDate) return false;
    const start = new Date(employee.startDate);
    const now = new Date();
    const monthsDiff = (now.getFullYear() - start.getFullYear()) * 12 + 
                      (now.getMonth() - start.getMonth());
    return monthsDiff <= 3;
  };

  const handleSave = () => {
    // Filter out null scores before saving
    const validScores = {};
    Object.keys(scores).forEach(key => {
      if (scores[key] !== null && scores[key] !== undefined) {
        validScores[key] = scores[key];
      }
    });
    
    const currentEvaluations = lsRead(LS_EVALUATIONS, {});
    
    // Only save if there are valid scores
    if (Object.keys(validScores).length > 0) {
      currentEvaluations[evalKey] = validScores;
    } else {
      // If no valid scores, delete the entry
      delete currentEvaluations[evalKey];
    }
    lsWrite(LS_EVALUATIONS, currentEvaluations);
    
    // Save reviews if any content exists
    if (reports.daily || reports.weekly || reports.monthly || manualReview || aiReview) {
      const currentReviews = lsRead(LS_REVIEWS, {});
      currentReviews[evalKey] = {
        dailyReports: reports.daily,
        weeklyReports: reports.weekly,
        monthlyReports: reports.monthly,
        manualReview,
        aiReview,
        timestamp: new Date().toISOString()
      };
      lsWrite(LS_REVIEWS, currentReviews);
    }
    
    onSave();
  };

  const handleEvaluate = async () => {
    // Prepare data for webhook
    const payload = {
      employee: {
        name: employee.name,
        department: employee.department,
        role: employee.role,
        seniority: employee.seniority
      },
      week: week.key,
      scores,
      reports,
      manualReview,
      categories: categories.map(c => ({
        key: c.key,
        label: c.label,
        weight: c.weight
      }))
    };
    
    // Simulate AI response (in production, this would be a webhook call)
    console.log("Sending to LLM:", payload);
    setShowAI(true);
    
    // Simulate AI generated review
    setTimeout(() => {
      const validScores = Object.values(scores).filter(s => s !== null && s !== undefined);
      const avgScore = validScores.length > 0 
        ? (validScores.reduce((a,b) => a+b, 0) / validScores.length).toFixed(1)
        : "N/A";
        
      const mockAiReview = `Based on the submitted reports and evaluations for ${employee.name}:

**Performance Highlights:**
- Demonstrated strong commitment to meeting project deadlines
- Quality of work consistently meets expectations
- Good collaboration with team members

**Areas for Improvement:**
- Could benefit from more proactive communication
- Time management skills need refinement

**Recommendation:**
Overall performance score: ${avgScore}/10

Continue monitoring progress with focus on identified improvement areas.`;
      
      setAiReview(mockAiReview);
    }, 1500);
  };

  const handleFileUpload = (type) => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.txt,.csv';
    input.onchange = (e) => {
      const file = e.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (event) => {
          setReports(prev => ({
            ...prev,
            [type]: event.target.result
          }));
        };
        reader.readAsText(file);
      }
    };
    input.click();
  };

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/50 backdrop-blur-sm p-4" onClick={onClose}>
      <div className="w-full max-w-4xl max-h-[90vh] overflow-y-auto glass-card-large rounded-2xl shadow-2xl border border-white/20" onClick={e => e.stopPropagation()}>
        <div className="sticky top-0 bg-black/80 backdrop-blur-md border-b border-white/20 p-6 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-white">{employee.name} - Week {week.week}, {week.year}</h2>
            <p className="text-sm text-white/60">{week.start} to {week.end}</p>
            {isNewEmployee() && (
              <span className="inline-block mt-1 px-2 py-0.5 glass-card bg-yellow-500/20 border border-yellow-400/30 text-yellow-300 text-xs rounded">
                New Employee - Daily Reports Required
              </span>
            )}
          </div>
          <button onClick={onClose} className="glass-button p-2 rounded-lg hover:scale-110">
            <X size={20} className="text-white/80" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Performance Scores */}
          <div>
            <h3 className="font-medium mb-3 text-white">Performance Evaluation</h3>
            <div className="space-y-3">
              {categories.map(cat => {
                const Icon = getIcon(cat.iconName);
                return (
                  <div key={cat.key} className="flex items-center gap-4">
                    <div className="flex items-center gap-2 w-48">
                      <div className={`p-1.5 rounded ${cat.tag}`}>
                        <Icon size={14} className="text-white" />
                      </div>
                      <div>
                        <div className="text-sm font-medium text-white">{cat.label}</div>
                        <div className="text-xs text-white/60">Weight: {cat.weight}%</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 flex-1">
                      <input
                        type="range"
                        min="1"
                        max="10"
                        value={scores[cat.key] || 5}
                        onChange={(e) => setScores(prev => ({
                          ...prev,
                          [cat.key]: Number(e.target.value)
                        }))}
                        className="flex-1"
                      />
                      <span className="w-8 text-center font-bold text-white">{scores[cat.key] || '-'}</span>
                      {scores[cat.key] && (
                        <button
                          onClick={() => setScores(prev => ({
                            ...prev,
                            [cat.key]: null
                          }))}
                          className="p-1 rounded hover:bg-red-500/20 text-red-400"
                          title="Clear score"
                        >
                          <X size={14} />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="mt-3 p-3 glass-card rounded-lg flex items-center justify-between">
              <div className="text-sm text-white">
                <strong>Weighted Average:</strong>{' '}
                {(() => {
                  const avg = categories.reduce((sum, cat) => {
                    const score = scores[cat.key];
                    if (score !== null && score !== undefined) {
                      return sum + (score * cat.weight / 100);
                    }
                    return sum;
                  }, 0);
                  return avg > 0 ? `${avg.toFixed(1)}/10` : 'No scores set';
                })()}
              </div>
              {Object.keys(scores).some(key => scores[key] !== null && scores[key] !== undefined) && (
                <button
                  onClick={() => {
                    const initial = {};
                    categories.forEach(cat => {
                      initial[cat.key] = 5;
                    });
                    setScores(initial);
                  }}
                  className="text-xs text-white/60 hover:text-white/80"
                >
                  Reset to Default
                </button>
              )}
            </div>
          </div>

          {/* Reports Section */}
          <div>
            <h3 className="font-medium mb-3 text-white">Reports</h3>
            <div className="space-y-3">
              {isNewEmployee() && (
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-sm font-medium text-white/80">Daily Reports (Required for first 3 months)</label>
                    <button
                      onClick={() => handleFileUpload('daily')}
                      className="inline-flex items-center gap-2 px-3 py-2 text-xs font-medium glass-card rounded-xl hover:scale-105 transition-all duration-300 bg-gradient-to-r from-blue-500/20 to-purple-500/20 border border-blue-400/30 shadow-lg shadow-blue-500/10 text-blue-300 hover:text-blue-200"
                    >
                      <div className="p-1 rounded-lg bg-blue-500/30">
                        <Upload size={10} className="text-blue-200" />
                      </div>
                      Upload
                    </button>
                  </div>
                  <textarea
                    value={reports.daily}
                    onChange={(e) => setReports(prev => ({ ...prev, daily: e.target.value }))}
                    placeholder="Paste daily reports or upload file..."
                    className="w-full glass-input px-3 py-2 text-sm resize-none"
                    rows={3}
                  />
                </div>
              )}
              
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm font-medium text-white/80">Weekly Reports</label>
                  <button
                    onClick={() => handleFileUpload('weekly')}
                    className="inline-flex items-center gap-2 px-3 py-2 text-xs font-medium glass-card rounded-xl hover:scale-105 transition-all duration-300 bg-gradient-to-r from-green-500/20 to-emerald-500/20 border border-green-400/30 shadow-lg shadow-green-500/10 text-green-300 hover:text-green-200"
                  >
                    <div className="p-1 rounded-lg bg-green-500/30">
                      <Upload size={10} className="text-green-200" />
                    </div>
                    Upload
                  </button>
                </div>
                <textarea
                  value={reports.weekly}
                  onChange={(e) => setReports(prev => ({ ...prev, weekly: e.target.value }))}
                  placeholder="Paste weekly reports or upload file..."
                  className="w-full px-3 py-2 border rounded-lg text-sm resize-none"
                  rows={3}
                />
              </div>
              
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm font-medium text-white/80">Monthly Reports</label>
                  <button
                    onClick={() => handleFileUpload('monthly')}
                    className="inline-flex items-center gap-2 px-3 py-2 text-xs font-medium glass-card rounded-xl hover:scale-105 transition-all duration-300 bg-gradient-to-r from-orange-500/20 to-red-500/20 border border-orange-400/30 shadow-lg shadow-orange-500/10 text-orange-300 hover:text-orange-200"
                  >
                    <div className="p-1 rounded-lg bg-orange-500/30">
                      <Upload size={10} className="text-orange-200" />
                    </div>
                    Upload
                  </button>
                </div>
                <textarea
                  value={reports.monthly}
                  onChange={(e) => setReports(prev => ({ ...prev, monthly: e.target.value }))}
                  placeholder="Paste monthly reports or upload file..."
                  className="w-full px-3 py-2 border rounded-lg text-sm resize-none"
                  rows={3}
                />
              </div>
            </div>
          </div>

          {/* Manual Review */}
          <div>
            <h3 className="font-medium mb-2 text-white">Manager's Review</h3>
            <textarea
              value={manualReview}
              onChange={(e) => setManualReview(e.target.value)}
              placeholder="Write your performance review for this employee..."
              className="w-full px-3 py-2 border rounded-lg text-sm resize-none"
              rows={5}
            />
          </div>

          {/* AI Evaluation */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-medium flex items-center gap-2 text-white">
                <Bot size={18} className="text-blue-400" />
                AI Performance Review
              </h3>
              <button
                onClick={handleEvaluate}
                className="glass-button px-4 py-2 bg-blue-600/80 text-white hover:scale-105 hover:bg-blue-600 text-sm font-medium"
              >
                Generate AI Review
              </button>
            </div>
            {showAI && (
              <div className="p-4 glass-card border border-blue-400/30 rounded-lg">
                <textarea
                  value={aiReview}
                  onChange={(e) => setAiReview(e.target.value)}
                  placeholder="AI-generated review will appear here..."
                  className="w-full glass-input px-3 py-2 text-sm resize-none"
                  rows={6}
                />
              </div>
            )}
          </div>
        </div>

        <div className="sticky bottom-0 bg-black/80 backdrop-blur-md border-t border-white/20 p-6 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="glass-button px-4 py-2 text-white/80 hover:scale-105"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="glass-button px-4 py-2 bg-blue-600/80 text-white hover:scale-105 hover:bg-blue-600"
          >
            Save Evaluation
          </button>
        </div>
      </div>
    </div>
  );
}

/* -----------------------------------------------------------
   Employee Settings Modal
----------------------------------------------------------- */
function EmployeeSettingsModal({ employee, employees, onSave, onClose }) {
  const [formData, setFormData] = useState({
    name: employee.name,
    department: employee.department || "",
    role: employee.role || "",
    seniority: employee.seniority || "Junior",
    startDate: employee.startDate || new Date().toISOString().slice(0, 10),
    managerId: employee.managerId || ""
  });

  // Get potential managers (exclude self and direct reports to avoid circular references)
  const getDirectReports = (empId) => {
    return employees.filter(emp => emp.managerId === empId).map(emp => emp.id);
  };

  const getAllSubordinates = (empId) => {
    const direct = getDirectReports(empId);
    const all = [...direct];
    direct.forEach(id => {
      all.push(...getAllSubordinates(id));
    });
    return all;
  };

  const potentialManagers = employees.filter(emp => 
    emp.id !== employee.id && 
    !getAllSubordinates(employee.id).includes(emp.id)
  );

  const handleSave = () => {
    onSave(formData);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/50 backdrop-blur-sm" onClick={onClose}>
      <div className="w-full max-w-md glass-card-large rounded-2xl shadow-2xl border border-white/20" onClick={e => e.stopPropagation()}>
        <div className="p-6 border-b border-white/20 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-white">Employee Settings</h2>
          <button onClick={onClose} className="glass-button p-2 rounded-lg hover:scale-110">
            <X size={20} className="text-white/80" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <div>
            <label className="text-sm font-medium text-white/80">Name</label>
            <input
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              className="mt-1 w-full glass-input px-3 py-2"
            />
          </div>

          <div>
            <label className="text-sm font-medium text-white/80">Department</label>
            <input
              value={formData.department}
              onChange={(e) => setFormData(prev => ({ ...prev, department: e.target.value }))}
              className="mt-1 w-full glass-input px-3 py-2"
              placeholder="e.g., Engineering, Product, Design"
            />
          </div>

          <div>
            <label className="text-sm font-medium text-white/80">Role</label>
            <input
              value={formData.role}
              onChange={(e) => setFormData(prev => ({ ...prev, role: e.target.value }))}
              className="mt-1 w-full glass-input px-3 py-2"
              placeholder="e.g., Senior Developer, Product Manager"
            />
          </div>

          <div>
            <label className="text-sm font-medium text-white/80">Seniority</label>
            <select
              value={formData.seniority}
              onChange={(e) => setFormData(prev => ({ ...prev, seniority: e.target.value }))}
              className="mt-1 w-full glass-input px-3 py-2"
            >
              <option value="Intern">Intern</option>
              <option value="Junior">Junior</option>
              <option value="Mid">Mid-Level</option>
              <option value="Senior">Senior</option>
              <option value="Lead">Lead</option>
              <option value="Principal">Principal</option>
            </select>
          </div>

          <div>
            <label className="text-sm font-medium text-white/80">Manager</label>
            <select
              value={formData.managerId}
              onChange={(e) => setFormData(prev => ({ ...prev, managerId: e.target.value }))}
              className="mt-1 w-full glass-input px-3 py-2"
            >
              <option value="">No Manager</option>
              {potentialManagers.map(manager => (
                <option key={manager.id} value={manager.id}>
                  {manager.name} ({manager.role || 'No role'})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-sm font-medium text-white/80">Start Date</label>
            <input
              type="date"
              value={formData.startDate}
              onChange={(e) => setFormData(prev => ({ ...prev, startDate: e.target.value }))}
              className="mt-1 w-full glass-input px-3 py-2"
            />
          </div>
        </div>

        <div className="p-6 border-t border-white/20 flex justify-end gap-3">
          <button onClick={onClose} className="glass-button px-4 py-2 text-white/80 hover:scale-105">
            Cancel
          </button>
          <button onClick={handleSave} className="glass-button px-4 py-2 bg-blue-600/80 text-white hover:scale-105 hover:bg-blue-600">
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
}

/* -----------------------------------------------------------
   Category Management Modal
----------------------------------------------------------- */
function CategoryManagementModal({ categories, onSave, onClose }) {
  const [localCategories, setLocalCategories] = useState(categories);
  const [editingId, setEditingId] = useState(null);

  const handleAdd = () => {
    const newCat = {
      id: `cat-${uid()}`,
      key: "NEW",
      label: "New Category",
      short: "N",
      accent: "border-l-gray-500",
      tag: "bg-gray-500",
      iconName: "Star",
      description: "New category description",
      weight: 10
    };
    setLocalCategories([...localCategories, newCat]);
    setEditingId(newCat.id);
  };

  const handleUpdate = (id, updates) => {
    setLocalCategories(prev => prev.map(cat => 
      cat.id === id ? { ...cat, ...updates } : cat
    ));
  };

  const handleDelete = (id) => {
    if (localCategories.length <= 1) {
      alert("You must have at least one category");
      return;
    }
    setLocalCategories(prev => prev.filter(cat => cat.id !== id));
  };

  const handleSave = () => {
    // Normalize weights to sum to 100
    const totalWeight = localCategories.reduce((sum, cat) => sum + cat.weight, 0);
    const normalized = localCategories.map(cat => ({
      ...cat,
      weight: Math.round(cat.weight * 100 / totalWeight)
    }));
    onSave(normalized);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/50 p-4" onClick={onClose}>
      <div className="w-full max-w-3xl max-h-[80vh] overflow-y-auto rounded-xl bg-white shadow-2xl" onClick={e => e.stopPropagation()}>
        <div className="sticky top-0 bg-white p-4 border-b flex items-center justify-between">
          <h2 className="text-lg font-semibold">Manage Evaluation Categories</h2>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-gray-100">
            <X size={20} />
          </button>
        </div>

        <div className="p-6">
          <div className="space-y-3">
            {localCategories.map(cat => (
              <div key={cat.id} className="p-4 border rounded-lg">
                {editingId === cat.id ? (
                  <div className="space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                      <input
                        value={cat.label}
                        onChange={(e) => handleUpdate(cat.id, { label: e.target.value })}
                        placeholder="Category Name"
                        className="px-3 py-2 border rounded"
                      />
                      <input
                        value={cat.key}
                        onChange={(e) => handleUpdate(cat.id, { key: e.target.value.toUpperCase() })}
                        placeholder="KEY"
                        maxLength={5}
                        className="px-3 py-2 border rounded"
                      />
                    </div>
                    <input
                      value={cat.description}
                      onChange={(e) => handleUpdate(cat.id, { description: e.target.value })}
                      placeholder="Description"
                      className="w-full px-3 py-2 border rounded"
                    />
                    <div className="flex items-center gap-3">
                      <label className="text-sm">Weight:</label>
                      <input
                        type="number"
                        value={cat.weight}
                        onChange={(e) => handleUpdate(cat.id, { weight: Number(e.target.value) })}
                        min="0"
                        max="100"
                        className="w-20 px-3 py-2 border rounded"
                      />
                      <span className="text-sm text-gray-500">%</span>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => setEditingId(null)}
                        className="px-3 py-1 bg-gray-900 text-white rounded"
                      >
                        Done
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium">{cat.label}</div>
                      <div className="text-sm text-gray-500">{cat.description}</div>
                      <div className="text-xs text-gray-400 mt-1">
                        Key: {cat.key} | Weight: {cat.weight}%
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => setEditingId(cat.id)}
                        className="p-2 rounded hover:bg-gray-100"
                      >
                        <Edit2 size={16} />
                      </button>
                      <button
                        onClick={() => handleDelete(cat.id)}
                        className="p-2 rounded hover:bg-red-50 text-red-600"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>

          <button
            onClick={handleAdd}
            className="mt-4 w-full py-2 border-2 border-dashed border-gray-300 rounded-lg hover:border-gray-400 text-gray-600"
          >
            + Add Category
          </button>

          <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-sm text-yellow-800">
              Total Weight: {localCategories.reduce((sum, cat) => sum + cat.weight, 0)}%
              {localCategories.reduce((sum, cat) => sum + cat.weight, 0) !== 100 && 
                " (Weights will be normalized to 100%)"}
            </p>
          </div>
        </div>

        <div className="sticky bottom-0 bg-white p-4 border-t flex justify-end gap-2">
          <button onClick={onClose} className="px-4 py-2 border rounded-lg hover:bg-gray-50">
            Cancel
          </button>
          <button onClick={handleSave} className="px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800">
            Save Categories
          </button>
        </div>
      </div>
    </div>
  );
}

/* -----------------------------------------------------------
   Enhanced Date Picker
----------------------------------------------------------- */
function DatePicker({ label, value, onChange }) {
  const [open, setOpen] = useState(false);
  const buttonRef = useRef(null);
  const dropdownRef = useRef(null);
  const date = new Date(value);
  const [viewY, setViewY] = useState(date.getFullYear());
  const [viewM, setViewM] = useState(date.getMonth());
  const [position, setPosition] = useState({ top: 0, left: 0 });

  useEffect(() => {
    const onClick = (e) => { 
      if (open && dropdownRef.current && !dropdownRef.current.contains(e.target) && 
          buttonRef.current && !buttonRef.current.contains(e.target)) {
        setOpen(false); 
      }
    };
    window.addEventListener("mousedown", onClick);
    return () => window.removeEventListener("mousedown", onClick);
  }, [open]);

  useEffect(() => {
    if (open && buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      setPosition({
        top: rect.bottom + window.scrollY + 4,
        left: rect.left + window.scrollX
      });
    }
  }, [open]);

  function daysInMonth(y, m) { return new Date(y, m + 1, 0).getDate(); }
  function startWeekday(y, m) { return new Date(y, m, 1).getDay(); }

  const monthName = new Date(viewY, viewM, 1).toLocaleString(undefined, { month: 'long', year: 'numeric' });
  const grid = [];
  const lead = startWeekday(viewY, viewM);
  for (let i = 0; i < lead; i++) grid.push(null);
  for (let day = 1; day <= daysInMonth(viewY, viewM); day++) grid.push(day);

  const selDay = date.getDate(), selM = date.getMonth(), selY = date.getFullYear();

  const dropdown = open && (
    <div 
      ref={dropdownRef}
      className="fixed z-[9999] w-80 rounded-xl glass-card-no-transition shadow-xl p-4"
      style={{
        top: position.top + 'px',
        left: position.left + 'px',
        visibility: position.top === 0 && position.left === 0 ? 'hidden' : 'visible'
      }}
    >
      <div className="flex items-center justify-between mb-3">
        <button onClick={() => setViewM(m => m === 0 ? (setViewY(y => y - 1), 11) : m - 1)} 
          className="p-1.5 rounded-md hover:bg-white/10">
          <ChevronLeft size={18} className="text-white/80" />
        </button>
        <div className="font-semibold text-white">{monthName}</div>
        <button onClick={() => setViewM(m => m === 11 ? (setViewY(y => y + 1), 0) : m + 1)} 
          className="p-1.5 rounded-md hover:bg-white/10">
          <ChevronRight size={18} className="text-white/80" />
        </button>
      </div>

      <div className="grid grid-cols-7 gap-1 text-center text-xs text-white/60 mb-2">
        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(w => <div key={w} className="font-medium">{w}</div>)}
      </div>

      <div className="grid grid-cols-7 gap-1">
        {grid.map((day, i) => {
          const isSel = day && selDay === day && selM === viewM && selY === viewY;
          const isToday = day && new Date().getDate() === day && 
                          new Date().getMonth() === viewM && 
                          new Date().getFullYear() === viewY;
          return (
            <button
              key={i}
              disabled={!day}
              onClick={() => {
                const newDate = new Date(viewY, viewM, day);
                onChange(newDate.toISOString().slice(0, 10));
                setOpen(false);
              }}
              className={
                !day
                  ? "h-9"
                  : "h-9 rounded-lg text-sm transition-colors " +
                    (isSel
                      ? "bg-blue-600 text-white font-medium"
                      : isToday
                      ? "glass-card text-blue-400 font-medium hover:bg-white/10"
                      : "hover:bg-white/5 text-white/80")
              }
            >
              {day || ""}
            </button>
          );
        })}
      </div>
    </div>
  );

  return (
    <div className="flex flex-col">
      {label && <label className="text-xs font-medium text-white/60 mb-1">{label}</label>}
      <button
        ref={buttonRef}
        onClick={() => setOpen(o => !o)}
        className="glass-input px-3 py-2 text-left min-w-[140px] flex items-center justify-between"
      >
        <span className="text-sm text-white">{value}</span>
        <Calendar size={16} className="text-white/60" />
      </button>

      {dropdown && createPortal(dropdown, document.body)}
    </div>
  );
}

/* -----------------------------------------------------------
   Employees Content Component
----------------------------------------------------------- */
function EmployeesContent() {
  const [employees, setEmployees] = useState(() => {
    return lsRead(LS_EMPLOYEES, []);
  });
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterDepartment, setFilterDepartment] = useState('');

  // Add new employee
  const handleAddEmployee = (employeeData) => {
    const newEmployee = {
      id: `emp-${uid()}`,
      ...employeeData,
      startDate: employeeData.startDate || new Date().toISOString().split('T')[0]
    };
    
    const updated = [...employees, newEmployee];
    setEmployees(updated);
    lsWrite(LS_EMPLOYEES, updated);
    setShowAddModal(false);
  };

  // Update employee
  const handleUpdateEmployee = (id, updates) => {
    const updated = employees.map(emp => 
      emp.id === id ? { ...emp, ...updates } : emp
    );
    setEmployees(updated);
    lsWrite(LS_EMPLOYEES, updated);
    setEditingEmployee(null);
  };

  // Delete employee
  const handleDeleteEmployee = (id) => {
    if (!confirm("Are you sure you want to delete this employee?")) return;
    
    const updated = employees.filter(emp => emp.id !== id);
    setEmployees(updated);
    lsWrite(LS_EMPLOYEES, updated);
  };

  // Filter employees
  const filteredEmployees = employees.filter(emp => {
    const matchesSearch = emp.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDepartment = !filterDepartment || emp.department === filterDepartment;
    return matchesSearch && matchesDepartment;
  });

  // Get unique departments
  const departments = [...new Set(employees.map(emp => emp.department))].filter(Boolean);

  return (
    <div className="flex h-full">
      {/* Main Content - Employee Table */}
      <div className="flex-1 p-6">
        <header className="glass-card-large p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-2xl font-bold text-white mb-2 flex items-center gap-3">
                <div className="glass-card p-2 rounded-2xl bg-gradient-to-br from-blue-400/20 to-purple-600/20 border-blue-400/30">
                  <Users size={24} className="text-blue-300" />
                </div>
                Employee Management
              </h1>
              <p className="text-white/60">Manage your team members and organizational structure</p>
            </div>
            <div className="text-3xl font-bold text-white">
              {employees.length}
              <span className="text-sm font-normal text-white/60 ml-2">Total Employees</span>
            </div>
          </div>

          {/* Search and Filter Bar */}
          <div className="flex gap-3">
            <div className="flex-1 relative">
              <input
                type="text"
                placeholder="Search employees..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full glass-input pl-10 pr-4 py-2"
              />
              <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <select
              value={filterDepartment}
              onChange={(e) => setFilterDepartment(e.target.value)}
              className="glass-input px-4 py-2"
            >
              <option value="">All Departments</option>
              {departments.map(dept => (
                <option key={dept} value={dept}>{dept}</option>
              ))}
            </select>
          </div>
        </header>

        {/* Employee Table */}
        <div className="glass-card-large overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/10">
                <th className="text-left p-4 text-white/70 font-medium">Name</th>
                <th className="text-left p-4 text-white/70 font-medium">Department</th>
                <th className="text-left p-4 text-white/70 font-medium">Role</th>
                <th className="text-left p-4 text-white/70 font-medium">Seniority</th>
                <th className="text-left p-4 text-white/70 font-medium">Manager</th>
                <th className="text-left p-4 text-white/70 font-medium">Start Date</th>
                <th className="text-center p-4 text-white/70 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredEmployees.length === 0 ? (
                <tr>
                  <td colSpan="7" className="text-center p-8 text-white/50">
                    No employees found. Add your first employee to get started.
                  </td>
                </tr>
              ) : (
                filteredEmployees.map(emp => (
                  <tr key={emp.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                    <td className="p-4">
                      <div className="font-medium text-white">{emp.name}</div>
                    </td>
                    <td className="p-4 text-white/70">{emp.department || '-'}</td>
                    <td className="p-4 text-white/70">{emp.role || '-'}</td>
                    <td className="p-4 text-white/70">{emp.seniority || '-'}</td>
                    <td className="p-4 text-white/70">
                      {emp.managerId ? employees.find(m => m.id === emp.managerId)?.name || 'Unknown' : '-'}
                    </td>
                    <td className="p-4 text-white/70">
                      {emp.startDate ? new Date(emp.startDate).toLocaleDateString() : '-'}
                    </td>
                    <td className="p-4">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => setEditingEmployee(emp)}
                          className="p-2 rounded-lg hover:bg-white/10 transition-colors"
                          title="Edit"
                        >
                          <Pencil size={16} className="text-white/70" />
                        </button>
                        <button
                          onClick={() => handleDeleteEmployee(emp.id)}
                          className="p-2 rounded-lg hover:bg-red-500/20 transition-colors"
                          title="Delete"
                        >
                          <Trash2 size={16} className="text-red-400" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Right Sidebar - Add Employee Widget */}
      <div className="w-96 p-6 space-y-6">
        <div className="glass-card-large p-6">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <PlusCircle size={20} className="text-blue-400" />
            Add New Employee
          </h3>
          
          <button
            onClick={() => setShowAddModal(true)}
            className="w-full glass-button py-3 font-medium hover:scale-105 transition-transform flex items-center justify-center gap-2"
          >
            <Plus size={20} />
            Add Employee
          </button>

          <div className="mt-6 space-y-4">
            <div className="p-4 rounded-xl bg-white/5 border border-white/10">
              <h4 className="text-sm font-medium text-white/70 mb-2">Quick Stats</h4>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-white/50">Total Employees</span>
                  <span className="text-sm font-medium text-white">{employees.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-white/50">Departments</span>
                  <span className="text-sm font-medium text-white">{departments.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-white/50">Managers</span>
                  <span className="text-sm font-medium text-white">
                    {employees.filter(e => employees.some(emp => emp.managerId === e.id)).length}
                  </span>
                </div>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-gradient-to-br from-blue-500/10 to-purple-500/10 border border-blue-400/20">
              <h4 className="text-sm font-medium text-white mb-2">Recent Activity</h4>
              <p className="text-xs text-white/60">
                {employees.length > 0 
                  ? `Last employee added: ${employees[employees.length - 1].name}`
                  : 'No employees added yet'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Add/Edit Employee Modal */}
      {(showAddModal || editingEmployee) && (
        <AddEmployeeModal
          employee={editingEmployee}
          employees={employees}
          onSave={(data) => {
            if (editingEmployee) {
              handleUpdateEmployee(editingEmployee.id, data);
            } else {
              handleAddEmployee(data);
            }
          }}
          onClose={() => {
            setShowAddModal(false);
            setEditingEmployee(null);
          }}
        />
      )}
    </div>
  );
}

/* -----------------------------------------------------------
   Add Employee Modal Component
----------------------------------------------------------- */
function AddEmployeeModal({ employee, employees, onSave, onClose }) {
  const [formData, setFormData] = useState({
    name: employee?.name || '',
    department: employee?.department || '',
    role: employee?.role || '',
    seniority: employee?.seniority || '',
    managerId: employee?.managerId || '',
    startDate: employee?.startDate || new Date().toISOString().split('T')[0]
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name) {
      alert('Please enter employee name');
      return;
    }
    onSave(formData);
  };

  // Get potential managers (exclude self if editing)
  const potentialManagers = employees.filter(emp => 
    emp.id !== employee?.id
  );

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="glass-card-large w-full max-w-lg">
        <div className="p-6 border-b border-white/10">
          <h2 className="text-xl font-semibold text-white">
            {employee ? 'Edit Employee' : 'Add New Employee'}
          </h2>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-white/70 mb-2">
              Name <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              className="w-full glass-input px-4 py-2"
              placeholder="John Doe"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-white/70 mb-2">Department</label>
            <input
              type="text"
              value={formData.department}
              onChange={(e) => setFormData({...formData, department: e.target.value})}
              className="w-full glass-input px-4 py-2"
              placeholder="Engineering"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-white/70 mb-2">Role</label>
            <input
              type="text"
              value={formData.role}
              onChange={(e) => setFormData({...formData, role: e.target.value})}
              className="w-full glass-input px-4 py-2"
              placeholder="Software Engineer"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-white/70 mb-2">Seniority</label>
            <select
              value={formData.seniority}
              onChange={(e) => setFormData({...formData, seniority: e.target.value})}
              className="w-full glass-input px-4 py-2"
            >
              <option value="">Select seniority</option>
              <option value="Junior">Junior</option>
              <option value="Mid">Mid</option>
              <option value="Senior">Senior</option>
              <option value="Lead">Lead</option>
              <option value="Principal">Principal</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-white/70 mb-2">Manager</label>
            <select
              value={formData.managerId}
              onChange={(e) => setFormData({...formData, managerId: e.target.value})}
              className="w-full glass-input px-4 py-2"
            >
              <option value="">No Manager</option>
              {potentialManagers.map(mgr => (
                <option key={mgr.id} value={mgr.id}>{mgr.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-white/70 mb-2">Start Date</label>
            <input
              type="date"
              value={formData.startDate}
              onChange={(e) => setFormData({...formData, startDate: e.target.value})}
              className="w-full glass-input px-4 py-2"
            />
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 rounded-xl text-white/70 hover:bg-white/10 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="glass-button px-6 py-2 font-medium hover:scale-105 transition-transform"
            >
              {employee ? 'Update' : 'Add'} Employee
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

/* -----------------------------------------------------------
   Main App Component
----------------------------------------------------------- */
export default function App() {
  const [employees, setEmployees] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [startDate, setStartDate] = useState(() => startOfMonth(new Date()).toISOString().slice(0, 10));
  const [endDate, setEndDate] = useState(() => endOfMonth(new Date()).toISOString().slice(0, 10));
  const [cellSize, setCellSize] = useState(100);
  const [filterMinTier, setFilterMinTier] = useState(5);
  
  // UI State
  const [weeklyEvalModal, setWeeklyEvalModal] = useState(null);
  const [employeeSettingsModal, setEmployeeSettingsModal] = useState(null);
  const [categoryModal, setCategoryModal] = useState(false);
  const [newEmployeeName, setNewEmployeeName] = useState("");
  const [bulkOpen, setBulkOpen] = useState(false);
  const [bulkText, setBulkText] = useState("");
  const [expanded, setExpanded] = useState({});
  const [quickScoreModal, setQuickScoreModal] = useState(null);
  
  // Theme State
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const saved = localStorage.getItem('theme');
    return saved ? saved === 'dark' : true; // Default to dark mode
  });
  
  // Save theme preference
  useEffect(() => {
    localStorage.setItem('theme', isDarkMode ? 'dark' : 'light');
    document.documentElement.setAttribute('data-theme', isDarkMode ? 'dark' : 'light');
  }, [isDarkMode]);
  
  // Sidebar state
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [currentView, setCurrentView] = useState('performance');
  
  const scrollRef = useRef(null);
  const weeks = useMemo(() => getWeeksInRange(startDate, endDate), [startDate, endDate]);

  useEffect(() => {
    setEmployees(lsRead(LS_EMPLOYEES, []));
    setCategories(lsRead(LS_CATEGORIES, DEFAULT_CATEGORIES));
    setLoading(false);
  }, []);

  const handleAddEmployee = () => {
    const name = newEmployeeName.trim();
    if (!name) return;
    
    const newEmployee = {
      id: `emp-${uid()}`,
      name,
      department: "",
      role: "",
      seniority: "Junior",
      startDate: new Date().toISOString().slice(0, 10),
      managerId: null
    };
    
    const updated = [...employees, newEmployee];
    setEmployees(updated);
    lsWrite(LS_EMPLOYEES, updated);
    setNewEmployeeName("");
  };

  const handleBulkAdd = () => {
    const names = bulkText.split("\n").map(s => s.trim()).filter(Boolean);
    const newEmployees = names.map(name => ({
      id: `emp-${uid()}`,
      name,
      department: "",
      role: "",
      seniority: "Junior",
      startDate: new Date().toISOString().slice(0, 10),
      managerId: null
    }));
    
    const updated = [...employees, ...newEmployees];
    setEmployees(updated);
    lsWrite(LS_EMPLOYEES, updated);
    setBulkText("");
    setBulkOpen(false);
  };

  const handleUpdateEmployee = (id, updates) => {
    const updated = employees.map(emp => 
      emp.id === id ? { ...emp, ...updates } : emp
    );
    setEmployees(updated);
    lsWrite(LS_EMPLOYEES, updated);
  };

  const handleDeleteEmployee = (id) => {
    if (!confirm("Delete employee and all evaluations?")) return;
    
    const updated = employees.filter(emp => emp.id !== id);
    setEmployees(updated);
    lsWrite(LS_EMPLOYEES, updated);
    
    // Clean up evaluations
    const evaluations = lsRead(LS_EVALUATIONS, {});
    const reviews = lsRead(LS_REVIEWS, {});
    const cleanedEvals = {};
    const cleanedReviews = {};
    
    Object.keys(evaluations).forEach(key => {
      if (!key.startsWith(id + "|")) {
        cleanedEvals[key] = evaluations[key];
      }
    });
    Object.keys(reviews).forEach(key => {
      if (!key.startsWith(id + "|")) {
        cleanedReviews[key] = reviews[key];
      }
    });
    
    lsWrite(LS_EVALUATIONS, cleanedEvals);
    lsWrite(LS_REVIEWS, cleanedReviews);
  };

  const handleSaveCategories = (newCategories) => {
    setCategories(newCategories);
    lsWrite(LS_CATEGORIES, newCategories);
  };

  const getWeeklyScore = (employeeId, weekKey) => {
    const evaluations = lsRead(LS_EVALUATIONS, {});
    const evalKey = `${employeeId}|${weekKey}`;
    const scores = evaluations[evalKey];
    
    if (!scores) return null;
    
    // Calculate weighted average
    let totalScore = 0;
    let totalWeight = 0;
    
    categories.forEach(cat => {
      if (scores[cat.key] !== undefined) {
        totalScore += scores[cat.key] * cat.weight;
        totalWeight += cat.weight;
      }
    });
    
    return totalWeight > 0 ? (totalScore / totalWeight) : null;
  };

  const getEmployeeAverage = (employeeId) => {
    let total = 0;
    let count = 0;
    
    weeks.forEach(week => {
      const score = getWeeklyScore(employeeId, week.key);
      if (score !== null) {
        total += score;
        count++;
      }
    });
    
    return count > 0 ? (total / count).toFixed(1) : null;
  };

  const toggleExpand = (id) => {
    setExpanded(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const getCategoryScore = (employeeId, weekKey, categoryKey) => {
    const evaluations = lsRead(LS_EVALUATIONS, {});
    const evalKey = `${employeeId}|${weekKey}`;
    const scores = evaluations[evalKey];
    return scores?.[categoryKey] || null;
  };

  const saveCategoryScore = (employeeId, weekKey, categoryKey, score) => {
    const evaluations = lsRead(LS_EVALUATIONS, {});
    const evalKey = `${employeeId}|${weekKey}`;
    const existing = evaluations[evalKey] || {};
    
    evaluations[evalKey] = {
      ...existing,
      [categoryKey]: score
    };
    
    lsWrite(LS_EVALUATIONS, evaluations);
    // Force re-render
    setEmployees([...employees]);
  };
  
  const deleteCategoryScore = (employeeId, weekKey, categoryKey) => {
    const evaluations = lsRead(LS_EVALUATIONS, {});
    const evalKey = `${employeeId}|${weekKey}`;
    const existing = evaluations[evalKey];
    
    if (existing) {
      delete existing[categoryKey];
      
      // If no scores left, delete the entire week entry
      if (Object.keys(existing).length === 0) {
        delete evaluations[evalKey];
      } else {
        evaluations[evalKey] = existing;
      }
      
      lsWrite(LS_EVALUATIONS, evaluations);
      // Force re-render
      setEmployees([...employees]);
    }
  };

  const exportData = () => {
    const exportData = {
      employees,
      categories,
      evaluations: lsRead(LS_EVALUATIONS, {}),
      reviews: lsRead(LS_REVIEWS, {}),
      exportDate: new Date().toISOString()
    };
    
    download(
      `hr-evaluation-${new Date().toISOString().slice(0, 10)}.json`,
      JSON.stringify(exportData, null, 2)
    );
  };

  const presetPrevMonth = () => {
    const prev = addMonths(new Date(), -1);
    setStartDate(startOfMonth(prev).toISOString().slice(0, 10));
    setEndDate(endOfMonth(prev).toISOString().slice(0, 10));
  };

  const presetThisMonth = () => {
    setStartDate(startOfMonth(new Date()).toISOString().slice(0, 10));
    setEndDate(endOfMonth(new Date()).toISOString().slice(0, 10));
  };

  const presetNextMonth = () => {
    const next = addMonths(new Date(), 1);
    setStartDate(startOfMonth(next).toISOString().slice(0, 10));
    setEndDate(endOfMonth(next).toISOString().slice(0, 10));
  };

  // Dashboard Content Component
  const DashboardContent = () => (
    <div className="min-h-screen">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-white mb-2 bg-gradient-to-r from-white to-white/80 bg-clip-text text-transparent">
          Performance Dashboard
        </h1>
        <p className="text-white/60 text-lg">Overview of your team's performance metrics</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="glass-card p-6 group cursor-pointer liquid-float hover:scale-105 transition-all duration-500">
          <div className="flex items-center justify-between mb-4">
            <div className="glass-card p-3 rounded-2xl bg-gradient-to-br from-blue-400/20 to-blue-600/20 border-blue-400/30">
              <Users className="w-8 h-8 text-blue-300" />
            </div>
            <div className="text-blue-300/60 text-sm font-medium">↗ +12%</div>
          </div>
          <div>
            <p className="text-white/60 text-sm mb-1">Total Employees</p>
            <p className="text-3xl font-bold text-white">{employees.length}</p>
          </div>
          <div className="mt-4 glass-progress h-2">
            <div className="h-full bg-gradient-to-r from-blue-400 to-blue-600 rounded-full" style={{width: '75%'}}></div>
          </div>
        </div>

        <div className="glass-card p-6 group cursor-pointer liquid-float hover:scale-105 transition-all duration-500" style={{animationDelay: '0.2s'}}>
          <div className="flex items-center justify-between mb-4">
            <div className="glass-card p-3 rounded-2xl bg-gradient-to-br from-green-400/20 to-green-600/20 border-green-400/30">
              <FileText className="w-8 h-8 text-green-300" />
            </div>
            <div className="text-green-300/60 text-sm font-medium">↗ +8%</div>
          </div>
          <div>
            <p className="text-white/60 text-sm mb-1">Active Reviews</p>
            <p className="text-3xl font-bold text-white">{weeks.length}</p>
          </div>
          <div className="mt-4 glass-progress h-2">
            <div className="h-full bg-gradient-to-r from-green-400 to-green-600 rounded-full" style={{width: '85%'}}></div>
          </div>
        </div>

        <div className="glass-card p-6 group cursor-pointer liquid-float hover:scale-105 transition-all duration-500" style={{animationDelay: '0.4s'}}>
          <div className="flex items-center justify-between mb-4">
            <div className="glass-card p-3 rounded-2xl bg-gradient-to-br from-purple-400/20 to-purple-600/20 border-purple-400/30">
              <BarChart3 className="w-8 h-8 text-purple-300" />
            </div>
            <div className="text-purple-300/60 text-sm font-medium">→ 0%</div>
          </div>
          <div>
            <p className="text-white/60 text-sm mb-1">Categories</p>
            <p className="text-3xl font-bold text-white">{categories.length}</p>
          </div>
          <div className="mt-4 glass-progress h-2">
            <div className="h-full bg-gradient-to-r from-purple-400 to-purple-600 rounded-full" style={{width: '100%'}}></div>
          </div>
        </div>

        <div className="glass-card p-6 group cursor-pointer liquid-float hover:scale-105 transition-all duration-500" style={{animationDelay: '0.6s'}}>
          <div className="flex items-center justify-between mb-4">
            <div className="glass-card p-3 rounded-2xl bg-gradient-to-br from-orange-400/20 to-orange-600/20 border-orange-400/30">
              <TrendingUp className="w-8 h-8 text-orange-300" />
            </div>
            <div className="text-orange-300/60 text-sm font-medium">↗ +15%</div>
          </div>
          <div>
            <p className="text-white/60 text-sm mb-1">Avg. Score</p>
            <p className="text-3xl font-bold text-white">
              {(() => {
                const scores = employees.map(emp => getEmployeeAverage(emp.id)).filter(Boolean);
                return scores.length > 0 ? (scores.reduce((a,b) => parseFloat(a) + parseFloat(b), 0) / scores.length).toFixed(1) : '-';
              })()}
            </p>
          </div>
          <div className="mt-4 glass-progress h-2">
            <div className="h-full bg-gradient-to-r from-orange-400 to-orange-600 rounded-full" style={{width: '90%'}}></div>
          </div>
        </div>
      </div>

      {/* Performance Overview Chart */}
      <div className="glass-card-large p-8 mb-8">
        <h2 className="text-2xl font-bold text-white mb-6">Performance Overview</h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="glass-card p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Top Performers</h3>
            <div className="space-y-4">
              {employees.slice(0, 3).map((emp, index) => {
                const avgScore = getEmployeeAverage(emp.id);
                return (
                  <div key={emp.id} className="flex items-center gap-4 p-3 rounded-2xl bg-white/5 hover:bg-white/10 transition-all duration-300">
                    <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${
                      index === 0 ? 'from-yellow-400 to-yellow-600' :
                      index === 1 ? 'from-gray-300 to-gray-500' :
                      'from-orange-400 to-orange-600'
                    } flex items-center justify-center text-white font-bold`}>
                      {index + 1}
                    </div>
                    <div className="flex-1">
                      <p className="text-white font-medium">{emp.name}</p>
                      <p className="text-white/60 text-sm">{emp.role}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-white font-bold">{avgScore || '-'}</p>
                      <p className="text-white/60 text-sm">Score</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
          
          <div className="glass-card p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Recent Activity</h3>
            <div className="space-y-4">
              <div className="flex items-center gap-4 p-3 rounded-2xl bg-green-500/10 border border-green-500/20">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                <div className="flex-1">
                  <p className="text-white text-sm">Weekly reviews completed</p>
                  <p className="text-white/60 text-xs">2 minutes ago</p>
                </div>
              </div>
              <div className="flex items-center gap-4 p-3 rounded-2xl bg-blue-500/10 border border-blue-500/20">
                <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                <div className="flex-1">
                  <p className="text-white text-sm">New employee added</p>
                  <p className="text-white/60 text-xs">1 hour ago</p>
                </div>
              </div>
              <div className="flex items-center gap-4 p-3 rounded-2xl bg-purple-500/10 border border-purple-500/20">
                <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
                <div className="flex-1">
                  <p className="text-white text-sm">Categories updated</p>
                  <p className="text-white/60 text-xs">3 hours ago</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="h-full w-full flex relative overflow-hidden" style={{ color: 'var(--text-primary)' }}>
      {/* Sidebar */}
      <Sidebar 
        isCollapsed={sidebarCollapsed}
        onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
        currentView={currentView}
        onViewChange={setCurrentView}
        isDarkMode={isDarkMode}
        onThemeToggle={() => setIsDarkMode(!isDarkMode)}
      />

      {/* Main Content */}
      <div 
        className={`flex-1 transition-all duration-500`}
        style={{ marginLeft: '0px' }}
      >
      {/* Conditional Content Based on Current View */}
      {currentView === 'dashboard' && <DashboardContent />}
      
      {currentView === 'employees' && <EmployeesContent />}
      
      {currentView === 'performance' && (
        <>
          <header className="glass-card-large m-4 mb-6 p-6">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <h1 className="text-2xl font-bold flex items-center gap-3 text-white mb-2">
                  <div className="glass-card p-2 rounded-2xl bg-gradient-to-br from-blue-400/20 to-purple-600/20 border-blue-400/30">
                    <BarChart3 size={24} className="text-blue-300" />
                  </div>
                  Performance Review Matrix
                </h1>
                <p className="text-white/60 text-lg">
                  Track employee performance weekly with AI-powered insights
                </p>
              </div>

              <div className="flex flex-wrap gap-3 items-center">
                <div className="glass-card p-1 rounded-2xl">
                  <DatePicker label="Start" value={startDate} onChange={setStartDate} />
                </div>
                <div className="glass-card p-1 rounded-2xl">
                  <DatePicker label="End" value={endDate} onChange={setEndDate} />
                </div>

                <div className="flex gap-2">
                  <button onClick={presetPrevMonth} className="glass-button px-4 py-2 text-sm">
                    ◀ Month
                  </button>
                  <button onClick={presetThisMonth} className="glass-button px-4 py-2 text-sm">
                    This Month
                  </button>
                  <button onClick={presetNextMonth} className="glass-button px-4 py-2 text-sm">
                    Month ▶
                  </button>
                </div>

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

                <div className="glass-card p-3 rounded-2xl flex items-center gap-3">
                  <label className="text-sm text-white/70">Cell size</label>
                  <input 
                    type="range" 
                    min={80} 
                    max={150} 
                    step={10} 
                    value={cellSize}
                    onChange={e => setCellSize(Number(e.target.value))}
                    className="w-20"
                  />
                </div>

                <button
                  onClick={exportData}
                  className="glass-button inline-flex items-center gap-2 px-4 py-2 text-sm font-medium hover:scale-105"
                >
                  <Download size={16} /> Export
                </button>
              </div>
        </div>
      </header>

      <div className="flex h-[calc(100vh-200px)] mx-4">
        {/* Main table */}
        <div className="flex-1 mr-6">
          <div ref={scrollRef} className="overflow-auto h-full glass-card-large p-2">
            {loading ? (
              <div className="p-8 text-white/60">Loading...</div>
            ) : (
              <table className="w-full" style={{ borderCollapse: "separate", borderSpacing: "8px" }}>
                <thead>
                  <tr>
                    <th className="sticky top-0 left-0 z-10 glass-card w-80 p-4 text-left rounded-2xl">
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-white">Employee</span>
                        <span className="text-sm text-white/60">Average</span>
                      </div>
                    </th>
                    {weeks.map(week => (
                      <th 
                        key={week.key}
                        className="sticky top-0 z-5 glass-card text-sm font-semibold text-white rounded-2xl"
                        style={{ minWidth: cellSize, width: cellSize }}
                      >
                        <div className="text-center py-3">
                          <div>Week {week.week}</div>
                          <div className="text-xs text-white/60">
                            {new Date(week.start).toLocaleDateString('en', { month: 'short', day: 'numeric' })}
                          </div>
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {employees.map(emp => {
                    const avgScore = getEmployeeAverage(emp.id);
                    const avgStyles = avgScore ? tierStyles(avgScore) : {};
                    const isExpanded = expanded[emp.id];
                    
                    return (
                      <React.Fragment key={emp.id}>
                        {/* Main employee row */}
                        <tr className="group hover:bg-white/5">
                          <td className="sticky left-0 z-5 glass-card border-r border-white/10 border-b border-white/10 w-80 p-3">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
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
                                <button
                                  onClick={() => setEmployeeSettingsModal(emp)}
                                  className="p-1 rounded hover:bg-white/10"
                                >
                                  <Settings size={16} className="text-white/60" />
                                </button>
                                <div>
                                  <div className="font-medium text-white">{emp.name}</div>
                                  <div className="text-xs text-white/60">
                                    {[emp.department, emp.role, emp.seniority].filter(Boolean).join(" · ")}
                                  </div>
                                  {emp.managerId && (
                                    <div className="text-xs text-blue-400">
                                      Manager: {employees.find(m => m.id === emp.managerId)?.name || 'Unknown'}
                                    </div>
                                  )}
                                </div>
                              </div>
                              <div className="flex items-center gap-2">
                                {avgScore && (
                                  <div className={`px-2 py-1 rounded-lg ${avgStyles.bg} ${avgStyles.text} text-sm font-bold`}>
                                    {avgScore}
                                  </div>
                                )}
                                <button
                                  onClick={() => handleDeleteEmployee(emp.id)}
                                  className="p-1 rounded hover:bg-red-500/20 text-red-400 opacity-0 group-hover:opacity-100"
                                >
                                  <Trash2 size={14} />
                                </button>
                              </div>
                            </div>
                          </td>
                          
                          {weeks.map(week => {
                            const score = getWeeklyScore(emp.id, week.key);
                            const styles = score ? tierStyles(score) : {};
                            const visible = score ? scoreToTier(score) <= filterMinTier : true;
                            
                            return (
                              <td 
                                key={week.key}
                                className={`border-b border-white/10 hover:bg-white/5 cursor-pointer ${visible ? '' : 'opacity-30'}`}
                                style={{ minWidth: cellSize, width: cellSize }}
                                onClick={() => setWeeklyEvalModal({ employee: emp, week })}
                              >
                                <div className="flex items-center justify-center py-2">
                                  {score ? (
                                    <div className={`h-10 w-10 rounded-lg ${styles.bg} ${styles.text} text-sm font-bold grid place-items-center shadow-sm`}>
                                      {score.toFixed(1)}
                                    </div>
                                  ) : (
                                    <div className="h-10 w-10 rounded-lg border-2 border-dashed border-white/30 text-white/40 grid place-items-center hover:border-white/50">
                                      <Plus size={16} />
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
                          
                          return (
                            <tr key={cat.key} className="bg-white/5">
                              <td className={`sticky left-0 z-5 glass-card border-r border-white/10 border-b border-white/10 w-80 p-2 pl-12 border-l-4 ${cat.accent}`}>
                                <div className="flex items-center gap-2">
                                  <div className={`p-1 rounded ${cat.tag}`}>
                                    <Icon size={12} className="text-white" />
                                  </div>
                                  <span className="text-sm font-medium text-white/80">{cat.label}</span>
                                  <span className="text-xs text-white/50">({cat.weight}%)</span>
                                </div>
                              </td>
                              
                              {weeks.map(week => {
                                const catScore = getCategoryScore(emp.id, week.key, cat.key);
                                const styles = catScore ? tierStyles(catScore) : {};
                                
                                return (
                                  <td 
                                    key={week.key}
                                    className="border-b border-white/10 hover:bg-white/5 cursor-pointer group/cell"
                                    style={{ minWidth: cellSize, width: cellSize }}
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setQuickScoreModal({
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
                                      
                                      {/* Delete button on hover for existing scores */}
                                      {catScore && (
                                        <button
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            if (confirm('Delete this score?')) {
                                              deleteCategoryScore(emp.id, week.key, cat.key);
                                            }
                                          }}
                                          className="absolute -top-1 -right-1 hidden group-hover/cell:flex h-4 w-4 bg-red-500 rounded-full items-center justify-center hover:bg-red-600"
                                        >
                                          <X size={10} className="text-white" />
                                        </button>
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

        {/* Right sidebar */}
        <div className="w-96 space-y-6 overflow-y-auto">
          {/* Add Employee */}
          <div className="glass-card-large p-6">
            <h3 className="font-semibold text-white mb-4">Add Employee</h3>
            
            <div className="flex gap-3">
              <input 
                value={newEmployeeName} 
                onChange={e => setNewEmployeeName(e.target.value)}
                placeholder="Employee name" 
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

            <button 
              onClick={() => setBulkOpen(!bulkOpen)} 
              className="mt-4 text-sm text-blue-300 hover:text-blue-200 transition-colors"
            >
              {bulkOpen ? "Hide bulk add" : "Quick bulk add..."}
            </button>
            
            {bulkOpen && (
              <div className="mt-4 space-y-3">
                <textarea
                  value={bulkText}
                  onChange={e => setBulkText(e.target.value)}
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
          </div>

          {/* Evaluation Categories */}
          <div className="glass-card-large p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-white">Evaluation Categories</h3>
              <button
                onClick={() => setCategoryModal(true)}
                className="glass-button p-2 hover:scale-110"
              >
                <Settings size={16} />
              </button>
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
                        <div className="text-xs text-white/50 mt-1">Weight: {cat.weight}%</div>
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

          {/* Modals - End of Performance View */}
        </>
      )}

      {/* Global Modals */}
      {quickScoreModal && (
        <QuickScoreModal
          employee={quickScoreModal.employee}
          week={quickScoreModal.week}
          category={quickScoreModal.category}
          currentScore={quickScoreModal.currentScore}
          onSave={(score) => {
            saveCategoryScore(
              quickScoreModal.employee.id,
              quickScoreModal.week.key,
              quickScoreModal.category.key,
              score
            );
          }}
          onDelete={() => {
            deleteCategoryScore(
              quickScoreModal.employee.id,
              quickScoreModal.week.key,
              quickScoreModal.category.key
            );
          }}
          onClose={() => setQuickScoreModal(null)}
        />
      )}
      
      {weeklyEvalModal && (
        <WeeklyEvaluationModal
          employee={weeklyEvalModal.employee}
          week={weeklyEvalModal.week}
          categories={categories}
          onSave={() => {
            setWeeklyEvalModal(null);
            // Force re-render to show updated scores
            setEmployees([...employees]);
          }}
          onClose={() => setWeeklyEvalModal(null)}
        />
      )}

      {employeeSettingsModal && (
        <EmployeeSettingsModal
          employee={employeeSettingsModal}
          employees={employees}
          onSave={(updates) => handleUpdateEmployee(employeeSettingsModal.id, updates)}
          onClose={() => setEmployeeSettingsModal(null)}
        />
      )}

      {categoryModal && (
        <CategoryManagementModal
          categories={categories}
          onSave={handleSaveCategories}
          onClose={() => setCategoryModal(false)}
        />
      )}
      </div>
    </div>
  );
}