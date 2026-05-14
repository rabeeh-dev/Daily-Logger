'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Play, Square, Timer, Tag, Quote, History } from 'lucide-react';


const FOCUS_QUOTES = [
  "Deep work is the ability to focus without distraction.",
  "Discipline is choosing between what you want now and what you want most.",
  "Concentrated power is the only kind that counts.",
  "Your focus determines your reality.",
  "The successful warrior is the average man, with laser-like focus."
];

export default function LockInPage() {
  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isActive, setIsActive] = useState(false);
  const [timeLeft, setTimeLeft] = useState(1500); 
  const [activeTag, setActiveTag] = useState('DEEP WORK');
  const [quote, setQuote] = useState(FOCUS_QUOTES[0]);
  const [customMinutes, setCustomMinutes] = useState('25');
  const [history, setHistory] = useState<any[]>([]);

  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const startSecondsRef = useRef(1500);
  const timeLeftRef = useRef(1500);

  useEffect(() => {
    setMounted(true);
    setQuote(FOCUS_QUOTES[Math.floor(Math.random() * FOCUS_QUOTES.length)]);
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/deep-work');
      if (res.ok) {
        const data = await res.json();
        setHistory(data);
      }
    } catch (err) {
      console.error('Failed to fetch history:', err);
    } finally {
      setTimeout(() => setLoading(false), 600);
    }
  };

  const playBeep = () => {
    try {
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gainNode = ctx.createGain();
      
      osc.type = 'sine';
      osc.frequency.setValueAtTime(880, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(440, ctx.currentTime + 0.5);
      
      gainNode.gain.setValueAtTime(0.5, ctx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.5);
      
      osc.connect(gainNode);
      gainNode.connect(ctx.destination);
      
      osc.start();
      osc.stop(ctx.currentTime + 0.5);
    } catch (e) {
      console.error('Audio playback failed', e);
    }
  };

  const startTimer = () => {
    if (timerRef.current) return; // Prevent multiple intervals
    setIsActive(true);
    startSecondsRef.current = timeLeft;
    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        const next = prev - 1;
        timeLeftRef.current = next;
        if (next <= 0) {
          if (timerRef.current) clearInterval(timerRef.current);
          setIsActive(false);
          playBeep();
          saveSession(true, startSecondsRef.current);
          return 0;
        }
        return next;
      });
    }, 1000);
  };

  const saveSession = async (completed: boolean, overrideDuration?: number) => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    setIsActive(false);
    
    const durationSpent = overrideDuration !== undefined ? overrideDuration : (startSecondsRef.current - timeLeftRef.current);
    if (durationSpent < 60) return; // Don't save sessions under 1 minute

    try {
      const res = await fetch('/api/deep-work', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          task: activeTag,
          category: activeTag,
          durationMinutes: Math.round(durationSpent / 60),
          completed: completed,
          xpEarned: Math.round((durationSpent / 60) * 2) // 2 XP per minute
        })
      });
      if (res.ok) {
        fetchHistory();
      }
    } catch (err) {
      console.error('Failed to save session:', err);
    }
  };

  const stopTimer = () => saveSession(false);

  const resetTimer = (seconds: number) => {
    if (timerRef.current) saveSession(false);
    setTimeLeft(seconds);
    startSecondsRef.current = seconds;
    timeLeftRef.current = seconds;
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const totalMinutesToday = history.reduce((acc, curr) => acc + (curr.durationMinutes || 0), 0);

  if (!mounted) return null;

  return (
    <div className="flex flex-col gap-[32px] pb-[48px]">
        {/* Header */}
        <div className="flex justify-between items-end border-b border-[#1A1A1A] pb-[24px] s1">
          <div>
            <div className="font-['IBM_Plex_Mono'] text-[18px] text-[#FFFFFF] font-bold uppercase tracking-[0.12em] mb-[4px]">
              LOCK-IN PROTOCOL
            </div>
            <div className="font-['IBM_Plex_Mono'] text-[11px] text-[#555555] uppercase tracking-[0.12em]">
              SESSION MANAGEMENT · DEEP WORK MODE
            </div>
          </div>
          <div className="flex items-center gap-[12px]">
            <div className={`w-[10px] h-[10px] bg-[#F87171] ${isActive ? 'animate-pulse' : 'opacity-20'}`}></div>
            <div className="font-['IBM_Plex_Mono'] text-[10px] text-[#F87171] uppercase tracking-[0.12em]">
              {isActive ? 'SYSTEM LOCKED' : 'SYSTEM IDLE'}
            </div>
          </div>
        </div>

        <div className="flex gap-[24px]">
          <div className="w-[60%] flex flex-col gap-[32px] s2">
            <div className="border border-[#1A1A1A] bg-[#050505] p-[64px] flex flex-col items-center justify-center relative overflow-hidden">
              <div className="font-['IBM_Plex_Mono'] text-[72px] font-bold text-[#FFFFFF] leading-none tracking-tighter mb-[12px]">
                {formatTime(timeLeft)}
              </div>
              <div className="font-['IBM_Plex_Mono'] text-[10px] text-[#555555] uppercase tracking-[0.4em] mb-[32px]">
                {isActive ? 'FOCUS IN PROGRESS' : 'READY TO ENGAGE'}
              </div>
              <div className="flex gap-[12px]">
                {!isActive ? (
                  <button onClick={startTimer} className="h-[56px] px-[48px] bg-[#FFFFFF] text-[#000000] font-['IBM_Plex_Mono'] text-[14px] uppercase tracking-[0.2em] font-bold hover:bg-[#E0E0E0] flex items-center gap-[12px]">
                    <Play size={18} fill="currentColor" /> START
                  </button>
                ) : (
                  <button onClick={stopTimer} className="h-[56px] px-[48px] border border-[#F87171] text-[#F87171] font-['IBM_Plex_Mono'] text-[14px] uppercase tracking-[0.2em] font-bold hover:bg-[#F87171] hover:text-[#000000] flex items-center gap-[12px]">
                    <Square size={18} fill="currentColor" /> TERMINATE
                  </button>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-[24px]">
              <div className="flex flex-col gap-[16px]">
                <div className="font-['IBM_Plex_Mono'] text-[10px] text-[#555555] uppercase tracking-[0.16em]">DURATION SELECT</div>
                <div className="grid grid-cols-2 gap-[1px] bg-[#1A1A1A] border border-[#1A1A1A]">
                  {[1500, 3000, 5400, 7200].map((s) => (
                    <button key={s} onClick={() => resetTimer(s)} className={`h-[44px] font-['IBM_Plex_Mono'] text-[11px] ${timeLeft === s && !isActive ? 'bg-[#FFFFFF] text-[#000000]' : 'bg-[#000000] text-[#555555] hover:text-[#FFFFFF]'}`}>
                      {s / 60}M
                    </button>
                  ))}
                </div>
                <div className="flex gap-[8px]">
                  <input
                    type="number"
                    value={customMinutes}
                    onChange={(e) => setCustomMinutes(e.target.value)}
                    className="flex-1 bg-[#050505] border border-[#1A1A1A] text-[#FFFFFF] font-['IBM_Plex_Mono'] text-[11px] p-[8px] outline-none focus:border-[#FFFFFF]"
                    placeholder="CUSTOM (MINS)"
                  />
                  <button 
                    onClick={() => {
                      const mins = parseInt(customMinutes);
                      if (!isNaN(mins) && mins > 0) resetTimer(mins * 60);
                    }}
                    className="px-[16px] border border-[#2A2A2A] text-[#FFFFFF] font-['IBM_Plex_Mono'] text-[10px] font-bold hover:border-[#FFFFFF]"
                  >
                    SET
                  </button>
                </div>
              </div>
              <div className="flex flex-col gap-[16px]">
                <div className="font-['IBM_Plex_Mono'] text-[10px] text-[#555555] uppercase tracking-[0.16em]">SESSION TAG</div>
                <div className="flex flex-wrap gap-[8px]">
                  {['DEVELOPMENT', 'RESEARCH', 'DEEP WORK', 'PLANNING'].map((tag) => (
                    <button key={tag} onClick={() => setActiveTag(tag)} className={`px-[12px] h-[32px] font-['IBM_Plex_Mono'] text-[9px] uppercase tracking-[0.1em] border ${activeTag === tag ? 'bg-[#FFFFFF] text-[#000000] border-[#FFFFFF]' : 'bg-transparent text-[#333333] border-[#1A1A1A] hover:border-[#555555]'}`}>
                      {tag}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="w-[40%] flex flex-col gap-[32px] s3">
            <div className="border border-[#1A1A1A] bg-[#050505] p-[24px]">
              <Quote size={20} className="text-[#1A1A1A] mb-[12px]" />
              <div className="font-['Inter'] italic text-[14px] text-[#AAAAAA] leading-relaxed">
                &quot;{quote}&quot;
              </div>
            </div>

            <div className="flex flex-col gap-[16px]">
              <div className="font-['IBM_Plex_Mono'] text-[10px] text-[#555555] uppercase tracking-[0.16em]">SYNCED FOCUS HISTORY</div>
              <div className="flex flex-col gap-[1px] bg-[#1A1A1A] border border-[#1A1A1A]">
                {history.length === 0 ? (
                  <div className="bg-[#050505] p-[16px] text-center font-['IBM_Plex_Mono'] text-[10px] text-[#2A2A2A] uppercase">NO SESSIONS RECORDED</div>
                ) : (
                  history.slice(0, 5).map((h) => (
                    <div key={h._id} className="bg-[#050505] p-[12px] flex justify-between items-center">
                      <div className="flex flex-col gap-[2px]">
                        <div className="font-['Inter'] text-[12px] text-[#FFFFFF] font-medium uppercase">{h.task || h.category || 'DEEP WORK'}</div>
                        <div className="font-['IBM_Plex_Mono'] text-[8px] text-[#333333] uppercase">{new Date(h.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                      </div>
                      <div className="font-['IBM_Plex_Mono'] text-[12px] text-[#FFFFFF] font-bold">{h.durationMinutes}M</div>
                    </div>
                  ))
                )}
              </div>
            </div>

            <div className="mt-auto border border-[#1A1A1A] bg-[#050505] p-[20px]">
              <div className="font-['IBM_Plex_Mono'] text-[10px] text-[#555555] uppercase tracking-[0.16em] mb-[12px]">TODAY&apos;S TOTAL VOLUME</div>
              <div className="font-['IBM_Plex_Mono'] text-[24px] text-[#FFFFFF] font-bold">{Math.floor(totalMinutesToday / 60)}H {totalMinutesToday % 60}M</div>
              <div className="w-full h-[2px] bg-[#1A1A1A] mt-[12px] overflow-hidden">
                <div className="h-full bg-[#FFFFFF]" style={{ width: `${Math.min(100, (totalMinutesToday / 360) * 100)}%` }}></div>
              </div>
              <div className="flex justify-between mt-[6px]">
                <span className="font-['IBM_Plex_Mono'] text-[9px] text-[#2A2A2A] uppercase">TARGET: 6H</span>
                <span className="font-['IBM_Plex_Mono'] text-[9px] text-[#2A2A2A] uppercase">{Math.round((totalMinutesToday / 360) * 100)}%</span>
              </div>
            </div>
          </div>
        </div>
      </div>
  );
}
