// API Service for backend integration
// These functions are ready to be connected to your backend

// const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api';

export interface TaskUpdatePayload {
  task_id: string;
  completed: boolean;
}

export interface TaskDeletePayload {
  task_id: string;
}

// Optimistic update helper
const optimisticUpdate = async <T>(
  optimisticAction: () => void,
  apiCall: () => Promise<T>,
  rollbackAction?: () => void
): Promise<T> => {
  // Apply optimistic update immediately
  optimisticAction();

  try {
    // Make API call
    const result = await apiCall();
    return result;
  } catch (error) {
    // Rollback on error
    if (rollbackAction) {
      rollbackAction();
    }
    console.error('API call failed:', error);
    throw error;
  }
};

// Mark task as complete
export const completeTask = async (
  taskId: string,
  completed: boolean,
  optimisticAction: () => void,
  rollbackAction: () => void
): Promise<void> => {
  return optimisticUpdate(
    optimisticAction,
    async () => {
      // Uncomment when backend is ready
      /*
      const response = await fetch(`${API_BASE_URL}/tasks/${taskId}/complete`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ completed }),
      });

      if (!response.ok) {
        throw new Error('Failed to update task');
      }

      return response.json();
      */
      
      // Simulate API call for development
      return new Promise((resolve) => {
        setTimeout(() => {
          console.log(`Task ${taskId} marked as ${completed ? 'complete' : 'incomplete'}`);
          resolve(undefined);
        }, 300);
      });
    },
    rollbackAction
  );
};

// Delete task
export const deleteTask = async (
  taskId: string,
  optimisticAction: () => void,
  rollbackAction: () => void
): Promise<void> => {
  return optimisticUpdate(
    optimisticAction,
    async () => {
      // Uncomment when backend is ready
      /*
      const response = await fetch(`${API_BASE_URL}/tasks/${taskId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete task');
      }

      return response.json();
      */
      
      // Simulate API call for development
      return new Promise((resolve) => {
        setTimeout(() => {
          console.log(`Task ${taskId} deleted`);
          resolve(undefined);
        }, 300);
      });
    },
    rollbackAction
  );
};

// Batch update tasks after reordering
export const reorderTasks = async (
  tasks: Array<{ task_id: string; new_priority_order: number }>,
  optimisticAction: () => void,
  rollbackAction: () => void
): Promise<void> => {
  return optimisticUpdate(
    optimisticAction,
    async () => {
      // Uncomment when backend is ready
      /*
      const response = await fetch(`${API_BASE_URL}/tasks/reorder`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(tasks),
      });

      if (!response.ok) {
        throw new Error('Failed to reorder tasks');
      }

      return response.json();
      */
      
      // Simulate API call for development
      return new Promise((resolve) => {
        setTimeout(() => {
          console.log('Tasks reordered:', tasks);
          resolve(undefined);
        }, 300);
      });
    },
    rollbackAction
  );
};