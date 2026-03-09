'use client';

import React, { useState, useRef, useEffect } from 'react';

export default function MusicPlayer() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(0.7);
  const [fileName, setFileName] = useState('');
  const audioRef = useRef<HTMLAudioElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    const onTimeUpdate = () => setCurrentTime(audio.currentTime);
    const onLoadedMetadata = () => setDuration(audio.duration);
    const onEnded = () => setIsPlaying(false);
    audio.addEventListener('timeupdate', onTimeUpdate);
    audio.addEventListener('loadedmetadata', onLoadedMetadata);
    audio.addEventListener('ended', onEnded);
    return () => {
      audio.removeEventListener('timeupdate', onTimeUpdate);
      audio.removeEventListener('loadedmetadata', onLoadedMetadata);
      audio.removeEventListener('ended', onEnded);
    };
  }, []);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !audioRef.current) return;
    const url = URL.createObjectURL(file);
    audioRef.current.src = url;
    setFileName(file.name);
    setIsPlaying(false);

    // Set media session metadata
    if ('mediaSession' in navigator) {
      navigator.mediaSession.metadata = new MediaMetadata({
        title: file.name.replace(/\.[^.]+$/, ''),
        artist: 'Local File',
      });
    }
  };

  const togglePlay = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!audioRef.current) return;
    audioRef.current.currentTime = Number(e.target.value);
  };

  const handleVolume = (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = Number(e.target.value);
    setVolume(v);
    if (audioRef.current) audioRef.current.volume = v;
  };

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = Math.floor(s % 60);
    return `${m}:${sec.toString().padStart(2, '0')}`;
  };

  return (
    <div className="flex flex-col h-full p-6 items-center justify-center gap-6">
      <audio ref={audioRef} />
      <input
        ref={fileInputRef}
        type="file"
        accept="audio/*"
        onChange={handleFileSelect}
        className="hidden"
      />

      <div className="text-6xl">🎵</div>

      {fileName ? (
        <div className="text-center">
          <p className="text-sm text-white/80 truncate max-w-[300px]">{fileName}</p>
        </div>
      ) : (
        <p className="text-sm text-white/40">No file loaded</p>
      )}

      {/* Seek bar */}
      <div className="w-full max-w-xs flex items-center gap-2">
        <span className="text-xs text-white/40 w-10 text-right">{formatTime(currentTime)}</span>
        <input
          type="range"
          min={0}
          max={duration || 1}
          value={currentTime}
          onChange={handleSeek}
          className="flex-1"
        />
        <span className="text-xs text-white/40 w-10">{formatTime(duration)}</span>
      </div>

      {/* Controls */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => fileInputRef.current?.click()}
          className="px-3 py-1.5 bg-white/10 hover:bg-white/15 rounded-md text-sm text-white/70 transition-colors"
        >
          Open File
        </button>
        <button
          onClick={togglePlay}
          disabled={!fileName}
          className="w-12 h-12 rounded-full bg-[#0078d4] hover:bg-[#1a86d9] disabled:bg-white/10 disabled:text-white/20 flex items-center justify-center text-white text-xl transition-colors"
        >
          {isPlaying ? '⏸' : '▶'}
        </button>
      </div>

      {/* Volume */}
      <div className="flex items-center gap-2 w-full max-w-[200px]">
        <span className="text-xs text-white/40">🔈</span>
        <input
          type="range"
          min={0}
          max={1}
          step={0.01}
          value={volume}
          onChange={handleVolume}
          className="flex-1"
        />
        <span className="text-xs text-white/40">🔊</span>
      </div>
    </div>
  );
}
