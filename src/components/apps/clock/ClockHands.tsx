'use client';

import React, { useEffect, useRef } from 'react';
import { springStep, isSpringSettled, TICKING_SPRING_CONFIG } from '@/lib/springPhysics';
import type { SecondHandMode } from '@/types';

interface ClockHandsProps {
  center: number;
  hourAngle: number;
  minuteAngle: number;
  secondAngleContinuous: number;
  secondAngleTicking: number;
  secondHandMode: SecondHandMode;
}

export default function ClockHands({
  center,
  hourAngle,
  minuteAngle,
  secondAngleContinuous,
  secondAngleTicking,
  secondHandMode,
}: ClockHandsProps) {
  const secondHandRef = useRef<SVGGElement>(null);
  const springStateRef = useRef({ position: secondAngleTicking, velocity: 0 });
  const prevTickingAngleRef = useRef(secondAngleTicking);
  const rafRef = useRef<number>(0);

  // Ticking mode: spring animation
  useEffect(() => {
    if (secondHandMode !== 'ticking') {
      cancelAnimationFrame(rafRef.current);
      return;
    }

    // Detect when we move to a new second
    if (secondAngleTicking !== prevTickingAngleRef.current) {
      // Handle wrap from 354 to 0
      let target = secondAngleTicking;
      if (prevTickingAngleRef.current > 300 && target < 60) {
        target = 360;
        // After anim, actually snap to real angle
      }
      prevTickingAngleRef.current = secondAngleTicking;

      let lastTime = performance.now();
      const animate = (now: number) => {
        const dt = Math.min((now - lastTime) / 1000, 0.05); // cap dt
        lastTime = now;

        springStateRef.current = springStep(
          springStateRef.current,
          target,
          TICKING_SPRING_CONFIG,
          dt
        );

        if (secondHandRef.current) {
          const angle = springStateRef.current.position;
          secondHandRef.current.setAttribute(
            'transform',
            `rotate(${angle}, ${center}, ${center})`
          );
        }

        if (!isSpringSettled(springStateRef.current, target, 0.05)) {
          rafRef.current = requestAnimationFrame(animate);
        } else {
          // Settled — snap to real target in case of wraparound
          springStateRef.current.position = secondAngleTicking;
          springStateRef.current.velocity = 0;
          if (secondHandRef.current) {
            secondHandRef.current.setAttribute(
              'transform',
              `rotate(${secondAngleTicking}, ${center}, ${center})`
            );
          }
        }
      };

      rafRef.current = requestAnimationFrame(animate);
    }

    return () => cancelAnimationFrame(rafRef.current);
  }, [secondAngleTicking, secondHandMode, center]);

  const hourLength = 28;
  const minuteLength = 38;
  const secondLength = 42;

  return (
    <>
      {/* Hour hand */}
      <g transform={`rotate(${hourAngle}, ${center}, ${center})`}>
        <line
          x1={center}
          y1={center + 8}
          x2={center}
          y2={center - hourLength}
          stroke="rgba(255,255,255,0.95)"
          strokeWidth="4"
          strokeLinecap="round"
        />
      </g>

      {/* Minute hand */}
      <g transform={`rotate(${minuteAngle}, ${center}, ${center})`}>
        <line
          x1={center}
          y1={center + 8}
          x2={center}
          y2={center - minuteLength}
          stroke="rgba(255,255,255,0.9)"
          strokeWidth="2.5"
          strokeLinecap="round"
        />
      </g>

      {/* Second hand */}
      {secondHandMode === 'continuous' && (
        <g transform={`rotate(${secondAngleContinuous}, ${center}, ${center})`}>
          <line
            x1={center}
            y1={center + 12}
            x2={center}
            y2={center - secondLength}
            stroke="#e81123"
            strokeWidth="1.2"
            strokeLinecap="round"
          />
          <circle cx={center} cy={center} r="2" fill="#e81123" />
        </g>
      )}

      {secondHandMode === 'ticking' && (
        <g
          ref={secondHandRef}
          transform={`rotate(${secondAngleTicking}, ${center}, ${center})`}
        >
          <line
            x1={center}
            y1={center + 12}
            x2={center}
            y2={center - secondLength}
            stroke="#e81123"
            strokeWidth="1.2"
            strokeLinecap="round"
          />
          <circle cx={center} cy={center} r="2" fill="#e81123" />
        </g>
      )}
    </>
  );
}
