import { useState, useEffect } from "react";
import { Table, TableCell, TableRow, TableHead, TableHeader, TableBody } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Star, Mic, Paperclip, Trash2, Loader2, Search, X, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { feedbackService } from "@/services/feedbackService";
import { Feedback } from "@/types/feedback";
import { FeedbackDetailModal } from "./FeedbackDetailModal";
import { DeleteConfirmationDialog } from "./DeleteConfirmationDialog";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { systemService } from "@/services/systemService";
import { Card, CardContent } from "@/components/ui/card";
import { FeedbackCreateDialog } from "./FeedbackCreateDialog";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

export const FeedbackManager = () => {
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [ratingFilter, setRatingFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [categories, setCategories] = useState<string[]>([]);

  // Modal State
  const [selectedFeedback, setSelectedFeedback] = useState<Feedback | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(10);

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
    const loadCategories = async () => {
      try {
        const settings = await systemService.getSettings();
        if (settings.feedbackCategories) {
          setCategories(settings.feedbackCategories);
        }
      } catch (e) {
        console.error("Failed to load categories");
      }
    };

    loadFeedbacks();
    loadCategories();
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

  const filteredFeedbacks = (Array.isArray(feedbacks) ? feedbacks : []).filter(item => {
    const matchesSearch = item.studentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.message.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesRating = ratingFilter === "all" || item.rating.toString() === ratingFilter;
    const matchesCategory = categoryFilter === "all" || item.category === categoryFilter;

    return matchesSearch && matchesRating && matchesCategory;
  });

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, ratingFilter, categoryFilter]);

  // Pagination calculations
  const totalCount = filteredFeedbacks.length;
  const totalPages = Math.ceil(totalCount / pageSize);
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const paginatedFeedbacks = filteredFeedbacks.slice(startIndex, endIndex);

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const feedbackToDelete = feedbacks.find(f => f.id === deleteId);

  return (
    <div className="space-y-4">
      {/* 1. Filter Card */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search student or message..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>

            {/* Rating Filter */}
            <div className="w-full md:w-[150px]">
              <Select value={ratingFilter} onValueChange={setRatingFilter}>
                <SelectTrigger>
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
            </div>

            {/* Category Filter */}
            <div className="w-full md:w-[180px]">
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Topics</SelectItem>
                  {categories.map(cat => (
                    <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                  ))}
                  {!categories.includes("Other") && <SelectItem value="Other">Other</SelectItem>}
                </SelectContent>
              </Select>
            </div>

            {/* Reset Filters */}
            {(searchQuery || ratingFilter !== 'all' || categoryFilter !== 'all') && (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => { setSearchQuery(""); setRatingFilter("all"); setCategoryFilter("all"); }}
                title="Reset Filters"
              >
                <X className="w-4 h-4" />
              </Button>
            )}

            <Button onClick={() => setIsCreateOpen(true)} className="shrink-0">
              <Plus className="w-4 h-4 mr-2" /> Add Feedback
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* 2. Data Card */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[120px]">Date</TableHead>
                <TableHead className="w-[180px]">Student</TableHead>
                <TableHead className="w-[120px]">Category</TableHead>
                <TableHead className="w-[100px]">Rating</TableHead>
                <TableHead>Message</TableHead>
                <TableHead className="w-[100px]">Visibility</TableHead>
                <TableHead className="w-[100px] text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={7} className="h-24 text-center">
                    <div className="flex justify-center items-center gap-2 text-muted-foreground">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Loading Feedback...</span>
                    </div>
                  </TableCell>
                </TableRow>
              ) : filteredFeedbacks.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="h-24 text-center text-muted-foreground">
                    No matching feedback found.
                  </TableCell>
                </TableRow>
              ) : (
                paginatedFeedbacks.map((item) => (
                  <TableRow
                    key={item.id}
                    className="cursor-pointer hover:bg-muted/50"
                    onClick={() => handleView(item)}
                  >
                    <TableCell className="text-xs text-muted-foreground whitespace-nowrap">{item.date}</TableCell>
                    <TableCell>
                      <div className="font-medium truncate max-w-[160px]" title={item.studentName}>{item.studentName}</div>
                      <div className="text-[10px] text-muted-foreground truncate max-w-[160px]" title={item.studentId}>
                        {item.studentId}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="text-[10px] truncate max-w-[100px] block text-center font-normal">
                        {item.category}
                      </Badge>
                    </TableCell>
                    <TableCell>{renderStars(item.rating)}</TableCell>
                    <TableCell>
                      <div className="truncate text-sm text-foreground/80 font-medium max-w-[300px]" title={item.message}>{item.message}</div>
                      <div className="flex gap-2 mt-1.5 opacity-70">
                        {item.voiceUrl && <Mic className="w-3 h-3 text-primary" />}
                        {item.attachmentUrl && <Paperclip className="w-3 h-3 text-primary" />}
                      </div>
                    </TableCell>
                    <TableCell>
                      {item.isPublic ? (
                        <Badge variant="default" className="bg-green-600/90 hover:bg-green-700 text-[10px] py-0 px-2 font-normal">Public</Badge>
                      ) : (
                        <Badge variant="secondary" className="text-[10px] py-0 px-2 font-normal">Private</Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">

                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                          onClick={(e) => initiateDelete(item.id, e)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Pagination Controls */}
      {totalCount > 0 && (
        <div className="mt-6 pb-4">
          <Pagination className="justify-end">
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious
                  onClick={() => handlePageChange(currentPage - 1)}
                  className={currentPage <= 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                />
              </PaginationItem>

              <PaginationItem>
                <span className="flex h-9 min-w-9 items-center justify-center text-sm font-medium px-4">
                  Page {currentPage} of {Math.max(1, totalPages)}
                </span>
              </PaginationItem>

              <PaginationItem>
                <PaginationNext
                  onClick={() => handlePageChange(currentPage + 1)}
                  className={currentPage >= totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      )}

      <FeedbackDetailModal
        feedback={selectedFeedback}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onUpdate={loadFeedbacks}
      />

      <FeedbackCreateDialog
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onSuccess={loadFeedbacks}
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
    </div>
  );
};