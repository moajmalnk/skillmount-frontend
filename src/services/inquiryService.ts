export interface Inquiry {
  id: string;
  name: string;
  email: string;
  phone: string;
  message: string;
  date: string;
  status: "New" | "Read" | "Replied";
  subject?: string; // Optional subject derived from message or context
}

const KEY = "skillmount_inquiries";

// --- MOCK DATA ---
const MOCK_INQUIRIES: Inquiry[] = [
  {
    id: "INQ-001",
    name: "Emily Clark",
    email: "emily.c@gmail.com",
    phone: "9876541230",
    message: "Hi, I am interested in the WordPress course. Do you offer weekend batches for working professionals?",
    date: "2025-10-24",
    status: "New",
    subject: "Course Timing Query"
  },
  {
    id: "INQ-002",
    name: "David Kumar",
    email: "david.k@techcorp.com",
    phone: "8899776655",
    message: "We are a digital agency looking to hire 3 fresher React developers. Can we schedule a campus drive?",
    date: "2025-10-23",
    status: "Read",
    subject: "Placement Partnership"
  },
  {
    id: "INQ-003",
    name: "Fatima S.",
    email: "fatima.s@outlook.com",
    phone: "7766554433",
    message: "I am unable to access the LMS portal after payment. My transaction ID is TXN123456.",
    date: "2025-10-22",
    status: "Replied",
    subject: "Login Issue"
  },
  {
    id: "INQ-004",
    name: "Rahul Varma",
    email: "rahul.v@gmail.com",
    phone: "9988001122",
    message: "Is there any EMI option available for the Full Stack Development course fee?",
    date: "2025-10-21",
    status: "New",
    subject: "Fee Enquiry"
  },
  {
    id: "INQ-005",
    name: "Sarah Jones",
    email: "sarah.j@freelance.com",
    phone: "6655443322",
    message: "I want to join as a Tutor for UI/UX Design. Please let me know the procedure.",
    date: "2025-10-20",
    status: "Read",
    subject: "Job Application"
  },
  {
    id: "INQ-006",
    name: "Mohammed Ali",
    email: "ali.m@gmail.com",
    phone: "5544332211",
    message: "Do you provide a certificate for the 3-day workshop on SEO?",
    date: "2025-10-18",
    status: "Replied",
    subject: "Certification Query"
  }
];

export const inquiryService = {
  getAll: async (): Promise<Inquiry[]> => {
    // Simulate API delay
    await new Promise(r => setTimeout(r, 500));
    
    const stored = localStorage.getItem(KEY);
    if (stored) return JSON.parse(stored);
    
    // Initialize
    localStorage.setItem(KEY, JSON.stringify(MOCK_INQUIRIES));
    return MOCK_INQUIRIES;
  },

  create: async (data: Omit<Inquiry, "id" | "date" | "status">) => {
    const current = await inquiryService.getAll();
    const newInquiry: Inquiry = {
      ...data,
      id: `INQ-${Date.now()}`,
      date: new Date().toISOString().split('T')[0],
      status: "New"
    };
    localStorage.setItem(KEY, JSON.stringify([newInquiry, ...current]));
  },

  delete: async (id: string) => {
    const current = await inquiryService.getAll();
    const updated = current.filter(i => i.id !== id);
    localStorage.setItem(KEY, JSON.stringify(updated));
  },

  markAsRead: async (id: string) => {
    const current = await inquiryService.getAll();
    const updated = current.map(i => i.id === id ? { ...i, status: "Read" as const } : i);
    localStorage.setItem(KEY, JSON.stringify(updated));
  }
};