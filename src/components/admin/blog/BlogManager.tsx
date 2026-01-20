import { useState, useEffect } from "react";
import { Table, TableCell, TableRow, TableHead, TableHeader, TableBody } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Edit2, Trash2, Eye, Loader2, Search, Plus, X } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
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

  // Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

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

  const filteredBlogs = blogs.filter(blog => {
    const matchesSearch = blog.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      blog.categories.some(cat => cat.toLowerCase().includes(searchQuery.toLowerCase())) ||
      blog.author.name.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = statusFilter === "all" ||
      (statusFilter === "published" && blog.isPublished) ||
      (statusFilter === "draft" && !blog.isPublished);

    return matchesSearch && matchesStatus;
  });

  const blogToDelete = blogs.find(b => b.id === deleteId);

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
                placeholder="Search posts..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>

            {/* Status Filter */}
            <div className="w-full md:w-[150px]">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="published">Published</SelectItem>
                  <SelectItem value="draft">Draft</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Reset Filters */}
            {(searchQuery || statusFilter !== 'all') && (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => { setSearchQuery(""); setStatusFilter("all"); }}
                title="Reset Filters"
              >
                <X className="w-4 h-4" />
              </Button>
            )}

            {/* Add Button */}
            <Button onClick={handleCreate} className="shrink-0">
              <Plus className="w-4 h-4 mr-2" />
              Add Post
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* 2. Blog List Card */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Author</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8">
                    <div className="flex justify-center items-center gap-2">
                      <Loader2 className="w-6 h-6 animate-spin text-primary" />
                      <span>Loading Posts...</span>
                    </div>
                  </TableCell>
                </TableRow>
              ) : filteredBlogs.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                    No blog posts found. Create your first one!
                  </TableCell>
                </TableRow>
              ) : (
                filteredBlogs.map((blog) => (
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
                      <Badge variant="outline" className="text-[10px] sm:text-xs font-normal">
                        {blog.categories.join(", ")}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-xs sm:text-sm text-muted-foreground py-4">{blog.author.name}</TableCell>
                    <TableCell className="py-4">
                      {blog.isPublished ? (
                        <Badge variant="default" className="bg-emerald-500/15 text-emerald-600 hover:bg-emerald-500/25 border-emerald-500/20 font-normal">
                          Published
                        </Badge>
                      ) : (
                        <Badge variant="secondary" className="font-normal text-muted-foreground">
                          Draft
                        </Badge>
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
            </TableBody>
          </Table>
        </CardContent>
      </Card>

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
    </div>
  );
};