import api from "@/lib/api";
import { Ticket } from "@/types/ticket";
import { toast } from "sonner";

export const ticketService = {
  // 1. GET ALL TICKETS (Filtered by User Role automatically by Backend)
  getAll: async (params?: Record<string, any>): Promise<any> => {
    try {
      const response = await api.get('/tickets/', { params });
      return response.data;
    } catch (error) {
      console.error("Failed to load tickets", error);
      throw error;
    }
  },

  // 2. GET SINGLE TICKET DETAILS
  getById: async (id: string): Promise<Ticket | null> => {
    try {
      const response = await api.get<Ticket>(`/tickets/${id}/`);
      return response.data;
    } catch (error) {
      console.error("Failed to load ticket details", error);
      return null;
    }
  },

  // 3. CREATE TICKET
  // Returns the created Ticket ID for friendly confirmation
  create: async (data: any): Promise<string | null> => {
    try {
      const formData = new FormData();
      formData.append('title', data.title || data.subject);
      formData.append('description', data.description);
      formData.append('priority', data.priority);
      formData.append('category', data.category || "General");

      if (data.attachment) {
        formData.append('attachment', data.attachment);
      }
      if (data.voiceNote) {
        const mimeType = data.voiceNote.type || '';
        let ext = 'wav';
        if (mimeType.includes('webm')) ext = 'webm';
        else if (mimeType.includes('mp4')) ext = 'mp4';

        formData.append('voice_note', data.voiceNote, `ticket_voice.${ext}`);
      }

      const response = await api.post('/tickets/', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      return (response.data as any)?.id ?? null;
    } catch (error) {
      console.error("Ticket creation failed", error);
      throw error;
    }
  },

  // 4. REPLY TO TICKET
  reply: async (
    ticketId: string,
    message: string,
    voiceBlob?: Blob,
    attachment?: File
  ): Promise<void> => {
    try {
      const formData = new FormData();
      formData.append('message', message);

      if (voiceBlob) {
        const mimeType = voiceBlob.type || '';
        let ext = 'wav';
        if (mimeType.includes('webm')) ext = 'webm';
        else if (mimeType.includes('mp4')) ext = 'mp4';

        formData.append('voice_note', voiceBlob, `reply_voice.${ext}`);
      }

      if (attachment) {
        formData.append('attachment', attachment);
      }

      await api.post(`/tickets/${ticketId}/reply/`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
    } catch (error) {
      console.error("Reply failed", error);
      throw error;
    }
  },

  // 5. UPDATE STATUS (Close/Reopen)
  updateStatus: async (id: string, status: 'Closed' | 'Reopened' | 'Open'): Promise<void> => {
    try {
      await api.post(`/tickets/${id}/update-status/`, { status });
      toast.success(`Ticket marked as ${status}`);
    } catch (error) {
      console.error("Status update failed", error);
      throw error;
    }
  },

  // 6. DELETE TICKET
  delete: async (id: string): Promise<void> => {
    try {
      await api.delete(`/tickets/${id}/`);
    } catch (error) {
      console.error("Delete failed", error);
      throw error;
    }
  },

  // 7. ASSIGN TICKET
  assign: async (ticketId: string, userId: number | null): Promise<void> => {
    try {
      await api.post(`/tickets/${ticketId}/assign/`, { user_id: userId });
      toast.success(userId ? "Ticket assigned" : "Ticket unassigned");
    } catch (error) {
      console.error("Assignment failed", error);
      throw error;
    }
  },
};