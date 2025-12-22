export type MaterialType = "Video" | "Theme" | "Plugin" | "Snippet" | "Asset";

export interface Material {
  id: string;
  title: string;
  type: MaterialType;
  category: string;
  url: string; // Computed URL (File or External)
  externalUrl?: string; // Raw generic URL
  is_file?: boolean;
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
  previewUrl?: string; // For live demo
  features?: string[];
  fileCount?: number;
  formats?: string[];
  pages?: number;
}