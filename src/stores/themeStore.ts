import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type Theme = 'light' | 'dark' | 'system';

interface ThemeStore {
  theme: Theme;
  resolvedTheme: 'light' | 'dark';
  setTheme: (theme: Theme) => void;
  initializeTheme: () => void;
  toggleTheme: () => void;
  syncWithBackend: (userId: string) => Promise<void>;
}

const getSystemTheme = (): 'light' | 'dark' => {
  if (typeof window === 'undefined') return 'dark';
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
};

const getResolvedTheme = (theme: Theme): 'light' | 'dark' => {
  if (theme === 'system') {
    return getSystemTheme();
  }
  return theme;
};

const applyTheme = (resolvedTheme: 'light' | 'dark') => {
  const root = document.documentElement;
  if (resolvedTheme === 'light') {
    root.classList.remove('dark');
    root.style.colorScheme = 'light';
  } else {
    root.classList.add('dark');
    root.style.colorScheme = 'dark';
  }
};

export const useThemeStore = create<ThemeStore>()(
  persist(
    (set, get) => ({
      theme: 'system',
      resolvedTheme: getSystemTheme(),

      initializeTheme: () => {
        const { theme } = get();
        const resolvedTheme = getResolvedTheme(theme);
        applyTheme(resolvedTheme);
        set({ resolvedTheme });

        // Listen for system theme changes
        if (theme === 'system') {
          const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
          const handleChange = (e: MediaQueryListEvent) => {
            const newResolved = e.matches ? 'dark' : 'light';
            applyTheme(newResolved);
            set({ resolvedTheme: newResolved });
          };

          mediaQuery.addEventListener('change', handleChange);
          return () => mediaQuery.removeEventListener('change', handleChange);
        }
      },

      setTheme: (theme: Theme) => {
        const resolvedTheme = getResolvedTheme(theme);
        applyTheme(resolvedTheme);
        set({ theme, resolvedTheme });

        // Sync with backend
        const userId = localStorage.getItem('userId');
        if (userId) {
          get().syncWithBackend(userId).catch(err => {
            console.error('Failed to sync theme with backend:', err);
          });
        }
      },

      toggleTheme: () => {
        const { resolvedTheme } = get();
        const newTheme: Theme = resolvedTheme === 'dark' ? 'light' : 'dark';
        get().setTheme(newTheme);
      },

      syncWithBackend: async (_userId: string) => {
        const { theme } = get();
        try {
          // Uncomment when backend is ready
          // const response = await fetch(`/api/users/${_userId}/preferences`, {
          //   method: 'PATCH',
          //   headers: { 'Content-Type': 'application/json' },
          //   body: JSON.stringify({ theme }),
          // });
          // if (!response.ok) throw new Error('Failed to sync theme');
          console.log('Theme synced with backend:', theme);
        } catch (error) {
          console.error('Error syncing theme:', error);
          throw error;
        }
      },
    }),
    {
      name: 'theme-store',
      version: 1,
    }
  )
);
