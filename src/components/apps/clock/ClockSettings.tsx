'use client';

import React, { useRef } from 'react';
import { useClockStore } from '@/store/clockStore';
import AlarmPanel from './AlarmPanel';
import type { SecondHandMode, BackgroundType, TransitionType } from '@/types';

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-2 pb-4 border-b border-white/10">
      <h4 className="text-xs font-medium text-white/50 uppercase tracking-wider">
        {title}
      </h4>
      {children}
    </div>
  );
}

function Toggle({ label, checked, onChange }: { label: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <label className="flex items-center justify-between cursor-pointer">
      <span className="text-sm text-white/70">{label}</span>
      <button
        onClick={() => onChange(!checked)}
        className={`w-9 h-5 rounded-full relative transition-colors ${
          checked ? 'bg-[#0078d4]' : 'bg-white/15'
        }`}
      >
        <span
          className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-all ${
            checked ? 'left-4.5' : 'left-0.5'
          }`}
        />
      </button>
    </label>
  );
}

function ButtonGroup<T extends string>({
  options,
  value,
  onChange,
}: {
  options: { label: string; value: T }[];
  value: T;
  onChange: (v: T) => void;
}) {
  return (
    <div className="flex rounded-lg overflow-hidden border border-white/10">
      {options.map((opt) => (
        <button
          key={opt.value}
          onClick={() => onChange(opt.value)}
          className={`flex-1 px-3 py-1.5 text-xs font-medium transition-colors ${
            value === opt.value
              ? 'bg-[#0078d4] text-white'
              : 'bg-white/5 text-white/50 hover:bg-white/10'
          }`}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}

interface ClockSettingsProps {
  open: boolean;
  onClose: () => void;
}

export default function ClockSettings({ open, onClose }: ClockSettingsProps) {
  const store = useClockStore();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const slideshowInputRef = useRef<HTMLInputElement>(null);

  if (!open) return null;

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      store.setImageUrl(reader.result as string);
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const handleSlideshowUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    Array.from(files).forEach((file) => {
      const reader = new FileReader();
      reader.onload = () => {
        store.addSlideshowImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    });
    e.target.value = '';
  };

  const dateFields = store.mode === 'analog' ? store.analog : store.digital;
  const setDateField = store.mode === 'analog' ? store.setAnalogDateField : store.setDigitalDateField;

  return (
    <div className="fixed inset-0 z-[200] flex justify-end" onClick={onClose}>
      <div
        className="w-[340px] h-full bg-[rgba(30,30,30,0.97)] backdrop-blur-xl border-l border-white/10 overflow-y-auto p-5 flex flex-col gap-4 animate-slide-in"
        onClick={(e) => e.stopPropagation()}
        style={{
          animation: 'slideIn 0.2s ease-out',
        }}
      >
        <div className="flex items-center justify-between">
          <h3 className="text-base font-semibold text-white">Clock Settings</h3>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-md hover:bg-white/10 text-white/60 text-lg transition-colors"
          >
            ×
          </button>
        </div>

        {/* Clock Mode */}
        <Section title="Clock Mode">
          <ButtonGroup
            options={[
              { label: 'Analog', value: 'analog' as const },
              { label: 'Digital', value: 'digital' as const },
            ]}
            value={store.mode}
            onChange={store.setMode}
          />
        </Section>

        {/* Analog Settings */}
        {store.mode === 'analog' && (
          <Section title="Second Hand">
            <ButtonGroup<SecondHandMode>
              options={[
                { label: 'None', value: 'none' },
                { label: 'Ticking', value: 'ticking' },
                { label: 'Smooth', value: 'continuous' },
              ]}
              value={store.analog.secondHandMode}
              onChange={store.setSecondHandMode}
            />
          </Section>
        )}

        {/* Digital Settings */}
        {store.mode === 'digital' && (
          <Section title="Time Format">
            <ButtonGroup
              options={[
                { label: '12 Hour', value: '12' as const },
                { label: '24 Hour', value: '24' as const },
              ]}
              value={store.digital.format}
              onChange={store.setTimeFormat}
            />
          </Section>
        )}

        {/* Date Display */}
        <Section title="Date Display">
          <Toggle label="Day" checked={dateFields.showDay} onChange={(v) => setDateField('showDay', v)} />
          <Toggle label="Date" checked={dateFields.showDate} onChange={(v) => setDateField('showDate', v)} />
          <Toggle label="Month" checked={dateFields.showMonth} onChange={(v) => setDateField('showMonth', v)} />
          <Toggle label="Year" checked={dateFields.showYear} onChange={(v) => setDateField('showYear', v)} />
        </Section>

        {/* Fullscreen Mode */}
        <Section title="Fullscreen Mode">
          <Toggle
            label="Enable Fullscreen"
            checked={store.fullscreen.enabled}
            onChange={store.setFullscreenEnabled}
          />
        </Section>

        {/* Background (only when fullscreen) */}
        {store.fullscreen.enabled && (
          <>
            <Section title="Background">
              <ButtonGroup<BackgroundType>
                options={[
                  { label: 'Solid', value: 'solid' },
                  { label: 'Gradient', value: 'gradient' },
                  { label: 'Image', value: 'image' },
                  { label: 'Slides', value: 'slideshow' },
                ]}
                value={store.fullscreen.background.type}
                onChange={store.setBackgroundType}
              />

              {store.fullscreen.background.type === 'solid' && (
                <div className="flex items-center gap-3">
                  <label className="text-sm text-white/60">Color</label>
                  <input
                    type="color"
                    value={store.fullscreen.background.solidColor}
                    onChange={(e) => store.setSolidColor(e.target.value)}
                    className="w-10 h-8 cursor-pointer rounded border-0 p-0"
                  />
                  <span className="text-xs text-white/30 font-mono">
                    {store.fullscreen.background.solidColor}
                  </span>
                </div>
              )}

              {store.fullscreen.background.type === 'gradient' && (
                <div className="flex flex-col gap-2">
                  <div className="flex items-center gap-2">
                    <label className="text-sm text-white/60 w-12">From</label>
                    <input
                      type="color"
                      value={store.fullscreen.background.gradient.from}
                      onChange={(e) =>
                        store.setGradient({ ...store.fullscreen.background.gradient, from: e.target.value })
                      }
                      className="w-8 h-7 cursor-pointer p-0 border-0"
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <label className="text-sm text-white/60 w-12">To</label>
                    <input
                      type="color"
                      value={store.fullscreen.background.gradient.to}
                      onChange={(e) =>
                        store.setGradient({ ...store.fullscreen.background.gradient, to: e.target.value })
                      }
                      className="w-8 h-7 cursor-pointer p-0 border-0"
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <label className="text-sm text-white/60 w-12">Angle</label>
                    <select
                      value={store.fullscreen.background.gradient.direction}
                      onChange={(e) =>
                        store.setGradient({ ...store.fullscreen.background.gradient, direction: e.target.value })
                      }
                      className="flex-1"
                    >
                      <option value="to bottom">↓ Top to Bottom</option>
                      <option value="to right">→ Left to Right</option>
                      <option value="135deg">↘ Diagonal</option>
                      <option value="to top">↑ Bottom to Top</option>
                      <option value="45deg">↗ Diagonal Up</option>
                    </select>
                  </div>
                </div>
              )}

              {store.fullscreen.background.type === 'image' && (
                <div className="flex flex-col gap-2">
                  <input
                    type="url"
                    value={store.fullscreen.background.imageUrl.startsWith('data:') ? '' : store.fullscreen.background.imageUrl}
                    onChange={(e) => store.setImageUrl(e.target.value)}
                    placeholder="Image URL"
                    className="w-full"
                  />
                  <span className="text-xs text-white/30 text-center">or</span>
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="px-3 py-1.5 bg-white/10 hover:bg-white/15 rounded-md text-sm text-white/70 transition-colors"
                  >
                    Upload Image
                  </button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                  {store.fullscreen.background.imageUrl && (
                    <div className="w-full h-20 rounded-md overflow-hidden">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={store.fullscreen.background.imageUrl}
                        alt="Background preview"
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                </div>
              )}

              {store.fullscreen.background.type === 'slideshow' && (
                <div className="flex flex-col gap-2">
                  <button
                    onClick={() => slideshowInputRef.current?.click()}
                    className="px-3 py-1.5 bg-white/10 hover:bg-white/15 rounded-md text-sm text-white/70 transition-colors"
                  >
                    Add Images
                  </button>
                  <input
                    ref={slideshowInputRef}
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleSlideshowUpload}
                    className="hidden"
                  />
                  <div className="grid grid-cols-3 gap-1.5">
                    {store.fullscreen.background.slideshow.images.map((img, i) => (
                      <div key={i} className="relative group">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={img}
                          alt={`Slide ${i + 1}`}
                          className="w-full h-16 object-cover rounded"
                        />
                        <button
                          onClick={() => store.removeSlideshowImage(i)}
                          className="absolute top-0.5 right-0.5 w-5 h-5 bg-black/60 rounded-full text-white text-xs flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                  {store.fullscreen.background.slideshow.images.length > 0 && (
                    <div className="flex flex-col gap-2 mt-1">
                      <div className="flex items-center gap-2">
                        <label className="text-xs text-white/50 w-20">Duration</label>
                        <input
                          type="range"
                          min={3}
                          max={60}
                          value={store.fullscreen.background.slideshow.intervalSeconds}
                          onChange={(e) =>
                            store.setSlideshow({ intervalSeconds: Number(e.target.value) })
                          }
                          className="flex-1"
                        />
                        <span className="text-xs text-white/40 w-8">
                          {store.fullscreen.background.slideshow.intervalSeconds}s
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </Section>

            {/* Transition Settings */}
            {store.fullscreen.background.type === 'slideshow' &&
              store.fullscreen.background.slideshow.images.length > 0 && (
                <Section title="Transition">
                  <ButtonGroup<TransitionType>
                    options={[
                      { label: 'Fade', value: 'fade' },
                      { label: 'Slide', value: 'slide' },
                      { label: 'Zoom', value: 'zoom' },
                      { label: 'Blur', value: 'blur' },
                    ]}
                    value={store.fullscreen.background.slideshow.transitionType}
                    onChange={(v) => store.setSlideshow({ transitionType: v })}
                  />
                  <div className="flex items-center gap-2">
                    <label className="text-xs text-white/50 w-20">Speed</label>
                    <input
                      type="range"
                      min={200}
                      max={3000}
                      step={100}
                      value={store.fullscreen.background.slideshow.transitionTime}
                      onChange={(e) =>
                        store.setSlideshow({ transitionTime: Number(e.target.value) })
                      }
                      className="flex-1"
                    />
                    <span className="text-xs text-white/40 w-12">
                      {store.fullscreen.background.slideshow.transitionTime}ms
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <label className="text-xs text-white/50 w-20">Blur</label>
                    <input
                      type="range"
                      min={0}
                      max={20}
                      value={store.fullscreen.background.slideshow.blurLevel}
                      onChange={(e) =>
                        store.setSlideshow({ blurLevel: Number(e.target.value) })
                      }
                      className="flex-1"
                    />
                    <span className="text-xs text-white/40 w-8">
                      {store.fullscreen.background.slideshow.blurLevel}px
                    </span>
                  </div>
                </Section>
              )}
          </>
        )}

        {/* Alarms */}
        <AlarmPanel />
      </div>

      <style jsx>{`
        @keyframes slideIn {
          from {
            transform: translateX(100%);
          }
          to {
            transform: translateX(0);
          }
        }
      `}</style>
    </div>
  );
}
