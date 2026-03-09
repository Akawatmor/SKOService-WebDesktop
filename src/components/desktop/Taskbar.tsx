'use client';

import React from 'react';
import { useDesktopStore, APPS } from '@/store/desktopStore';
import { useClock } from '@/hooks/useClock';

export default function Taskbar() {
  const { windows, openApp, minimizeWindow } = useDesktopStore();
  const { date } = useClock();

  const timeStr = date.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });
  const dateStr = date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  const handleAppClick = (appId: string) => {
    const existingWindow = windows.find((w) => w.appId === appId);
    if (existingWindow) {
      if (existingWindow.isMinimized) {
        openApp(appId);
      } else {
        // Toggle minimize
        minimizeWindow(existingWindow.id);
      }
    } else {
      openApp(appId);
    }
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 h-12 flex items-center justify-center px-4 bg-[rgba(32,32,32,0.85)] backdrop-blur-xl border-t border-white/5 z-[90]">
      {/* Centered app icons */}
      <div className="flex items-center gap-0.5">
        {APPS.map((app) => {
          const isOpen = windows.some((w) => w.appId === app.id);
          return (
            <button
              key={app.id}
              onClick={() => handleAppClick(app.id)}
              className={`w-11 h-10 flex flex-col items-center justify-center rounded-md transition-all hover:bg-white/10 relative group ${
                isOpen ? 'bg-white/8' : ''
              }`}
              title={app.name}
            >
              <span className="text-lg leading-none">{app.icon}</span>
              {isOpen && (
                <span className="absolute bottom-0.5 w-4 h-[2px] rounded-full bg-[#0078d4]" />
              )}
              {/* Tooltip */}
              <span className="absolute -top-8 px-2 py-1 bg-[rgba(40,40,40,0.95)] rounded text-xs text-white/80 whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity border border-white/10">
                {app.name}
              </span>
            </button>
          );
        })}
      </div>

      {/* System tray - right side */}
      <div className="absolute right-3 flex items-center gap-3 text-xs text-white/60">
        <div className="flex flex-col items-end leading-tight">
          <span>{timeStr}</span>
          <span className="text-[10px] text-white/40">{dateStr}</span>
        </div>
      </div>
    </div>
  );
}
