import api from "@/lib/api";

export interface ChatSource {
  id: string;
  title: string;
  url: string;
  source_type: string;
  score: number;
}

export interface ChatResponse {
  session_id: string;
  answer: string;
  sources: ChatSource[];
  turn_id: string;
}

export const chatService = {
  ask: async (question: string, sessionId?: string): Promise<ChatResponse> => {
    const response = await api.post("/chat/ask/", { question, session_id: sessionId });
    return response.data;
  },
  history: async () => {
    const response = await api.get("/chat/history/");
    return response.data as any[];
  },
};
