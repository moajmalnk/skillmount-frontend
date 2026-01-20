import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, Star } from "lucide-react";
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
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Add Feedback</DialogTitle>
                    <DialogDescription>
                        Manually add a feedback entry. Use this for recording external testimonials or feedback.
                    </DialogDescription>
                </DialogHeader>
                <div className="grid gap-6 py-4">

                    {/* Rating */}
                    <div className="space-y-2">
                        <div className="flex justify-between">
                            <Label>Rating</Label>
                            <span className="text-sm font-medium text-muted-foreground">{rating} / 5</span>
                        </div>
                        <div className="flex justify-center py-2">
                            <div className="flex gap-1">
                                {[1, 2, 3, 4, 5].map((star) => (
                                    <Star
                                        key={star}
                                        className={`w-8 h-8 cursor-pointer transition-colors ${star <= rating ? "fill-yellow-400 text-yellow-400" : "text-muted/30"
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
                            className="min-h-[100px]"
                        />
                    </div>
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={handleClose} disabled={loading}>
                        Cancel
                    </Button>
                    <Button onClick={handleSubmit} disabled={loading}>
                        {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                        Submit Feedback
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};
