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
    try {
      await blogService.delete(deleteId);
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
            <TableRow key={blog.id}>
              <TableCell className="font-medium">
                <div className="flex flex-col">
                  <span className="line-clamp-1 max-w-[300px]" title={blog.title}>{blog.title}</span>
                  <div className="flex gap-2 mt-1">
                    {blog.isFeatured && (
                      <Badge variant="outline" className="text-[10px] bg-blue-50 text-blue-700 border-blue-200">
                        Featured
                      </Badge>
                    )}
                    {blog.isEditorsPick && (
                      <Badge variant="outline" className="text-[10px] bg-green-50 text-green-700 border-green-200">
                        Editor's Pick
                      </Badge>
                    )}
                  </div>
                </div>
              </TableCell>
              <TableCell>
                <Badge variant="secondary">{blog.category}</Badge>
              </TableCell>
              <TableCell>{blog.author.name}</TableCell>
              <TableCell>
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                  Published
                </span>
              </TableCell>
              <TableCell className="text-right">
                <div className="flex justify-end gap-2">
                  <Button variant="ghost" size="icon" onClick={() => window.open(`/blog/${blog.slug}`, '_blank')}>
                    <Eye className="w-4 h-4" />
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => handleEdit(blog)}>
                    <Edit2 className="w-4 h-4" />
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="text-destructive hover:bg-destructive/10" 
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