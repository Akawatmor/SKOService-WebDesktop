'use client';

import React from 'react';

export default function MediaInfo() {
  const [metadata, setMetadata] = React.useState<{
    title?: string;
    artist?: string;
    artwork?: string;
  } | null>(null);

  React.useEffect(() => {
    if (typeof navigator === 'undefined' || !('mediaSession' in navigator)) return;

    const checkMetadata = () => {
      const ms = navigator.mediaSession;
      if (ms.metadata) {
        setMetadata({
          title: ms.metadata.title || undefined,
          artist: ms.metadata.artist || undefined,
          artwork: ms.metadata.artwork?.[0]?.src || undefined,
        });
      } else {
        setMetadata(null);
      }
    };

    const interval = setInterval(checkMetadata, 2000);
    checkMetadata();
    return () => clearInterval(interval);
  }, []);

  if (!metadata || !metadata.title) return null;

  return (
    <div className="flex items-center gap-3 px-4 py-2 rounded-xl bg-white/5 backdrop-blur-sm max-w-xs">
      {metadata.artwork && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={metadata.artwork}
          alt="Now playing"
          className="w-10 h-10 rounded-md object-cover"
        />
      )}
      <div className="flex flex-col min-w-0">
        <span className="text-sm text-white/80 truncate">{metadata.title}</span>
        {metadata.artist && (
          <span className="text-xs text-white/40 truncate">{metadata.artist}</span>
        )}
      </div>
      <span className="text-white/30 text-lg">♪</span>
    </div>
  );
}
