import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type ColorThemeId = 'ocean' | 'forest' | 'sunset' | 'midnight';

export interface ThemeTokens {
  id: ColorThemeId;
  name: string;
  tokens: {
    background: string;
    foreground: string;
    primary: string;
    secondary: string;
    accent: string;
    muted: string;
    card: string;
    border: string;
    ring: string;
  };
  unlockCondition?: string | null;
}

const THEMES: Record<ColorThemeId, ThemeTokens> = {
  ocean: {
    id: 'ocean',
    name: 'Ocean',
    tokens: {
      background: '#e0f2fe',
      foreground: '#0b1220',
      primary: '#0ea5e9',
      secondary: '#38bdf8',
      accent: '#0284c7',
      muted: '#bae6fd',
      card: '#ffffff',
      border: 'rgba(2, 132, 199, 0.25)',
      ring: '#0ea5e9',
    },
    unlockCondition: null,
  },
  forest: {
    id: 'forest',
    name: 'Forest',
    tokens: {
      background: '#ecfdf5',
      foreground: '#071a12',
      primary: '#16a34a',
      secondary: '#4ade80',
      accent: '#15803d',
      muted: '#bbf7d0',
      card: '#ffffff',
      border: 'rgba(21, 128, 61, 0.25)',
      ring: '#16a34a',
    },
    unlockCondition: null,
  },
  sunset: {
    id: 'sunset',
    name: 'Sunset',
    tokens: {
      background: '#fff7ed',
      foreground: '#1b1207',
      primary: '#f97316',
      secondary: '#fb923c',
      accent: '#ea580c',
      muted: '#fed7aa',
      card: '#ffffff',
      border: 'rgba(234, 88, 12, 0.25)',
      ring: '#f97316',
    },
    unlockCondition: null,
  },
  midnight: {
    id: 'midnight',
    name: 'Midnight',
    tokens: {
      background: '#0f172a',
      foreground: '#e5e7eb',
      primary: '#6366f1',
      secondary: '#a5b4fc',
      accent: '#4f46e5',
      muted: 'rgba(99, 102, 241, 0.15)',
      card: 'rgba(255,255,255,0.06)',
      border: 'rgba(255,255,255,0.12)',
      ring: '#6366f1',
    },
    unlockCondition: null,
  },
};

function applyThemeClass(themeId: ColorThemeId) {
  const root = document.documentElement;
  root.classList.remove('theme-ocean', 'theme-forest', 'theme-sunset', 'theme-midnight');
  root.classList.add(`theme-${themeId}`);
}

export interface ColorThemeStore {
  colorTheme: ColorThemeId;
  unlockedThemeIds: ColorThemeId[];
  availableThemes: ThemeTokens[];
  setColorTheme: (themeId: ColorThemeId) => Promise<void>;
  initializeColorTheme: () => void;
  unlockTheme: (themeId: ColorThemeId) => void;
  syncWithBackend: (payload: { color_theme: ColorThemeId }) => Promise<void>;
}

export const useColorThemeStore = create<ColorThemeStore>()(
  persist(
    (set, get) => ({
      colorTheme: 'ocean',
      unlockedThemeIds: ['ocean', 'forest', 'sunset', 'midnight'],
      availableThemes: Object.values(THEMES),

      initializeColorTheme: () => {
        const { colorTheme } = get();
        applyThemeClass(colorTheme);
      },

      setColorTheme: async (themeId) => {
        const { unlockedThemeIds } = get();
        if (!unlockedThemeIds.includes(themeId)) {
          // future-proof: locked themes
          throw new Error('Theme is locked');
        }

        applyThemeClass(themeId);
        set({ colorTheme: themeId });

        try {
          await get().syncWithBackend({ color_theme: themeId });
        } catch (e) {
          // If sync fails, keep local preference; backend can retry later.
          console.error('Failed to sync color theme:', e);
        }
      },

      unlockTheme: (themeId) =>
        set((s) =>
          s.unlockedThemeIds.includes(themeId)
            ? s
            : { unlockedThemeIds: [...s.unlockedThemeIds, themeId] }
        ),

      syncWithBackend: async (payload) => {
        // Implement real backend sync here.
        // PATCH /user_settings (or /users/me/settings)
        // body: { color_theme: 'ocean' | 'forest' | 'sunset' | 'midnight' }
        console.log('Sync color theme to backend:', payload);
      },
    }),
    {
      name: 'color-theme-store',
      version: 1,
      partialize: (s) => ({
        colorTheme: s.colorTheme,
        unlockedThemeIds: s.unlockedThemeIds,
      }),
    }
  )
);
