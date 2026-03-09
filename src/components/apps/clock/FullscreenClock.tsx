'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useClockStore } from '@/store/clockStore';
import AnalogClock from './AnalogClock';
import DigitalClock from './DigitalClock';
import MediaInfo from './MediaInfo';

export default function FullscreenClock() {
  const fullscreen = useClockStore((s) => s.fullscreen);
  const mode = useClockStore((s) => s.mode);
  const setFullscreenEnabled = useClockStore((s) => s.setFullscreenEnabled);

  const [currentSlide, setCurrentSlide] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);

  const bg = fullscreen.background;
  const slideshow = bg.slideshow;

  // Slideshow auto-advance
  useEffect(() => {
    if (bg.type !== 'slideshow' || slideshow.images.length <= 1) return;

    const interval = setInterval(() => {
      setIsTransitioning(true);
      setTimeout(() => {
        setCurrentSlide((prev) => (prev + 1) % slideshow.images.length);
        setIsTransitioning(false);
      }, slideshow.transitionTime);
    }, slideshow.intervalSeconds * 1000);

    return () => clearInterval(interval);
  }, [bg.type, slideshow.images.length, slideshow.intervalSeconds, slideshow.transitionTime]);

  const handleEscape = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Escape') setFullscreenEnabled(false);
    },
    [setFullscreenEnabled]
  );

  useEffect(() => {
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [handleEscape]);

  if (!fullscreen.enabled) return null;

  const getTransitionStyle = (): React.CSSProperties => {
    const time = `${slideshow.transitionTime}ms`;
    const base: React.CSSProperties = {
      transition: `all ${time} ease-in-out`,
    };

    if (isTransitioning) {
      switch (slideshow.transitionType) {
        case 'fade':
          return { ...base, opacity: 0 };
        case 'slide':
          return { ...base, transform: 'translateX(-100%)' };
        case 'zoom':
          return { ...base, transform: 'scale(1.3)', opacity: 0 };
        case 'blur':
          return { ...base, filter: `blur(${slideshow.blurLevel}px)`, opacity: 0 };
      }
    }
    return {
      ...base,
      opacity: 1,
      transform: 'translateX(0) scale(1)',
      filter: 'blur(0px)',
    };
  };

  const renderBackground = () => {
    switch (bg.type) {
      case 'solid':
        return (
          <div
            className="absolute inset-0"
            style={{ backgroundColor: bg.solidColor }}
          />
        );
      case 'gradient':
        return (
          <div
            className="absolute inset-0"
            style={{
              background: `linear-gradient(${bg.gradient.direction}, ${bg.gradient.from}, ${bg.gradient.to})`,
            }}
          />
        );
      case 'image':
        return bg.imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={bg.imageUrl}
            alt="Background"
            className="absolute inset-0 w-full h-full object-cover"
          />
        ) : (
          <div className="absolute inset-0 bg-[#0a0a0a]" />
        );
      case 'slideshow':
        if (slideshow.images.length === 0) {
          return <div className="absolute inset-0 bg-[#0a0a0a]" />;
        }
        return (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={slideshow.images[currentSlide]}
            alt="Slideshow"
            className="absolute inset-0 w-full h-full object-cover"
            style={getTransitionStyle()}
          />
        );
    }
  };

  return (
    <div
      className="fixed inset-0 z-[100] flex flex-col items-center justify-center cursor-pointer"
      onClick={() => setFullscreenEnabled(false)}
    >
      {/* Background layer */}
      {renderBackground()}

      {/* Overlay for readability */}
      <div className="absolute inset-0 bg-black/20" />

      {/* Clock content */}
      <div className="relative z-10 flex flex-col items-center gap-6">
        {mode === 'analog' ? (
          <AnalogClock size={Math.min(500, window.innerHeight * 0.55)} />
        ) : (
          <DigitalClock large />
        )}
      </div>

      {/* Media info in bottom-left */}
      <div className="absolute bottom-6 left-6 z-10">
        <MediaInfo />
      </div>

      {/* Exit hint */}
      <div className="absolute bottom-6 right-6 z-10 text-xs text-white/20">
        Click or press ESC to exit
      </div>
    </div>
  );
}
