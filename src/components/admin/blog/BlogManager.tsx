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

export const BlogManager = () => {
  const [blogs, setBlogs] = useState<BlogPost[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [selectedBlog, setSelectedBlog] = useState<BlogPost | null>(null);

  const loadBlogs = async () => {
    setIsLoading(true);
    const data = await blogService.getAll();
    setBlogs(data);
    setIsLoading(false);
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

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this post?")) {
      await blogService.delete(id);
      toast.success("Post deleted");
      loadBlogs();
    }
  };

  const handleSave = async () => {
    setIsSheetOpen(false);
    loadBlogs();
  };

  return (
    <>
      <ManagementTable
        title="Blog Posts"
        description="Manage your articles and insights."
        // FIXED: Removed "Actions" from this array to prevent duplicate headers
        columns={["Title", "Category", "Author", "Status"]}
        onAddNew={handleCreate}
      >
        {isLoading ? (
          <TableRow><TableCell colSpan={5} className="text-center py-8"><Loader2 className="w-6 h-6 animate-spin mx-auto" /></TableCell></TableRow>
        ) : (
          blogs.map((blog) => (
            <TableRow key={blog.id}>
              <TableCell className="font-medium">
                <div className="flex flex-col">
                    <span className="line-clamp-1">{blog.title}</span>
                    <div className="flex gap-2 mt-1">
                        {blog.isFeatured && <Badge variant="outline" className="text-[10px] bg-blue-50 text-blue-700 border-blue-200">Featured</Badge>}
                        {blog.isEditorsPick && <Badge variant="outline" className="text-[10px] bg-green-50 text-green-700 border-green-200">Editor's Pick</Badge>}
                    </div>
                </div>
              </TableCell>
              <TableCell><Badge variant="secondary">{blog.category}</Badge></TableCell>
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
                  <Button variant="ghost" size="icon" className="text-destructive" onClick={() => handleDelete(blog.id)}>
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
    </>
  );
};