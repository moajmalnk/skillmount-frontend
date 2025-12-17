import { useState, useEffect } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetFooter } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import { BlogPost } from "@/types/blog";
import { blogService } from "@/services/blogService";
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
    category: "",
    tags: [],
    isFeatured: false,
    isEditorsPick: false,
    isPublished: false,
    author: { name: "Admin", role: "Editor" } // Default
  });

  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [availableAuthors, setAvailableAuthors] = useState<User[]>([]);
  const [selectedAuthorId, setSelectedAuthorId] = useState<string>("");

  // Fetch available authors (admins and tutors) when sheet opens
  useEffect(() => {
    if (isOpen) {
      const fetchAuthors = async () => {
        try {
          const [admins, tutors] = await Promise.all([
            userService.getElementsByRole('super_admin'),
            userService.getElementsByRole('tutor')
          ]);
          const allAuthors = [...admins, ...tutors];
          setAvailableAuthors(allAuthors);
          
          // Set default author to current user if available, or first author
          if (allAuthors.length > 0 && !selectedAuthorId) {
            setSelectedAuthorId(allAuthors[0].id);
          }
        } catch (error) {
          console.error("Failed to fetch authors", error);
        }
      };
      fetchAuthors();
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
        category: "",
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

    // Auto-generate slug if missing
    const slug = formData.slug || formData.title.toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, '');

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
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent className="w-full sm:max-w-3xl p-0 flex flex-col">
        <SheetHeader className="p-6 border-b">
          <SheetTitle>{blog ? "Edit Post" : "New Blog Post"}</SheetTitle>
        </SheetHeader>

        <ScrollArea className="flex-1 p-6">
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Title</Label>
                <Input value={formData.title} onChange={e => setFormData({ ...formData, title: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Slug (URL)</Label>
                <Input value={formData.slug} onChange={e => setFormData({ ...formData, slug: e.target.value })} placeholder="auto-generated" />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Excerpt</Label>
              <Textarea value={formData.excerpt} onChange={e => setFormData({ ...formData, excerpt: e.target.value })} />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Category</Label>
                <Input value={formData.category} onChange={e => setFormData({ ...formData, category: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Author</Label>
                <Select value={selectedAuthorId} onValueChange={setSelectedAuthorId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select author" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableAuthors.map((author) => (
                      <SelectItem key={author.id} value={author.id}>
                        {author.name} ({author.role === 'super_admin' ? 'Admin' : 'Tutor'})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Tags (Comma separated)</Label>
              <Input
                value={formData.tags?.join(', ') || ''}
                onChange={e => setFormData({ ...formData, tags: e.target.value.split(',').map(t => t.trim()) })}
                placeholder="React, Tutorial, Guide"
              />
            </div>

            <div className="space-y-2">
              <Label>Cover Image</Label>
              <div className="flex flex-col gap-2">
                <Input
                  type="file"
                  accept="image/*"
                  onChange={e => e.target.files?.[0] && setCoverFile(e.target.files[0])}
                />
                {formData.coverImage && typeof formData.coverImage === 'string' && (
                  <p className="text-xs text-muted-foreground">Current: {formData.coverImage}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 p-4 bg-muted/30 rounded-lg">
              <div className="flex items-center justify-between">
                <Label>Featured Post</Label>
                <Switch checked={formData.isFeatured} onCheckedChange={c => setFormData({ ...formData, isFeatured: c })} />
              </div>
              <div className="flex items-center justify-between">
                <Label>Editor's Pick</Label>
                <Switch checked={formData.isEditorsPick} onCheckedChange={c => setFormData({ ...formData, isEditorsPick: c })} />
              </div>
              <div className="flex items-center justify-between">
                <Label>Published</Label>
                <Switch checked={formData.isPublished} onCheckedChange={c => setFormData({ ...formData, isPublished: c })} />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Content</Label>
              <div className="h-[400px] pb-12">
                <ReactQuill
                  theme="snow"
                  value={formData.content}
                  onChange={c => setFormData({ ...formData, content: c })}
                  className="h-full"
                />
              </div>
            </div>
          </div>
        </ScrollArea>

        <SheetFooter className="p-6 border-t">
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={handleSave}>Save Post</Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
};