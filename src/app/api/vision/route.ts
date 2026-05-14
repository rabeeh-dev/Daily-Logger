import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import connectDB from '@/lib/db';
import VisionBoard from '@/models/VisionBoard';

export async function GET() {
  try {
    await requireAuth();
    await connectDB();
    let board = await VisionBoard.findOne();
    if (!board) {
      board = await VisionBoard.create({
        items: [
          { title: 'Full-Stack Developer Role', description: 'Land a top-tier full-stack dev position', category: 'career', priority: 1 },
          { title: 'Master DSA', description: 'Solve 300+ problems', category: 'learning', priority: 2 },
          { title: 'Freelance Income', description: 'Build ₹50K/month freelance income', category: 'salary', priority: 3 },
          { title: 'Peak Fitness', description: 'Consistent workout routine', category: 'fitness', priority: 4 },
        ],
        quotes: [
          { text: "The only way to do great work is to love what you do.", author: "Steve Jobs", pinned: true },
          { text: "Hard work beats talent when talent doesn't work hard.", author: "Tim Notke", pinned: true },
        ],
        reminders: [
          { text: "Stay consistent. Small daily improvements lead to stunning results.", active: true },
        ],
      });
    }
    return NextResponse.json(board);
  } catch (error) {
    console.error('Vision board GET error:', error);
    return NextResponse.json({ error: 'Failed to load vision board' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    await requireAuth();
    await connectDB();
    const body = await request.json();
    const board = await VisionBoard.findOneAndUpdate({}, body, { new: true, upsert: true });
    return NextResponse.json(board);
  } catch (error) {
    console.error('Vision board PUT error:', error);
    return NextResponse.json({ error: 'Failed to update vision board' }, { status: 500 });
  }
}
