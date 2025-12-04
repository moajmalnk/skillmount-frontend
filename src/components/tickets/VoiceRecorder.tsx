import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Mic, Square, Play, Trash2, Pause } from "lucide-react";
import { cn } from "@/lib/utils";

interface VoiceRecorderProps {
  onRecordingComplete: (blob: Blob) => void;
  onDelete: () => void;
}

export const VoiceRecorder = ({ onRecordingComplete, onDelete }: VoiceRecorderProps) => {
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const audioPlayerRef = useRef<HTMLAudioElement | null>(null);

  // Format seconds to MM:SS
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
        const url = URL.createObjectURL(audioBlob);
        setAudioUrl(url);
        onRecordingComplete(audioBlob);
        stream.getTracks().forEach(track => track.stop()); // Stop mic access
      };

      mediaRecorder.start();
      setIsRecording(true);
      
      // Start Timer
      timerRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);

    } catch (error) {
      console.error("Error accessing microphone:", error);
      alert("Microphone access is required to record voice notes.");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (timerRef.current) clearInterval(timerRef.current);
    }
  };

  const handleDelete = () => {
    setAudioUrl(null);
    setRecordingTime(0);
    onDelete();
  };

  const togglePlayback = () => {
    if (audioPlayerRef.current) {
      if (isPlaying) {
        audioPlayerRef.current.pause();
      } else {
        audioPlayerRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  return (
    <div className="flex items-center gap-4 p-4 border border-border/50 rounded-xl bg-card/50">
      {!audioUrl ? (
        // Recording State
        <>
          <Button
            type="button"
            variant={isRecording ? "destructive" : "outline"}
            size="icon"
            className={cn("h-12 w-12 rounded-full transition-all duration-300", isRecording && "animate-pulse")}
            onClick={isRecording ? stopRecording : startRecording}
          >
            {isRecording ? <Square className="h-5 w-5 fill-current" /> : <Mic className="h-6 w-6" />}
          </Button>
          
          <div className="flex flex-col">
            <span className={cn("text-sm font-medium", isRecording ? "text-red-500" : "text-muted-foreground")}>
              {isRecording ? "Recording..." : "Click mic to record"}
            </span>
            {isRecording && <span className="font-mono text-xs">{formatTime(recordingTime)}</span>}
          </div>
        </>
      ) : (
        // Playback State
        <>
          <Button type="button" variant="outline" size="icon" className="h-10 w-10 rounded-full" onClick={togglePlayback}>
            {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4 ml-0.5" />}
          </Button>
          
          <div className="flex-1 h-2 bg-secondary rounded-full overflow-hidden relative">
             {/* Visualizer Placeholder (Static for simplicity) */}
             <div className="absolute inset-0 w-1/2 bg-primary/50" />
          </div>
          
          <span className="font-mono text-xs text-muted-foreground">{formatTime(recordingTime)}</span>
          
          <Button type="button" variant="ghost" size="icon" className="text-destructive hover:bg-destructive/10" onClick={handleDelete}>
            <Trash2 className="h-4 w-4" />
          </Button>
          
          <audio 
            ref={audioPlayerRef} 
            src={audioUrl} 
            onEnded={() => setIsPlaying(false)} 
            className="hidden" 
          />
        </>
      )}
    </div>
  );
};