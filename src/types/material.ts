export type MaterialType = "Video" | "Theme" | "Plugin" | "Snippet" | "Asset";

export interface Material {
  id: string;
  title: string;
  type: MaterialType;
  category: string;
  url: string;
  description?: string;
  lastUpdated: string;
  
  // Video specific
  embedUrl?: string;
  duration?: string;
  topics?: string[];

  // Snippet specific
  code?: string;
  language?: string;

  // Asset/Theme/Plugin specific
  size?: string;
  version?: string;
  features?: string[];
  fileCount?: number;
  formats?: string[];
  pages?: number;
}