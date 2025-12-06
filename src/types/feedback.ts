export interface Feedback {
  id: string;
  studentId: string;
  studentName: string;
  rating: number;
  message: string;
  date: string;
  status: "New" | "Reviewed";
  
  // Changed from boolean to string (URL)
  attachmentUrl?: string | null; 
  voiceUrl?: string | null;      
}