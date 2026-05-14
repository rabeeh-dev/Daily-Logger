'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Home, List, Calendar, Heart, Timer, Code, Eye, BarChart, Settings, LogOut } from 'lucide-react';

const NAV_ITEMS = [
  { href: '/dashboard', label: 'DASHBOARD', icon: Home },
  { href: '/daily', label: 'EXECUTION', icon: List },
  { href: '/weekly-planner', label: 'PLANNING', icon: Calendar },
  { href: '/habits', label: 'HABITS', icon: Heart },
  { href: '/lock-in', label: 'LOCK-IN', icon: Timer },
  { href: '/dev-hub', label: 'DEV HUB', icon: Code },
  { href: '/vision', label: 'VISION', icon: Eye },
  { href: '/reviews', label: 'REVIEWS', icon: BarChart },
];

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = async () => {
    try {
      const response = await fetch('/api/auth/logout', { method: 'POST' });
      if (response.ok) {
        router.push('/login');
      }
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  return (
    <aside className="fixed left-0 top-0 w-[240px] h-full bg-[#000000] border-r border-[#1A1A1A] flex flex-col z-50">
      <div className="py-[20px] px-[16px] font-['IBM_Plex_Mono'] text-[12px] tracking-[0.28em] text-[#FFFFFF] border-b border-[#1A1A1A]">
        LIFE OS
      </div>

      <nav className="flex-1 overflow-y-auto py-2">
        {NAV_ITEMS.map((item) => {
          const active = pathname === item.href;
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-[10px] h-[42px] px-[16px] transition-colors duration-120 group ${
                active
                  ? 'bg-[#0D0D0D] border-l-2 border-[#FFFFFF] text-[#FFFFFF]'
                  : 'text-[#3A3A3A] hover:text-[#FFFFFF] hover:bg-[#080808] border-l-2 border-transparent'
              }`}
            >
              <Icon size={14} className={active ? 'text-[#FFFFFF]' : 'text-[#3A3A3A] group-hover:text-[#FFFFFF]'} />
              <span className="font-['IBM_Plex_Mono'] text-[11px] uppercase tracking-[0.12em]">
                {item.label}
              </span>
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-[#1A1A1A] flex flex-col">
        
        <button
          onClick={handleLogout}
          className="flex items-center gap-[10px] h-[42px] px-[16px] text-[#F87171] hover:bg-[#F87171] hover:text-[#000000] transition-colors group"
        >
          <LogOut size={14} />
          <span className="font-['IBM_Plex_Mono'] text-[11px] uppercase tracking-[0.12em]">
            TERMINATE SESSION
          </span>
        </button>

        <div className="h-[4px] w-full bg-[#4ADE80]"></div>
      </div>
    </aside>
  );
}
