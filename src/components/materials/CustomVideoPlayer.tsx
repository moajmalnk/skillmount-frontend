import React, { useState, useRef, useEffect } from 'react';
import ReactPlayer from 'react-player';
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import {
  Play, Pause, Volume2, VolumeX, Maximize, Minimize,
  RotateCcw, SkipForward, Loader2
} from "lucide-react";
import { cn } from "@/lib/utils";

interface CustomVideoPlayerProps {
  url: string;
  title?: string;
  onClose?: () => void;
  autoPlay?: boolean;
}

const formatTime = (seconds: number) => {
  const date = new Date(seconds * 1000);
  const hh = date.getUTCHours();
  const mm = date.getUTCMinutes();
  const ss = date.getUTCSeconds().toString().padStart(2, '0');
  if (hh) {
    return `${hh}:${mm.toString().padStart(2, '0')}:${ss}`;
  }
  return `${mm}:${ss}`;
};

export const CustomVideoPlayer = ({ url, title, onClose, autoPlay = false }: CustomVideoPlayerProps) => {
  const finalUrl = url;
  console.log("CustomVideoPlayer playing:", finalUrl);


  const playerRef = useRef<ReactPlayer>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const [playing, setPlaying] = useState(autoPlay);
  const [volume, setVolume] = useState(0.8);
  const [muted, setMuted] = useState(false);
  const [played, setPlayed] = useState(0); // 0 to 1
  const [duration, setDuration] = useState(0);
  const [seeking, setSeeking] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  const controlsTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  const handleMouseMove = () => {
    setShowControls(true);
    if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current);
    if (playing) {
      controlsTimeoutRef.current = setTimeout(() => setShowControls(false), 2500);
    }
  };

  const togglePlay = () => setPlaying(!playing);

  const toggleMute = () => setMuted(!muted);

  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen();
    } else {
      document.exitFullscreen();
    }
  };

  const handleProgress = (state: { played: number }) => {
    if (!seeking) {
      setPlayed(state.played);
    }
    if (duration === 0 && playerRef.current) {
      const d = playerRef.current.getDuration();
      if (d) setDuration(d);
    }
  };

  const handleSeekChange = (value: number[]) => {
    setSeeking(true);
    setPlayed(value[0]);
  };

  const handleSeekUp = (value: number[]) => {
    setSeeking(false);
    playerRef.current?.seekTo(value[0]);
  };

  const handleVolumeChange = (value: number[]) => {
    setVolume(value[0]);
    if (value[0] > 0) setMuted(false);
  };

  return (
    <div
      ref={containerRef}
      className={cn(
        "relative bg-black group overflow-hidden select-none flex flex-col justify-center",
        isFullscreen ? "w-full h-full" : "w-full aspect-video rounded-xl shadow-2xl"
      )}
      onMouseMove={handleMouseMove}
      onMouseLeave={() => playing && setShowControls(false)}
    >
      {/* Loading Overlay */}
      {isLoading && !hasError && (
        <div className="absolute inset-0 flex items-center justify-center z-20 bg-black/50 backdrop-blur-sm pointer-events-none">
          <Loader2 className="w-10 h-10 text-primary animate-spin" />
        </div>
      )}

      {/* Error State */}
      {hasError && (
        <div className="absolute inset-0 flex flex-col items-center justify-center z-20 bg-gray-900 text-white p-4 text-center">
          <span className="text-red-400 mb-2 font-semibold">Video Unavailable</span>
          <p className="text-sm text-gray-400">There was an error loading this video.</p>
        </div>
      )}

      {/* YouTube Player */}
      {/* YouTube Player */}
      <ReactPlayer
        ref={playerRef}
        url={finalUrl}
        width="100%"
        height="100%"
        playing={playing}
        volume={volume}
        muted={muted}
        controls={false} // Hide Native Controls
        onPlay={() => { setPlaying(true); setIsLoading(false); }}
        onPause={() => setPlaying(false)}
        onProgress={handleProgress}
        onError={() => { setHasError(true); setIsLoading(false); }}
        onReady={() => {
          setIsLoading(false);
          const d = playerRef.current?.getDuration();
          if (d) setDuration(d);
        }}
        config={{
          youtube: {
            playerVars: { showinfo: 0, modestbranding: 1, rel: 0 }
          }
        }}
      />

      {/* Big Center Play Button (Overlay) */}
      {!playing && !isLoading && !hasError && (
        <div className="absolute inset-0 flex items-center justify-center z-10 bg-black/20 pointer-events-none">
          <button
            onClick={togglePlay}
            className="w-16 h-16 rounded-full bg-primary/90 text-primary-foreground flex items-center justify-center hover:scale-110 transition-transform shadow-lg pointer-events-auto backdrop-blur-md"
          >
            <Play className="w-8 h-8 fill-current ml-1" />
          </button>
        </div>
      )}

      {/* Header Overlay (Title + Close) */}
      <div className={cn(
        "absolute top-0 left-0 right-0 p-4 bg-gradient-to-b from-black/80 to-transparent z-20 transition-opacity duration-300 flex justify-between items-start pointer-events-none",
        showControls ? "opacity-100" : "opacity-0"
      )}>
        <h3 className="text-white font-medium text-shadow line-clamp-1 flex-1 pr-4">{title}</h3>
        {onClose && !isFullscreen && ( // Only show close button if not fullscreen, or handle fullscreen exit first
          <Button variant="ghost" size="sm" onClick={onClose} className="rounded-full h-8 px-3 text-xs border border-white/10 text-white hover:bg-white/20 pointer-events-auto">
            Close
          </Button>
        )}
      </div>

      {/* Bottom Controls Bar */}
      <div className={cn(
        "absolute bottom-0 left-0 right-0 p-4 pt-12 bg-gradient-to-t from-black/90 via-black/50 to-transparent z-20 transition-opacity duration-300 pointer-events-auto",
        showControls ? "opacity-100" : "opacity-0"
      )}>
        {/* Progress Bar */}
        <div className="group/slider relative h-1 mb-4 cursor-pointer flex items-center">
          <Slider
            value={[played]}
            min={0}
            max={1}
            step={0.001}
            onValueChange={handleSeekChange}
            onValueCommit={handleSeekUp}
            className="w-full absolute inset-0 z-10"
          />
        </div>

        <div className="flex items-center justify-between text-white">
          <div className="flex items-center gap-3">
            {/* Play/Pause */}
            <button onClick={togglePlay} className="hover:text-primary transition-colors focus:outline-none">
              {playing ? <Pause className="w-6 h-6 fill-current" /> : <Play className="w-6 h-6 fill-current" />}
            </button>

            {/* Volume */}
            <div className="flex items-center gap-2 group/vol">
              <button onClick={toggleMute} className="hover:text-primary transition-colors">
                {muted || volume === 0 ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
              </button>
              <div className="w-0 overflow-hidden group-hover/vol:w-24 transition-all duration-300 ease-out">
                <Slider
                  value={[muted ? 0 : volume]}
                  max={1}
                  step={0.1}
                  onValueChange={handleVolumeChange}
                  className="w-20 ml-2"
                />
              </div>
            </div>

            {/* Time */}
            <div className="text-xs font-mono font-medium opacity-80 ml-1">
              <span>{formatTime(played * duration)}</span>
              <span className="mx-1">/</span>
              <span>{formatTime(duration)}</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Skip Back 10s (Optional but relevant) */}
            <button
              onClick={() => {
                if (playerRef.current) {
                  const currentTime = playerRef.current.getCurrentTime ? playerRef.current.getCurrentTime() : (played * duration);
                  if (typeof currentTime === 'number') {
                    playerRef.current.seekTo(currentTime - 10);
                  }
                }
              }}
              className="hover:text-primary transition-colors"
              title="-10s"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
            {/* Skip Fwd 10s */}
            <button
              onClick={() => {
                if (playerRef.current) {
                  const currentTime = playerRef.current.getCurrentTime ? playerRef.current.getCurrentTime() : (played * duration);
                  if (typeof currentTime === 'number') {
                    playerRef.current.seekTo(currentTime + 10);
                  }
                }
              }}
              className="hover:text-primary transition-colors"
              title="+10s"
            >
              <SkipForward className="w-4 h-4" />
            </button>

            {/* Fullscreen */}
            <button onClick={toggleFullscreen} className="hover:text-primary transition-colors ml-2">
              {isFullscreen ? <Minimize className="w-5 h-5" /> : <Maximize className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
