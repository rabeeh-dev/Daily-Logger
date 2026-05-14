import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import connectDB from '@/lib/db';
import SystemConfig from '@/models/SystemConfig';

export async function GET() {
  try {
    const session = await requireAuth();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    
    await connectDB();
    let config = await SystemConfig.findOne({ userId: 'admin' }); // Assuming single admin for now
    
    if (!config) {
      config = await SystemConfig.create({ userId: 'admin' });
    }
    
    return NextResponse.json(config);
  } catch (error) {
    console.error('Settings GET error:', error);
    return NextResponse.json({ error: 'Failed to load settings' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await requireAuth();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    
    await connectDB();
    const body = await request.json();
    const config = await SystemConfig.findOneAndUpdate(
      { userId: 'admin' },
      body,
      { new: true, upsert: true }
    );
    
    return NextResponse.json(config);
  } catch (error) {
    console.error('Settings PUT error:', error);
    return NextResponse.json({ error: 'Failed to update settings' }, { status: 500 });
  }
}
