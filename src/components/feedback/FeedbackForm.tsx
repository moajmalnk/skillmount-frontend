import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Star, Sparkles, ArrowRight, Paperclip, X, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { VoiceRecorder } from "@/components/tickets/VoiceRecorder";
import { useAuth } from "@/context/AuthContext";
import { feedbackService } from "@/services/feedbackService";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export const FeedbackForm = () => {
  const { user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    rating: 5,
    category: "Other",
    feedback: "",
    attachment: null as File | null,
    voiceNote: null as Blob | null
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB
        toast.error("File size must be under 5MB");
        return;
      }
      setFormData({ ...formData, attachment: file });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      toast.error("You must be logged in to submit feedback.");
      return;
    }

    if (!formData.feedback || formData.feedback.length < 10) {
      toast.error("Please provide a bit more detail in your feedback.");
      return;
    }

    setIsSubmitting(true);

    try {
      await feedbackService.create({
        rating: formData.rating,
        category: formData.category,
        message: formData.feedback,
        hasAttachment: !!formData.attachment,
        hasVoiceNote: !!formData.voiceNote,
        attachment: formData.attachment,
        voiceNote: formData.voiceNote
      });

      toast.success("Feedback Received!", {
        description: "Thank you for helping us improve SkillMount!",
      });

      // Reset
      setFormData({
        rating: 5,
        category: "Other",
        feedback: "",
        attachment: null,
        voiceNote: null
      });

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
              onClick={() => setFormData({ ...formData, rating: star })}
              className="transition-all duration-300 hover:scale-125 focus:outline-none"
              aria-label={`Rate ${star} stars`}
            >
              <Star
                className={`w-10 h-10 transition-all duration-300 ${star <= formData.rating
                  ? 'fill-primary text-primary drop-shadow-lg'
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
              <SelectItem value="Content">Content Quality</SelectItem>
              <SelectItem value="Platform">Platform UI/UX</SelectItem>
              <SelectItem value="Support">Support Service</SelectItem>
              <SelectItem value="Other">Other</SelectItem>
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
      <div className="grid md:grid-cols-2 gap-6">
        <div className="space-y-3">
          <Label className="flex items-center gap-2">
            Voice Feedback <span className="text-xs text-muted-foreground font-normal">(Optional)</span>
          </Label>
          <VoiceRecorder
            onRecordingComplete={(blob) => setFormData({ ...formData, voiceNote: blob })}
            onDelete={() => setFormData({ ...formData, voiceNote: null })}
          />
        </div>

        <div className="space-y-3">
          <Label className="flex items-center gap-2">
            Attach Screenshot <span className="text-xs text-muted-foreground font-normal">(Optional)</span>
          </Label>
          {!formData.attachment ? (
            <div className="border-2 border-dashed border-border/50 rounded-xl p-4 hover:bg-muted/50 transition-colors text-center cursor-pointer relative h-[88px] flex flex-col items-center justify-center">
              <input
                type="file"
                className="absolute inset-0 opacity-0 cursor-pointer"
                onChange={handleFileChange}
                accept="image/*,.pdf"
              />
              <Paperclip className="w-5 h-5 mx-auto text-muted-foreground mb-1" />
              <p className="text-xs text-muted-foreground">Click to upload file</p>
            </div>
          ) : (
            <div className="flex items-center justify-between p-3 border border-primary/20 bg-primary/5 rounded-xl h-[88px]">
              <div className="flex items-center gap-3 overflow-hidden">
                <div className="bg-primary/10 p-2 rounded-lg">
                  <Paperclip className="w-4 h-4 text-primary" />
                </div>
                <div className="flex flex-col min-w-0">
                  <span className="text-sm font-medium truncate max-w-[120px]">
                    {formData.attachment.name}
                  </span>
                  <span className="text-xs text-muted-foreground">Attached</span>
                </div>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-muted-foreground hover:text-destructive"
                onClick={() => setFormData({ ...formData, attachment: null })}
              >
                <X className="w-4 h-4" />
              </Button>
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
    </form>
  );
};