import { useMemo, useState } from 'react';
import { Palette, Lock } from 'lucide-react';
import { useColorThemeStore, type ColorThemeId } from '../stores/colorThemeStore';
import { useToastStore } from '../stores/toastStore';
import { cn } from '../utils';

export function ColorThemePicker() {
  const { colorTheme, unlockedThemeIds, availableThemes, setColorTheme } = useColorThemeStore();
  const { showToast } = useToastStore();
  const [open, setOpen] = useState(false);

  const themeCards = useMemo(() => {
    return availableThemes.map((t) => {
      const locked = !unlockedThemeIds.includes(t.id);
      return {
        ...t,
        locked,
      };
    });
  }, [availableThemes, unlockedThemeIds]);

  const handleSelect = async (themeId: ColorThemeId) => {
    try {
      await setColorTheme(themeId);
      showToast(`Theme set to ${themeId}`, 'success');
      setOpen(false);
    } catch (e) {
      console.error(e);
      showToast('Theme is locked', 'warning');
    }
  };

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className={cn(
          'inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-sm font-medium',
          'bg-[var(--card)] text-[var(--foreground)] border-[var(--border)]',
          'hover:ring-2 hover:ring-[var(--ring)] transition'
        )}
        title="Color theme"
        aria-label="Open color theme picker"
        aria-haspopup="menu"
        aria-expanded={open}
      >
        <Palette className="h-4 w-4" />
        <span className="hidden sm:inline">Theme</span>
        <span className="rounded-md bg-[var(--muted)] px-2 py-0.5 text-xs">{colorTheme}</span>
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div
            className={cn(
              'absolute right-0 mt-2 z-50 w-[320px] rounded-xl border p-3 shadow-xl',
              'bg-[var(--card)] border-[var(--border)]'
            )}
            role="menu"
            aria-label="Theme picker"
          >
            <div className="mb-2 flex items-center justify-between">
              <div className="text-sm font-semibold text-[var(--foreground)]">Color themes</div>
              <div className="text-xs text-[color:var(--foreground)]/60">Instant apply</div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              {themeCards.map((t) => (
                <button
                  key={t.id}
                  onClick={() => handleSelect(t.id)}
                  className={cn(
                    'group relative rounded-lg border p-3 text-left transition focus:outline-none focus:ring-2 focus:ring-[var(--ring)]',
                    'border-[var(--border)] hover:border-[color:var(--ring)]',
                    t.id === colorTheme ? 'ring-2 ring-[var(--ring)]' : ''
                  )}
                  role="menuitem"
                  aria-label={`Select ${t.name} theme`}
                  disabled={t.locked}
                >
                  <div className="flex items-center justify-between">
                    <div className="text-sm font-semibold text-[var(--foreground)]">{t.name}</div>
                    {t.locked && <Lock className="h-4 w-4 text-[color:var(--foreground)]/60" />}
                  </div>

                  <div className="mt-2 grid grid-cols-5 gap-1">
                    <span className="h-4 rounded bg-[var(--primary)]" style={{ background: t.tokens.primary }} />
                    <span className="h-4 rounded bg-[var(--secondary)]" style={{ background: t.tokens.secondary }} />
                    <span className="h-4 rounded bg-[var(--accent)]" style={{ background: t.tokens.accent }} />
                    <span className="h-4 rounded bg-[var(--muted)]" style={{ background: t.tokens.muted }} />
                    <span className="h-4 rounded border" style={{ background: t.tokens.background, borderColor: t.tokens.border }} />
                  </div>

                  <div className="mt-2 text-xs text-[color:var(--foreground)]/60">
                    {t.locked ? 'Locked' : t.id === colorTheme ? 'Active' : 'Tap to apply'}
                  </div>
                </button>
              ))}
            </div>

            <div className="mt-3 rounded-lg border border-[var(--border)] bg-[color:var(--muted)] p-2 text-xs text-[color:var(--foreground)]/70">
              Future-proof: locked/unlockable themes supported via <code>user_unlocked_themes</code>.
            </div>
          </div>
        </>
      )}
    </div>
  );
}
