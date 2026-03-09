'use client';

import React from 'react';
import { useDesktopStore, APPS } from '@/store/desktopStore';
import Window from './Window';
import Taskbar from './Taskbar';
import FullscreenClock from '@/components/apps/clock/FullscreenClock';

// Lazy app components
import ClockApp from '@/components/apps/clock/ClockApp';
import MusicPlayer from '@/components/apps/music/MusicPlayer';
import FileManager from '@/components/apps/files/FileManager';
import TextEditor from '@/components/apps/documents/TextEditor';
import SpreadsheetApp from '@/components/apps/documents/SpreadsheetApp';
import PresentationApp from '@/components/apps/documents/PresentationApp';
import CalendarApp from '@/components/apps/calendar/CalendarApp';
import PlannerApp from '@/components/apps/planner/PlannerApp';

const APP_COMPONENTS: Record<string, React.ComponentType> = {
  clock: ClockApp,
  music: MusicPlayer,
  files: FileManager,
  text: TextEditor,
  spreadsheet: SpreadsheetApp,
  presentation: PresentationApp,
  calendar: CalendarApp,
  planner: PlannerApp,
};

export default function Desktop() {
  const { windows, openApp, wallpaper } = useDesktopStore();

  return (
    <div className="w-screen h-screen overflow-hidden relative bg-[#0a0a0a]">
      {/* Wallpaper */}
      {wallpaper ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={wallpaper}
          alt="Wallpaper"
          className="absolute inset-0 w-full h-full object-cover"
        />
      ) : (
        <div
          className="absolute inset-0"
          style={{
            background:
              'radial-gradient(ellipse at 50% 80%, #1a1a3e 0%, #0d0d1a 50%, #050510 100%)',
          }}
        />
      )}

      {/* Desktop icon grid */}
      <div className="absolute inset-0 p-4 pb-14 grid grid-cols-[repeat(auto-fill,80px)] grid-rows-[repeat(auto-fill,90px)] gap-1 content-start items-start">
        {APPS.map((app) => (
          <button
            key={app.id}
            onDoubleClick={() => openApp(app.id)}
            className="flex flex-col items-center justify-center gap-1 p-2 rounded-md hover:bg-white/10 active:bg-white/15 transition-colors cursor-default"
          >
            <span className="text-3xl drop-shadow-md">{app.icon}</span>
            <span className="text-[11px] text-white/80 text-center leading-tight drop-shadow-sm max-w-[70px] truncate">
              {app.name}
            </span>
          </button>
        ))}
      </div>

      {/* Windows */}
      {windows.map((win) => {
        const AppComponent = APP_COMPONENTS[win.appId];
        if (!AppComponent) return null;
        return (
          <Window key={win.id} windowState={win}>
            <AppComponent />
          </Window>
        );
      })}

      {/* Taskbar */}
      <Taskbar />

      {/* Fullscreen Clock overlay */}
      <FullscreenClock />
    </div>
  );
}
