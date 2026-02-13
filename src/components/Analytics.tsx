import { useMemo } from 'react';
import { format, parseISO } from 'date-fns';

interface Activity {
  id: string;
  name: string;
  hours: number;
  category: string;
  color: string;
  sessions: number;
  focusTime: number;
  breakTime: number;
}

interface AnalyticsProps {
  trackerData: Record<string, Record<string, boolean>>;
  customTasks: Activity[];
}

export function Analytics({ trackerData, customTasks }: AnalyticsProps) {
  const ACTIVITIES = customTasks;
  const allDates = Object.keys(trackerData).sort();

  const stats = useMemo(() => {
    let totalDaysTracked = 0;
    let totalTasksCompleted = 0;
    let maxStreak = 0;
    let currentStreak = 0;

    const activityStats: Record<string, { completed: number; attempted: number; hours: number }> = {};
    const categoryStats: Record<string, { completed: number; hours: number }> = {};

    ACTIVITIES.forEach((activity) => {
      activityStats[activity.id] = { completed: 0, attempted: 0, hours: 0 };
      if (!categoryStats[activity.category]) {
        categoryStats[activity.category] = { completed: 0, hours: 0 };
      }
    });

    allDates.forEach((date) => {
      const dayActivities = trackerData[date];
      const completed = Object.values(dayActivities).filter(Boolean).length;

      if (Object.keys(dayActivities).length > 0) {
        totalDaysTracked++;
        totalTasksCompleted += completed;

        if (completed === ACTIVITIES.length) {
          currentStreak++;
          maxStreak = Math.max(maxStreak, currentStreak);
        } else {
          currentStreak = 0;
        }

        Object.entries(dayActivities).forEach(([actId, completed]) => {
          const activity = ACTIVITIES.find((a) => a.id === actId);
          if (activity) {
            if (completed) {
              activityStats[actId].completed++;
              categoryStats[activity.category].completed++;
              categoryStats[activity.category].hours += activity.hours;
            }
            activityStats[actId].attempted++;
            activityStats[actId].hours += activity.hours;
          }
        });
      }
    });

    return { totalDaysTracked, totalTasksCompleted, maxStreak, activityStats, categoryStats };
  }, [trackerData, allDates]);

  const overallCompletion = stats.totalTasksCompleted > 0
    ? Math.round((stats.totalTasksCompleted / (stats.totalDaysTracked * ACTIVITIES.length)) * 100)
    : 0;

  const avgTasksPerDay = stats.totalDaysTracked > 0 ? (stats.totalTasksCompleted / stats.totalDaysTracked).toFixed(1) : 0;

  return (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="rounded-xl border border-slate-700 bg-slate-800/50 p-6 backdrop-blur">
        <h2 className="mb-4 text-2xl font-bold text-white">Analytics & Insights</h2>
        <div className="grid gap-4 md:grid-cols-4">
          <div className="rounded-lg bg-gradient-to-br from-blue-600 to-blue-500 p-4">
            <p className="text-sm text-slate-100">Days Tracked</p>
            <p className="mt-2 text-3xl font-bold text-white">{stats.totalDaysTracked}</p>
          </div>
          <div className="rounded-lg bg-gradient-to-br from-purple-600 to-purple-500 p-4">
            <p className="text-sm text-slate-100">Tasks Completed</p>
            <p className="mt-2 text-3xl font-bold text-white">{stats.totalTasksCompleted}</p>
          </div>
          <div className="rounded-lg bg-gradient-to-br from-orange-600 to-orange-500 p-4">
            <p className="text-sm text-slate-100">Overall Completion</p>
            <p className="mt-2 text-3xl font-bold text-white">{overallCompletion}%</p>
          </div>
          <div className="rounded-lg bg-gradient-to-br from-green-600 to-green-500 p-4">
            <p className="text-sm text-slate-100">Best Streak</p>
            <p className="mt-2 text-3xl font-bold text-white">{stats.maxStreak} days</p>
          </div>
        </div>
      </div>

      {/* Daily Average */}
      <div className="rounded-xl border border-slate-700 bg-slate-800/50 p-6 backdrop-blur">
        <h3 className="mb-4 text-lg font-semibold text-white">Daily Performance</h3>
        <div className="rounded-lg border border-slate-600 bg-slate-700/30 p-6">
          <div className="text-center">
            <p className="text-sm text-slate-400">Average Tasks Per Day</p>
            <p className="mt-2 text-5xl font-bold text-blue-400">{avgTasksPerDay}</p>
            <p className="mt-2 text-sm text-slate-400">out of {ACTIVITIES.length} tasks</p>
          </div>
        </div>
      </div>

      {/* Activity Success Rate */}
      <div className="rounded-xl border border-slate-700 bg-slate-800/50 p-6 backdrop-blur">
        <h3 className="mb-4 text-lg font-semibold text-white">Activity Success Rate</h3>
        <div className="space-y-4">
          {ACTIVITIES.map((activity) => {
            const stat = stats.activityStats[activity.id];
            const successRate = stat.attempted > 0 ? Math.round((stat.completed / stat.attempted) * 100) : 0;
            return (
              <div key={activity.id} className="rounded-lg bg-slate-700/30 p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <div className={`h-3 w-3 rounded-full ${activity.color}`} />
                    <span className="text-slate-300">{activity.name}</span>
                  </div>
                  <span className="font-bold text-slate-100">{successRate}%</span>
                </div>
                <div className="h-2 w-full rounded-full bg-slate-600">
                  <div
                    className={`h-full rounded-full transition-all ${activity.color}`}
                    style={{ width: `${successRate}%` }}
                  />
                </div>
                <p className="mt-2 text-xs text-slate-500">
                  {stat.completed}/{stat.attempted} days completed
                </p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Category Analytics */}
      <div className="rounded-xl border border-slate-700 bg-slate-800/50 p-6 backdrop-blur">
        <h3 className="mb-4 text-lg font-semibold text-white">Category Insights</h3>
        <div className="grid gap-4 md:grid-cols-2">
          {Object.entries(stats.categoryStats).map(([category, stat]) => {
            const categoryActivities = ACTIVITIES.filter((a) => a.category === category);
            const possibleHours = categoryActivities.reduce((sum, a) => sum + a.hours, 0) * stats.totalDaysTracked;
            const completionRate = possibleHours > 0 ? Math.round((stat.hours / possibleHours) * 100) : 0;

            return (
              <div key={category} className="rounded-lg border border-slate-600 bg-slate-700/30 p-4">
                <p className="text-sm font-semibold text-slate-300 mb-3">
                  {category === 'Work' && '💼'} {category === 'Learning' && '📚'} {category === 'Health' && '💪'} {category === 'Leisure' && '🎮'} {category}
                </p>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-400">Hours Completed</span>
                    <span className="font-bold text-slate-100">{stat.hours}h</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-400">Completion Rate</span>
                    <span className="font-bold text-slate-100">{completionRate}%</span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-slate-600">
                    <div
                      className="h-full rounded-full bg-blue-500 transition-all"
                      style={{ width: `${completionRate}%` }}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Top Performing Days */}
      <div className="rounded-xl border border-slate-700 bg-slate-800/50 p-6 backdrop-blur">
        <h3 className="mb-4 text-lg font-semibold text-white">Top Days</h3>
        <div className="space-y-2 max-h-64 overflow-y-auto">
          {allDates
            .map((date) => ({
              date,
              completed: Object.values(trackerData[date]).filter(Boolean).length,
            }))
            .sort((a: any, b: any) => b.completed - a.completed)
            .slice(0, 5)
            .map((day: any, idx: number) => {
              const completionRate = Math.round((day.completed / ACTIVITIES.length) * 100);
              return (
                <div key={idx} className="flex items-center justify-between rounded-lg bg-slate-700/30 p-3">
                  <span className="text-sm text-slate-300">
                    {format(parseISO(day.date), 'MMM d, yyyy')}
                  </span>
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-24 rounded-full bg-slate-600">
                      <div
                        className="h-full rounded-full bg-green-500 transition-all"
                        style={{ width: `${completionRate}%` }}
                      />
                    </div>
                    <span className="text-sm font-bold text-slate-200 w-12 text-right">
                      {completionRate}%
                    </span>
                  </div>
                </div>
              );
            })}
        </div>
      </div>

      {/* Recommendations */}
      <div className="rounded-xl border border-slate-700 bg-slate-800/50 p-6 backdrop-blur">
        <h3 className="mb-4 text-lg font-semibold text-white">💡 Recommendations</h3>
        <div className="space-y-3">
          {ACTIVITIES.map((activity) => {
            const stat = stats.activityStats[activity.id];
            const successRate = stat.attempted > 0 ? Math.round((stat.completed / stat.attempted) * 100) : 0;

            if (successRate < 50 && stat.attempted > 0) {
              return (
                <div key={activity.id} className="rounded-lg border border-yellow-500 bg-yellow-500/10 p-3">
                  <p className="text-sm text-yellow-200">
                    ⚠️ <strong>{activity.name}</strong> completion rate is low ({successRate}%). Consider adjusting your schedule or breaking it into smaller tasks.
                  </p>
                </div>
              );
            }
            return null;
          }).filter(Boolean)}

          {stats.totalDaysTracked > 0 && overallCompletion >= 75 && (
            <div className="rounded-lg border border-green-500 bg-green-500/10 p-3">
              <p className="text-sm text-green-200">
                ✨ Excellent progress! You're maintaining {overallCompletion}% completion rate. Keep it up!
              </p>
            </div>
          )}

          {stats.maxStreak >= 7 && (
            <div className="rounded-lg border border-purple-500 bg-purple-500/10 p-3">
              <p className="text-sm text-purple-200">
                🔥 Amazing streak! You've achieved {stats.maxStreak} consecutive days of perfect completion!
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
