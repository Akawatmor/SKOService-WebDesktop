'use client';

import { useEffect, useRef, useCallback } from 'react';
import { useClockStore } from '@/store/clockStore';

/**
 * Plays a synthesized alarm beep using Web Audio API.
 */
function playAlarmSound() {
  const ctx = new AudioContext();
  const playBeep = (startTime: number) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.frequency.value = 880;
    osc.type = 'sine';
    gain.gain.setValueAtTime(0.3, startTime);
    gain.gain.exponentialRampToValueAtTime(0.01, startTime + 0.3);
    osc.start(startTime);
    osc.stop(startTime + 0.3);
  };
  // 3 beeps
  playBeep(ctx.currentTime);
  playBeep(ctx.currentTime + 0.4);
  playBeep(ctx.currentTime + 0.8);

  setTimeout(() => ctx.close(), 2000);
}

function showNotification(label: string) {
  if (typeof window === 'undefined') return;
  if ('Notification' in window && Notification.permission === 'granted') {
    new Notification('Alarm', { body: label, icon: '🕐' });
  }
}

export function useAlarm() {
  const alarms = useClockStore((s) => s.alarms);
  const lastFiredRef = useRef<Set<string>>(new Set());

  const requestNotificationPermission = useCallback(() => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      if (Notification.permission === 'default') {
        Notification.requestPermission();
      }
    }
  }, []);

  useEffect(() => {
    requestNotificationPermission();
  }, [requestNotificationPermission]);

  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date();
      const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
      const currentKey = `${currentTime}-${now.getDate()}`;

      alarms.forEach((alarm) => {
        if (!alarm.enabled) return;
        const alarmKey = `${alarm.id}-${currentKey}`;
        if (alarm.time === currentTime && !lastFiredRef.current.has(alarmKey)) {
          lastFiredRef.current.add(alarmKey);
          playAlarmSound();
          showNotification(alarm.label);
          // Clean up old keys after a minute
          setTimeout(() => lastFiredRef.current.delete(alarmKey), 61000);
        }
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [alarms]);
}
