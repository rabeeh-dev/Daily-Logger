'use client';

import React, { useState, useEffect } from 'react';
import { BarChart3, Calendar, Clock, CheckCircle2, TrendingUp, ShieldCheck, AlertCircle } from 'lucide-react';


type ReviewTab = 'DAILY' | 'WEEKLY' | 'MONTHLY';

export default function ReviewsPage() {
  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<ReviewTab>('DAILY');
  
  const [stats, setStats] = useState({
    habitsCompleted: 0,
    totalHabits: 0,
    focusMinutes: 0,
    disciplineScore: 0,
    weeklyProgress: 0,
    monthlyConsistency: 0
  });

  useEffect(() => {
    setMounted(true);
    fetchStats();
  }, [activeTab]);

  const fetchStats = async () => {
    try {
      setLoading(true);
      // We'll use the dashboard API as it already calculates a lot of this
      const res = await fetch(`/api/dashboard?date=${new Date().toISOString()}`);
      if (res.ok) {
        const d = await res.json();
        
        if (activeTab === 'DAILY') {
          setStats({
            habitsCompleted: d.habits.completed,
            totalHabits: d.habits.total,
            focusMinutes: d.today.deepWorkMinutes,
            disciplineScore: d.focusScore,
            weeklyProgress: d.today.completion,
            monthlyConsistency: 85
          });
        } else {
          // For weekly/monthly, we'd ideally have a separate analytics API, 
          // but we'll use the weekly data from dashboard for now
          setStats({
            habitsCompleted: d.habits.completed * 7, // Mocked aggregation
            totalHabits: d.habits.total * 7,
            focusMinutes: d.weekly.deepWorkMinutes,
            disciplineScore: Math.min(100, Math.round(d.weekly.completion * 1.1)),
            weeklyProgress: d.weekly.completion,
            monthlyConsistency: 88
          });
        }
      }
    } catch (err) {
      console.error('Failed to fetch stats:', err);
    } finally {
      setTimeout(() => setLoading(false), 600);
    }
  };

  const downloadAudit = async () => {
    try {
      setLoading(true);
      const endpoints = [
        fetch('/api/dashboard').then(r => r.json()),
        fetch('/api/habits').then(r => r.json()),
        fetch('/api/dev-progress').then(r => r.json()),
        fetch('/api/vision').then(r => r.json()),
      ];
      
      if (activeTab === 'WEEKLY' || activeTab === 'MONTHLY') {
        endpoints.push(fetch('/api/weekly-plan').then(r => r.json()));
      } else {
        endpoints.push(fetch('/api/daily-tasks').then(r => r.json()));
      }

      const [dash, habits, dev, vision, missions] = await Promise.all(endpoints);

      let missionsHtml = '';
      if (activeTab === 'WEEKLY' || activeTab === 'MONTHLY') {
        missionsHtml = `
          <h2>ACTIVE MISSIONS (${activeTab})</h2>
          <table>
            <tr><th class="checkbox">✓</th><th>Goal</th><th>Category</th></tr>
            ${(missions?.goals || []).map((g: any) => `<tr><td class="checkbox">${g.completed ? 'X' : ' '}</td><td>${g.title}</td><td>${g.category || 'GENERAL'}</td></tr>`).join('')}
          </table>
        `;
      } else {
        missionsHtml = `
          <h2>ACTIVE MISSIONS (DAILY)</h2>
          <table>
            <tr><th class="checkbox">✓</th><th>Task Name</th><th>Priority</th></tr>
            ${(missions?.topPriorities || []).map((t: any) => `<tr><td class="checkbox">${t.completed ? 'X' : ' '}</td><td>${t.title}</td><td>HIGH</td></tr>`).join('')}
            ${(missions?.additionalTasks || []).map((t: any) => `<tr><td class="checkbox">${t.completed ? 'X' : ' '}</td><td>${t.title}</td><td>NORMAL</td></tr>`).join('')}
          </table>
        `;
      }

      let statsHtml = '';
      if (activeTab === 'DAILY') {
        statsHtml = `
          <tr><th>Focus Score</th><td>${dash?.focusScore || 0}%</td></tr>
          <tr><th>Today's Habits</th><td>${dash?.habits?.completed || 0} / ${dash?.habits?.total || 0} Completed</td></tr>
          <tr><th>Deep Work Today</th><td>${Math.floor((dash?.today?.deepWorkMinutes || 0) / 60)}H ${(dash?.today?.deepWorkMinutes || 0) % 60}M</td></tr>
        `;
      } else {
        statsHtml = `
          <tr><th>Execution Score</th><td>${Math.min(100, Math.round((dash?.weekly?.completion || 0) * 1.1))}%</td></tr>
          <tr><th>${activeTab} Habits</th><td>${(dash?.habits?.completed || 0) * 7} / ${(dash?.habits?.total || 0) * 7} (Projected)</td></tr>
          <tr><th>Deep Work ${activeTab}</th><td>${Math.floor((dash?.weekly?.deepWorkMinutes || 0) / 60)}H ${(dash?.weekly?.deepWorkMinutes || 0) % 60}M</td></tr>
        `;
      }

      const htmlContent = `
        <html>
          <head>
            <title>LIFE OS - ${activeTab} SYSTEM AUDIT</title>
            <style>
              body { font-family: monospace; background: #ffffff; color: #000000; padding: 40px; line-height: 1.6; }
              h1 { border-bottom: 2px solid #000; padding-bottom: 10px; text-transform: uppercase; font-size: 24px; }
              h2 { border-bottom: 1px solid #ccc; padding-bottom: 5px; margin-top: 30px; text-transform: uppercase; font-size: 16px; }
              table { width: 100%; border-collapse: collapse; margin-top: 10px; font-size: 12px; }
              th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
              th { background-color: #f5f5f5; text-transform: uppercase; }
              .header { margin-bottom: 40px; }
              .checkbox { width: 24px; text-align: center; font-weight: bold; }
              @media print {
                body { padding: 0; }
              }
            </style>
          </head>
          <body>
            <div class="header">
              <h1>LIFE OS - ${activeTab} PERFORMANCE AUDIT</h1>
              <p><strong>TIMESTAMP:</strong> ${new Date().toLocaleString()}</p>
            </div>
            
            <h2>SYSTEM STATUS</h2>
            <table>
              <tr><th>Operator Level</th><td>Level ${dash?.xp?.level || 1} (${dash?.xp?.current || 0} XP)</td></tr>
              ${statsHtml}
            </table>
            
            ${missionsHtml}
            
            <h2>HABIT PROTOCOLS</h2>
            <table>
              <tr><th class="checkbox">✓</th><th>Habit Name</th></tr>
              ${(habits?.log?.habits || []).map((h: any) => `<tr><td class="checkbox">${h.completed ? 'X' : ' '}</td><td>${h.name}</td></tr>`).join('')}
            </table>
            
            <h2>ENGINEERING PIPELINE (PROJECTS)</h2>
            <table>
              <tr><th>Project Name</th><th>Status</th><th>Progress</th></tr>
              ${(dev?.projects || []).map((p: any) => `<tr><td>${p.name}</td><td>${p.status || 'ACTIVE'}</td><td>${p.progress}%</td></tr>`).join('')}
            </table>

            <h2>ENGINEERING PIPELINE (MODULES)</h2>
            <table>
              <tr><th>Module Name</th><th>Status</th><th>Progress</th></tr>
              ${(dev?.journeys || []).map((j: any) => `<tr><td>${j.name}</td><td>${j.status || 'IN-PROGRESS'}</td><td>${j.progress}%</td></tr>`).join('')}
            </table>
            
            <h2>CORE CONVICTIONS</h2>
            <table>
              <tr><th>Target</th><th>Description</th></tr>
              ${(vision?.items || []).map((v: any) => `<tr><td>${v.title}</td><td>${v.description}</td></tr>`).join('')}
            </table>
            
            <script>
              window.onload = () => { 
                setTimeout(() => { window.print(); }, 500);
              }
            </script>
          </body>
        </html>
      `;

      const printWindow = window.open('', '_blank');
      if (printWindow) {
        printWindow.document.open();
        printWindow.document.write(htmlContent);
        printWindow.document.close();
      }
    } catch (err) {
      console.error('Audit failed:', err);
    } finally {
      setLoading(false);
    }
  };

  if (!mounted) return null;

  return (
    <div className="flex flex-col gap-[32px] pb-[48px]">
        {/* Header */}
        <div className="flex justify-between items-end border-b border-[#1A1A1A] pb-[24px] s1">
          <div>
            <div className="font-['IBM_Plex_Mono'] text-[18px] text-[#FFFFFF] font-bold uppercase tracking-[0.12em] mb-[4px]">
              PERFORMANCE AUDIT
            </div>
            <div className="font-['IBM_Plex_Mono'] text-[11px] text-[#555555] uppercase tracking-[0.12em]">
              SYNCED DATA ANALYTICS · {activeTab} REPORT
            </div>
          </div>
          <div className="flex gap-[12px]">
            {(['DAILY', 'WEEKLY', 'MONTHLY'] as ReviewTab[]).map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-[16px] py-[8px] font-['IBM_Plex_Mono'] text-[10px] uppercase tracking-[0.1em] border transition-all ${
                  activeTab === tab ? 'bg-[#FFFFFF] text-[#000000] border-[#FFFFFF]' : 'text-[#555555] border-[#1A1A1A] hover:border-[#333333]'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        <div className="flex gap-[24px]">
          {/* Metrics */}
          <div className="w-[50%] flex flex-col gap-[20px]">
            <div className="font-['IBM_Plex_Mono'] text-[10px] text-[#555555] uppercase tracking-[0.16em]">SYNCED METRICS</div>
            <div className="grid grid-cols-2 gap-[1px] bg-[#1A1A1A] border border-[#1A1A1A]">
              <div className="bg-[#050505] p-[24px] flex flex-col gap-[12px]">
                <div className="flex items-center gap-[8px] text-[#555555]"><ShieldCheck size={14} /><span className="font-['IBM_Plex_Mono'] text-[9px] uppercase">DISCIPLINE SCORE</span></div>
                <div className="font-['IBM_Plex_Mono'] text-[48px] text-[#FFFFFF] font-bold leading-none">{stats.disciplineScore}%</div>
              </div>
              <div className="bg-[#050505] p-[24px] flex flex-col gap-[12px]">
                <div className="flex items-center gap-[8px] text-[#555555]"><Clock size={14} /><span className="font-['IBM_Plex_Mono'] text-[9px] uppercase">DEEP WORK</span></div>
                <div className="font-['IBM_Plex_Mono'] text-[48px] text-[#FFFFFF] font-bold leading-none">{Math.floor(stats.focusMinutes / 60)}H {stats.focusMinutes % 60}M</div>
              </div>
              <div className="bg-[#050505] p-[24px] flex flex-col gap-[12px]">
                <div className="flex items-center gap-[8px] text-[#555555]"><CheckCircle2 size={14} /><span className="font-['IBM_Plex_Mono'] text-[9px] uppercase">HABITS</span></div>
                <div className="font-['IBM_Plex_Mono'] text-[48px] text-[#FFFFFF] font-bold leading-none">{stats.habitsCompleted}/{stats.totalHabits}</div>
              </div>
              <div className="bg-[#050505] p-[24px] flex flex-col gap-[12px]">
                <div className="flex items-center gap-[8px] text-[#555555]"><TrendingUp size={14} /><span className="font-['IBM_Plex_Mono'] text-[9px] uppercase">EXECUTION</span></div>
                <div className="font-['IBM_Plex_Mono'] text-[48px] text-[#4ADE80] font-bold leading-none">{stats.weeklyProgress}%</div>
              </div>
            </div>
          </div>

          <div className="w-[50%] flex flex-col gap-[20px]">
            <div className="font-['IBM_Plex_Mono'] text-[10px] text-[#555555] uppercase tracking-[0.16em]">SYSTEM ACTION</div>
            <div 
              onClick={downloadAudit}
              className="bg-[#050505] border border-[#1A1A1A] p-[40px] flex flex-col items-center justify-center gap-[16px] cursor-pointer hover:bg-[#080808] transition-all group"
            >
              <BarChart3 size={32} className="text-[#333333] group-hover:text-[#FFFFFF] transition-colors" />
              <div className="text-center">
                <div className="font-['IBM_Plex_Mono'] text-[12px] text-[#FFFFFF] uppercase tracking-[0.16em] mb-[4px]">GENERATE PDF AUDIT</div>
                <div className="font-['IBM_Plex_Mono'] text-[9px] text-[#555555] uppercase tracking-[0.1em]">PRINT VIEW · ALL MODULES</div>
              </div>
            </div>
          </div>
        </div>
      </div>
  );
}
