'use client';

import { useEffect, useRef, useState } from 'react';

interface ClockTime {
  hours: number;
  minutes: number;
  seconds: number;
  ms: number;
  date: Date;
}

export function useClock(): ClockTime {
  const [time, setTime] = useState<ClockTime>(() => {
    const now = new Date();
    return {
      hours: now.getHours(),
      minutes: now.getMinutes(),
      seconds: now.getSeconds(),
      ms: now.getMilliseconds(),
      date: now,
    };
  });

  const rafRef = useRef<number>(0);

  useEffect(() => {
    const tick = () => {
      const now = new Date();
      setTime({
        hours: now.getHours(),
        minutes: now.getMinutes(),
        seconds: now.getSeconds(),
        ms: now.getMilliseconds(),
        date: now,
      });
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, []);

  return time;
}
