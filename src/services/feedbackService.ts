import api from "@/lib/api";
import { Feedback } from "@/types/feedback";
import { toast } from "sonner";

export const feedbackService = {
  // 1. GET ALL
  getAll: async (): Promise<Feedback[]> => {
    try {
      const response = await api.get<any>('/feedbacks/');
      const data = response.data.results || response.data;

      if (!Array.isArray(data)) return [];

      // Map Backend (Snake) -> Frontend (Camel) structure
      const mappedData: Feedback[] = data.map((item: any) => ({
        id: item.id.toString(),
        studentId: item.student ? item.student.toString() : 'N/A', // student ID from FK
        studentName: item.student_name || 'Anonymous',
        studentAvatar: item.student_avatar,
        rating: item.rating,
        message: item.message,
        date: item.date,
        status: item.status || 'New', // Use real status
        category: item.category || 'Other',
        attachmentUrl: item.attachment,
        voiceUrl: item.voice_note,
        isPublic: item.is_public,
        adminReply: item.admin_reply
      }));

      return mappedData;
    } catch (error) {
      console.error("Failed to load feedbacks", error);
      return [];
    }
  },

  // 1b. GET PUBLIC TESTIMONIALS
  getPublicTestimonials: async (): Promise<Feedback[]> => {
    try {
      const response = await api.get<any>('/feedbacks/?is_public=true');
      const data = response.data.results || response.data;

      if (!Array.isArray(data)) return [];

      return data.map((item: any) => ({
        id: item.id.toString(),
        studentId: item.student ? item.student.toString() : 'N/A',
        studentName: item.student_name || 'Anonymous',
        studentAvatar: item.student_avatar,
        rating: item.rating,
        message: item.message,
        date: item.date,
        status: item.status || 'New',
        category: item.category || 'Other',
        attachmentUrl: item.attachment,
        voiceUrl: item.voice_note,
        isPublic: item.is_public,
        adminReply: item.admin_reply
      }));
    } catch (error) {
      console.error("Failed to load public testimonials", error);
      return [];
    }
  },

  // 2. CREATE FEEDBACK (Multipart)
  create: async (data: any): Promise<void> => {
    try {
      const formData = new FormData();
      formData.append('rating', data.rating);
      formData.append('message', data.message);
      formData.append('category', data.category || 'Other');

      // Handle Attachments
      if (data.hasAttachment && data.attachment) {
        formData.append('attachment', data.attachment);
      }
      if (data.hasVoiceNote && data.voiceNote) {
        // Voice blobs need a filename with correct extension
        const mimeType = data.voiceNote.type || '';
        let extension = 'wav'; // Fallback

        if (mimeType.includes('webm')) extension = 'webm';
        else if (mimeType.includes('mp4')) extension = 'mp4';
        else if (mimeType.includes('ogg')) extension = 'ogg';

        formData.append('voice_note', data.voiceNote, `voice_feedback.${extension}`);
      }

      await api.post('/feedbacks/', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

    } catch (error) {
      console.error("Feedback submission failed", error);
      throw error;
    }
  },

  // 3. TOGGLE PUBLIC (Admin)
  togglePublic: async (id: string, isPublic: boolean): Promise<void> => {
    try {
      await api.patch(`/feedbacks/${id}/`, { is_public: isPublic });
      toast.success(`Feedback is now ${isPublic ? 'Public' : 'Private'}`);
    } catch (error) {
      console.error("Toggle failed", error);
      throw error;
    }
  },

  // 4. ADMIN REPLY
  reply: async (id: string, message: string): Promise<void> => {
    try {
      // Use the specific custom action endpoint
      await api.patch(`/feedbacks/${id}/reply/`, { admin_reply: message });
      toast.success("Reply saved");
    } catch (error) {
      console.error("Reply failed", error);
      throw error;
    }
  },

  // 5. DELETE
  delete: async (id: string): Promise<void> => {
    try {
      await api.delete(`/feedbacks/${id}/`);
    } catch (error) {
      console.error("Delete failed", error);
      throw error;
    }
  }
};