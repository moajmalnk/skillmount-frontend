import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Search, Plus, Pencil, Trash2, BookOpen, Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
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
  
  // Store dynamic categories here
  const [categories, setCategories] = useState<string[]>([]);
  
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  
  // Delete State
  const [deleteId, setDeleteId] = useState<string | null>(null);
  
  const [currentFaq, setCurrentFaq] = useState<FAQ | null>(null);
  
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

  const filteredFaqs = faqs.filter(faq =>
    faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
    faq.answer.toLowerCase().includes(searchQuery.toLowerCase()) ||
    faq.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const quillModules = {
    toolbar: [
      [{ 'header': [1, 2, 3, false] }],
      ['bold', 'italic', 'underline', 'strike'],
      [{ 'list': 'ordered'}, { 'list': 'bullet' }],
      [{ 'color': [] }, { 'background': [] }],
      ['link', 'code-block'],
      ['clean']
    ],
  };

  // Helper to get item name for dialog
  const faqToDelete = faqs.find(f => f.id === deleteId);

  return (
    <div className="space-y-6">
      {/* Action Bar */}
      <div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search FAQs..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={resetForm}>
              <Plus className="w-4 h-4 mr-2" />
              Add New FAQ
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Create New FAQ</DialogTitle>
              <DialogDescription>Add a new frequently asked question.</DialogDescription>
            </DialogHeader>
            <FAQForm 
              category={formCategory} setCategory={setFormCategory}
              question={formQuestion} setQuestion={setFormQuestion}
              answer={formAnswer} setAnswer={setFormAnswer}
              modules={quillModules}
              categories={categories}
            />
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>Cancel</Button>
              <Button onClick={handleCreate}>Create FAQ</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* FAQ List */}
      <Card>
        <CardHeader>
          <CardTitle>All FAQs ({filteredFaqs.length})</CardTitle>
          <CardDescription>Manage your frequently asked questions</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
             <div className="flex justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
             </div>
          ) : filteredFaqs.length === 0 ? (
            <div className="text-center py-12">
              <BookOpen className="w-16 h-16 mx-auto mb-4 text-muted-foreground opacity-50" />
              <p className="text-muted-foreground">
                 {searchQuery ? "No FAQs match your search" : "No FAQs yet. Create your first one!"}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredFaqs.map((faq) => (
                <div key={faq.id} className="p-4 border border-border rounded-lg hover:bg-muted/50 transition-colors">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary">{faq.category}</Badge>
                        <span className="text-xs text-muted-foreground">Updated {new Date(faq.updatedAt).toLocaleDateString()}</span>
                      </div>
                      <h3 className="font-semibold text-lg">{faq.question}</h3>
                      <div className="text-sm text-muted-foreground line-clamp-2 prose prose-sm max-w-none" dangerouslySetInnerHTML={{ __html: faq.answer }} />
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="icon" onClick={() => handleEdit(faq)}>
                        <Pencil className="w-4 h-4" />
                      </Button>
                      <Button 
                        variant="outline" 
                        size="icon" 
                        onClick={() => setDeleteId(faq.id)}
                        className="text-destructive hover:bg-destructive/10 border-destructive/20"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit FAQ</DialogTitle>
          </DialogHeader>
          <FAQForm 
            category={formCategory} setCategory={setFormCategory}
            question={formQuestion} setQuestion={setFormQuestion}
            answer={formAnswer} setAnswer={setFormAnswer}
            modules={quillModules}
            categories={categories}
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleUpdate}>Update FAQ</Button>
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