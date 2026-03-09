'use client';

import React from 'react';
import { useClock } from '@/hooks/useClock';
import { useClockStore } from '@/store/clockStore';
import { getHandAngles, buildDateString } from '@/lib/clockUtils';
import ClockHands from './ClockHands';

interface AnalogClockProps {
  size?: number;
}

export default function AnalogClock({ size = 280 }: AnalogClockProps) {
  const { date } = useClock();
  const analog = useClockStore((s) => s.analog);
  const angles = getHandAngles(date);

  const center = 100; // viewBox center
  const radius = 90;

  // Generate tick marks
  const ticks = Array.from({ length: 60 }, (_, i) => {
    const angle = (i * 6 - 90) * (Math.PI / 180);
    const isHour = i % 5 === 0;
    const outerR = radius;
    const innerR = isHour ? radius - 10 : radius - 5;
    return {
      x1: center + Math.cos(angle) * innerR,
      y1: center + Math.sin(angle) * innerR,
      x2: center + Math.cos(angle) * outerR,
      y2: center + Math.sin(angle) * outerR,
      isHour,
      index: i,
    };
  });

  // Generate hour numbers
  const numbers = Array.from({ length: 12 }, (_, i) => {
    const num = i + 1;
    const angle = (num * 30 - 90) * (Math.PI / 180);
    const r = radius - 20;
    return {
      x: center + Math.cos(angle) * r,
      y: center + Math.sin(angle) * r,
      num,
    };
  });

  const dateString = buildDateString(date, analog);

  return (
    <div className="flex flex-col items-center gap-3">
      <svg
        width={size}
        height={size}
        viewBox="0 0 200 200"
        className="drop-shadow-lg"
      >
        {/* Clock face */}
        <circle
          cx={center}
          cy={center}
          r={radius + 2}
          fill="rgba(20,20,20,0.8)"
          stroke="rgba(255,255,255,0.15)"
          strokeWidth="1.5"
        />

        {/* Tick marks */}
        {ticks.map((tick) => (
          <line
            key={tick.index}
            x1={tick.x1}
            y1={tick.y1}
            x2={tick.x2}
            y2={tick.y2}
            stroke={tick.isHour ? 'rgba(255,255,255,0.9)' : 'rgba(255,255,255,0.3)'}
            strokeWidth={tick.isHour ? 2 : 0.8}
            strokeLinecap="round"
          />
        ))}

        {/* Hour numbers */}
        {numbers.map((n) => (
          <text
            key={n.num}
            x={n.x}
            y={n.y}
            textAnchor="middle"
            dominantBaseline="central"
            fill="rgba(255,255,255,0.85)"
            fontSize="12"
            fontWeight="500"
            fontFamily="'Segoe UI', sans-serif"
          >
            {n.num}
          </text>
        ))}

        {/* Clock hands */}
        <ClockHands
          center={center}
          hourAngle={angles.hourAngle}
          minuteAngle={angles.minuteAngle}
          secondAngleContinuous={angles.secondAngleContinuous}
          secondAngleTicking={angles.secondAngleTicking}
          secondHandMode={analog.secondHandMode}
        />

        {/* Center dot */}
        <circle cx={center} cy={center} r="3" fill="#0078d4" />
        <circle cx={center} cy={center} r="1.5" fill="#fff" />
      </svg>

      {dateString && (
        <div className="text-sm text-white/60 tracking-wide">
          {dateString}
        </div>
      )}
    </div>
  );
}
