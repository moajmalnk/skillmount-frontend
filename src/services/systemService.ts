import api from "@/lib/api";
import { toast } from "sonner";

export interface MacroItem {
  title: string;
  description: string;
  dateAdded?: string;
}

export interface SystemSettings {
  batches: string[];
  mentors: string[];
  coordinators: string[];
  topics: string[];
  platforms: string[];
  macros: MacroItem[];
  faqCategories: string[];
  ticketCategories: string[];
  blogCategories: string[];
  materialCategories: string[];
  feedbackCategories: string[];
}

// Fallback defaults in case DB is empty
const DEFAULT_SETTINGS: SystemSettings = {
  batches: ["Sep 2025", "Aug 2025", "July 2025"],
  mentors: ["Dr. Alan Grant"],
  coordinators: ["Sarah Wilson"],
  topics: ["WordPress", "React", "SEO"],
  platforms: ["YouTube", "Instagram"],
  macros: [{ title: "Cache Clear", description: "Please clear your browser cache and try again." }],
  faqCategories: ["General", "Technical"],
  ticketCategories: ["General", "Technical", "Billing"],
  blogCategories: ["Tech", "News", "Tutorials"],
  materialCategories: ["Themes", "Plugins", "Snippets"],
  feedbackCategories: ["General", "Bug Report", "Feature Request", "Content Issue", "Other"]
};

export const systemService = {
  // 1. GET SETTINGS
  getSettings: async (): Promise<SystemSettings> => {
    try {
      const response = await api.get('/admin/settings/', {
        headers: { 'x-skip-auth': 'true' }
      });

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
        faqCategories: data.faq_categories || [],
        ticketCategories: data.ticket_categories || [],
        blogCategories: data.blog_categories || [],
        materialCategories: data.material_categories || [],
        feedbackCategories: data.feedback_categories || []
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
        faq_categories: newSettings.faqCategories,
        ticket_categories: newSettings.ticketCategories,
        blog_categories: newSettings.blogCategories,
        material_categories: newSettings.materialCategories,
        feedback_categories: newSettings.feedbackCategories
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