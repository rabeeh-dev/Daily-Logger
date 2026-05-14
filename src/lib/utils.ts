import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getWeekRange(date: Date = new Date()) {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  const monday = new Date(d.setDate(diff));
  monday.setHours(0, 0, 0, 0);
  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);
  sunday.setHours(23, 59, 59, 999);
  return { start: monday, end: sunday };
}

export function formatDate(date: Date | string) {
  return new Date(date).toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });
}

export function getXPLevel(xp: number) {
  const level = Math.floor(xp / 500) + 1;
  const currentLevelXP = xp % 500;
  const nextLevelXP = 500;
  return { level, currentLevelXP, nextLevelXP, progress: (currentLevelXP / nextLevelXP) * 100 };
}

export function getStreakEmoji(streak: number) {
  if (streak >= 30) return '👑';
  if (streak >= 14) return '🔥';
  if (streak >= 7) return '⚡';
  if (streak >= 3) return '💪';
  return '🌱';
}

export const CATEGORIES = [
  { value: 'development', label: 'Development', color: '#3b82f6' },
  { value: 'dsa', label: 'DSA', color: '#8b5cf6' },
  { value: 'fitness', label: 'Fitness', color: '#10b981' },
  { value: 'spiritual', label: 'Spiritual', color: '#f59e0b' },
  { value: 'learning', label: 'Learning', color: '#06b6d4' },
  { value: 'personal', label: 'Personal', color: '#ec4899' },
  { value: 'freelance', label: 'Freelance', color: '#f97316' },
  { value: 'branding', label: 'Branding', color: '#a855f7' },
] as const;

export const HABIT_DEFAULTS = [
  { name: 'Workout', icon: '💪', category: 'fitness' },
  { name: 'Sleep 7h+', icon: '😴', category: 'health' },
  { name: 'Reading', icon: '📚', category: 'learning' },
  { name: 'Water 3L', icon: '💧', category: 'health' },
  { name: 'Prayers', icon: '🤲', category: 'spiritual' },
  { name: 'Screen Control', icon: '📵', category: 'health' },
  { name: 'Meditation', icon: '🧘', category: 'health' },
  { name: 'Coding', icon: '💻', category: 'development' },
];
