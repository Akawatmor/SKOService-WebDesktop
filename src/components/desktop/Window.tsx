'use client';

import React, { useRef, useEffect } from 'react';
import { useDesktopStore } from '@/store/desktopStore';
import type { WindowState } from '@/types';

interface WindowProps {
  windowState: WindowState;
  children: React.ReactNode;
}

export default function Window({ windowState, children }: WindowProps) {
  const {
    focusWindow,
    closeWindow,
    minimizeWindow,
    maximizeWindow,
    restoreWindow,
    updateWindowPosition,
    updateWindowSize,
  } = useDesktopStore();

  const windowRef = useRef<HTMLDivElement>(null);
  const isDragging = useRef(false);
  const isResizing = useRef(false);
  const dragOffset = useRef({ x: 0, y: 0 });

  // Global drag handlers - must be before early return (React hooks rules)
  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      if (!isDragging.current) return;
      const x = e.clientX - dragOffset.current.x;
      const y = Math.max(0, e.clientY - dragOffset.current.y);
      updateWindowPosition(windowState.id, x, y);
    };
    const onUp = () => {
      isDragging.current = false;
    };
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
    return () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
    };
  }, [windowState.id, updateWindowPosition]);

  if (windowState.isMinimized) return null;

  const style: React.CSSProperties = windowState.isMaximized
    ? {
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: 'calc(100vh - 48px)',
        zIndex: windowState.zIndex,
      }
    : {
        position: 'absolute',
        left: windowState.x,
        top: windowState.y,
        width: windowState.width,
        height: windowState.height,
        zIndex: windowState.zIndex,
      };

  const handleMouseDown = (e: React.MouseEvent) => {
    focusWindow(windowState.id);
    // Start dragging from title bar
    if ((e.target as HTMLElement).closest('.window-titlebar')) {
      if (windowState.isMaximized) return;
      isDragging.current = true;
      const rect = windowRef.current?.getBoundingClientRect();
      dragOffset.current = {
        x: e.clientX - (rect?.left ?? 0),
        y: e.clientY - (rect?.top ?? 0),
      };
      e.preventDefault();
    }
  };

  const handleResizeStart = (e: React.MouseEvent) => {
    if (windowState.isMaximized) return;
    e.stopPropagation();
    e.preventDefault();
    isResizing.current = true;
    focusWindow(windowState.id);

    const startX = e.clientX;
    const startY = e.clientY;
    const startW = windowState.width;
    const startH = windowState.height;

    const onMove = (ev: MouseEvent) => {
      const newW = Math.max(300, startW + (ev.clientX - startX));
      const newH = Math.max(200, startH + (ev.clientY - startY));
      updateWindowSize(windowState.id, newW, newH);
    };
    const onUp = () => {
      isResizing.current = false;
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
    };
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
  };

  return (
    <div
      ref={windowRef}
      style={style}
      className="flex flex-col rounded-lg overflow-hidden shadow-2xl border border-white/10"
      onMouseDown={handleMouseDown}
    >
      {/* Title bar */}
      <div className="window-titlebar flex items-center h-9 px-3 bg-[rgba(32,32,32,0.97)] border-b border-white/5 shrink-0 cursor-default select-none">
        <span className="text-xs text-white/70 flex-1 truncate">
          {windowState.title}
        </span>
        <div className="flex items-center gap-0.5 -mr-1">
          <button
            onClick={(e) => {
              e.stopPropagation();
              minimizeWindow(windowState.id);
            }}
            className="w-[46px] h-8 flex items-center justify-center hover:bg-white/10 text-white/60 hover:text-white transition-colors text-sm"
          >
            ─
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              if (windowState.isMaximized) {
                restoreWindow(windowState.id);
              } else {
                maximizeWindow(windowState.id);
              }
            }}
            className="w-[46px] h-8 flex items-center justify-center hover:bg-white/10 text-white/60 hover:text-white transition-colors text-sm"
          >
            {windowState.isMaximized ? '⧉' : '□'}
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              closeWindow(windowState.id);
            }}
            className="w-[46px] h-8 flex items-center justify-center hover:bg-[#e81123] text-white/60 hover:text-white transition-colors text-sm"
          >
            ✕
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 bg-[rgba(30,30,30,0.95)] overflow-hidden">
        {children}
      </div>

      {/* Resize handle */}
      {!windowState.isMaximized && (
        <div
          onMouseDown={handleResizeStart}
          className="absolute bottom-0 right-0 w-4 h-4 cursor-nwse-resize"
          style={{ zIndex: 1 }}
        />
      )}
    </div>
  );
}
