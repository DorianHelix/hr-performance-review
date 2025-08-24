import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { Calendar, ChevronLeft, ChevronRight } from 'lucide-react';

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

export default DatePicker;