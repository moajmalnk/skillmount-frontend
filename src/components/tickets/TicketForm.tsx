import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertCircle, ArrowRight, Paperclip, X } from "lucide-react";
import { toast } from "sonner";
import { VoiceRecorder } from "./VoiceRecorder";
import { useAuth } from "@/context/AuthContext";

export const TicketForm = () => {
  const { user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [formData, setFormData] = useState({
    subject: "",
    priority: "medium",
    description: "",
    attachment: null as File | null,
    voiceNote: null as Blob | null
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      setFormData({ ...formData, attachment: e.target.files[0] });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Simulate API Upload
    setTimeout(() => {
      console.log("Submitting Ticket:", {
        user: user?.email,
        ...formData
      });

      toast.success("Ticket Submitted Successfully", {
        description: `Ticket #${Math.floor(Math.random() * 10000)} created. Admins notified.`,
      });

      // Reset
      setFormData({
        subject: "",
        priority: "medium",
        description: "",
        attachment: null,
        voiceNote: null
      });
      setIsSubmitting(false);
    }, 1500);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* 1. Basic Info */}
      <div className="grid md:grid-cols-2 gap-6">
        <div className="space-y-3">
          <Label>Subject <span className="text-red-500">*</span></Label>
          <Input
            placeholder="e.g. Elementor Header Issue"
            value={formData.subject}
            onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
            required
            className="h-12"
          />
        </div>
        
        <div className="space-y-3">
          <Label>Urgency Status</Label>
          <Select
            value={formData.priority}
            onValueChange={(val) => setFormData({ ...formData, priority: val })}
          >
            <SelectTrigger className="h-12">
              <SelectValue placeholder="Select Priority" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="low">Low - General Query</SelectItem>
              <SelectItem value="medium">Medium - Standard Support</SelectItem>
              <SelectItem value="high">High - Blocking Issue</SelectItem>
              <SelectItem value="urgent">Urgent - Site Down</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* 2. Detailed Description */}
      <div className="space-y-3">
        <Label>Description <span className="text-red-500">*</span></Label>
        <Textarea
          placeholder="Please describe the issue in detail..."
          rows={5}
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          required
          className="resize-none"
        />
      </div>

      {/* 3. Media Inputs (Voice & File) */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Voice Note */}
        <div className="space-y-3">
          <Label className="flex items-center gap-2">
            Record Voice Note 
            <span className="text-xs text-muted-foreground font-normal">(Optional)</span>
          </Label>
          <VoiceRecorder 
            onRecordingComplete={(blob) => setFormData({ ...formData, voiceNote: blob })}
            onDelete={() => setFormData({ ...formData, voiceNote: null })}
          />
        </div>

        {/* File Attachment */}
        <div className="space-y-3">
          <Label className="flex items-center gap-2">
            Attach Screenshot/File
            <span className="text-xs text-muted-foreground font-normal">(Max 5MB)</span>
          </Label>
          
          {!formData.attachment ? (
            <div className="border-2 border-dashed border-border/50 rounded-xl p-4 hover:bg-muted/50 transition-colors text-center cursor-pointer relative">
              <input 
                type="file" 
                className="absolute inset-0 opacity-0 cursor-pointer"
                onChange={handleFileChange}
                accept="image/*,.pdf,.doc,.docx"
              />
              <Paperclip className="w-6 h-6 mx-auto text-muted-foreground mb-2" />
              <p className="text-sm text-muted-foreground">Click or drag file here</p>
            </div>
          ) : (
            <div className="flex items-center justify-between p-3 border border-primary/20 bg-primary/5 rounded-xl">
              <div className="flex items-center gap-3 overflow-hidden">
                <div className="bg-primary/10 p-2 rounded-lg">
                  <Paperclip className="w-4 h-4 text-primary" />
                </div>
                <span className="text-sm font-medium truncate max-w-[150px]">
                  {formData.attachment.name}
                </span>
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

      {/* 4. Footer Info */}
      <div className="flex items-start gap-3 p-4 bg-muted/30 rounded-xl border border-border/50">
        <AlertCircle className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
        <div className="text-sm text-muted-foreground">
          <p>
            Admins and your assigned Tutor will be notified immediately via 
            <span className="font-semibold text-foreground"> In-App, Email, and WhatsApp</span>.
          </p>
        </div>
      </div>

      <Button 
        type="submit" 
        size="lg" 
        className="w-full h-12 shadow-md "
        disabled={isSubmitting}
      >
        {isSubmitting ? "Submitting..." : (
          <>
            Submit Ticket <ArrowRight className="w-4 h-4 ml-2" />
          </>
        )}
      </Button>
    </form>
  );
};