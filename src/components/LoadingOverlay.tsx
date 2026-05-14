'use client';

import React from 'react';

export default function LoadingOverlay() {
  return (
    <div className="fixed inset-0 z-[9999] bg-[#000000] flex flex-col items-center justify-center pointer-events-none transition-opacity duration-500">
      <div className="flex flex-col items-center gap-[24px]">
        {/* Terminal Scanner Effect */}
        <div className="w-[300px] h-[2px] bg-[#1A1A1A] relative overflow-hidden">
          <div className="absolute inset-0 bg-[#FFFFFF] w-[40%] animate-scan"></div>
        </div>
        
        <div className="flex flex-col items-center gap-[8px]">
          <div className="font-['IBM_Plex_Mono'] text-[12px] text-[#FFFFFF] uppercase tracking-[0.2em] animate-pulse">
            SYNCING WITH CORE_DATABASE
          </div>
          <div className="font-['IBM_Plex_Mono'] text-[9px] text-[#555555] uppercase tracking-[0.1em]">
            FETCHING SYSTEM PROTOCOLS...
          </div>
        </div>
      </div>
      
      {/* Background Grid Decorations */}
      <div className="absolute bottom-[48px] left-[48px] font-['IBM_Plex_Mono'] text-[9px] text-[#1A1A1A] leading-relaxed select-none">
        BOOT_SEQ: 0x4421<br/>
        ENCRYPTION: ENABLED<br/>
        STATUS: INITIALIZING_HUD
      </div>
      
      <div className="absolute top-[48px] right-[48px] font-['IBM_Plex_Mono'] text-[9px] text-[#1A1A1A] text-right select-none">
        CORE_LOAD_ACTIVE<br/>
        MEM_SYNC_PRIMARY<br/>
        v1.0.42_STABLE
      </div>

      <style jsx>{`
        @keyframes scan {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(300%); }
        }
        .animate-scan {
          animation: scan 1.5s cubic-bezier(0.4, 0, 0.2, 1) infinite;
        }
      `}</style>
    </div>
  );
}
