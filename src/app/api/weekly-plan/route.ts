import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import connectDB from '@/lib/db';
import WeeklyPlan from '@/models/WeeklyPlan';
import { addXP } from '@/lib/xp';
import { getWeekRange } from '@/lib/utils';

export async function GET(request: NextRequest) {
  try {
    await requireAuth();
    await connectDB();

    const dateParam = request.nextUrl.searchParams.get('date');
    const date = dateParam ? new Date(dateParam) : new Date();
    const { start, end } = getWeekRange(date);

    let plan = await WeeklyPlan.findOne({
      weekStart: { $gte: new Date(start.getFullYear(), start.getMonth(), start.getDate()), $lte: end }
    });

    if (!plan) {
      plan = await WeeklyPlan.create({
        weekStart: start,
        weekEnd: end,
        weekLabel: `Week of ${start.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`,
        goals: [],
      });
    }

    return NextResponse.json(plan);
  } catch (error) {
    console.error('Weekly plan GET error:', error);
    return NextResponse.json({ error: 'Failed to load weekly plan' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    await requireAuth();
    await connectDB();

    const body = await request.json();
    const { weekStart, weekEnd, weekLabel, goals } = body;

    const plan = await WeeklyPlan.findOneAndUpdate(
      { weekStart: new Date(weekStart) },
      { weekStart: new Date(weekStart), weekEnd: new Date(weekEnd), weekLabel, goals },
      { upsert: true, new: true }
    );

    return NextResponse.json(plan);
  } catch (error) {
    console.error('Weekly plan POST error:', error);
    return NextResponse.json({ error: 'Failed to save weekly plan' }, { status: 500 });
  }
}


export async function PUT(request: NextRequest) {
  try {
    await requireAuth();
    await connectDB();

    const body = await request.json();
    const { _id, goals, ...updates } = body;

    const existingPlan = await WeeklyPlan.findById(_id);
    if (!existingPlan) {
      return NextResponse.json({ error: 'Plan not found' }, { status: 404 });
    }

    let xpToAdd = 0;
    const updatedGoals = (goals || []).map((goal: any) => {
      // Find matching goal in DB
      const matched = existingPlan.goals.find((g: any) => g.title === goal.title);
      
      if (goal.completed && (!matched || !matched.xpAwarded)) {
        xpToAdd += 100; // 100 XP for weekly goal completion
        return { ...goal, xpAwarded: true, completedAt: new Date() };
      }
      return matched ? { ...goal, xpAwarded: matched.xpAwarded, completedAt: matched.completedAt } : goal;
    });

    const plan = await WeeklyPlan.findByIdAndUpdate(_id, {
      ...updates,
      goals: updatedGoals
    }, { new: true });

    if (!plan) {
      return NextResponse.json({ error: 'Plan not found' }, { status: 404 });
    }

    if (xpToAdd > 0) {
      await addXP('admin', xpToAdd, `Weekly Goal(s) Completed`);
    }

    // Recalculate completion percentage
    const completedCount = plan.goals.filter((g: { completed: boolean }) => g.completed).length;
    plan.completionPercentage = plan.goals.length > 0 ? Math.round((completedCount / plan.goals.length) * 100) : 0;
    await plan.save();

    return NextResponse.json(plan);
  } catch (error) {
    console.error('Weekly plan PUT error:', error);
    return NextResponse.json({ error: 'Failed to update weekly plan' }, { status: 500 });
  }
}
