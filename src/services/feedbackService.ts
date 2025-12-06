import { Feedback } from "@/types/feedback";

const STORAGE_KEY = "skillmount_feedbacks";

const delay = (ms: number) => new Promise((res) => setTimeout(res, ms));

const MOCK_FEEDBACKS: Feedback[] = [
  {
    id: "FDB-001",
    studentId: "STU-001",
    studentName: "Alex Johnson",
    rating: 5,
    message: "The course structure is amazing! I loved the Elementor module.",
    date: "2025-10-20",
    status: "Reviewed",
    attachmentUrl: null,
    voiceUrl: null
  },
  {
    id: "FDB-002",
    studentId: "STU-005",
    studentName: "Sarah Williams",
    rating: 4,
    message: "Great content, but I wish the audio quality on the live sessions was a bit better. Listen to my recording.",
    date: "2025-10-22",
    status: "New",
    // Mock Image
    attachmentUrl: "https://images.unsplash.com/photo-1499750310159-5b5f0072c6fd?auto=format&fit=crop&w=600&q=80", 
    // Mock Audio (Short sample)
    voiceUrl: "https://www2.cs.uic.edu/~i101/SoundFiles/BabyElephantWalk60.wav" 
  }
];

export const feedbackService = {
  getAll: async (): Promise<Feedback[]> => {
    await delay(500);
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) return JSON.parse(stored);
    
    localStorage.setItem(STORAGE_KEY, JSON.stringify(MOCK_FEEDBACKS));
    return MOCK_FEEDBACKS;
  },

  create: async (data: any): Promise<void> => {
    await delay(800);
    const current = await feedbackService.getAll();
    
    // In a real app, file upload happens here, returning URLs.
    // For local demo, we create temporary object URLs if files exist
    const newFeedback: Feedback = {
      id: `FDB-${Date.now()}`,
      studentId: data.studentId,
      studentName: data.studentName,
      rating: data.rating,
      message: data.message,
      date: new Date().toISOString().split('T')[0],
      status: "New",
      attachmentUrl: data.hasAttachment ? "https://via.placeholder.com/600" : null, // Placeholder for demo
      voiceUrl: null // No mock URL for new creations in client-only mode
    };

    const updated = [newFeedback, ...current];
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  },

  delete: async (id: string): Promise<void> => {
    await delay(500);
    const current = await feedbackService.getAll();
    const updated = current.filter(f => f.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  }
};