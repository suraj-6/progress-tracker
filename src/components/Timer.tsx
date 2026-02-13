import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, RotateCcw, Coffee, BookOpen } from 'lucide-react';

interface TimerProps {
  duration: number; // in minutes
  onComplete: () => void;
  label: string;
  isBreak?: boolean;
}

export const Timer: React.FC<TimerProps> = ({ duration, onComplete, label, isBreak = false }) => {
  const [timeLeft, setTimeLeft] = useState(duration * 60); // convert to seconds
  const [isRunning, setIsRunning] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

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
    if (isRunning && timeLeft > 0) {
      intervalRef.current = setInterval(() => {
        setTimeLeft((prevTime) => {
          if (prevTime <= 1) {
            setIsRunning(false);
            // Play notification sound
            if (audioRef.current) {
              audioRef.current.play().catch(e => console.log('Audio play failed:', e));
            }
            onComplete();
            // Show notification
            showNotification();
            return 0;
          }
          return prevTime - 1;
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
  }, [isRunning, timeLeft, onComplete]);

  const showNotification = () => {
    // Check if browser supports notifications
    if ('Notification' in window) {
      if (Notification.permission === 'granted') {
        new Notification(`Timer Complete!`, {
          body: `${label} ${isBreak ? 'break' : 'session'} is complete!`,
          icon: '/favicon.ico',
          tag: 'timer-notification',
        });
      } else if (Notification.permission !== 'denied') {
        Notification.requestPermission().then((permission) => {
          if (permission === 'granted') {
            new Notification(`Timer Complete!`, {
              body: `${label} ${isBreak ? 'break' : 'session'} is complete!`,
              icon: '/favicon.ico',
              tag: 'timer-notification',
            });
          }
        });
      }
    }
  };

  const toggleTimer = () => {
    if (!isRunning && timeLeft === 0) {
      setTimeLeft(duration * 60);
    }
    setIsRunning(!isRunning);
  };

  const resetTimer = () => {
    setIsRunning(false);
    setTimeLeft(duration * 60);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const progress = ((duration * 60 - timeLeft) / (duration * 60)) * 100;

  return (
    <div className={`flex items-center space-x-3 p-3 rounded-lg border transition-all ${
      isBreak 
        ? 'bg-green-500/10 border-green-500/30 hover:border-green-500/50' 
        : 'bg-blue-500/10 border-blue-500/30 hover:border-blue-500/50'
    }`}>
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
        }`}>{formatTime(timeLeft)}</div>
      </div>
      
      <div className="flex space-x-1 flex-shrink-0">
        <button
          onClick={toggleTimer}
          className={`p-2 rounded-lg transition-all transform hover:scale-105 ${
            isRunning 
              ? 'bg-red-500/20 text-red-400 hover:bg-red-500/30' 
              : 'bg-green-500/20 text-green-400 hover:bg-green-500/30'
          }`}
          title={isRunning ? 'Pause' : 'Start'}
        >
          {isRunning ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
        </button>
        <button
          onClick={resetTimer}
          className="p-2 rounded-lg bg-slate-700 text-slate-400 hover:bg-slate-600 transition-all transform hover:scale-105"
          title="Reset"
        >
          <RotateCcw className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
