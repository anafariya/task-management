import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Task, Category, DEFAULT_CATEGORIES } from '../types';
import { checkTimeConflict, getTodayDateString } from '../utils/timeUtils';

interface TaskState {
  tasks: Task[];
  categories: Category[];
  selectedDate: string;
  error: string | null;
  isLoading: boolean;
}

// Load data from localStorage
const loadFromStorage = <T>(key: string, defaultValue: T): T => {
  if (typeof window !== 'undefined') {
    const saved = localStorage.getItem(key);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error(`Error parsing ${key} from localStorage:`, e);
      }
    }
  }
  return defaultValue;
};

// Save data to localStorage
const saveToStorage = <T>(key: string, data: T) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem(key, JSON.stringify(data));
  }
};

const initialState: TaskState = {
  tasks: [],
  categories: DEFAULT_CATEGORIES,
  selectedDate: getTodayDateString(),
  error: null,
  isLoading: true,
};

export const taskSlice = createSlice({
  name: 'tasks',
  initialState,
  reducers: {
    addTask: (state, action: PayloadAction<Task>) => {
      // If task doesn't have a date, set it to selectedDate
      const newTask = { 
        ...action.payload,
        date: action.payload.date || state.selectedDate
      };

      // Check for time conflicts
      const conflict = state.tasks.find(task => checkTimeConflict(task, newTask));
      
      if (conflict) {
        state.error = `Time slot overlaps with "${conflict.title}"`;
        return;
      }
      
      state.tasks.push(newTask);
      state.error = null;
      saveToStorage('tasks', state.tasks);
    },
    
    editTask: (state, action: PayloadAction<Task>) => {
      const updatedTask = action.payload;
      
      // Find all other tasks (excluding the current one being edited)
      const otherTasks = state.tasks.filter(task => task.id !== updatedTask.id);
      
      // Check for time conflicts with other tasks
      const conflict = otherTasks.find(task => checkTimeConflict(task, updatedTask));
      
      if (conflict) {
        state.error = `Time slot overlaps with "${conflict.title}"`;
        return;
      }
      
      const index = state.tasks.findIndex(task => task.id === updatedTask.id);
      if (index !== -1) {
        state.tasks[index] = updatedTask;
        state.error = null;
        saveToStorage('tasks', state.tasks);
      }
    },
    
    deleteTask: (state, action: PayloadAction<string>) => {
      state.tasks = state.tasks.filter(task => task.id !== action.payload);
      state.error = null;
      saveToStorage('tasks', state.tasks);
    },
    
    toggleTaskCompletion: (state, action: PayloadAction<string>) => {
      const index = state.tasks.findIndex(task => task.id === action.payload);
      if (index !== -1) {
        state.tasks[index].completed = !state.tasks[index].completed;
        saveToStorage('tasks', state.tasks);
      }
    },
    
    addCategory: (state, action: PayloadAction<Category>) => {
      state.categories.push(action.payload);
      saveToStorage('categories', state.categories);
    },
    
    editCategory: (state, action: PayloadAction<Category>) => {
      const index = state.categories.findIndex(cat => cat.id === action.payload.id);
      if (index !== -1) {
        state.categories[index] = action.payload;
        saveToStorage('categories', state.categories);
      }
    },
    
    deleteCategory: (state, action: PayloadAction<string>) => {
      state.categories = state.categories.filter(cat => cat.id !== action.payload);
      saveToStorage('categories', state.categories);
    },
    
    setSelectedDate: (state, action: PayloadAction<string>) => {
      state.selectedDate = action.payload;
    },
    
    clearError: (state) => {
      state.error = null;
    },
    
    setError: (state, action: PayloadAction<string>) => {
      state.error = action.payload;
    },
    
    initializeFromStorage: (state) => {
      state.isLoading = true;
      state.tasks = loadFromStorage('tasks', []);
      state.categories = loadFromStorage('categories', DEFAULT_CATEGORIES);
      state.isLoading = false;
    }
  },
});

export const {
  addTask,
  editTask,
  deleteTask,
  toggleTaskCompletion,
  addCategory,
  editCategory,
  deleteCategory,
  setSelectedDate,
  clearError,
  setError,
  initializeFromStorage
} = taskSlice.actions;

export default taskSlice.reducer;