import { useEffect, useRef, useState } from "react";
import { Play, Pause, Volume2, VolumeX, Maximize2, Minimize2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface YouTubePlayerProps {
    videoId?: string;
    videoUrl?: string;
    title?: string;
    autoplay?: boolean;
}

declare global {
    interface Window {
        YT: any;
        onYouTubeIframeAPIReady: () => void;
    }
}

function getYouTubeVideoId(url: string): string | null {
    if (!url) return null;
    if (url.length === 11 && !/[^a-zA-Z0-9_-]/.test(url)) return url;

    const patterns = [
        /(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/,
        /youtube\.com\/embed\/([^&\n?#]+)/,
        /youtube\.com\/v\/([^&\n?#]+)/,
    ];

    for (const pattern of patterns) {
        const match = url.match(pattern);
        if (match?.[1]) return match[1];
    }
    return null;
}

export function YouTubePlayer({
    videoId: propVideoId,
    videoUrl,
    title = "Featured Tutorial",
    autoplay = false,
}: YouTubePlayerProps) {
    const extractedId = videoUrl ? getYouTubeVideoId(videoUrl) : propVideoId;
    const videoId = extractedId || propVideoId || "";

    const playerRef = useRef<any>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [isMuted, setIsMuted] = useState(false);
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [isScrubbing, setIsScrubbing] = useState(false);
    const [duration, setDuration] = useState(0);
    const [currentTime, setCurrentTime] = useState(0);

    // Wake Lock State
    const wakeLockRef = useRef<any>(null);

    // Request Wake Lock
    const requestWakeLock = async () => {
        try {
            if ('wakeLock' in navigator) {
                // @ts-ignore
                wakeLockRef.current = await navigator.wakeLock.request('screen');
            }
        } catch (err) {
            console.debug('Wake Lock request failed:', err);
        }
    };

    // Release Wake Lock
    const releaseWakeLock = async () => {
        if (wakeLockRef.current) {
            try {
                await wakeLockRef.current.release();
                wakeLockRef.current = null;
            } catch (err) {
                console.debug('Wake Lock release failed:', err);
            }
        }
    };

    // Handle Play/Pause
    const handlePlayPause = () => {
        if (!playerRef.current) return;

        try {
            if (isPlaying) {
                playerRef.current.pauseVideo();
                setIsPlaying(false);
                releaseWakeLock(); // Release on pause
            } else {
                playerRef.current.playVideo();
                setIsPlaying(true);
                requestWakeLock(); // Request on play
            }
        } catch (e) {
            // Fallback logic
            const playerState = playerRef.current.getPlayerState?.();
            if (playerState === 1) {
                playerRef.current.pauseVideo();
                setIsPlaying(false);
                releaseWakeLock();
            } else {
                playerRef.current.playVideo();
                setIsPlaying(true);
                requestWakeLock();
            }
        }
    };

    // Release on unmount or tab visibility change
    useEffect(() => {
        const handleVisibilityChange = async () => {
            if (document.hidden && wakeLockRef.current) {
                await releaseWakeLock();
            } else if (!document.hidden && isPlaying) {
                await requestWakeLock(); // Re-request if coming back to playing video
            }
        };

        document.addEventListener('visibilitychange', handleVisibilityChange);
        return () => {
            document.removeEventListener('visibilitychange', handleVisibilityChange);
            releaseWakeLock(); // Release on unmount
        };
    }, [isPlaying]);

    useEffect(() => {
        const checkAPIReady = () => {
            if (window.YT?.Player) {
                initializePlayer();
            } else {
                setTimeout(checkAPIReady, 100);
            }
        };

        checkAPIReady();
    }, [videoId]);

    const onPlayerReady = (event: any) => {
        setIsLoading(false);
        const dur = event.target.getDuration();
        if (dur > 0) setDuration(dur);
    };

    const onPlayerStateChange = (event: any) => {
        const state = event.data;
        // 0 = ended, 1 = playing, 2 = paused, 3 = buffering, 5 = cued
        setIsPlaying(state === 1);

        // Update duration when state changes
        if (playerRef.current?.getDuration) {
            const dur = playerRef.current.getDuration();
            if (dur > 0) setDuration(dur);
        }
    };

    const initializePlayer = () => {
        if (playerRef.current) playerRef.current.destroy();

        playerRef.current = new window.YT.Player("youtube-player", {
            height: "100%",
            width: "100%",
            videoId: videoId,
            playerVars: {
                controls: 0,
                modestbranding: 1,
                rel: 0,
                fs: 0,
                iv_load_policy: 3,
                showinfo: 0,
                autoplay: autoplay ? 1 : 0,
                cc_load_policy: 0,
                disablekb: 1,
                playsinline: 1,
                enablejsapi: 1,
                origin: window.location.origin,
            },
            events: {
                onReady: (event: any) => {
                    setIsLoading(false);
                    const dur = event.target.getDuration();
                    if (dur > 0) setDuration(dur);
                },
            },
        });
    };



    const handleMute = () => {
        if (!playerRef.current) return;
        if (isMuted) {
            playerRef.current.unMute();
            setIsMuted(false);
        } else {
            playerRef.current.mute();
            setIsMuted(true);
        }
    };

    const handleFullscreen = async () => {
        if (!containerRef.current) return;
        if (!isFullscreen) {
            try {
                if (containerRef.current.requestFullscreen) {
                    await containerRef.current.requestFullscreen();
                    // Attempt to lock orientation to landscape (Android/Chrome)
                    // @ts-ignore - screen.orientation might not be in all TS defs
                    if (screen.orientation && screen.orientation.lock) {
                        // @ts-ignore
                        screen.orientation.lock('landscape').catch((e) => {
                            // Orientation lock not supported or allowed (e.g. desktop/iOS)
                            console.log('Orientation lock skipped:', e);
                        });
                    }
                }
            } catch (error) {
                console.error("Fullscreen error:", error);
            }
            setIsFullscreen(true);
        } else {
            try {
                if (document.exitFullscreen) {
                    await document.exitFullscreen();
                    // @ts-ignore
                    if (screen.orientation && screen.orientation.unlock) {
                        // @ts-ignore
                        screen.orientation.unlock();
                    }
                }
            } catch (error) {
                console.error("Exit fullscreen error:", error);
            }
            setIsFullscreen(false);
        }
    };

    useEffect(() => {
        if (!isPlaying || isScrubbing) return;

        const interval = setInterval(() => {
            if (playerRef.current?.getCurrentTime) {
                const time = playerRef.current.getCurrentTime();
                if (time >= 0 && isFinite(time)) {
                    setCurrentTime(time);
                }
            }
        }, 100);

        return () => clearInterval(interval);
    }, [isPlaying, isScrubbing]);

    useEffect(() => {
        const handleFullscreenChange = () => {
            const isFull = !!document.fullscreenElement;
            setIsFullscreen(isFull);
            if (!isFull) {
                // @ts-ignore
                if (screen.orientation && screen.orientation.unlock) {
                    // @ts-ignore
                    screen.orientation.unlock();
                }
            }
        };

        document.addEventListener('fullscreenchange', handleFullscreenChange);
        return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
    }, []);

    const formatTime = (seconds: number) => {
        if (!seconds || !isFinite(seconds)) return "0:00";
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${secs.toString().padStart(2, "0")}`;
    };

    const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;

    return (
        <div
            ref={containerRef}
            className={cn(
                "relative w-full bg-gradient-to-br from-slate-900 to-black rounded-2xl overflow-hidden shadow-2xl group",
                isFullscreen && "fixed inset-0 z-50 rounded-none"
            )}
        >
            <style>{`
        #youtube-player {
          pointer-events: auto !important;
        }
        
        #youtube-player iframe {
          border: none !important;
          /* pointer-events: none !important;  <-- REMOVED to allow fallback interaction */
        }
        
        .ytp-chrome-top,
        .ytp-chrome-bottom,
        .ytp-chrome-controls,
        .ytp-gradient-top,
        .ytp-gradient-bottom,
        .ytp-share-button,
        .ytp-watch-later-button,
        .ytp-button,
        .ytp-yt-button,
        .ytp-endscreen-container,
        .ytp-watermark,
        .ytp-youtube-button,
        .yt-ui-menu-item,
        .ytp-menuitem,
        .ytp-remote-button,
        .ytp-pause-overlay,
        .ytp-cued-thumbnail-overlay,
        .ytp-player-content,
        .ytp-contextmenu,
        .ytp-settings-button,
        .ytp-fullscreen-button,
        .ytp-play-button,
        .ytp-progress-bar,
        .ytp-time-display,
        .ytp-cards-teaser,
        .ytp-ce-element {
          display: none !important;
          opacity: 0 !important;
          visibility: hidden !important;
          pointer-events: none !important;
        }

        input[type="range"] {
          -webkit-appearance: none;
          appearance: none;
          width: 100%;
          height: 6px;
          border-radius: 5px;
          outline: none;
          cursor: pointer;
        }

        input[type="range"]::-webkit-slider-thumb {
          -webkit-appearance: none;
          width: 18px;
          height: 18px;
          border-radius: 50%;
          background: white;
          cursor: pointer;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.4);
          border: 2px solid rgba(59, 130, 246, 0.8);
          transition: transform 0.2s;
        }

        input[type="range"]::-webkit-slider-thumb:hover {
          transform: scale(1.2);
        }

        input[type="range"]::-moz-range-thumb {
          width: 18px;
          height: 18px;
          border-radius: 50%;
          background: white;
          cursor: pointer;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.4);
          border: 2px solid rgba(59, 130, 246, 0.8);
          transition: transform 0.2s;
        }

        input[type="range"]::-moz-range-thumb:hover {
          transform: scale(1.2);
        }
      `}</style>

            <div className="relative w-full bg-black" style={{ paddingBottom: "56.25%" }}>
                {/* Placeholder for YouTube Iframe - handler removed because it gets destroyed */}
                <div
                    id="youtube-player"
                    className="absolute inset-0 w-full h-full"
                />

                {/* CLICK OVERLAY: Handles Play/Pause globally over the video area */}
                <div
                    className="absolute inset-0 z-10 w-full h-full cursor-pointer"
                    onClick={handlePlayPause}
                />

                {isLoading && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/90 z-20 pointer-events-none">
                        <div className="flex flex-col items-center gap-3">
                            <div className="w-12 h-12 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin" />
                            <p className="text-sm text-white/70 font-medium">Loading video...</p>
                        </div>
                    </div>
                )}

                {/* CONTROLS OVERLAY */}
                <div
                    className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-30 flex flex-col justify-between p-4 md:p-6 pointer-events-none"
                >
                    {/* Header: Title + Fullscreen - RE-ENABLE POINTER EVENTS FOR INTERACTIVE ELEMENTS */}
                    <div className="flex items-center justify-between gap-3 pointer-events-auto">
                        <div className="flex items-center gap-3 min-w-0 flex-1">
                            <div className="p-2 bg-blue-500 rounded-lg shadow-lg">
                                <Play className="w-4 h-4 text-white fill-white" />
                            </div>
                            <span className="text-sm md:text-base font-semibold text-white truncate">
                                {title}
                            </span>
                        </div>
                        <Button
                            size="sm"
                            variant="ghost"
                            className="h-9 w-9 rounded-lg hover:bg-white/20 p-0 backdrop-blur-sm"
                            onClick={handleFullscreen}
                        >
                            {isFullscreen ? (
                                <Minimize2 className="w-5 h-5 text-white" />
                            ) : (
                                <Maximize2 className="w-5 h-5 text-white" />
                            )}
                        </Button>
                    </div>

                    <div className="space-y-3 pointer-events-auto">
                        <div className="flex items-center gap-2 text-xs md:text-sm text-white/90">
                            <span className="font-semibold min-w-[45px]">{formatTime(currentTime)}</span>
                            <div className="flex-1 relative h-1.5 bg-white/20 rounded-full overflow-hidden">
                                <div
                                    className="absolute left-0 top-0 h-full bg-blue-500 rounded-full transition-all"
                                    style={{ width: `${progressPercent}%` }}
                                />
                                <input
                                    type="range"
                                    min={0}
                                    max={duration || 0}
                                    step="0.01"
                                    value={currentTime}
                                    onMouseDown={() => setIsScrubbing(true)}
                                    onMouseUp={() => setIsScrubbing(false)}
                                    onTouchStart={() => setIsScrubbing(true)}
                                    onTouchEnd={() => setIsScrubbing(false)}
                                    onChange={(e) => {
                                        const time = Number(e.target.value);
                                        setCurrentTime(time);
                                    }}
                                    onInput={(e) => {
                                        const time = Number((e.target as HTMLInputElement).value);
                                        if (playerRef.current?.seekTo) {
                                            playerRef.current.seekTo(time, true);
                                        }
                                    }}
                                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                                />
                            </div>
                            <span className="font-semibold min-w-[45px]">{formatTime(duration)}</span>
                        </div>

                        <div className="flex items-center justify-between gap-2">
                            <div className="flex items-center gap-2">
                                <Button
                                    size="sm"
                                    variant="ghost"
                                    className="h-10 w-10 rounded-full hover:bg-white/20 p-0 backdrop-blur-sm"
                                    onClick={handlePlayPause}
                                >
                                    {isPlaying ? (
                                        <Pause className="w-6 h-6 text-white fill-white" />
                                    ) : (
                                        <Play className="w-6 h-6 text-white fill-white" />
                                    )}
                                </Button>

                                <Button
                                    size="sm"
                                    variant="ghost"
                                    className="h-10 w-10 rounded-full hover:bg-white/20 p-0 backdrop-blur-sm"
                                    onClick={handleMute}
                                >
                                    {isMuted ? (
                                        <VolumeX className="w-5 h-5 text-white" />
                                    ) : (
                                        <Volume2 className="w-5 h-5 text-white" />
                                    )}
                                </Button>
                            </div>

                            <div className="text-xs md:text-sm font-semibold text-white/80 px-4 py-1.5 bg-black/50 rounded-full backdrop-blur-sm">
                                {isPlaying ? "▶ Playing" : "⏸ Paused"}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
