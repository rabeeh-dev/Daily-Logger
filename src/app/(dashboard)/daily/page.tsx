'use client';

import React, { useState, useEffect } from 'react';
import { Plus, Check, X, Trash2 } from 'lucide-react';


type Task = { id: string; title: string; priority: string; xp: string; completed: boolean; color: string };

export default function DailyPage() {
  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [dbId, setDbId] = useState<string | null>(null);
  
  const [priorities, setPriorities] = useState<Task[]>([]);
  const [secondary, setSecondary] = useState<Task[]>([]);
  
  const [showAddPriority, setShowAddPriority] = useState(false);
  const [newPriorityTitle, setNewPriorityTitle] = useState('');
  const [newPriorityLevel, setNewPriorityLevel] = useState('HIGH');

  const [showAddSecondary, setShowAddSecondary] = useState(false);
  const [newSecondaryTitle, setNewSecondaryTitle] = useState('');
  


  useEffect(() => {
    setMounted(true);
    fetchDailyTasks();
  }, []);

  const fetchDailyTasks = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/daily-tasks');
      if (res.ok) {
        const data = await res.json();
        setDbId(data._id);
        setPriorities((data.topPriorities || []).map((t: any) => ({ ...t, id: t.id || t._id })));
        setSecondary((data.additionalTasks || []).map((t: any) => ({ ...t, id: t.id || t._id })));

      }
    } catch (err) {
      console.error('Failed to fetch daily tasks:', err);
    } finally {
      setTimeout(() => setLoading(false), 600);
    }
  };

  const saveToDb = async (updatedPriorities: Task[], updatedSecondary: Task[], updatedNotes?: string) => {
    if (!dbId) return;
    try {
      await fetch('/api/daily-tasks', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          _id: dbId,
          topPriorities: updatedPriorities,
          additionalTasks: updatedSecondary,
          notes: updatedNotes !== undefined ? updatedNotes : ''
        })
      });
    } catch (err) {
      console.error('Failed to save tasks:', err);
    }
  };

  const handleAddPriority = () => {
    if (!newPriorityTitle.trim()) return;
    const color = newPriorityLevel === 'HIGH' ? '#F87171' : newPriorityLevel === 'MEDIUM' ? '#FACC15' : '#444444';
    const newList = [...priorities, {
      id: Date.now().toString(),
      title: newPriorityTitle,
      priority: newPriorityLevel,
      color,
      xp: '30 XP',
      completed: false
    }];
    setPriorities(newList);
    setNewPriorityTitle('');
    setShowAddPriority(false);
    saveToDb(newList, secondary);
  };

  const handleAddSecondary = () => {
    if (!newSecondaryTitle.trim()) return;
    const newList = [...secondary, {
      id: Date.now().toString(),
      title: newSecondaryTitle,
      priority: 'LOW',
      color: '#444444',
      xp: '15 XP',
      completed: false
    }];
    setSecondary(newList);
    setNewSecondaryTitle('');
    setShowAddSecondary(false);
    saveToDb(priorities, newList);
  };

  const togglePriority = (id: string) => {
    const newList = priorities.map(t => t.id === id ? { ...t, completed: !t.completed } : t);
    setPriorities(newList);
    saveToDb(newList, secondary);
  };

  const toggleSecondary = (id: string) => {
    const newList = secondary.map(t => t.id === id ? { ...t, completed: !t.completed } : t);
    setSecondary(newList);
    saveToDb(priorities, newList);
  };

  const deletePriority = (id: string) => {
    const newList = priorities.filter(t => t.id !== id);
    setPriorities(newList);
    saveToDb(newList, secondary);
  };

  const deleteSecondary = (id: string) => {
    const newList = secondary.filter(t => t.id !== id);
    setSecondary(newList);
    saveToDb(priorities, newList);
  };

  const clearCompleted = () => {
    const newPriorities = priorities.filter(t => !t.completed);
    const newSecondary = secondary.filter(t => !t.completed);
    setPriorities(newPriorities);
    setSecondary(newSecondary);
    saveToDb(newPriorities, newSecondary);
  };

  const totalTasks = priorities.length + secondary.length;
  const completedTasksCount = priorities.filter(t => t.completed).length + secondary.filter(t => t.completed).length;
  const pct = totalTasks === 0 ? 0 : Math.round((completedTasksCount / totalTasks) * 100);

  if (!mounted) return null;

  return (
    <div className="flex flex-col gap-[32px] pb-[48px]">
        {/* Header */}
        <div className="flex justify-between items-end border-b border-[#1A1A1A] pb-[24px] s1">
          <div>
            <div className="font-['IBM_Plex_Mono'] text-[18px] text-[#FFFFFF] font-bold uppercase tracking-[0.12em] mb-[4px]">
              EXECUTION TERMINAL
            </div>
            <div className="font-['IBM_Plex_Mono'] text-[10px] text-[#555555] uppercase tracking-[0.12em]">
              DEPLOYMENT PHASE · {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' }).toUpperCase()}
            </div>
          </div>
          <div className="flex items-end gap-[16px]">
            {completedTasksCount > 0 && (
              <button 
                onClick={clearCompleted}
                className="font-['IBM_Plex_Mono'] text-[9px] text-[#555555] hover:text-[#F87171] border border-[#1A1A1A] hover:border-[#F87171] px-[8px] py-[4px] transition-all uppercase tracking-[0.1em]"
              >
                PURGE COMPLETED
              </button>
            )}
            <div className="text-right">
            <div className="font-['IBM_Plex_Mono'] text-[28px] text-[#FFFFFF] font-bold leading-none mb-[4px]">
              {pct}%
            </div>
            <div className="font-['IBM_Plex_Mono'] text-[10px] text-[#555555] uppercase tracking-[0.12em]">
              DAILY PROGRESS
            </div>
          </div>
        </div>
      </div>

        {/* Progress bar */}
        <div className="s2">
          <div className="flex justify-between items-end mb-[8px]">
            <span className="font-['IBM_Plex_Mono'] text-[10px] text-[#555555] uppercase tracking-[0.16em]">SYNCED · {completedTasksCount}/{totalTasks} COMPLETE</span>
            <span className="font-['IBM_Plex_Mono'] text-[10px] text-[#FFFFFF]">{pct}%</span>
          </div>
          <div className="w-full h-[2px] bg-[#1A1A1A] overflow-hidden">
            <div className="h-full bg-[#FFFFFF]" style={{ width: `${pct}%`, transition: 'width 0.8s cubic-bezier(0.4, 0, 0.2, 1)', borderRadius: '1px' }}></div>
          </div>
        </div>

        <div className="flex flex-col gap-[24px]">
          {/* Main Task Column - Now Full Width */}
          <div className="w-full flex flex-col gap-[32px] s3">
            
            {/* Priorities */}
            <div>
              <div className="flex justify-between items-center mb-[12px] border-b border-[#1A1A1A] pb-[8px]">
                <div className="flex items-center gap-[12px]">
                  <div className="font-['IBM_Plex_Mono'] text-[10px] text-[#555555] uppercase tracking-[0.16em]">PRIORITIES</div>
                  <div className="font-['IBM_Plex_Mono'] text-[9px] text-[#4ADE80] uppercase tracking-[0.1em] border border-[#1A1A1A] px-[8px] py-[4px]">30 XP EACH</div>
                </div>
                <button 
                  onClick={() => setShowAddPriority(!showAddPriority)}
                  className="text-[#555555] hover:text-[#FFFFFF] transition-colors p-[4px]"
                >
                  {showAddPriority ? <X size={14} /> : <Plus size={14} />}
                </button>
              </div>

              {showAddPriority && (
                <div className="flex items-center gap-[8px] mb-[16px] bg-[#0A0A0A] border border-[#1A1A1A] p-[8px]">
                  <input 
                    type="text" 
                    autoFocus
                    placeholder="NEW PRIORITY..." 
                    value={newPriorityTitle}
                    onChange={(e) => setNewPriorityTitle(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleAddPriority()}
                    className="flex-1 bg-transparent text-[#FFFFFF] font-['Inter'] text-[13px] px-[8px] outline-none placeholder-[#2A2A2A]" 
                  />
                  <select 
                    value={newPriorityLevel}
                    onChange={(e) => setNewPriorityLevel(e.target.value)}
                    className="bg-[#050505] border border-[#1A1A1A] text-[#FFFFFF] font-['IBM_Plex_Mono'] text-[9px] uppercase tracking-[0.1em] px-[8px] py-[4px] outline-none"
                  >
                    <option value="HIGH">HIGH</option>
                    <option value="MEDIUM">MEDIUM</option>
                    <option value="LOW">LOW</option>
                  </select>
                  <button 
                    onClick={handleAddPriority}
                    className="border border-[#333333] text-[#FFFFFF] hover:bg-[#FFFFFF] hover:text-[#000000] transition-colors p-[4px]"
                  >
                    <Check size={14} />
                  </button>
                </div>
              )}

              <div className="flex flex-col">
                {priorities.length === 0 && !showAddPriority && (
                  <div className="font-['IBM_Plex_Mono'] text-[10px] text-[#2A2A2A] py-[24px] text-center border border-dashed border-[#1A1A1A]">
                    NO PRIORITIES SET. CLICK + TO ADD.
                  </div>
                )}
                {priorities.map((t, idx) => (
                  <div key={t.id || `p-${idx}`} className={`flex items-center gap-[16px] h-[44px] border-b border-[#111111] ${t.completed ? 'opacity-40' : ''} group`}>
                    <button onClick={() => togglePriority(t.id)} className={`w-[12px] h-[12px] flex-shrink-0 flex items-center justify-center ${t.completed ? 'bg-[#FFFFFF] border border-[#FFFFFF]' : 'bg-transparent border border-[#333333]'}`}>
                      {t.completed && <Check size={8} color="#000" strokeWidth={4} />}
                    </button>
                    <div className={`font-['Inter'] text-[13px] flex-1 ${t.completed ? 'text-[#FFFFFF] line-through' : 'text-[#FFFFFF]'}`}>{t.title}</div>
                    <div className="font-['IBM_Plex_Mono'] text-[9px] uppercase tracking-[0.1em] border px-[6px] py-[2px]" style={{ color: t.color, borderColor: t.color }}>{t.priority}</div>
                    <div className="font-['IBM_Plex_Mono'] text-[9px] text-[#4ADE80] tracking-[0.1em] w-[40px] text-right">{t.xp}</div>
                    <button 
                      onClick={(e) => { e.stopPropagation(); deletePriority(t.id); }}
                      className="text-[#2A2A2A] hover:text-[#F87171] transition-colors ml-[12px] opacity-0 group-hover:opacity-100"
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Secondary Tasks */}
            <div>
              <div className="flex justify-between items-center mb-[12px] border-b border-[#1A1A1A] pb-[8px]">
                <div className="flex items-center gap-[12px]">
                  <div className="font-['IBM_Plex_Mono'] text-[10px] text-[#555555] uppercase tracking-[0.16em]">SECONDARY</div>
                  <div className="font-['IBM_Plex_Mono'] text-[9px] text-[#4ADE80] uppercase tracking-[0.1em] border border-[#1A1A1A] px-[8px] py-[4px]">15 XP EACH</div>
                </div>
                <button 
                  onClick={() => setShowAddSecondary(!showAddSecondary)}
                  className="text-[#555555] hover:text-[#FFFFFF] transition-colors p-[4px]"
                >
                  {showAddSecondary ? <X size={14} /> : <Plus size={14} />}
                </button>
              </div>

              {showAddSecondary && (
                <div className="flex items-center gap-[8px] mb-[16px] bg-[#0A0A0A] border border-[#1A1A1A] p-[8px]">
                  <input 
                    type="text" 
                    autoFocus
                    placeholder="NEW SECONDARY TASK..." 
                    value={newSecondaryTitle}
                    onChange={(e) => setNewSecondaryTitle(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleAddSecondary()}
                    className="flex-1 bg-transparent text-[#FFFFFF] font-['Inter'] text-[13px] px-[8px] outline-none placeholder-[#2A2A2A]" 
                  />
                  <button 
                    onClick={handleAddSecondary}
                    className="border border-[#333333] text-[#FFFFFF] hover:bg-[#FFFFFF] hover:text-[#000000] transition-colors p-[4px]"
                  >
                    <Check size={14} />
                  </button>
                </div>
              )}

              <div className="flex flex-col">
                {secondary.length === 0 && !showAddSecondary && (
                  <div className="font-['IBM_Plex_Mono'] text-[10px] text-[#2A2A2A] py-[24px] text-center border border-dashed border-[#1A1A1A]">
                    NO SECONDARY TASKS. CLICK + TO ADD.
                  </div>
                )}
                {secondary.map((t, idx) => (
                  <div key={t.id || `s-${idx}`} className={`flex items-center gap-[16px] h-[44px] border-b border-[#111111] ${t.completed ? 'opacity-40' : ''} group`}>
                    <button onClick={() => toggleSecondary(t.id)} className={`w-[12px] h-[12px] flex-shrink-0 flex items-center justify-center ${t.completed ? 'bg-[#FFFFFF] border border-[#FFFFFF]' : 'bg-transparent border border-[#333333]'}`}>
                      {t.completed && <Check size={8} color="#000" strokeWidth={4} />}
                    </button>
                    <div className={`font-['Inter'] text-[13px] flex-1 ${t.completed ? 'text-[#FFFFFF] line-through' : 'text-[#FFFFFF]'}`}>{t.title}</div>
                    <div className="font-['IBM_Plex_Mono'] text-[9px] text-[#4ADE80] tracking-[0.1em] w-[40px] text-right">{t.xp}</div>
                    <button 
                      onClick={(e) => { e.stopPropagation(); deleteSecondary(t.id); }}
                      className="text-[#2A2A2A] hover:text-[#F87171] transition-colors ml-[12px] opacity-0 group-hover:opacity-100"
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
  );
}
