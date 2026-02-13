import { useState, useEffect } from 'react';
import { DailyTracker } from './components/DailyTracker';
import { WeeklyStats } from './components/WeeklyStats';
import { MonthlyStats } from './components/MonthlyStats';
import { YearlyStats } from './components/YearlyStats';
import TaskManager from './components/TaskManager';
import { ShortcutsHelp } from './components/ShortcutsHelp';
import { ThemeToggle } from './components/ThemeToggle';
import { ColorThemePicker } from './components/ColorThemePicker';
import { ToastContainer } from './components/Toast';
import { Calendar, BarChart3, TrendingUp, Target, Settings } from 'lucide-react';
import { useTaskStore } from './store/useTaskStore';
import { useKeyboardShortcuts } from './hooks/useKeyboardShortcuts';
import { useThemeStore } from './stores/themeStore';
import { useThemeShortcut } from './hooks/useThemeShortcut';
import { useColorThemeStore } from './stores/colorThemeStore';

type ViewType = 'daily' | 'weekly' | 'monthly' | 'yearly' | 'settings';

export function App() {
  const { currentView, setCurrentView } = useTaskStore();
  const { initializeTheme } = useThemeStore();
  const { initializeColorTheme } = useColorThemeStore();
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [customTasks, setCustomTasks] = useState<any[]>([]);
  const [trackerData] = useState(() => {
    const stored = localStorage.getItem('trackerData');
    return stored ? JSON.parse(stored) : {};
  });

  // Initialize theme on mount
  useEffect(() => {
    initializeTheme();
    initializeColorTheme();
  }, [initializeTheme, initializeColorTheme]);

  // Initialize keyboard shortcuts
  useKeyboardShortcuts();
  useThemeShortcut();

  useEffect(() => {
    localStorage.setItem('trackerData', JSON.stringify(trackerData));
  }, [trackerData]);

  useEffect(() => {
    // Request notification permission
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
    
    // Load custom tasks from localStorage
    const savedTasks = localStorage.getItem('customTasks');
    if (savedTasks) {
      setCustomTasks(JSON.parse(savedTasks));
    }
  }, []);

  const handleTasksUpdate = (tasks: any[]) => {
    setCustomTasks(tasks);
  };

  const tabs = [
    { id: 'daily', label: 'Daily', icon: Calendar },
    { id: 'weekly', label: 'Weekly', icon: BarChart3 },
    { id: 'monthly', label: 'Monthly', icon: TrendingUp },
    { id: 'yearly', label: 'Yearly', icon: Target },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <>
      <ToastContainer />
      <ShortcutsHelp />
      <div className="min-h-screen transition-colors duration-300 bg-[var(--background)] text-[var(--foreground)]">
        {/* Header */}
        <header className="sticky top-0 z-50 border-b border-[var(--border)] bg-[var(--card)]/90 backdrop-blur transition-colors">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between py-4">
              <div className="flex items-center gap-3 flex-1">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 to-cyan-500">
                  <svg
                    className="h-6 w-6 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"
                    />
                  </svg>
                </div>
                <div>
                  <h1 className="text-2xl font-bold">Progress Tracker 2026</h1>
                  <p className="text-sm opacity-70">Track Your Daily Progress & Achieve Goals</p>
                </div>
              </div>
              
              {/* Date Navigation and Theme Toggle */}
              <div className="flex items-center gap-2">
                {currentView === 'daily' && (
                  <>
                                    <button
                  onClick={() => {
                    const newDate = new Date(selectedDate);
                    newDate.setDate(newDate.getDate() - 1);
                    setSelectedDate(newDate);
                  }}
                  className="p-2 opacity-70 hover:opacity-100 hover:bg-[color:var(--muted)] rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-[var(--ring)]"
                  title="Previous day (←)"
                >
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                      </svg>
                    </button>
                    
                    <button
                      onClick={() => setSelectedDate(new Date())}
                      className="px-3 py-1 text-sm rounded-lg transition-colors bg-[var(--muted)] text-[var(--foreground)] hover:ring-2 hover:ring-[var(--ring)] focus:outline-none focus:ring-2 focus:ring-[var(--ring)]"
                      title="Today"
                    >
                      Today
                    </button>
                    
                                    <button
                  onClick={() => {
                    const newDate = new Date(selectedDate);
                    newDate.setDate(newDate.getDate() + 1);
                    setSelectedDate(newDate);
                  }}
                  className="p-2 opacity-70 hover:opacity-100 hover:bg-[color:var(--muted)] rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-[var(--ring)]"
                  title="Next day (→)"
                >
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </button>
                    
                    <div className="w-px h-6 bg-[var(--border)]" />
                  </>
                )}
                
                {/* Theme Toggle */}
                <ColorThemePicker />
                <ThemeToggle />
              </div>
            </div>
          </div>
        </header>

        {/* Navigation Tabs */}
        <div className="border-b border-[var(--border)] bg-[var(--card)]/70 transition-colors">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <nav className="flex gap-2 py-4 overflow-x-auto">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setCurrentView(tab.id as ViewType)}
                    className={`flex items-center gap-2 rounded-lg px-4 py-2 font-medium transition-all whitespace-nowrap focus:outline-none focus:ring-2 focus:ring-[var(--ring)] ${
                      currentView === tab.id
                        ? 'bg-[var(--primary)] text-white shadow-lg'
                        : 'text-[var(--foreground)]/80 hover:bg-[color:var(--muted)]'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </nav>
          </div>
        </div>

        {/* Content */}
        <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          {currentView === 'daily' && (
            <DailyTracker selectedDate={selectedDate} onDateChange={setSelectedDate} customTasks={customTasks} />
          )}
          {currentView === 'weekly' && (
            <WeeklyStats trackerData={trackerData} customTasks={customTasks} />
          )}
          {currentView === 'monthly' && (
            <MonthlyStats trackerData={trackerData} customTasks={customTasks} />
          )}
          {currentView === 'yearly' && (
            <YearlyStats trackerData={trackerData} customTasks={customTasks} />
          )}
          {currentView === 'settings' && (
            <TaskManager onTasksUpdate={handleTasksUpdate} />
          )}
        </main>

        {/* Footer */}
        <footer className="border-t border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 py-6 text-center transition-colors">
          <p className="text-slate-600 dark:text-slate-400">
            Customizable Schedule • Track Progress • Achieve Your Goals in 2026 🚀
          </p>
        </footer>
      </div>
    </>
  );
}
