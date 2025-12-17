import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Download, ExternalLink, Mic, Image as ImageIcon, Star, Send, Globe, Lock } from "lucide-react";
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
  const [replyText, setReplyText] = useState("");
  const [isPublic, setIsPublic] = useState(false);

  useEffect(() => {
    if (feedback) {
      setReplyText(feedback.adminReply || "");
      setIsPublic(feedback.isPublic || false);
    }
  }, [feedback]);

  if (!feedback) return null;

  const handleTogglePublic = async (checked: boolean) => {
    try {
      await feedbackService.togglePublic(feedback.id, checked);
      setIsPublic(checked);
      if (onUpdate) onUpdate();
    } catch (e) {
      toast.error("Failed to update visibility");
    }
  };

  const handleSendReply = async () => {
    try {
      await feedbackService.reply(feedback.id, replyText);
      if (onUpdate) onUpdate();
      toast.success("Reply saved");
    } catch (e) {
      toast.error("Failed to save reply");
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader className="border-b border-border/50 pb-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pr-8">
            <div className="flex items-center gap-2">
              <DialogTitle>Feedback Details</DialogTitle>
              <Badge variant="outline" className="whitespace-nowrap">{feedback.category || 'General'}</Badge>
            </div>

            <div className="flex items-center gap-3 self-start sm:self-auto">
              <div className="flex items-center gap-2">
                <Switch id="public-mode" checked={isPublic} onCheckedChange={handleTogglePublic} />
                <Label htmlFor="public-mode" className="text-xs flex items-center gap-1 cursor-pointer select-none">
                  {isPublic ? <Globe className="w-3 h-3 text-green-500" /> : <Lock className="w-3 h-3 text-muted-foreground" />}
                  {isPublic ? 'Public' : 'Private'}
                </Label>
              </div>
              <Badge variant={feedback.status === 'New' ? 'destructive' : 'secondary'}>{feedback.status}</Badge>
            </div>
          </div>
          <DialogDescription className="mt-2 text-left">
            Submitted by <span className="font-semibold text-foreground">{feedback.studentName}</span> on {feedback.date}
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="flex-1 p-6">
          <div className="space-y-6">

            {/* Rating */}
            <div className="flex items-center gap-1">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={`w-5 h-5 ${i < feedback.rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"}`}
                />
              ))}
              <span className="ml-2 text-sm font-medium text-muted-foreground">({feedback.rating}/5)</span>
            </div>

            {/* Message */}
            <div className="bg-muted/30 p-4 rounded-lg border border-border/50 text-base leading-relaxed whitespace-pre-wrap">
              {feedback.message}
            </div>

            {/* Voice Note Player */}
            {feedback.voiceUrl && (
              <div className="space-y-2">
                <h4 className="text-sm font-semibold flex items-center gap-2">
                  <Mic className="w-4 h-4 text-primary" /> Voice Feedback
                </h4>
                <div className="bg-secondary/20 p-4 rounded-lg border border-border/50 flex items-center gap-4">
                  <audio controls className="w-full h-8 flex-1">
                    <source src={feedback.voiceUrl} type="audio/webm" />
                    <source src={feedback.voiceUrl} type="audio/mpeg" />
                    <source src={feedback.voiceUrl} type="audio/wav" />
                    Your browser does not support the audio element.
                  </audio>
                  <Button variant="ghost" size="icon" asChild title="Download Voice Note">
                    <a href={feedback.voiceUrl} download>
                      <Download className="w-4 h-4 text-muted-foreground hover:text-primary" />
                    </a>
                  </Button>
                </div>
              </div>
            )}

            {/* Attachment Preview */}
            {feedback.attachmentUrl && (
              <div className="space-y-2">
                <h4 className="text-sm font-semibold flex items-center gap-2">
                  <ImageIcon className="w-4 h-4 text-primary" /> Attached Screenshot
                </h4>
                <div className="relative group rounded-lg overflow-hidden border border-border/50 bg-black/5">
                  <img
                    src={feedback.attachmentUrl}
                    alt="Attachment"
                    className="w-full h-auto object-contain max-h-[300px]"
                  />
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                    <Button variant="secondary" size="sm" asChild>
                      <a href={feedback.attachmentUrl} target="_blank" rel="noreferrer">
                        <ExternalLink className="w-4 h-4 mr-2" /> Open
                      </a>
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {/* Admin Actions: Reply */}
            <div className="border-t border-border/40 pt-6 mt-6">
              <h4 className="text-sm font-semibold mb-3">Admin Reply (Private)</h4>
              <div className="gap-2 flex flex-col">
                <Textarea
                  placeholder="Write a reply to the student or internal note..."
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  className="resize-none"
                />
                <Button size="sm" className="self-end" onClick={handleSendReply}>
                  <Send className="w-4 h-4 mr-2" /> Save Reply
                </Button>
              </div>
            </div>

          </div>
        </ScrollArea>

        <div className="p-4 border-t border-border/50 bg-muted/10 flex justify-end">
          <Button variant="outline" onClick={onClose}>Close</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};