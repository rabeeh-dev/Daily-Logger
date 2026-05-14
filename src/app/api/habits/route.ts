import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import connectDB from '@/lib/db';
import { Habit, HabitLog } from '@/models/Habit';
import { addXP } from '@/lib/xp';
import { HABIT_DEFAULTS } from '@/lib/utils';

export async function GET(request: NextRequest) {
  try {
    await requireAuth();
    await connectDB();

    const type = request.nextUrl.searchParams.get('type');

    if (type === 'habits') {
      let habits = await Habit.find({ active: true });
      if (habits.length === 0) {
        habits = await Habit.insertMany(HABIT_DEFAULTS);
      }
      return NextResponse.json(habits);
    }

    // Default: get today's habit log
    const dateParam = request.nextUrl.searchParams.get('date');
    const date = dateParam ? new Date(dateParam) : new Date();
    const today = new Date(date);
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const habits = await Habit.find({ active: true });
    let log = await HabitLog.findOne({ date: { $gte: today, $lt: tomorrow } });

    if (!log) {
      log = await HabitLog.create({
        date: today,
        habits: habits.map(h => ({
          habitId: h._id,
          name: h.name,
          completed: false,
          xpEarned: 0,
        })),
        completionRate: 0,
      });
    }

    // Get streak data (last 7 days)
    const weekAgo = new Date(today);
    weekAgo.setDate(weekAgo.getDate() - 7);
    const recentLogs = await HabitLog.find({
      date: { $gte: weekAgo, $lt: tomorrow }
    }).sort({ date: 1 });

    return NextResponse.json({
      habits,
      log,
      recentLogs,
    });
  } catch (error) {
    console.error('Habits GET error:', error);
    return NextResponse.json({ error: 'Failed to load habits' }, { status: 500 });
  }
}


export async function PUT(request: NextRequest) {
  try {
    await requireAuth();
    await connectDB();

    const body = await request.json();
    const { logId, habitIndex, completed } = body;

    const log = await HabitLog.findById(logId);
    if (!log) {
      return NextResponse.json({ error: 'Log not found' }, { status: 404 });
    }

    const habitItem = log.habits[habitIndex];
    const wasCompleted = habitItem.completed;
    
    habitItem.completed = completed;
    habitItem.xpEarned = completed ? 20 : 0;

    // Award XP if completing for the first time today
    if (completed && !habitItem.xpAwarded) {
      habitItem.xpAwarded = true;
      await addXP('admin', 20, `Completed habit: ${habitItem.name}`);
    }

    const completedCount = log.habits.filter((h: { completed: boolean }) => h.completed).length;
    log.completionRate = Math.round((completedCount / log.habits.length) * 100);

    await log.save();

    // Update habit streak (only if newly completed)
    if (habitItem.habitId && completed && !wasCompleted) {
      const habit = await Habit.findById(habitItem.habitId);
      if (habit) {
        habit.totalCompletions += 1;
        await habit.save();
      }
    }

    return NextResponse.json(log);
  } catch (error) {
    console.error('Habits PUT error:', error);
    return NextResponse.json({ error: 'Failed to update habit' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    await requireAuth();
    await connectDB();

    const body = await request.json();
    const habit = await Habit.create(body);

    // Sync the new habit to today's log if it exists
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const log = await HabitLog.findOne({ date: { $gte: today, $lt: tomorrow } });
    if (log) {
      log.habits.push({
        habitId: habit._id,
        name: habit.name,
        completed: false,
        xpEarned: 0,
        xpAwarded: false,
      });
      // Recalculate completion rate
      const completedCount = log.habits.filter((h: { completed: boolean }) => h.completed).length;
      log.completionRate = Math.round((completedCount / log.habits.length) * 100);
      await log.save();
    }

    return NextResponse.json(habit);
  } catch (error) {
    console.error('Habits POST error:', error);
    return NextResponse.json({ error: 'Failed to create habit' }, { status: 500 });
  }
}
