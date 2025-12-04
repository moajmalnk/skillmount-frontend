import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Search, Plus, Pencil, Trash2, BookOpen } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { 
  Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter, DialogTrigger 
} from "@/components/ui/dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { toast } from "sonner";
import { loadFAQs, saveFAQs, faqCategories, FAQ } from "@/lib/faq-data";

export const FAQManager = () => {
  const [faqs, setFaqs] = useState<FAQ[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  
  // Dialog States
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [currentFaq, setCurrentFaq] = useState<FAQ | null>(null);
  
  // Form States
  const [formQuestion, setFormQuestion] = useState("");
  const [formAnswer, setFormAnswer] = useState("");
  const [formCategory, setFormCategory] = useState("");

  useEffect(() => {
    setFaqs(loadFAQs());
  }, []);

  const resetForm = () => {
    setFormQuestion("");
    setFormAnswer("");
    setFormCategory("");
    setCurrentFaq(null);
  };

  const handleCreate = () => {
    if (!formQuestion.trim() || !formAnswer.trim() || !formCategory) {
      toast.error("Please fill in all fields");
      return;
    }

    const newFaq: FAQ = {
      id: `faq-${Date.now()}`,
      question: formQuestion.trim(),
      answer: formAnswer,
      category: formCategory,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const updatedFaqs = [...faqs, newFaq];
    saveFAQs(updatedFaqs);
    setFaqs(updatedFaqs);
    setIsCreateDialogOpen(false);
    resetForm();
    toast.success("FAQ created successfully!");
  };

  const handleEdit = (faq: FAQ) => {
    setCurrentFaq(faq);
    setFormQuestion(faq.question);
    setFormAnswer(faq.answer);
    setFormCategory(faq.category);
    setIsEditDialogOpen(true);
  };

  const handleUpdate = () => {
    if (!currentFaq) return;
    if (!formQuestion.trim() || !formAnswer.trim() || !formCategory) {
      toast.error("Please fill in all fields");
      return;
    }

    const updatedFaq: FAQ = {
      ...currentFaq,
      question: formQuestion.trim(),
      answer: formAnswer,
      category: formCategory,
      updatedAt: new Date().toISOString(),
    };

    const updatedFaqs = faqs.map(faq => faq.id === currentFaq.id ? updatedFaq : faq);
    saveFAQs(updatedFaqs);
    setFaqs(updatedFaqs);
    setIsEditDialogOpen(false);
    resetForm();
    toast.success("FAQ updated successfully!");
  };

  const handleDelete = (id: string) => {
    const updatedFaqs = faqs.filter(faq => faq.id !== id);
    saveFAQs(updatedFaqs);
    setFaqs(updatedFaqs);
    setDeleteId(null);
    toast.success("FAQ deleted successfully!");
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
          {filteredFaqs.length === 0 ? (
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
                      <Button variant="outline" size="icon" onClick={() => setDeleteId(faq.id)}>
                        <Trash2 className="w-4 h-4 text-destructive" />
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
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleUpdate}>Update FAQ</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Alert */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>This action cannot be undone.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => deleteId && handleDelete(deleteId)} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

// Sub-component for the form fields to avoid duplication
const FAQForm = ({ category, setCategory, question, setQuestion, answer, setAnswer, modules }: any) => (
  <div className="space-y-4 py-4">
    <div className="space-y-2">
      <Label>Category</Label>
      <Select value={category} onValueChange={setCategory}>
        <SelectTrigger><SelectValue placeholder="Select category" /></SelectTrigger>
        <SelectContent>
          {faqCategories.map((cat) => (
            <SelectItem key={cat.name} value={cat.name}>{cat.name}</SelectItem>
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