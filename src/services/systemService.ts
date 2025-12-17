import api from "@/lib/api";
import { toast } from "sonner";

export interface SystemSettings {
  batches: string[];
  mentors: string[];
  coordinators: string[];
  topics: string[];
  platforms: string[];
  macros: string[];
  faqCategories: string[]; // Note: Backend sends 'faq_categories', we might need to map it or align naming
}

// Fallback defaults in case DB is empty
const DEFAULT_SETTINGS: SystemSettings = {
  batches: ["Sep 2025", "Aug 2025", "July 2025"],
  mentors: ["Dr. Alan Grant"],
  coordinators: ["Sarah Wilson"],
  topics: ["WordPress", "React", "SEO"],
  platforms: ["YouTube", "Instagram"],
  macros: ["Please clear your cache."],
  faqCategories: ["General", "Technical"]
};

export const systemService = {
  // 1. GET SETTINGS
  getSettings: async (): Promise<SystemSettings> => {
    try {
      const response = await api.get('/admin/settings/');
      
      // The backend returns snake_case (faq_categories), frontend wants camelCase (faqCategories)
      // We map the response manually to keep types safe
      const data = response.data;
      
      return {
        batches: data.batches || [],
        mentors: data.mentors || [],
        coordinators: data.coordinators || [],
        topics: data.topics || [],
        platforms: data.platforms || [],
        macros: data.macros || [],
        faqCategories: data.faq_categories || [] // Mapping backend 'faq_categories' to frontend 'faqCategories'
      };
    } catch (error) {
      console.error("Failed to load settings from server", error);
      // Fallback to defaults to prevent app crash
      return DEFAULT_SETTINGS;
    }
  },

  // 2. UPDATE SETTINGS
  updateSettings: async (newSettings: SystemSettings): Promise<void> => {
    try {
        // Map back to snake_case for Django
        const payload = {
            ...newSettings,
            faq_categories: newSettings.faqCategories
        };
      
      await api.post('/admin/settings/', payload);
      // Toast is usually handled by the component, but we can log success here
      console.log("Settings synced with server");
    } catch (error) {
      console.error("Failed to save settings", error);
      toast.error("Could not save settings to server.");
      throw error;
    }
  }
};