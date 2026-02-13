import React, { useState, useEffect, useRef, memo } from 'react';
import { Play, Pause, RotateCcw, Coffee, BookOpen } from 'lucide-react';
import { useTaskStore } from '../store/useTaskStore';
import toast from 'react-hot-toast';

interface EnhancedTimerProps {
  taskId: string;
  duration: number; // in minutes
  onComplete?: () => void;
  label: string;
  isBreak?: boolean;
}

export const EnhancedTimer: React.FC<EnhancedTimerProps> = memo(({ 
  taskId, 
  duration, 
  onComplete, 
  label, 
  isBreak = false 
}) => {
  const { 
    timerState, 
    activeTaskId,
    startTimer, 
    pauseTimer, 
    resumeTimer, 
    stopTimer 
  } = useTaskStore();

  const [localTimeLeft, setLocalTimeLeft] = useState(duration * 60);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const isActive = activeTaskId === taskId && timerState.taskId === taskId;
  const isRunning = isActive && timerState.isRunning;
  const isPaused = isActive && timerState.isPaused;

  useEffect(() => {
    // Create audio element for notification sound
    audioRef.current = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBTGH0fPTgjMGHm7A7+OZURU');
    
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (isActive) {
      setLocalTimeLeft(timerState.timeLeft);
    } else {
      setLocalTimeLeft(duration * 60);
    }
  }, [isActive, timerState.timeLeft, duration]);

  useEffect(() => {
    if (isRunning && localTimeLeft > 0) {
      intervalRef.current = setInterval(() => {
        setLocalTimeLeft((prevTime) => {
          const newTime = prevTime - 1;
          
          if (newTime <= 0) {
            stopTimer();
            // Play notification sound
            if (audioRef.current) {
              audioRef.current.play().catch(e => console.log('Audio play failed:', e));
            }
            
            // Show notification
            showNotification();
            
            // Trigger completion callback
            if (onComplete) {
              onComplete();
            }
            
            return 0;
          }
          
          return newTime;
        });
      }, 1000);
    } else if (!isRunning && intervalRef.current) {
      clearInterval(intervalRef.current);
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isRunning, localTimeLeft, stopTimer, onComplete]);

  const showNotification = () => {
    // Browser notification
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification(`Timer Complete!`, {
        body: `${label} ${isBreak ? 'break' : 'session'} is complete!`,
        icon: '/favicon.ico',
        tag: 'timer-notification',
      });
    }
    
    // Toast notification
    toast.success(`${label} ${isBreak ? 'break' : 'session'} complete!`, {
      duration: 3000,
      position: 'top-center',
      style: {
        background: '#10b981',
        color: '#ffffff',
      },
    });
    
    // Haptic feedback
    if ('vibrate' in navigator) {
      navigator.vibrate(200);
    }
  };

  const handleToggleTimer = () => {
    if (isRunning) {
      pauseTimer();
    } else if (isPaused) {
      resumeTimer();
    } else {
      startTimer(taskId, duration, isBreak ? 'break' : 'focus');
    }
  };

  const handleResetTimer = () => {
    stopTimer();
    setLocalTimeLeft(duration * 60);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const progress = ((duration * 60 - localTimeLeft) / (duration * 60)) * 100;

  return (
    <div 
      className={`flex items-center space-x-3 p-3 rounded-lg border transition-all ${
        isBreak 
          ? 'bg-green-500/10 border-green-500/30 hover:border-green-500/50' 
          : 'bg-blue-500/10 border-blue-500/30 hover:border-blue-500/50'
      } ${isActive ? 'ring-2 ring-offset-2 ring-offset-slate-800' : ''} ${
        isRunning ? 'ring-blue-500' : isPaused ? 'ring-yellow-500' : ''
      }`}
      role="region"
      aria-label={`Timer for ${label}`}
    >
      <div className="relative w-12 h-12 flex-shrink-0">
        <svg className="transform -rotate-90 w-12 h-12">
          <circle
            cx="24"
            cy="24"
            r="20"
            stroke="currentColor"
            strokeWidth="2.5"
            fill="none"
            className="text-slate-700"
          />
          <circle
            cx="24"
            cy="24"
            r="20"
            stroke="currentColor"
            strokeWidth="2.5"
            fill="none"
            strokeDasharray={`${2 * Math.PI * 20}`}
            strokeDashoffset={`${2 * Math.PI * 20 * (1 - progress / 100)}`}
            className={isBreak ? 'text-green-500' : 'text-blue-500'}
            style={{ transition: 'stroke-dashoffset 1s linear' }}
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          {isBreak ? (
            <Coffee className="w-5 h-5 text-green-500" />
          ) : (
            <BookOpen className="w-5 h-5 text-blue-500" />
          )}
        </div>
      </div>
      
      <div className="flex-1 min-w-0">
        <div className="text-xs font-medium text-slate-400">{label}</div>
        <div className={`font-mono text-lg font-bold ${
          isBreak ? 'text-green-400' : 'text-blue-400'
        }`}>
          {formatTime(localTimeLeft)}
        </div>
        {isActive && (
          <div className="text-xs text-slate-500 mt-1">
            {isRunning ? 'Running' : isPaused ? 'Paused' : 'Ready'}
          </div>
        )}
      </div>
      
      <div className="flex space-x-1 flex-shrink-0">
        <button
          onClick={handleToggleTimer}
          className={`p-2 rounded-lg transition-all transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-800 ${
            isRunning 
              ? 'bg-red-500/20 text-red-400 hover:bg-red-500/30 focus:ring-red-500' 
              : 'bg-green-500/20 text-green-400 hover:bg-green-500/30 focus:ring-green-500'
          }`}
          title={isRunning ? 'Pause (Space)' : 'Start (Space)'}
          aria-label={isRunning ? 'Pause timer' : 'Start timer'}
        >
          {isRunning ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
        </button>
        <button
          onClick={handleResetTimer}
          className="p-2 rounded-lg bg-slate-700 text-slate-400 hover:bg-slate-600 transition-all transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-800 focus:ring-slate-500"
          title="Reset timer"
          aria-label="Reset timer"
        >
          <RotateCcw className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
});