import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Edit2, Save, X, Clock, Settings, GripVertical } from 'lucide-react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface Task {
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
}

interface TaskManagerProps {
  onTasksUpdate: (tasks: Task[]) => void;
}

// Sortable Task Item Component
const SortableTaskItem: React.FC<{
  task: Task;
  categoryColor: string;
  onEdit: () => void;
  onDelete: () => void;
  getSessionTime: (task: Task) => string;
  editingTask: string | null;
  onSave: (task: Task) => void;
  onCancelEdit: () => void;
}> = ({ task, categoryColor, onEdit, onDelete, getSessionTime, editingTask, onSave, onCancelEdit }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: task.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`mb-2 p-3 rounded-lg border ${categoryColor} backdrop-blur-sm ${
        isDragging ? 'shadow-lg ring-2 ring-blue-500' : ''
      }`}
    >
      {editingTask === task.id ? (
        <EditTaskForm
          task={task}
          onSave={onSave}
          onCancel={onCancelEdit}
        />
      ) : (
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            {/* Drag Handle */}
            <button
              {...attributes}
              {...listeners}
              className="cursor-grab active:cursor-grabbing p-1 hover:bg-slate-600/50 rounded transition-colors flex-shrink-0"
              aria-label="Drag to reorder"
            >
              <GripVertical className="w-5 h-5 text-slate-400" />
            </button>
            
            <span className="text-2xl flex-shrink-0">{task.icon}</span>
            <div className="flex-1 min-w-0">
              <div className="font-semibold text-white truncate">{task.name}</div>
              <div className="text-sm text-slate-400">
                {task.totalHours}h • {getSessionTime(task)}
              </div>
            </div>
          </div>
          
          <div className="flex gap-2 flex-shrink-0">
            <button
              onClick={onEdit}
              className="p-2 bg-slate-700/50 hover:bg-slate-700 rounded-lg transition-colors"
              aria-label="Edit task"
            >
              <Edit2 className="w-4 h-4 text-blue-400" />
            </button>
            <button
              onClick={onDelete}
              className="p-2 bg-slate-700/50 hover:bg-red-600/20 rounded-lg transition-colors"
              aria-label="Delete task"
            >
              <Trash2 className="w-4 h-4 text-red-400" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

const TaskManager: React.FC<TaskManagerProps> = ({ onTasksUpdate }) => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isAddingTask, setIsAddingTask] = useState(false);
  const [editingTask, setEditingTask] = useState<string | null>(null);
  const [newTask, setNewTask] = useState<Task>({
    id: '',
    name: '',
    category: 'work',
    totalHours: 1,
    sessions: 1,
    focusMinutes: 55,
    breakMinutes: 5,
    color: 'blue',
    icon: '💼',
    priorityOrder: 0,
  });

  // Configure sensors for drag and drop
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8, // 8px movement required before drag starts
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Load tasks from localStorage
  useEffect(() => {
    const savedTasks = localStorage.getItem('customTasks');
    if (savedTasks) {
      const parsedTasks = JSON.parse(savedTasks);
      // Ensure all tasks have priorityOrder
      const tasksWithPriority = parsedTasks.map((task: Task, index: number) => ({
        ...task,
        priorityOrder: task.priorityOrder ?? index,
      }));
      setTasks(tasksWithPriority.sort((a: Task, b: Task) => a.priorityOrder - b.priorityOrder));
      onTasksUpdate(tasksWithPriority);
    } else {
      loadDefaultTasks();
    }
  }, []);

  const loadDefaultTasks = () => {
    const defaultTasks: Task[] = [
      { id: '1', name: 'Internship 1', category: 'work', totalHours: 2, sessions: 2, focusMinutes: 55, breakMinutes: 5, color: 'blue', icon: '💼', priorityOrder: 0 },
      { id: '2', name: 'Internship 2', category: 'work', totalHours: 2, sessions: 2, focusMinutes: 55, breakMinutes: 5, color: 'blue', icon: '💼', priorityOrder: 1 },
      { id: '3', name: 'ML Internship', category: 'work', totalHours: 2, sessions: 2, focusMinutes: 55, breakMinutes: 5, color: 'purple', icon: '🤖', priorityOrder: 2 },
      { id: '4', name: 'Backlog Coverup', category: 'work', totalHours: 2, sessions: 2, focusMinutes: 55, breakMinutes: 5, color: 'orange', icon: '📝', priorityOrder: 3 },
      { id: '5', name: 'Learn DSA', category: 'learning', totalHours: 1.5, sessions: 2, focusMinutes: 45, breakMinutes: 5, color: 'green', icon: '📚', priorityOrder: 0 },
      { id: '6', name: 'Quantitative Finance', category: 'learning', totalHours: 1.5, sessions: 2, focusMinutes: 45, breakMinutes: 5, color: 'emerald', icon: '📊', priorityOrder: 1 },
      { id: '7', name: 'Interview Prep', category: 'learning', totalHours: 1.5, sessions: 2, focusMinutes: 45, breakMinutes: 5, color: 'yellow', icon: '🎯', priorityOrder: 2 },
      { id: '8', name: '.NET Framework', category: 'learning', totalHours: 1.5, sessions: 2, focusMinutes: 45, breakMinutes: 5, color: 'violet', icon: '💻', priorityOrder: 3 },
      { id: '9', name: 'Sleep', category: 'health', totalHours: 7, sessions: 1, focusMinutes: 0, breakMinutes: 0, color: 'indigo', icon: '😴', priorityOrder: 0 },
      { id: '10', name: 'Workout', category: 'health', totalHours: 1, sessions: 1, focusMinutes: 0, breakMinutes: 0, color: 'red', icon: '💪', priorityOrder: 1 },
      { id: '11', name: 'Free Time', category: 'leisure', totalHours: 1.5, sessions: 1, focusMinutes: 0, breakMinutes: 0, color: 'pink', icon: '🎮', priorityOrder: 0 }
    ];
    setTasks(defaultTasks);
    localStorage.setItem('customTasks', JSON.stringify(defaultTasks));
    onTasksUpdate(defaultTasks);
  };

  const saveTasks = (updatedTasks: Task[]) => {
    setTasks(updatedTasks);
    localStorage.setItem('customTasks', JSON.stringify(updatedTasks));
    onTasksUpdate(updatedTasks);
  };

  // Handle drag end
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (!over || active.id === over.id) {
      return;
    }

    const activeTask = tasks.find(t => t.id === active.id);
    const overTask = tasks.find(t => t.id === over.id);

    // Only allow reordering within the same category
    if (!activeTask || !overTask || activeTask.category !== overTask.category) {
      return;
    }

    setTasks((items) => {
      const oldIndex = items.findIndex((item) => item.id === active.id);
      const newIndex = items.findIndex((item) => item.id === over.id);

      const reorderedTasks = arrayMove(items, oldIndex, newIndex);
      
      // Update priority orders for the affected category
      const categoryTasks = reorderedTasks.filter(t => t.category === activeTask.category);
      categoryTasks.forEach((task, index) => {
        task.priorityOrder = index;
      });

      // Update other categories' tasks
      const otherTasks = reorderedTasks.filter(t => t.category !== activeTask.category);
      const finalTasks = [...categoryTasks, ...otherTasks].sort((a, b) => {
        if (a.category !== b.category) {
          const categoryOrder = { work: 0, learning: 1, health: 2, leisure: 3 };
          return categoryOrder[a.category] - categoryOrder[b.category];
        }
        return a.priorityOrder - b.priorityOrder;
      });

      // Save to localStorage
      localStorage.setItem('customTasks', JSON.stringify(finalTasks));
      onTasksUpdate(finalTasks);

      // Here you would send the reorder request to the backend
      handleReorderAPI(finalTasks.filter(t => t.category === activeTask.category));

      return finalTasks;
    });
  };

  // API call to update task order (placeholder for backend integration)
  const handleReorderAPI = async (categoryTasks: Task[]) => {
    try {
      const reorderData = categoryTasks.map(task => ({
        task_id: task.id,
        new_priority_order: task.priorityOrder,
      }));

      // Uncomment when backend is ready
      /*
      const response = await fetch('/tasks/reorder', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(reorderData),
      });

      if (!response.ok) {
        throw new Error('Failed to update task order');
      }
      */

      console.log('Task reorder would be sent to backend:', reorderData);
    } catch (error) {
      console.error('Error reordering tasks:', error);
      // Optionally revert the order on error
    }
  };

  const handleAddTask = () => {
    const categoryTasks = tasks.filter(t => t.category === newTask.category);
    const maxPriority = categoryTasks.length > 0 
      ? Math.max(...categoryTasks.map(t => t.priorityOrder))
      : -1;

    const taskToAdd = {
      ...newTask,
      id: Date.now().toString(),
      priorityOrder: maxPriority + 1,
    };
    
    const updatedTasks = [...tasks, taskToAdd].sort((a, b) => {
      if (a.category !== b.category) {
        const categoryOrder = { work: 0, learning: 1, health: 2, leisure: 3 };
        return categoryOrder[a.category] - categoryOrder[b.category];
      }
      return a.priorityOrder - b.priorityOrder;
    });
    
    saveTasks(updatedTasks);
    setIsAddingTask(false);
    setNewTask({
      id: '',
      name: '',
      category: 'work',
      totalHours: 1,
      sessions: 1,
      focusMinutes: 55,
      breakMinutes: 5,
      color: 'blue',
      icon: '💼',
      priorityOrder: 0,
    });
  };

  const handleEditTask = (task: Task) => {
    const updatedTasks = tasks.map(t => t.id === task.id ? task : t);
    saveTasks(updatedTasks);
    setEditingTask(null);
  };

  const handleDeleteTask = (taskId: string) => {
    if (window.confirm('Are you sure you want to delete this task?')) {
      const taskToDelete = tasks.find(t => t.id === taskId);
      if (!taskToDelete) return;

      const updatedTasks = tasks
        .filter(t => t.id !== taskId)
        .map(task => {
          // Adjust priority for tasks in the same category that come after the deleted task
          if (task.category === taskToDelete.category && task.priorityOrder > taskToDelete.priorityOrder) {
            return { ...task, priorityOrder: task.priorityOrder - 1 };
          }
          return task;
        });
      
      saveTasks(updatedTasks);
    }
  };

  const categoryColors = {
    work: 'bg-blue-500/10 border-blue-500/20',
    learning: 'bg-green-500/10 border-green-500/20',
    health: 'bg-red-500/10 border-red-500/20',
    leisure: 'bg-pink-500/10 border-pink-500/20'
  };

  const getSessionTime = (task: Task) => {
    if (task.sessions === 0 || task.focusMinutes === 0) return 'No timer';
    return `${task.sessions} × ${task.focusMinutes}min + ${task.breakMinutes}min break`;
  };

  const getTotalTime = () => {
    return tasks.reduce((acc, task) => acc + task.totalHours, 0);
  };

  return (
    <div className="p-6 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-xl">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <Settings className="w-6 h-6 text-blue-400" />
            Task Manager
          </h2>
          <p className="text-slate-400 mt-1">Customize your daily schedule • Drag to reorder</p>
        </div>
        <div className="text-right">
          <div className="text-sm text-slate-400">Total Daily Hours</div>
          <div className="text-2xl font-bold text-white">{getTotalTime()}h / 24h</div>
          <div className={`text-sm mt-1 ${getTotalTime() > 24 ? 'text-red-400' : 'text-green-400'}`}>
            {getTotalTime() > 24 ? `⚠️ Exceeds 24h by ${getTotalTime() - 24}h` : `✓ ${24 - getTotalTime()}h free`}
          </div>
        </div>
      </div>

      {/* Add Task Button */}
      <div className="mb-6">
        <button
          onClick={() => setIsAddingTask(true)}
          className="w-full py-3 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white rounded-lg flex items-center justify-center gap-2 transition-all transform hover:scale-[1.02] shadow-lg"
        >
          <Plus className="w-5 h-5" />
          Add New Task
        </button>
      </div>

      {/* Add Task Form */}
      {isAddingTask && (
        <div className="mb-6 p-4 bg-slate-800/50 rounded-lg border border-blue-500/30">
          <h3 className="text-lg font-semibold text-white mb-4">New Task</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm text-slate-400">Task Name</label>
              <input
                type="text"
                value={newTask.name}
                onChange={(e) => setNewTask({ ...newTask, name: e.target.value })}
                className="w-full mt-1 px-3 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-white focus:border-blue-400 focus:outline-none"
                placeholder="e.g., DevOps Practice"
              />
            </div>
            <div>
              <label className="text-sm text-slate-400">Category</label>
              <select
                value={newTask.category}
                onChange={(e) => setNewTask({ ...newTask, category: e.target.value as any })}
                className="w-full mt-1 px-3 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-white focus:border-blue-400 focus:outline-none"
              >
                <option value="work">Work</option>
                <option value="learning">Learning</option>
                <option value="health">Health</option>
                <option value="leisure">Leisure</option>
              </select>
            </div>
            <div>
              <label className="text-sm text-slate-400">Total Hours</label>
              <input
                type="number"
                step="0.5"
                min="0.5"
                max="24"
                value={newTask.totalHours}
                onChange={(e) => setNewTask({ ...newTask, totalHours: parseFloat(e.target.value) })}
                className="w-full mt-1 px-3 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-white focus:border-blue-400 focus:outline-none"
              />
            </div>
            <div>
              <label className="text-sm text-slate-400">Number of Sessions</label>
              <input
                type="number"
                min="0"
                max="10"
                value={newTask.sessions}
                onChange={(e) => setNewTask({ ...newTask, sessions: parseInt(e.target.value) })}
                className="w-full mt-1 px-3 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-white focus:border-blue-400 focus:outline-none"
              />
            </div>
            <div>
              <label className="text-sm text-slate-400">Focus Time (minutes)</label>
              <input
                type="number"
                min="0"
                max="120"
                value={newTask.focusMinutes}
                onChange={(e) => setNewTask({ ...newTask, focusMinutes: parseInt(e.target.value) })}
                className="w-full mt-1 px-3 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-white focus:border-blue-400 focus:outline-none"
                disabled={newTask.sessions === 0}
              />
            </div>
            <div>
              <label className="text-sm text-slate-400">Break Time (minutes)</label>
              <input
                type="number"
                min="0"
                max="30"
                value={newTask.breakMinutes}
                onChange={(e) => setNewTask({ ...newTask, breakMinutes: parseInt(e.target.value) })}
                className="w-full mt-1 px-3 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-white focus:border-blue-400 focus:outline-none"
                disabled={newTask.sessions === 0}
              />
            </div>
            <div>
              <label className="text-sm text-slate-400">Icon</label>
              <input
                type="text"
                value={newTask.icon}
                onChange={(e) => setNewTask({ ...newTask, icon: e.target.value })}
                className="w-full mt-1 px-3 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-white focus:border-blue-400 focus:outline-none"
                placeholder="e.g., 🚀"
              />
            </div>
          </div>
          <div className="flex gap-2 mt-4">
            <button
              onClick={handleAddTask}
              disabled={!newTask.name}
              className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg flex items-center gap-2 disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              Save Task
            </button>
            <button
              onClick={() => setIsAddingTask(false)}
              className="px-4 py-2 bg-slate-600 hover:bg-slate-700 text-white rounded-lg flex items-center gap-2"
            >
              <X className="w-4 h-4" />
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Tasks List with Drag and Drop */}
      <div className="space-y-6">
        {Object.entries(
          tasks.reduce((acc, task) => {
            if (!acc[task.category]) acc[task.category] = [];
            acc[task.category].push(task);
            return acc;
          }, {} as Record<string, Task[]>)
        ).map(([category, categoryTasks]) => {
          const sortedCategoryTasks = [...categoryTasks].sort((a, b) => a.priorityOrder - b.priorityOrder);
          
          return (
            <div key={category}>
              <h3 className="text-sm font-semibold text-slate-400 uppercase mb-3 flex items-center gap-2">
                <span>{category}</span>
                <span className="text-xs">({categoryTasks.reduce((acc, t) => acc + t.totalHours, 0)}h)</span>
                <span className="text-xs text-slate-500">• Drag to reorder</span>
              </h3>
              
              <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handleDragEnd}
              >
                <SortableContext
                  items={sortedCategoryTasks.map(t => t.id)}
                  strategy={verticalListSortingStrategy}
                >
                  {sortedCategoryTasks.map((task) => (
                    <SortableTaskItem
                      key={task.id}
                      task={task}
                      categoryColor={categoryColors[task.category as keyof typeof categoryColors]}
                      onEdit={() => setEditingTask(task.id)}
                      onDelete={() => handleDeleteTask(task.id)}
                      getSessionTime={getSessionTime}
                      editingTask={editingTask}
                      onSave={handleEditTask}
                      onCancelEdit={() => setEditingTask(null)}
                    />
                  ))}
                </SortableContext>
              </DndContext>
            </div>
          );
        })}
      </div>

      {/* Reset to Default Button */}
      <div className="mt-6 pt-6 border-t border-slate-700">
        <button
          onClick={() => {
            if (window.confirm('Reset all tasks to default? This will remove all your custom tasks.')) {
              loadDefaultTasks();
            }
          }}
          className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg flex items-center gap-2 transition-colors"
        >
          <Clock className="w-4 h-4" />
          Reset to Default Tasks
        </button>
      </div>
    </div>
  );
};

// Edit Task Form Component
const EditTaskForm: React.FC<{
  task: Task;
  onSave: (task: Task) => void;
  onCancel: () => void;
}> = ({ task, onSave, onCancel }) => {
  const [editedTask, setEditedTask] = useState(task);

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-3">
        <input
          type="text"
          value={editedTask.name}
          onChange={(e) => setEditedTask({ ...editedTask, name: e.target.value })}
          className="px-2 py-1 bg-slate-700/50 border border-slate-600 rounded text-white text-sm"
          placeholder="Task name"
        />
        <select
          value={editedTask.category}
          onChange={(e) => setEditedTask({ ...editedTask, category: e.target.value as any })}
          className="px-2 py-1 bg-slate-700/50 border border-slate-600 rounded text-white text-sm"
        >
          <option value="work">Work</option>
          <option value="learning">Learning</option>
          <option value="health">Health</option>
          <option value="leisure">Leisure</option>
        </select>
        <input
          type="number"
          step="0.5"
          value={editedTask.totalHours}
          onChange={(e) => setEditedTask({ ...editedTask, totalHours: parseFloat(e.target.value) })}
          className="px-2 py-1 bg-slate-700/50 border border-slate-600 rounded text-white text-sm"
          placeholder="Total hours"
        />
        <input
          type="number"
          value={editedTask.sessions}
          onChange={(e) => setEditedTask({ ...editedTask, sessions: parseInt(e.target.value) })}
          className="px-2 py-1 bg-slate-700/50 border border-slate-600 rounded text-white text-sm"
          placeholder="Sessions"
        />
        <input
          type="number"
          value={editedTask.focusMinutes}
          onChange={(e) => setEditedTask({ ...editedTask, focusMinutes: parseInt(e.target.value) })}
          className="px-2 py-1 bg-slate-700/50 border border-slate-600 rounded text-white text-sm"
          placeholder="Focus mins"
          disabled={editedTask.sessions === 0}
        />
        <input
          type="number"
          value={editedTask.breakMinutes}
          onChange={(e) => setEditedTask({ ...editedTask, breakMinutes: parseInt(e.target.value) })}
          className="px-2 py-1 bg-slate-700/50 border border-slate-600 rounded text-white text-sm"
          placeholder="Break mins"
          disabled={editedTask.sessions === 0}
        />
      </div>
      <div className="flex gap-2">
        <button
          onClick={() => onSave(editedTask)}
          className="px-3 py-1 bg-green-600 hover:bg-green-700 text-white rounded text-sm flex items-center gap-1"
        >
          <Save className="w-3 h-3" />
          Save
        </button>
        <button
          onClick={onCancel}
          className="px-3 py-1 bg-slate-600 hover:bg-slate-700 text-white rounded text-sm flex items-center gap-1"
        >
          <X className="w-3 h-3" />
          Cancel
        </button>
      </div>
    </div>
  );
};

export default TaskManager;
