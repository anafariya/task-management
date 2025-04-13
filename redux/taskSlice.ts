import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Task } from '../types';
import { checkTimeConflict, getRandomColor } from '../utils/timeUtils';

interface TaskState {
  tasks: Task[];
  error: string | null;
}

// Load tasks from localStorage
const loadTasksFromStorage = (): Task[] => {
  if (typeof window !== 'undefined') {
    const saved = localStorage.getItem('tasks');
    if (saved) {
      return JSON.parse(saved);
    }
  }
  return [];
};

// Save tasks to localStorage
const saveTasksToStorage = (tasks: Task[]) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem('tasks', JSON.stringify(tasks));
  }
};

const initialState: TaskState = {
  tasks: [],
  error: null,
};

export const taskSlice = createSlice({
  name: 'tasks',
  initialState,
  reducers: {
    addTask: (state, action: PayloadAction<Task>) => {
      const newTask = {
        ...action.payload,
        color: getRandomColor(), // Assign a random color
      };
      
      // Check for time conflicts
      const conflict = state.tasks.find(task => checkTimeConflict(task, newTask));
      
      if (conflict) {
        state.error = 'Time slot overlaps with another task';
        return;
      }
      
      state.tasks.push(newTask);
      state.error = null;
      saveTasksToStorage(state.tasks);
    },
    editTask: (state, action: PayloadAction<Task>) => {
      const updatedTask = action.payload;
      
      // Find all other tasks (excluding the current one being edited)
      const otherTasks = state.tasks.filter(task => task.id !== updatedTask.id);
      
      // Check for time conflicts with other tasks
      const conflict = otherTasks.find(task => checkTimeConflict(task, updatedTask));
      
      if (conflict) {
        state.error = 'Time slot overlaps with another task';
        return;
      }
      
      const index = state.tasks.findIndex(task => task.id === updatedTask.id);
      if (index !== -1) {
        // Preserve the color when editing
        state.tasks[index] = {
          ...updatedTask,
          color: state.tasks[index].color
        };
        state.error = null;
        saveTasksToStorage(state.tasks);
      }
    },
    deleteTask: (state, action: PayloadAction<string>) => {
      state.tasks = state.tasks.filter(task => task.id !== action.payload);
      state.error = null;
      saveTasksToStorage(state.tasks);
    },
    clearError: (state) => {
      state.error = null;
    },
    initializeFromStorage: (state) => {
      state.tasks = loadTasksFromStorage();
    }
  },
});

export const { 
  addTask, 
  editTask, 
  deleteTask, 
  clearError,
  initializeFromStorage
} = taskSlice.actions;

export default taskSlice.reducer;