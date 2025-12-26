import { useState, useEffect } from "react";
import { ManagementTable } from "@/components/admin/ManagementTable";
import { TableCell, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Edit2, Trash2, Eye, Loader2 } from "lucide-react";
import { blogService } from "@/services/blogService";
import { BlogPost } from "@/types/blog";
import { BlogEditorSheet } from "./BlogEditorSheet";
import { toast } from "sonner";
import { DeleteConfirmationDialog } from "../DeleteConfirmationDialog"; // Import the delete dialog

export const BlogManager = () => {
  const [blogs, setBlogs] = useState<BlogPost[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [selectedBlog, setSelectedBlog] = useState<BlogPost | null>(null);

  // Delete State
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const loadBlogs = async () => {
    setIsLoading(true);
    try {
      const data = await blogService.getAll();
      setBlogs(data);
    } catch (error) {
      toast.error("Failed to load blogs");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadBlogs();
  }, []);

  const handleEdit = (blog: BlogPost) => {
    setSelectedBlog(blog);
    setIsSheetOpen(true);
  };

  const handleCreate = () => {
    setSelectedBlog(null);
    setIsSheetOpen(true);
  };

  // --- DELETE HANDLERS ---
  const confirmDelete = async () => {
    if (!deleteId) return;
    const blogToDelete = blogs.find(b => b.id === deleteId);
    if (!blogToDelete) return; // Should not happen

    try {
      await blogService.delete(blogToDelete.slug);
      toast.success("Post deleted successfully");
      loadBlogs();
    } catch (error) {
      toast.error("Failed to delete post");
    } finally {
      setDeleteId(null);
    }
  };

  const handleSave = async () => {
    setIsSheetOpen(false);
    loadBlogs();
  };

  const blogToDelete = blogs.find(b => b.id === deleteId);

  return (
    <>
      <ManagementTable
        title="Blog Posts"
        description="Manage your articles and insights."
        columns={["Title", "Category", "Author", "Status"]}
        onAddNew={handleCreate}
      >
        {isLoading ? (
          <TableRow>
            <TableCell colSpan={5} className="text-center py-8">
              <div className="flex justify-center items-center gap-2">
                <Loader2 className="w-6 h-6 animate-spin text-primary" />
                <span>Loading Posts...</span>
              </div>
            </TableCell>
          </TableRow>
        ) : blogs.length === 0 ? (
          <TableRow>
            <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
              No blog posts found. Create your first one!
            </TableCell>
          </TableRow>
        ) : (
          blogs.map((blog) => (
            <TableRow key={blog.id} className="group hover:bg-muted/30">
              <TableCell className="font-medium min-w-[200px] py-4">
                <div className="flex flex-col">
                  <span className="text-sm sm:text-base line-clamp-1 max-w-[200px] sm:max-w-[400px]" title={blog.title}>{blog.title}</span>
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {blog.isFeatured && (
                      <Badge variant="outline" className="text-[9px] sm:text-[10px] px-1.5 py-0 h-5 leading-none whitespace-nowrap bg-blue-500/10 text-blue-600 border-blue-200/50 rounded-sm font-semibold uppercase tracking-wider">
                        Featured
                      </Badge>
                    )}
                    {blog.isEditorsPick && (
                      <Badge variant="outline" className="text-[9px] sm:text-[10px] px-1.5 py-0 h-5 leading-none whitespace-nowrap bg-emerald-500/10 text-emerald-600 border-emerald-200/50 rounded-sm font-semibold uppercase tracking-wider">
                        Editor's Pick
                      </Badge>
                    )}
                  </div>
                </div>
              </TableCell>
              <TableCell className="py-4">
                <Badge variant="secondary" className="text-[10px] sm:text-xs bg-muted/50 text-muted-foreground font-normal rounded-md">
                  {blog.category}
                </Badge>
              </TableCell>
              <TableCell className="text-xs sm:text-sm text-muted-foreground py-4">{blog.author.name}</TableCell>
              <TableCell className="py-4">
                {blog.isPublished ? (
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] sm:text-xs font-medium bg-emerald-500/10 text-emerald-600 border border-emerald-500/20">
                    Published
                  </span>
                ) : (
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] sm:text-xs font-medium bg-muted/50 text-muted-foreground border border-border">
                    Draft
                  </span>
                )}
              </TableCell>
              <TableCell className="text-right py-4">
                <div className="flex justify-end gap-1 sm:gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 sm:h-9 sm:w-9 text-muted-foreground hover:text-foreground"
                    onClick={() => window.open(`/blog/${blog.slug}`, '_blank')}
                  >
                    <Eye className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 sm:h-9 sm:w-9 text-muted-foreground hover:text-foreground"
                    onClick={() => handleEdit(blog)}
                  >
                    <Edit2 className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 sm:h-9 sm:w-9 text-destructive hover:bg-destructive/10"
                    onClick={() => setDeleteId(blog.id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))
        )}
      </ManagementTable>

      <BlogEditorSheet
        isOpen={isSheetOpen}
        onClose={() => setIsSheetOpen(false)}
        blog={selectedBlog}
        onSave={handleSave}
      />

      <DeleteConfirmationDialog
        open={!!deleteId}
        onOpenChange={(open) => !open && setDeleteId(null)}
        onConfirm={confirmDelete}
        itemName={blogToDelete?.title}
        description="This will permanently delete the blog post and remove it from the public feed."
      />
    </>
  );
};