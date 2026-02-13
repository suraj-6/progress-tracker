import { useState } from 'react';
import { format, setMonth, setYear, startOfMonth, endOfMonth, eachDayOfInterval, getDay, addMonths, subMonths } from 'date-fns';

interface DatePickerProps {
  selectedDate: Date;
  onDateChange: (date: Date) => void;
}

export function DatePicker({ selectedDate, onDateChange }: DatePickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [viewDate, setViewDate] = useState(selectedDate);

  const monthStart = startOfMonth(viewDate);
  const monthEnd = endOfMonth(viewDate);
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd });
  
  const startDayOfWeek = getDay(monthStart);
  const emptyDays = Array(startDayOfWeek).fill(null);

  const years = Array.from({ length: 10 }, (_, i) => 2020 + i);
  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const handleDateSelect = (date: Date) => {
    onDateChange(date);
    setIsOpen(false);
  };

  const handleMonthChange = (monthIndex: number) => {
    setViewDate(setMonth(viewDate, monthIndex));
  };

  const handleYearChange = (year: number) => {
    setViewDate(setYear(viewDate, year));
  };

  return (
    <div className="relative">
      {/* Calendar Icon Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 rounded-lg bg-slate-700 px-4 py-2 text-sm text-slate-300 transition-colors hover:bg-slate-600"
        title="Select Date"
      >
        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
        <span>{format(selectedDate, 'MMM d, yyyy')}</span>
      </button>

      {/* Calendar Popup */}
      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />
          
          {/* Calendar Card */}
          <div className="absolute right-0 top-12 z-50 w-80 rounded-xl border border-slate-600 bg-slate-800 p-4 shadow-2xl">
            {/* Month/Year Selectors */}
            <div className="mb-4 grid grid-cols-2 gap-2">
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setViewDate(subMonths(viewDate, 1))}
                  className="rounded-md bg-slate-700 p-1 hover:bg-slate-600"
                >
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                <select
                  value={viewDate.getMonth()}
                  onChange={(e) => handleMonthChange(Number(e.target.value))}
                  className="flex-1 rounded-md bg-slate-700 px-2 py-1 text-sm text-slate-300 hover:bg-slate-600"
                >
                  {months.map((month, idx) => (
                    <option key={idx} value={idx}>{month}</option>
                  ))}
                </select>
              </div>
              
              <div className="flex items-center gap-1">
                <select
                  value={viewDate.getFullYear()}
                  onChange={(e) => handleYearChange(Number(e.target.value))}
                  className="flex-1 rounded-md bg-slate-700 px-2 py-1 text-sm text-slate-300 hover:bg-slate-600"
                >
                  {years.map((year) => (
                    <option key={year} value={year}>{year}</option>
                  ))}
                </select>
                <button
                  onClick={() => setViewDate(addMonths(viewDate, 1))}
                  className="rounded-md bg-slate-700 p-1 hover:bg-slate-600"
                >
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Calendar Grid */}
            <div className="grid grid-cols-7 gap-1">
              {/* Day Headers */}
              {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map((day) => (
                <div key={day} className="py-2 text-center text-xs font-semibold text-slate-400">
                  {day}
                </div>
              ))}
              
              {/* Empty days */}
              {emptyDays.map((_, idx) => (
                <div key={`empty-${idx}`} className="p-2" />
              ))}
              
              {/* Calendar days */}
              {days.map((day) => {
                const isSelected = format(day, 'yyyy-MM-dd') === format(selectedDate, 'yyyy-MM-dd');
                const isToday = format(day, 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd');
                
                return (
                  <button
                    key={day.toString()}
                    onClick={() => handleDateSelect(day)}
                    className={`
                      rounded-md p-2 text-sm transition-colors
                      ${isSelected 
                        ? 'bg-blue-600 text-white font-bold' 
                        : isToday 
                          ? 'bg-blue-500/20 text-blue-400 font-semibold'
                          : 'text-slate-300 hover:bg-slate-700'
                      }
                    `}
                  >
                    {format(day, 'd')}
                  </button>
                );
              })}
            </div>

            {/* Quick Actions */}
            <div className="mt-4 flex gap-2">
              <button
                onClick={() => handleDateSelect(new Date())}
                className="flex-1 rounded-md bg-blue-600 px-3 py-2 text-sm font-semibold text-white hover:bg-blue-700"
              >
                Today
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="flex-1 rounded-md bg-slate-700 px-3 py-2 text-sm text-slate-300 hover:bg-slate-600"
              >
                Close
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
