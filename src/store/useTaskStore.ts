import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';

export interface Task {
  id: string;
  name: string;
  category: 'work' | 'learning' | 'health' | 'leisure';
  totalHours: number;
  sessions: number;
  focusMinutes: number;
  breakMinutes: number;
  color: string;
  icon: string;
  priorityOrder: number;
  completed?: boolean;
}

export interface TimerState {
  isRunning: boolean;
  isPaused: boolean;
  timeLeft: number;
  duration: number;
  taskId: string | null;
  timerType: 'focus' | 'break';
}

interface TaskStore {
  // State
  tasks: Task[];
  activeTaskId: string | null;
  selectedTaskId: string | null;
  timerState: TimerState;
  currentView: 'daily' | 'weekly' | 'monthly' | 'yearly' | 'settings';
  selectedDate: Date;
  isInputFocused: boolean;
  isModalOpen: boolean;

  // Actions
  setTasks: (tasks: Task[]) => void;
  addTask: (task: Task) => void;
  updateTask: (taskId: string, updates: Partial<Task>) => void;
  deleteTask: (taskId: string) => void;
  reorderTasks: (tasks: Task[]) => void;
  
  setActiveTaskId: (taskId: string | null) => void;
  setSelectedTaskId: (taskId: string | null) => void;
  toggleTaskComplete: (taskId: string) => void;
  
  setTimerState: (state: Partial<TimerState>) => void;
  startTimer: (taskId: string, duration: number, type: 'focus' | 'break') => void;
  pauseTimer: () => void;
  resumeTimer: () => void;
  stopTimer: () => void;
  
  setCurrentView: (view: 'daily' | 'weekly' | 'monthly' | 'yearly' | 'settings') => void;
  setSelectedDate: (date: Date) => void;
  setInputFocused: (focused: boolean) => void;
  setModalOpen: (open: boolean) => void;
}

export const useTaskStore = create<TaskStore>()(
  devtools(
    persist(
      (set) => ({
        // Initial state
        tasks: [],
        activeTaskId: null,
        selectedTaskId: null,
        timerState: {
          isRunning: false,
          isPaused: false,
          timeLeft: 0,
          duration: 0,
          taskId: null,
          timerType: 'focus',
        },
        currentView: 'daily',
        selectedDate: new Date(),
        isInputFocused: false,
        isModalOpen: false,

        // Task actions
        setTasks: (tasks) => set({ tasks }),
        
        addTask: (task) => 
          set((state) => ({
            tasks: [...state.tasks, task],
          })),
        
        updateTask: (taskId, updates) =>
          set((state) => ({
            tasks: state.tasks.map((task) =>
              task.id === taskId ? { ...task, ...updates } : task
            ),
          })),
        
        deleteTask: (taskId) =>
          set((state) => ({
            tasks: state.tasks.filter((task) => task.id !== taskId),
            activeTaskId: state.activeTaskId === taskId ? null : state.activeTaskId,
            selectedTaskId: state.selectedTaskId === taskId ? null : state.selectedTaskId,
          })),
        
        reorderTasks: (tasks) => set({ tasks }),
        
        setActiveTaskId: (taskId) => set({ activeTaskId: taskId }),
        setSelectedTaskId: (taskId) => set({ selectedTaskId: taskId }),
        
        toggleTaskComplete: (taskId) =>
          set((state) => ({
            tasks: state.tasks.map((task) =>
              task.id === taskId ? { ...task, completed: !task.completed } : task
            ),
          })),
        
        // Timer actions
        setTimerState: (newState) =>
          set((state) => ({
            timerState: { ...state.timerState, ...newState },
          })),
        
        startTimer: (taskId, duration, type) =>
          set({
            activeTaskId: taskId,
            timerState: {
              isRunning: true,
              isPaused: false,
              timeLeft: duration * 60,
              duration: duration * 60,
              taskId,
              timerType: type,
            },
          }),
        
        pauseTimer: () =>
          set((state) => ({
            timerState: {
              ...state.timerState,
              isRunning: false,
              isPaused: true,
            },
          })),
        
        resumeTimer: () =>
          set((state) => ({
            timerState: {
              ...state.timerState,
              isRunning: true,
              isPaused: false,
            },
          })),
        
        stopTimer: () =>
          set({
            activeTaskId: null,
            timerState: {
              isRunning: false,
              isPaused: false,
              timeLeft: 0,
              duration: 0,
              taskId: null,
              timerType: 'focus',
            },
          }),
        
        // UI actions
        setCurrentView: (view) => set({ currentView: view }),
        setSelectedDate: (date) => set({ selectedDate: date }),
        setInputFocused: (focused) => set({ isInputFocused: focused }),
        setModalOpen: (open) => set({ isModalOpen: open }),
      }),
      {
        name: 'task-store',
        partialize: (state) => ({
          tasks: state.tasks,
          selectedDate: state.selectedDate,
        }),
      }
    )
  )
);