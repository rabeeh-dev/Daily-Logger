import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import connectDB from '@/lib/db';
import XPProgress from '@/models/XPProgress';

const ACHIEVEMENTS = [
  { id: '7-day-streak', title: '7 Day Lock-In', description: 'Maintained a 7-day streak', icon: '🔥', xpBonus: 200 },
  { id: '14-day-streak', title: 'Consistency King', description: 'Maintained a 14-day streak', icon: '👑', xpBonus: 500 },
  { id: '30-day-streak', title: 'Unstoppable', description: 'Maintained a 30-day streak', icon: '💎', xpBonus: 1000 },
  { id: 'deep-work-warrior', title: 'Deep Work Warrior', description: 'Completed 10 hours of deep work in a week', icon: '⚔️', xpBonus: 300 },
  { id: 'dsa-hunter', title: 'DSA Hunter', description: 'Solved 50 DSA problems', icon: '🎯', xpBonus: 500 },
  { id: 'first-task', title: 'First Step', description: 'Completed your first task', icon: '🌟', xpBonus: 50 },
  { id: 'level-5', title: 'Rising Star', description: 'Reached Level 5', icon: '⭐', xpBonus: 250 },
  { id: 'level-10', title: 'Power Player', description: 'Reached Level 10', icon: '🚀', xpBonus: 500 },
  { id: 'habit-master', title: 'Habit Master', description: 'Completed all habits for 7 consecutive days', icon: '🏆', xpBonus: 400 },
  { id: 'weekly-perfect', title: 'Perfect Week', description: 'Completed all weekly goals', icon: '💯', xpBonus: 300 },
];

export async function GET() {
  try {
    await requireAuth();
    await connectDB();

    let progress = await XPProgress.findOne();

    if (!progress) {
      progress = await XPProgress.create({
        totalXP: 0,
        level: 1,
        currentStreak: 0,
        longestStreak: 0,
        achievements: [],
        xpHistory: [],
      });
    }

    return NextResponse.json({ progress, availableAchievements: ACHIEVEMENTS });
  } catch (error) {
    console.error('XP GET error:', error);
    return NextResponse.json({ error: 'Failed to load XP' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    await requireAuth();
    await connectDB();

    const { amount, source, description } = await request.json();

    let progress = await XPProgress.findOne();
    if (!progress) {
      progress = await XPProgress.create({ totalXP: 0, level: 1 });
    }

    progress.totalXP += amount;
    progress.level = Math.floor(progress.totalXP / 500) + 1;

    progress.xpHistory.push({
      date: new Date(),
      amount,
      source,
      description,
    });

    // Keep only last 100 entries
    if (progress.xpHistory.length > 100) {
      progress.xpHistory = progress.xpHistory.slice(-100);
    }

    // Check for new achievements
    const newAchievements = [];
    const existingIds = progress.achievements.map((a: { id: string }) => a.id);

    if (!existingIds.includes('first-task') && source === 'task') {
      const achievement = ACHIEVEMENTS.find(a => a.id === 'first-task')!;
      progress.achievements.push({ ...achievement, unlockedAt: new Date() });
      progress.totalXP += achievement.xpBonus;
      newAchievements.push(achievement);
    }

    if (!existingIds.includes('level-5') && progress.level >= 5) {
      const achievement = ACHIEVEMENTS.find(a => a.id === 'level-5')!;
      progress.achievements.push({ ...achievement, unlockedAt: new Date() });
      progress.totalXP += achievement.xpBonus;
      newAchievements.push(achievement);
    }

    if (!existingIds.includes('level-10') && progress.level >= 10) {
      const achievement = ACHIEVEMENTS.find(a => a.id === 'level-10')!;
      progress.achievements.push({ ...achievement, unlockedAt: new Date() });
      progress.totalXP += achievement.xpBonus;
      newAchievements.push(achievement);
    }

    await progress.save();

    return NextResponse.json({ progress, newAchievements });
  } catch (error) {
    console.error('XP POST error:', error);
    return NextResponse.json({ error: 'Failed to add XP' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    await requireAuth();
    await connectDB();

    const body = await request.json();
    const progress = await XPProgress.findOneAndUpdate({}, body, { new: true, upsert: true });
    return NextResponse.json(progress);
  } catch (error) {
    console.error('XP PUT error:', error);
    return NextResponse.json({ error: 'Failed to update XP' }, { status: 500 });
  }
}
