import { useState, useEffect } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetFooter } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { ScrollArea } from "@/components/ui/scroll-area";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import { BlogPost } from "@/types/blog";
import { blogService } from "@/services/blogService";
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
    author: { name: "Admin", role: "Editor" } // Default
  });

  useEffect(() => {
    if (blog) {
      setFormData(blog);
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
        author: { name: "Admin", role: "Editor" }
      });
    }
  }, [blog, isOpen]);

  const handleSave = async () => {
    if (!formData.title || !formData.content) {
        toast.error("Title and Content are required");
        return;
    }

    // Auto-generate slug if missing
    const slug = formData.slug || formData.title.toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, '');

    const payload = {
        ...formData,
        slug,
        readTime: "5 min read", // Mock calc
        author: formData.author || { name: "Admin", role: "Editor" }
    } as BlogPost;

    try {
        if (blog) {
            await blogService.update(blog.id, payload);
            toast.success("Blog updated!");
        } else {
            await blogService.create(payload);
            toast.success("Blog published!");
        }
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
                        <Input value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} />
                    </div>
                    <div className="space-y-2">
                        <Label>Slug (URL)</Label>
                        <Input value={formData.slug} onChange={e => setFormData({...formData, slug: e.target.value})} placeholder="auto-generated" />
                    </div>
                </div>

                <div className="space-y-2">
                    <Label>Excerpt</Label>
                    <Textarea value={formData.excerpt} onChange={e => setFormData({...formData, excerpt: e.target.value})} />
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label>Category</Label>
                        <Input value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})} />
                    </div>
                    <div className="space-y-2">
                        <Label>Cover Image URL</Label>
                        <Input value={formData.coverImage} onChange={e => setFormData({...formData, coverImage: e.target.value})} />
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4 p-4 bg-muted/30 rounded-lg">
                    <div className="flex items-center justify-between">
                        <Label>Featured Post</Label>
                        <Switch checked={formData.isFeatured} onCheckedChange={c => setFormData({...formData, isFeatured: c})} />
                    </div>
                    <div className="flex items-center justify-between">
                        <Label>Editor's Pick</Label>
                        <Switch checked={formData.isEditorsPick} onCheckedChange={c => setFormData({...formData, isEditorsPick: c})} />
                    </div>
                </div>

                <div className="space-y-2">
                    <Label>Content</Label>
                    <div className="h-[400px] pb-12">
                        <ReactQuill 
                            theme="snow" 
                            value={formData.content} 
                            onChange={c => setFormData({...formData, content: c})} 
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