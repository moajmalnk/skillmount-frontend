import { useState, useEffect } from "react";
import { ManagementTable } from "@/components/admin/ManagementTable";
import { TableCell, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Star, Mic, Paperclip, Trash2, Loader2, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { feedbackService } from "@/services/feedbackService";
import { Feedback } from "@/types/feedback";
import { FeedbackDetailModal } from "./FeedbackDetailModal";
import { DeleteConfirmationDialog } from "./DeleteConfirmationDialog"; // Import the delete dialog

export const FeedbackManager = () => {
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Modal State
  const [selectedFeedback, setSelectedFeedback] = useState<Feedback | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Delete State
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const loadFeedbacks = async () => {
    setIsLoading(true);
    try {
      const data = await feedbackService.getAll();
      setFeedbacks(data);
    } catch (error) {
      toast.error("Failed to load feedbacks");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadFeedbacks();
  }, []);

  const handleView = (feedback: Feedback) => {
    setSelectedFeedback(feedback);
    setIsModalOpen(true);
  };

  // --- DELETE HANDLERS ---
  const initiateDelete = (id: string, e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent opening modal when clicking delete
    setDeleteId(id);
  };

  const confirmDelete = async () => {
    if (!deleteId) return;
    try {
      await feedbackService.delete(deleteId);
      toast.success("Feedback deleted successfully");
      loadFeedbacks();
    } catch (error) {
      toast.error("Failed to delete feedback");
    } finally {
      setDeleteId(null);
    }
  };

  const renderStars = (count: number) => (
    <div className="flex">
      {[...Array(5)].map((_, i) => (
        <Star 
          key={i} 
          className={`w-3 h-3 ${i < count ? "fill-yellow-400 text-yellow-400" : "text-gray-300"}`} 
        />
      ))}
    </div>
  );

  const feedbackToDelete = feedbacks.find(f => f.id === deleteId);

  return (
    <>
      <ManagementTable 
        title="Course Feedback" 
        description="Reviews and ratings submitted by students."
        columns={["Date", "Student", "Rating", "Message", "Attachments"]}
        onAddNew={() => {}} 
      >
        {isLoading ? (
          <TableRow><TableCell colSpan={6} className="text-center py-8"><Loader2 className="w-6 h-6 animate-spin mx-auto text-primary"/></TableCell></TableRow>
        ) : feedbacks.length === 0 ? (
          <TableRow><TableCell colSpan={6} className="text-center py-8 text-muted-foreground">No feedback received yet.</TableCell></TableRow>
        ) : (
          feedbacks.map((item) => (
            <TableRow 
              key={item.id} 
              className="cursor-pointer hover:bg-muted/50"
              onClick={() => handleView(item)}
            >
              <TableCell className="whitespace-nowrap text-xs text-muted-foreground">{item.date}</TableCell>
              <TableCell>
                <div className="font-medium">{item.studentName}</div>
                <div className="text-[10px] text-muted-foreground">{item.studentId}</div>
              </TableCell>
              <TableCell>{renderStars(item.rating)}</TableCell>
              <TableCell className="max-w-xs">
                <p className="truncate text-sm text-muted-foreground" title={item.message}>{item.message}</p>
              </TableCell>
              <TableCell>
                <div className="flex gap-2">
                  {item.voiceUrl && (
                    <Badge variant="secondary" className="px-2 h-6 hover:bg-primary hover:text-primary-foreground transition-colors">
                      <Mic className="w-3 h-3 mr-1" /> Voice
                    </Badge>
                  )}
                  {item.attachmentUrl && (
                    <Badge variant="outline" className="px-2 h-6 hover:bg-primary hover:text-primary-foreground transition-colors">
                      <Paperclip className="w-3 h-3 mr-1" /> File
                    </Badge>
                  )}
                </div>
              </TableCell>
              <TableCell className="text-right">
                <div className="flex justify-end gap-2">
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-8 w-8 text-muted-foreground hover:text-primary" 
                    onClick={() => handleView(item)}
                  >
                    <Eye className="w-4 h-4" />
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-8 w-8 text-destructive hover:bg-destructive/10" 
                    onClick={(e) => initiateDelete(item.id, e)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))
        )}
      </ManagementTable>

      <FeedbackDetailModal 
        feedback={selectedFeedback}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />

      {/* Delete Confirmation Dialog */}
      <DeleteConfirmationDialog 
        open={!!deleteId} 
        onOpenChange={(open) => !open && setDeleteId(null)}
        onConfirm={confirmDelete}
        title="Delete Feedback?"
        description="This will permanently remove the student's rating and review. This action cannot be undone."
        itemName={feedbackToDelete ? `Review by ${feedbackToDelete.studentName}` : undefined}
      />
    </>
  );
};