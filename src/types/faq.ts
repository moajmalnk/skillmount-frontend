export interface FAQ {
  id: string;
  question: string;
  answer: string; // HTML content from rich text editor
  category: string;
  createdAt: string;
  updatedAt: string;
}

export interface FAQCategory {
  name: string;
  description: string;
}