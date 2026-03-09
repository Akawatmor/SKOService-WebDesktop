'use client';

import React, { useState } from 'react';
import { useClockStore } from '@/store/clockStore';

export default function AlarmPanel() {
  const alarms = useClockStore((s) => s.alarms);
  const addAlarm = useClockStore((s) => s.addAlarm);
  const removeAlarm = useClockStore((s) => s.removeAlarm);
  const toggleAlarm = useClockStore((s) => s.toggleAlarm);

  const [newTime, setNewTime] = useState('07:00');
  const [newLabel, setNewLabel] = useState('');

  const handleAdd = () => {
    if (!newTime) return;
    addAlarm(newTime, newLabel || 'Alarm');
    setNewLabel('');
  };

  return (
    <div className="flex flex-col gap-3">
      <h3 className="text-sm font-medium text-white/80 uppercase tracking-wider">
        Alarms
      </h3>

      {/* Add new alarm */}
      <div className="flex gap-2 items-end">
        <div className="flex flex-col gap-1 flex-1">
          <label className="text-xs text-white/50">Time</label>
          <input
            type="time"
            value={newTime}
            onChange={(e) => setNewTime(e.target.value)}
            className="w-full"
          />
        </div>
        <div className="flex flex-col gap-1 flex-1">
          <label className="text-xs text-white/50">Label</label>
          <input
            type="text"
            value={newLabel}
            onChange={(e) => setNewLabel(e.target.value)}
            placeholder="Alarm"
            className="w-full"
            maxLength={50}
          />
        </div>
        <button
          onClick={handleAdd}
          className="px-3 py-1.5 bg-[#0078d4] hover:bg-[#1a86d9] rounded-md text-sm text-white transition-colors shrink-0"
        >
          Add
        </button>
      </div>

      {/* Alarm list */}
      <div className="flex flex-col gap-1.5 max-h-[200px] overflow-y-auto">
        {alarms.length === 0 && (
          <p className="text-sm text-white/30 text-center py-4">
            No alarms set
          </p>
        )}
        {alarms.map((alarm) => (
          <div
            key={alarm.id}
            className="flex items-center gap-3 px-3 py-2 rounded-lg bg-white/5 hover:bg-white/8 transition-colors"
          >
            <span className="text-lg font-mono text-white/90 clock-digit w-14">
              {alarm.time}
            </span>
            <span className="text-sm text-white/60 flex-1 truncate">
              {alarm.label}
            </span>
            <button
              onClick={() => toggleAlarm(alarm.id)}
              className={`w-10 h-5 rounded-full relative transition-colors ${
                alarm.enabled ? 'bg-[#0078d4]' : 'bg-white/15'
              }`}
            >
              <span
                className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-transform ${
                  alarm.enabled ? 'left-5.5' : 'left-0.5'
                }`}
              />
            </button>
            <button
              onClick={() => removeAlarm(alarm.id)}
              className="text-white/30 hover:text-red-400 transition-colors text-lg"
              title="Delete"
            >
              ×
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
