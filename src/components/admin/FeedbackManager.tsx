import { useState, useEffect } from "react";
import { ManagementTable } from "@/components/admin/ManagementTable";
import { TableCell, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Star, Mic, Paperclip, Trash2, Loader2, Eye, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { feedbackService } from "@/services/feedbackService";
import { Feedback } from "@/types/feedback";
import { FeedbackDetailModal } from "./FeedbackDetailModal";
import { DeleteConfirmationDialog } from "./DeleteConfirmationDialog";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export const FeedbackManager = () => {
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [ratingFilter, setRatingFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");

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
    e.stopPropagation();
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

  const filteredFeedbacks = feedbacks.filter(item => {
    const matchesSearch = item.studentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.message.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesRating = ratingFilter === "all" || item.rating.toString() === ratingFilter;
    const matchesCategory = categoryFilter === "all" || item.category === categoryFilter;

    return matchesSearch && matchesRating && matchesCategory;
  });

  const feedbackToDelete = feedbacks.find(f => f.id === deleteId);

  return (
    <>
      <ManagementTable
        title="Course Feedback"
        description="Reviews and ratings submitted by students."
        columns={["Date", "Student", "Category", "Rating", "Message", "Visibility"]}
        filters={
          <div className="flex gap-2">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search student or message..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8 h-9 bg-background"
              />
            </div>
            <Select value={ratingFilter} onValueChange={setRatingFilter}>
              <SelectTrigger className="w-[120px] h-9 bg-background">
                <SelectValue placeholder="Rating" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Ratings</SelectItem>
                <SelectItem value="5">5 Stars</SelectItem>
                <SelectItem value="4">4 Stars</SelectItem>
                <SelectItem value="3">3 Stars</SelectItem>
                <SelectItem value="2">2 Stars</SelectItem>
                <SelectItem value="1">1 Star</SelectItem>
              </SelectContent>
            </Select>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-[140px] h-9 bg-background">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Topics</SelectItem>
                <SelectItem value="Content">Content</SelectItem>
                <SelectItem value="Platform">Platform</SelectItem>
                <SelectItem value="Support">Support</SelectItem>
                <SelectItem value="Other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>
        }
      >


        {isLoading ? (
          <TableRow><TableCell colSpan={7} className="text-center py-8"><Loader2 className="w-6 h-6 animate-spin mx-auto text-primary" /></TableCell></TableRow>
        ) : filteredFeedbacks.length === 0 ? (
          <TableRow><TableCell colSpan={7} className="text-center py-8 text-muted-foreground">No matching feedback found.</TableCell></TableRow>
        ) : (
          filteredFeedbacks.map((item) => (
            <TableRow
              key={item.id}
              className="cursor-pointer hover:bg-muted/50"
              onClick={() => handleView(item)}
            >
              <TableCell className="w-[12%] text-xs text-muted-foreground whitespace-nowrap">{item.date}</TableCell>
              <TableCell className="w-[18%]">
                <div className="font-medium">{item.studentName}</div>
                <div className="text-[10px] text-muted-foreground">{item.studentId}</div>
              </TableCell>
              <TableCell className="w-[12%]">
                <Badge variant="outline" className="text-[10px]">{item.category}</Badge>
              </TableCell>
              <TableCell className="w-[12%]">{renderStars(item.rating)}</TableCell>
              <TableCell className="w-[24%]">
                <p className="truncate text-sm text-muted-foreground" title={item.message}>{item.message}</p>
                <div className="flex gap-1 mt-1">
                  {item.voiceUrl && <Mic className="w-3 h-3 text-primary" />}
                  {item.attachmentUrl && <Paperclip className="w-3 h-3 text-primary" />}
                </div>
              </TableCell>
              <TableCell className="w-[10%]">
                {item.isPublic ? (
                  <Badge variant="default" className="bg-green-600 hover:bg-green-700 text-[10px]">Public</Badge>
                ) : (
                  <Badge variant="secondary" className="text-[10px]">Private</Badge>
                )}
              </TableCell>
              <TableCell className="w-[12%] text-right">
                <div className="flex justify-end gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-muted-foreground hover:text-primary"
                    onClick={(e) => { e.stopPropagation(); handleView(item); }}
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
        onUpdate={loadFeedbacks}
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