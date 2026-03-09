import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { WindowState, AppDefinition } from '@/types';

export const APPS: AppDefinition[] = [
  { id: 'clock', name: 'Clock', icon: '🕐', color: '#0078d4' },
  { id: 'music', name: 'Music', icon: '🎵', color: '#e91e63' },
  { id: 'files', name: 'Files', icon: '📁', color: '#ff9800' },
  { id: 'text', name: 'Text Editor', icon: '📝', color: '#4caf50' },
  { id: 'spreadsheet', name: 'Spreadsheet', icon: '📊', color: '#2e7d32' },
  { id: 'presentation', name: 'Presentation', icon: '📽️', color: '#f44336' },
  { id: 'calendar', name: 'Calendar', icon: '📅', color: '#9c27b0' },
  { id: 'planner', name: 'Planner', icon: '✅', color: '#00bcd4' },
];

interface DesktopStore {
  windows: WindowState[];
  nextZIndex: number;
  wallpaper: string;
  setWallpaper: (url: string) => void;
  openApp: (appId: string) => void;
  closeWindow: (windowId: string) => void;
  focusWindow: (windowId: string) => void;
  minimizeWindow: (windowId: string) => void;
  maximizeWindow: (windowId: string) => void;
  restoreWindow: (windowId: string) => void;
  updateWindowPosition: (windowId: string, x: number, y: number) => void;
  updateWindowSize: (windowId: string, width: number, height: number) => void;
}

let windowCounter = 0;

export const useDesktopStore = create<DesktopStore>()(
  persist(
    (set, get) => ({
      windows: [],
      nextZIndex: 1,
      wallpaper: '',
      setWallpaper: (url) => set({ wallpaper: url }),
      openApp: (appId) => {
        const existing = get().windows.find(
          (w) => w.appId === appId && !w.isMinimized
        );
        if (existing) {
          get().focusWindow(existing.id);
          return;
        }
        const minimized = get().windows.find(
          (w) => w.appId === appId && w.isMinimized
        );
        if (minimized) {
          set((s) => ({
            windows: s.windows.map((w) =>
              w.id === minimized.id ? { ...w, isMinimized: false, zIndex: s.nextZIndex } : w
            ),
            nextZIndex: s.nextZIndex + 1,
          }));
          return;
        }
        const app = APPS.find((a) => a.id === appId);
        if (!app) return;
        const id = `${appId}-${++windowCounter}`;
        const offset = (get().windows.length % 5) * 30;
        const newWindow: WindowState = {
          id,
          appId,
          title: app.name,
          x: 100 + offset,
          y: 60 + offset,
          width: appId === 'clock' ? 480 : 700,
          height: appId === 'clock' ? 560 : 500,
          isMinimized: false,
          isMaximized: false,
          zIndex: get().nextZIndex,
        };
        set((s) => ({
          windows: [...s.windows, newWindow],
          nextZIndex: s.nextZIndex + 1,
        }));
      },
      closeWindow: (windowId) =>
        set((s) => ({
          windows: s.windows.filter((w) => w.id !== windowId),
        })),
      focusWindow: (windowId) =>
        set((s) => ({
          windows: s.windows.map((w) =>
            w.id === windowId ? { ...w, zIndex: s.nextZIndex } : w
          ),
          nextZIndex: s.nextZIndex + 1,
        })),
      minimizeWindow: (windowId) =>
        set((s) => ({
          windows: s.windows.map((w) =>
            w.id === windowId ? { ...w, isMinimized: true } : w
          ),
        })),
      maximizeWindow: (windowId) =>
        set((s) => ({
          windows: s.windows.map((w) =>
            w.id === windowId ? { ...w, isMaximized: true } : w
          ),
        })),
      restoreWindow: (windowId) =>
        set((s) => ({
          windows: s.windows.map((w) =>
            w.id === windowId ? { ...w, isMaximized: false } : w
          ),
        })),
      updateWindowPosition: (windowId, x, y) =>
        set((s) => ({
          windows: s.windows.map((w) =>
            w.id === windowId ? { ...w, x, y } : w
          ),
        })),
      updateWindowSize: (windowId, width, height) =>
        set((s) => ({
          windows: s.windows.map((w) =>
            w.id === windowId ? { ...w, width, height } : w
          ),
        })),
    }),
    {
      name: 'sko-desktop',
      partialize: (state) => ({
        wallpaper: state.wallpaper,
      }),
    }
  )
);
