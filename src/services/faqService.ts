import { FAQ } from "@/types/faq";
import { defaultFAQs } from "@/lib/faq-data"; // Keep your mock data source

const STORAGE_KEY = 'skillmount_faqs';

// Simulate API delay
const delay = (ms: number) => new Promise(res => setTimeout(res, ms));

export const faqService = {
  // GET ALL (Student & Admin)
  getAll: async (): Promise<FAQ[]> => {
    await delay(500); // Fake loading
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) return JSON.parse(stored);
    
    // Initialize with defaults if empty
    localStorage.setItem(STORAGE_KEY, JSON.stringify(defaultFAQs));
    return defaultFAQs;
  },

  // CREATE (Admin)
  create: async (faq: Omit<FAQ, 'id' | 'createdAt' | 'updatedAt'>): Promise<FAQ> => {
    await delay(800);
    const newFaq: FAQ = {
      ...faq,
      id: `faq-${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    
    const current = await faqService.getAll();
    const updated = [newFaq, ...current];
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    return newFaq;
  },

  // UPDATE (Admin)
  update: async (id: string, data: Partial<FAQ>): Promise<FAQ> => {
    await delay(800);
    const current = await faqService.getAll();
    const updated = current.map(item => 
      item.id === id 
        ? { ...item, ...data, updatedAt: new Date().toISOString() } 
        : item
    );
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    return updated.find(i => i.id === id)!;
  },

  // DELETE (Admin)
  delete: async (id: string): Promise<boolean> => {
    await delay(500);
    const current = await faqService.getAll();
    const updated = current.filter(item => item.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    return true;
  }
};