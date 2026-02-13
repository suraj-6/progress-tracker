import React, { useState } from 'react';
import { Moon, Sun, Monitor } from 'lucide-react';
import { useThemeStore, type Theme } from '../stores/themeStore';
import { cn } from '../utils';

export const ThemeToggle: React.FC = () => {
  const { theme, setTheme } = useThemeStore();
  const [showMenu, setShowMenu] = useState(false);

  const themes: { value: Theme; label: string; icon: React.ReactNode }[] = [
    { value: 'light', label: 'Light', icon: <Sun className="w-4 h-4" /> },
    { value: 'dark', label: 'Dark', icon: <Moon className="w-4 h-4" /> },
    { value: 'system', label: 'System', icon: <Monitor className="w-4 h-4" /> },
  ];

  const handleThemeChange = (newTheme: Theme) => {
    setTheme(newTheme);
    setShowMenu(false);
  };

  return (
    <div className="relative">
      <button
        onClick={() => setShowMenu(!showMenu)}
        className={cn(
          'p-2 rounded-lg transition-colors',
          'text-slate-400 hover:text-white hover:bg-slate-700',
          'dark:text-slate-400 dark:hover:text-white dark:hover:bg-slate-700',
          'focus:outline-none focus:ring-2 focus:ring-blue-500'
        )}
        title="Toggle theme (T)"
        aria-label="Theme selector"
        aria-expanded={showMenu}
        aria-haspopup="menu"
      >
        {theme === 'light' && <Sun className="w-5 h-5" />}
        {theme === 'dark' && <Moon className="w-5 h-5" />}
        {theme === 'system' && <Monitor className="w-5 h-5" />}
      </button>

      {/* Theme Menu */}
      {showMenu && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-40"
            onClick={() => setShowMenu(false)}
          />

          {/* Menu */}
          <div
            className={cn(
              'absolute right-0 top-12 z-50 w-48 rounded-lg border shadow-lg',
              'bg-white text-slate-900 border-slate-200',
              'dark:bg-slate-800 dark:text-white dark:border-slate-700'
            )}
            role="menu"
          >
            <div className="p-2">
              {themes.map((t) => (
                <button
                  key={t.value}
                  onClick={() => handleThemeChange(t.value)}
                  className={cn(
                    'w-full flex items-center gap-3 px-3 py-2 rounded-md transition-colors',
                    'text-left text-sm font-medium',
                    theme === t.value
                      ? 'bg-blue-500/10 text-blue-600 dark:text-blue-400'
                      : 'text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-700',
                    'focus:outline-none focus:ring-2 focus:ring-blue-500'
                  )}
                  role="menuitem"
                  aria-label={`${t.label} theme`}
                >
                  {t.icon}
                  <span>{t.label}</span>
                  {theme === t.value && (
                    <span className="ml-auto text-xs font-bold">✓</span>
                  )}
                </button>
              ))}
            </div>

            {/* Theme Info */}
            <div className="border-t border-slate-200 dark:border-slate-700 px-3 py-2">
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Theme syncs with backend automatically
              </p>
            </div>
          </div>
        </>
      )}
    </div>
  );
};
