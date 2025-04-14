import { Task } from '../types';

// Convert time string to minutes for easier comparison
export const timeToMinutes = (time: string): number => {
  const [hours, minutes] = time.split(':').map(Number);
  return hours * 60 + minutes;
};

// Check if two tasks have overlapping time on the same day
export const checkTimeConflict = (task1: Task, task2: Task): boolean => {
  // Different days never conflict
  if (task1.date !== task2.date) return false;
  
  const start1 = timeToMinutes(task1.startTime);
  const end1 = timeToMinutes(task1.endTime);
  const start2 = timeToMinutes(task2.startTime);
  const end2 = timeToMinutes(task2.endTime);

  return (start1 < end2 && start2 < end1);
};

// Sort tasks by start time
export const sortTasksByTime = (tasks: Task[]): Task[] => {
  return [...tasks].sort((a, b) => timeToMinutes(a.startTime) - timeToMinutes(b.startTime));
};

// Generate time slots for the day view in 24-hour format (from 0:00 to 23:00 for full day)
export const generateTimeSlots = (): string[] => {
  const slots = [];
  for (let hour = 0; hour < 24; hour++) {
    slots.push(`${hour.toString().padStart(2, '0')}:00`);
  }
  return slots;
};

// Format time for display in 24-hour format (e.g., "09:00", "14:30")
export const formatTime = (time: string): string => {
  if (!time) return "";
  
  const [hoursStr, minutesStr] = time.split(':');
  const hours = parseInt(hoursStr, 10);
  const minutes = parseInt(minutesStr, 10);
  
  if (isNaN(hours) || isNaN(minutes)) return time;
  
  return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
};

// Calculate duration between start and end time in minutes
export const calculateDuration = (startTime: string, endTime: string): number => {
  return timeToMinutes(endTime) - timeToMinutes(startTime);
};

// Format duration for display
export const formatDuration = (minutes: number): string => {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  
  if (hours === 0) return `${mins}m`;
  if (mins === 0) return `${hours}h`;
  return `${hours}h ${mins}m`;
};

// Get today's date in YYYY-MM-DD format
export const getTodayDateString = (): string => {
  const today = new Date();
  return today.toISOString().split('T')[0];
};

// Format date for display (e.g., "Monday, April 14")
export const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric'
  });
};

// Check if a date is today
export const isToday = (dateString: string): boolean => {
  const today = new Date();
  const todayString = today.toISOString().split('T')[0];
  return dateString === todayString;
};

// Get next day's date string
export const getNextDay = (dateString: string): string => {
  const date = new Date(dateString);
  date.setDate(date.getDate() + 1);
  return date.toISOString().split('T')[0];
};

// Get previous day's date string
export const getPreviousDay = (dateString: string): string => {
  const date = new Date(dateString);
  date.setDate(date.getDate() - 1);
  return date.toISOString().split('T')[0];
};