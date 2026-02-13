import { useEffect, useCallback } from 'react';
import { useTaskStore } from '../store/useTaskStore';
import toast from 'react-hot-toast';

interface ShortcutConfig {
  key: string;
  ctrl?: boolean;
  shift?: boolean;
  alt?: boolean;
  action: () => void;
  description: string;
}

export const useKeyboardShortcuts = () => {
  const {
    timerState,
    selectedTaskId,
    isInputFocused,
    isModalOpen,
    pauseTimer,
    resumeTimer,
    toggleTaskComplete,
    setCurrentView,
  } = useTaskStore();

  const shortcuts: ShortcutConfig[] = [
    {
      key: ' ',
      action: () => {
        if (timerState.isRunning) {
          pauseTimer();
          toast('⏸️ Timer paused', {
            duration: 1500,
            position: 'bottom-center',
            style: {
              background: '#1e293b',
              color: '#94a3b8',
              border: '1px solid #334155',
            },
          });
        } else if (timerState.isPaused) {
          resumeTimer();
          toast('▶️ Timer resumed', {
            duration: 1500,
            position: 'bottom-center',
            style: {
              background: '#1e293b',
              color: '#94a3b8',
              border: '1px solid #334155',
            },
          });
        } else if (timerState.taskId) {
          toast('⏱️ No active timer', {
            duration: 1500,
            position: 'bottom-center',
            style: {
              background: '#1e293b',
              color: '#94a3b8',
              border: '1px solid #334155',
            },
          });
        }
      },
      description: 'Start/Pause timer',
    },
    {
      key: 'Enter',
      action: () => {
        if (selectedTaskId) {
          toggleTaskComplete(selectedTaskId);
          toast('✅ Task toggled', {
            duration: 1500,
            position: 'bottom-center',
            style: {
              background: '#1e293b',
              color: '#10b981',
              border: '1px solid #10b981',
            },
          });
        }
      },
      description: 'Mark task complete',
    },
    {
      key: 'd',
      action: () => {
        setCurrentView('daily');
        toast('📅 Daily view', {
          duration: 1500,
          position: 'bottom-center',
          style: {
            background: '#1e293b',
            color: '#3b82f6',
            border: '1px solid #3b82f6',
          },
        });
      },
      description: 'Go to Daily view',
    },
    {
      key: 'w',
      action: () => {
        setCurrentView('weekly');
        toast('📊 Weekly view', {
          duration: 1500,
          position: 'bottom-center',
          style: {
            background: '#1e293b',
            color: '#8b5cf6',
            border: '1px solid #8b5cf6',
          },
        });
      },
      description: 'Go to Weekly view',
    },
    {
      key: 'm',
      action: () => {
        setCurrentView('monthly');
        toast('📈 Monthly view', {
          duration: 1500,
          position: 'bottom-center',
          style: {
            background: '#1e293b',
            color: '#ec4899',
            border: '1px solid #ec4899',
          },
        });
      },
      description: 'Go to Monthly view',
    },
    {
      key: 'y',
      action: () => {
        setCurrentView('yearly');
        toast('🎯 Yearly view', {
          duration: 1500,
          position: 'bottom-center',
          style: {
            background: '#1e293b',
            color: '#f59e0b',
            border: '1px solid #f59e0b',
          },
        });
      },
      description: 'Go to Yearly view',
    },
  ];

  const handleKeyPress = useCallback(
    (event: KeyboardEvent) => {
      // Don't trigger shortcuts if input is focused or modal is open
      if (isInputFocused || isModalOpen) {
        return;
      }

      // Check if the target is an input, textarea, or contenteditable
      const target = event.target as HTMLElement;
      if (
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.tagName === 'SELECT' ||
        target.contentEditable === 'true'
      ) {
        return;
      }

      const shortcut = shortcuts.find((s) => {
        const keyMatch = event.key.toLowerCase() === s.key.toLowerCase();
        const ctrlMatch = s.ctrl ? event.ctrlKey : !event.ctrlKey;
        const shiftMatch = s.shift ? event.shiftKey : !event.shiftKey;
        const altMatch = s.alt ? event.altKey : !event.altKey;

        return keyMatch && ctrlMatch && shiftMatch && altMatch;
      });

      if (shortcut) {
        event.preventDefault();
        shortcut.action();
      }
    },
    [isInputFocused, isModalOpen, shortcuts]
  );

  useEffect(() => {
    window.addEventListener('keydown', handleKeyPress);
    return () => {
      window.removeEventListener('keydown', handleKeyPress);
    };
  }, [handleKeyPress]);

  return { shortcuts };
};

// Export shortcut list for UI display
export const getShortcutsList = (): ShortcutConfig[] => [
  { key: 'Space', action: () => {}, description: 'Start/Pause timer' },
  { key: 'Enter', action: () => {}, description: 'Mark task complete' },
  { key: 'D', action: () => {}, description: 'Daily view' },
  { key: 'W', action: () => {}, description: 'Weekly view' },
  { key: 'M', action: () => {}, description: 'Monthly view' },
  { key: 'Y', action: () => {}, description: 'Yearly view' },
];