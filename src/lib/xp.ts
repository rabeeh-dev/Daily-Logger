import XPProgress from '@/models/XPProgress';
import connectDB from '@/lib/db';

export const XP_PER_LEVEL = 1000; // Standardizing on 1000 for easier visual progress

export function calculateLevel(totalXP: number): number {
  return Math.floor(totalXP / XP_PER_LEVEL) + 1;
}

export function getXPProgress(totalXP: number) {
  const currentLevelXP = totalXP % XP_PER_LEVEL;
  const level = calculateLevel(totalXP);
  const progressPercent = (currentLevelXP / XP_PER_LEVEL) * 100;
  
  return {
    currentLevelXP,
    nextLevelXP: XP_PER_LEVEL,
    progressPercent,
    level
  };
}

export async function addXP(userId: string, amount: number, description: string) {
  await connectDB();
  
  let progress = await XPProgress.findOne(); 
  if (!progress) {
    progress = await XPProgress.create({ totalXP: 0, level: 1 });
  }

  const oldLevel = progress.level;
  progress.totalXP += amount;
  progress.level = calculateLevel(progress.totalXP);
  
  progress.xpHistory.push({
    date: new Date(),
    amount,
    source: 'SYSTEM',
    description
  });

  // Handle streak update if needed (simple logic: if active today)
  const today = new Date();
  today.setHours(0,0,0,0);
  
  if (!progress.lastActiveDate || progress.lastActiveDate < today) {
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    if (progress.lastActiveDate && progress.lastActiveDate >= yesterday) {
      progress.currentStreak += 1;
    } else {
      progress.currentStreak = 1;
    }
    
    if (progress.currentStreak > progress.longestStreak) {
      progress.longestStreak = progress.currentStreak;
    }
    progress.lastActiveDate = today;
  }

  await progress.save();
  
  return {
    leveledUp: progress.level > oldLevel,
    newLevel: progress.level,
    totalXP: progress.totalXP,
    ...getXPProgress(progress.totalXP)
  };
}
