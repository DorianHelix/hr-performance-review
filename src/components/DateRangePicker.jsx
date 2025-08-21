import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { Calendar, ChevronLeft, ChevronRight } from 'lucide-react';

function DateRangePicker({ label, startDate, endDate, onRangeChange }) {
  const [open, setOpen] = useState(false);
  const buttonRef = useRef(null);
  const dropdownRef = useRef(null);
  const [position, setPosition] = useState({ top: 0, left: 0 });
  
  // Selection state
  const [selectionStart, setSelectionStart] = useState(null);
  const [selectionEnd, setSelectionEnd] = useState(null);
  const [isSelectingEnd, setIsSelectingEnd] = useState(false);
  const [hoveredDate, setHoveredDate] = useState(null);
  
  // View state
  const today = new Date();
  const [viewY, setViewY] = useState(today.getFullYear());
  const [viewM, setViewM] = useState(today.getMonth());

  // Initialize selection from props
  useEffect(() => {
    if (startDate) {
      const start = new Date(startDate);
      setSelectionStart(start);
      setViewY(start.getFullYear());
      setViewM(start.getMonth());
    }
    if (endDate) {
      setSelectionEnd(new Date(endDate));
    }
  }, [startDate, endDate]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const onClick = (e) => { 
      if (open && dropdownRef.current && !dropdownRef.current.contains(e.target) && 
          buttonRef.current && !buttonRef.current.contains(e.target)) {
        setOpen(false);
        setIsSelectingEnd(false);
        setHoveredDate(null);
      }
    };
    window.addEventListener("mousedown", onClick);
    return () => window.removeEventListener("mousedown", onClick);
  }, [open]);

  // Position dropdown
  useEffect(() => {
    if (open && buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      setPosition({
        top: rect.bottom + window.scrollY + 4,
        left: rect.left + window.scrollX
      });
    }
  }, [open]);

  function daysInMonth(y, m) { 
    return new Date(y, m + 1, 0).getDate(); 
  }
  
  function startWeekday(y, m) { 
    return new Date(y, m, 1).getDay(); 
  }

  function isSameDay(date1, date2) {
    if (!date1 || !date2) return false;
    return date1.getDate() === date2.getDate() &&
           date1.getMonth() === date2.getMonth() &&
           date1.getFullYear() === date2.getFullYear();
  }

  function isInRange(date) {
    if (!selectionStart || !selectionEnd) return false;
    return date >= selectionStart && date <= selectionEnd;
  }

  function isInHoverRange(date) {
    if (!selectionStart || !hoveredDate || !isSelectingEnd) return false;
    const endDate = hoveredDate;
    const startDate = selectionStart;
    if (endDate < startDate) {
      return date >= endDate && date <= startDate;
    }
    return date >= startDate && date <= endDate;
  }

  function handleDateClick(day) {
    // Create date in local timezone to avoid date shifting
    const clickedDate = new Date(viewY, viewM, day, 12, 0, 0); // Use noon to avoid DST issues
    
    if (!isSelectingEnd) {
      // First click - set start date
      const startDate = new Date(viewY, viewM, day, 0, 0, 0, 0);
      setSelectionStart(startDate);
      setSelectionEnd(null);
      setIsSelectingEnd(true);
    } else {
      // Second click - set end date
      const endDate = new Date(viewY, viewM, day, 23, 59, 59, 999);
      let finalStart = selectionStart;
      let finalEnd = endDate;
      
      // Ensure start is before end
      if (finalEnd < finalStart) {
        // Swap and adjust times
        finalStart = new Date(viewY, viewM, day, 0, 0, 0, 0);
        finalEnd = new Date(selectionStart.getFullYear(), selectionStart.getMonth(), selectionStart.getDate(), 23, 59, 59, 999);
      }
      
      setSelectionStart(finalStart);
      setSelectionEnd(finalEnd);
      setIsSelectingEnd(false);
      
      // Update parent component
      onRangeChange(
        finalStart.toISOString().slice(0, 10),
        finalEnd.toISOString().slice(0, 10)
      );
      
      // Close dropdown after selection
      setTimeout(() => setOpen(false), 200);
    }
  }

  function handleDateHover(day) {
    if (isSelectingEnd && day) {
      setHoveredDate(new Date(viewY, viewM, day));
    } else {
      setHoveredDate(null);
    }
  }

  function formatDateRange() {
    if (!selectionStart || !selectionEnd) {
      return "Select date range";
    }
    
    const startStr = selectionStart.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric' 
    });
    const endStr = selectionEnd.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: 'numeric'
    });
    
    return `${startStr} - ${endStr}`;
  }

  // Build calendar grid
  const monthName = new Date(viewY, viewM, 1).toLocaleString(undefined, { 
    month: 'long', 
    year: 'numeric' 
  });
  
  const grid = [];
  const lead = startWeekday(viewY, viewM);
  for (let i = 0; i < lead; i++) grid.push(null);
  for (let day = 1; day <= daysInMonth(viewY, viewM); day++) grid.push(day);

  // Quick date range options - using proper date creation to avoid timezone issues
  const quickRanges = [
    { 
      label: 'Today', 
      getValue: () => { 
        const now = new Date();
        const start = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);
        const end = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);
        return {start, end};
      }
    },
    { 
      label: 'Yesterday', 
      getValue: () => { 
        const now = new Date();
        const start = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1, 0, 0, 0, 0);
        const end = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1, 23, 59, 59, 999);
        return {start, end};
      }
    },
    { 
      label: 'Last 7 Days', 
      getValue: () => { 
        const now = new Date();
        const end = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);
        const start = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 6, 0, 0, 0, 0);
        return {start, end};
      }
    },
    { 
      label: 'Last 30 Days', 
      getValue: () => { 
        const now = new Date();
        const end = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);
        const start = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 29, 0, 0, 0, 0);
        return {start, end};
      }
    },
    { 
      label: 'This Month', 
      getValue: () => { 
        const now = new Date();
        const start = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0, 0);
        const end = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
        return {start, end};
      }
    },
    { 
      label: 'Last Month', 
      getValue: () => { 
        const now = new Date();
        const start = new Date(now.getFullYear(), now.getMonth() - 1, 1, 0, 0, 0, 0);
        const end = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59, 999);
        return {start, end};
      }
    },
    { 
      label: 'Last 90 Days', 
      getValue: () => { 
        const now = new Date();
        const end = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);
        const start = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 89, 0, 0, 0, 0);
        return {start, end};
      }
    },
    { 
      label: 'This Year', 
      getValue: () => { 
        const now = new Date();
        const start = new Date(now.getFullYear(), 0, 1, 0, 0, 0, 0);
        const end = new Date(now.getFullYear(), 11, 31, 23, 59, 59, 999);
        return {start, end};
      }
    }
  ];

  function handleQuickRange(range) {
    const { start, end } = range.getValue();
    setSelectionStart(start);
    setSelectionEnd(end);
    onRangeChange(
      start.toISOString().slice(0, 10),
      end.toISOString().slice(0, 10)
    );
    setTimeout(() => setOpen(false), 200);
  }

  const dropdown = open && (
    <div 
      ref={dropdownRef}
      className="fixed z-[9999] w-[600px] rounded-xl glass-card-no-transition shadow-xl p-4"
      style={{
        top: position.top + 'px',
        left: position.left + 'px',
        visibility: position.top === 0 && position.left === 0 ? 'hidden' : 'visible'
      }}
    >
      <div className="flex gap-4">
        {/* Quick selectors */}
        <div className="w-40 border-r border-white/10 pr-4">
          <div className="text-xs font-medium text-white/60 mb-2 uppercase tracking-wider">Quick Select</div>
          <div className="space-y-1">
            {quickRanges.map(range => (
              <button
                key={range.label}
                onClick={() => handleQuickRange(range)}
                className="w-full text-left px-3 py-2 rounded-lg text-sm text-white/80 hover:bg-white/10 hover:text-white transition-all flex items-center gap-2"
              >
                <span className={`text-xs ${range.label.includes('Today') || range.label.includes('This') ? 'text-blue-400' : 'text-white/40'}`}>✓</span>
                {range.label}
              </button>
            ))}
            <button
              onClick={() => setIsSelectingEnd(false)}
              className="w-full text-left px-3 py-2 rounded-lg text-sm text-white/80 hover:bg-white/10 hover:text-white transition-all flex items-center gap-2"
            >
              <span className="text-xs text-purple-400">✓</span>
              Custom Range
            </button>
          </div>
        </div>
        
        {/* Calendar */}
        <div className="flex-1">
          {/* Header with month navigation */}
          <div className="flex items-center justify-between mb-3">
        <button 
          onClick={() => setViewM(m => m === 0 ? (setViewY(y => y - 1), 11) : m - 1)} 
          className="p-1.5 rounded-md hover:bg-white/10"
        >
          <ChevronLeft size={18} className="text-white/80" />
        </button>
        <div className="font-semibold text-white">{monthName}</div>
        <button 
          onClick={() => setViewM(m => m === 11 ? (setViewY(y => y + 1), 0) : m + 1)} 
          className="p-1.5 rounded-md hover:bg-white/10"
        >
          <ChevronRight size={18} className="text-white/80" />
        </button>
      </div>

      {/* Instructions */}
      <div className="text-xs text-white/50 text-center mb-3">
        {isSelectingEnd 
          ? "Click to select end date" 
          : "Click to select start date"}
      </div>

      {/* Weekday headers */}
      <div className="grid grid-cols-7 gap-1 text-center text-xs text-white/60 mb-2">
        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(w => (
          <div key={w} className="font-medium">{w}</div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7 gap-1">
        {grid.map((day, i) => {
          if (!day) return <div key={i} className="h-9" />;
          
          const currentDate = new Date(viewY, viewM, day);
          const isStart = isSameDay(currentDate, selectionStart);
          const isEnd = isSameDay(currentDate, selectionEnd);
          const inRange = isInRange(currentDate);
          const inHoverRange = isInHoverRange(currentDate);
          const isToday = isSameDay(currentDate, new Date());
          
          let className = "h-9 rounded-lg text-sm transition-all relative ";
          
          if (isStart || isEnd) {
            className += "bg-blue-600 text-white font-medium z-10 ";
          } else if (inRange) {
            className += "bg-blue-500/30 text-white ";
          } else if (inHoverRange) {
            className += "bg-blue-500/20 text-white/80 ";
          } else if (isToday) {
            className += "glass-card text-blue-400 font-medium hover:bg-white/10 ";
          } else {
            className += "hover:bg-white/5 text-white/80 ";
          }
          
          // Add rounded corners for range edges
          if (isStart && !isEnd) {
            className += "rounded-r-none ";
          }
          if (isEnd && !isStart) {
            className += "rounded-l-none ";
          }
          if (inRange && !isStart && !isEnd) {
            className += "rounded-none ";
          }
          
          return (
            <button
              key={i}
              onClick={() => handleDateClick(day)}
              onMouseEnter={() => handleDateHover(day)}
              onMouseLeave={() => handleDateHover(null)}
              className={className}
            >
              {day}
              {isStart && (
                <span className="absolute -top-5 left-1/2 -translate-x-1/2 text-[10px] text-blue-400 font-medium">
                  Start
                </span>
              )}
              {isEnd && (
                <span className="absolute -top-5 left-1/2 -translate-x-1/2 text-[10px] text-blue-400 font-medium">
                  End
                </span>
              )}
            </button>
          );
        })}
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="flex flex-col">
      {label && <label className="text-xs font-medium text-white/60 mb-1">{label}</label>}
      <button
        ref={buttonRef}
        onClick={() => setOpen(o => !o)}
        className="glass-input px-4 py-2.5 text-left min-w-[200px] flex items-center justify-between hover:bg-white/5 transition-colors"
      >
        <span className="text-sm text-white font-medium">{formatDateRange()}</span>
        <Calendar size={16} className="text-white/60" />
      </button>

      {dropdown && createPortal(dropdown, document.body)}
    </div>
  );
}

export default DateRangePicker;