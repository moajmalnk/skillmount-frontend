import { BlogPost } from "@/types/blog";

const STORAGE_KEY = "skillmount_blogs";
const delay = (ms: number) => new Promise((res) => setTimeout(res, ms));

const MOCK_BLOGS: BlogPost[] = [
  {
    id: "BLOG-001",
    slug: "future-of-ai-in-education",
    title: "The Future of AI in Education: Transforming Learning",
    excerpt: "Discover how artificial intelligence is revolutionizing the education sector, from personalized learning paths to intelligent tutoring systems.",
    content: `
      <h2>The AI Revolution in Classrooms</h2>
      <p>Artificial Intelligence is no longer a futuristic concept; it's here, and it's reshaping how we learn. From <strong>adaptive learning platforms</strong> that adjust to a student's pace to AI-powered tutors available 24/7, the landscape of education is evolving rapidly.</p>
      <blockquote>"AI doesn't replace teachers—it amplifies their impact by handling repetitive tasks and providing data-driven insights."</blockquote>
      <h3>Personalized Learning Paths</h3>
      <p>One of the most significant benefits is personalization. Traditional classrooms often struggle to cater to 30 different learning speeds. AI algorithms can analyze a student's performance in real-time and curate a unique curriculum that targets their weak points while accelerating their strengths.</p>
    `,
    coverImage: "https://images.unsplash.com/photo-1620712943543-bcc4688e7485?auto=format&fit=crop&q=80&w=2000",
    category: "AI & Machine Learning",
    tags: ["EdTech", "Artificial Intelligence", "Future"],
    author: {
      name: "Dr. Alan Grant",
      role: "Senior Instructor",
      avatar: "https://randomuser.me/api/portraits/men/32.jpg"
    },
    publishedDate: "2025-10-28",
    readTime: "8 min read",
    isFeatured: true,
    isEditorsPick: true,
    views: 1250
  },
  {
    id: "BLOG-002",
    slug: "mastering-web-development-2025",
    title: "Mastering Web Development: A Complete Roadmap for 2025",
    excerpt: "A comprehensive guide to becoming a full-stack developer in 2025. Learn the essential technologies, frameworks, and best practices.",
    content: "<p>Web development is moving fast...</p>",
    coverImage: "https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&q=80&w=2000",
    category: "Web Development",
    tags: ["React", "Next.js", "Career"],
    author: {
      name: "Sarah Williams",
      role: "Tech Lead",
      avatar: "https://randomuser.me/api/portraits/women/44.jpg"
    },
    publishedDate: "2025-10-25",
    readTime: "12 min read",
    isFeatured: false,
    views: 980
  },
  {
    id: "BLOG-003",
    slug: "building-your-first-robot",
    title: "Building Your First Robot: A Beginner's Journey",
    excerpt: "Step into the exciting world of robotics! This guide walks you through building your first robot from scratch.",
    content: "<p>Robotics is the intersection of code and physical reality...</p>",
    coverImage: "https://images.unsplash.com/photo-1485827404703-89b55fcc595e?auto=format&fit=crop&q=80&w=2000",
    category: "Robotics",
    tags: ["Hardware", "IoT", "Beginner"],
    author: {
      name: "Alex Johnson",
      role: "Student Mentor",
      avatar: ""
    },
    publishedDate: "2025-10-20",
    readTime: "10 min read",
    isFeatured: false,
    views: 450
  }
];

export const blogService = {
  getAll: async (): Promise<BlogPost[]> => {
    await delay(500);
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) return JSON.parse(stored);
    
    localStorage.setItem(STORAGE_KEY, JSON.stringify(MOCK_BLOGS));
    return MOCK_BLOGS;
  },

  getBySlug: async (slug: string): Promise<BlogPost | undefined> => {
    const blogs = await blogService.getAll();
    return blogs.find(b => b.slug === slug);
  },

  create: async (blog: Omit<BlogPost, "id" | "publishedDate" | "views">): Promise<void> => {
    await delay(800);
    const blogs = await blogService.getAll();
    const newBlog: BlogPost = {
      ...blog,
      id: `BLOG-${Date.now()}`,
      publishedDate: new Date().toISOString().split('T')[0],
      views: 0
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify([newBlog, ...blogs]));
  },

  update: async (id: string, data: Partial<BlogPost>): Promise<void> => {
    await delay(500);
    const blogs = await blogService.getAll();
    const updated = blogs.map(b => b.id === id ? { ...b, ...data } : b);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  },

  delete: async (id: string): Promise<void> => {
    await delay(500);
    const blogs = await blogService.getAll();
    const updated = blogs.filter(b => b.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  }
};