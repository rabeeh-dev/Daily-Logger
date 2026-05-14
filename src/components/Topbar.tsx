'use client';

import { usePathname } from 'next/navigation';

export default function Topbar() {
  const pathname = usePathname();
  const pageName = pathname === '/' || pathname === '' ? 'DASHBOARD' : pathname.split('/')[1].replace('-', ' ').toUpperCase();

  const now = new Date();
  const dayName = now.toLocaleDateString('en-US', { weekday: 'short' }).toUpperCase();
  const monthName = now.toLocaleDateString('en-US', { month: 'short' }).toUpperCase();
  const dayNum = now.getDate();
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  const dateStr = `${dayName}, ${monthName} ${dayNum} · ${hours}:${minutes}`;

  return (
    <header className="fixed top-0 left-[240px] right-0 h-[56px] bg-[#000000] border-b border-[#1A1A1A] flex items-center justify-between px-[16px] z-40">
      <div className="flex items-center h-full">
        <span className="font-['IBM_Plex_Mono'] text-[11px] text-[#FFFFFF] tracking-[0.28em] uppercase">
          LIFE OS
        </span>
        <div className="w-[1px] h-[20px] bg-[#1A1A1A] mx-[16px]" />
        <span className="font-['IBM_Plex_Mono'] text-[11px] text-[#3A3A3A] tracking-[0.12em] uppercase">
          {pageName}
        </span>
      </div>

      <div className="flex items-center h-full">
        <span className="font-['IBM_Plex_Mono'] text-[11px] text-[#3A3A3A] uppercase">
          {dateStr}
        </span>
        <div className="w-[1px] h-[20px] bg-[#1A1A1A] mx-[16px]" />
        <div className="w-[28px] h-[28px] border border-[#1A1A1A] bg-[#0D0D0D] flex items-center justify-center font-['IBM_Plex_Mono'] text-[11px] text-[#FFFFFF]">
          R
        </div>
      </div>
    </header>
  );
}
