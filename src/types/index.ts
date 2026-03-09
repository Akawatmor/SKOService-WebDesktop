export interface Alarm {
  id: string;
  time: string; // "HH:MM"
  label: string;
  enabled: boolean;
}

export interface GradientConfig {
  from: string;
  to: string;
  direction: string; // e.g. "to right", "135deg"
}

export interface SlideshowConfig {
  images: string[]; // base64 data URLs
  intervalSeconds: number; // how long each image shows
  transitionTime: number; // animation duration in ms
  transitionType: 'fade' | 'slide' | 'zoom' | 'blur';
  blurLevel: number; // 0-20 px
}

export interface BackgroundConfig {
  type: 'solid' | 'gradient' | 'image' | 'slideshow';
  solidColor: string;
  gradient: GradientConfig;
  imageUrl: string;
  slideshow: SlideshowConfig;
}

export interface AnalogSettings {
  secondHandMode: 'none' | 'ticking' | 'continuous';
  showDay: boolean;
  showDate: boolean;
  showMonth: boolean;
  showYear: boolean;
}

export interface DigitalSettings {
  format: '12' | '24';
  showDay: boolean;
  showDate: boolean;
  showMonth: boolean;
  showYear: boolean;
}

export interface FullscreenSettings {
  enabled: boolean;
  background: BackgroundConfig;
}

export interface ClockSettings {
  mode: 'analog' | 'digital';
  analog: AnalogSettings;
  digital: DigitalSettings;
  fullscreen: FullscreenSettings;
  alarms: Alarm[];
}

export type SecondHandMode = 'none' | 'ticking' | 'continuous';
export type ClockMode = 'analog' | 'digital';
export type TimeFormat = '12' | '24';
export type BackgroundType = 'solid' | 'gradient' | 'image' | 'slideshow';
export type TransitionType = 'fade' | 'slide' | 'zoom' | 'blur';

export interface WindowState {
  id: string;
  appId: string;
  title: string;
  x: number;
  y: number;
  width: number;
  height: number;
  isMinimized: boolean;
  isMaximized: boolean;
  zIndex: number;
}

export interface AppDefinition {
  id: string;
  name: string;
  icon: string; // emoji or SVG path
  color: string;
}
