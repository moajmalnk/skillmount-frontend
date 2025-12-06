import { formatBatchForDisplay } from "@/lib/batches";

export interface Project {
  name: string;
  description: string;
  tech: string[];
  link: string;
  image: string;
  featured: boolean;
}

export interface StudentProfileData {
  id: number;
  name: string;
  batchId: string;
  batch: string;
  bio: string;
  domain: string;
  github: string;
  email: string;
  phone: string;
  skills: string[];
  isTopPerformer: boolean;
  location: string;
  joinDate: string;
  experience: string;
  achievements: string[];
  projects: Project[];
}

// Mock Data Fetcher
export const getStudentProfile = (id: string | undefined): StudentProfileData | null => {
  // In a real app, fetch by ID. Here we return a static mock that matches the design.
  const batchId = "0925"; // September 2025
  
  return {
    id: Number(id) || 1,
    name: "Alex Johnson",
    batchId: batchId,
    batch: formatBatchForDisplay(batchId),
    bio: "Passionate WordPress developer with expertise in building custom themes and e-commerce solutions. Experienced in Elementor, WooCommerce, and website optimization. Love creating accessible and user-friendly websites.",
    domain: "https://moajmalnk.in",
    github: "https://github.com/alexj",
    email: "alex@example.com",
    phone: "+1234567890",
    skills: ["WordPress", "Elementor", "WooCommerce", "Security & Backup", "E-commerce", "Accessibility"],
    isTopPerformer: true,
    location: "Kerala, India",
    joinDate: "September 2025",
    experience: "2+ Years",
    achievements: [
      "Best Project Award - Batch 14",
      "Placed at Google with $95,000 package",
      "Contributed to 5+ open source projects"
    ],
    projects: [
      {
        name: "E-Commerce Platform",
        description: "Custom WooCommerce solution with advanced payment integration and modern UI design",
        tech: ["WordPress", "WooCommerce", "Elementor", "SEO Optimization"],
        link: "https://moajmalnk.in/project1",
        image: "/tutor-hero.jpg",
        featured: true
      },
      {
        name: "Business Website",
        description: "Professional business website with custom theme design and performance optimization",
        tech: ["WordPress", "Custom Theme Design", "Gutenberg"],
        link: "https://moajmalnk.in/project2",
        image: "/tutor-hero.jpg",
        featured: false
      },
      {
        name: "Portfolio Website",
        description: "Fast and accessible portfolio website with advanced optimization and modern animations",
        tech: ["WordPress", "Speed Optimization", "Accessibility"],
        link: "https://moajmalnk.in/project3",
        image: "/tutor-hero.jpg",
        featured: false
      }
    ]
  };
};