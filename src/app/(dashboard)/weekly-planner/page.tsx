'use client';

import React, { useState, useEffect } from 'react';
import { Plus, Check, X, Edit2 } from 'lucide-react';


type Goal = { id: string; title: string; priority: 'HIGH' | 'MEDIUM' | 'LOW'; day: string; category: string; xp: string; completed: boolean };

const CATEGORY_OPTIONS = ['DEVELOPMENT', 'FINANCIAL', 'PHYSICAL', 'INTELLECTUAL', 'BRANDING', 'CAREER', 'PERSONAL'];
const TABS = ['ALL', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN', 'BACKLOG'];

export default function WeeklyPlannerPage() {
  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('ALL');
  const [planId, setPlanId] = useState<string | null>(null);
  const [goals, setGoals] = useState<Goal[]>([]);
  
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingGoalId, setEditingGoalId] = useState<string | null>(null);
  const [newTitle, setNewTitle] = useState('');
  const [newPriority, setNewPriority] = useState<'HIGH' | 'MEDIUM' | 'LOW'>('MEDIUM');
  const [newDay, setNewDay] = useState('MON');
  const [newCategory, setNewCategory] = useState('DEVELOPMENT');



  useEffect(() => {
    setMounted(true);
    fetchWeeklyPlan();
  }, []);

  const fetchWeeklyPlan = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/weekly-plan');
      if (res.ok) {
        const data = await res.json();
        setPlanId(data._id);
        setGoals((data.goals || []).map((g: any) => ({ ...g, id: g.id || g._id })));

      }
    } catch (err) {
      console.error('Failed to fetch weekly plan:', err);
    } finally {
      setTimeout(() => setLoading(false), 600);
    }
  };

  const savePlan = async (updatedGoals: Goal[], updatedFocus?: string, updatedAdj?: string) => {
    if (!planId) return;
    try {
      await fetch('/api/weekly-plan', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          _id: planId,
          goals: updatedGoals,
          focusArea: '',
          adjustments: ''
        })
      });
    } catch (err) {
      console.error('Failed to save weekly plan:', err);
    }
  };

  const handleSaveGoal = () => {
    if (!newTitle.trim()) return;
    const xpValue = newPriority === 'HIGH' ? 100 : newPriority === 'MEDIUM' ? 50 : 25;
    let newGoals = [...goals];
    
    if (editingGoalId) {
      newGoals = goals.map(g => g.id === editingGoalId ? {
        ...g,
        title: newTitle,
        priority: newPriority,
        day: newDay,
        category: newCategory,
        xp: `+${xpValue} XP`
      } : g);
    } else {
      const newGoal: Goal = {
        id: Date.now().toString(),
        title: newTitle,
        priority: newPriority,
        day: newDay,
        category: newCategory,
        xp: `+${xpValue} XP`,
        completed: false
      };
      newGoals.push(newGoal);
    }
    
    setGoals(newGoals);
    savePlan(newGoals);
    resetForm();
  };

  const resetForm = () => {
    setNewTitle('');
    setEditingGoalId(null);
    setShowAddForm(false);
  };

  const startEdit = (goal: Goal) => {
    setEditingGoalId(goal.id);
    setNewTitle(goal.title);
    setNewPriority(goal.priority);
    setNewDay(goal.day);
    setNewCategory(goal.category);
    setShowAddForm(true);
  };

  const toggleGoal = (id: string) => {
    const newGoals = goals.map(g => g.id === id ? { ...g, completed: !g.completed } : g);
    setGoals(newGoals);
    savePlan(newGoals);
  };

  const removeGoal = (id: string) => {
    const newGoals = goals.filter(g => g.id !== id);
    setGoals(newGoals);
    savePlan(newGoals);
  };

  const filteredGoals = activeTab === 'ALL' ? goals : goals.filter(g => g.day === activeTab);
  const doneCount = goals.filter(g => g.completed).length;
  const pct = goals.length === 0 ? 0 : Math.round((doneCount / goals.length) * 100);

  if (!mounted) return null;

  return (
    <div className="flex flex-col gap-[32px] pb-[48px]">
        {/* Header */}
        <div className="flex justify-between items-end border-b border-[#1A1A1A] pb-[24px] s1">
          <div>
            <div className="font-['IBM_Plex_Mono'] text-[18px] text-[#FFFFFF] font-bold uppercase tracking-[0.12em] mb-[4px]">
              WEEKLY MISSION TERMINAL
            </div>
            <div className="font-['IBM_Plex_Mono'] text-[11px] text-[#555555] uppercase tracking-[0.12em]">
              DEPLOYMENT PHASE · WEEK {new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
            </div>
          </div>
          <div className="text-right">
            <div className="font-['IBM_Plex_Mono'] text-[28px] text-[#FACC15] font-bold leading-none mb-[4px]">
              {pct >= 80 ? 'A' : pct >= 60 ? 'B+' : pct >= 40 ? 'B' : 'C'}
            </div>
            <div className="font-['IBM_Plex_Mono'] text-[10px] text-[#555555] uppercase tracking-[0.12em]">
              CURRENT GRADE
            </div>
          </div>
        </div>

        {/* Progress bar */}
        <div className="s2">
          <div className="flex justify-between items-end mb-[8px]">
            <span className="font-['IBM_Plex_Mono'] text-[10px] text-[#555555] uppercase tracking-[0.16em]">{doneCount} / {goals.length} GOALS SYNCED</span>
            <span className="font-['IBM_Plex_Mono'] text-[10px] text-[#FFFFFF]">{pct}%</span>
          </div>
          <div className="w-full h-[2px] bg-[#1A1A1A] overflow-hidden">
            <div className="h-full bg-[#FFFFFF]" style={{ width: `${pct}%`, transition: 'width 0.8s ease-in-out' }}></div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-[1px] bg-[#1A1A1A] border border-[#1A1A1A] s3">
          {TABS.map((tab) => (
            <button key={tab} onClick={() => setActiveTab(tab)} className={`flex-1 h-[40px] font-['IBM_Plex_Mono'] text-[10px] uppercase tracking-[0.12em] ${activeTab === tab ? 'bg-[#FFFFFF] text-[#000000]' : 'bg-[#000000] text-[#555555] hover:text-[#FFFFFF]'}`}>
              {tab}
            </button>
          ))}
        </div>

        <div className="flex flex-col gap-[24px]">
          <div className="w-full flex flex-col gap-[16px] s4">
            {showAddForm && (
              <div className="border border-[#1A1A1A] bg-[#0A0A0A] p-[20px] flex flex-col gap-[16px] mb-[8px]">
                <div className="flex justify-between items-center border-b border-[#1A1A1A] pb-[12px]">
                  <span className="font-['IBM_Plex_Mono'] text-[10px] text-[#FFFFFF] uppercase tracking-[0.16em]">{editingGoalId ? 'EDIT GOAL' : 'INITIALIZE GOAL'}</span>
                  <button onClick={resetForm} className="text-[#555555] hover:text-[#FFFFFF]"><X size={14} /></button>
                </div>
                <input 
                  type="text" autoFocus placeholder="MISSION PARAMETER..." value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="bg-transparent border-b border-[#1A1A1A] text-[#FFFFFF] font-['Inter'] text-[14px] py-[8px] outline-none" 
                />
                <div className="grid grid-cols-2 gap-[16px]">
                  <select value={newDay} onChange={(e) => setNewDay(e.target.value)} className="bg-[#050505] border border-[#1A1A1A] text-[#FFFFFF] font-['IBM_Plex_Mono'] text-[10px] p-[8px]">
                    {TABS.filter(t => t !== 'ALL').map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                  <select value={newPriority} onChange={(e) => setNewPriority(e.target.value as any)} className="bg-[#050505] border border-[#1A1A1A] text-[#FFFFFF] font-['IBM_Plex_Mono'] text-[10px] p-[8px]">
                    <option value="HIGH">HIGH</option><option value="MEDIUM">MEDIUM</option><option value="LOW">LOW</option>
                  </select>
                </div>
                <button onClick={handleSaveGoal} className="w-full h-[40px] bg-[#FFFFFF] text-[#000000] font-['IBM_Plex_Mono'] text-[11px] uppercase tracking-[0.12em] font-bold">COMMIT GOAL</button>
              </div>
            )}

            <div className="grid grid-cols-2 gap-[16px]">
              {filteredGoals.map((goal, idx) => (
                <div key={goal.id || `g-${idx}`} className={`border border-[#1A1A1A] bg-[#050505] p-[16px] flex flex-col gap-[12px] ${goal.completed ? 'opacity-40' : ''}`}>
                  <div className="flex justify-between items-center">
                    <span className="font-['IBM_Plex_Mono'] text-[9px] uppercase border px-[6px] py-[2px]" style={{ color: goal.priority === 'HIGH' ? '#F87171' : '#FACC15', borderColor: goal.priority === 'HIGH' ? '#F87171' : '#FACC15' }}>{goal.priority}</span>
                    <button onClick={() => removeGoal(goal.id)} className="text-[#2A2A2A] hover:text-[#F87171]"><X size={12} /></button>
                  </div>
                  <div className={`font-['Inter'] text-[13px] text-[#FFFFFF] ${goal.completed ? 'line-through' : ''}`}>{goal.title}</div>
                  <div className="pt-[12px] border-t border-[#111111] flex justify-between items-center">
                    <button onClick={() => toggleGoal(goal.id)} className="flex items-center gap-[8px]">
                      <div className={`w-[12px] h-[12px] flex items-center justify-center ${goal.completed ? 'bg-[#FFFFFF]' : 'border border-[#333333]'}`}>{goal.completed && <Check size={8} color="#000" />}</div>
                      <span className="font-['IBM_Plex_Mono'] text-[10px] text-[#333333] uppercase">DONE</span>
                    </button>
                    <button onClick={() => startEdit(goal)} className="text-[#333333] hover:text-[#FFFFFF]"><Edit2 size={12} /></button>
                  </div>
                </div>
              ))}
            </div>
            {!showAddForm && (
              <button onClick={() => setShowAddForm(true)} className="w-full h-[40px] border border-[#2A2A2A] text-[#FFFFFF] font-['IBM_Plex_Mono'] text-[11px] uppercase tracking-[0.12em] hover:border-[#FFFFFF] flex items-center justify-center gap-[8px]">
                <Plus size={14} /> INITIALIZE NEW GOAL
              </button>
            )}
          </div>


        </div>
      </div>
  );
}
