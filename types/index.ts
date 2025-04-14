export interface Task {
  id: string;
  title: string;
  description: string;
  startTime: string; // HH:MM format
  endTime: string;   // HH:MM format
  category: string;  // Category color value
  date: string;      // YYYY-MM-DD format
  completed: boolean;
}

export interface Category {
  id: string;
  name: string;
  color: string;
}

export const DEFAULT_CATEGORIES: Category[] = [
  { id: 'work', name: 'Work', color: 'linear-gradient(135deg, #ff7e8a 0%, #ffb3a7 100%)' },
  { id: 'personal', name: 'Personal', color: 'linear-gradient(135deg, #ff9a9e 0%, #fad0c4 100%)' },
  { id: 'health', name: 'Health', color: 'linear-gradient(135deg, #f6d5f7 0%, #fbe9d7 100%)' },
  { id: 'education', name: 'Education', color: 'linear-gradient(135deg, #ff9e9d 0%, #f3c1f0 100%)' },
  { id: 'social', name: 'Social', color: 'linear-gradient(135deg, #fdcbf1 0%, #fdcbd5 100%)' },
];