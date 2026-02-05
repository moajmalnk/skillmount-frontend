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
  title?: string;
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
  translate: async (text: string, targetLang: string = "Malayalam") => {
    const response = await api.post("/chat/translate/", { text, target_lang: targetLang });
    return response.data.translated_text;
  },
  deleteSession: async (sessionId: string) => {
    await api.delete(`/chat/session/${sessionId}/`);
  },
  renameSession: async (sessionId: string, title: string) => {
    const response = await api.patch(`/chat/session/${sessionId}/`, { title });
    return response.data;
  },
  pinSession: async (sessionId: string, isPinned: boolean) => {
    const response = await api.patch(`/chat/session/${sessionId}/`, { is_pinned: isPinned });
    return response.data;
  },
};
