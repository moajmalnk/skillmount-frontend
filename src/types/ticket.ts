export type TicketPriority = "High" | "Medium" | "Low" | "Urgent";
export type TicketStatus = "Open" | "Closed" | "Pending";

export interface TicketMessage {
  id: string;
  sender: "student" | "tutor" | "admin";
  text: string;
  time: string;
  attachments?: string[];
}

export interface Ticket {
  id: string;
  title: string; // Used as Subject
  description: string;
  category: string;
  priority: TicketPriority;
  status: TicketStatus;
  date: string;
  student: {
    id: string;
    name: string;
    email: string;
    avatar?: string;
    batch?: string;
  };
  messages?: TicketMessage[]; // For chat history
}