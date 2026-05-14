'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Eye, EyeOff, Lock, User } from 'lucide-react';

export default function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();

      if (response.ok) {
        router.push('/dashboard');
      } else {
        setError(data.error || 'Invalid credentials');
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#000000] flex items-center justify-center p-[20px]">
      <div className="w-full max-w-[400px] flex flex-col gap-[32px] s1">
        {/* Branding */}
        <div className="text-center">
          <div className="font-['IBM_Plex_Mono'] text-[24px] text-[#FFFFFF] tracking-[0.28em] uppercase mb-[8px]">
            LIFE OS
          </div>
          <div className="font-['IBM_Plex_Mono'] text-[10px] text-[#555555] uppercase tracking-[0.16em]">
            RABEEH&apos;S PERSONAL OPERATING SYSTEM
          </div>
        </div>

        {/* Login Form */}
        <form onSubmit={handleLogin} className="border border-[#1A1A1A] bg-[#050505] p-[32px] flex flex-col gap-[24px]">
          <div className="font-['IBM_Plex_Mono'] text-[12px] text-[#FFFFFF] uppercase tracking-[0.16em] border-b border-[#1A1A1A] pb-[12px] flex items-center gap-2">
            <Lock size={14} className="text-[#555555]" />
            AUTHENTICATION REQUIRED
          </div>

          <div className="flex flex-col gap-[16px]">
            <div className="flex flex-col gap-[8px]">
              <label className="font-['IBM_Plex_Mono'] text-[10px] text-[#555555] uppercase tracking-[0.1em] flex items-center gap-2">
                <User size={10} /> OPERATOR ID
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="USERNAME"
                required
                className="bg-[#0A0A0A] border border-[#1A1A1A] text-[#FFFFFF] font-['IBM_Plex_Mono'] text-[12px] px-[12px] h-[44px] outline-none focus:border-[#FFFFFF] transition-colors placeholder-[#2A2A2A]"
              />
            </div>

            <div className="flex flex-col gap-[8px]">
              <label className="font-['IBM_Plex_Mono'] text-[10px] text-[#555555] uppercase tracking-[0.1em]">
                ACCESS KEY
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="PASSWORD"
                  required
                  className="w-full bg-[#0A0A0A] border border-[#1A1A1A] text-[#FFFFFF] font-['IBM_Plex_Mono'] text-[12px] px-[12px] h-[44px] outline-none focus:border-[#FFFFFF] transition-colors placeholder-[#2A2A2A]"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-[12px] top-[50%] translate-y-[-50%] text-[#555555] hover:text-[#FFFFFF] transition-colors"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>
          </div>

          {error && (
            <div className="font-['IBM_Plex_Mono'] text-[10px] text-[#F87171] uppercase tracking-[0.1em] border border-[#F87171] p-[10px] bg-[rgba(248,113,113,0.05)]">
              ERROR: {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="h-[48px] bg-[#FFFFFF] text-[#000000] font-['IBM_Plex_Mono'] text-[12px] uppercase tracking-[0.2em] font-bold hover:bg-[#E0E0E0] transition-colors disabled:opacity-50"
          >
            {loading ? 'VERIFYING...' : 'INITIALIZE SESSION'}
          </button>
        </form>

        <div className="text-center font-['IBM_Plex_Mono'] text-[9px] text-[#2A2A2A] uppercase tracking-[0.1em]">
          PROTECTED TERMINAL · AUTHORIZED ACCESS ONLY
        </div>
      </div>
    </div>
  );
}
