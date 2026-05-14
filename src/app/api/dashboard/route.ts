import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import connectDB from '@/lib/db';
import WeeklyPlan from '@/models/WeeklyPlan';
import DailyTask from '@/models/DailyTask';
import { HabitLog } from '@/models/Habit';
import XPProgress from '@/models/XPProgress';
import DeepWorkSession from '@/models/DeepWorkSession';
import { getWeekRange } from '@/lib/utils';
import { getXPProgress } from '@/lib/xp';

export async function GET(request: NextRequest) {
  try {
    await requireAuth();
    await connectDB();

    const dateParam = request.nextUrl.searchParams.get('date');
    const date = dateParam ? new Date(dateParam) : new Date();

    const today = new Date(date);
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const { start: weekStart, end: weekEnd } = getWeekRange(date);

    // Parallel fetch all dashboard data
    const [weeklyPlan, dailyTask, habitLog, xpProgress, todaysSessions, weekSessions] = await Promise.all([
      WeeklyPlan.findOne({ weekStart: { $gte: weekStart, $lte: weekEnd } }),
      DailyTask.findOne({ date: { $gte: today, $lt: tomorrow } }),
      HabitLog.findOne({ date: { $gte: today, $lt: tomorrow } }),
      XPProgress.findOne(),
      DeepWorkSession.find({ date: { $gte: today, $lt: tomorrow } }),
      DeepWorkSession.find({ date: { $gte: weekStart, $lte: weekEnd } }),
    ]);

    // Calculate stats
    const weeklyGoals = weeklyPlan?.goals || [];
    const weeklyCompletion = weeklyGoals.length > 0
      ? Math.round((weeklyGoals.filter((g: { completed: boolean }) => g.completed).length / weeklyGoals.length) * 100)
      : 0;

    const dailyTasks = [...(dailyTask?.topPriorities || []), ...(dailyTask?.additionalTasks || [])];
    const dailyCompletion = dailyTasks.length > 0
      ? Math.round((dailyTasks.filter((t: { completed: boolean }) => t.completed).length / dailyTasks.length) * 100)
      : 0;

    const habitsCompletion = habitLog?.completionRate || 0;

    const todayDeepWork = todaysSessions.reduce((sum: number, s: { durationMinutes: number }) => sum + (s.durationMinutes || 0), 0);
    const weekDeepWork = weekSessions.reduce((sum: number, s: { durationMinutes: number }) => sum + (s.durationMinutes || 0), 0);

    const xp = xpProgress || { totalXP: 0, level: 1, currentStreak: 0, longestStreak: 0, achievements: [] };

    // Focus score calculation
    const deepWorkTarget = 120;
    const deepWorkScore = Math.min(100, Math.round((todayDeepWork / deepWorkTarget) * 100));
    const focusScore = Math.round((dailyCompletion + habitsCompletion + deepWorkScore) / 3);

    return NextResponse.json({
      today: {
        date: today.toISOString(),
        completion: dailyCompletion,
        tasksTotal: dailyTasks.length,
        tasksCompleted: dailyTasks.filter((t: { completed: boolean }) => t.completed).length,
        deepWorkMinutes: todayDeepWork,
        focusSessions: todaysSessions.length,
        mood: dailyTask?.mood,
        energy: dailyTask?.energy,
      },
      weekly: {
        completion: weeklyCompletion,
        goalsTotal: weeklyGoals.length,
        goalsCompleted: weeklyGoals.filter((g: { completed: boolean }) => g.completed).length,
        deepWorkMinutes: weekDeepWork,
        weekLabel: weeklyPlan?.weekLabel,
      },
      habits: {
        completionRate: habitsCompletion,
        completed: habitLog?.habits?.filter((h: { completed: boolean }) => h.completed).length || 0,
        total: habitLog?.habits?.length || 0,
      },
      xp: {
        totalXP: xp.totalXP,
        currentStreak: xp.currentStreak,
        longestStreak: xp.longestStreak,
        achievementsCount: xp.achievements?.length || 0,
        ...getXPProgress(xp.totalXP)
      },
      focusScore,
    });
  } catch (error) {
    console.error('Dashboard error:', error);
    return NextResponse.json({ error: 'Failed to load dashboard' }, { status: 500 });
  }
}
