import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import connectDB from '@/lib/db';
import DailyTask from '@/models/DailyTask';
import { addXP } from '@/lib/xp';

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

    let task = await DailyTask.findOne({ date: { $gte: today, $lt: tomorrow } });

    if (!task) {
      task = await DailyTask.create({
        date: today,
        topPriorities: [],
        additionalTasks: [],
      });
    }

    return NextResponse.json(task);
  } catch (error) {
    console.error('Daily task GET error:', error);
    return NextResponse.json({ error: 'Failed to load daily tasks' }, { status: 500 });
  }
}


export async function PUT(request: NextRequest) {
  try {
    await requireAuth();
    await connectDB();

    const body = await request.json();
    const { _id, topPriorities, additionalTasks, ...rest } = body;

    const existingTask = await DailyTask.findById(_id);
    if (!existingTask) {
      return NextResponse.json({ error: 'Task not found' }, { status: 404 });
    }

    let xpToAdd = 0;

    // Helper to process task lists for XP
    const processTasks = (incoming: any[], existing: any[], reward: number) => {
      return incoming.map(incTask => {
        // Try to find matching existing task by title or id
        const matched = existing.find(ex => ex.title === incTask.title);
        
        if (incTask.completed && (!matched || !matched.xpAwarded)) {
          xpToAdd += reward;
          return { ...incTask, xpAwarded: true };
        }
        return matched ? { ...incTask, xpAwarded: matched.xpAwarded } : incTask;
      });
    };

    const updatedTop = processTasks(topPriorities || [], existingTask.topPriorities || [], 30);
    const updatedAdditional = processTasks(additionalTasks || [], existingTask.additionalTasks || [], 15);

    const task = await DailyTask.findByIdAndUpdate(_id, {
      ...rest,
      topPriorities: updatedTop,
      additionalTasks: updatedAdditional
    }, { new: true });

    if (xpToAdd > 0) {
      await addXP('admin', xpToAdd, `Completed ${xpToAdd / 15} task(s)`);
    }

    return NextResponse.json(task);
  } catch (error) {
    console.error('Daily task PUT error:', error);
    return NextResponse.json({ error: 'Failed to update daily tasks' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    await requireAuth();
    await connectDB();

    const body = await request.json();
    const task = await DailyTask.create(body);
    return NextResponse.json(task);
  } catch (error) {
    console.error('Daily task POST error:', error);
    return NextResponse.json({ error: 'Failed to create daily task' }, { status: 500 });
  }
}
