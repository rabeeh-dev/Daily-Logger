import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import connectDB from '@/lib/db';
import DeveloperProgress from '@/models/DeveloperProgress';

export async function GET() {
  try {
    await requireAuth();
    await connectDB();

    let progress = await DeveloperProgress.findOne();

    if (!progress) {
      progress = await DeveloperProgress.create({
        mernProgress: 45,
        reactLevel: 'Intermediate',
        dsaSolved: 12,
        dsaTarget: 300,
        githubContributions: 127,
        projectsCompleted: 3,
        projectsInProgress: 2,
        freelanceEarned: 0,
        freelanceTarget: 50000,
        interviewReadiness: 25,
        portfolioProgress: 30,
        brandingScore: 15,
        milestones: [
          { title: 'Complete MERN Stack', description: 'Master MongoDB, Express, React, Node.js', completed: false, category: 'development' },
          { title: 'Solve 100 DSA Problems', description: 'LeetCode + HackerRank practice', completed: false, category: 'dsa' },
          { title: 'Launch Portfolio v2', description: 'Modern portfolio with projects showcase', completed: false, category: 'branding' },
          { title: 'First Freelance Project', description: 'Complete first paid client project', completed: false, category: 'freelance' },
          { title: 'Build 5 Full-Stack Projects', description: 'Real-world production projects', completed: false, category: 'development' },
        ],
        learningLog: [],
      });
    }

    return NextResponse.json(progress);
  } catch (error) {
    console.error('Dev progress GET error:', error);
    return NextResponse.json({ error: 'Failed to load dev progress' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    await requireAuth();
    await connectDB();

    const body = await request.json();
    const progress = await DeveloperProgress.findOneAndUpdate({}, body, { new: true, upsert: true });
    return NextResponse.json(progress);
  } catch (error) {
    console.error('Dev progress PUT error:', error);
    return NextResponse.json({ error: 'Failed to update dev progress' }, { status: 500 });
  }
}
