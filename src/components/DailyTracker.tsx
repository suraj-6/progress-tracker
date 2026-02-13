import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { ActivityGrid, Activity } from './ActivityGrid';
import { Calendar, Target, Clock, CheckCircle2 } from 'lucide-react';
import { DatePicker } from './DatePicker';

interface DailyTrackerProps {
  selectedDate: Date;
  onDateChange: (date: Date) => void;
  customTasks?: any[];
  onTaskDelete?: (taskId: string) => void;
}

export const DailyTracker: React.FC<DailyTrackerProps> = ({ selectedDate, onDateChange, customTasks }) => {
  const [showCalendar, setShowCalendar] = useState(false);
  const [showCompletionPopup, setShowCompletionPopup] = useState(false);

  const getDefaultActivities = (): Activity[] => [
    { 
      id: 'internship1', 
      name: 'Internship 1', 
      category: 'work', 
      hours: 2, 
      completed: false, 
      icon: '💼',
      color: 'from-blue-500 to-cyan-500',
      hasTimer: true,
      subtasks: [
        { id: 'int1-s1', name: 'Hour 1 - Focus Session', duration: 55, completed: false },
        { id: 'int1-s2', name: 'Hour 2 - Focus Session', duration: 55, completed: false }
      ]
    },
    { 
      id: 'internship2', 
      name: 'Internship 2', 
      category: 'work', 
      hours: 2, 
      completed: false, 
      icon: '🏢',
      color: 'from-blue-500 to-cyan-500',
      hasTimer: true,
      subtasks: [
        { id: 'int2-s1', name: 'Hour 1 - Focus Session', duration: 55, completed: false },
        { id: 'int2-s2', name: 'Hour 2 - Focus Session', duration: 55, completed: false }
      ]
    },
    { 
      id: 'ml-internship', 
      name: 'ML Internship', 
      category: 'work', 
      hours: 2, 
      completed: false, 
      icon: '🤖',
      color: 'from-blue-500 to-cyan-500',
      hasTimer: true,
      subtasks: [
        { id: 'ml-s1', name: 'Hour 1 - Focus Session', duration: 55, completed: false },
        { id: 'ml-s2', name: 'Hour 2 - Focus Session', duration: 55, completed: false }
      ]
    },
    { 
      id: 'backlog', 
      name: 'Backlog Coverup', 
      category: 'work', 
      hours: 2, 
      completed: false, 
      icon: '📋',
      color: 'from-blue-500 to-cyan-500',
      hasTimer: true,
      subtasks: [
        { id: 'back-s1', name: 'Hour 1 - Focus Session', duration: 55, completed: false },
        { id: 'back-s2', name: 'Hour 2 - Focus Session', duration: 55, completed: false }
      ]
    },
    { 
      id: 'dsa', 
      name: 'Learn DSA', 
      category: 'learning', 
      hours: 1.5, 
      completed: false, 
      icon: '📚',
      color: 'from-purple-500 to-pink-500',
      hasTimer: true,
      subtasks: [
        { id: 'dsa-s1', name: 'Session 1 - Focus (45 min)', duration: 45, completed: false },
        { id: 'dsa-s2', name: 'Session 2 - Focus (45 min)', duration: 45, completed: false }
      ]
    },
    { 
      id: 'quant-finance', 
      name: 'Quantitative Finance', 
      category: 'learning', 
      hours: 1.5, 
      completed: false, 
      icon: '📈',
      color: 'from-purple-500 to-pink-500',
      hasTimer: true,
      subtasks: [
        { id: 'qf-s1', name: 'Session 1 - Focus (45 min)', duration: 45, completed: false },
        { id: 'qf-s2', name: 'Session 2 - Focus (45 min)', duration: 45, completed: false }
      ]
    },
    { 
      id: 'interview-prep', 
      name: 'Interview Prep (CI/CD, GitHub, OOP C#)', 
      category: 'learning', 
      hours: 1.5, 
      completed: false, 
      icon: '🎯',
      color: 'from-purple-500 to-pink-500',
      hasTimer: true,
      subtasks: [
        { id: 'ip-s1', name: 'Session 1 - Focus (45 min)', duration: 45, completed: false },
        { id: 'ip-s2', name: 'Session 2 - Focus (45 min)', duration: 45, completed: false }
      ]
    },
    { 
      id: 'dotnet', 
      name: '.NET Framework', 
      category: 'learning', 
      hours: 1.5, 
      completed: false, 
      icon: '⚙️',
      color: 'from-purple-500 to-pink-500',
      hasTimer: true,
      subtasks: [
        { id: 'net-s1', name: 'Session 1 - Focus (45 min)', duration: 45, completed: false },
        { id: 'net-s2', name: 'Session 2 - Focus (45 min)', duration: 45, completed: false }
      ]
    },
    { 
      id: 'workout', 
      name: 'Workout', 
      category: 'health', 
      hours: 1, 
      completed: false, 
      icon: '💪',
      color: 'from-green-500 to-emerald-500'
    },
    { 
      id: 'sleep', 
      name: 'Sleep', 
      category: 'health', 
      hours: 7, 
      completed: false, 
      icon: '😴',
      color: 'from-indigo-500 to-purple-500'
    },
    { 
      id: 'freetime', 
      name: 'Free Time (Mobile/Rest)', 
      category: 'leisure', 
      hours: 1.5, 
      completed: false, 
      icon: '🎮',
      color: 'from-orange-500 to-red-500'
    },
  ];

  const convertCustomTasksToActivities = (tasks: any[]): Activity[] => {
    return tasks.map(task => {
      const categoryColors = {
        work: 'from-blue-500 to-cyan-500',
        learning: 'from-purple-500 to-pink-500',
        health: 'from-green-500 to-emerald-500',
        leisure: 'from-orange-500 to-red-500'
      };

      const activity: Activity = {
        id: task.id,
        name: task.name,
        category: task.category,
        hours: task.totalHours,
        completed: false,
        icon: task.icon,
        color: categoryColors[task.category as keyof typeof categoryColors],
        hasTimer: task.focusMinutes > 0 && task.sessions > 0,
        subtasks: undefined
      };

      if (task.sessions > 0 && task.focusMinutes > 0) {
        activity.subtasks = Array.from({ length: task.sessions }, (_, i) => ({
          id: `${task.id}-s${i + 1}`,
          name: `Session ${i + 1} - Focus (${task.focusMinutes} min)`,
          duration: task.focusMinutes,
          completed: false
        }));
      }

      return activity;
    });
  };

  const getInitialActivities = (): Activity[] => {
    if (customTasks && customTasks.length > 0) {
      return convertCustomTasksToActivities(customTasks);
    }
    return getDefaultActivities();
  };

  const [activities, setActivities] = useState<Activity[]>(getInitialActivities());

  useEffect(() => {
    if (customTasks && customTasks.length > 0) {
      const dateKey = format(selectedDate, 'yyyy-MM-dd');
      const savedData = localStorage.getItem(`daily-activities-${dateKey}`);
      
      if (savedData) {
        const savedActivities = JSON.parse(savedData);
        const newActivities = convertCustomTasksToActivities(customTasks);
        
        const mergedActivities = newActivities.map(newActivity => {
          const savedActivity = savedActivities.find((sa: Activity) => sa.id === newActivity.id);
          if (savedActivity) {
            return {
              ...newActivity,
              completed: savedActivity.completed,
              subtasks: newActivity.subtasks?.map((subtask, idx) => ({
                ...subtask,
                completed: savedActivity.subtasks?.[idx]?.completed || false
              }))
            };
          }
          return newActivity;
        });
        
        setActivities(mergedActivities);
      } else {
        setActivities(convertCustomTasksToActivities(customTasks));
      }
    }
  }, [customTasks, selectedDate]);

  useEffect(() => {
    const dateKey = format(selectedDate, 'yyyy-MM-dd');
    const savedData = localStorage.getItem(`daily-activities-${dateKey}`);
    
    if (savedData) {
      const savedActivities = JSON.parse(savedData);
      if (customTasks && customTasks.length > 0) {
        const newActivities = convertCustomTasksToActivities(customTasks);
        const mergedActivities = newActivities.map(newActivity => {
          const savedActivity = savedActivities.find((sa: Activity) => sa.id === newActivity.id);
          if (savedActivity) {
            return {
              ...newActivity,
              completed: savedActivity.completed,
              subtasks: newActivity.subtasks?.map((subtask, idx) => ({
                ...subtask,
                completed: savedActivity.subtasks?.[idx]?.completed || false
              }))
            };
          }
          return newActivity;
        });
        setActivities(mergedActivities);
      } else {
        setActivities(savedActivities);
      }
    } else {
      setActivities(getInitialActivities());
    }
  }, [selectedDate]);

  const handleToggle = (activityId: string, subtaskId?: string) => {
    const updatedActivities = activities.map(activity => {
      if (activity.id === activityId) {
        if (subtaskId && activity.subtasks) {
          const updatedSubtasks = activity.subtasks.map(subtask => 
            subtask.id === subtaskId ? { ...subtask, completed: !subtask.completed } : subtask
          );
          
          const allSubtasksCompleted = updatedSubtasks.every(s => s.completed);
          
          return { 
            ...activity, 
            subtasks: updatedSubtasks,
            completed: allSubtasksCompleted 
          };
        } else {
          return { ...activity, completed: !activity.completed };
        }
      }
      return activity;
    });

    setActivities(updatedActivities);
    
    const dateKey = format(selectedDate, 'yyyy-MM-dd');
    localStorage.setItem(`daily-activities-${dateKey}`, JSON.stringify(updatedActivities));
  };

  const completedCount = activities.filter(a => a.completed).length;
  const totalCount = activities.length;
  const completionPercentage = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;

  const totalHours = activities.reduce((sum, activity) => sum + activity.hours, 0);
  const categories = [
    { name: 'Work', hours: activities.filter(a => a.category === 'work').reduce((sum, a) => sum + a.hours, 0), color: 'text-blue-400' },
    { name: 'Learning', hours: activities.filter(a => a.category === 'learning').reduce((sum, a) => sum + a.hours, 0), color: 'text-purple-400' },
    { name: 'Health', hours: activities.filter(a => a.category === 'health').reduce((sum, a) => sum + a.hours, 0), color: 'text-green-400' },
    { name: 'Leisure', hours: activities.filter(a => a.category === 'leisure').reduce((sum, a) => sum + a.hours, 0), color: 'text-orange-400' },
  ];

  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }, []);

  const handleDoneForDay = () => {
    const dateKey = format(selectedDate, 'yyyy-MM-dd');
    const dayData = {
      date: dateKey,
      completion: completionPercentage,
      activitiesCount: totalCount,
      completedCount: completedCount,
      activities: activities
    };
    localStorage.setItem(`day-summary-${dateKey}`, JSON.stringify(dayData));
    setShowCompletionPopup(true);
    
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification('Day Completed! 🎉', {
        body: `You completed ${completionPercentage.toFixed(0)}% of your daily tasks!`,
        tag: 'day-complete'
      });
    }
    
    setTimeout(() => setShowCompletionPopup(false), 3000);
  };

  return (
    <div className="space-y-6">
      {showCalendar && (
        <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
          <DatePicker 
            selectedDate={selectedDate} 
            onDateChange={(date: Date) => {
              onDateChange(date);
              setShowCalendar(false);
            }} 
          />
        </div>
      )}

      {showCompletionPopup && (
        <div className="fixed top-4 right-4 bg-green-900 border border-green-500 rounded-lg p-4 z-50 animate-pulse">
          <div className="flex items-center space-x-2">
            <CheckCircle2 className="w-6 h-6 text-green-400" />
            <div>
              <p className="font-semibold text-green-400">Day Summary Saved!</p>
              <p className="text-sm text-green-300">{completionPercentage.toFixed(0)}% completion</p>
            </div>
          </div>
        </div>
      )}

      <div className="bg-slate-800 rounded-xl p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setShowCalendar(!showCalendar)}
              className="p-2 hover:bg-slate-700 rounded-lg transition-colors"
              title="Select a different date"
            >
              <Calendar className="w-6 h-6 text-blue-400" />
            </button>
            <h2 className="text-xl font-semibold">{format(selectedDate, 'EEEE, MMMM d, yyyy')}</h2>
          </div>
          <div className="flex items-center space-x-2">
            <Target className="w-5 h-5 text-green-400" />
            <span className="text-sm text-slate-400">
              {completedCount}/{totalCount} completed
            </span>
          </div>
        </div>

        <div className="mb-6">
          <div className="flex justify-between text-sm mb-2">
            <span className="text-slate-400">Daily Progress</span>
            <span className="font-semibold text-green-400">{completionPercentage.toFixed(0)}%</span>
          </div>
          <div className="h-3 bg-slate-700 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-green-500 to-emerald-500 transition-all duration-500"
              style={{ width: `${completionPercentage}%` }}
            />
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          {categories.map(category => (
            <div key={category.name} className="bg-slate-900 rounded-lg p-3">
              <div className={`text-xs ${category.color} mb-1`}>{category.name}</div>
              <div className="text-lg font-bold">{category.hours}h</div>
            </div>
          ))}
        </div>

        <div className="flex items-center justify-center text-sm text-slate-500">
          <Clock className="w-4 h-4 mr-1" />
          Total: {totalHours} hours allocated
        </div>
      </div>

      <ActivityGrid activities={activities} onToggle={handleToggle} />
      
      <button
        onClick={handleDoneForDay}
        className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-bold py-4 rounded-xl transition-all duration-300 text-lg shadow-lg hover:shadow-green-500/50"
      >
        ✅ Done for the Day
      </button>

      {customTasks && customTasks.length > 0 && (
        <div className="bg-slate-800/50 rounded-lg p-4 text-center">
          <p className="text-sm text-slate-400">
            📝 Using custom schedule • Go to <span className="text-purple-400">Settings</span> to modify tasks
          </p>
        </div>
      )}
    </div>
  );
};
