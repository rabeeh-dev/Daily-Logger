'use client';

import React, { useState, useEffect } from 'react';


export default function DashboardPage() {
  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    setMounted(true);
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/dashboard');
      if (res.ok) {
        const json = await res.json();
        setData(json);
      }
    } catch (err) {
      console.error('Failed to fetch dashboard data:', err);
    } finally {
      setTimeout(() => setLoading(false), 800); // Small delay for aesthetic sync effect
    }
  };

  if (!mounted) return null;

  const today = new Date();
  const dateString = today.toLocaleDateString('en-US', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }).toUpperCase();
  const dayOfYear = Math.floor((today.getTime() - new Date(today.getFullYear(), 0, 0).getTime()) / 86400000);
  const hour = today.getHours();
  const greeting = hour < 12 ? 'GOOD MORNING' : hour < 17 ? 'GOOD AFTERNOON' : 'GOOD EVENING';

  // If no data yet (error or initial), use defaults
  const d = data || {
    today: { completion: 0, deepWorkMinutes: 0, tasksTotal: 0, tasksCompleted: 0 },
    weekly: { completion: 0, deepWorkMinutes: 0, goalsTotal: 0, goalsCompleted: 0 },
    habits: { completionRate: 0, completed: 0, total: 0 },
    xp: { totalXP: 0, level: 1, currentStreak: 0, longestStreak: 0 },
    focusScore: 0
  };

  return (
    <div className="flex flex-col gap-[32px] pb-[48px]">
        {/* Row A - Greeting bar */}
        <div className="flex justify-between items-start s1">
          <div>
            <div className="font-['IBM_Plex_Mono'] text-[11px] text-[#555555] uppercase tracking-[0.16em] mb-1">
              {greeting}, RABEEH // SYSTEM ONLINE
            </div>
            <div className="font-['IBM_Plex_Mono'] text-[10px] text-[#2A2A2A] tracking-[0.1em]">
              {dateString} · DAY {dayOfYear} OF 365
            </div>
          </div>
          <div className="flex gap-[8px]">
            <div className="border border-[#4ADE80] text-[#4ADE80] font-['IBM_Plex_Mono'] text-[10px] uppercase tracking-[0.1em] px-[10px] py-[4px]">
              🔥 {d.xp.currentStreak} DAY STREAK
            </div>
            <div className="bg-[#FFFFFF] text-[#000000] font-['IBM_Plex_Mono'] text-[10px] uppercase tracking-[0.1em] px-[10px] py-[4px]">
              LVL {d.xp.level}
            </div>
            <div className="border border-[#333333] text-[#555555] font-['IBM_Plex_Mono'] text-[10px] uppercase tracking-[0.1em] px-[10px] py-[4px]">
              {d.xp.totalXP.toLocaleString()} XP
            </div>
          </div>
        </div>

        {/* Row B - XP Progress strip */}
        <div className="border border-[#1A1A1A] bg-[#050505] p-[20px] s2">
          <div className="flex items-center justify-between mb-[14px]">
            <div className="font-['IBM_Plex_Mono'] font-bold text-[14px] text-[#FFFFFF] tracking-[0.1em]">
              LEVEL {d.xp.level}
            </div>
            <div className="font-['IBM_Plex_Mono'] text-[10px] text-[#555555] tracking-[0.1em]">
              {d.xp.currentLevelXP} / {d.xp.nextLevelXP} XP
            </div>
          </div>
          <div className="w-full h-[3px] bg-[#1A1A1A] overflow-hidden mb-[10px]">
            <div className="h-full bg-[#A78BFA]" style={{ width: `${d.xp.progressPercent}%`, transition: 'width 1s ease-in-out', borderRadius: '1px' }}></div>
          </div>
        </div>

        {/* Row C - 4 Stat Cards */}
        <div className="grid grid-cols-4 gap-[1px] bg-[#1A1A1A] border border-[#1A1A1A] s3">
          <div className="bg-[#050505] p-[20px]">
            <div className="font-['IBM_Plex_Mono'] text-[10px] text-[#555555] uppercase tracking-[0.16em] mb-[10px]">FOCUS SCORE</div>
            <div className="font-['IBM_Plex_Mono'] text-[36px] text-[#FFFFFF] font-bold leading-none mb-[4px]">{d.focusScore}</div>
            <div className="font-['IBM_Plex_Mono'] text-[10px] text-[#333333] tracking-[0.05em]">SYSTEM STABILITY</div>
          </div>
          <div className="bg-[#050505] p-[20px]">
            <div className="font-['IBM_Plex_Mono'] text-[10px] text-[#555555] uppercase tracking-[0.16em] mb-[10px]">ACTIVE STREAK</div>
            <div className="font-['IBM_Plex_Mono'] text-[36px] text-[#FFFFFF] font-bold leading-none mb-[4px]">{d.xp.currentStreak}D</div>
            <div className="font-['IBM_Plex_Mono'] text-[10px] text-[#333333] tracking-[0.05em]">CONSISTENCY INDEX</div>
          </div>
          <div className="bg-[#050505] p-[20px]">
            <div className="font-['IBM_Plex_Mono'] text-[10px] text-[#555555] uppercase tracking-[0.16em] mb-[10px]">DEEP WORK</div>
            <div className="font-['IBM_Plex_Mono'] text-[36px] text-[#FFFFFF] font-bold leading-none mb-[4px]">{(d.today.deepWorkMinutes / 60).toFixed(1)}H</div>
            <div className="font-['IBM_Plex_Mono'] text-[10px] text-[#333333] tracking-[0.05em]">TODAY EXECUTED</div>
          </div>
          <div className="bg-[#050505] p-[20px]">
            <div className="font-['IBM_Plex_Mono'] text-[10px] text-[#555555] uppercase tracking-[0.16em] mb-[10px]">TASKS DONE</div>
            <div className="font-['IBM_Plex_Mono'] text-[36px] text-[#FFFFFF] font-bold leading-none mb-[4px]">{d.today.tasksCompleted}/{d.today.tasksTotal}</div>
            <div className="font-['IBM_Plex_Mono'] text-[10px] text-[#333333] tracking-[0.05em]">{d.today.completion}% COMPLETE</div>
          </div>
        </div>

        {/* Row D - Mission & Habits */}
        <div className="flex gap-[24px] s4">
          <div className="w-[62%] border border-[#1A1A1A] bg-[#050505] p-[24px]">
            <div className="font-['IBM_Plex_Mono'] text-[12px] text-[#FFFFFF] uppercase tracking-[0.16em] mb-[20px]">WEEKLY MISSION PROGRESS</div>
            <div className="flex flex-col gap-[32px]">
              <div>
                <div className="flex justify-between items-end mb-[12px]">
                  <span className="font-['IBM_Plex_Mono'] text-[10px] text-[#555555] uppercase tracking-[0.16em]">WEEKLY GOALS</span>
                  <span className="font-['IBM_Plex_Mono'] text-[14px] text-[#FFFFFF] font-bold">{d.weekly.goalsCompleted}/{d.weekly.goalsTotal}</span>
                </div>
                <div className="w-full h-[2px] bg-[#1A1A1A] overflow-hidden">
                  <div className="h-full bg-[#FFFFFF]" style={{ width: `${d.weekly.completion}%`, transition: 'width 1s ease-in-out' }}></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between items-end mb-[12px]">
                  <span className="font-['IBM_Plex_Mono'] text-[10px] text-[#555555] uppercase tracking-[0.16em]">DEEP WORK VOLUME</span>
                  <span className="font-['IBM_Plex_Mono'] text-[14px] text-[#FFFFFF] font-bold">{(d.weekly.deepWorkMinutes / 60).toFixed(1)}H</span>
                </div>
                <div className="w-full h-[2px] bg-[#1A1A1A] overflow-hidden">
                  <div className="h-full bg-[#4ADE80]" style={{ width: `${Math.min(100, (d.weekly.deepWorkMinutes / 1200) * 100)}%`, transition: 'width 1s ease-in-out' }}></div>
                </div>
              </div>
            </div>
          </div>

          <div className="w-[38%] border border-[#1A1A1A] bg-[#050505] p-[24px]">
            <div className="font-['IBM_Plex_Mono'] text-[12px] text-[#FFFFFF] uppercase tracking-[0.16em] mb-[20px]">HABIT RETENTION</div>
            <div className="flex flex-col gap-[8px] mb-[20px]">
              <div className="font-['IBM_Plex_Mono'] text-[42px] text-[#FFFFFF] font-bold leading-none">{d.habits.completionRate}%</div>
              <div className="font-['IBM_Plex_Mono'] text-[10px] text-[#555555] uppercase tracking-[0.1em]">{d.habits.completed} OF {d.habits.total} PROTOCOLS EXECUTED</div>
            </div>
            <div className="w-full h-[2px] bg-[#1A1A1A] overflow-hidden">
              <div className="h-full bg-[#FFFFFF]" style={{ width: `${d.habits.completionRate}%`, transition: 'width 1s ease-in-out' }}></div>
            </div>
          </div>
        </div>

        {/* Row E - Operator Status */}
        <div className="border border-[#1A1A1A] bg-[#050505] p-[28px] flex flex-col justify-center s6">
          <div className="mb-[24px]">
            <div className="font-['IBM_Plex_Mono'] text-[42px] font-bold text-[#FFFFFF] leading-none mb-[8px]">LEVEL {d.xp.level}</div>
            <div className="font-['IBM_Plex_Mono'] text-[11px] text-[#4ADE80] uppercase tracking-[0.15em]">ACTIVE OPERATOR // STATUS: STABLE</div>
          </div>
          
          <div className="flex border border-[#1A1A1A] bg-transparent">
            <div className="flex-1 p-[12px] text-center border-r border-[#1A1A1A]">
              <div className="font-['IBM_Plex_Mono'] text-[10px] text-[#555555] uppercase tracking-[0.1em] mb-[4px]">TOTAL XP</div>
              <div className="font-['IBM_Plex_Mono'] text-[16px] text-[#FFFFFF] font-bold">{d.xp.totalXP.toLocaleString()}</div>
            </div>
            <div className="flex-1 p-[12px] text-center border-r border-[#1A1A1A]">
              <div className="font-['IBM_Plex_Mono'] text-[10px] text-[#555555] uppercase tracking-[0.1em] mb-[4px]">STREAK</div>
              <div className="font-['IBM_Plex_Mono'] text-[16px] text-[#FFFFFF] font-bold">{d.xp.currentStreak}D</div>
            </div>
            <div className="flex-1 p-[12px] text-center">
              <div className="font-['IBM_Plex_Mono'] text-[10px] text-[#555555] uppercase tracking-[0.1em] mb-[4px]">RECORD</div>
              <div className="font-['IBM_Plex_Mono'] text-[16px] text-[#FFFFFF] font-bold">{d.xp.longestStreak}D</div>
            </div>
          </div>
        </div>
      </div>
  );
}
