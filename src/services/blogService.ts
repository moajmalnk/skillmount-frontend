import api from "@/lib/api";
import { BlogPost } from "@/types/blog";
import { toast } from "sonner";

// Helper to map Backend Snake_Case -> Frontend CamelCase
const transformBlog = (data: any): BlogPost => ({
  id: data.id,
  slug: data.slug,
  title: data.title,
  excerpt: data.excerpt,
  content: data.content,
  coverImage: data.cover_image,
  categories: data.categories || [],
  tags: data.tags,
  author: data.author,
  publishedDate: data.date, // Map date -> publishedDate
  readTime: data.readTime,
  isFeatured: data.is_featured,
  isEditorsPick: data.is_editors_pick,
  isPublished: data.is_published,
  views: data.views,
});

export const blogService = {
  // 1. GET ALL POSTS
  getAll: async (): Promise<BlogPost[]> => {
    try {
      const response = await api.get<any>('/blogs/');
      const data = response.data.results || response.data;

      if (!Array.isArray(data)) return [];
      return data.map(transformBlog);
    } catch (error) {
      console.error("Failed to fetch blogs", error);
      return [];
    }
  },

  // 2. GET SINGLE POST (By Slug)
  getBySlug: async (slug: string): Promise<BlogPost | null> => {
    try {
      const response = await api.get<any>(`/blogs/${slug}/`);
      return transformBlog(response.data);
    } catch (error) {
      console.error("Blog not found", error);
      return null;
    }
  },

  // 3. CREATE / UPDATE (Multipart)
  save: async (post: Partial<BlogPost> & { coverImageFile?: File }, originalSlug?: string): Promise<void> => {
    try {
      const formData = new FormData();

      // Append fields
      Object.keys(post).forEach(key => {
        if (key === 'coverImage' || key === 'coverImageFile' || key === 'author' || key === 'date' || key === 'readTime' || key === 'publishedDate' || key === 'views') return;

        const value = (post as any)[key];
        if (value === undefined || value === null) return;

        // Map Keys to Snake Case for Backend
        let backendKey = key;
        if (key === 'isFeatured') backendKey = 'is_featured';
        if (key === 'isEditorsPick') backendKey = 'is_editors_pick';
        if (key === 'isPublished') backendKey = 'is_published';
        if (key === 'authorId') backendKey = 'author_id';

        if ((key === 'tags' || key === 'categories') && Array.isArray(value)) {
          // JSON Stringify tags/categories array for backend JSONField
          formData.append(key, JSON.stringify(value));
        } else {
          formData.append(backendKey, value.toString());
        }
      });

      // (author_id is handled in the loop above)

      // Append File if exists
      if (post.coverImageFile) {
        formData.append('cover_image', post.coverImageFile);
      }

      if (post.id) {
        // Update (Use Slug for ID in URL)
        // Use originalSlug if provided, otherwise fallback to post.slug
        const slugToUse = originalSlug || post.slug;
        await api.patch(`/blogs/${slugToUse}/`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        toast.success("Post updated successfully");
      } else {
        // Create
        await api.post('/blogs/', formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        toast.success("Post created successfully");
      }
    } catch (error) {
      console.error("Failed to save post", error);
      throw error;
    }
  },

  // 4. DELETE
  delete: async (slug: string): Promise<void> => {
    try {
      await api.delete(`/blogs/${slug}/`);
    } catch (error) {
      console.error("Delete failed", error);
      throw error;
    }
  }
};