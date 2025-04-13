import { Task } from '../types';

// Convert time string to minutes for easier comparison
export const timeToMinutes = (time: string): number => {
  const [hours, minutes] = time.split(':').map(Number);
  return hours * 60 + minutes;
};

// Check if two tasks have overlapping time
export const checkTimeConflict = (task1: Task, task2: Task): boolean => {
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

// Generate time slots for the day view (from 8 AM to 8 PM)
export const generateTimeSlots = (): string[] => {
  const slots = [];
  for (let hour = 8; hour <= 20; hour++) {
    const period = hour < 12 ? 'AM' : 'PM';
    const displayHour = hour <= 12 ? hour : hour - 12;
    slots.push(`${displayHour}:00 ${period}`);
  }
  return slots;
};

// Format time for display (e.g., "9:00 AM")
export const formatTime = (time: string): string => {
  const [hoursStr, minutesStr] = time.split(':');
  const hours = parseInt(hoursStr, 10);
  const minutes = parseInt(minutesStr, 10);
  const period = hours < 12 ? 'AM' : 'PM';
  const displayHours = hours === 0 ? 12 : hours > 12 ? hours - 12 : hours;
  return `${displayHours}:${minutes.toString().padStart(2, '0')} ${period}`;
};

export const getRandomColor = (): string => {
    const gradients = [
      'linear-gradient(135deg, #6a11cb 0%, #2575fc 100%)',   // Purple to Blue
      'linear-gradient(135deg, #43cea2 0%, #185a9d 100%)',   // Green to Teal
      'linear-gradient(135deg, #ff8008 0%, #ffc837 100%)',   // Orange to Yellow
      'linear-gradient(135deg, #ff416c 0%, #ff4b2b 100%)',   // Pink to Red
      'linear-gradient(135deg, #16a085 0%, #2980b9 100%)',   // Teal to Blue
      'linear-gradient(135deg, #4568dc 0%, #b06ab3 100%)',   // Blue to Purple
    ];
    return gradients[Math.floor(Math.random() * gradients.length)];
  };
