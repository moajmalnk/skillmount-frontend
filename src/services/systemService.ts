export interface SystemSettings {
  batches: string[];
  mentors: string[];
  coordinators: string[];
  topics: string[];
  platforms: string[];
  macros: string[];
  faqCategories: string[];
}

// UPDATED: Changed key to 'v2' to force fresh data load
const STORAGE_KEY = "skillmount_settings_v2";

const delay = (ms: number) => new Promise((res) => setTimeout(res, ms));

const DEFAULT_SETTINGS: SystemSettings = {
  // The list you provided
  batches: [
    "Sep 2025", 
    "Aug 2025", 
    "July 2025", 
    "June 2025", 
    "May 2025", 
    "April 2025", 
    "March 2025"
  ],
  mentors: ["Dr. Smith", "Prof. Jane Doe"],
  coordinators: ["Sarah Wilson", "Mike Ross"],
  topics: ["WordPress", "React", "SEO", "Digital Marketing", "UI/UX Design", "E-commerce", "Python"],
  platforms: ["YouTube", "Instagram", "LinkedIn", "Facebook", "Twitter"],
  macros: [
    "We are looking into your issue.",
    "Please clear your browser cache and try again.",
    "Can you please provide a screenshot?",
    "This issue has been resolved.",
    "Thank you for your patience."
  ],
  faqCategories: [
    "WordPress Setup & Hosting",
    "Elementor Page Builder",
    "Divi Page Builder",
    "Theme Customization",
    "Responsive Design",
    "Plugin Management",
    "WooCommerce & E-commerce",
    "SEO & Performance",
    "Course Information",
    "Certification & Placement"
  ]
};

export const systemService = {
  getSettings: async (): Promise<SystemSettings> => {
    await delay(500);
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
        const parsed = JSON.parse(stored);
        // Fallback: If stored batches is empty, use default
        if(!parsed.batches || parsed.batches.length === 0) {
            return { ...parsed, batches: DEFAULT_SETTINGS.batches };
        }
        return parsed;
    }
    
    localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_SETTINGS));
    return DEFAULT_SETTINGS;
  },

  updateSettings: async (newSettings: SystemSettings): Promise<void> => {
    await delay(500);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newSettings));
  }
};