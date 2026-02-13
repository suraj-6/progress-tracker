import { useCallback, useRef } from 'react';
import confetti, { type CreateTypes, type Options } from 'canvas-confetti';
import { useCelebrationStore } from '../stores/celebrationStore';
import { useToastStore } from '../stores/toastStore';

export interface CelebrateResponse {
  celebrate: boolean;
}

function createScopedConfetti(): { fire: CreateTypes; canvas: HTMLCanvasElement } {
  const canvas = document.createElement('canvas');
  canvas.setAttribute('aria-hidden', 'true');
  canvas.style.position = 'fixed';
  canvas.style.inset = '0';
  canvas.style.width = '100%';
  canvas.style.height = '100%';
  canvas.style.pointerEvents = 'none';
  canvas.style.zIndex = '9999';

  document.body.appendChild(canvas);
  const fire = confetti.create(canvas, { resize: true, useWorker: true });
  return { fire, canvas };
}

export function useCelebration() {
  const { hasCelebrated, markCelebrated } = useCelebrationStore();
  const { showToast } = useToastStore();
  const runningRef = useRef(false);

  const celebrateIfNeeded = useCallback(
    async (dateKey: string, api: CelebrateResponse) => {
      if (!api.celebrate) return;
      if (hasCelebrated(dateKey)) return;
      if (runningRef.current) return;

      runningRef.current = true;
      markCelebrated(dateKey);

      // Toast immediately
      showToast('100% Completed! 🎉', 'success', 2500);

      // Haptics (optional)
      if ('vibrate' in navigator) {
        try {
          navigator.vibrate([30, 40, 30]);
        } catch {
          // ignore
        }
      }

      // Client-only: run confetti with its own canvas to avoid layout shift
      const { fire, canvas } = createScopedConfetti();
      const start = performance.now();
      const durationMs = 2500;

      const base: Options = {
        origin: { x: 0.5, y: 0.05 },
        spread: 70,
        startVelocity: 35,
        gravity: 1.0,
        ticks: 250,
        scalar: 1,
      };

      const frame = (now: number) => {
        const elapsed = now - start;
        const progress = Math.min(1, elapsed / durationMs);

        // moderate particles, tapering over time
        const count = Math.round(18 * (1 - progress) + 6);

        fire({ ...base, particleCount: count, angle: 90, drift: (Math.random() - 0.5) * 0.8 });

        if (elapsed < durationMs) {
          requestAnimationFrame(frame);
        } else {
          // cleanup
          try {
            canvas.remove();
          } catch {
            // ignore
          }
          runningRef.current = false;
        }
      };

      requestAnimationFrame(frame);
    },
    [hasCelebrated, markCelebrated, showToast]
  );

  return { celebrateIfNeeded };
}
