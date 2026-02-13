import { useEffect } from 'react';
import { useThemeStore } from '../stores/themeStore';
import { useToastStore } from '../stores/toastStore';

export const useThemeShortcut = () => {
  const { toggleTheme, theme } = useThemeStore();
  const { showToast } = useToastStore();

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      // Don't trigger if user is typing in an input
      const target = e.target as HTMLElement;
      const isInput =
        target instanceof HTMLInputElement ||
        target instanceof HTMLTextAreaElement ||
        target instanceof HTMLSelectElement;

      if (isInput) return;

      // T key for theme toggle
      if (e.key.toLowerCase() === 't' && !e.ctrlKey && !e.metaKey) {
        e.preventDefault();
        toggleTheme();
        showToast(`Theme changed`, 'info');
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [toggleTheme, showToast, theme]);
};
