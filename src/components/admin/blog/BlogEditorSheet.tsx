import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { X } from "lucide-react";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import { BlogPost } from "@/types/blog";
import { blogService } from "@/services/blogService";
import { systemService } from "@/services/systemService";
import { userService } from "@/services/userService";
import { User } from "@/types/user";
import { toast } from "sonner";

interface BlogEditorSheetProps {
  isOpen: boolean;
  onClose: () => void;
  blog: BlogPost | null;
  onSave: () => void;
}

export const BlogEditorSheet = ({ isOpen, onClose, blog, onSave }: BlogEditorSheetProps) => {
  const [formData, setFormData] = useState<Partial<BlogPost>>({
    title: "",
    slug: "",
    excerpt: "",
    content: "",
    coverImage: "",
    categories: [],
    tags: [],
    isFeatured: false,
    isEditorsPick: false,
    isPublished: false,
    author: { name: "Admin", role: "Editor" } // Default
  });

  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [availableAuthors, setAvailableAuthors] = useState<User[]>([]);
  const [availableCategories, setAvailableCategories] = useState<string[]>([]);
  const [selectedAuthorId, setSelectedAuthorId] = useState<string>("");

  // Fetch available authors (admins and tutors) when sheet opens
  useEffect(() => {
    if (isOpen) {
      const fetchData = async () => {
        try {
          const [admins, tutors, settings] = await Promise.all([
            userService.getElementsByRole('super_admin'),
            userService.getElementsByRole('tutor'),
            systemService.getSettings()
          ]);
          const allAuthors = [...admins, ...tutors];
          setAvailableAuthors(allAuthors);
          setAvailableCategories(settings.blogCategories || []);

          // Set default author to current user if available, or first author
          if (allAuthors.length > 0 && !selectedAuthorId) {
            setSelectedAuthorId(allAuthors[0].id);
          }
        } catch (error) {
          console.error("Failed to fetch data", error);
        }
      };
      fetchData();
    }
  }, [isOpen]);

  useEffect(() => {
    setCoverFile(null); // Reset file
    if (blog) {
      setFormData(blog);
      // Set selected author ID from blog author
      if (blog.author && (blog.author as any).id) {
        setSelectedAuthorId((blog.author as any).id);
      } else if (blog.author && (blog.author as any).name) {
        // Try to find author by name if ID not available
        const author = availableAuthors.find(a => a.name === (blog.author as any).name);
        if (author) {
          setSelectedAuthorId(author.id);
        }
      }
    } else {
      // Reset
      setFormData({
        title: "",
        slug: "",
        excerpt: "",
        content: "",
        coverImage: "",
        categories: [],
        tags: [],
        isFeatured: false,
        isEditorsPick: false,
        isPublished: false,
        author: { name: "Admin", role: "Editor" }
      });
      // Reset to first available author or empty
      if (availableAuthors.length > 0) {
        setSelectedAuthorId(availableAuthors[0].id);
      } else {
        setSelectedAuthorId("");
      }
    }
  }, [blog, isOpen, availableAuthors]);

  const handleSave = async () => {
    if (!formData.title || !formData.content) {
      toast.error("Title and Content are required");
      return;
    }

    // Let backend handle slug generation if empty (ensures uniqueness)
    const slug = formData.slug;

    // Calculate Read Time
    const wordCount = formData.content.split(/\s+/).length;
    const readMinutes = Math.max(1, Math.ceil(wordCount / 200));

    const payload = {
      ...formData,
      slug,
      readTime: `${readMinutes} min read`,
      authorId: selectedAuthorId || undefined, // Send author_id to backend
      coverImageFile: coverFile || undefined // Pass file
    } as any; // Cast to any because BlogPost type doesn't have coverImageFile

    try {
      await blogService.save(payload, blog?.slug);
      toast.success(blog ? "Blog updated!" : "Blog published!");
      onSave();
    } catch (error) {
      toast.error("Failed to save");
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="modal-admin-uniform">
        <DialogHeader className="modal-header-standard">
          <div className="flex items-start justify-between">
            <DialogTitle className="text-2xl">{blog ? "Edit Post" : "Create New Blog Post"}</DialogTitle>
            <Button variant="ghost" size="icon" onClick={onClose} className="h-8 w-8 text-muted-foreground">
              <X className="w-4 h-4" />
            </Button>
          </div>
        </DialogHeader>

        <ScrollArea className="flex-1">
          <div className="p-8 space-y-8 max-w-4xl mx-auto">
            {/* Title & Slug */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label className="text-xs uppercase font-bold text-muted-foreground tracking-wider">Post Title</Label>
                <Input value={formData.title} onChange={e => setFormData({ ...formData, title: e.target.value })} placeholder="Enter catchy title..." className="h-11" />
              </div>
              <div className="space-y-2">
                <Label className="text-xs uppercase font-bold text-muted-foreground tracking-wider">URL Slug</Label>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground font-mono">/blog/</span>
                  <Input value={formData.slug} onChange={e => setFormData({ ...formData, slug: e.target.value })} placeholder="auto-generated" className="h-11 font-mono text-sm" />
                </div>
              </div>
            </div>

            {/* Excerpt */}
            <div className="space-y-2">
              <Label className="text-xs uppercase font-bold text-muted-foreground tracking-wider">Short Excerpt / Summary</Label>
              <Textarea value={formData.excerpt} onChange={e => setFormData({ ...formData, excerpt: e.target.value })} placeholder="Brief summary for list view..." className="min-h-[80px] resize-none" />
            </div>

            {/* Meta Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label className="text-xs uppercase font-bold text-muted-foreground tracking-wider">Primary Categories</Label>
                <div className="flex flex-wrap gap-2 mb-3 min-h-[32px] p-2 bg-muted/30 rounded-lg border border-border/50">
                  {formData.categories && formData.categories.length > 0 ? (
                    formData.categories.map(cat => (
                      <Badge key={cat} variant="secondary" className="gap-1.5 py-1 pl-2.5 pr-1.5 group hover:bg-destructive hover:text-white transition-all cursor-pointer" onClick={() => {
                        const newCats = formData.categories?.filter(c => c !== cat) || [];
                        setFormData({ ...formData, categories: newCats });
                      }}>
                        {cat} <X size={12} className="opacity-50 group-hover:opacity-100" />
                      </Badge>
                    ))
                  ) : (
                    <span className="text-xs text-muted-foreground italic px-2">No categories selected</span>
                  )}
                </div>
                <Select value="" onValueChange={(val) => {
                  const current = formData.categories || [];
                  if (val && !current.includes(val)) {
                    setFormData({ ...formData, categories: [...current, val] });
                  }
                }}>
                  <SelectTrigger className="h-11">
                    <SelectValue placeholder="Add Category..." />
                  </SelectTrigger>
                  <SelectContent>
                    {availableCategories.map((cat) => (
                      <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="text-xs uppercase font-bold text-muted-foreground tracking-wider">Assign Author</Label>
                <Select value={selectedAuthorId} onValueChange={setSelectedAuthorId}>
                  <SelectTrigger className="h-11">
                    <SelectValue placeholder="Select author" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableAuthors.map((author) => (
                      <SelectItem key={author.id} value={author.id}>
                        <div className="flex flex-col">
                          <span className="font-medium">{author.name}</span>
                          <span className="text-[10px] text-muted-foreground uppercase">{author.role.replace('_', ' ')}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Tags & Image */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label className="text-xs uppercase font-bold text-muted-foreground tracking-wider">Tags (Comma separated)</Label>
                <Input
                  value={formData.tags?.join(', ') || ''}
                  onChange={e => setFormData({ ...formData, tags: e.target.value.split(',').map(t => t.trim()).filter(Boolean) })}
                  placeholder="React, Tutorial, Tips"
                  className="h-11"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-xs uppercase font-bold text-muted-foreground tracking-wider">Cover Image</Label>
                <div className="flex flex-col gap-2">
                  <div className="flex gap-2">
                    <Input
                      type="file"
                      id="cover-upload"
                      accept="image/*"
                      className="hidden"
                      onChange={e => e.target.files?.[0] && setCoverFile(e.target.files[0])}
                    />
                    <Button variant="outline" className="flex-1 h-11 border-dashed" asChild>
                      <label htmlFor="cover-upload" className="cursor-pointer">
                        {coverFile ? coverFile.name : (formData.coverImage ? "Change Cover Image" : "Upload Cover Image")}
                      </label>
                    </Button>
                    {(coverFile || formData.coverImage) && (
                      <Button variant="ghost" size="icon" className="h-11 w-11 shrink-0" onClick={() => { setCoverFile(null); setFormData({ ...formData, coverImage: "" }); }}>
                        <X size={16} />
                      </Button>
                    )}
                  </div>
                  {formData.coverImage && typeof formData.coverImage === 'string' && !coverFile && (
                    <p className="text-[10px] text-muted-foreground truncate px-1">Current: {formData.coverImage}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Settings toggles */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-5 bg-muted/30 rounded-2xl border border-border/50">
              <div className="flex items-center justify-between gap-4">
                <div className="space-y-0.5">
                  <Label className="text-xs font-bold">Featured</Label>
                  <p className="text-[10px] text-muted-foreground">Show in slider</p>
                </div>
                <Switch checked={formData.isFeatured} onCheckedChange={c => setFormData({ ...formData, isFeatured: c })} />
              </div>
              <div className="flex items-center justify-between gap-4 sm:border-x border-border/40 sm:px-4">
                <div className="space-y-0.5">
                  <Label className="text-xs font-bold">Editor's Pick</Label>
                  <p className="text-[10px] text-muted-foreground">Curated section</p>
                </div>
                <Switch checked={formData.isEditorsPick} onCheckedChange={c => setFormData({ ...formData, isEditorsPick: c })} />
              </div>
              <div className="flex items-center justify-between gap-4">
                <div className="space-y-0.5">
                  <Label className="text-xs font-bold">Published</Label>
                  <p className="text-[10px] text-muted-foreground">Live on site</p>
                </div>
                <Switch checked={formData.isPublished} onCheckedChange={c => setFormData({ ...formData, isPublished: c })} />
              </div>
            </div>

            {/* Editor */}
            <div className="space-y-3">
              <Label className="text-xs uppercase font-bold text-muted-foreground tracking-wider">Post Content</Label>
              <div className="min-h-[500px] pb-14 bg-background border border-border rounded-xl overflow-hidden shadow-inner">
                <ReactQuill
                  theme="snow"
                  value={formData.content}
                  onChange={c => setFormData({ ...formData, content: c })}
                  className="h-full border-none"
                  modules={{
                    toolbar: [
                      [{ 'header': [1, 2, 3, false] }],
                      ['bold', 'italic', 'underline', 'strike', 'blockquote'],
                      [{ 'list': 'ordered' }, { 'list': 'bullet' }],
                      ['link', 'image', 'code-block'],
                      ['clean']
                    ],
                  }}
                />
              </div>
            </div>
          </div>
        </ScrollArea>

        <DialogFooter className="modal-footer-standard">
          <Button variant="ghost" onClick={onClose} className="px-8 font-medium hover:bg-muted">Cancel</Button>
          <Button onClick={handleSave} className="min-w-[140px] shadow-lg shadow-primary/20 font-semibold px-10">
            {blog ? "Update Post" : "Publish Post"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};