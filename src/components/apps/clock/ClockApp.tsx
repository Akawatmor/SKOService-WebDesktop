'use client';

import React, { useState } from 'react';
import { useClockStore } from '@/store/clockStore';
import { useAlarm } from '@/hooks/useAlarm';
import AnalogClock from './AnalogClock';
import DigitalClock from './DigitalClock';
import ClockSettings from './ClockSettings';
import AlarmPanel from './AlarmPanel';

export default function ClockApp() {
  const mode = useClockStore((s) => s.mode);
  const fullscreenEnabled = useClockStore((s) => s.fullscreen.enabled);
  const setFullscreenEnabled = useClockStore((s) => s.setFullscreenEnabled);
  const [settingsOpen, setSettingsOpen] = useState(false);

  // Activate alarm monitoring
  useAlarm();

  return (
    <div className="flex flex-col h-full bg-transparent">
      {/* Toolbar */}
      <div className="flex items-center justify-between px-3 py-2 border-b border-white/8">
        <div className="flex items-center gap-2">
          <span className="text-sm text-white/60">
            {mode === 'analog' ? '🕐 Analog' : '🔢 Digital'}
          </span>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={() => setFullscreenEnabled(!fullscreenEnabled)}
            className="px-2.5 py-1 rounded-md text-xs text-white/60 hover:text-white hover:bg-white/10 transition-colors"
            title="Fullscreen"
          >
            {fullscreenEnabled ? '⊡ Exit Fullscreen' : '⊞ Fullscreen'}
          </button>
          <button
            onClick={() => setSettingsOpen(true)}
            className="px-2.5 py-1 rounded-md text-xs text-white/60 hover:text-white hover:bg-white/10 transition-colors"
            title="Settings"
          >
            ⚙ Settings
          </button>
        </div>
      </div>

      {/* Clock display */}
      <div className="flex-1 flex flex-col items-center justify-center p-4 gap-4">
        {mode === 'analog' ? <AnalogClock size={240} /> : <DigitalClock />}
      </div>

      {/* Alarm section */}
      <div className="px-4 pb-4 max-h-[200px] overflow-y-auto">
        <AlarmPanel />
      </div>

      {/* Settings drawer */}
      <ClockSettings open={settingsOpen} onClose={() => setSettingsOpen(false)} />
    </div>
  );
}
