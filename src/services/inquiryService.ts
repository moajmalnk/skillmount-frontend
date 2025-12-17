import api from "@/lib/api";
import { toast } from "sonner";

export interface Inquiry {
  id: string;
  name: string;
  email: string;
  phone: string;
  message: string;
  date: string;
  status: "New" | "Read" | "Replied";
  subject?: string;
}

export const inquiryService = {
  // 1. GET ALL (Admin)
  getAll: async (): Promise<Inquiry[]> => {
    try {
      const response = await api.get<Inquiry[]>('/inquiries/');
      return response.data;
    } catch (error) {
      console.error("Failed to load inquiries", error);
      return [];
    }
  },

  // 2. CREATE (Public - Contact Form)
  create: async (data: Partial<Inquiry>): Promise<void> => {
    try {
      await api.post('/inquiries/', data);
      // Success toast handled by component
    } catch (error) {
      console.error("Failed to send inquiry", error);
      throw error;
    }
  },

  // 3. MARK AS READ (Admin)
  markAsRead: async (id: string): Promise<void> => {
    try {
      await api.patch(`/inquiries/${id}/`, { status: 'Read' });
    } catch (error) {
      console.error("Update failed", error);
    }
  },

  // 3.5 REPLY (Admin)
  reply: async (id: string, message: string): Promise<void> => {
    try {
      await api.post(`/inquiries/${id}/reply/`, { message });
      toast.success("Reply sent successfully");
    } catch (error) {
      console.error("Reply failed", error);
      throw error;
    }
  },

  // 4. DELETE (Admin)
  delete: async (id: string): Promise<void> => {
    try {
      await api.delete(`/inquiries/${id}/`);
    } catch (error) {
      console.error("Delete failed", error);
      throw error;
    }
  }
};