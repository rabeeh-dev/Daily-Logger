import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import connectDB from '@/lib/db';
import WeeklyReview from '@/models/WeeklyReview';
import { getWeekRange } from '@/lib/utils';

export async function GET(request: NextRequest) {
  try {
    await requireAuth();
    await connectDB();
    const dateParam = request.nextUrl.searchParams.get('date');
    if (dateParam) {
      const date = new Date(dateParam);
      const { start, end } = getWeekRange(date);
      const review = await WeeklyReview.findOne({ weekStart: { $gte: start, $lte: end } });
      return NextResponse.json(review || null);
    }
    const reviews = await WeeklyReview.find().sort({ weekStart: -1 }).limit(12);
    return NextResponse.json(reviews);
  } catch (error) {
    console.error('Reviews GET error:', error);
    return NextResponse.json({ error: 'Failed to load reviews' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    await requireAuth();
    await connectDB();
    const body = await request.json();
    const review = await WeeklyReview.findOneAndUpdate(
      { weekStart: new Date(body.weekStart) },
      body,
      { upsert: true, new: true }
    );
    return NextResponse.json(review);
  } catch (error) {
    console.error('Reviews POST error:', error);
    return NextResponse.json({ error: 'Failed to save review' }, { status: 500 });
  }
}
