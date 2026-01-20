import api from "@/lib/api";
import { FAQ } from "@/types/faq";
import { toast } from "sonner";

// Helper to map backend fields
const transformFAQ = (data: any): FAQ => ({
  id: data.id,
  question: data.question,
  answer: data.answer,
  category: data.category,
  createdAt: data.created_at || data.createdAt,
  updatedAt: data.updated_at || data.updatedAt
});

export const faqService = {
  // 1. GET ALL FAQs (Public)
  getAll: async (): Promise<FAQ[]> => {
    try {
      const response = await api.get<any[]>('/faqs/');
      return response.data.map(transformFAQ);
    } catch (error) {
      console.error("Failed to load FAQs", error);
      return [];
    }
  },

  // 2. CREATE FAQ (Admin)
  create: async (data: Partial<FAQ>): Promise<void> => {
    try {
      await api.post('/faqs/', data);
      toast.success("FAQ created successfully");
    } catch (error) {
      console.error("Create failed", error);
      throw error;
    }
  },

  // 3. UPDATE FAQ (Admin)
  update: async (id: string, data: Partial<FAQ>): Promise<void> => {
    try {
      await api.patch(`/faqs/${id}/`, data);
      toast.success("FAQ updated");
    } catch (error) {
      console.error("Update failed", error);
      throw error;
    }
  },

  // 4. DELETE FAQ (Admin)
  delete: async (id: string): Promise<void> => {
    try {
      await api.delete(`/faqs/${id}/`);
      toast.success("FAQ deleted");
    } catch (error) {
      console.error("Delete failed", error);
      throw error;
    }
  }
};