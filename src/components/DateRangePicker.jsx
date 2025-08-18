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
    const clickedDate = new Date(viewY, viewM, day);
    
    if (!isSelectingEnd) {
      // First click - set start date
      setSelectionStart(clickedDate);
      setSelectionEnd(null);
      setIsSelectingEnd(true);
    } else {
      // Second click - set end date
      let finalStart = selectionStart;
      let finalEnd = clickedDate;
      
      // Ensure start is before end
      if (finalEnd < finalStart) {
        [finalStart, finalEnd] = [finalEnd, finalStart];
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

  const dropdown = open && (
    <div 
      ref={dropdownRef}
      className="fixed z-[9999] w-96 rounded-xl glass-card-no-transition shadow-xl p-4"
      style={{
        top: position.top + 'px',
        left: position.left + 'px',
        visibility: position.top === 0 && position.left === 0 ? 'hidden' : 'visible'
      }}
    >
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

      {/* Quick presets */}
      <div className="mt-4 pt-4 border-t border-white/10">
        <div className="text-xs text-white/50 mb-2">Quick select:</div>
        <div className="flex gap-2 flex-wrap">
          <button
            onClick={() => {
              const start = new Date();
              start.setDate(start.getDate() - start.getDay()); // This week start
              const end = new Date();
              end.setDate(end.getDate() + (6 - end.getDay())); // This week end
              
              setSelectionStart(start);
              setSelectionEnd(end);
              onRangeChange(
                start.toISOString().slice(0, 10),
                end.toISOString().slice(0, 10)
              );
              setOpen(false);
            }}
            className="px-3 py-1 text-xs rounded-lg glass-button hover:bg-white/10"
          >
            This Week
          </button>
          <button
            onClick={() => {
              const today = new Date();
              const year = today.getFullYear();
              const month = today.getMonth();
              
              const start = new Date(Date.UTC(year, month, 1));
              const end = new Date(Date.UTC(year, month + 1, 0));
              
              setSelectionStart(start);
              setSelectionEnd(end);
              onRangeChange(
                start.toISOString().slice(0, 10),
                end.toISOString().slice(0, 10)
              );
              setOpen(false);
            }}
            className="px-3 py-1 text-xs rounded-lg glass-button hover:bg-white/10"
          >
            This Month
          </button>
          <button
            onClick={() => {
              const end = new Date();
              const start = new Date();
              start.setDate(start.getDate() - 30);
              
              setSelectionStart(start);
              setSelectionEnd(end);
              onRangeChange(
                start.toISOString().slice(0, 10),
                end.toISOString().slice(0, 10)
              );
              setOpen(false);
            }}
            className="px-3 py-1 text-xs rounded-lg glass-button hover:bg-white/10"
          >
            Last 30 Days
          </button>
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