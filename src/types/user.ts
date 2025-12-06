export type UserRole = "student" | "tutor" | "affiliate" | "super_admin";
export type UserStatus = "Active" | "Inactive" | "Pending";

export interface BaseUser {
  id: string;
  regId?: string;
  name: string;
  email: string;
  phone?: string; // Often used as WhatsApp
  role: UserRole;
  status: UserStatus;
  createdAt: string;
  avatar?: string;
  isProfileComplete?: boolean;
}

// ... (StudentProject, SocialLinks, PlacementData interfaces remain same) ...
export interface StudentProject {
  id: string;
  title: string;
  description: string;
  technologies: string[];
  imageUrl: string;
  demoUrl?: string;
  repoUrl?: string;
  featured?: boolean;
}

export interface SocialLinks {
  linkedin?: string;
  github?: string;
  twitter?: string;
  website?: string;
  behance?: string;
}

export interface PlacementData {
  company: string;
  role?: string;
  package?: string;
  date?: string;
}

export interface Student extends BaseUser {
  role: "student";
  batch: string;
  mentor?: string;
  coordinator?: string;
  
  // -- Onboarding Specific Fields (Added these) --
  dob?: string;
  address?: string;
  pincode?: string;
  qualification?: string;
  aim?: string;
  
  // -- Enhanced Profile Fields --
  headline?: string;
  bio?: string;
  location?: string; // Public display location (e.g. "City, Country")
  
  socials?: SocialLinks;
  
  skills: string[];
  projects: StudentProject[];
  experience?: string;
  
  // -- Admin Controls --
  isTopPerformer?: boolean;
  isFeatured?: boolean;
  achievements?: string[];
  placement?: PlacementData;
}

// ... (Tutor and Affiliate interfaces remain same) ...
export interface Tutor extends BaseUser {
  role: "tutor";
  topics: string[];
}

export interface Affiliate extends BaseUser {
  role: "affiliate";
  couponCode: string;
  platform: string;
  earnings?: number;
}

export type User = Student | Tutor | Affiliate | BaseUser;