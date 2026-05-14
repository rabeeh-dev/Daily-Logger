'use client';

import React, { useState, useEffect } from 'react';
import { Shield, Lock, Settings, User, Terminal, Database, Bell, Layout } from 'lucide-react';
import { useRouter } from 'next/navigation';


export default function SettingsPage() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [config, setConfig] = useState<any>(null);

  useEffect(() => {
    setMounted(true);
    fetchSettingsData();
  }, []);

  const fetchSettingsData = async () => {
    try {
      setLoading(true);
      const [uRes, cRes] = await Promise.all([
        fetch('/api/auth/me'),
        fetch('/api/settings')
      ]);
      if (uRes.ok) {
        const uData = await uRes.json();
        setUser(uData.user);
      }
      if (cRes.ok) {
        const cData = await cRes.json();
        setConfig(cData);
      }
    } catch (err) {
      console.error('Failed to fetch settings:', err);
    } finally {
      setTimeout(() => setLoading(false), 800);
    }
  };

  const updateConfig = async (updates: any) => {
    try {
      const newConfig = { ...config, ...updates };
      setConfig(newConfig);
      await fetch('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      });
    } catch (err) {
      console.error('Failed to update config:', err);
    }
  };

  const logout = async () => {
    setLoading(true);
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/login');
  };

  if (!mounted) return null;

  return (
    <div className="flex flex-col gap-[32px] pb-[48px]">
        {/* Header */}
        <div className="flex justify-between items-end border-b border-[#1A1A1A] pb-[24px] s1">
          <div>
            <div className="font-['IBM_Plex_Mono'] text-[18px] text-[#FFFFFF] font-bold uppercase tracking-[0.12em] mb-[4px]">
              SYSTEM CONFIGURATION
            </div>
            <div className="font-['IBM_Plex_Mono'] text-[11px] text-[#555555] uppercase tracking-[0.12em]">
              IDENTITY · PROTOCOLS · GLOBAL PARAMETERS
            </div>
          </div>
          <div className="flex items-center gap-[12px]">
            <div className="w-[10px] h-[10px] bg-[#4ADE80]"></div>
            <div className="font-['IBM_Plex_Mono'] text-[10px] text-[#4ADE80] uppercase tracking-[0.12em]">
              LIVE SYNC ACTIVE
            </div>
          </div>
        </div>

        <div className="flex gap-[24px]">
          {/* Left Column - Profile & Auth */}
          <div className="w-[40%] flex flex-col gap-[24px] s2">
            <div className="border border-[#1A1A1A] bg-[#050505] p-[32px] flex flex-col items-center">
              <div className="w-[80px] h-[80px] border border-[#FFFFFF] flex items-center justify-center font-['IBM_Plex_Mono'] text-[32px] font-bold text-[#FFFFFF] mb-[24px] relative">
                {user?.username?.[0]?.toUpperCase() || 'O'}
                <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-[#FFFFFF]"></div>
              </div>
              <h2 className="font-['IBM_Plex_Mono'] text-[20px] text-[#FFFFFF] font-bold uppercase mb-[4px]">{user?.username || 'OPERATOR'}</h2>
              <p className="font-['IBM_Plex_Mono'] text-[10px] text-[#555555] uppercase tracking-[0.12em] mb-[32px]">{user?.email || 'N/A'}</p>
              
              <div className="w-full h-[1px] bg-[#1A1A1A] mb-[32px]"></div>
              
              <button 
                onClick={logout}
                className="w-full h-[48px] border border-[#F87171] text-[#F87171] font-['IBM_Plex_Mono'] text-[11px] uppercase tracking-[0.2em] font-bold hover:bg-[#F87171] hover:text-[#000000] transition-all flex items-center justify-center gap-[12px]"
              >
                <Lock size={14} /> TERMINATE SESSION
              </button>
            </div>

            <div className="border border-[#1A1A1A] bg-[#050505] p-[24px]">
              <div className="flex items-center gap-[12px] mb-[20px]">
                <Terminal size={16} className="text-[#555555]" />
                <span className="font-['IBM_Plex_Mono'] text-[10px] text-[#555555] uppercase tracking-[0.16em]">SYSTEM DIAGNOSTICS</span>
              </div>
              <div className="flex flex-col gap-[12px]">
                <div className="flex justify-between font-['IBM_Plex_Mono'] text-[11px]">
                  <span className="text-[#333333] uppercase">OS VERSION</span>
                  <span className="text-[#FFFFFF]">{config?.osVersion || 'v2.1.0'}</span>
                </div>
                <div className="flex justify-between font-['IBM_Plex_Mono'] text-[11px]">
                  <span className="text-[#333333] uppercase">DATABASE</span>
                  <span className="text-[#FFFFFF]">MONGODB SYNC</span>
                </div>
                <div className="flex justify-between font-['IBM_Plex_Mono'] text-[11px]">
                  <span className="text-[#333333] uppercase">ENCRYPTION</span>
                  <span className="text-[#4ADE80]">AES-256-GCM</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Preferences */}
          <div className="w-[60%] flex flex-col gap-[24px] s3">
            <div className="border border-[#1A1A1A] bg-[#050505] p-[32px]">
              <div className="flex items-center gap-[12px] mb-[32px]">
                <Layout size={18} className="text-[#FFFFFF]" />
                <span className="font-['IBM_Plex_Mono'] text-[12px] text-[#FFFFFF] uppercase tracking-[0.16em] font-bold">PROTOCOL OVERRIDES</span>
              </div>
              
              <div className="flex flex-col gap-[1px] bg-[#1A1A1A] border border-[#1A1A1A]">
                <div className="bg-[#050505] p-[20px] flex justify-between items-center hover:bg-[#080808] transition-all">
                  <div className="flex items-center gap-[16px]">
                    <div className="text-[#333333]"><Settings size={14} /></div>
                    <div>
                      <div className="font-['IBM_Plex_Mono'] text-[11px] text-[#FFFFFF] font-bold uppercase mb-[2px]">BRUTALIST INTERFACE</div>
                      <div className="font-['IBM_Plex_Mono'] text-[9px] text-[#555555] uppercase">System-wide high contrast theme</div>
                    </div>
                  </div>
                  <button 
                    onClick={() => updateConfig({ brutalistInterface: !config.brutalistInterface })}
                    className={`font-['IBM_Plex_Mono'] text-[10px] px-[12px] py-[4px] border ${config?.brutalistInterface ? 'bg-[#FFFFFF] text-[#000000] border-[#FFFFFF]' : 'bg-transparent text-[#555555] border-[#333333]'}`}
                  >
                    {config?.brutalistInterface ? 'ENABLED' : 'DISABLED'}
                  </button>
                </div>

                <div className="bg-[#050505] p-[20px] flex justify-between items-center hover:bg-[#080808] transition-all">
                  <div className="flex items-center gap-[16px]">
                    <div className="text-[#333333]"><Bell size={14} /></div>
                    <div>
                      <div className="font-['IBM_Plex_Mono'] text-[11px] text-[#FFFFFF] font-bold uppercase mb-[2px]">SMART NOTIFICATIONS</div>
                      <div className="font-['IBM_Plex_Mono'] text-[9px] text-[#555555] uppercase">Real-time achievement & task alerts</div>
                    </div>
                  </div>
                  <button 
                    onClick={() => updateConfig({ smartNotifications: !config.smartNotifications })}
                    className={`font-['IBM_Plex_Mono'] text-[10px] px-[12px] py-[4px] border ${config?.smartNotifications ? 'bg-[#FFFFFF] text-[#000000] border-[#FFFFFF]' : 'bg-transparent text-[#555555] border-[#333333]'}`}
                  >
                    {config?.smartNotifications ? 'ENABLED' : 'DISABLED'}
                  </button>
                </div>

                <div className="bg-[#050505] p-[20px] flex justify-between items-center hover:bg-[#080808] transition-all">
                  <div className="flex items-center gap-[16px]">
                    <div className="text-[#333333]"><Database size={14} /></div>
                    <div>
                      <div className="font-['IBM_Plex_Mono'] text-[11px] text-[#FFFFFF] font-bold uppercase mb-[2px]">AUTO-SYNC LATENCY</div>
                      <div className="font-['IBM_Plex_Mono'] text-[9px] text-[#555555] uppercase">Aesthetic delay for data integrity</div>
                    </div>
                  </div>
                  <select 
                    value={config?.autoSyncLatency || 600}
                    onChange={(e) => updateConfig({ autoSyncLatency: parseInt(e.target.value) })}
                    className="bg-transparent border border-[#333333] text-[#FFFFFF] font-['IBM_Plex_Mono'] text-[10px] px-[8px] py-[4px] outline-none"
                  >
                    <option value={400} className="bg-[#000000]">400MS</option>
                    <option value={600} className="bg-[#000000]">600MS</option>
                    <option value={800} className="bg-[#000000]">800MS</option>
                    <option value={1000} className="bg-[#000000]">1000MS</option>
                  </select>
                </div>

                <div className="bg-[#050505] p-[20px] flex justify-between items-center hover:bg-[#080808] transition-all">
                  <div className="flex items-center gap-[16px]">
                    <div className="text-[#333333]"><Shield size={14} /></div>
                    <div>
                      <div className="font-['IBM_Plex_Mono'] text-[11px] text-[#FFFFFF] font-bold uppercase mb-[2px]">BIO-SYNC PROTOCOL</div>
                      <div className="font-['IBM_Plex_Mono'] text-[9px] text-[#555555] uppercase">Personal bio-rhythm integration</div>
                    </div>
                  </div>
                  <input 
                    type="text"
                    value={config?.bioSyncProtocol || 'STABLE'}
                    onChange={(e) => updateConfig({ bioSyncProtocol: e.target.value.toUpperCase() })}
                    className="w-[100px] bg-transparent border border-[#333333] text-[#FFFFFF] font-['IBM_Plex_Mono'] text-[10px] px-[8px] py-[4px] outline-none text-center"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-[24px]">
              <div className="border border-[#1A1A1A] bg-[#050505] p-[24px]">
                <div className="font-['IBM_Plex_Mono'] text-[10px] text-[#555555] uppercase tracking-[0.16em] mb-[16px]">API SUBSYSTEM</div>
                <div className="flex flex-col gap-[8px]">
                  <div className="h-[2px] w-full bg-[#1A1A1A] overflow-hidden">
                    <div className="h-full bg-[#FFFFFF] w-[85%]"></div>
                  </div>
                  <div className="flex justify-between font-['IBM_Plex_Mono'] text-[9px] text-[#FFFFFF]">
                    <span>UPTIME</span>
                    <span>99.99%</span>
                  </div>
                </div>
              </div>
              <div className="border border-[#1A1A1A] bg-[#050505] p-[24px]">
                <div className="font-['IBM_Plex_Mono'] text-[10px] text-[#555555] uppercase tracking-[0.16em] mb-[16px]">CORE INTEGRITY</div>
                <div className="flex flex-col gap-[8px]">
                  <div className="h-[2px] w-full bg-[#1A1A1A] overflow-hidden">
                    <div className="h-full bg-[#4ADE80] w-[100%]"></div>
                  </div>
                  <div className="flex justify-between font-['IBM_Plex_Mono'] text-[9px] text-[#4ADE80]">
                    <span>NO DEFECTS</span>
                    <span>NOMINAL</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-auto p-[24px] border border-[#1A1A1A] bg-[#0A0A0A] flex justify-between items-center">
              <div className="font-['IBM_Plex_Mono'] text-[10px] text-[#555555] uppercase tracking-[0.1em]">
                LAST REBOOT: {new Date().toLocaleTimeString()} · STATUS: {config?.nodeEnv || 'PRODUCTION'}
              </div>
              <div className="font-['IBM_Plex_Mono'] text-[10px] text-[#FFFFFF] font-bold uppercase">
                LATENCY: {config?.autoSyncLatency || 600}MS
              </div>
            </div>
          </div>
        </div>
      </div>
  );
}
