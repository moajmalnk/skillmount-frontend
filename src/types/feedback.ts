export interface Feedback {
  id: string;
  studentId: string;
  studentName: string;
  studentAvatar?: string | null;
  rating: number;
  message: string;
  date: string;
  status: "New" | "Read" | "Replied";

  // Changed from boolean to string (URL)
  attachmentUrl?: string | null;
  voiceUrl?: string | null;

  category?: string;
  isPublic?: boolean;
  adminReply?: string;
}