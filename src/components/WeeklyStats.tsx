import React, { useState } from 'react';
import { format, startOfWeek, endOfWeek, eachDayOfInterval, getWeek } from 'date-fns';
import { Calendar, TrendingUp } from 'lucide-react';
import { DatePicker } from './DatePicker';

interface WeeklyStatsProps {
  trackerData?: any;
  customTasks?: any[];
}

export const WeeklyStats: React.FC<WeeklyStatsProps> = () => {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showCalendar, setShowCalendar] = useState(false);

  const weekStart = startOfWeek(selectedDate);
  const weekEnd = endOfWeek(selectedDate);
  const daysInWeek = eachDayOfInterval({ start: weekStart, end: weekEnd });

  // Fetch daily data for each day in the week
  const getDayData = (date: Date) => {
    const dateKey = format(date, 'yyyy-MM-dd');
    const savedData = localStorage.getItem(`day-summary-${dateKey}`);
    if (savedData) {
      return JSON.parse(savedData);
    }
    return null;
  };

  const weekData = daysInWeek.map(day => {
    const data = getDayData(day);
    return {
      date: day,
      ...data
    };
  });

  const completionRates = weekData.map(d => d?.completion || 0);
  const totalCompletion = completionRates.length > 0 ? (completionRates.reduce((a, b) => a + b, 0) / completionRates.length) : 0;
  const completedDays = weekData.filter(d => d?.completion > 0).length;

  // Activity completion calculation
  const allActivityCompletions: { [key: string]: { completed: number; total: number } } = {};
  
  weekData.forEach(day => {
    if (day?.activities) {
      day.activities.forEach((activity: any) => {
        if (!allActivityCompletions[activity.name]) {
          allActivityCompletions[activity.name] = { completed: 0, total: 0 };
        }
        allActivityCompletions[activity.name].total += 1;
        if (activity.completed) {
          allActivityCompletions[activity.name].completed += 1;
        }
      });
    }
  });

  const activityStats = Object.entries(allActivityCompletions).map(([name, stats]) => ({
    name,
    completion: stats.total > 0 ? (stats.completed / stats.total) * 100 : 0
  }));

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
              title="Select a different week"
            >
              <Calendar className="w-6 h-6 text-blue-400" />
            </button>
            <div>
              <h2 className="text-xl font-semibold">Weekly Overview</h2>
              <p className="text-sm text-slate-400">
                {format(weekStart, 'MMM d')} - {format(weekEnd, 'MMM d, yyyy')} (Week {getWeek(selectedDate)})
              </p>
            </div>
          </div>
          <TrendingUp className="w-6 h-6 text-green-400" />
        </div>

        {/* Total Completion Rate */}
        <div className="bg-slate-900 rounded-lg p-4 mb-4">
          <div className="flex justify-between items-center mb-2">
            <span className="text-slate-400">Total Completion Rate</span>
            <span className="text-2xl font-bold text-green-400">{totalCompletion.toFixed(0)}%</span>
          </div>
          <div className="h-4 bg-slate-700 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-green-500 to-emerald-500 transition-all duration-500"
              style={{ width: `${totalCompletion}%` }}
            />
          </div>
        </div>

        {/* Completed Days */}
        <div className="text-sm text-slate-400">
          <span className="font-semibold text-green-400">{completedDays}</span> out of 7 days tracked
        </div>
      </div>

      {/* Daily Progress Grid */}
      <div className="bg-slate-800 rounded-xl p-6">
        <h3 className="text-lg font-semibold mb-4">Daily Progress</h3>
        <div className="grid grid-cols-7 gap-2">
          {daysInWeek.map((day) => {
            const data = getDayData(day);
            const completion = data?.completion || 0;
            
            let bgColor = 'bg-slate-700';
            if (completion >= 80) bgColor = 'bg-green-900/40 border-green-500/50';
            else if (completion >= 50) bgColor = 'bg-yellow-900/40 border-yellow-500/50';
            else if (completion > 0) bgColor = 'bg-orange-900/40 border-orange-500/50';
            
            return (
              <div key={day.toString()} className={`rounded-lg p-3 border ${bgColor} text-center transition-all`}>
                <div className="text-xs font-semibold text-slate-300 mb-1">
                  {format(day, 'EEE')}
                </div>
                <div className="text-sm font-bold mb-1">{format(day, 'd')}</div>
                <div className={`text-lg font-bold ${
                  completion >= 80 ? 'text-green-400' :
                  completion >= 50 ? 'text-yellow-400' :
                  completion > 0 ? 'text-orange-400' :
                  'text-slate-500'
                }`}>
                  {completion.toFixed(0)}%
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Activity Completion Rate */}
      <div className="bg-slate-800 rounded-xl p-6">
        <h3 className="text-lg font-semibold mb-4">Activity Completion Rate</h3>
        <div className="space-y-3">
          {activityStats.length > 0 ? (
            activityStats.map((activity) => (
              <div key={activity.name}>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-slate-300">{activity.name}</span>
                  <span className="font-semibold text-green-400">{activity.completion.toFixed(0)}%</span>
                </div>
                <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-blue-500 to-cyan-500 transition-all duration-500"
                    style={{ width: `${activity.completion}%` }}
                  />
                </div>
              </div>
            ))
          ) : (
            <p className="text-slate-400 text-center py-4">No activity data yet. Complete some tasks to see activity tracking!</p>
          )}
        </div>
      </div>

      {/* Activity Heatmap */}
      <div className="bg-slate-800 rounded-xl p-6">
        <h3 className="text-lg font-semibold mb-4">Activity Heatmap</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-slate-400">
                <th className="text-left py-2 px-2">Activity</th>
                {daysInWeek.map((day) => (
                  <th key={day.toString()} className="text-center py-2 px-1">
                    {format(day, 'EEE')}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {activityStats.map((activity) => (
                <tr key={activity.name} className="border-t border-slate-700">
                  <td className="py-2 px-2 text-slate-300">{activity.name}</td>
                  {daysInWeek.map((day) => {
                    const data = getDayData(day);
                    const activityData = data?.activities?.find((a: any) => a.name === activity.name);
                    const isCompleted = activityData?.completed || false;
                    
                    return (
                      <td key={day.toString()} className="text-center py-2">
                        <div className={`inline-block w-6 h-6 rounded-lg transition-colors ${
                          isCompleted ? 'bg-green-500/40 border border-green-500' : 'bg-slate-700 border border-slate-600'
                        }`}>
                          {isCompleted && <span className="text-green-400 text-xs">✓</span>}
                        </div>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {activityStats.length === 0 && (
          <p className="text-slate-400 text-center py-4">No activities to display. Start tracking to see heatmap!</p>
        )}
      </div>
    </div>
  );
};
