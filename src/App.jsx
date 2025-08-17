import React, { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import {
  Download, Trash2, Pencil, Settings, PlusCircle, X,
  ChevronLeft, ChevronRight, Calendar, Plus, Users, 
  TrendingUp, Clock, FileText, Briefcase, Upload,
  Bot, Save, Edit2, Star, Home, BarChart3, Sun, Moon, Menu, ArrowLeft, Network, Minus, Maximize2, Minimize2
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
                    <Icon size={20} className={`flex-shrink-0 ${item.active ? 'text-white' : isDarkMode ? 'text-white/80' : 'text-white'}`} />
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
      <div className={`p-6 ${isCollapsed ? 'flex justify-center' : ''}`} style={{ borderTop: '1px solid var(--glass-border)' }}>
        <button 
          onClick={onThemeToggle}
          className={`${isCollapsed ? 'flex-none min-w-[56px] max-w-[56px] h-14 justify-center p-0' : 'w-full flex gap-4 p-4'} flex items-center rounded-2xl transition-all duration-300 group text-white/70 hover:text-white hover:glass-card hover:bg-white/5`}
          title={isCollapsed ? (isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode') : ''}
        >
          <div className="p-3 w-14 h-14 rounded-xl bg-white/10 group-hover:bg-white/20 transition-all duration-300 flex items-center justify-center">
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
        employeeId: "EMP001",
        name: "Sarah Johnson", 
        division: "Engineering", 
        squad: "Frontend", 
        team: "Core", 
        role: "Senior Developer",
        seniority: "Senior",
        birthday: "1985-06-15",
        startDate: "2022-03-15",
        exitDate: "",
        netSalary: 95000,
        grossSalary: 115000,
        totalSalary: 130000,
        managerId: null
      },
      { 
        id: "emp-002", 
        employeeId: "EMP002",
        name: "Michael Chen", 
        division: "Product", 
        squad: "Growth", 
        team: "Analytics", 
        role: "Product Manager",
        seniority: "Mid",
        birthday: "1988-12-03",
        startDate: "2023-01-10",
        exitDate: "",
        netSalary: 85000,
        grossSalary: 105000,
        totalSalary: 120000,
        managerId: "emp-001"
      },
      { 
        id: "emp-003", 
        employeeId: "EMP003",
        name: "Emily Davis", 
        division: "Design", 
        squad: "User Experience", 
        team: "Research", 
        role: "UX Designer",
        seniority: "Junior",
        birthday: "1995-04-20",
        startDate: "2024-09-01",
        exitDate: "",
        netSalary: 65000,
        grossSalary: 80000,
        totalSalary: 90000,
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
                  className={`h-10 rounded-lg ${styles.bg} ${styles.text} font-bold hover:scale-110 transition-transform ${score === n ? 'ring-2 ring-offset-2 ring-white/50 ring-offset-black/50' : ''}`}
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
        division: employee.division,
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
                      className="inline-flex items-center gap-2 px-3 py-2 text-xs font-medium glass-button rounded-xl hover:scale-105 transition-all"
                    >
                      <Upload size={14} />
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
                    className="inline-flex items-center gap-2 px-3 py-2 text-xs font-medium glass-button rounded-xl hover:scale-105 transition-all"
                  >
                    <Upload size={14} />
                    Upload
                  </button>
                </div>
                <textarea
                  value={reports.weekly}
                  onChange={(e) => setReports(prev => ({ ...prev, weekly: e.target.value }))}
                  placeholder="Paste weekly reports or upload file..."
                  className="w-full glass-input px-3 py-2 text-sm resize-none"
                  rows={3}
                />
              </div>
              
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm font-medium text-white/80">Monthly Reports</label>
                  <button
                    onClick={() => handleFileUpload('monthly')}
                    className="inline-flex items-center gap-2 px-3 py-2 text-xs font-medium glass-button rounded-xl hover:scale-105 transition-all"
                  >
                    <Upload size={14} />
                    Upload
                  </button>
                </div>
                <textarea
                  value={reports.monthly}
                  onChange={(e) => setReports(prev => ({ ...prev, monthly: e.target.value }))}
                  placeholder="Paste monthly reports or upload file..."
                  className="w-full glass-input px-3 py-2 text-sm resize-none"
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
              className="w-full glass-input px-3 py-2 text-sm resize-none"
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
            className="glass-button px-4 py-2 text-white hover:scale-105 bg-red-900/80 hover:bg-red-800 border-red-700/50"
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
    employeeId: employee.employeeId || "",
    division: employee.division || "",
    squad: employee.squad || "",
    team: employee.team || "",
    role: employee.role || "",
    seniority: employee.seniority || "Junior",
    birthday: employee.birthday || "",
    startDate: employee.startDate || new Date().toISOString().slice(0, 10),
    exitDate: employee.exitDate || "",
    netSalary: employee.netSalary || "",
    grossSalary: employee.grossSalary || "",
    totalSalary: employee.totalSalary || "",
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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-white/80">Name</label>
              <input
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                className="mt-1 w-full glass-input px-3 py-2"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-white/80">Employee ID</label>
              <input
                value={formData.employeeId}
                onChange={(e) => setFormData(prev => ({ ...prev, employeeId: e.target.value }))}
                className="mt-1 w-full glass-input px-3 py-2"
                placeholder="EMP001"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="text-sm font-medium text-white/80">Division</label>
              <input
                value={formData.division}
                onChange={(e) => setFormData(prev => ({ ...prev, division: e.target.value }))}
                className="mt-1 w-full glass-input px-3 py-2"
                placeholder="e.g., Engineering, Product, Design"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-white/80">Squad</label>
              <input
                value={formData.squad}
                onChange={(e) => setFormData(prev => ({ ...prev, squad: e.target.value }))}
                className="mt-1 w-full glass-input px-3 py-2"
                placeholder="e.g., Frontend, Backend, Mobile"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-white/80">Team</label>
              <input
                value={formData.team}
                onChange={(e) => setFormData(prev => ({ ...prev, team: e.target.value }))}
                className="mt-1 w-full glass-input px-3 py-2"
                placeholder="e.g., Core, Growth, Research"
              />
            </div>
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

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="text-sm font-medium text-white/80">Birthday</label>
              <input
                type="date"
                value={formData.birthday}
                onChange={(e) => setFormData(prev => ({ ...prev, birthday: e.target.value }))}
                className="mt-1 w-full glass-input px-3 py-2"
              />
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
            <div>
              <label className="text-sm font-medium text-white/80">Exit Date</label>
              <input
                type="date"
                value={formData.exitDate}
                onChange={(e) => setFormData(prev => ({ ...prev, exitDate: e.target.value }))}
                className="mt-1 w-full glass-input px-3 py-2"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="text-sm font-medium text-white/80">Net Salary</label>
              <input
                type="number"
                value={formData.netSalary}
                onChange={(e) => setFormData(prev => ({ ...prev, netSalary: e.target.value }))}
                className="mt-1 w-full glass-input px-3 py-2"
                placeholder="e.g., 85000"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-white/80">Gross Salary</label>
              <input
                type="number"
                value={formData.grossSalary}
                onChange={(e) => setFormData(prev => ({ ...prev, grossSalary: e.target.value }))}
                className="mt-1 w-full glass-input px-3 py-2"
                placeholder="e.g., 105000"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-white/80">Total Salary</label>
              <input
                type="number"
                value={formData.totalSalary}
                onChange={(e) => setFormData(prev => ({ ...prev, totalSalary: e.target.value }))}
                className="mt-1 w-full glass-input px-3 py-2"
                placeholder="e.g., 120000"
              />
            </div>
          </div>
        </div>

        <div className="p-6 border-t border-white/20 flex justify-end gap-3">
          <button onClick={onClose} className="glass-button px-4 py-2 text-white hover:scale-105 bg-red-900/80 hover:bg-red-800 border-red-700/50">
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
      tag: "bg-white/20",
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
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/50 backdrop-blur-sm p-4" onClick={onClose}>
      <div className="w-full max-w-3xl max-h-[80vh] overflow-y-auto glass-card-large rounded-2xl" onClick={e => e.stopPropagation()}>
        <div className="sticky top-0 glass-card p-4 border-b border-white/10 flex items-center justify-between rounded-t-2xl">
          <h2 className="text-lg font-semibold text-white">Manage Evaluation Categories</h2>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-white/10">
            <X size={20} className="text-white/80" />
          </button>
        </div>

        <div className="p-6">
          <div className="space-y-3">
            {localCategories.map(cat => (
              <div key={cat.id} className="p-4 glass-card rounded-lg">
                {editingId === cat.id ? (
                  <div className="space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                      <input
                        value={cat.label}
                        onChange={(e) => handleUpdate(cat.id, { label: e.target.value })}
                        placeholder="Category Name"
                        className="glass-input px-3 py-2"
                      />
                      <input
                        value={cat.key}
                        onChange={(e) => handleUpdate(cat.id, { key: e.target.value.toUpperCase() })}
                        placeholder="KEY"
                        maxLength={5}
                        className="glass-input px-3 py-2"
                      />
                    </div>
                    <input
                      value={cat.description}
                      onChange={(e) => handleUpdate(cat.id, { description: e.target.value })}
                      placeholder="Description"
                      className="w-full glass-input px-3 py-2"
                    />
                    <div className="flex items-center gap-3">
                      <label className="text-sm text-white/80">Weight:</label>
                      <input
                        type="number"
                        value={cat.weight}
                        onChange={(e) => handleUpdate(cat.id, { weight: Number(e.target.value) })}
                        min="0"
                        max="100"
                        className="w-20 glass-input px-3 py-2"
                      />
                      <span className="text-sm text-white/50">%</span>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => setEditingId(null)}
                        className="px-3 py-1 glass-button rounded"
                      >
                        Done
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium text-white">{cat.label}</div>
                      <div className="text-sm text-white/60">{cat.description}</div>
                      <div className="text-xs text-white/40 mt-1">
                        Key: {cat.key} | Weight: {cat.weight}%
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => setEditingId(cat.id)}
                        className="p-2 rounded hover:bg-white/10"
                      >
                        <Edit2 size={16} className="text-white/70" />
                      </button>
                      <button
                        onClick={() => handleDelete(cat.id)}
                        className="p-2 rounded hover:bg-red-500/20 text-red-400"
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
            className="mt-4 w-full py-2 border-2 border-dashed border-white/30 rounded-lg hover:border-white/50 text-white/60"
          >
            + Add Category
          </button>

          <div className="mt-4 p-3 glass-card rounded-lg bg-yellow-500/10 border border-yellow-400/30">
            <p className="text-sm text-yellow-300">
              Total Weight: {localCategories.reduce((sum, cat) => sum + cat.weight, 0)}%
              {localCategories.reduce((sum, cat) => sum + cat.weight, 0) !== 100 && 
                " (Weights will be normalized to 100%)"}
            </p>
          </div>
        </div>

        <div className="sticky bottom-0 glass-card p-4 border-t border-white/10 flex justify-end gap-2 rounded-b-2xl">
          <button onClick={onClose} className="px-4 py-2 rounded-lg bg-red-900/80 hover:bg-red-800 border border-red-700/50 text-white">
            Cancel
          </button>
          <button onClick={handleSave} className="px-4 py-2 glass-button rounded-lg">
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
  const [showBulkImportModal, setShowBulkImportModal] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterDepartment, setFilterDepartment] = useState('');
  const [viewMode, setViewMode] = useState('table'); // 'table' or 'chart'
  const [quickAddModal, setQuickAddModal] = useState(null); // For quick employee creation
  const [zoom, setZoom] = useState(1); // Zoom state for org chart
  const [isFullscreen, setIsFullscreen] = useState(false); // Fullscreen state for org chart
  const [isDarkMode, setIsDarkMode] = useState(() => document.documentElement.getAttribute('data-theme') !== 'light');

  // Listen for theme changes and update isDarkMode
  useEffect(() => {
    const handleThemeChange = () => {
      setIsDarkMode(document.documentElement.getAttribute('data-theme') !== 'light');
    };

    // Create a MutationObserver to watch for attribute changes on documentElement
    const observer = new MutationObserver(handleThemeChange);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['data-theme']
    });

    return () => observer.disconnect();
  }, []);

  // Handle fullscreen toggle
  const toggleFullscreen = () => {
    const chartContainer = document.getElementById('org-chart-container');
    if (!document.fullscreenElement) {
      chartContainer?.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  // Listen for fullscreen changes
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

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
    const matchesDivision = !filterDepartment || emp.division === filterDepartment;
    return matchesSearch && matchesDivision;
  });

  // Get unique divisions
  const departments = [...new Set(employees.map(emp => emp.division))].filter(Boolean);

  // Simple Org Chart Component
  const OrgChart = ({ onQuickAdd, onEditEmployee, onDeleteEmployee, zoom, onZoomChange, isDarkMode, isFullscreen }) => {
    const canvasRef = useRef(null);
    const containerRef = useRef(null);
    const [nodes, setNodes] = useState({});
    const [dragging, setDragging] = useState(null);
    const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
    const [hoveredConnection, setHoveredConnection] = useState(null);
    const [isDrawingConnection, setIsDrawingConnection] = useState(false);
    const [connectionStart, setConnectionStart] = useState(null);
    const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
    const [panOffset, setPanOffset] = useState({ x: 0, y: 0 });
    const [isPanning, setIsPanning] = useState(false);
    const [panStart, setPanStart] = useState({ x: 0, y: 0 });
    const [selectedNodes, setSelectedNodes] = useState(new Set());
    const [selectionBox, setSelectionBox] = useState(null);
    const [isMultiSelecting, setIsMultiSelecting] = useState(false);
    const [themeKey, setThemeKey] = useState(0); // Force re-render when theme changes

    // Listen for theme changes and force re-render
    useEffect(() => {
      const handleThemeChange = () => {
        setThemeKey(prev => prev + 1);
      };

      // Create a MutationObserver to watch for attribute changes on documentElement
      const observer = new MutationObserver(handleThemeChange);
      observer.observe(document.documentElement, {
        attributes: true,
        attributeFilter: ['data-theme']
      });

      return () => observer.disconnect();
    }, []);

    useEffect(() => {
      // Build hierarchy and calculate positions
      const buildHierarchy = () => {
        const nodeMap = {};
        const roots = [];
        const levels = {};
        
        // First pass: create all nodes
        employees.forEach(emp => {
          nodeMap[emp.id] = {
            ...emp,
            width: 200,
            height: 80,
            children: []
          };
        });
        
        // Second pass: build relationships
        employees.forEach(emp => {
          if (emp.managerId && nodeMap[emp.managerId]) {
            nodeMap[emp.managerId].children.push(emp.id);
          } else if (!emp.managerId) {
            roots.push(emp.id);
          }
        });
        
        // Calculate levels
        const calculateLevel = (nodeId, level = 0) => {
          levels[nodeId] = level;
          const node = nodeMap[nodeId];
          if (node && node.children) {
            node.children.forEach(childId => {
              calculateLevel(childId, level + 1);
            });
          }
        };
        
        roots.forEach(rootId => calculateLevel(rootId));
        
        // Group nodes by level
        const levelGroups = {};
        Object.entries(levels).forEach(([nodeId, level]) => {
          if (!levelGroups[level]) levelGroups[level] = [];
          levelGroups[level].push(nodeId);
        });
        
        // Position nodes with more spacing - centered in larger canvas
        const HORIZONTAL_SPACING = 320;
        const VERTICAL_SPACING = 200;
        const START_Y = isFullscreen ? 2500 : 1600; // Start more centered in doubled canvas
        
        Object.entries(levelGroups).forEach(([level, nodeIds]) => {
          const levelNum = parseInt(level);
          const totalWidth = nodeIds.length * HORIZONTAL_SPACING;
          const canvasWidth = isFullscreen ? 10000 : 6000;
          const startX = (canvasWidth - totalWidth) / 2 + HORIZONTAL_SPACING / 2;
          
          nodeIds.forEach((nodeId, index) => {
            if (nodeMap[nodeId]) {
              nodeMap[nodeId].x = startX + index * HORIZONTAL_SPACING;
              nodeMap[nodeId].y = START_Y + levelNum * VERTICAL_SPACING;
            }
          });
        });
        
        return nodeMap;
      };
      
      setNodes(buildHierarchy());
    }, [isFullscreen]);

    useEffect(() => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d', { alpha: true });
      
      // isDarkMode comes from the component state
      
      // Handle high-DPI displays for sharp rendering
      const dpr = window.devicePixelRatio || 1;
      
      // Set display size (css pixels) - doubled for more workspace
      const displayWidth = isFullscreen ? 10000 : 6000;
      const displayHeight = isFullscreen ? 6000 : 4000;
      
      // Set actual canvas size accounting for device pixel ratio
      canvas.width = displayWidth * dpr;
      canvas.height = displayHeight * dpr;
      
      // Scale the drawing context to match device pixel ratio
      ctx.scale(dpr, dpr);
      
      // Apply zoom and pan transformations
      ctx.save();
      ctx.scale(zoom, zoom);
      ctx.translate((displayWidth * (1 - zoom)) / (2 * zoom) + panOffset.x / zoom, (displayHeight * (1 - zoom)) / (2 * zoom) + panOffset.y / zoom);
      
      // Enable better text rendering
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';
      
      // Clear canvas with larger area
      ctx.clearRect(-displayWidth * 2, -displayHeight * 2, displayWidth * 5, displayHeight * 5);
      
      // Store connection midpoints for interaction
      const connections = [];
      
      // Draw connections first (behind nodes)
      Object.values(nodes).forEach(node => {
        if (node.managerId) {
          const managerNode = nodes[node.managerId];
          if (managerNode) {
            const startX = managerNode.x + managerNode.width / 2;
            const startY = managerNode.y + managerNode.height;
            const endX = node.x + node.width / 2;
            const endY = node.y;
            const midX = (startX + endX) / 2;
            const midY = (startY + endY) / 2;
            
            // Store connection info for interaction
            connections.push({
              nodeId: node.id,
              managerId: node.managerId,
              midX, midY,
              startX, startY,
              endX, endY
            });
            
            // Create gradient for connection lines
            const gradient = ctx.createLinearGradient(startX, startY, endX, endY);
            
            if (isDarkMode) {
              gradient.addColorStop(0, 'rgba(96, 165, 250, 0.3)');
              gradient.addColorStop(1, 'rgba(167, 139, 250, 0.3)');
            } else {
              gradient.addColorStop(0, 'rgba(59, 130, 246, 0.2)');
              gradient.addColorStop(1, 'rgba(139, 92, 246, 0.2)');
            }
            
            // Highlight if hovered
            if (hoveredConnection === node.id) {
              ctx.strokeStyle = isDarkMode ? 'rgba(239, 68, 68, 0.5)' : 'rgba(239, 68, 68, 0.4)';
              ctx.lineWidth = 3;
            } else {
              ctx.strokeStyle = gradient;
              ctx.lineWidth = 2;
            }
            
            ctx.lineCap = 'round';
            ctx.lineJoin = 'round';
            
            ctx.beginPath();
            const controlPointOffset = Math.abs(endY - startY) * 0.5;
            
            ctx.moveTo(startX, startY);
            ctx.bezierCurveTo(
              startX, startY + controlPointOffset,
              endX, endY - controlPointOffset,
              endX, endY
            );
            ctx.stroke();
            
            // Add small dot at connection points
            ctx.fillStyle = isDarkMode ? 'rgba(96, 165, 250, 0.5)' : 'rgba(59, 130, 246, 0.4)';
            ctx.beginPath();
            ctx.arc(startX, startY, 3, 0, Math.PI * 2);
            ctx.fill();
            ctx.beginPath();
            ctx.arc(endX, endY, 3, 0, Math.PI * 2);
            ctx.fill();
            
            // Draw X button if hovered
            if (hoveredConnection === node.id) {
              // Draw X background
              ctx.fillStyle = isDarkMode ? 'rgba(239, 68, 68, 0.9)' : 'rgba(239, 68, 68, 0.8)';
              ctx.beginPath();
              ctx.arc(midX, midY, 12, 0, Math.PI * 2);
              ctx.fill();
              
              // Draw X
              ctx.strokeStyle = 'white';
              ctx.lineWidth = 2;
              ctx.beginPath();
              ctx.moveTo(midX - 5, midY - 5);
              ctx.lineTo(midX + 5, midY + 5);
              ctx.moveTo(midX + 5, midY - 5);
              ctx.lineTo(midX - 5, midY + 5);
              ctx.stroke();
            }
          }
        }
      });
      
      // Draw new connection being created
      if (isDrawingConnection && connectionStart) {
        ctx.strokeStyle = isDarkMode ? 'rgba(34, 197, 94, 0.5)' : 'rgba(34, 197, 94, 0.4)';
        ctx.lineWidth = 2;
        ctx.setLineDash([5, 5]);
        ctx.beginPath();
        ctx.moveTo(connectionStart.x, connectionStart.y);
        ctx.lineTo(mousePos.x, mousePos.y);
        ctx.stroke();
        ctx.setLineDash([]);
      }
      
      // Draw nodes
      Object.values(nodes).forEach(node => {
        const radius = 16; // Corner radius for rounded rectangles
        
        // Function to draw rounded rectangle
        const drawRoundedRect = (x, y, width, height, radius) => {
          ctx.beginPath();
          ctx.moveTo(x + radius, y);
          ctx.lineTo(x + width - radius, y);
          ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
          ctx.lineTo(x + width, y + height - radius);
          ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
          ctx.lineTo(x + radius, y + height);
          ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
          ctx.lineTo(x, y + radius);
          ctx.quadraticCurveTo(x, y, x + radius, y);
          ctx.closePath();
        };
        
        // Save context for clipping
        ctx.save();
        
        // Create clipping path for rounded corners
        drawRoundedRect(node.x, node.y, node.width, node.height, radius);
        ctx.clip();
        
        // Shadow for depth
        ctx.shadowColor = isDarkMode ? 'rgba(0, 0, 0, 0.3)' : 'rgba(0, 0, 0, 0.1)';
        ctx.shadowBlur = 20;
        ctx.shadowOffsetX = 0;
        ctx.shadowOffsetY = 8;
        
        // Gradient background for glass effect
        const gradient = ctx.createLinearGradient(node.x, node.y, node.x, node.y + node.height);
        if (isDarkMode) {
          gradient.addColorStop(0, 'rgba(255, 255, 255, 0.1)');
          gradient.addColorStop(1, 'rgba(255, 255, 255, 0.05)');
        } else {
          gradient.addColorStop(0, 'rgba(255, 255, 255, 0.98)');
          gradient.addColorStop(1, 'rgba(255, 255, 255, 0.92)');
        }
        ctx.fillStyle = gradient;
        ctx.fillRect(node.x, node.y, node.width, node.height);
        
        // Restore context to remove clipping
        ctx.restore();
        
        // Border with rounded corners
        ctx.shadowBlur = 0;
        drawRoundedRect(node.x, node.y, node.width, node.height, radius);
        ctx.strokeStyle = isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.08)';
        ctx.lineWidth = 1;
        ctx.stroke();
        
        // Highlight border if selected or dragging
        if (selectedNodes.has(node.id) || dragging === node.id || dragging === 'multiple') {
          drawRoundedRect(node.x, node.y, node.width, node.height, radius);
          const highlightGradient = ctx.createLinearGradient(node.x, node.y, node.x + node.width, node.y + node.height);
          if (selectedNodes.has(node.id)) {
            highlightGradient.addColorStop(0, 'rgba(34, 197, 94, 0.6)');
            highlightGradient.addColorStop(1, 'rgba(16, 185, 129, 0.6)');
          } else {
            highlightGradient.addColorStop(0, 'rgba(96, 165, 250, 0.6)');
            highlightGradient.addColorStop(1, 'rgba(147, 51, 234, 0.6)');
          }
          ctx.strokeStyle = highlightGradient;
          ctx.lineWidth = 3;
          ctx.stroke();
        }
        
        // Name (with padding to avoid button overlap)
        ctx.textBaseline = 'top';
        ctx.fillStyle = isDarkMode ? 'rgba(255, 255, 255, 0.95)' : 'rgba(0, 0, 0, 0.9)';
        ctx.font = '600 14px -apple-system, BlinkMacSystemFont, "SF Pro Display", "Helvetica Neue", sans-serif';
        ctx.fillText(node.name, node.x + 35, node.y + 13);
        
        // Role badge
        if (node.role) {
          ctx.font = '500 10px -apple-system, BlinkMacSystemFont, "SF Pro Display", "Helvetica Neue", sans-serif';
          const roleText = node.role;
          const roleMetrics = ctx.measureText(roleText);
          const roleX = node.x + 35;
          const roleY = node.y + 33;
          const rolePadding = 4;
          const roleHeight = 16;
          
          // Role badge background
          const roleGradient = ctx.createLinearGradient(roleX, roleY, roleX, roleY + roleHeight);
          if (isDarkMode) {
            roleGradient.addColorStop(0, 'rgba(59, 130, 246, 0.2)');
            roleGradient.addColorStop(1, 'rgba(139, 92, 246, 0.2)');
          } else {
            roleGradient.addColorStop(0, 'rgba(59, 130, 246, 0.15)');
            roleGradient.addColorStop(1, 'rgba(139, 92, 246, 0.15)');
          }
          
          // Draw rounded rectangle for role badge
          ctx.fillStyle = roleGradient;
          const roleWidth = roleMetrics.width + rolePadding * 2;
          ctx.beginPath();
          ctx.moveTo(roleX + 4, roleY);
          ctx.lineTo(roleX + roleWidth - 4, roleY);
          ctx.quadraticCurveTo(roleX + roleWidth, roleY, roleX + roleWidth, roleY + 4);
          ctx.lineTo(roleX + roleWidth, roleY + roleHeight - 4);
          ctx.quadraticCurveTo(roleX + roleWidth, roleY + roleHeight, roleX + roleWidth - 4, roleY + roleHeight);
          ctx.lineTo(roleX + 4, roleY + roleHeight);
          ctx.quadraticCurveTo(roleX, roleY + roleHeight, roleX, roleY + roleHeight - 4);
          ctx.lineTo(roleX, roleY + 4);
          ctx.quadraticCurveTo(roleX, roleY, roleX + 4, roleY);
          ctx.closePath();
          ctx.fill();
          
          // Role text
          ctx.fillStyle = isDarkMode ? 'rgba(147, 197, 253, 1)' : 'rgba(59, 130, 246, 0.9)';
          ctx.fillText(roleText, roleX + rolePadding, roleY + 3);
        }
        
        // Division badge
        if (node.division) {
          const deptColors = {
            'Engineering': { light: 'rgba(59, 130, 246, 0.2)', dark: 'rgba(96, 165, 250, 0.25)' },
            'Product': { light: 'rgba(139, 92, 246, 0.2)', dark: 'rgba(167, 139, 250, 0.25)' },
            'Design': { light: 'rgba(236, 72, 153, 0.2)', dark: 'rgba(244, 114, 182, 0.25)' },
            'Marketing': { light: 'rgba(34, 197, 94, 0.2)', dark: 'rgba(74, 222, 128, 0.25)' },
            'Sales': { light: 'rgba(251, 146, 60, 0.2)', dark: 'rgba(251, 191, 36, 0.25)' }
          };
          
          ctx.font = '500 10px -apple-system, BlinkMacSystemFont, "SF Pro Display", "Helvetica Neue", sans-serif';
          const deptText = node.division;
          const deptMetrics = ctx.measureText(deptText);
          const deptX = node.x + 35;
          const deptY = node.y + 53;
          const deptPadding = 4;
          const deptHeight = 16;
          
          // Division badge background with division color
          const deptBadgeColor = deptColors[node.division] || { light: 'rgba(107, 114, 128, 0.2)', dark: 'rgba(156, 163, 175, 0.2)' };
          ctx.fillStyle = isDarkMode ? deptBadgeColor.dark : deptBadgeColor.light;
          
          // Draw rounded rectangle for division badge
          const deptWidth = deptMetrics.width + deptPadding * 2;
          ctx.beginPath();
          ctx.moveTo(deptX + 4, deptY);
          ctx.lineTo(deptX + deptWidth - 4, deptY);
          ctx.quadraticCurveTo(deptX + deptWidth, deptY, deptX + deptWidth, deptY + 4);
          ctx.lineTo(deptX + deptWidth, deptY + deptHeight - 4);
          ctx.quadraticCurveTo(deptX + deptWidth, deptY + deptHeight, deptX + deptWidth - 4, deptY + deptHeight);
          ctx.lineTo(deptX + 4, deptY + deptHeight);
          ctx.quadraticCurveTo(deptX, deptY + deptHeight, deptX, deptY + deptHeight - 4);
          ctx.lineTo(deptX, deptY + 4);
          ctx.quadraticCurveTo(deptX, deptY, deptX + 4, deptY);
          ctx.closePath();
          ctx.fill();
          
          // Department text
          const textColors = {
            'Engineering': { light: 'rgba(59, 130, 246, 0.9)', dark: 'rgba(147, 197, 253, 1)' },
            'Product': { light: 'rgba(139, 92, 246, 0.9)', dark: 'rgba(196, 181, 253, 1)' },
            'Design': { light: 'rgba(236, 72, 153, 0.9)', dark: 'rgba(251, 207, 232, 1)' },
            'Marketing': { light: 'rgba(34, 197, 94, 0.9)', dark: 'rgba(134, 239, 172, 1)' },
            'Sales': { light: 'rgba(251, 146, 60, 0.9)', dark: 'rgba(253, 224, 71, 1)' }
          };
          
          const textColor = textColors[node.division] || { light: 'rgba(107, 114, 128, 0.9)', dark: 'rgba(209, 213, 219, 1)' };
          ctx.fillStyle = isDarkMode ? textColor.dark : textColor.light;
          ctx.fillText(deptText, deptX + deptPadding, deptY + 3);
        }
        
        // Draw Settings button (top-right corner)
        const gearX = node.x + node.width - 15;
        const gearY = node.y + 15;
        const gearSize = 14;
        const isHoveringGear = Math.abs(mousePos.x - gearX) < 10 && Math.abs(mousePos.y - gearY) < 10;
        
        // Settings button background (hover effect)
        if (isHoveringGear) {
          ctx.fillStyle = isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)';
          ctx.beginPath();
          ctx.moveTo(gearX - 10 + 3, gearY - 10);
          ctx.lineTo(gearX + 10 - 3, gearY - 10);
          ctx.quadraticCurveTo(gearX + 10, gearY - 10, gearX + 10, gearY - 10 + 3);
          ctx.lineTo(gearX + 10, gearY + 10 - 3);
          ctx.quadraticCurveTo(gearX + 10, gearY + 10, gearX + 10 - 3, gearY + 10);
          ctx.lineTo(gearX - 10 + 3, gearY + 10);
          ctx.quadraticCurveTo(gearX - 10, gearY + 10, gearX - 10, gearY + 10 - 3);
          ctx.lineTo(gearX - 10, gearY - 10 + 3);
          ctx.quadraticCurveTo(gearX - 10, gearY - 10, gearX - 10 + 3, gearY - 10);
          ctx.closePath();
          ctx.fill();
        }
        
        // Draw Settings icon (similar to lucide-react Settings)
        ctx.save();
        ctx.translate(gearX, gearY);
        ctx.strokeStyle = isDarkMode ? 'rgba(255, 255, 255, 0.6)' : 'rgba(0, 0, 0, 0.6)';
        ctx.lineWidth = 1.5;
        
        // Outer gear teeth
        ctx.beginPath();
        const teeth = 8;
        const innerRadius = 4;
        const outerRadius = 6;
        for (let i = 0; i < teeth * 2; i++) {
          const angle = (i * Math.PI) / teeth;
          const radius = i % 2 === 0 ? outerRadius : innerRadius;
          const x = Math.cos(angle) * radius;
          const y = Math.sin(angle) * radius;
          if (i === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.closePath();
        ctx.stroke();
        
        // Center circle
        ctx.beginPath();
        ctx.arc(0, 0, 2, 0, Math.PI * 2);
        ctx.stroke();
        ctx.restore();
        
        // Draw Delete button (top-left corner)
        const deleteX = node.x + 15;
        const deleteY = node.y + 15;
        const deleteSize = 14;
        const isHoveringDelete = Math.abs(mousePos.x - deleteX) < 10 && Math.abs(mousePos.y - deleteY) < 10;
        
        // Delete button background (hover effect)
        if (isHoveringDelete) {
          ctx.fillStyle = 'rgba(239, 68, 68, 0.2)';
          ctx.beginPath();
          ctx.moveTo(deleteX - 10 + 3, deleteY - 10);
          ctx.lineTo(deleteX + 10 - 3, deleteY - 10);
          ctx.quadraticCurveTo(deleteX + 10, deleteY - 10, deleteX + 10, deleteY - 10 + 3);
          ctx.lineTo(deleteX + 10, deleteY + 10 - 3);
          ctx.quadraticCurveTo(deleteX + 10, deleteY + 10, deleteX + 10 - 3, deleteY + 10);
          ctx.lineTo(deleteX - 10 + 3, deleteY + 10);
          ctx.quadraticCurveTo(deleteX - 10, deleteY + 10, deleteX - 10, deleteY + 10 - 3);
          ctx.lineTo(deleteX - 10, deleteY - 10 + 3);
          ctx.quadraticCurveTo(deleteX - 10, deleteY - 10, deleteX - 10 + 3, deleteY - 10);
          ctx.closePath();
          ctx.fill();
        }
        
        // Draw Trash icon (similar to lucide-react Trash2)
        ctx.save();
        ctx.translate(deleteX, deleteY);
        ctx.strokeStyle = 'rgba(239, 68, 68, 0.9)';
        ctx.lineWidth = 1.3;
        
        // Trash can body
        ctx.beginPath();
        ctx.moveTo(-4, -1);
        ctx.lineTo(-4, 5);
        ctx.quadraticCurveTo(-4, 6, -3, 6);
        ctx.lineTo(3, 6);
        ctx.quadraticCurveTo(4, 6, 4, 5);
        ctx.lineTo(4, -1);
        ctx.stroke();
        
        // Lid
        ctx.beginPath();
        ctx.moveTo(-6, -1);
        ctx.lineTo(6, -1);
        ctx.stroke();
        
        // Handle
        ctx.beginPath();
        ctx.moveTo(-2, -3);
        ctx.lineTo(-2, -1);
        ctx.moveTo(2, -3);
        ctx.lineTo(2, -1);
        ctx.moveTo(-2, -3);
        ctx.lineTo(2, -3);
        ctx.stroke();
        
        // Vertical lines inside
        ctx.beginPath();
        ctx.moveTo(-2, 1);
        ctx.lineTo(-2, 3);
        ctx.moveTo(0, 1);
        ctx.lineTo(0, 3);
        ctx.moveTo(2, 1);
        ctx.lineTo(2, 3);
        ctx.stroke();
        
        ctx.restore();
        
        // Store button positions for click detection
        node.gearButton = { x: gearX, y: gearY };
        node.deleteButton = { x: deleteX, y: deleteY };
        
        // Draw connection handle at bottom
        const handleX = node.x + node.width / 2;
        const handleY = node.y + node.height;
        const isHoveringHandle = Math.abs(mousePos.x - handleX) < 10 && Math.abs(mousePos.y - handleY) < 10;
        
        if (isHoveringHandle || (connectionStart && connectionStart.nodeId === node.id)) {
          ctx.fillStyle = isDarkMode ? 'rgba(34, 197, 94, 0.8)' : 'rgba(34, 197, 94, 0.7)';
          ctx.beginPath();
          ctx.arc(handleX, handleY, 6, 0, Math.PI * 2);
          ctx.fill();
          
          // Plus sign
          ctx.strokeStyle = 'white';
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.moveTo(handleX - 3, handleY);
          ctx.lineTo(handleX + 3, handleY);
          ctx.moveTo(handleX, handleY - 3);
          ctx.lineTo(handleX, handleY + 3);
          ctx.stroke();
        } else {
          // Show subtle handle
          ctx.fillStyle = isDarkMode ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.15)';
          ctx.beginPath();
          ctx.arc(handleX, handleY, 4, 0, Math.PI * 2);
          ctx.fill();
        }
      });
      
      // Draw selection box if multi-selecting
      if (isMultiSelecting && selectionBox) {
        ctx.strokeStyle = 'rgba(59, 130, 246, 0.5)';
        ctx.fillStyle = 'rgba(59, 130, 246, 0.1)';
        ctx.lineWidth = 2;
        ctx.setLineDash([5, 5]);
        
        const minX = Math.min(selectionBox.startX, selectionBox.endX);
        const minY = Math.min(selectionBox.startY, selectionBox.endY);
        const width = Math.abs(selectionBox.endX - selectionBox.startX);
        const height = Math.abs(selectionBox.endY - selectionBox.startY);
        
        ctx.fillRect(minX, minY, width, height);
        ctx.strokeRect(minX, minY, width, height);
        ctx.setLineDash([]);
      }
      
      // Restore the context
      ctx.restore();
    }, [nodes, dragging, hoveredConnection, isDrawingConnection, connectionStart, mousePos, zoom, panOffset, themeKey, selectedNodes, isMultiSelecting, selectionBox, isFullscreen]);

    const handleMouseDown = (e) => {
      const canvas = canvasRef.current;
      const rect = canvas.getBoundingClientRect();
      const canvasWidth = isFullscreen ? 10000 : 6000;
      const canvasHeight = isFullscreen ? 6000 : 4000;
      const rawX = (e.clientX - rect.left) * (canvasWidth / rect.width);
      const rawY = (e.clientY - rect.top) * (canvasHeight / rect.height);
      
      // Adjust for zoom, translation and pan
      const x = (rawX - (canvasWidth * (1 - zoom)) / 2 - panOffset.x) / zoom;
      const y = (rawY - (canvasHeight * (1 - zoom)) / 2 - panOffset.y) / zoom;
      
      // Check if clicking on delete X button on connection line
      if (hoveredConnection) {
        // Remove manager relationship
        const updatedEmployees = employees.map(emp => 
          emp.id === hoveredConnection ? { ...emp, managerId: null } : emp
        );
        setEmployees(updatedEmployees);
        lsWrite(LS_EMPLOYEES, updatedEmployees);
        setHoveredConnection(null);
        return;
      }
      
      // Check if clicking on node buttons (gear or X)
      for (const [id, node] of Object.entries(nodes)) {
        // Check gear button click
        if (node.gearButton && Math.abs(x - node.gearButton.x) < 10 && Math.abs(y - node.gearButton.y) < 10) {
          // Find the employee and open edit modal
          const employee = employees.find(emp => emp.id === id);
          if (employee && onEditEmployee) {
            onEditEmployee(employee);
          }
          return;
        }
        
        // Check delete button click
        if (node.deleteButton && Math.abs(x - node.deleteButton.x) < 10 && Math.abs(y - node.deleteButton.y) < 10) {
          // Show confirmation dialog
          const employee = employees.find(emp => emp.id === id);
          if (employee) {
            const message = `Are you sure you want to delete ${employee.name}?\n\nThis will permanently remove the employee and all associated data from the database.`;
            if (confirm(message)) {
              // Delete the employee
              if (onDeleteEmployee) {
                onDeleteEmployee(id);
              }
            }
          }
          return;
        }
      }
      
      // Check if clicking on connection handle
      for (const [id, node] of Object.entries(nodes)) {
        const handleX = node.x + node.width / 2;
        const handleY = node.y + node.height;
        if (Math.abs(x - handleX) < 10 && Math.abs(y - handleY) < 10) {
          setIsDrawingConnection(true);
          setConnectionStart({ nodeId: id, x: handleX, y: handleY });
          canvas.style.cursor = 'crosshair';
          return;
        }
      }
      
      // Check if Shift is held for multi-select
      if (e.shiftKey) {
        setIsMultiSelecting(true);
        setSelectionBox({ startX: x, startY: y, endX: x, endY: y });
        canvas.style.cursor = 'crosshair';
        return;
      }
      
      // Find which node was clicked for dragging
      let nodeClicked = false;
      for (const [id, node] of Object.entries(nodes)) {
        if (x >= node.x && x <= node.x + node.width &&
            y >= node.y && y <= node.y + node.height) {
          
          // If the node is part of selected nodes, drag all selected
          if (selectedNodes.has(id)) {
            setDragging('multiple');
            setDragStart({ x, y });
          } else {
            // Clear selection and drag only this node
            setSelectedNodes(new Set());
            setDragging(id);
            setDragStart({ x: x - node.x, y: y - node.y });
          }
          canvas.style.cursor = 'grabbing';
          nodeClicked = true;
          break;
        }
      }
      
      // If no node was clicked, clear selection and start panning
      if (!nodeClicked && !isDrawingConnection) {
        setSelectedNodes(new Set());
        setIsPanning(true);
        setPanStart({ x: rawX, y: rawY });
        canvas.style.cursor = 'grabbing';
      }
    };

    const handleMouseMove = (e) => {
      const canvas = canvasRef.current;
      const rect = canvas.getBoundingClientRect();
      const canvasWidth = isFullscreen ? 10000 : 6000;
      const canvasHeight = isFullscreen ? 6000 : 4000;
      const rawX = (e.clientX - rect.left) * (canvasWidth / rect.width);
      const rawY = (e.clientY - rect.top) * (canvasHeight / rect.height);
      
      // Adjust for zoom, translation and pan
      const x = (rawX - (canvasWidth * (1 - zoom)) / 2 - panOffset.x) / zoom;
      const y = (rawY - (canvasHeight * (1 - zoom)) / 2 - panOffset.y) / zoom;
      
      setMousePos({ x, y });
      
      if (isMultiSelecting && selectionBox) {
        // Update selection box
        setSelectionBox(prev => ({ ...prev, endX: x, endY: y }));
        
        // Find nodes within selection box
        const minX = Math.min(selectionBox.startX, x);
        const maxX = Math.max(selectionBox.startX, x);
        const minY = Math.min(selectionBox.startY, y);
        const maxY = Math.max(selectionBox.startY, y);
        
        const selected = new Set();
        Object.entries(nodes).forEach(([id, node]) => {
          if (node.x >= minX && node.x + node.width <= maxX &&
              node.y >= minY && node.y + node.height <= maxY) {
            selected.add(id);
          }
        });
        setSelectedNodes(selected);
        return;
      }
      
      if (isDrawingConnection) {
        canvas.style.cursor = 'crosshair';
        return;
      }
      
      if (isPanning) {
        // Update pan offset
        const deltaX = rawX - panStart.x;
        const deltaY = rawY - panStart.y;
        setPanOffset(prev => ({
          x: prev.x + deltaX,
          y: prev.y + deltaY
        }));
        setPanStart({ x: rawX, y: rawY });
        canvas.style.cursor = 'grabbing';
      } else if (dragging === 'multiple') {
        // Move all selected nodes together
        const deltaX = x - dragStart.x;
        const deltaY = y - dragStart.y;
        setNodes(prev => {
          const updated = { ...prev };
          selectedNodes.forEach(id => {
            if (updated[id]) {
              updated[id] = {
                ...updated[id],
                x: Math.max(-3000, Math.min(12000, updated[id].x + deltaX)),
                y: Math.max(-2000, Math.min(8000, updated[id].y + deltaY))
              };
            }
          });
          return updated;
        });
        setDragStart({ x, y });
      } else if (dragging) {
        setNodes(prev => ({
          ...prev,
          [dragging]: {
            ...prev[dragging],
            x: Math.max(-3000, Math.min(12000, x - dragStart.x)),
            y: Math.max(-2000, Math.min(8000, y - dragStart.y))
          }
        }));
      } else {
        // Check if hovering over connection X button
        let foundConnection = null;
        Object.values(nodes).forEach(node => {
          if (node.managerId && nodes[node.managerId]) {
            const managerNode = nodes[node.managerId];
            const midX = (managerNode.x + managerNode.width / 2 + node.x + node.width / 2) / 2;
            const midY = (managerNode.y + managerNode.height + node.y) / 2;
            
            if (Math.sqrt(Math.pow(x - midX, 2) + Math.pow(y - midY, 2)) < 15) {
              foundConnection = node.id;
            }
          }
        });
        
        setHoveredConnection(foundConnection);
        
        if (foundConnection) {
          canvas.style.cursor = 'pointer';
        } else {
          // Check if hovering over connection handle
          let hoveringHandle = false;
          for (const node of Object.values(nodes)) {
            const handleX = node.x + node.width / 2;
            const handleY = node.y + node.height;
            if (Math.abs(x - handleX) < 10 && Math.abs(y - handleY) < 10) {
              hoveringHandle = true;
              break;
            }
          }
          
          if (hoveringHandle) {
            canvas.style.cursor = 'crosshair';
          } else {
            // Check if hovering over node
            let hovered = false;
            for (const node of Object.values(nodes)) {
              if (x >= node.x && x <= node.x + node.width &&
                  y >= node.y && y <= node.y + node.height) {
                hovered = true;
                break;
              }
            }
            canvas.style.cursor = hovered ? 'grab' : 'move';
          }
        }
      }
    };

    const handleMouseUp = (e) => {
      const canvas = canvasRef.current;
      
      if (isDrawingConnection) {
        const rect = canvas.getBoundingClientRect();
        const canvasWidth = isFullscreen ? 10000 : 6000;
        const canvasHeight = isFullscreen ? 6000 : 4000;
        const rawX = (e.clientX - rect.left) * (canvasWidth / rect.width);
        const rawY = (e.clientY - rect.top) * (canvasHeight / rect.height);
        
        // Adjust for zoom, translation and pan
        const x = (rawX - (canvasWidth * (1 - zoom)) / 2 - panOffset.x) / zoom;
        const y = (rawY - (canvasHeight * (1 - zoom)) / 2 - panOffset.y) / zoom;
        
        // Find which node we're dropping on
        let foundTarget = false;
        for (const [id, node] of Object.entries(nodes)) {
          if (x >= node.x && x <= node.x + node.width &&
              y >= node.y && y <= node.y + node.height &&
              id !== connectionStart.nodeId) {
            // Create new manager relationship
            const updatedEmployees = employees.map(emp => 
              emp.id === id ? { ...emp, managerId: connectionStart.nodeId } : emp
            );
            setEmployees(updatedEmployees);
            lsWrite(LS_EMPLOYEES, updatedEmployees);
            foundTarget = true;
            break;
          }
        }
        
        // If dropped on empty canvas, trigger quick add modal
        if (!foundTarget && connectionStart && onQuickAdd) {
          onQuickAdd({ 
            managerId: connectionStart.nodeId,
            position: { x, y }
          });
        }
        
        setIsDrawingConnection(false);
        setConnectionStart(null);
      }
      
      setDragging(null);
      setIsPanning(false);
      setIsMultiSelecting(false);
      setSelectionBox(null);
      if (canvas) {
        canvas.style.cursor = 'move';
      }
    };

    // Handle wheel zoom with Cmd/Ctrl
    const handleWheel = (e) => {
      if (e.metaKey || e.ctrlKey) {
        e.preventDefault();
        const delta = e.deltaY > 0 ? -0.1 : 0.1;
        onZoomChange(prev => Math.max(0.25, Math.min(3, prev + delta)));
      }
    };

    return (
      <canvas
        ref={canvasRef}
        width={isFullscreen ? 10000 : 6000}
        height={isFullscreen ? 6000 : 4000}
        className={`${isFullscreen ? 'w-full h-full' : 'w-full rounded-xl'}`}
        style={{ 
          background: isDarkMode 
            ? 'rgba(0, 0, 0, 0.2)' 
            : 'rgba(0, 0, 0, 0.05)',
          border: isDarkMode 
            ? '1px solid rgba(255, 255, 255, 0.15)'
            : '1px solid rgba(0, 0, 0, 0.15)',
          ...(isFullscreen ? {
            width: '100%',
            height: '100%',
            objectFit: 'contain'
          } : {
            maxWidth: '100%',
            height: 'auto',
            aspectRatio: '6000 / 4000'
          })
        }}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onWheel={handleWheel}
      />
    );
  };

  return (
    <div className="flex flex-col xl:flex-row h-full">
      {/* Main Content */}
      <div className="flex-1 p-4 md:p-6 overflow-auto min-w-0">
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


          {/* Search and Filter Bar - Only show in table view */}
          {viewMode === 'table' && (
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
          )}
        </header>

        {/* Employee Table or Org Chart */}
        {viewMode === 'table' ? (
          <div className="glass-card-large flex flex-col" style={{ minHeight: '400px', maxHeight: 'calc(100vh - 350px)' }}>
            {/* Apple-style Segmented Control */}
            <div className="p-4 border-b border-white/10">
              <div className="inline-flex p-1 rounded-2xl" style={{ 
                background: isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.06)',
                backdropFilter: 'blur(20px)',
                boxShadow: isDarkMode 
                  ? '0 1px 3px rgba(0, 0, 0, 0.3), inset 0 1px 1px rgba(255, 255, 255, 0.1)' 
                  : '0 1px 3px rgba(0, 0, 0, 0.1), inset 0 1px 1px rgba(255, 255, 255, 0.5)'
              }}>
                <button
                  onClick={() => setViewMode('table')}
                  className={`relative px-6 py-2 rounded-xl font-semibold transition-all duration-300 flex items-center gap-2 ${
                    viewMode === 'table' 
                      ? 'text-white'
                      : isDarkMode ? 'text-white/60 hover:text-white/80' : 'text-black/50 hover:text-black/70'
                  }`}
                  style={{ minWidth: '100px' }}
                >
                  {viewMode === 'table' && (
                    <div 
                      className="absolute inset-0 rounded-xl"
                      style={{
                        background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
                        boxShadow: '0 3px 8px rgba(59, 130, 246, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.2)',
                        transition: 'all 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94)'
                      }}
                    />
                  )}
                  <Users size={16} className={`relative z-10 ${viewMode === 'table' ? '!text-white' : ''}`} />
                  <span className={`relative z-10 text-xs ${viewMode === 'table' ? '!text-white' : ''}`}>Table</span>
                </button>
                <button
                  onClick={() => setViewMode('chart')}
                  className={`relative px-6 py-2 rounded-xl font-semibold transition-all duration-300 flex items-center gap-2 ${
                    viewMode === 'chart' 
                      ? 'text-white'
                      : isDarkMode ? 'text-white/60 hover:text-white/80' : 'text-black/50 hover:text-black/70'
                  }`}
                  style={{ minWidth: '100px' }}
                >
                  {viewMode === 'chart' && (
                    <div 
                      className="absolute inset-0 rounded-xl"
                      style={{
                        background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
                        boxShadow: '0 3px 8px rgba(59, 130, 246, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.2)',
                        transition: 'all 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94)'
                      }}
                    />
                  )}
                  <Network size={16} className={`relative z-10 ${viewMode === 'chart' ? '!text-white' : ''}`} />
                  <span className={`relative z-10 text-xs ${viewMode === 'chart' ? '!text-white' : ''}`}>Org Chart</span>
                </button>
              </div>
            </div>
            <div className="flex-1 overflow-auto">
            <table className="w-full min-w-max">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="text-left p-4 text-white/70 font-medium min-w-[80px]">ID</th>
                  <th className="text-left p-4 text-white/70 font-medium min-w-[150px]">Name</th>
                  <th className="text-left p-4 text-white/70 font-medium min-w-[120px]">Division</th>
                  <th className="text-left p-4 text-white/70 font-medium min-w-[100px]">Squad</th>
                  <th className="text-left p-4 text-white/70 font-medium min-w-[100px]">Team</th>
                  <th className="text-left p-4 text-white/70 font-medium min-w-[120px]">Role</th>
                  <th className="text-left p-4 text-white/70 font-medium min-w-[100px]">Seniority</th>
                  <th className="text-left p-4 text-white/70 font-medium min-w-[120px]">Manager</th>
                  <th className="text-left p-4 text-white/70 font-medium min-w-[120px]">Birthday</th>
                  <th className="text-left p-4 text-white/70 font-medium min-w-[120px]">Start Date</th>
                  <th className="text-left p-4 text-white/70 font-medium min-w-[120px]">Exit Date</th>
                  <th className="text-right p-4 text-white/70 font-medium min-w-[120px]">Net Salary</th>
                  <th className="text-right p-4 text-white/70 font-medium min-w-[120px]">Gross Salary</th>
                  <th className="text-right p-4 text-white/70 font-medium min-w-[120px]">Total Salary</th>
                  <th className="text-center p-4 text-white/70 font-medium min-w-[100px]">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredEmployees.length === 0 ? (
                  <tr>
                    <td colSpan="15" className="text-center p-8 text-white/50">
                      No employees found. Add your first employee to get started.
                    </td>
                  </tr>
                ) : (
                  filteredEmployees.map(emp => (
                    <tr key={emp.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                      <td className="p-4">
                        <div className="font-medium text-blue-300">{emp.employeeId || '-'}</div>
                      </td>
                      <td className="p-4">
                        <div className="font-medium text-white">{emp.name}</div>
                      </td>
                      <td className="p-4 text-white/70">{emp.division || '-'}</td>
                      <td className="p-4 text-white/70">{emp.squad || '-'}</td>
                      <td className="p-4 text-white/70">{emp.team || '-'}</td>
                      <td className="p-4 text-white/70">{emp.role || '-'}</td>
                      <td className="p-4 text-white/70">{emp.seniority || '-'}</td>
                      <td className="p-4 text-white/70">
                        {emp.managerId ? employees.find(m => m.id === emp.managerId)?.name || 'Unknown' : '-'}
                      </td>
                      <td className="p-4 text-white/70">
                        {emp.birthday ? new Date(emp.birthday).toLocaleDateString() : '-'}
                      </td>
                      <td className="p-4 text-white/70">
                        {emp.startDate ? new Date(emp.startDate).toLocaleDateString() : '-'}
                      </td>
                      <td className="p-4 text-white/70">
                        {emp.exitDate ? new Date(emp.exitDate).toLocaleDateString() : '-'}
                      </td>
                      <td className="p-4 text-white/70 text-right">
                        {emp.netSalary ? new Intl.NumberFormat().format(emp.netSalary) : '-'}
                      </td>
                      <td className="p-4 text-white/70 text-right">
                        {emp.grossSalary ? new Intl.NumberFormat().format(emp.grossSalary) : '-'}
                      </td>
                      <td className="p-4 text-white/70 text-right">
                        {emp.totalSalary ? new Intl.NumberFormat().format(emp.totalSalary) : '-'}
                      </td>
                      <td className="p-4">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => setEditingEmployee(emp)}
                            className="p-2 rounded-lg hover:bg-white/10 transition-colors"
                            title="Edit"
                          >
                            <Settings size={16} className="text-white/70" />
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
        ) : (
          <div id="org-chart-container" className={`glass-card-large ${isFullscreen ? 'fixed inset-0 z-50 m-0 rounded-none flex flex-col' : ''}`} style={isFullscreen ? { background: isDarkMode ? '#0a0a0a' : '#f5f7fa', width: '100vw', height: '100vh' } : {}}>
            {/* Apple-style Segmented Control */}
            <div className="p-4 border-b border-white/10">
              <div className="inline-flex p-1 rounded-2xl" style={{ 
                background: isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.06)',
                backdropFilter: 'blur(20px)',
                boxShadow: isDarkMode 
                  ? '0 1px 3px rgba(0, 0, 0, 0.3), inset 0 1px 1px rgba(255, 255, 255, 0.1)' 
                  : '0 1px 3px rgba(0, 0, 0, 0.1), inset 0 1px 1px rgba(255, 255, 255, 0.5)'
              }}>
                <button
                  onClick={() => setViewMode('table')}
                  className={`relative px-6 py-2 rounded-xl font-semibold transition-all duration-300 flex items-center gap-2 ${
                    viewMode === 'table' 
                      ? 'text-white'
                      : isDarkMode ? 'text-white/60 hover:text-white/80' : 'text-black/50 hover:text-black/70'
                  }`}
                  style={{ minWidth: '100px' }}
                >
                  {viewMode === 'table' && (
                    <div 
                      className="absolute inset-0 rounded-xl"
                      style={{
                        background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
                        boxShadow: '0 3px 8px rgba(59, 130, 246, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.2)',
                        transition: 'all 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94)'
                      }}
                    />
                  )}
                  <Users size={16} className={`relative z-10 ${viewMode === 'table' ? '!text-white' : ''}`} />
                  <span className={`relative z-10 text-xs ${viewMode === 'table' ? '!text-white' : ''}`}>Table</span>
                </button>
                <button
                  onClick={() => setViewMode('chart')}
                  className={`relative px-6 py-2 rounded-xl font-semibold transition-all duration-300 flex items-center gap-2 ${
                    viewMode === 'chart' 
                      ? 'text-white'
                      : isDarkMode ? 'text-white/60 hover:text-white/80' : 'text-black/50 hover:text-black/70'
                  }`}
                  style={{ minWidth: '100px' }}
                >
                  {viewMode === 'chart' && (
                    <div 
                      className="absolute inset-0 rounded-xl"
                      style={{
                        background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
                        boxShadow: '0 3px 8px rgba(59, 130, 246, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.2)',
                        transition: 'all 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94)'
                      }}
                    />
                  )}
                  <Network size={16} className={`relative z-10 ${viewMode === 'chart' ? '!text-white' : ''}`} />
                  <span className={`relative z-10 text-xs ${viewMode === 'chart' ? '!text-white' : ''}`}>Org Chart</span>
                </button>
              </div>
            </div>
            <div className={`${isFullscreen ? 'p-8' : 'p-6'} relative ${isFullscreen ? 'flex-1 overflow-hidden' : ''}`}>
              <OrgChart 
                onQuickAdd={setQuickAddModal}
                onEditEmployee={setEditingEmployee}
                onDeleteEmployee={handleDeleteEmployee}
                zoom={zoom}
                onZoomChange={setZoom}
                isDarkMode={isDarkMode}
                isFullscreen={isFullscreen}
              />
              
              {/* Fullscreen and Zoom Controls */}
              <div className="absolute right-6 top-1/2 -translate-y-1/2 flex flex-col gap-2">
                <button 
                  onClick={toggleFullscreen}
                  className="glass-button w-12 h-12 rounded-full flex items-center justify-center text-white hover:scale-110 transition-transform mb-4"
                  title={isFullscreen ? "Exit Fullscreen" : "Enter Fullscreen"}
                >
                  {isFullscreen ? <Minimize2 size={20} /> : <Maximize2 size={20} />}
                </button>
                <div className="glass-card px-3 py-1 rounded-full text-white text-sm font-medium text-center mb-2">
                  {Math.round(zoom * 100)}%
                </div>
                <button 
                  onClick={() => setZoom(prev => Math.min(prev + 0.2, 3))}
                  className="glass-button w-12 h-12 rounded-full flex items-center justify-center text-white hover:scale-110 transition-transform"
                  title="Zoom In"
                >
                  <Plus size={20} />
                </button>
                <button 
                  onClick={() => setZoom(prev => Math.max(prev - 0.2, 0.25))}
                  className="glass-button w-12 h-12 rounded-full flex items-center justify-center text-white hover:scale-110 transition-transform"
                  title="Zoom Out"
                >
                  <Minus size={20} />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Right Sidebar - Add Employee Widget */}
      <div className="w-full xl:w-96 p-4 md:p-6 space-y-6 xl:max-h-screen xl:overflow-y-auto">
        <div className="glass-card-large p-6">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <PlusCircle size={20} className="text-blue-400" />
            Add New Employee
          </h3>
          
          <div className="space-y-3">
            <button
              onClick={() => setShowAddModal(true)}
              className="w-full glass-button py-3 font-medium hover:scale-105 transition-transform flex items-center justify-center gap-2"
            >
              <Plus size={20} />
              Add Employee
            </button>
            
            <button
              onClick={() => setShowBulkImportModal(true)}
              className="w-full glass-button py-3 font-medium hover:scale-105 transition-transform flex items-center justify-center gap-2"
            >
              <Upload size={20} />
              Bulk Import
            </button>
            
            {employees.length > 0 && (
              <button
                onClick={() => {
                  if (window.confirm('Are you sure you want to delete ALL employees? This action cannot be undone.')) {
                    setEmployees([]);
                    lsWrite(LS_EMPLOYEES, []);
                  }
                }}
                className="w-full py-3 font-medium transition-all flex items-center justify-center gap-2 rounded-2xl border bg-red-900/80 hover:bg-red-800 border-red-700/50 text-white hover:scale-105"
              >
                <Trash2 size={20} />
                Delete All Employees
              </button>
            )}
          </div>

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
      
      {/* Quick Add Employee Modal */}
      {quickAddModal && (
        <QuickAddEmployeeModal
          managerId={quickAddModal.managerId}
          employees={employees}
          onSave={(name) => {
            const newEmployee = {
              id: `emp-${uid()}`,
              employeeId: '',
              name,
              managerId: quickAddModal.managerId,
              division: '',
              squad: '',
              team: '',
              role: '',
              seniority: '',
              birthday: '',
              startDate: new Date().toISOString().split('T')[0],
              exitDate: '',
              netSalary: '',
              grossSalary: '',
              totalSalary: ''
            };
            
            const updated = [...employees, newEmployee];
            setEmployees(updated);
            lsWrite(LS_EMPLOYEES, updated);
            setQuickAddModal(null);
          }}
          onClose={() => setQuickAddModal(null)}
        />
      )}

      {/* Bulk Import Modal */}
      {showBulkImportModal && (
        <BulkImportModal
          onSave={(importedEmployees) => {
            const updated = [...employees, ...importedEmployees];
            setEmployees(updated);
            lsWrite(LS_EMPLOYEES, updated);
            setShowBulkImportModal(false);
          }}
          onClose={() => setShowBulkImportModal(false)}
        />
      )}
    </div>
  );
}

/* -----------------------------------------------------------
   Bulk Import Modal Component  
------------------------------------------------------------ */
function BulkImportModal({ onSave, onClose }) {
  const [importMethod, setImportMethod] = useState('paste'); // 'paste' or 'csv'
  const [csvData, setCsvData] = useState('');
  const [csvFile, setCsvFile] = useState(null);
  const [previewData, setPreviewData] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const expectedHeaders = [
    'Employee ID', 'Name', 'Division', 'Squad', 'Team', 'Role', 'Seniority', 
    'Manager', 'Birthday', 'Start Date', 'Exit Date', 
    'Net Salary', 'Gross Salary', 'Total Salary'
  ];

  const parseCSVData = (data) => {
    const lines = data.trim().split('\n');
    if (lines.length < 2) return null;

    const headers = lines[0].split('\t').map(h => h.trim());
    const rows = lines.slice(1).map(line => line.split('\t').map(cell => cell.trim()));

    return { headers, rows };
  };

  const handlePasteData = () => {
    if (!csvData.trim()) {
      alert('Please paste your data first');
      return;
    }

    const parsed = parseCSVData(csvData);
    if (!parsed) {
      alert('Invalid data format. Please check your data.');
      return;
    }

    setPreviewData(parsed);
  };

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    setCsvFile(file);
    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target.result;
      const parsed = parseCSVData(content);
      if (parsed) {
        setPreviewData(parsed);
      } else {
        alert('Invalid CSV format');
      }
    };
    reader.readAsText(file);
  };

  const convertToEmployees = (data) => {
    const { headers, rows } = data;
    
    // Create mapping between expected headers and actual headers
    const headerMap = {};
    expectedHeaders.forEach(expected => {
      const found = headers.find(h => 
        h.toLowerCase().includes(expected.toLowerCase()) ||
        expected.toLowerCase().includes(h.toLowerCase())
      );
      if (found) {
        headerMap[expected] = headers.indexOf(found);
      }
    });

    // First pass: Create all employees without manager relationships
    const newEmployees = rows.map(row => {
      const employee = {
        id: `emp-${uid()}`,
        employeeId: row[headerMap['Employee ID']] || '',
        name: row[headerMap['Name']] || '',
        division: row[headerMap['Division']] || '',
        squad: row[headerMap['Squad']] || '',
        team: row[headerMap['Team']] || '',
        role: row[headerMap['Role']] || '',
        seniority: row[headerMap['Seniority']] || 'Junior',
        birthday: row[headerMap['Birthday']] || '',
        startDate: row[headerMap['Start Date']] || new Date().toISOString().split('T')[0],
        exitDate: row[headerMap['Exit Date']] || '',
        netSalary: row[headerMap['Net Salary']] || '',
        grossSalary: row[headerMap['Gross Salary']] || '',
        totalSalary: row[headerMap['Total Salary']] || '',
        managerName: row[headerMap['Manager']] || '', // Store manager name temporarily
        managerId: '' // Will be set in second pass
      };

      // Clean up salary fields - convert to numbers if possible
      ['netSalary', 'grossSalary', 'totalSalary'].forEach(field => {
        if (employee[field]) {
          const num = parseFloat(employee[field].toString().replace(/[^0-9.-]/g, ''));
          if (!isNaN(num)) {
            employee[field] = num;
          }
        }
      });

      return employee;
    }).filter(emp => emp.name); // Only include employees with names

    // Second pass: Resolve manager relationships
    newEmployees.forEach(employee => {
      if (employee.managerName) {
        const managerName = employee.managerName.trim();
        
        // Try to find manager by name
        const manager = newEmployees.find(emp => 
          emp.name.toLowerCase() === managerName.toLowerCase()
        );
        
        if (manager) {
          employee.managerId = manager.id;
        } else {
          // Try to find manager by Employee ID
          const managerByEmpId = newEmployees.find(emp => 
            emp.employeeId && emp.employeeId.toLowerCase() === managerName.toLowerCase()
          );
          
          if (managerByEmpId) {
            employee.managerId = managerByEmpId.id;
          } else {
            // Try partial name matching
            const managerByPartialName = newEmployees.find(emp => 
              emp.name.toLowerCase().includes(managerName.toLowerCase()) ||
              managerName.toLowerCase().includes(emp.name.toLowerCase())
            );
            
            if (managerByPartialName) {
              employee.managerId = managerByPartialName.id;
            }
          }
        }
      }
      
      // Remove temporary managerName field
      delete employee.managerName;
    });

    return newEmployees;
  };

  const handleImport = () => {
    if (!previewData) {
      alert('No data to import');
      return;
    }

    setIsProcessing(true);
    try {
      const employees = convertToEmployees(previewData);
      onSave(employees);
    } catch (error) {
      alert('Error processing data: ' + error.message);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="glass-card-large w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-white/10">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-white">Bulk Import Employees</h2>
            <button onClick={onClose} className="glass-button p-2 rounded-lg hover:scale-110">
              <X size={20} className="text-white/80" />
            </button>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* Import Method Selection */}
          <div>
            <label className="block text-sm font-medium text-white/70 mb-3">Import Method</label>
            <div className="flex gap-4">
              <button
                onClick={() => setImportMethod('paste')}
                className={`px-4 py-2 rounded-lg transition-all ${
                  importMethod === 'paste' 
                    ? 'bg-blue-500/30 text-blue-300 border border-blue-400/50' 
                    : 'glass-button'
                }`}
              >
                Paste from Google Sheets
              </button>
              <button
                onClick={() => setImportMethod('csv')}
                className={`px-4 py-2 rounded-lg transition-all ${
                  importMethod === 'csv' 
                    ? 'bg-blue-500/30 text-blue-300 border border-blue-400/50' 
                    : 'glass-button'
                }`}
              >
                Upload CSV File
              </button>
            </div>
          </div>

          {/* Expected Headers Info */}
          <div className="p-4 rounded-lg bg-blue-500/10 border border-blue-400/20">
            <h4 className="text-sm font-medium text-blue-300 mb-2">Expected Headers</h4>
            <div className="text-xs text-white/70 grid grid-cols-3 gap-2">
              {expectedHeaders.map(header => (
                <span key={header} className="bg-white/10 px-2 py-1 rounded">{header}</span>
              ))}
            </div>
          </div>

          {/* Import Method Content */}
          {importMethod === 'paste' ? (
            <div>
              <label className="block text-sm font-medium text-white/70 mb-2">
                Paste your data from Google Sheets (Tab-separated)
              </label>
              <textarea
                value={csvData}
                onChange={(e) => setCsvData(e.target.value)}
                className="w-full h-40 glass-input px-4 py-3 resize-none"
                placeholder="Copy and paste your employee data from Google Sheets here..."
              />
              <button
                onClick={handlePasteData}
                className="mt-3 glass-button px-4 py-2 hover:scale-105"
              >
                Parse Data
              </button>
            </div>
          ) : (
            <div>
              <label className="block text-sm font-medium text-white/70 mb-2">
                Upload CSV File
              </label>
              <input
                type="file"
                accept=".csv"
                onChange={handleFileUpload}
                className="w-full glass-input px-4 py-2 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-white/10 file:text-white/80"
              />
            </div>
          )}

          {/* Preview Data */}
          {previewData && (
            <div>
              <h4 className="text-sm font-medium text-white/70 mb-3">
                Preview ({previewData.rows.length} employees found)
              </h4>
              <div className="border border-white/20 rounded-lg overflow-hidden">
                <div className="overflow-x-auto max-h-60">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-white/5">
                        {previewData.headers.map((header, index) => (
                          <th key={index} className="text-left p-2 text-white/70 font-medium border-r border-white/10 last:border-r-0">
                            {header}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {previewData.rows.slice(0, 5).map((row, index) => (
                        <tr key={index} className="border-t border-white/10">
                          {row.map((cell, cellIndex) => (
                            <td key={cellIndex} className="p-2 text-white/70 border-r border-white/10 last:border-r-0">
                              {cell}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
              {previewData.rows.length > 5 && (
                <p className="text-xs text-white/50 mt-2">
                  Showing first 5 rows. {previewData.rows.length - 5} more rows will be imported.
                </p>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-white/20 flex justify-end gap-3">
          <button 
            onClick={onClose} 
            className="glass-button px-4 py-2 text-white hover:scale-105 bg-red-900/80 hover:bg-red-800 border-red-700/50"
          >
            Cancel
          </button>
          <button
            onClick={handleImport}
            disabled={!previewData || isProcessing}
            className="glass-button px-4 py-2 bg-blue-600/80 text-white hover:scale-105 hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isProcessing ? 'Importing...' : `Import ${previewData?.rows.length || 0} Employees`}
          </button>
        </div>
      </div>
    </div>
  );
}

/* -----------------------------------------------------------
   Add Employee Modal Component
----------------------------------------------------------- */
function AddEmployeeModal({ employee, employees, onSave, onClose }) {
  const [formData, setFormData] = useState({
    name: employee?.name || '',
    employeeId: employee?.employeeId || '',
    division: employee?.division || '',
    squad: employee?.squad || '',
    team: employee?.team || '',
    role: employee?.role || '',
    seniority: employee?.seniority || '',
    managerId: employee?.managerId || '',
    birthday: employee?.birthday || '',
    startDate: employee?.startDate || new Date().toISOString().split('T')[0],
    exitDate: employee?.exitDate || '',
    netSalary: employee?.netSalary || '',
    grossSalary: employee?.grossSalary || '',
    totalSalary: employee?.totalSalary || ''
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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
              <label className="block text-sm font-medium text-white/70 mb-2">Employee ID</label>
              <input
                type="text"
                value={formData.employeeId}
                onChange={(e) => setFormData({...formData, employeeId: e.target.value})}
                className="w-full glass-input px-4 py-2"
                placeholder="EMP001"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-white/70 mb-2">Division</label>
              <input
                type="text"
                value={formData.division}
                onChange={(e) => setFormData({...formData, division: e.target.value})}
                className="w-full glass-input px-4 py-2"
                placeholder="Marketing"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-white/70 mb-2">Squad</label>
              <input
                type="text"
                value={formData.squad}
                onChange={(e) => setFormData({...formData, squad: e.target.value})}
                className="w-full glass-input px-4 py-2"
                placeholder="Creative"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-white/70 mb-2">Team</label>
              <input
                type="text"
                value={formData.team}
                onChange={(e) => setFormData({...formData, team: e.target.value})}
                className="w-full glass-input px-4 py-2"
                placeholder="Production™"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-white/70 mb-2">Role</label>
            <input
              type="text"
              value={formData.role}
              onChange={(e) => setFormData({...formData, role: e.target.value})}
              className="w-full glass-input px-4 py-2"
              placeholder="Production Lead"
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

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-white/70 mb-2">Birthday</label>
              <input
                type="date"
                value={formData.birthday}
                onChange={(e) => setFormData({...formData, birthday: e.target.value})}
                className="w-full glass-input px-4 py-2"
              />
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
            <div>
              <label className="block text-sm font-medium text-white/70 mb-2">Exit Date</label>
              <input
                type="date"
                value={formData.exitDate}
                onChange={(e) => setFormData({...formData, exitDate: e.target.value})}
                className="w-full glass-input px-4 py-2"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-white/70 mb-2">Net Salary</label>
              <input
                type="number"
                value={formData.netSalary}
                onChange={(e) => setFormData({...formData, netSalary: e.target.value})}
                className="w-full glass-input px-4 py-2"
                placeholder="600000"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-white/70 mb-2">Gross Salary</label>
              <input
                type="number"
                value={formData.grossSalary}
                onChange={(e) => setFormData({...formData, grossSalary: e.target.value})}
                className="w-full glass-input px-4 py-2"
                placeholder="348800"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-white/70 mb-2">Total Salary</label>
              <input
                type="number"
                value={formData.totalSalary}
                onChange={(e) => setFormData({...formData, totalSalary: e.target.value})}
                className="w-full glass-input px-4 py-2"
                placeholder="751728"
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 rounded-xl text-white bg-red-900/80 hover:bg-red-800 border border-red-700/50 transition-colors"
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
   Quick Add Employee Modal Component
----------------------------------------------------------- */
function QuickAddEmployeeModal({ managerId, employees, onSave, onClose }) {
  const [name, setName] = useState('');
  const inputRef = useRef(null);
  
  useEffect(() => {
    // Auto-focus the input when modal opens
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);
  
  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim()) {
      alert('Please enter employee name');
      return;
    }
    onSave(name.trim());
  };
  
  const handleKeyDown = (e) => {
    if (e.key === 'Escape') {
      onClose();
    }
  };
  
  // Find manager name
  const manager = employees.find(emp => emp.id === managerId);
  
  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="glass-card-large w-full max-w-sm" onClick={(e) => e.stopPropagation()}>
        <div className="p-6 border-b border-white/10">
          <h2 className="text-xl font-semibold text-white">Quick Add Employee</h2>
          {manager && (
            <p className="text-sm text-white/60 mt-1">
              Reports to: <span className="text-white/80">{manager.name}</span>
            </p>
          )}
        </div>
        
        <form onSubmit={handleSubmit} className="p-6">
          <div>
            <label className="block text-sm font-medium text-white/70 mb-2">
              Employee Name <span className="text-red-400">*</span>
            </label>
            <input
              ref={inputRef}
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              onKeyDown={handleKeyDown}
              className="w-full glass-input px-4 py-3 text-lg"
              placeholder="Enter name..."
              required
              autoFocus
            />
            <p className="text-xs text-white/50 mt-2">
              Press Enter to add, Escape to cancel
            </p>
          </div>
          
          <div className="flex gap-2 mt-6">
            <button 
              type="button"
              onClick={onClose} 
              className="flex-1 px-4 py-2 rounded-lg bg-red-900/80 hover:bg-red-800 border border-red-700/50 text-white"
            >
              Cancel
            </button>
            <button 
              type="submit" 
              className="flex-1 px-4 py-2 glass-button rounded-lg font-medium"
            >
              Add Employee
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
      employeeId: "",
      name,
      division: "",
      squad: "",
      team: "",
      role: "",
      seniority: "Junior",
      birthday: "",
      startDate: new Date().toISOString().slice(0, 10),
      exitDate: "",
      netSalary: "",
      grossSalary: "",
      totalSalary: "",
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
      division: "",
      squad: "",
      team: "",
      role: "",
      seniority: "Junior",
      birthday: "",
      startDate: new Date().toISOString().slice(0, 10),
      exitDate: "",
      netSalary: "",
      grossSalary: "",
      totalSalary: "",
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
    <div className="flex h-full flex-col p-6 overflow-auto">
      <div className="mb-8">
        <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-white mb-2 bg-gradient-to-r from-white to-white/80 bg-clip-text text-transparent">
          Performance Dashboard
        </h1>
        <p className="text-white/60 text-base md:text-lg">Overview of your team's performance metrics</p>
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
        <div className="flex h-full flex-col p-6">
          <header className="glass-card-large mb-6 p-6">
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
                                    {[emp.division, emp.role, emp.seniority].filter(Boolean).join(" · ")}
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
        </div>
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