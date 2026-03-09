'use client';

import React from 'react';
import { useClock } from '@/hooks/useClock';
import { useClockStore } from '@/store/clockStore';
import { formatTime, buildDateString } from '@/lib/clockUtils';

interface DigitalClockProps {
  large?: boolean;
}

export default function DigitalClock({ large = false }: DigitalClockProps) {
  const { date } = useClock();
  const digital = useClockStore((s) => s.digital);

  const { time, period } = formatTime(date, digital.format);
  const dateString = buildDateString(date, digital);

  const fontSize = large ? 'text-7xl md:text-9xl' : 'text-5xl md:text-6xl';
  const periodSize = large ? 'text-2xl md:text-4xl' : 'text-xl md:text-2xl';
  const dateSize = large ? 'text-lg md:text-xl' : 'text-sm';

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="flex items-baseline gap-2">
        <span
          className={`${fontSize} font-light tracking-tight text-white clock-digit`}
          style={{ fontFamily: "'Segoe UI', 'SF Mono', monospace" }}
        >
          {time}
        </span>
        {period && (
          <span className={`${periodSize} font-light text-white/60`}>
            {period}
          </span>
        )}
      </div>
      {dateString && (
        <div className={`${dateSize} text-white/50 tracking-widest uppercase`}>
          {dateString}
        </div>
      )}
    </div>
  );
}
