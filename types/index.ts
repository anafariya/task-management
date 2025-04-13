export interface Task {
    id: string;
    title: string;
    description: string;
    startTime: string; // HH:MM format
    endTime: string;   // HH:MM format
    color?: string;    // For color coding different tasks
  }