import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, Star, X } from "lucide-react";
import { feedbackService } from "@/services/feedbackService";
import { toast } from "sonner";
import { Slider } from "@/components/ui/slider";

interface FeedbackCreateDialogProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

const CATEGORIES = [
    "General",
    "Course Content",
    "Instructor",
    "Technical Issue",
    "Feature Request",
    "Other"
];

export const FeedbackCreateDialog = ({ isOpen, onClose, onSuccess }: FeedbackCreateDialogProps) => {
    const [loading, setLoading] = useState(false);
    const [rating, setRating] = useState(5);
    const [category, setCategory] = useState("General");
    const [message, setMessage] = useState("");

    const handleSubmit = async () => {
        if (!message) {
            toast.error("Message is required");
            return;
        }

        setLoading(true);
        try {
            await feedbackService.create({
                rating,
                category,
                message,
                // Assuming backend handles creating as current user
            });
            toast.success("Feedback submitted successfully");
            onSuccess();
            handleClose();
        } catch (error) {
            toast.error("Failed to submit feedback");
        } finally {
            setLoading(false);
        }
    };

    const handleClose = () => {
        onClose();
        // Reset form after close transition to avoid flicker, or just leave it
        setTimeout(() => {
            setRating(5);
            setCategory("General");
            setMessage("");
        }, 200);
    };

    return (
        <Dialog open={isOpen} onOpenChange={handleClose}>
            <DialogContent className="modal-admin-uniform">
                <DialogHeader className="modal-header-standard">
                    <div className="flex items-start justify-between">
                        <div className="space-y-1">
                            <DialogTitle>Add Feedback</DialogTitle>
                            <DialogDescription>
                                Manually add a feedback entry. Use this for recording external testimonials or feedback.
                            </DialogDescription>
                        </div>
                        <Button variant="ghost" size="icon" onClick={handleClose} className="h-8 w-8 text-muted-foreground">
                            <X className="w-4 h-4" />
                        </Button>
                    </div>
                </DialogHeader>
                <div className="modal-body-standard">
                    <div className="grid gap-6">

                        {/* Rating */}
                        <div className="space-y-4">
                            <div className="flex justify-between items-end">
                                <Label className="text-sm font-semibold">User Rating</Label>
                                <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-yellow-400/10 text-yellow-600 border border-yellow-400/20">{rating} / 5 Stars</span>
                            </div>
                            <div className="flex justify-center p-4 bg-muted/30 rounded-xl border border-border/50 shadow-inner group transition-all hover:bg-muted/50">
                                <div className="flex gap-2">
                                    {[1, 2, 3, 4, 5].map((star) => (
                                        <Star
                                            key={star}
                                            className={`w-10 h-10 cursor-pointer transition-all duration-300 hover:scale-110 active:scale-95 ${star <= rating ? "fill-yellow-400 text-yellow-400 drop-shadow-[0_0_8px_rgba(250,204,21,0.4)]" : "text-muted/30 hover:text-muted/50"
                                                }`}
                                            onClick={() => setRating(star)}
                                        />
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Category */}
                        <div className="space-y-2">
                            <Label>Category</Label>
                            <Select value={category} onValueChange={setCategory}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select category" />
                                </SelectTrigger>
                                <SelectContent>
                                    {CATEGORIES.map((cat) => (
                                        <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Message */}
                        <div className="space-y-2">
                            <Label>Message / Review</Label>
                            <Textarea
                                value={message}
                                onChange={(e) => setMessage(e.target.value)}
                                placeholder="Enter the student's feedback here..."
                                className="min-h-[120px] resize-none"
                            />
                        </div>
                    </div>
                </div>
                <DialogFooter className="modal-footer-standard">
                    <Button variant="outline" onClick={handleClose} disabled={loading}>
                        Cancel
                    </Button>
                    <Button onClick={handleSubmit} disabled={loading} className="px-8">
                        {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                        Submit Feedback
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};
