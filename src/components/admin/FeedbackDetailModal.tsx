import { useState, useEffect, useRef } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import {
  Download, ExternalLink, Mic, Image as ImageIcon, Star, Globe, Lock,
  Play, Pause, X
} from "lucide-react";
import { Feedback } from "@/types/feedback";
import { feedbackService } from "@/services/feedbackService";
import { toast } from "sonner";

interface FeedbackDetailModalProps {
  feedback: Feedback | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdate?: () => void;
}

export const FeedbackDetailModal = ({ feedback, isOpen, onClose, onUpdate }: FeedbackDetailModalProps) => {
  const [isPublic, setIsPublic] = useState(false);

  useEffect(() => {
    if (feedback) {
      setIsPublic(feedback.isPublic || false);
    }
  }, [feedback]);

  if (!feedback) return null;

  const hasAttachment = !!feedback.attachmentUrl;

  const handleTogglePublic = async (checked: boolean) => {
    try {
      await feedbackService.togglePublic(feedback.id, checked);
      setIsPublic(checked);
      if (onUpdate) onUpdate();
      toast.success(checked ? "Feedback is now public" : "Feedback is now private");
    } catch (e) {
      toast.error("Failed to update visibility");
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className={`max-h-[90vh] overflow-hidden flex flex-col p-0 gap-0 [&>button]:hidden ${hasAttachment ? 'sm:max-w-5xl' : 'sm:max-w-2xl'}`}>
        {/* Custom Header */}
        <DialogHeader className="p-6 border-b border-border/40 bg-muted/20 pb-4 shrink-0">
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <DialogTitle className="text-xl">Feedback Details</DialogTitle>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-xs font-normal">
                    {feedback.category || 'General'}
                  </Badge>
                  {feedback.status === 'New' && (
                    <Badge variant="destructive" className="text-xs">New</Badge>
                  )}
                </div>
              </div>
              <DialogDescription>
                Submitted by <span className="font-semibold text-foreground">{feedback.studentName}</span> on {feedback.date}
              </DialogDescription>
            </div>

            {/* Top Controls */}
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 bg-muted/30 p-1.5 rounded-lg border border-border/50">
                <Switch id="public-mode" checked={isPublic} onCheckedChange={handleTogglePublic} />
                <Label htmlFor="public-mode" className="text-xs font-medium cursor-pointer select-none min-w-[3.5rem]">
                  {isPublic ? (
                    <span className="flex items-center gap-1 text-green-500"><Globe size={12} /> Public</span>
                  ) : (
                    <span className="flex items-center gap-1 text-muted-foreground"><Lock size={12} /> Private</span>
                  )}
                </Label>
              </div>
              <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground" onClick={onClose}>
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </DialogHeader>

        <ScrollArea className="flex-1 bg-background/50">
          <div className={`p-8 grid gap-8 ${hasAttachment ? 'md:grid-cols-2' : 'grid-cols-1'}`}>

            {/* LEFT COLUMN: Content */}
            <div className="flex flex-col gap-6">

              {/* Rating */}
              <div className="flex items-center gap-3">
                <div className="flex gap-0.5">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-5 h-5 ${i < feedback.rating ? "fill-orange-400 text-orange-400" : "text-muted/20"}`}
                    />
                  ))}
                </div>
                <span className="text-sm font-semibold text-muted-foreground pt-0.5">({feedback.rating}/5) Rating</span>
              </div>

              {/* Message Card */}
              <div className="space-y-2">
                <Label className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Student Message</Label>
                <div className="bg-card p-6 rounded-xl border border-border text-sm leading-relaxed whitespace-pre-wrap shadow-sm text-foreground/90 max-h-[400px] overflow-y-auto">
                  {feedback.message}
                </div>
              </div>

              {/* Voice Note (Left Side) */}
              {feedback.voiceUrl && (
                <div className="space-y-2 pt-2">
                  <Label className="text-xs text-muted-foreground uppercase tracking-wider font-semibold flex items-center gap-2">
                    <Mic className="w-3 h-3" /> Voice Feedback
                  </Label>
                  <AudioPlayer src={feedback.voiceUrl} />
                </div>
              )}
            </div>

            {/* RIGHT COLUMN: Image (Only if exists) */}
            {hasAttachment && (
              <div className="md:border-l md:border-border/50 md:pl-8 flex flex-col gap-2 h-full min-h-[400px]">
                <Label className="text-xs text-muted-foreground uppercase tracking-wider font-semibold flex items-center gap-2">
                  <ImageIcon className="w-3 h-3" /> Attachment Preview
                </Label>
                <div className="relative group rounded-xl overflow-hidden border border-border bg-muted/10 flex items-center justify-center flex-1 h-full max-h-[400px] shadow-inner">
                  <img
                    src={feedback.attachmentUrl}
                    alt="Feedback Attachment"
                    className="w-full h-full object-contain p-2"
                  />
                  <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button variant="secondary" size="sm" className="shadow-lg backdrop-blur-md bg-background/90 hover:bg-background" asChild>
                      <a href={feedback.attachmentUrl} target="_blank" rel="noreferrer">
                        <ExternalLink className="w-3 h-3 mr-2" /> Open Original
                      </a>
                    </Button>
                  </div>
                </div>
              </div>
            )}

          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};

// --- Custom Audio Player Component ---
const AudioPlayer = ({ src }: { src: string }) => {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);

  const togglePlay = () => {
    if (audioRef.current) {
      if (isPlaying) audioRef.current.pause();
      else audioRef.current.play();
      setIsPlaying(!isPlaying);
    }
  };

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      const curr = audioRef.current.currentTime;
      const dur = audioRef.current.duration;
      setCurrentTime(curr);
      if (dur && isFinite(dur)) setProgress((curr / dur) * 100);
    }
  };

  const handleLoadedMetadata = () => {
    if (audioRef.current) {
      const dur = audioRef.current.duration;
      if (isFinite(dur)) setDuration(dur);
    }
  };

  const handleSeek = (val: number[]) => {
    if (audioRef.current && isFinite(duration)) {
      const newTime = (val[0] / 100) * duration;
      audioRef.current.currentTime = newTime;
      setProgress(val[0]);
      setCurrentTime(newTime);
    }
  };

  const formatTime = (seconds: number) => {
    if (!seconds || isNaN(seconds) || !isFinite(seconds)) return "0:00";
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="bg-card border border-border rounded-xl p-4 flex items-center gap-4 shadow-sm hover:shadow-md transition-shadow">
      <Button
        size="icon"
        className="h-12 w-12 shrink-0 rounded-full shadow-sm"
        onClick={togglePlay}
      >
        {isPlaying ? <Pause className="fill-current w-5 h-5" /> : <Play className="fill-current w-5 h-5 ml-1" />}
      </Button>

      <div className="flex-1 space-y-2 min-w-0">
        <Slider
          value={[progress]}
          max={100}
          step={0.1}
          onValueChange={handleSeek}
          className="cursor-pointer py-1"
        />
        <div className="flex justify-between text-xs text-muted-foreground font-medium tabular-nums px-0.5">
          <span>{formatTime(currentTime)}</span>
          <span>{formatTime(duration)}</span>
        </div>
      </div>

      <div className="border-l border-border pl-4 ml-2">
        <Button variant="ghost" size="icon" className="h-9 w-9 text-muted-foreground hover:text-primary" asChild title="Download">
          <a href={src} download>
            <Download className="w-5 h-5" />
          </a>
        </Button>
      </div>

      <audio
        ref={audioRef}
        src={src}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onEnded={() => { setIsPlaying(false); setProgress(0); }}
        className="hidden"
      />
    </div>
  );
};