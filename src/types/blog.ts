import { User } from "./user";

export interface BlogPost {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  content: string; // HTML content
  coverImage: string;
  category: string;
  tags: string[];
  author: {
    name: string;
    avatar?: string;
    role: string;
  };
  publishedDate: string;
  readTime: string; // e.g., "5 min read"
  isFeatured?: boolean; // For the big hero card
  isEditorsPick?: boolean; // For the special badge
  isPublished?: boolean; // Visibility status
  views?: number;
}