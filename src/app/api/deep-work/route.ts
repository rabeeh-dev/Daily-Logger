import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import connectDB from '@/lib/db';
import DeepWorkSession from '@/models/DeepWorkSession';
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
    const sessions = await DeepWorkSession.find({ date: { $gte: today, $lt: tomorrow } }).sort({ startTime: -1 });
    return NextResponse.json(sessions);
  } catch (error) {
    console.error('Deep work GET error:', error);
    return NextResponse.json({ error: 'Failed to load sessions' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    await requireAuth();
    await connectDB();
    const body = await request.json();
    const session = await DeepWorkSession.create({
      ...body,
      date: new Date(),
      startTime: new Date(),
    });
    return NextResponse.json(session);
  } catch (error) {
    console.error('Deep work POST error:', error);
    return NextResponse.json({ error: 'Failed to create session' }, { status: 500 });
  }
}


export async function PUT(request: NextRequest) {
  try {
    await requireAuth();
    await connectDB();
    const body = await request.json();
    const { _id, ...updates } = body;

    const existingSession = await DeepWorkSession.findById(_id);
    if (!existingSession) {
      return NextResponse.json({ error: 'Session not found' }, { status: 404 });
    }

    // Award XP if session is marked completed and has a duration
    if (updates.completed && !existingSession.xpAwarded) {
      const duration = updates.durationMinutes || existingSession.durationMinutes || 0;
      if (duration > 0) {
        updates.xpEarned = duration; // 1 XP per minute
        updates.xpAwarded = true;
        await addXP('admin', duration, `Deep Work Session: ${duration} mins`);
      }
    }

    const session = await DeepWorkSession.findByIdAndUpdate(_id, updates, { new: true });
    return NextResponse.json(session);
  } catch (error) {
    console.error('Deep work PUT error:', error);
    return NextResponse.json({ error: 'Failed to update session' }, { status: 500 });
  }
}
