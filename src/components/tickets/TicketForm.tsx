import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertCircle, ArrowRight, Paperclip, X, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { VoiceRecorder } from "./VoiceRecorder";
import { ticketService } from "@/services/ticketService";
import { useAuth } from "@/context/AuthContext";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export const TicketForm = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formKey, setFormKey] = useState(0); // Used to reset non-controlled components like VoiceRecorder
  const [deleteConfirm, setDeleteConfirm] = useState<{ type: 'voice' | 'file', index: number } | null>(null);

  const [formData, setFormData] = useState({
    title: "",
    priority: "Medium",
    category: "Technical",
    description: "",
    attachments: [] as File[],
    voiceNotes: [] as Blob[]
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      // Optional: Limit total files to 5
      if (formData.attachments.length + newFiles.length > 5) {
        toast.error("Maximum 5 files allowed");
        return;
      }
      setFormData(prev => ({
        ...prev,
        attachments: [...prev.attachments, ...newFiles]
      }));
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.description) {
      toast.error("Please fill in all required fields.");
      return;
    }

    setIsSubmitting(true);

    try {
      const ticketId = await ticketService.create(formData);

      toast.success("Ticket submitted successfully", {
        description: ticketId
          ? `Your support request has been received. Ticket ID: ${ticketId}`
          : "Your support request has been received.",
        action: {
          label: "View Tickets",
          onClick: () => navigate("/student/tickets"),
        },
      });

      // Reset
      setFormData({
        title: "",
        priority: "Medium",
        category: "Technical",
        description: "",
        attachments: [],
        voiceNotes: []
      });
      setFormKey(prev => prev + 1); // Reset Voice Recorder UI

    } catch (error) {
      toast.error("Failed to submit ticket.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* 1. Basic Info */}
      <div className="grid md:grid-cols-2 gap-6">
        <div className="space-y-3 md:col-span-2">
          <Label>Subject <span className="text-red-500">*</span></Label>
          <Input
            placeholder="e.g. Elementor Header Issue"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            required
            maxLength={255}
            className="h-12 border-border/40 focus:border-primary/50"
          />
        </div>

        <div className="space-y-3">
          <Label>
            Urgency Status
            <span className="ml-1 text-xs text-muted-foreground font-normal">
              (helps us prioritise your ticket)
            </span>
          </Label>
          <Select
            value={formData.priority}
            onValueChange={(val) => setFormData({ ...formData, priority: val })}
          >
            <SelectTrigger className="h-12 border-border/40">
              <SelectValue placeholder="Select Priority" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Low">Low - General Query</SelectItem>
              <SelectItem value="Medium">Medium - Standard Support</SelectItem>
              <SelectItem value="High">High - Blocking Issue</SelectItem>
              <SelectItem value="Urgent">Urgent - Site Down</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-3">
          <Label>Category</Label>
          <Select
            value={formData.category}
            onValueChange={(val) => setFormData({ ...formData, category: val })}
          >
            <SelectTrigger className="h-12 border-border/40">
              <SelectValue placeholder="Select Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Technical">Technical Issue</SelectItem>
              <SelectItem value="Account">Account Support</SelectItem>
              <SelectItem value="Content">Course Content</SelectItem>
              <SelectItem value="Other">Other</SelectItem>
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
          className="resize-none border-border/40 focus:border-primary/50"
        />
      </div>

      {/* 3. Media Inputs (Voice & File) */}
      <div className="grid md:grid-cols-2 gap-6 pt-4">

        {/* Voice Note Section */}
        <div className="space-y-3">
          <div className="flex items-center justify-between px-1">
            <Label className="text-sm font-medium text-foreground/80">Voice Notes</Label>
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
              toast.success("Voice note added");
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

      {/* 4. Footer Info */}
      <div className="flex items-start gap-3 p-4 bg-muted/30 rounded-xl border border-border/50">
        <AlertCircle className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
        <div className="text-sm text-muted-foreground">
          <p>
            Your assigned mentor and coordinator will be notified immediately via
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
        {isSubmitting ? (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Submitting...
          </>
        ) : (
          <>
            Submit Ticket <ArrowRight className="w-4 h-4 ml-2" />
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