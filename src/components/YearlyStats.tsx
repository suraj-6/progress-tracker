import React, { useState } from 'react';
import { format, startOfYear, endOfYear, eachMonthOfInterval, startOfMonth, endOfMonth, eachDayOfInterval } from 'date-fns';
import { Calendar, TrendingUp } from 'lucide-react';
import { DatePicker } from './DatePicker';

interface YearlyStatsProps {
  trackerData?: any;
  customTasks?: any[];
}

export const YearlyStats: React.FC<YearlyStatsProps> = () => {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showCalendar, setShowCalendar] = useState(false);

  const year = selectedDate.getFullYear();
  const yearStart = startOfYear(new Date(year, 0, 1));
  const yearEnd = endOfYear(new Date(year, 11, 31));
  const months = eachMonthOfInterval({ start: yearStart, end: yearEnd });

  // Get all daily data
  const getDayData = (date: Date) => {
    const dateKey = format(date, 'yyyy-MM-dd');
    const savedData = localStorage.getItem(`day-summary-${dateKey}`);
    if (savedData) {
      return JSON.parse(savedData);
    }
    return null;
  };

  // Calculate monthly stats
  const monthlyStats = months.map(month => {
    const monthStart = startOfMonth(month);
    const monthEnd = endOfMonth(month);
    const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });
    
    const monthData = daysInMonth
      .map(day => getDayData(day))
      .filter(d => d?.completion !== undefined && d?.completion !== null);
    
    const monthCompletion = monthData.length > 0
      ? monthData.reduce((sum, d) => sum + d.completion, 0) / monthData.length
      : 0;

    return {
      month: format(month, 'MMM'),
      monthNum: month.getMonth(),
      completion: monthCompletion,
      daysTracked: monthData.length
    };
  });

  // Calculate yearly stats
  const yearCompletion = monthlyStats.length > 0
    ? monthlyStats.reduce((sum, m) => sum + m.completion, 0) / monthlyStats.length
    : 0;

  const bestMonth = monthlyStats.reduce((best, current) => {
    return current.completion > (best?.completion || 0) ? current : best;
  }, monthlyStats[0]);

  const monthsWithData = monthlyStats.filter(m => m.daysTracked > 0).length;

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
              title="Select a different year"
            >
              <Calendar className="w-6 h-6 text-blue-400" />
            </button>
            <div>
              <h2 className="text-xl font-semibold">Yearly Progress</h2>
              <p className="text-sm text-slate-400">
                Track your journey throughout the year {year}
              </p>
            </div>
          </div>
          <TrendingUp className="w-6 h-6 text-green-400" />
        </div>

        {/* Year Total Completion */}
        <div className="bg-slate-900 rounded-lg p-6">
          <div className="flex justify-between items-center mb-3">
            <span className="text-slate-400 text-lg">Year Total Completion</span>
            <span className="text-4xl font-bold text-green-400">{yearCompletion.toFixed(0)}%</span>
          </div>
          <div className="h-4 bg-slate-700 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-green-500 to-emerald-500 transition-all duration-500"
              style={{ width: `${yearCompletion}%` }}
            />
          </div>
          <p className="text-sm text-slate-500 mt-3">
            {monthsWithData} months tracked • Outstanding Progress! 🎉
          </p>
        </div>
      </div>

      {/* Monthly Progress Chart */}
      <div className="bg-slate-800 rounded-xl p-6">
        <h3 className="text-lg font-semibold mb-4">Monthly Progress</h3>
        <div className="space-y-3">
          {monthlyStats.map((month) => {
            const hasData = month.daysTracked > 0;
            return (
              <div key={month.monthNum}>
                <div className="flex justify-between items-center mb-1">
                  <span className="text-slate-300 font-medium">{month.month}</span>
                  <div className="text-sm">
                    <span className="font-bold text-green-400">{month.completion.toFixed(0)}%</span>
                    <span className="text-slate-500 ml-2 text-xs">({month.daysTracked} days)</span>
                  </div>
                </div>
                <div className="h-3 bg-slate-700 rounded-full overflow-hidden">
                  <div 
                    className={`h-full transition-all duration-500 ${
                      hasData
                        ? month.completion >= 80
                          ? 'bg-gradient-to-r from-green-500 to-emerald-500'
                          : month.completion >= 50
                            ? 'bg-gradient-to-r from-yellow-500 to-orange-500'
                            : 'bg-gradient-to-r from-orange-500 to-red-500'
                        : 'bg-slate-600'
                    }`}
                    style={{ width: hasData ? `${month.completion}%` : '0%' }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Monthly Statistics Grid */}
      <div className="bg-slate-800 rounded-xl p-6">
        <h3 className="text-lg font-semibold mb-4">Monthly Details</h3>
        <div className="grid grid-cols-3 md:grid-cols-4 gap-2">
          {monthlyStats.map((month) => {
            const completion = month.completion;
            let bgColor = 'bg-slate-700';
            if (completion >= 80) bgColor = 'bg-green-900/40 border-green-500/50';
            else if (completion >= 50) bgColor = 'bg-yellow-900/40 border-yellow-500/50';
            else if (completion > 0) bgColor = 'bg-orange-900/40 border-orange-500/50';

            return (
              <div key={month.monthNum} className={`rounded-lg p-3 border ${bgColor} text-center transition-all`}>
                <div className="text-xs font-bold text-slate-400 mb-1">{month.month}</div>
                <div className={`text-sm font-bold ${
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

      {/* Key Metrics */}
      <div className="bg-slate-800 rounded-xl p-6">
        <h3 className="text-lg font-semibold mb-4">Key Metrics</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <div className="bg-slate-900 rounded-lg p-4">
            <div className="text-slate-400 text-sm mb-1">Year Total %</div>
            <div className="text-3xl font-bold text-green-400">{yearCompletion.toFixed(0)}%</div>
          </div>

          <div className="bg-slate-900 rounded-lg p-4">
            <div className="text-slate-400 text-sm mb-1">Best Month</div>
            <div className="text-2xl font-bold text-blue-400">{bestMonth?.month}</div>
            <div className="text-xs text-slate-500 mt-1">{bestMonth?.completion.toFixed(0)}%</div>
          </div>

          <div className="bg-slate-900 rounded-lg p-4">
            <div className="text-slate-400 text-sm mb-1">Months Tracked</div>
            <div className="text-3xl font-bold text-purple-400">{monthsWithData}/12</div>
          </div>
        </div>
      </div>

      {/* Color Legend */}
      <div className="bg-slate-800 rounded-xl p-6">
        <h3 className="text-lg font-semibold mb-4">Color Legend</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 rounded bg-gradient-to-r from-green-500 to-emerald-500"></div>
            <span className="text-sm text-slate-400">80-100%</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 rounded bg-gradient-to-r from-yellow-500 to-orange-500"></div>
            <span className="text-sm text-slate-400">50-79%</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 rounded bg-gradient-to-r from-orange-500 to-red-500"></div>
            <span className="text-sm text-slate-400">0-49%</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 rounded bg-slate-600"></div>
            <span className="text-sm text-slate-400">No Data</span>
          </div>
        </div>
      </div>
    </div>
  );
};
