import React, { useState, useRef, useEffect, useMemo } from 'react';
import { Play, Pause, Loader2, Mic, User } from 'lucide-react';

interface TicketAudioPlayerProps {
    src: string;
    isMe?: boolean;
    timestamp?: string; // Expecting ISO string or formatted time
}

export const TicketAudioPlayer = ({ src, isMe = false, timestamp }: TicketAudioPlayerProps) => {
    const [isPlaying, setIsPlaying] = useState(false);
    const [duration, setDuration] = useState(0);
    const [currentTime, setCurrentTime] = useState(0);
    const [isLoading, setIsLoading] = useState(true);
    const audioRef = useRef<HTMLAudioElement | null>(null);
    const rafRef = useRef<number | null>(null);

    // Generate random bar heights for waveform simulation
    const bars = useMemo(() => Array.from({ length: 35 }, () => Math.floor(Math.random() * 40) + 20), []);

    useEffect(() => {
        const audio = new Audio(src);
        audio.preload = 'auto';
        audioRef.current = audio;

        const updateDuration = () => {
            const d = audio.duration;
            if (isFinite(d) && d > 0) {
                setDuration(d);
                setIsLoading(false);
            }
        };

        // Fallback or background update
        const onTimeUpdate = () => {
            if (!isPlaying && audioRef.current) {
                setCurrentTime(audioRef.current.currentTime);
            }
        };

        const onEnded = () => {
            setIsPlaying(false);
            setCurrentTime(0);
            if (rafRef.current) cancelAnimationFrame(rafRef.current);
        };

        const onError = () => {
            setIsLoading(false);
            console.error("Audio playback error", src);
        };

        const onCanPlay = () => {
            updateDuration();
            setIsLoading(false);
        };

        audio.addEventListener('loadedmetadata', updateDuration);
        audio.addEventListener('durationchange', updateDuration);
        audio.addEventListener('canplay', onCanPlay);
        audio.addEventListener('timeupdate', onTimeUpdate);
        audio.addEventListener('ended', onEnded);
        audio.addEventListener('error', onError);

        audio.load();

        return () => {
            if (rafRef.current) cancelAnimationFrame(rafRef.current);
            audio.removeEventListener('loadedmetadata', updateDuration);
            audio.removeEventListener('durationchange', updateDuration);
            audio.removeEventListener('canplay', onCanPlay);
            audio.removeEventListener('timeupdate', onTimeUpdate);
            audio.removeEventListener('ended', onEnded);
            audio.removeEventListener('error', onError);
            audio.pause();
            audioRef.current = null;
        };
    }, [src]);

    // Smooth Animation Loop
    useEffect(() => {
        if (isPlaying) {
            const animate = () => {
                if (audioRef.current) {
                    setCurrentTime(audioRef.current.currentTime);
                    rafRef.current = requestAnimationFrame(animate);
                }
            };
            rafRef.current = requestAnimationFrame(animate);
        } else {
            if (rafRef.current) cancelAnimationFrame(rafRef.current);
        }

        return () => {
            if (rafRef.current) cancelAnimationFrame(rafRef.current);
        };
    }, [isPlaying]);

    const togglePlay = () => {
        if (!audioRef.current) return;
        if (isPlaying) {
            audioRef.current.pause();
        } else {
            audioRef.current.play().catch(console.error);
        }
        setIsPlaying(!isPlaying);
    };

    const formatTime = (time: number) => {
        if (isNaN(time) || !isFinite(time)) return "0:00";
        const minutes = Math.floor(time / 60);
        const seconds = Math.floor(time % 60);
        return `${minutes}:${seconds.toString().padStart(2, '0')}`;
    };

    const formatTimestamp = (ts?: string) => {
        if (!ts) return "";
        return new Date(ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }).toLowerCase();
    };

    const progress = duration ? (currentTime / duration) * 100 : 0;

    return (
        <div className={`
            flex items-start gap-3 p-2 bg-[#202c33] rounded-xl w-full max-w-[340px] select-none relative shadow-sm min-h-[52px]
            ${isMe ? 'bg-[#005c4b]' : 'bg-[#202c33]'}
        `}>
            {/* Main Content Column */}
            <div className="flex-1 flex flex-col justify-center min-w-[120px] ml-1">
                {/* Top Row: Play Button & Waveform */}
                <div className="flex items-center gap-2 w-full h-8">
                    <button
                        type="button"
                        onClick={togglePlay}
                        disabled={isLoading}
                        className="shrink-0 focus:outline-none w-8 h-8 flex items-center justify-center opacity-80 hover:opacity-100 transition-opacity"
                    >
                        {isLoading ? (
                            <Loader2 className="w-7 h-7 animate-spin text-zinc-400" />
                        ) : isPlaying ? (
                            <Pause className="w-7 h-7 fill-zinc-400 text-zinc-400" />
                        ) : (
                            <Play className="w-7 h-7 fill-zinc-400 text-zinc-400 ml-1" />
                        )}
                    </button>

                    {/* Waveform Container */}
                    <div className="flex-1 h-8 flex items-center gap-[2px] relative cursor-pointer group">
                        {/* Interactive Slider Overlay */}
                        <input
                            type="range"
                            min={0}
                            max={duration || 100}
                            value={currentTime}
                            onChange={(e) => {
                                const val = parseFloat(e.target.value);
                                if (audioRef.current) {
                                    audioRef.current.currentTime = val;
                                    setCurrentTime(val); // Instant update on drag
                                }
                            }}
                            className="absolute inset-0 w-full h-full opacity-0 z-20 cursor-pointer"
                        />

                        {/* Green Progress Dot */}
                        <div
                            className="absolute w-3 h-3 bg-[#00a884] rounded-full shadow-sm z-10 pointer-events-none top-1/2 -translate-y-1/2"
                            style={{ left: `calc(${progress}% - 6px)` }}
                        />

                        {/* Bars - Taller and better centered */}
                        <div className="flex items-center w-full h-4 justify-between px-1">
                            {bars.map((height, i) => {
                                const barPos = (i / bars.length) * 100;
                                const isPlayed = barPos <= progress;
                                return (
                                    <div
                                        key={i}
                                        className={`w-[3px] rounded-full transition-colors duration-200 ${isPlayed ? 'bg-zinc-500' : 'bg-zinc-600/40'
                                            }`}
                                        style={{ height: `${Math.max(30, height)}%` }}
                                    />
                                );
                            })}
                        </div>
                    </div>
                </div>

                {/* Bottom Row: Info/Text */}
                <div className="flex justify-between text-[11px] text-zinc-400 font-medium leading-none pl-[42px] pr-1 -mt-1">
                    <span>{formatTime(currentTime || duration)}</span>
                    <span>{formatTimestamp(timestamp)}</span>
                </div>
            </div>

            {/* Right Side: Avatar & Mic Badge */}
            <div className="relative shrink-0 mt-1">
                <div className="w-10 h-10 rounded-full bg-zinc-600/30 flex items-center justify-center border border-zinc-700/50">
                    <User className="w-6 h-6 text-zinc-400 fill-zinc-400/50" />
                </div>
                <div className="absolute -bottom-1 -left-2 bg-[#202c33] rounded-full p-[2px]">
                    <Mic className="w-4 h-4 text-[#00a884] fill-[#00a884]" />
                </div>
            </div>
        </div>
    );
};
