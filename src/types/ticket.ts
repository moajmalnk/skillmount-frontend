export type TicketPriority = "High" | "Medium" | "Low" | "Urgent";
export type TicketStatus = "Open" | "Closed" | "Pending";

export interface TicketMessage {
  id: string;
  sender_name: string;
  message: string;
  timestamp: string;
  attachment?: string | null;
  voice_note?: string | null;
}

export interface Ticket {
  id: string;
  title: string; // Used as Subject
  description: string;
  category: string;
  priority: TicketPriority;
  status: TicketStatus;
  created_at: string;
  student: {
    id: string;
    name: string;
    email: string;
    avatar?: string;
    batch?: string;
  };
  messages?: TicketMessage[]; // For chat history
}