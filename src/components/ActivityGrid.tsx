import React, { useState } from 'react';
import { Timer } from './Timer';
import { SwipeableTask } from './SwipeableTask';
import { ChevronDown, ChevronUp, Clock, Zap } from 'lucide-react';

export interface Activity {
  id: string;
  name: string;
  category: 'work' | 'learning' | 'health' | 'leisure';
  hours: number;
  completed: boolean;
  icon: string;
  color: string;
  hasTimer?: boolean;
  subtasks?: Subtask[];
}

interface Subtask {
  id: string;
  name: string;
  duration: number;
  completed: boolean;
}

interface ActivityGridProps {
  activities: Activity[];
  onToggle: (activityId: string, subtaskId?: string) => void;
}

export const ActivityGrid: React.FC<ActivityGridProps> = ({ activities, onToggle }) => {
  const [expandedActivities, setExpandedActivities] = useState<Set<string>>(new Set());

  const toggleExpanded = (activityId: string) => {
    const newExpanded = new Set(expandedActivities);
    if (newExpanded.has(activityId)) {
      newExpanded.delete(activityId);
    } else {
      newExpanded.add(activityId);
    }
    setExpandedActivities(newExpanded);
  };

  const handleTimerComplete = (timerId: string) => {
    showPopupNotification(`Timer completed for ${timerId}!`);
  };

  const showPopupNotification = (message: string) => {
    const popup = document.createElement('div');
    popup.className = 'fixed bottom-4 right-4 bg-gradient-to-r from-green-500 to-emerald-500 text-white px-6 py-4 rounded-xl shadow-2xl z-50 animate-slide-in border border-green-400/30';
    popup.innerHTML = `
      <div class="flex items-center space-x-3">
        <svg class="w-6 h-6 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
        </svg>
        <span class="font-semibold text-sm">${message}</span>
      </div>
    `;
    document.body.appendChild(popup);
    
    setTimeout(() => {
      popup.classList.add('animate-slide-out');
      setTimeout(() => {
        document.body.removeChild(popup);
      }, 300);
    }, 3000);
  };

  const categories = [
    { name: 'work', label: '💼 Work', color: 'from-blue-500 to-cyan-500' },
    { name: 'learning', label: '📚 Learning', color: 'from-purple-500 to-pink-500' },
    { name: 'health', label: '🏥 Health', color: 'from-green-500 to-emerald-500' },
    { name: 'leisure', label: '🎮 Leisure', color: 'from-orange-500 to-red-500' },
  ];

  return (
    <div className="space-y-8">
      <style>{`
        @keyframes slide-in {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
        @keyframes slide-out {
          from {
            transform: translateX(0);
            opacity: 1;
          }
          to {
            transform: translateX(100%);
            opacity: 0;
          }
        }
        .animate-slide-in {
          animation: slide-in 0.3s ease-out;
        }
        .animate-slide-out {
          animation: slide-out 0.3s ease-out;
        }
      `}</style>
      
      {categories.map((category) => {
        const categoryActivities = activities.filter((a) => a.category === category.name);
        if (categoryActivities.length === 0) return null;

        return (
          <div key={category.name} className="space-y-4">
            <div className="flex items-center space-x-2 mb-6">
              <div className={`h-1 w-6 rounded-full bg-gradient-to-r ${category.color}`} />
              <h3 className={`text-sm font-bold bg-gradient-to-r ${category.color} bg-clip-text text-transparent uppercase tracking-wider`}>
                {category.label}
              </h3>
              <span className="text-xs text-slate-500 ml-auto">
                {categoryActivities.filter(a => a.completed).length}/{categoryActivities.length} completed
              </span>
            </div>
            
            <div className="grid grid-cols-1 gap-4">
              {categoryActivities.map((activity) => {
                const isExpanded = expandedActivities.has(activity.id);
                const hasSubtasks = activity.subtasks && activity.subtasks.length > 0;
                const subtasksCompleted = activity.subtasks?.filter(s => s.completed).length || 0;
                
                return (
                  <div key={activity.id} className="space-y-3">
                    <SwipeableTask
                      onComplete={() => !activity.completed && onToggle(activity.id)}
                      onDelete={() => {
                        // For now, we'll just toggle the task since we don't have a delete handler
                        // In production, this would call a proper delete function
                        console.log('Delete task:', activity.name);
                      }}
                      isCompleted={activity.completed}
                      taskName={activity.name}
                    >
                      <div
                        className={`relative overflow-hidden rounded-xl bg-slate-800 border-2 transition-all duration-300 group hover:shadow-lg ${
                          activity.completed 
                            ? 'border-green-500/50 bg-gradient-to-r from-green-500/5 to-emerald-500/5 shadow-lg shadow-green-500/10' 
                            : 'border-slate-700 hover:border-slate-600'
                        }`}
                      >
                        <div className="p-5">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-4 flex-1">
                              <button
                                onClick={() => onToggle(activity.id)}
                                className={`w-6 h-6 rounded-lg border-2 transition-all duration-200 flex items-center justify-center flex-shrink-0 ${
                                  activity.completed
                                    ? 'bg-green-500 border-green-500 shadow-lg shadow-green-500/30'
                                    : 'border-slate-600 hover:border-slate-500 group-hover:border-slate-400'
                                }`}
                              >
                                {activity.completed && (
                                  <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                  </svg>
                                )}
                              </button>
                            
                            <div className="flex-1">
                              <div className="flex items-center space-x-3 flex-wrap gap-2">
                                <span className="text-2xl">{activity.icon}</span>
                                <span className={`font-semibold text-base transition-colors ${activity.completed ? 'text-green-400' : 'text-slate-100'}`}>
                                  {activity.name}
                                </span>
                                <span className="text-xs font-bold text-slate-300 bg-slate-700/50 px-3 py-1 rounded-full">
                                  {activity.hours}h
                                </span>
                                {activity.hasTimer && (
                                  <div className="flex items-center space-x-1 bg-blue-500/10 px-2 py-1 rounded-full">
                                    <Zap className="w-3 h-3 text-blue-400" />
                                    <Clock className="w-3 h-3 text-blue-400" />
                                  </div>
                                )}
                              </div>
                              {hasSubtasks && (
                                <div className="mt-2 text-xs text-slate-400">
                                  {subtasksCompleted}/{activity.subtasks?.length} sessions completed
                                </div>
                              )}
                            </div>
                          </div>
                          
                          {hasSubtasks && (
                            <button
                              onClick={() => toggleExpanded(activity.id)}
                              className="p-2 hover:bg-slate-700/50 rounded-lg transition-colors ml-4 flex-shrink-0"
                              title={isExpanded ? 'Collapse' : 'Expand'}
                            >
                              {isExpanded ? (
                                <ChevronUp className="w-5 h-5 text-slate-400" />
                              ) : (
                                <ChevronDown className="w-5 h-5 text-slate-400" />
                              )}
                            </button>
                          )}
                        </div>
                      </div>
                      
                      {activity.completed && (
                        <div className={`absolute inset-0 bg-gradient-to-r ${activity.color} opacity-5 pointer-events-none`} />
                      )}
                    </div>
                    </SwipeableTask>
                    
                    {hasSubtasks && isExpanded && (
                      <div className="ml-6 space-y-3 p-5 bg-slate-800/50 rounded-xl border border-slate-700/50 backdrop-blur">
                        <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-4">
                          Session Breakdown
                        </div>
                        {activity.subtasks!.map((subtask) => (
                          <div key={subtask.id} className="space-y-3">
                            <div className="flex items-center justify-between p-4 bg-slate-900 rounded-lg border border-slate-700/50 hover:border-slate-700 transition-all">
                              <div className="flex items-center space-x-3 flex-1">
                                <button
                                  onClick={() => onToggle(activity.id, subtask.id)}
                                  className={`w-5 h-5 rounded-md border-2 transition-all flex-shrink-0 flex items-center justify-center ${
                                    subtask.completed
                                      ? 'bg-blue-500 border-blue-500 shadow-lg shadow-blue-500/30'
                                      : 'border-slate-600 hover:border-slate-500'
                                  }`}
                                >
                                  {subtask.completed && (
                                    <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                    </svg>
                                  )}
                                </button>
                                <div>
                                  <span className={`text-sm font-medium ${subtask.completed ? 'text-green-400' : 'text-slate-200'}`}>
                                    {subtask.name}
                                  </span>
                                </div>
                              </div>
                              
                              <div className="flex space-x-2 flex-shrink-0">
                                <Timer
                                  duration={subtask.duration}
                                  onComplete={() => handleTimerComplete(`${subtask.id}-work`)}
                                  label="Focus"
                                  isBreak={false}
                                />
                                <Timer
                                  duration={5}
                                  onComplete={() => handleTimerComplete(`${subtask.id}-break`)}
                                  label="Break"
                                  isBreak={true}
                                />
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
};
