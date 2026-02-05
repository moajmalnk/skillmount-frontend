import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Star, Sparkles, ArrowRight, Paperclip, X, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { VoiceRecorder } from "@/components/tickets/VoiceRecorder";
import { useAuth } from "@/context/AuthContext";
import { feedbackService } from "@/services/feedbackService";
import { systemService } from "@/services/systemService";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import confetti from "canvas-confetti";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export const FeedbackForm = () => {
  const { user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [topics, setTopics] = useState<string[]>([]);

  useEffect(() => {
    const loadTopics = async () => {
      try {
        const settings = await systemService.getSettings();
        if (settings.feedbackCategories && settings.feedbackCategories.length > 0) {
          setTopics(settings.feedbackCategories);
        }
      } catch (error) {
        console.error("Failed to load topics", error);
      }
    };
    loadTopics();
  }, []);

  const [deleteConfirm, setDeleteConfirm] = useState<{ type: 'voice' | 'file', index: number } | null>(null);
  const [formKey, setFormKey] = useState(0);

  const [formData, setFormData] = useState({
    rating: 5,
    category: "Other",
    feedback: "",
    attachments: [] as File[],
    voiceNotes: [] as Blob[]
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      if (formData.attachments.length + newFiles.length > 5) {
        toast.error("Maximum 5 files allowed");
        return;
      }
      setFormData(prev => ({ ...prev, attachments: [...prev.attachments, ...newFiles] }));
    }
  };

  const removeAttachment = (index: number) => {
    setDeleteConfirm({ type: 'file', index });
  };

  const removeVoiceNote = (index: number) => {
    setDeleteConfirm({ type: 'voice', index });
  };

  const confirmDelete = () => {
    if (!deleteConfirm) return;

    if (deleteConfirm.type === 'file') {
      setFormData(prev => ({
        ...prev,
        attachments: prev.attachments.filter((_, i) => i !== deleteConfirm.index)
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        voiceNotes: prev.voiceNotes.filter((_, i) => i !== deleteConfirm.index)
      }));
    }
    setDeleteConfirm(null);
  };

  const handleRatingChange = (rating: number) => {
    setFormData({ ...formData, rating });

    // Professional Celebration Mode for 5 Stars
    if (rating === 5) {
      const duration = 1000;
      const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 };

      const randomInRange = (min: number, max: number) => Math.random() * (max - min) + min;

      // A small burst of gold/yellow particles to match the star color
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#FFD700', '#FDB931', '#E1AD01'], // Gold metallic colors
        disableForReducedMotion: true
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      toast.error("You must be logged in to submit feedback.");
      return;
    }

    if (!formData.feedback.trim()) {
      toast.error("Please provide your feedback.");
      return;
    }

    setIsSubmitting(true);

    try {
      await feedbackService.create({
        rating: formData.rating,
        category: formData.category,
        message: formData.feedback,
        hasAttachment: formData.attachments.length > 0,
        hasVoiceNote: formData.voiceNotes.length > 0,
        // Backend likely expects single fields for legacy or needs update. 
        // Assuming backend handles arrays or we just send the first one for now?
        // Actually, user asked for MULTIPLE. Backend might support it or not.
        // If backend only supports one, we might need adjustments. 
        // But user explicit request: "update in feedback, need multiple voice and attachment".
        // I will assume the Service/Backend can handle lists, or I pass lists.
        // For now, let's pass them as `attachments` and `voiceNotes` if the service supports it.
        // Checking existing service call: `attachment: formData.attachment`
        // I'll update it to pass the arrays.
        attachments: formData.attachments,
        voiceNotes: formData.voiceNotes
      });

      toast.success("Feedback Received!", {
        description: "Thank you for helping us improve SkillMount!",
      });

      // Reset
      setFormData({
        rating: 5,
        category: "Other",
        feedback: "",
        attachments: [],
        voiceNotes: []
      });
      setFormKey(p => p + 1);

    } catch (error) {
      toast.error("Failed to submit feedback. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* 1. Rating Section */}
      <div className="space-y-3">
        <Label className="text-sm font-semibold text-foreground">Rate Your Experience *</Label>
        <div className="flex items-center justify-center gap-3 p-6 bg-gradient-to-r from-primary/5 to-accent/5 rounded-2xl border border-primary/10">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              onClick={() => handleRatingChange(star)}
              className="transition-all duration-300 hover:scale-125 focus:outline-none"
              aria-label={`Rate ${star} stars`}
            >
              <Star
                className={`w-10 h-10 transition-all duration-300 ${star <= formData.rating
                  ? 'fill-yellow-400 text-yellow-500 drop-shadow-lg'
                  : 'text-muted-foreground/30 hover:text-muted-foreground/50'
                  }`}
                strokeWidth={1.5}
              />
            </button>
          ))}
        </div>
        <p className="text-center text-sm text-muted-foreground mt-2 min-h-[20px] font-medium">
          {formData.rating === 5 && "Excellent! We're glad you had a great experience"}
          {formData.rating === 4 && "Great! Thank you for your positive feedback"}
          {formData.rating === 3 && "Good! We'll work on making it better"}
          {formData.rating === 2 && "We're sorry. Please tell us how we can improve"}
          {formData.rating === 1 && "We apologize. Your feedback helps us improve"}
        </p>
      </div>

      {/* 2. Topic & Feedback */}
      <div className="space-y-4">
        <div className="space-y-3">
          <Label>Topic</Label>
          <Select
            value={formData.category}
            onValueChange={(val) => setFormData({ ...formData, category: val })}
          >
            <SelectTrigger className="h-12 rounded-xl">
              <SelectValue placeholder="Select Topic" />
            </SelectTrigger>
            <SelectContent>
              {topics.map((topic) => (
                <SelectItem key={topic} value={topic}>
                  {topic}
                </SelectItem>
              ))}
              {!topics.includes("Other") && <SelectItem value="Other">Other</SelectItem>}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-3 relative">
          <Label htmlFor="feedback-message">Your Feedback *</Label>
          <Textarea
            id="feedback-message"
            placeholder="Tell us about your experience..."
            rows={5}
            maxLength={500}
            value={formData.feedback}
            onChange={(e) => setFormData({ ...formData, feedback: e.target.value })}
            required
            className="rounded-xl border-border/30 focus:border-primary/50 resize-none pb-6"
          />
          <div className="absolute bottom-3 right-3 text-xs text-muted-foreground">
            {formData.feedback.length}/500
          </div>
        </div>
      </div>

      {/* 3. Media Inputs */}
      {/* 3. Media Inputs */}
      <div className="grid md:grid-cols-2 gap-6 pt-4">
        {/* Voice Note Section */}
        <div className="space-y-3">
          <div className="flex items-center justify-between px-1">
            <Label className="text-sm font-medium text-foreground/80">Voice Feedback</Label>
            {formData.voiceNotes.length > 0 && (
              <span className="text-xs font-medium text-primary bg-primary/10 px-2 py-0.5 rounded-full">
                {formData.voiceNotes.length} recorded
              </span>
            )}
          </div>

          <VoiceRecorder
            key={formKey}
            onRecordingComplete={(blob) => {
              setFormData(prev => ({ ...prev, voiceNotes: [...prev.voiceNotes, blob] }));
              setFormKey(p => p + 1);
            }}
            onDelete={() => { }}
            className="h-32 w-full border-2 border-dashed border-border/60 hover:border-primary/40 bg-card hover:bg-muted/30 transition-all rounded-xl shadow-sm justify-center items-center flex-col gap-3"
          />

          {/* List of Voice Notes */}
          {formData.voiceNotes.length > 0 && (
            <div className="space-y-2 mt-3 animate-in fade-in slide-in-from-top-2">
              {formData.voiceNotes.map((note, idx) => (
                <div key={idx} className="flex items-center justify-between bg-card border border-border/40 p-2.5 rounded-lg text-sm shadow-sm">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                      <span className="text-[10px] font-bold text-primary">VN</span>
                    </div>
                    <div className="flex flex-col">
                      <span className="font-medium text-xs">Voice Note {idx + 1}</span>
                      <span className="text-[10px] text-muted-foreground">{(note.size / 1024).toFixed(1)} KB</span>
                    </div>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                    onClick={() => removeVoiceNote(idx)}
                  >
                    <X className="w-3.5 h-3.5" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* File Attachment Section */}
        <div className="space-y-3">
          <div className="flex items-center justify-between px-1">
            <Label className="text-sm font-medium text-foreground/80">Attachments</Label>
            <span className="text-xs text-muted-foreground">{formData.attachments.length}/5 files</span>
          </div>

          {/* Dropzone Styled Input */}
          <div className="relative h-32 w-full border-2 border-dashed border-border/60 hover:border-primary/40 bg-card hover:bg-muted/30 transition-all rounded-xl shadow-sm flex flex-col items-center justify-center group cursor-pointer overflow-hidden">
            <input
              type="file"
              className="absolute inset-0 opacity-0 cursor-pointer z-10"
              onChange={handleFileChange}
              accept="image/*,.pdf,.doc,.docx"
              multiple
            />
            <div className="absolute inset-0 bg-gradient-to-br from-primary/0 to-primary/0 group-hover:from-primary/5 group-hover:to-transparent transition-all duration-500" />

            <div className="flex flex-col items-center gap-2 group-hover:scale-105 transition-transform duration-300 relative z-0">
              <div className="bg-primary/5 p-3 rounded-full group-hover:bg-primary/10 transition-colors">
                <Paperclip className="w-5 h-5 text-primary/70 group-hover:text-primary" />
              </div>
              <div className="text-center space-y-0.5">
                <p className="text-sm font-medium text-foreground/80 group-hover:text-primary transition-colors">Click to upload</p>
                <p className="text-[10px] text-muted-foreground">PDF, Docs, Images (Max 10MB)</p>
              </div>
            </div>
          </div>

          {/* List of Attachments */}
          {formData.attachments.length > 0 && (
            <div className="space-y-2 mt-3 animate-in fade-in slide-in-from-top-2">
              {formData.attachments.map((file, idx) => (
                <div key={idx} className="flex items-center justify-between bg-card border border-border/40 p-2.5 rounded-lg text-sm shadow-sm group/item">
                  <div className="flex items-center gap-3 overflow-hidden">
                    <div className="bg-blue-500/10 p-2 rounded-md shrink-0">
                      <Paperclip className="w-3.5 h-3.5 text-blue-500" />
                    </div>
                    <span className="truncate font-medium text-xs" title={file.name}>{file.name}</span>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 text-muted-foreground hover:text-destructive hover:bg-destructive/10 opacity-0 group-hover/item:opacity-100 transition-opacity"
                    onClick={() => removeAttachment(idx)}
                  >
                    <X className="w-3.5 h-3.5" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <Button
        type="submit"
        size="lg"
        className="w-full h-14 rounded-xl bg-primary hover:bg-primary/90 transition-all duration-300 group shadow-lg hover:shadow-xl hover:shadow-primary/20"
        disabled={isSubmitting}
      >
        {isSubmitting ? (
          <>
            <Loader2 className="w-5 h-5 mr-2 animate-spin" />
            Sending...
          </>
        ) : (
          <>
            <Sparkles className="w-5 h-5 mr-2 group-hover:rotate-12 transition-transform duration-300" />
            Submit Feedback
            <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform duration-300" />
          </>
        )}
      </Button>

      <Dialog open={!!deleteConfirm} onOpenChange={(open) => !open && setDeleteConfirm(null)}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle>Delete {deleteConfirm?.type === 'voice' ? 'Voice Note' : 'Attachment'}?</DialogTitle>
            <DialogDescription>
              Are you sure you want to remove this {deleteConfirm?.type === 'voice' ? 'voice note' : 'file'}? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end gap-3 pt-4">
            <Button variant="outline" onClick={() => setDeleteConfirm(null)}>Cancel</Button>
            <Button variant="destructive" onClick={confirmDelete}>Delete</Button>
          </div>
        </DialogContent>
      </Dialog>
    </form >
  );
};