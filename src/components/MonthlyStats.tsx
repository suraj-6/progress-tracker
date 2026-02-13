import React, { useState } from 'react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, getDaysInMonth } from 'date-fns';
import { Calendar, TrendingUp } from 'lucide-react';
import { DatePicker } from './DatePicker';

interface MonthlyStatsProps {
  trackerData?: any;
  customTasks?: any[];
}

export const MonthlyStats: React.FC<MonthlyStatsProps> = () => {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showCalendar, setShowCalendar] = useState(false);

  const monthStart = startOfMonth(selectedDate);
  const monthEnd = endOfMonth(selectedDate);
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });
  const totalDays = getDaysInMonth(selectedDate);

  // Fetch all daily data for the month
  const getDayData = (date: Date) => {
    const dateKey = format(date, 'yyyy-MM-dd');
    const savedData = localStorage.getItem(`day-summary-${dateKey}`);
    if (savedData) {
      return JSON.parse(savedData);
    }
    return null;
  };

  const monthData = daysInMonth.map(day => {
    const data = getDayData(day);
    return {
      date: day,
      ...data
    };
  });

  const trackedDays = monthData.filter(d => d?.completion !== undefined && d?.completion !== null).length;
  const completionRates = monthData
    .filter(d => d?.completion !== undefined && d?.completion !== null)
    .map(d => d.completion || 0);
  
  const totalCompletion = completionRates.length > 0 
    ? (completionRates.reduce((a, b) => a + b, 0) / completionRates.length) 
    : 0;
  
  const avgCompletion = totalCompletion;

  // Find best day
  const bestDay = monthData.reduce((best, current) => {
    if (current?.completion && (!best?.completion || current.completion > best.completion)) {
      return current;
    }
    return best;
  }, monthData[0]);

  return (
    <div className="space-y-6">
      {/* Calendar Picker */}
      {showCalendar && (
        <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
          <DatePicker 
            selectedDate={selectedDate} 
            onDateChange={(date: Date) => {
              setSelectedDate(date);
              setShowCalendar(false);
            }} 
          />
        </div>
      )}

      {/* Header */}
      <div className="bg-slate-800 rounded-xl p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setShowCalendar(!showCalendar)}
              className="p-2 hover:bg-slate-700 rounded-lg transition-colors"
              title="Select a different month"
            >
              <Calendar className="w-6 h-6 text-blue-400" />
            </button>
            <div>
              <h2 className="text-xl font-semibold">Monthly Overview</h2>
              <p className="text-sm text-slate-400">
                {format(selectedDate, 'MMMM yyyy')}
              </p>
            </div>
          </div>
          <TrendingUp className="w-6 h-6 text-green-400" />
        </div>

        {/* Total Completion Stats */}
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="bg-slate-900 rounded-lg p-4">
            <div className="text-slate-400 text-sm mb-1">Total Completion %</div>
            <div className="text-3xl font-bold text-green-400">{totalCompletion.toFixed(0)}%</div>
            <div className="h-2 bg-slate-700 rounded-full overflow-hidden mt-2">
              <div 
                className="h-full bg-gradient-to-r from-green-500 to-emerald-500"
                style={{ width: `${totalCompletion}%` }}
              />
            </div>
          </div>

          <div className="bg-slate-900 rounded-lg p-4">
            <div className="text-slate-400 text-sm mb-1">Avg Daily Completion %</div>
            <div className="text-3xl font-bold text-blue-400">{avgCompletion.toFixed(0)}%</div>
            <div className="text-xs text-slate-500 mt-2">
              {trackedDays} days tracked
            </div>
          </div>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="bg-slate-800 rounded-xl p-6">
        <h3 className="text-lg font-semibold mb-4">Calendar View</h3>
        <div className="grid grid-cols-7 gap-2">
          {/* Day headers */}
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
            <div key={day} className="text-center text-sm font-semibold text-slate-400 py-2">
              {day}
            </div>
          ))}

          {/* Empty days at start of month */}
          {Array.from({ length: monthStart.getDay() }).map((_, i) => (
            <div key={`empty-${i}`} className="p-3" />
          ))}

          {/* Calendar days */}
          {daysInMonth.map((day) => {
            const data = getDayData(day);
            const completion = data?.completion || 0;
            const isToday = format(day, 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd');

            let bgColor = 'bg-slate-700';
            if (completion >= 80) bgColor = 'bg-green-900/60 border-green-500/50';
            else if (completion >= 50) bgColor = 'bg-yellow-900/60 border-yellow-500/50';
            else if (completion > 0) bgColor = 'bg-orange-900/60 border-orange-500/50';

            return (
              <div 
                key={day.toString()} 
                className={`rounded-lg p-2 border transition-all ${bgColor} ${isToday ? 'border-blue-500 border-2' : 'border-slate-600'}`}
              >
                <div className="text-xs font-semibold text-slate-300 mb-1">
                  {format(day, 'd')}
                </div>
                <div className={`text-xs font-bold ${
                  completion >= 80 ? 'text-green-400' :
                  completion >= 50 ? 'text-yellow-400' :
                  completion > 0 ? 'text-orange-400' :
                  'text-slate-500'
                }`}>
                  {completion > 0 ? `${completion.toFixed(0)}%` : '-'}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Summary Stats */}
      <div className="bg-slate-800 rounded-xl p-6">
        <h3 className="text-lg font-semibold mb-4">Monthly Summary</h3>
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-slate-900 rounded-lg p-4">
            <div className="text-slate-400 text-sm mb-1">Days Tracked</div>
            <div className="text-2xl font-bold text-blue-400">{trackedDays}/{totalDays}</div>
          </div>

          <div className="bg-slate-900 rounded-lg p-4">
            <div className="text-slate-400 text-sm mb-1">Best Day</div>
            <div className="text-2xl font-bold text-green-400">
              {bestDay?.completion ? `${bestDay.completion.toFixed(0)}%` : 'N/A'}
            </div>
            {bestDay?.date && (
              <div className="text-xs text-slate-500 mt-1">
                {format(bestDay.date, 'MMM d')}
              </div>
            )}
          </div>

          <div className="bg-slate-900 rounded-lg p-4">
            <div className="text-slate-400 text-sm mb-1">Avg Completion</div>
            <div className="text-2xl font-bold text-purple-400">{avgCompletion.toFixed(0)}%</div>
          </div>
        </div>
      </div>

      {/* Color Legend */}
      <div className="bg-slate-800 rounded-xl p-6">
        <h3 className="text-lg font-semibold mb-4">Color Legend</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 rounded bg-green-900/60 border border-green-500/50"></div>
            <span className="text-sm text-slate-400">80-100% Complete</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 rounded bg-yellow-900/60 border border-yellow-500/50"></div>
            <span className="text-sm text-slate-400">50-79% Complete</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 rounded bg-orange-900/60 border border-orange-500/50"></div>
            <span className="text-sm text-slate-400">1-49% Complete</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 rounded bg-slate-700"></div>
            <span className="text-sm text-slate-400">No Data</span>
          </div>
        </div>
      </div>
    </div>
  );
};
