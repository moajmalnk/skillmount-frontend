import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Search, Plus, Pencil, Trash2, BookOpen, Loader2, X } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter, DialogTrigger
} from "@/components/ui/dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { toast } from "sonner";
import { FAQ } from "@/lib/faq-data";
import { faqService } from "@/services/faqService";
import { systemService } from "@/services/systemService";
import { DeleteConfirmationDialog } from "./DeleteConfirmationDialog"; // Import the delete dialog

export const FAQManager = () => {
  const [faqs, setFaqs] = useState<FAQ[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");

  // Store dynamic categories here
  const [categories, setCategories] = useState<string[]>([]);

  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  // Delete State
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const [currentFaq, setCurrentFaq] = useState<FAQ | null>(null);
  const [viewFaq, setViewFaq] = useState<FAQ | null>(null);

  const [formQuestion, setFormQuestion] = useState("");
  const [formAnswer, setFormAnswer] = useState("");
  const [formCategory, setFormCategory] = useState("");

  const loadData = async () => {
    setIsLoading(true);
    try {
      // Fetch FAQs AND Settings in parallel
      const [faqData, settingsData] = await Promise.all([
        faqService.getAll(),
        systemService.getSettings()
      ]);

      setFaqs(faqData);
      setCategories(settingsData.faqCategories || []);

    } catch (error) {
      console.error("Failed to load data", error);
      toast.error("Failed to load data");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const resetForm = () => {
    setFormQuestion("");
    setFormAnswer("");
    setFormCategory("");
    setCurrentFaq(null);
  };

  const handleCreate = async () => {
    if (!formQuestion.trim() || !formAnswer.trim() || !formCategory) {
      toast.error("Please fill in all fields");
      return;
    }

    try {
      await faqService.create({
        question: formQuestion.trim(),
        answer: formAnswer,
        category: formCategory,
      });

      await loadData();
      setIsCreateDialogOpen(false);
      resetForm();
      toast.success("FAQ created successfully!");
    } catch (error) {
      toast.error("Failed to create FAQ.");
    }
  };

  const handleEdit = (faq: FAQ) => {
    setCurrentFaq(faq);
    setFormQuestion(faq.question);
    setFormAnswer(faq.answer);
    setFormCategory(faq.category);
    setIsEditDialogOpen(true);
  };

  const handleUpdate = async () => {
    if (!currentFaq) return;
    if (!formQuestion.trim() || !formAnswer.trim() || !formCategory) {
      toast.error("Please fill in all fields");
      return;
    }

    try {
      await faqService.update(currentFaq.id, {
        question: formQuestion.trim(),
        answer: formAnswer,
        category: formCategory,
      });

      await loadData();
      setIsEditDialogOpen(false);
      resetForm();
      toast.success("FAQ updated successfully!");
    } catch (error) {
      toast.error("Failed to update FAQ.");
    }
  };

  // --- DELETE HANDLER ---
  const confirmDelete = async () => {
    if (!deleteId) return;
    try {
      await faqService.delete(deleteId);
      await loadData();
      toast.success("FAQ deleted successfully!");
    } catch (error) {
      toast.error("Failed to delete FAQ.");
    } finally {
      setDeleteId(null);
    }
  };

  const filteredFaqs = (Array.isArray(faqs) ? faqs : []).filter(faq => {
    const matchesSearch = faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      faq.answer.toLowerCase().includes(searchQuery.toLowerCase()) ||
      faq.category.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCategory = categoryFilter === "all" || faq.category === categoryFilter;

    return matchesSearch && matchesCategory;
  });

  const quillModules = {
    toolbar: [
      [{ 'header': [1, 2, 3, false] }],
      ['bold', 'italic', 'underline', 'strike'],
      [{ 'list': 'ordered' }, { 'list': 'bullet' }],
      [{ 'color': [] }, { 'background': [] }],
      ['link', 'code-block'],
      ['clean']
    ],
  };

  // Helper to get item name for dialog
  const faqToDelete = faqs.find(f => f.id === deleteId);

  // Computed Filter Options (Configured + Existing)
  const filterOptions = ["all", ...new Set([
    ...categories,
    ...(Array.isArray(faqs) ? faqs : []).map(f => f.category)
  ])].sort();

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
                placeholder="Search FAQs..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>

            {/* Category Filter */}
            <div className="w-full md:w-[180px]">
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  {filterOptions.map((cat) => (
                    <SelectItem key={cat} value={cat} className="capitalize">{cat === 'all' ? 'All Categories' : cat}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Reset Filters */}
            {(searchQuery || categoryFilter !== 'all') && (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => { setSearchQuery(""); setCategoryFilter("all"); }}
                title="Reset Filters"
              >
                <X className="w-4 h-4" />
              </Button>
            )}

            {/* Add Button */}
            <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
              <DialogTrigger asChild>
                <Button onClick={resetForm} className="shrink-0">
                  <Plus className="w-4 h-4 mr-2" />
                  Add FAQ
                </Button>
              </DialogTrigger>
              <DialogContent className="modal-admin-uniform">
                <DialogHeader className="modal-header-standard">
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <DialogTitle>Create New FAQ</DialogTitle>
                      <DialogDescription>Add a new frequently asked question.</DialogDescription>
                    </div>
                    <Button variant="ghost" size="icon" onClick={() => setIsCreateDialogOpen(false)} className="h-8 w-8 text-muted-foreground">
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                </DialogHeader>
                <div className="modal-body-standard">
                  <FAQForm
                    category={formCategory} setCategory={setFormCategory}
                    question={formQuestion} setQuestion={setFormQuestion}
                    answer={formAnswer} setAnswer={setFormAnswer}
                    modules={quillModules}
                    categories={categories}
                  />
                </div>
                <DialogFooter className="modal-footer-standard">
                  <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>Cancel</Button>
                  <Button onClick={handleCreate}>Create FAQ</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </CardContent>
      </Card>

      {/* 2. FAQ List Card */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[50%]">Question</TableHead>
                <TableHead className="w-[20%]">Category</TableHead>
                <TableHead className="w-[15%]">Updated</TableHead>
                <TableHead className="w-[15%] text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i}>
                    <TableCell><Skeleton className="h-5 w-40" /></TableCell>
                    <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                    <TableCell className="text-right"><Skeleton className="h-8 w-16 ml-auto" /></TableCell>
                  </TableRow>
                ))
              ) : filteredFaqs.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="h-24 text-center text-muted-foreground">
                    {searchQuery ? "No FAQs match your search" : "No FAQs yet. Create your first one!"}
                  </TableCell>
                </TableRow>
              ) : (
                filteredFaqs.map((faq) => (
                  <TableRow
                    key={faq.id}
                    className="cursor-pointer hover:bg-muted/50"
                    onClick={() => setViewFaq(faq)}
                  >
                    <TableCell>
                      <div className="font-medium truncate max-w-[400px]" title={faq.question}>{faq.question}</div>
                      <div className="text-sm text-muted-foreground truncate max-w-[400px] opacity-70 mt-1" dangerouslySetInnerHTML={{ __html: faq.answer.replace(/<[^>]+>/g, '') }} />
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="font-normal">{faq.category}</Badge>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {new Date(faq.updatedAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">

                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={(e) => { e.stopPropagation(); handleEdit(faq); }}
                          className="h-8 w-8 text-muted-foreground hover:text-primary"
                        >
                          <Pencil className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={(e) => { e.stopPropagation(); setDeleteId(faq.id); }}
                          className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
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

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="modal-admin-uniform">
          <DialogHeader className="modal-header-standard">
            <div className="flex items-start justify-between">
              <DialogTitle>Edit FAQ</DialogTitle>
              <Button variant="ghost" size="icon" onClick={() => setIsEditDialogOpen(false)} className="h-8 w-8 text-muted-foreground">
                <X className="w-4 h-4" />
              </Button>
            </div>
          </DialogHeader>
          <div className="modal-body-standard">
            <FAQForm
              category={formCategory} setCategory={setFormCategory}
              question={formQuestion} setQuestion={setFormQuestion}
              answer={formAnswer} setAnswer={setFormAnswer}
              modules={quillModules}
              categories={categories}
            />
          </div>
          <DialogFooter className="modal-footer-standard">
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleUpdate}>Update FAQ</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Details Dialog */}
      <Dialog open={!!viewFaq} onOpenChange={(open) => !open && setViewFaq(null)}>
        <DialogContent className="modal-admin-uniform">
          <DialogHeader className="modal-header-standard">
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <div className="flex items-center gap-2 mb-2">
                  <Badge variant="secondary" className="px-2 py-0.5 rounded-full text-[10px] uppercase font-bold tracking-wider">{viewFaq?.category}</Badge>
                  <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-tight">
                    Updated {viewFaq?.updatedAt ? new Date(viewFaq.updatedAt).toLocaleDateString() : 'N/A'}
                  </span>
                </div>
                <DialogTitle className="text-xl sm:text-2xl pt-2 leading-tight">{viewFaq?.question}</DialogTitle>
              </div>
              <Button variant="ghost" size="icon" onClick={() => setViewFaq(null)} className="h-8 w-8 text-muted-foreground">
                <X className="w-4 h-4" />
              </Button>
            </div>
          </DialogHeader>
          <div className="modal-body-standard">
            <div className="prose prose-sm dark:prose-invert max-w-none bg-muted/5 p-6 rounded-2xl border border-border/50 shadow-inner">
              <div dangerouslySetInnerHTML={{ __html: viewFaq?.answer || "" }} />
            </div>
          </div>
          <DialogFooter className="modal-footer-standard">
            <Button onClick={() => setViewFaq(null)} className="px-8 font-medium">Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <DeleteConfirmationDialog
        open={!!deleteId}
        onOpenChange={(open) => !open && setDeleteId(null)}
        onConfirm={confirmDelete}
        itemName={faqToDelete?.question}
        description="This will permanently delete this question from the help center. This action cannot be undone."
      />
    </div>
  );
};

// Sub-component
const FAQForm = ({ category, setCategory, question, setQuestion, answer, setAnswer, modules, categories }: any) => (
  <div className="space-y-4 py-4">
    <div className="space-y-2">
      <Label>Category</Label>
      <Select value={category} onValueChange={setCategory}>
        <SelectTrigger><SelectValue placeholder="Select category" /></SelectTrigger>
        <SelectContent>
          {categories.map((cat: string) => (
            <SelectItem key={cat} value={cat}>{cat}</SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
    <div className="space-y-2">
      <Label>Question</Label>
      <Input placeholder="Enter question..." value={question} onChange={(e) => setQuestion(e.target.value)} />
    </div>
    <div className="space-y-2">
      <Label>Answer</Label>
      <div className="border border-border rounded-md">
        <ReactQuill theme="snow" value={answer} onChange={setAnswer} modules={modules} className="bg-background" />
      </div>
    </div>
  </div>
);