import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface CelebrationState {
  /** keyed by yyyy-MM-dd */
  celebratedByDate: Record<string, boolean>;
  markCelebrated: (dateKey: string) => void;
  hasCelebrated: (dateKey: string) => boolean;
}

export const useCelebrationStore = create<CelebrationState>()(
  persist(
    (set, get) => ({
      celebratedByDate: {},
      markCelebrated: (dateKey) =>
        set((s) => ({
          celebratedByDate: { ...s.celebratedByDate, [dateKey]: true },
        })),
      hasCelebrated: (dateKey) => !!get().celebratedByDate[dateKey],
    }),
    {
      name: 'celebration-store',
      version: 1,
    }
  )
);
