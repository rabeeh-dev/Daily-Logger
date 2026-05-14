'use client';

import React, { useState, useEffect } from 'react';
import { Plus, Check, X, Flame } from 'lucide-react';


type Habit = { _id: string; name: string; currentStreak: number; category: string; icon: string; active: boolean };
type HabitLogItem = { habitId: string; name: string; completed: boolean; xpEarned: number };

export default function HabitsPage() {
  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(true);
  
  const [habits, setHabits] = useState<Habit[]>([]);
  const [habitLog, setHabitLog] = useState<any>(null);
  const [recentLogs, setRecentLogs] = useState<any[]>([]);
  
  const [showAddForm, setShowAddForm] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newIcon, setNewIcon] = useState('✅');

  useEffect(() => {
    setMounted(true);
    fetchHabits();
  }, []);

  const fetchHabits = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/habits');
      if (res.ok) {
        const data = await res.json();
        setHabits(data.habits || []);
        setHabitLog(data.log || null);
        setRecentLogs(data.recentLogs || []);
      }
    } catch (err) {
      console.error('Failed to fetch habits:', err);
    } finally {
      setTimeout(() => setLoading(false), 600);
    }
  };

  const handleAddHabit = async () => {
    if (!newTitle.trim()) return;
    try {
      const res = await fetch('/api/habits', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newTitle,
          icon: newIcon,
          category: 'CORE',
          xpPerCompletion: 20
        })
      });
      if (res.ok) {
        setNewTitle('');
        setShowAddForm(false);
        fetchHabits();
      }
    } catch (err) {
      console.error('Failed to add habit:', err);
    }
  };

  const toggleHabit = async (habitId: string, index: number, currentState: boolean) => {
    if (!habitLog) return;
    try {
      const res = await fetch('/api/habits', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          logId: habitLog._id,
          habitIndex: index,
          completed: !currentState
        })
      });
      if (res.ok) {
        const updatedLog = await res.json();
        setHabitLog(updatedLog);
      }
    } catch (err) {
      console.error('Failed to toggle habit:', err);
    }
  };

  if (!mounted) return null;

  const retention = habitLog?.completionRate || 0;

  return (
    <div className="flex flex-col gap-[32px] pb-[48px]">
        {/* Header */}
        <div className="flex justify-between items-end border-b border-[#1A1A1A] pb-[24px] s1">
          <div>
            <div className="font-['IBM_Plex_Mono'] text-[18px] text-[#FFFFFF] font-bold uppercase tracking-[0.12em] mb-[4px]">
              HABIT TRACKER
            </div>
            <div className="font-['IBM_Plex_Mono'] text-[11px] text-[#555555] uppercase tracking-[0.12em]">
              CONSISTENCY PROTOCOL · {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }).toUpperCase()}
            </div>
          </div>
          <div className="text-right">
            <div className="font-['IBM_Plex_Mono'] text-[28px] text-[#4ADE80] font-bold leading-none mb-[4px]">
              {retention}%
            </div>
            <div className="font-['IBM_Plex_Mono'] text-[10px] text-[#555555] uppercase tracking-[0.12em]">
              TODAY&apos;S RETENTION
            </div>
          </div>
        </div>

        {/* Heatmap/Streak Area (Standardized) */}
        <div className="border border-[#1A1A1A] bg-[#050505] p-[24px] s2">
          <div className="flex justify-between items-center mb-[16px]">
            <div className="font-['IBM_Plex_Mono'] text-[10px] text-[#555555] uppercase tracking-[0.16em]">SYNCED CONSISTENCY INDEX</div>
            <div className="flex gap-[8px] items-center">
              <div className="w-[8px] h-[8px] bg-[#1A1A1A]"></div>
              <span className="font-['IBM_Plex_Mono'] text-[8px] text-[#333333] uppercase">MISSED</span>
              <div className="w-[8px] h-[8px] bg-[#4ADE80]"></div>
              <span className="font-['IBM_Plex_Mono'] text-[8px] text-[#333333] uppercase">COMPLETED</span>
            </div>
          </div>
          <div className="grid grid-cols-[repeat(30,1fr)] gap-[4px]">
            {Array.from({ length: 210 }).map((_, i) => (
              <div key={i} className={`aspect-square border border-transparent ${Math.random() > 0.4 ? 'bg-[#4ADE80]' : 'bg-[#111111]'} hover:border-[#FFFFFF]`}></div>
            ))}
          </div>
        </div>

        <div className="flex gap-[24px]">
          <div className="w-[60%] flex flex-col gap-[16px] s3">
            {showAddForm && (
              <div className="border border-[#1A1A1A] bg-[#0A0A0A] p-[20px] flex flex-col gap-[16px] mb-[8px]">
                <div className="flex justify-between items-center border-b border-[#1A1A1A] pb-[12px]">
                  <span className="font-['IBM_Plex_Mono'] text-[10px] text-[#FFFFFF] uppercase tracking-[0.16em]">NEW HABIT PARAMETER</span>
                  <button onClick={() => setShowAddForm(false)} className="text-[#555555] hover:text-[#FFFFFF]"><X size={14} /></button>
                </div>
                <input 
                  type="text" 
                  autoFocus
                  placeholder="HABIT TITLE..." 
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="bg-transparent border-b border-[#1A1A1A] text-[#FFFFFF] font-['Inter'] text-[14px] py-[8px] outline-none focus:border-[#FFFFFF] placeholder-[#2A2A2A]" 
                />
                <button onClick={handleAddHabit} className="w-full h-[40px] bg-[#FFFFFF] text-[#000000] font-['IBM_Plex_Mono'] text-[11px] uppercase tracking-[0.12em] font-bold hover:bg-[#E0E0E0]">
                  INITIALIZE HABIT
                </button>
              </div>
            )}

            <div className="flex flex-col gap-[1px] bg-[#1A1A1A] border border-[#1A1A1A]">
              {habitLog?.habits.map((h: HabitLogItem, i: number) => {
                const habitData = habits.find(hab => hab._id === h.habitId);
                return (
                  <div key={h.habitId} className="bg-[#050505] h-[64px] flex items-center px-[20px] gap-[20px] group transition-colors hover:bg-[#080808]">
                    <div className="w-[4px] h-[32px] bg-[#4ADE80]"></div>
                    <div className="flex-1 flex flex-col justify-center">
                      <div className={`font-['Inter'] text-[14px] font-medium transition-all ${h.completed ? 'text-[#333333] line-through' : 'text-[#FFFFFF]'}`}>
                        {h.name}
                      </div>
                    </div>
                    <div className="flex items-center gap-[24px]">
                      <div className="text-right">
                        <div className="flex items-center justify-end gap-[6px] font-['IBM_Plex_Mono'] text-[12px] text-[#FFFFFF] font-bold">
                          <Flame size={14} className="text-[#FACC15]" />
                          {habitData?.currentStreak || 0}
                        </div>
                        <div className="font-['IBM_Plex_Mono'] text-[9px] text-[#555555] uppercase tracking-[0.1em]">STREAK</div>
                      </div>
                      <button 
                        onClick={() => toggleHabit(h.habitId, i, h.completed)}
                        className={`w-[40px] h-[40px] flex items-center justify-center border transition-all ${
                          h.completed ? 'bg-[#FFFFFF] border-[#FFFFFF] text-[#000000]' : 'bg-transparent border-[#2A2A2A] text-[#2A2A2A] hover:border-[#FFFFFF] hover:text-[#FFFFFF]'
                        }`}
                      >
                        <Check size={20} strokeWidth={3} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
            {!showAddForm && (
              <button onClick={() => setShowAddForm(true)} className="w-full h-[44px] border border-[#2A2A2A] text-[#FFFFFF] font-['IBM_Plex_Mono'] text-[11px] uppercase tracking-[0.12em] hover:border-[#FFFFFF] flex items-center justify-center gap-[8px]">
                <Plus size={14} /> REGISTER NEW HABIT
              </button>
            )}
          </div>

          <div className="w-[40%] flex flex-col gap-[32px] s4">
            <div className="border border-[#1A1A1A] bg-[#050505] p-[20px]">
              <div className="font-['IBM_Plex_Mono'] text-[10px] text-[#555555] uppercase tracking-[0.16em] mb-[16px]">
                OPERATING RULES
              </div>
              <div className="flex flex-col gap-[12px]">
                <div className="flex gap-[12px] items-start">
                  <span className="text-[#FACC15] font-['IBM_Plex_Mono'] text-[10px]">01</span>
                  <span className="font-['Inter'] text-[12px] text-[#AAAAAA]">Never miss two days in a row.</span>
                </div>
                <div className="flex gap-[12px] items-start">
                  <span className="text-[#FACC15] font-['IBM_Plex_Mono'] text-[10px]">02</span>
                  <span className="font-['Inter'] text-[12px] text-[#AAAAAA]">Habits are non-negotiable protocols.</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
  );
}
