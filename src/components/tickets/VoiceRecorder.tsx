import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Mic, Square, Play, Trash2, Pause, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface VoiceRecorderProps {
  onRecordingComplete: (blob: Blob) => void;
  onDelete: () => void;
  variant?: "default" | "compact";
}

export const VoiceRecorder = ({ onRecordingComplete, onDelete, variant = "default" }: VoiceRecorderProps) => {
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isInitializing, setIsInitializing] = useState(false);
  const [showPermissionHelp, setShowPermissionHelp] = useState(false);
  const [progress, setProgress] = useState(0);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const audioPlayerRef = useRef<HTMLAudioElement | null>(null);

  // Cleanup URL on unmount or change
  useEffect(() => {
    return () => {
      stopRecordingCleanup();
      if (audioUrl) URL.revokeObjectURL(audioUrl);
    };
  }, [audioUrl]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const stopRecordingCleanup = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  };

  // Detect supported mime type for the specific browser
  const getSupportedMimeType = () => {
    const types = [
      "audio/webm;codecs=opus",
      "audio/webm",
      "audio/mp4", // Essential for Safari
      "audio/ogg",
      "audio/wav"
    ];
    for (const type of types) {
      if (MediaRecorder.isTypeSupported(type)) {
        return type;
      }
    }
    return ""; // Fallback to browser default
  };

  const startRecording = async () => {
    if (isInitializing) return;

    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      toast.error("Your browser does not support audio recording.");
      return;
    }

    setIsInitializing(true);

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      const mimeType = getSupportedMimeType();
      const options = mimeType ? { mimeType } : undefined;
      const mediaRecorder = new MediaRecorder(stream, options);

      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        // FIX: Use the actual mimeType used by the recorder to create the Blob
        const actualMimeType = mediaRecorder.mimeType || mimeType || "audio/webm";
        const audioBlob = new Blob(audioChunksRef.current, { type: actualMimeType });

        if (audioBlob.size === 0) {
          toast.error("Recording failed: Empty audio file.");
          return;
        }

        const url = URL.createObjectURL(audioBlob);
        setAudioUrl(url);
        onRecordingComplete(audioBlob);
        stopRecordingCleanup();
      };

      // Start with 1000ms timeslice to ensure data is saved periodically
      mediaRecorder.start(1000);
      setIsRecording(true);

      timerRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);

    } catch (error: any) {
      console.error("[VoiceRecorder] Error:", error);
      if (error.name === 'NotAllowedError' || error.name === 'PermissionDeniedError') {
        setShowPermissionHelp(true);
      } else {
        toast.error("Could not start recording.", { description: error.message });
      }
    } finally {
      setIsInitializing(false);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const handleDelete = () => {
    if (audioUrl) URL.revokeObjectURL(audioUrl);
    setAudioUrl(null);
    setRecordingTime(0);
    setIsPlaying(false);
    setProgress(0);
    onDelete();
  };

  const togglePlayback = () => {
    if (audioPlayerRef.current) {
      if (isPlaying) {
        audioPlayerRef.current.pause();
      } else {
        if (progress === 100) {
          audioPlayerRef.current.currentTime = 0;
        }
        audioPlayerRef.current.play().catch(e => toast.error("Playback failed: " + e.message));
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleTimeUpdate = () => {
    if (audioPlayerRef.current) {
      const current = audioPlayerRef.current.currentTime;
      const duration = audioPlayerRef.current.duration;
      if (duration && !isNaN(duration)) {
        setProgress((current / duration) * 100);
      }
    }
  };

  if (variant === 'compact') {
    return (
      <>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className={cn(
            "h-8 w-8 rounded-md transition-all hover:bg-muted",
            isRecording && "text-destructive hover:text-destructive hover:bg-destructive/10 animate-pulse",
            audioUrl && "text-primary hover:text-primary hover:bg-primary/10"
          )}
          onClick={isRecording ? stopRecording : startRecording}
          disabled={isInitializing}
          title={isRecording ? "Stop Recording" : "Record Voice Note"}
        >
          {isRecording ? <Square className="h-4 w-4 fill-current" /> : <Mic className="h-4 w-4" />}
        </Button>

        {/* Hidden Audio Player for Compact Mode if needed, or just relying on parent */}
        {audioUrl && (
          <audio ref={audioPlayerRef} src={audioUrl} className="hidden" />
        )}

        <Dialog open={showPermissionHelp} onOpenChange={setShowPermissionHelp}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-destructive">
                <X className="w-5 h-5" /> Microphone Access Blocked
              </DialogTitle>
              <DialogDescription>
                Please allow microphone access in your browser settings to record voice notes.
              </DialogDescription>
            </DialogHeader>
            <div className="flex justify-end pt-4">
              <Button onClick={() => window.location.reload()}>Reload Page</Button>
            </div>
          </DialogContent>
        </Dialog>
      </>
    );
  }

  return (
    <>
      <div className="flex items-center gap-4 p-4 border border-border/50 rounded-xl bg-card/50 w-full">
        {!audioUrl ? (
          <>
            <Button
              type="button"
              variant={isRecording ? "destructive" : "outline"}
              size="icon"
              className={cn("h-12 w-12 shrink-0 rounded-full transition-all duration-300", isRecording && "animate-pulse")}
              onClick={isRecording ? stopRecording : startRecording}
              disabled={isInitializing}
            >
              {isRecording ? <Square className="h-5 w-5 fill-current" /> : <Mic className="h-6 w-6" />}
            </Button>

            <div className="flex flex-col overflow-hidden">
              <span className={cn("text-sm font-medium truncate", isRecording ? "text-red-500" : "text-muted-foreground")}>
                {isInitializing ? "Starting..." : isRecording ? "Recording..." : "Click mic to record"}
              </span>
              {isRecording && <span className="font-mono text-xs">{formatTime(recordingTime)}</span>}
            </div>
          </>
        ) : (
          <>
            <Button type="button" variant="outline" size="icon" className="h-10 w-10 shrink-0 rounded-full" onClick={togglePlayback}>
              {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4 ml-0.5" />}
            </Button>

            <div className="flex-1 h-2 bg-secondary rounded-full overflow-hidden relative cursor-pointer mx-2">
              <div
                className="absolute inset-0 bg-primary/50 transition-all duration-100"
                style={{ width: `${progress}%` }}
              />
            </div>

            <span className="font-mono text-xs text-muted-foreground w-10 text-right">{formatTime(recordingTime)}</span>

            <Button type="button" variant="ghost" size="icon" className="text-destructive hover:bg-destructive/10 shrink-0" onClick={handleDelete}>
              <Trash2 className="h-4 w-4" />
            </Button>

            <audio
              ref={audioPlayerRef}
              src={audioUrl || ""}
              onEnded={() => { setIsPlaying(false); setProgress(100); }}
              onPause={() => setIsPlaying(false)}
              onPlay={() => setIsPlaying(true)}
              onTimeUpdate={handleTimeUpdate}
              className="hidden"
            />
          </>
        )}
      </div>

      <Dialog open={showPermissionHelp} onOpenChange={setShowPermissionHelp}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-destructive">
              <X className="w-5 h-5" /> Microphone Access Blocked
            </DialogTitle>
            <DialogDescription>
              Please allow microphone access in your browser settings to record voice notes.
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end pt-4">
            <Button onClick={() => window.location.reload()}>Reload Page</Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};