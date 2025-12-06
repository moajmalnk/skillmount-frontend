import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Download, ExternalLink, Mic, Image as ImageIcon, Star } from "lucide-react";
import { Feedback } from "@/types/feedback";

interface FeedbackDetailModalProps {
  feedback: Feedback | null;
  isOpen: boolean;
  onClose: () => void;
}

export const FeedbackDetailModal = ({ feedback, isOpen, onClose }: FeedbackDetailModalProps) => {
  if (!feedback) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader className="border-b border-border/50 pb-4">
          <div className="flex items-center justify-between">
            <DialogTitle>Feedback Details</DialogTitle>
            <Badge variant={feedback.status === 'New' ? 'default' : 'secondary'}>{feedback.status}</Badge>
          </div>
          <DialogDescription>
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
            <div className="bg-muted/30 p-4 rounded-lg border border-border/50 text-sm leading-relaxed">
              {feedback.message}
            </div>

            {/* Voice Note Player */}
            {feedback.voiceUrl && (
              <div className="space-y-2">
                <h4 className="text-sm font-semibold flex items-center gap-2">
                  <Mic className="w-4 h-4 text-primary" /> Voice Feedback
                </h4>
                <div className="bg-secondary/20 p-4 rounded-lg border border-border/50">
                  <audio controls className="w-full h-8">
                    <source src={feedback.voiceUrl} type="audio/mpeg" />
                    <source src={feedback.voiceUrl} type="audio/wav" />
                    Your browser does not support the audio element.
                  </audio>
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

          </div>
        </ScrollArea>

        <div className="p-4 border-t border-border/50 bg-muted/10 flex justify-end">
          <Button onClick={onClose}>Close</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};