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
      <DialogContent className="modal-admin-uniform [&>button]:hidden">
        {/* Standard Header */}
        <DialogHeader className="modal-header-standard border-b border-border/40 bg-muted/20">
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
            {/* Left Section: Info */}
            <div className="space-y-1.5 flex-1 min-w-0">
              <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                <DialogTitle className="text-xl sm:text-2xl font-bold tracking-tight">Feedback Details</DialogTitle>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-[10px] uppercase font-bold tracking-wider px-2 border-primary/20 bg-primary/5 text-primary">
                    {feedback.category || 'General'}
                  </Badge>
                  {feedback.status === 'New' && (
                    <Badge variant="destructive" className="text-[10px] uppercase font-bold tracking-wider animate-pulse px-2">New</Badge>
                  )}
                </div>
              </div>
              <DialogDescription className="text-xs sm:text-sm">
                Submitted by <span className="font-bold text-foreground">{feedback.studentName}</span> on <span className="text-muted-foreground">{feedback.date}</span>
              </DialogDescription>
            </div>

            {/* Right Section: Actions */}
            <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0">
              <div className="flex items-center gap-2 bg-background/50 backdrop-blur-sm border border-border/60 px-3 py-1.5 rounded-full shadow-sm">
                <Switch id="public-mode" checked={isPublic} onCheckedChange={handleTogglePublic} />
                <Label htmlFor="public-mode" className="text-[10px] uppercase font-extrabold cursor-pointer select-none min-w-[4rem] tracking-widest">
                  {isPublic ? (
                    <span className="flex items-center gap-1.5 text-green-600 transition-colors">
                      <Globe className="w-3 h-3" /> Public
                    </span>
                  ) : (
                    <span className="flex items-center gap-1.5 text-muted-foreground/60 transition-colors">
                      <Lock className="w-3 h-3" /> Private
                    </span>
                  )}
                </Label>
              </div>
              <Button variant="ghost" size="icon" className="h-9 w-9 rounded-full text-muted-foreground hover:bg-muted hover:text-foreground transition-all" onClick={onClose}>
                <X className="w-5 h-5" />
              </Button>
            </div>
          </div>
        </DialogHeader>

        <div className="modal-body-standard bg-background/50">
          <div className={`grid gap-8 ${hasAttachment ? 'md:grid-cols-2' : 'grid-cols-1'}`}>

            {/* LEFT COLUMN: Content */}
            <div className="flex flex-col gap-6">

              {/* Rating */}
              <div className="flex items-center gap-3">
                <div className="flex gap-0.5">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-6 h-6 transition-all ${i < feedback.rating ? "fill-yellow-400 text-yellow-400 drop-shadow-sm" : "text-muted/20"}`}
                    />
                  ))}
                </div>
                <span className="text-sm font-semibold text-muted-foreground pt-0.5 tracking-tight">({feedback.rating}/5) Rating</span>
              </div>

              {/* Message Card */}
              <div className="space-y-2">
                <Label className="text-[10px] text-muted-foreground uppercase tracking-wider font-bold">Student Message</Label>
                <div className="bg-card p-6 rounded-2xl border border-border shadow-sm text-sm leading-relaxed whitespace-pre-wrap text-foreground/90 custom-scrollbar overflow-y-auto max-h-[350px]">
                  {feedback.message}
                </div>
              </div>

              {/* Voice Note (Left Side) */}
              {feedback.voiceUrl && (
                <div className="space-y-3 pt-2">
                  <Label className="text-[10px] text-muted-foreground uppercase tracking-wider font-bold flex items-center gap-2">
                    <Mic className="w-3 h-3" /> Voice Feedback
                  </Label>
                  <AudioPlayer src={feedback.voiceUrl} />
                </div>
              )}
            </div>

            {/* RIGHT COLUMN: Image (Only if exists) */}
            {hasAttachment && (
              <div className="md:border-l md:border-border/50 md:pl-8 flex flex-col gap-3 h-full min-h-[400px]">
                <Label className="text-[10px] text-muted-foreground uppercase tracking-wider font-bold flex items-center gap-2">
                  <ImageIcon className="w-3 h-3" /> Attachment Preview
                </Label>
                <div className="relative group rounded-2xl overflow-hidden border border-border bg-muted/5 flex items-center justify-center flex-1 h-full max-h-[400px] shadow-inner transition-all hover:bg-muted/10">
                  <img
                    src={feedback.attachmentUrl}
                    alt="Feedback Attachment"
                    className="w-full h-full object-contain p-2 transition-transform duration-500 group-hover:scale-[1.02]"
                  />
                  <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-2 group-hover:translate-y-0">
                    <Button variant="secondary" size="sm" className="shadow-lg backdrop-blur-md bg-background/90 hover:bg-background border border-border/50" asChild>
                      <a href={feedback.attachmentUrl} target="_blank" rel="noreferrer">
                        <ExternalLink className="w-3 h-3 mr-2" /> Open Original
                      </a>
                    </Button>
                  </div>
                </div>
              </div>
            )}

          </div>
        </div>

        <div className="modal-footer-standard px-6 py-4 bg-muted/5 flex justify-end">
          <Button variant="outline" onClick={onClose} className="px-8 font-medium">Close</Button>
        </div>
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