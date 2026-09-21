import React, { useState } from 'react';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, Check } from 'lucide-react';

interface DatePickerCalendarProps {
  value: string; // YYYY-MM-DD
  onChange: (dateStr: string) => void;
  label?: string;
  minDate?: string;
  maxDate?: string;
}

// Helpers
export function formatDateISO(d: Date): string {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function parseDateISO(str: string): Date {
  if (!str) return new Date();
  const [y, m, d] = str.split('-').map(Number);
  return new Date(y, (m || 1) - 1, d || 1);
}

export const DatePickerCalendar: React.FC<DatePickerCalendarProps> = ({
  value,
  onChange,
  label = 'Journey Date',
  minDate,
  maxDate
}) => {
  const [isCalendarOpen, setIsCalendarOpen] = useState<boolean>(false);

  // Today
  const today = new Date();
  const todayStr = formatDateISO(today);
  const effectiveMin = minDate || todayStr;

  // Tomorrow
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  const tomorrowStr = formatDateISO(tomorrow);

  // Day after tomorrow
  const dayAfter = new Date(today);
  dayAfter.setDate(dayAfter.getDate() + 2);
  const dayAfterStr = formatDateISO(dayAfter);

  // Max date (120 days from today)
  const defaultMax = new Date(today);
  defaultMax.setDate(defaultMax.getDate() + 120);
  const effectiveMax = maxDate || formatDateISO(defaultMax);

  // Selected date object
  const selectedDateObj = parseDateISO(value || todayStr);

  // Calendar View month/year state
  const [viewYear, setViewYear] = useState<number>(selectedDateObj.getFullYear());
  const [viewMonth, setViewMonth] = useState<number>(selectedDateObj.getMonth()); // 0-indexed

  // Format readable display
  const formatReadable = (str: string) => {
    if (!str) return 'Select date';
    if (str === todayStr) return 'Today';
    if (str === tomorrowStr) return 'Tomorrow';
    if (str === dayAfterStr) return 'Day After Tomorrow';
    try {
      const d = parseDateISO(str);
      return d.toLocaleDateString('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      });
    } catch {
      return str;
    }
  };

  // Month navigation
  const prevMonth = () => {
    if (viewMonth === 0) {
      setViewMonth(11);
      setViewYear((y) => y - 1);
    } else {
      setViewMonth((m) => m - 1);
    }
  };

  const nextMonth = () => {
    if (viewMonth === 11) {
      setViewMonth(0);
      setViewYear((y) => y + 1);
    } else {
      setViewMonth((m) => m + 1);
    }
  };

  // Generate calendar days
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
  const firstDayOfWeek = new Date(viewYear, viewMonth, 1).getDay(); // 0 = Sun, 1 = Mon ...

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const handleSelectDay = (dayNumber: number) => {
    const d = new Date(viewYear, viewMonth, dayNumber);
    const isoStr = formatDateISO(d);
    onChange(isoStr);
    setIsCalendarOpen(false);
  };

  return (
    <div className="space-y-2">
      {label && (
        <div className="flex items-center justify-between">
          <label className="block text-xs font-semibold text-slate-300">
            {label}
          </label>
          <span className="text-[11px] text-emerald-400 font-medium">
            {formatReadable(value)}
          </span>
        </div>
      )}

      {/* Quick Date Selector Chips */}
      <div className="flex flex-wrap items-center gap-1.5">
        <button
          type="button"
          onClick={() => onChange(todayStr)}
          className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
            value === todayStr
              ? 'bg-emerald-500 text-slate-950 font-bold shadow-md shadow-emerald-500/20'
              : 'bg-slate-800 hover:bg-slate-750 text-slate-300'
          }`}
        >
          Today
        </button>

        <button
          type="button"
          onClick={() => onChange(tomorrowStr)}
          className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
            value === tomorrowStr
              ? 'bg-emerald-500 text-slate-950 font-bold shadow-md shadow-emerald-500/20'
              : 'bg-slate-800 hover:bg-slate-750 text-slate-300'
          }`}
        >
          Tomorrow
        </button>

        <button
          type="button"
          onClick={() => onChange(dayAfterStr)}
          className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
            value === dayAfterStr
              ? 'bg-emerald-500 text-slate-950 font-bold shadow-md shadow-emerald-500/20'
              : 'bg-slate-800 hover:bg-slate-750 text-slate-300'
          }`}
        >
          +2 Days
        </button>

        {/* Toggle Interactive Calendar button */}
        <button
          type="button"
          onClick={() => {
            const current = parseDateISO(value || todayStr);
            setViewYear(current.getFullYear());
            setViewMonth(current.getMonth());
            setIsCalendarOpen(!isCalendarOpen);
          }}
          className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center space-x-1.5 transition-all cursor-pointer ${
            isCalendarOpen || (value !== todayStr && value !== tomorrowStr && value !== dayAfterStr)
              ? 'bg-emerald-500/20 border border-emerald-500/60 text-emerald-300'
              : 'bg-slate-800 hover:bg-slate-750 text-slate-300 border border-slate-700'
          }`}
        >
          <CalendarIcon className="w-3.5 h-3.5" />
          <span>{isCalendarOpen ? 'Close Calendar' : 'Open Calendar'}</span>
        </button>
      </div>

      {/* Interactive Visual Calendar Grid Card */}
      {isCalendarOpen && (
        <div className="p-4 rounded-2xl bg-slate-950 border border-emerald-500/40 shadow-2xl space-y-3 animate-fadeIn mt-2">
          
          {/* Month Header & Controls */}
          <div className="flex items-center justify-between">
            <button
              type="button"
              onClick={prevMonth}
              className="p-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white transition-colors cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            <span className="text-xs font-bold text-white tracking-wide">
              {monthNames[viewMonth]} {viewYear}
            </span>

            <button
              type="button"
              onClick={nextMonth}
              className="p-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white transition-colors cursor-pointer"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* Weekday headers */}
          <div className="grid grid-cols-7 gap-1 text-center">
            {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map((d, i) => (
              <span key={d} className={`text-[10px] font-bold ${i === 0 ? 'text-rose-400' : 'text-slate-400'}`}>
                {d}
              </span>
            ))}
          </div>

          {/* Calendar Day Grid */}
          <div className="grid grid-cols-7 gap-1">
            {/* Blank offset days */}
            {Array.from({ length: firstDayOfWeek }).map((_, i) => (
              <div key={`blank-${i}`} className="h-8" />
            ))}

            {/* Actual Days */}
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const dayNumber = i + 1;
              const dateObj = new Date(viewYear, viewMonth, dayNumber);
              const iso = formatDateISO(dateObj);
              const isSelected = iso === value;
              const isToday = iso === todayStr;
              const isDisabled = (effectiveMin && iso < effectiveMin) || (effectiveMax && iso > effectiveMax);

              return (
                <button
                  key={iso}
                  type="button"
                  disabled={isDisabled}
                  onClick={() => handleSelectDay(dayNumber)}
                  className={`h-8 rounded-lg text-xs font-semibold flex items-center justify-center transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-emerald-500 text-slate-950 font-black shadow-md shadow-emerald-500/30 ring-2 ring-emerald-400'
                      : isToday
                        ? 'bg-slate-800 text-emerald-400 border border-emerald-500/40 hover:bg-slate-750'
                        : isDisabled
                          ? 'text-slate-600 opacity-40 cursor-not-allowed'
                          : 'text-slate-200 hover:bg-slate-850 hover:text-white'
                  }`}
                >
                  {dayNumber}
                </button>
              );
            })}
          </div>

          {/* Direct Date Input for manual picking */}
          <div className="pt-2 border-t border-slate-900 flex items-center justify-between gap-2 text-xs">
            <span className="text-[11px] text-slate-400">Or type date:</span>
            <input
              type="date"
              value={value}
              min={effectiveMin}
              max={effectiveMax}
              onChange={(e) => {
                if (e.target.value) {
                  onChange(e.target.value);
                }
              }}
              className="bg-slate-900 border border-slate-750 rounded-lg px-2 py-1 text-xs text-white font-mono focus:border-emerald-500 focus:outline-none"
            />
          </div>

        </div>
      )}

      {/* Selected date preview card when calendar is closed */}
      {!isCalendarOpen && (
        <div className="flex items-center justify-between px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs">
          <div className="flex items-center space-x-2">
            <CalendarIcon className="w-4 h-4 text-emerald-400" />
            <span className="text-slate-200 font-semibold">{formatReadable(value)}</span>
          </div>
          <span className="text-[11px] font-mono text-slate-400">{value}</span>
        </div>
      )}

    </div>
  );
};
