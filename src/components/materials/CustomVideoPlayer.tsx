import React, { useState, useRef, useEffect } from 'react';
import ReactPlayer from 'react-player';
import {
  Play, RotateCcw, Loader2, X
} from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

// --- Utility Helper ---
function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// --- Props Interface ---
interface CustomVideoPlayerProps {
  url: string;
  title?: string;
  onClose?: () => void;
  autoPlay?: boolean;
}

// --- URL Normalizer ---
const getYouTubeUrl = (url: string) => {
  if (!url) return "";

  // If it's a direct video file (mp4, etc), return as is
  if (url.match(/\.(mp4|webm|ogg)$/i)) return url;

  // Better YouTube Regex
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=|shorts\/)([^#&?]*).*/;
  const match = url.match(regExp);

  if (match && match[2].length === 11) {
    // Return standard watch URL which ReactPlayer prefers over embed/shorts URLs
    return `https://www.youtube.com/watch?v=${match[2]}`;
  }

  return url;
};

// --- MAIN COMPONENT ---
const CustomPremiumPlayer = ({ url, title, onClose, autoPlay }: CustomVideoPlayerProps) => {
  // Use a state for mounted to ensure client-side rendering
  const [mounted, setMounted] = useState(false);
  const playerRef = useRef<any>(null); // Type 'any' used to bypass ReactPlayer type issues with dynamic import
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  // State
  const [playing, setPlaying] = useState(false);
  const [ready, setReady] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);

  // Autoplay
  useEffect(() => {
    if (autoPlay) {
      setHasStarted(true);
      setPlaying(true);
    }
  }, [autoPlay]);

  const finalUrl = getYouTubeUrl(url);

  return (
    <div
      ref={containerRef}
      className={cn(
        "relative bg-black group overflow-hidden select-none flex flex-col justify-center font-sans transition-all duration-300",
        "w-full aspect-video rounded-xl shadow-2xl ring-1 ring-white/10"
      )}
    >
      {/* --- VIDEO LAYER --- */}
      <div className="absolute inset-0 z-0 bg-black">
        {error ? (
          <div className="flex flex-col items-center justify-center w-full h-full text-zinc-400">
            <RotateCcw className="w-10 h-10 mb-4 text-red-500" />
            <p>Video unavailable</p>
          </div>
        ) : (
          mounted && (
            <ReactPlayer
              ref={playerRef}
              url={finalUrl} // Fixed: normalizedUrl -> finalUrl
              playing={playing}
              controls={true} // ALWAYS TRUE: prevents iframe remounting glitches
              width="100%"
              height="100%"
              playsinline
              config={{
                youtube: {
                  playerVars: {
                    autoplay: 0, // Let ReactPlayer handle playing prop
                    playsinline: 1,
                    modestbranding: 1,
                    rel: 0,
                    origin: typeof window !== 'undefined' ? window.location.origin : undefined // Fixes some iframe blocks
                  }
                }
              }}
              onReady={() => {
                console.log("Player Ready");
                setReady(true);
                setLoading(false);
              }}
              onStart={() => {
                setHasStarted(true);
                setLoading(false);
              }}
              onPlay={() => {
                setPlaying(true);
                setHasStarted(true);
              }}
              onPause={() => setPlaying(false)}
              onBuffer={() => setLoading(true)}
              onBufferEnd={() => setLoading(false)}
              onError={(e) => {
                console.error("Playback Error:", e);
                setError(true);
                setLoading(false);
              }}
            />
          )
        )}
      </div>

      {/* --- BUFFERING SPINNER --- */}
      <AnimatePresence>
        {(loading || (!ready && hasStarted)) && !error && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="absolute inset-0 z-20 flex items-center justify-center pointer-events-none"
          >
            <div className="p-4 rounded-full bg-black/50 backdrop-blur-md">
              <Loader2 className="w-8 h-8 text-white animate-spin" />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* --- BIG PLAY BUTTON (Initial Overlay) --- */}
      {!hasStarted && !playing && !error && (
        <div
          className="absolute inset-0 z-20 flex items-center justify-center cursor-pointer bg-black/40 hover:bg-black/30 transition-colors"
          onClick={() => { setPlaying(true); setHasStarted(true); }}
        >
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            whileHover={{ scale: 1.1 }}
            className="flex items-center justify-center w-20 h-20 rounded-full shadow-2xl bg-primary text-primary-foreground border-4 border-white/20"
          >
            <Play className="w-8 h-8 ml-1 fill-current" />
          </motion.div>
        </div>
      )}

      {/* --- TITLE HEADER (Auto-hides when playing) --- */}
      <div className={cn(
        "absolute top-0 left-0 right-0 p-4 bg-gradient-to-b from-black/80 to-transparent z-30 transition-opacity duration-500 pointer-events-none flex justify-between",
        playing ? "opacity-0" : "opacity-100"
      )}>
        <h3 className="text-sm font-medium text-white/90 drop-shadow-md line-clamp-1 pointer-events-auto filter drop-shadow-sm">{title}</h3>
        {onClose && (
          <button onClick={(e) => { e.stopPropagation(); onClose(); }} className="text-white/80 hover:text-white hover:bg-white/10 p-2 rounded-full transition-colors z-40 pointer-events-auto">
            <X className="w-5 h-5" />
          </button>
        )}
      </div>
    </div>
  );
};

export default CustomPremiumPlayer;