import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { ClockSettings, Alarm } from '@/types';
import { v4 as uuidv4 } from 'uuid';

interface ClockStore extends ClockSettings {
  setMode: (mode: ClockSettings['mode']) => void;
  setSecondHandMode: (mode: ClockSettings['analog']['secondHandMode']) => void;
  setTimeFormat: (format: ClockSettings['digital']['format']) => void;
  setAnalogDateField: (field: keyof Omit<ClockSettings['analog'], 'secondHandMode'>, value: boolean) => void;
  setDigitalDateField: (field: keyof Omit<ClockSettings['digital'], 'format'>, value: boolean) => void;
  setFullscreenEnabled: (enabled: boolean) => void;
  setBackgroundType: (type: ClockSettings['fullscreen']['background']['type']) => void;
  setSolidColor: (color: string) => void;
  setGradient: (gradient: ClockSettings['fullscreen']['background']['gradient']) => void;
  setImageUrl: (url: string) => void;
  setSlideshow: (slideshow: Partial<ClockSettings['fullscreen']['background']['slideshow']>) => void;
  addSlideshowImage: (dataUrl: string) => void;
  removeSlideshowImage: (index: number) => void;
  addAlarm: (time: string, label: string) => void;
  removeAlarm: (id: string) => void;
  toggleAlarm: (id: string) => void;
  updateAlarm: (id: string, updates: Partial<Alarm>) => void;
}

const defaultSettings: ClockSettings = {
  mode: 'analog',
  analog: {
    secondHandMode: 'continuous',
    showDay: true,
    showDate: true,
    showMonth: true,
    showYear: true,
  },
  digital: {
    format: '24',
    showDay: true,
    showDate: true,
    showMonth: true,
    showYear: true,
  },
  fullscreen: {
    enabled: false,
    background: {
      type: 'solid',
      solidColor: '#0a0a0a',
      gradient: { from: '#0a0a0a', to: '#1a1a2e', direction: '135deg' },
      imageUrl: '',
      slideshow: {
        images: [],
        intervalSeconds: 10,
        transitionTime: 1000,
        transitionType: 'fade',
        blurLevel: 0,
      },
    },
  },
  alarms: [],
};

export const useClockStore = create<ClockStore>()(
  persist(
    (set) => ({
      ...defaultSettings,
      setMode: (mode) => set({ mode }),
      setSecondHandMode: (secondHandMode) =>
        set((s) => ({ analog: { ...s.analog, secondHandMode } })),
      setTimeFormat: (format) =>
        set((s) => ({ digital: { ...s.digital, format } })),
      setAnalogDateField: (field, value) =>
        set((s) => ({ analog: { ...s.analog, [field]: value } })),
      setDigitalDateField: (field, value) =>
        set((s) => ({ digital: { ...s.digital, [field]: value } })),
      setFullscreenEnabled: (enabled) =>
        set((s) => ({ fullscreen: { ...s.fullscreen, enabled } })),
      setBackgroundType: (type) =>
        set((s) => ({
          fullscreen: {
            ...s.fullscreen,
            background: { ...s.fullscreen.background, type },
          },
        })),
      setSolidColor: (solidColor) =>
        set((s) => ({
          fullscreen: {
            ...s.fullscreen,
            background: { ...s.fullscreen.background, solidColor },
          },
        })),
      setGradient: (gradient) =>
        set((s) => ({
          fullscreen: {
            ...s.fullscreen,
            background: { ...s.fullscreen.background, gradient },
          },
        })),
      setImageUrl: (imageUrl) =>
        set((s) => ({
          fullscreen: {
            ...s.fullscreen,
            background: { ...s.fullscreen.background, imageUrl },
          },
        })),
      setSlideshow: (partial) =>
        set((s) => ({
          fullscreen: {
            ...s.fullscreen,
            background: {
              ...s.fullscreen.background,
              slideshow: { ...s.fullscreen.background.slideshow, ...partial },
            },
          },
        })),
      addSlideshowImage: (dataUrl) =>
        set((s) => ({
          fullscreen: {
            ...s.fullscreen,
            background: {
              ...s.fullscreen.background,
              slideshow: {
                ...s.fullscreen.background.slideshow,
                images: [...s.fullscreen.background.slideshow.images, dataUrl],
              },
            },
          },
        })),
      removeSlideshowImage: (index) =>
        set((s) => ({
          fullscreen: {
            ...s.fullscreen,
            background: {
              ...s.fullscreen.background,
              slideshow: {
                ...s.fullscreen.background.slideshow,
                images: s.fullscreen.background.slideshow.images.filter(
                  (_, i) => i !== index
                ),
              },
            },
          },
        })),
      addAlarm: (time, label) =>
        set((s) => ({
          alarms: [
            ...s.alarms,
            { id: uuidv4(), time, label: label || 'Alarm', enabled: true },
          ],
        })),
      removeAlarm: (id) =>
        set((s) => ({ alarms: s.alarms.filter((a) => a.id !== id) })),
      toggleAlarm: (id) =>
        set((s) => ({
          alarms: s.alarms.map((a) =>
            a.id === id ? { ...a, enabled: !a.enabled } : a
          ),
        })),
      updateAlarm: (id, updates) =>
        set((s) => ({
          alarms: s.alarms.map((a) =>
            a.id === id ? { ...a, ...updates } : a
          ),
        })),
    }),
    {
      name: 'sko-clock',
    }
  )
);
