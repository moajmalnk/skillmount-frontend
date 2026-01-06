import { useEffect, useMemo, useRef, useState, useCallback } from "react";
import ReactMarkdown from "react-markdown";
import { MessageSquare, Sparkles, X, Loader2, ArrowUpRight, Copy, Bot, Info, PanelLeft, Plus, Menu, ChevronLeft, History, Youtube, FileText, Globe, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { chatService, ChatSource } from "@/services/chatService";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";

interface Turn {
  id: string;
  question: string;
  answer: string;
  sources: ChatSource[];
  displayedAnswer: string;
  isTyping?: boolean;
}

const HelpModal = ({ open, onClose }: { open: boolean; onClose: () => void }) => {
  if (!open) return null;
  return (
    <div className="absolute inset-0 z-[60] flex items-center justify-center bg-black/20 backdrop-blur-[2px] p-4 animate-in fade-in duration-200">
      <div className="absolute inset-0" onClick={onClose} />
      <Card className="w-full max-w-sm shadow-2xl bg-background/90 backdrop-blur-xl border-white/20 relative z-10">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-lg font-bold flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-indigo-500" />
            Hints & Tips
          </CardTitle>
          <Button size="icon" variant="ghost" className="h-8 w-8 rounded-full" onClick={onClose}>
            <X className="w-4 h-4" />
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <h4 className="font-semibold text-sm">What to ask?</h4>
            <ul className="text-sm text-muted-foreground list-disc list-inside space-y-1 ml-1">
              <li>"Best video for React hooks"</li>
              <li>"WordPress plugin guide"</li>
              <li>"How to deploy on Hostinger"</li>
            </ul>
          </div>
          <div className="bg-indigo-500/5 p-3 rounded-lg border border-indigo-500/10">
            <h4 className="font-semibold text-sm text-indigo-600 mb-1">Pro Tip</h4>
            <p className="text-xs text-muted-foreground">
              We assume "Material" refers to course videos. Be specific!
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

const ChatSidebar = ({
  isOpen,
  isMobile,
  onCloseMobile,
  isCollapsed,
  toggleCollapse,
  onNewChat,
  sessions,
  activeSessionId,
  onSelectSession,
}: {
  isOpen: boolean; // for mobile overlay
  isMobile: boolean;
  onCloseMobile: () => void;
  isCollapsed: boolean;
  toggleCollapse: () => void;
  onNewChat: () => void;
  sessions: any[];
  activeSessionId?: string;
  onSelectSession: (id: string) => void;
}) => {
  const sidebarWidth = isCollapsed ? "w-[70px]" : "w-[260px]";
  const commonClasses = `flex flex-col border-r border-white/10 bg-slate-900/50 backdrop-blur-xl transition-all duration-300 ease-in-out h-full overflow-hidden shrink-0 z-20`;

  if (isMobile) {
    return (
      <>
        {/* Mobile Overlay */}
        {isOpen && (
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm z-30"
            onClick={onCloseMobile}
          />
        )}
        {/* Mobile Sidebar (Slide-in) */}
        <div className={`absolute left-0 top-0 bottom-0 z-40 w-[280px] bg-slate-950 border-r border-slate-800 transition-transform duration-300 ${isOpen ? "translate-x-0" : "-translate-x-full"}`}>
          <SidebarContent
            isCollapsed={false}
            onNewChat={onNewChat}
            sessions={sessions}
            activeSessionId={activeSessionId}
            onSelectSession={onSelectSession}
            onCloseMobile={onCloseMobile}
          />
        </div>
      </>
    );
  }

  // Desktop Sidebar
  return (
    <div className={`${commonClasses} ${sidebarWidth}`}>
      <div className="flex flex-col h-full">
        <div className={`p-4 flex items-center shrink-0 ${isCollapsed ? 'justify-center' : 'justify-between'}`}>
          {!isCollapsed && (
            <span className="font-semibold text-sm tracking-wide text-slate-200 animate-in fade-in duration-300">
              History
            </span>
          )}
          <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-white/10 text-slate-400 hover:text-white transition-colors" onClick={toggleCollapse}>
            <PanelLeft className="w-4 h-4" />
          </Button>
        </div>
        <SidebarContent
          isCollapsed={isCollapsed}
          onNewChat={onNewChat}
          sessions={sessions}
          activeSessionId={activeSessionId}
          onSelectSession={onSelectSession}
        />
      </div>
    </div>
  );
};

// Helper to categorize dates
const groupByDate = (sessions: any[]) => {
  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);

  const groups: Record<string, any[]> = {
    Today: [],
    Yesterday: [],
    "Previous 7 Days": [],
    Older: [],
  };

  sessions.forEach((session) => {
    // Assuming session has created_at or date field; fallback to today if missing
    // Need to handle potential string dates or timestamps
    const dateStr = session.created_at || session.date;
    const date = dateStr ? new Date(dateStr) : new Date();

    // Check invalid date
    if (isNaN(date.getTime())) {
      groups.Today.push(session);
      return;
    }

    if (date.toDateString() === today.toDateString()) {
      groups.Today.push(session);
    } else if (date.toDateString() === yesterday.toDateString()) {
      groups.Yesterday.push(session);
    } else if (date > new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000)) {
      groups["Previous 7 Days"].push(session);
    } else {
      groups.Older.push(session);
    }
  });

  return groups;
};

const SidebarContent = ({
  isCollapsed,
  onNewChat,
  sessions,
  activeSessionId,
  onSelectSession,
  onCloseMobile,
}: {
  isCollapsed: boolean;
  onNewChat: () => void;
  sessions: any[];
  activeSessionId?: string;
  onSelectSession: (id: string) => void;
  onCloseMobile?: () => void;
}) => {
  const groups = groupByDate(sessions);
  const hasHistory = sessions.length > 0;

  return (
    <div className="flex-1 flex flex-col gap-4 overflow-hidden px-3 pb-4">
      <div className={`transition-all duration-300 ${isCollapsed ? "px-0 flex justify-center" : ""}`}>
        <Button
          onClick={() => {
            onNewChat();
            if (onCloseMobile) onCloseMobile();
          }}
          className={`bg-indigo-600 hover:bg-indigo-700 text-white dark:bg-white dark:text-slate-900 dark:hover:bg-slate-200 shadow-lg shadow-indigo-900/20 transition-all ${isCollapsed ? "h-10 w-10 min-w-10 rounded-full p-0 flex items-center justify-center" : "w-full rounded-xl flex items-center gap-2 justify-start px-4 h-12"}`}
        >
          <Plus className={`${isCollapsed ? "w-5 h-5" : "w-5 h-5"}`} />
          {!isCollapsed && <span className="font-medium">New Chat</span>}
        </Button>
      </div>

      <div className="flex-1 overflow-y-auto min-h-0 space-y-4 mt-2 pr-1 scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-transparent">
        {!hasHistory && !isCollapsed && (
          <div className="flex flex-col items-center justify-center h-32 text-slate-500 space-y-2">
            <History className="w-8 h-8 opacity-20" />
            <span className="text-xs">No chat history</span>
          </div>
        )}

        {Object.entries(groups).map(([label, groupSessions]) => {
          if (groupSessions.length === 0) return null;
          return (
            <div key={label} className="space-y-1">
              {!isCollapsed && (
                <div className="text-[10px] font-bold text-slate-500 uppercase px-2 mb-1 tracking-wider sticky top-0 bg-slate-50 dark:bg-slate-900/95 backdrop-blur-sm z-10 py-1">
                  {label}
                </div>
              )}
              {groupSessions.map((session, idx) => (
                <Button
                  key={session.id || idx}
                  variant="ghost"
                  className={`w-full justify-start text-left relative overflow-hidden group transition-all duration-200 ${isCollapsed ? "h-10 w-10 p-0 rounded-full flex items-center justify-center mx-auto" : "px-3 py-3 rounded-lg h-auto"
                    } ${activeSessionId === session.id
                      ? "bg-slate-200 dark:bg-slate-800/80 text-foreground shadow-sm border border-slate-300 dark:border-slate-700/50"
                      : "text-muted-foreground hover:text-foreground hover:bg-slate-100 dark:hover:bg-slate-800/40"
                    }`}
                  onClick={() => {
                    onSelectSession(session.id);
                    if (onCloseMobile) onCloseMobile();
                  }}
                >
                  {isCollapsed ? (
                    <MessageSquare className={`w-4 h-4 ${activeSessionId === session.id ? "text-indigo-500 dark:text-indigo-400" : ""}`} />
                  ) : (
                    <div className="flex flex-col gap-0.5 min-w-0 w-full">
                      <span className={`text-sm font-medium truncate w-full block ${activeSessionId === session.id ? "text-indigo-600 dark:text-indigo-100" : ""}`}>
                        {session.title || "New Conversation"}
                      </span>
                    </div>
                  )}
                </Button>
              ))}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export const ChatWidget = () => {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [showHelp, setShowHelp] = useState(false);

  // Sidebar State
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);
  const [sessions, setSessions] = useState<any[]>([]);

  const [question, setQuestion] = useState("");
  const [sessionId, setSessionId] = useState<string | undefined>(() => localStorage.getItem("chat_session_id") || undefined);
  const [turns, setTurns] = useState<Turn[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const typingIntervalRef = useRef<number | null>(null);

  useEffect(() => {
    if (sessionId) {
      localStorage.setItem("chat_session_id", sessionId);
    } else {
      localStorage.removeItem("chat_session_id");
    }
  }, [sessionId]);

  useEffect(() => {
    // Prevent background scroll when the chat is open
    if (isOpen) {
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = originalOverflow;
      };
    }
  }, [isOpen]);

  const fetchHistory = useCallback(async () => {
    try {
      const data = await chatService.history();
      setSessions(data || []);

      // Auto-restore session if we have a saved ID
      const savedId = localStorage.getItem("chat_session_id");
      if (savedId && data) {
        const selected = data.find((s: any) => s.id === savedId);
        if (selected) {
          const sessionTurns = (selected.turns || []).map((t: any) => ({
            id: t.id,
            question: t.question,
            answer: t.answer,
            sources: t.sources || [],
            displayedAnswer: t.answer,
            isTyping: false,
          }));
          setTurns(sessionTurns);
        }
      }
    } catch (e) {
      console.error("Failed to fetch history", e);
    }
  }, []);

  useEffect(() => {
    if (isOpen) {
      fetchHistory();
    }
  }, [isOpen, fetchHistory]);

  const handleSelectSession = (id: string) => {
    setSessionId(id);
    const selected = sessions.find((s) => s.id === id);
    if (selected) {
      const sessionTurns = (selected.turns || []).map((t: any) => ({
        id: t.id,
        question: t.question,
        answer: t.answer,
        sources: t.sources || [],
        displayedAnswer: t.answer,
        isTyping: false,
      }));
      setTurns(sessionTurns);
      if (isMobileNavOpen) setIsMobileNavOpen(false);
    }
  };

  const handleNewChat = () => {
    setSessionId(undefined);
    setTurns([]);
    setQuestion("");
    if (isMobileNavOpen) setIsMobileNavOpen(false);
  };

  const suggestions = useMemo(
    () => [
      "Find the best video for React hooks",
      "Where is the WordPress plugin guide?",
      "Show materials about API integration",
      "Steps to deploy on Hostinger",
    ],
    []
  );

  const startTypingAnimation = (turnId: string, fullText: string) => {
    if (typingIntervalRef.current) {
      window.clearInterval(typingIntervalRef.current);
      typingIntervalRef.current = null;
    }

    typingIntervalRef.current = window.setInterval(() => {
      setTurns((prev) => {
        let done = false;

        const updated = prev.map((turn) => {
          if (turn.id !== turnId) {
            return turn;
          }

          const current = turn.displayedAnswer ?? "";
          if (current.length >= fullText.length) {
            done = true;
            return { ...turn, displayedAnswer: fullText, isTyping: false };
          }

          // Reveal a few characters at a time for a smoother feel
          const nextLength = Math.min(current.length + 3, fullText.length);
          const nextText = fullText.slice(0, nextLength);
          if (nextText.length >= fullText.length) {
            done = true;
          }
          return { ...turn, displayedAnswer: nextText, isTyping: nextText.length < fullText.length };
        });

        if (done && typingIntervalRef.current) {
          window.clearInterval(typingIntervalRef.current);
          typingIntervalRef.current = null;
        }

        return updated;
      });
    }, 20);
  };

  const send = async (overrideQuestion?: string) => {
    const textToSend = overrideQuestion || question;
    if (!textToSend.trim()) return;
    if (!user) {
      toast.error("Please log in to use the assistant.");
      return;
    }

    const currentQuestion = textToSend;
    const currentSessionId = sessionId;
    const tempTurnId = "temp-" + Date.now();

    // 1. Clear input and show loading state immediately
    setQuestion("");
    setIsLoading(true);

    // 2. Add User Question and "Thinking..." placeholder to UI
    const placeholderTurn: Turn = {
      id: tempTurnId,
      question: currentQuestion,
      answer: "", // Empty initially
      sources: [],
      displayedAnswer: "Thinking...", // Special placeholder text
      isTyping: true, // Show typing cursor
    };

    setTurns((prev) => {
      // Stop any previous animations
      const withoutTyping = prev.map((t) => ({ ...t, isTyping: false }));
      return [...withoutTyping, placeholderTurn].slice(-6);
    });

    try {
      const token = localStorage.getItem('access_token');
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

      const response = await fetch(`${API_URL}/chat/ask/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          question: currentQuestion,
          session_id: currentSessionId
        })
      });

      if (!response.ok) {
        try {
          const errData = await response.json();
          throw new Error(errData.detail || "Network response was not ok");
        } catch (e) {
          throw new Error("Network response was not ok");
        }
      }

      const reader = response.body?.getReader();
      if (!reader) throw new Error("No reader available");

      const decoder = new TextDecoder();
      let buffer = "";
      let currentTurnId = tempTurnId;

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() || "";

        for (const line of lines) {
          if (!line.trim()) continue;
          try {
            const data = JSON.parse(line);

            if (data.type === "meta") {
              const newSessionId = data.session_id;
              setSessionId(newSessionId);
              currentTurnId = data.turn_id;

              setTurns(prev => prev.map(t => {
                if (t.id === tempTurnId) {
                  return {
                    ...t,
                    id: data.turn_id,
                    sources: data.sources || [],
                    displayedAnswer: "",
                    answer: ""
                  };
                }
                return t;
              }));

              if (!currentSessionId) {
                setSessions(prev => [
                  {
                    id: newSessionId,
                    title: data.title || currentQuestion,
                    created_at: new Date().toISOString(),
                    first_q: currentQuestion,
                    turns: []
                  },
                  ...prev
                ]);
                setTimeout(() => fetchHistory(), 3000);
              }

            } else if (data.type === "chunk") {
              setTurns(prev => prev.map(t => {
                if (t.id === currentTurnId || t.id === tempTurnId) {
                  return {
                    ...t,
                    answer: t.answer + data.text,
                    displayedAnswer: t.answer + data.text,
                    isTyping: true
                  };
                }
                return t;
              }));

            } else if (data.type === "error") {
              toast.error(data.text);
              const errTxt = data.text || " Error";
              setTurns(prev => prev.map(t => t.id === currentTurnId ? { ...t, answer: t.answer + errTxt, displayedAnswer: t.answer + errTxt } : t));
            }

          } catch (e) {
            console.error("JSON Parse Error", e);
          }
        }
      }

      setTurns(prev => prev.map(t => t.id === currentTurnId ? { ...t, isTyping: false } : t));

    } catch (err: any) {
      console.error(err);
      const errorMessage = "I'm having trouble connecting to my brain right now. Please try again later.";
      toast.error(err.message || "Connection failed");

      setTurns(prev => prev.map(t => {
        if (t.id === tempTurnId) {
          return { ...t, answer: errorMessage, displayedAnswer: errorMessage, isTyping: false };
        }
        return t;
      }));
    } finally {
      setIsLoading(false);
    }
  };

  const copyAnswer = (text: string) => {
    navigator.clipboard.writeText(text).then(() => toast.success("Copied"));
  };

  useEffect(() => {
    // Scroll to bottom when turns change
    if (scrollRef.current) {
      setTimeout(() => {
        if (scrollRef.current) {
          scrollRef.current.scrollTo({
            top: scrollRef.current.scrollHeight,
            behavior: "smooth",
          });
        }
      }, 100);
    }
  }, [turns, isOpen]);

  useEffect(
    () => () => {
      if (typingIntervalRef.current) {
        window.clearInterval(typingIntervalRef.current);
      }
    },
    []
  );

  // Only show chat for logged-in users
  if (!user) {
    return null;
  }

  return (
    <>
      <div className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-50 pointer-events-none">
        <Button
          onClick={() => setIsOpen(true)}
          size="lg"
          className="shadow-xl rounded-full gap-2 pointer-events-auto bg-white text-slate-900 hover:bg-slate-100 hover:scale-105 transition-all duration-300"
        >
          <Sparkles className="w-4 h-4 text-indigo-500" />
          Study Assistant
        </Button>
      </div>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-0 sm:px-4 sm:py-6 animate-in fade-in duration-200">
          <Card className="w-full h-[100dvh] sm:h-[85vh] sm:max-w-5xl flex flex-col overflow-hidden relative border-none sm:shadow-2xl bg-background/95 backdrop-blur-md sm:rounded-2xl rounded-none">

            <HelpModal open={showHelp} onClose={() => setShowHelp(false)} />

            {/* Header with Antigravity feel */}
            <CardHeader className="flex flex-row items-center justify-between shrink-0 bg-white/40 dark:bg-black/40 backdrop-blur-md border-b border-white/10 z-20 relative px-4 md:px-6 py-4">
              <div className="flex items-center gap-3">
                <Button variant="ghost" size="icon" className="sm:hidden -ml-2 text-slate-400 hover:text-white" onClick={() => setIsMobileNavOpen(true)}>
                  <Menu className="w-5 h-5" />
                </Button>
                <CardTitle className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg transform hover:scale-105 transition-transform">
                    <MessageSquare className="w-5 h-5 text-white" />
                  </div>
                  <div className="flex flex-col">
                    <span className="font-bold text-lg tracking-tight">Study Assistant</span>
                    <span className="text-[10px] uppercase font-medium text-muted-foreground tracking-wider">AI Powered</span>
                  </div>
                </CardTitle>
              </div>
              <div className="flex items-center gap-2">
                <Button size="icon" variant="ghost" className="rounded-full hover:bg-white/20" onClick={() => setShowHelp(true)}>
                  <Info className="w-5 h-5 text-muted-foreground hover:text-indigo-500 transition-colors" />
                </Button>
                <Separator orientation="vertical" className="h-6 mx-1 bg-white/20 hidden sm:block" />
                <Button size="icon" variant="ghost" className="rounded-full hover:bg-red-500/10 hover:text-red-500 transition-colors" onClick={() => setIsOpen(false)}>
                  <X className="w-5 h-5" />
                </Button>
              </div>
            </CardHeader>

            {/* Main Content Area: Sidebar + Chat */}
            <CardContent className="flex flex-1 flex-row overflow-hidden p-0 relative">



              {/* Render Mobile Sidebar explicitly if open? 
                   The ChatSidebar component I wrote has "if (isMobile) return ...Overlay...".
                   It acts as EITHER desktop OR mobile based on prop.
                   I will instantiate it twice or use a hook.
                   Let's instantiate it for Desktop inside the flex flow.
                   And instantiate it for Mobile (fixed overlay) outside the flow?
               */}
              <div className="sm:hidden">
                <ChatSidebar
                  isMobile={true}
                  isOpen={isMobileNavOpen}
                  onCloseMobile={() => setIsMobileNavOpen(false)}
                  isCollapsed={false}
                  toggleCollapse={() => { }}
                  onNewChat={handleNewChat}
                  sessions={sessions}
                  activeSessionId={sessionId}
                  onSelectSession={handleSelectSession}
                />
              </div>

              <div className="hidden sm:flex shrink-0 h-full">
                <ChatSidebar
                  isMobile={false}
                  isOpen={false}
                  onCloseMobile={() => { }}
                  isCollapsed={isCollapsed}
                  toggleCollapse={() => setIsCollapsed(!isCollapsed)}
                  onNewChat={handleNewChat}
                  sessions={sessions}
                  activeSessionId={sessionId}
                  onSelectSession={handleSelectSession}
                />
              </div>

              {/* Chat Area */}
              <div className="flex-1 flex flex-col relative min-w-0 bg-background/50">
                <div className="absolute inset-0 overflow-y-auto scrollbar-thin scrollbar-thumb-rounded-full scrollbar-track-transparent scrollbar-thumb-muted-foreground/20">
                  <div
                    ref={scrollRef}
                    className="flex flex-col gap-4 p-4 pb-28 md:p-6 md:pb-32 w-full max-w-3xl mx-auto min-h-full"
                  >
                    <div className="flex items-center justify-center py-4">
                      <Badge variant="outline" className="bg-background/50 backdrop-blur-sm text-xs font-normal border-indigo-500/20 text-muted-foreground px-3 py-1">
                        Materials · Blog · FAQ
                      </Badge>
                    </div>

                    {/* Suggestions */}
                    {turns.length === 0 && (
                      <div className="flex gap-2 flex-wrap justify-center sm:flex-wrap mb-4">
                        {suggestions.map((s) => (
                          <Button
                            key={s}
                            size="sm"
                            variant="secondary"
                            className="rounded-full bg-background/60 hover:bg-indigo-500/10 hover:text-indigo-600 transition-colors border border-transparent hover:border-indigo-500/20 shadow-sm"
                            onClick={() => send(s)}
                          >
                            {s}
                          </Button>
                        ))}
                      </div>
                    )}

                    {/* Empty State */}
                    {turns.length === 0 && (
                      <div className="flex flex-col items-center justify-center flex-1 text-center space-y-4 opacity-60 mt-4 sm:mt-10">
                        <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center mb-2">
                          <Sparkles className="w-8 h-8 text-muted-foreground" />
                        </div>
                        <p className="max-w-[250px] sm:max-w-xs text-sm text-muted-foreground">
                          Ask anything about your learning materials. I'm here to help!
                        </p>
                      </div>
                    )}

                    {/* Messages */}
                    {turns.map((turn) => (
                      <div key={turn.id} className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
                        {/* User Question */}
                        <div className="flex justify-end">
                          <div className="max-w-[95%] sm:max-w-[85%] rounded-2xl rounded-tr-sm bg-slate-200 text-slate-900 dark:bg-white dark:text-slate-900 px-4 py-3 sm:px-5 sm:py-3 text-sm shadow-md whitespace-pre-wrap">
                            {turn.question}
                          </div>
                        </div>

                        {/* Bot Answer */}
                        <div className="flex justify-start w-full">
                          <div className="max-w-[95%] sm:max-w-[90%] md:max-w-[85%] rounded-2xl rounded-tl-sm bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 px-4 py-3 sm:px-5 sm:py-4 text-sm shadow-sm space-y-3">
                            <div className="flex items-center justify-between gap-2 mb-1">
                              <div className="flex items-center gap-2">
                                <Bot className="w-4 h-4 text-indigo-500" />
                                <span className="font-semibold text-foreground text-xs uppercase tracking-wide">Assistant</span>
                              </div>
                              {!turn.isTyping && (
                                <Button size="icon" variant="ghost" className="h-6 w-6 opacity-50 hover:opacity-100" onClick={() => copyAnswer(turn.answer)}>
                                  <Copy className="w-3 h-3" />
                                </Button>
                              )}
                            </div>

                            <div className="text-foreground/90 leading-relaxed overflow-hidden prose dark:prose-invert prose-sm max-w-none break-words min-h-[24px]">
                              {turn.displayedAnswer === "Thinking..." ? (
                                <div className="flex items-center gap-1.5 h-6 animate-in fade-in duration-300">
                                  <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                                  <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                                  <span className="w-1.5 h-1.5 bg-indigo-300 rounded-full animate-bounce"></span>
                                </div>
                              ) : (
                                <ReactMarkdown>
                                  {(turn.displayedAnswer || turn.answer) + (turn.isTyping ? " ▋" : "")}
                                </ReactMarkdown>
                              )}
                            </div>

                            {/* Dynamic Source Parsing & Display */}
                            {(() => {
                              // 1. Extract External Links from Markdown Answer
                              const mdLinkRegex = /\[([^\]]+)\]\((https?:\/\/[^\)]+)\)/g;
                              const externalLinks: any[] = [];
                              let match;
                              while ((match = mdLinkRegex.exec(turn.answer)) !== null) {
                                externalLinks.push({
                                  id: `ext-${match[2]}`,
                                  title: match[1],
                                  url: match[2],
                                  source_type: "External Resource"
                                });
                              }

                              // 2. Combine with Backend Sources
                              const existingSources = turn.sources || [];
                              const allSources = [...existingSources, ...externalLinks];

                              // 3. Deduplicate
                              const uniqueSources = allSources.filter((v, i, a) => a.findIndex(t => t.url === v.url) === i);

                              if (uniqueSources.length === 0 || turn.isTyping) return null;

                              return (
                                <div className="pt-2 border-t border-dashed border-slate-200 dark:border-slate-800 mt-2 space-y-2">
                                  <div className="text-[10px] font-bold text-muted-foreground uppercase flex items-center gap-1">
                                    <ArrowUpRight className="w-3 h-3" /> References & Sources
                                  </div>
                                  <div className="grid grid-cols-1 gap-2">
                                    {uniqueSources.map((s) => {
                                      const isExternal = s.source_type === "External Resource";
                                      const type = (s.source_type || "").toLowerCase();

                                      // Icon Selection
                                      let Icon = Globe;
                                      if (type.includes("youtube") || type.includes("video")) Icon = Youtube;
                                      else if (type.includes("pdf") || type.includes("material")) Icon = FileText;
                                      else if (type.includes("blog")) Icon = BookOpen;
                                      else if (isExternal) Icon = ArrowUpRight;

                                      const getSmartLink = (source: ChatSource) => {
                                        if (source.url && source.url.startsWith("http")) return source.url;
                                        if (type === "video" || type === "material" || type === "plugin" || type === "theme") return "/materials";
                                        if (type === "faq") return "/faq";
                                        if (type === "blog") {
                                          if (source.url && source.url.includes("/blog/")) return source.url;
                                          return "/blog";
                                        }
                                        if (source.url && source.url.startsWith("/")) return source.url;
                                        return "#";
                                      };

                                      const linkHref = getSmartLink(s);

                                      return (
                                        <a
                                          key={s.id}
                                          href={linkHref}
                                          className={`flex items-center justify-between text-xs border rounded-lg px-3 py-2 transition-colors group ${isExternal
                                            ? "bg-indigo-50/50 dark:bg-indigo-950/20 border-indigo-200/50 dark:border-indigo-800/50 hover:bg-indigo-100 dark:hover:bg-indigo-900/40"
                                            : "bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700/50"
                                            }`}
                                          target="_blank"
                                          rel="noreferrer"
                                        >
                                          <div className="flex items-center truncate flex-1 mr-2 gap-2">
                                            <div className={`p-1 rounded-md ${isExternal ? "bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600" : "bg-slate-200 dark:bg-slate-700 text-slate-600"}`}>
                                              <Icon className="w-3.5 h-3.5" />
                                            </div>
                                            <div className="flex flex-col truncate">
                                              <span className={`font-medium truncate group-hover:underline ${isExternal ? "text-indigo-700 dark:text-indigo-300" : "text-indigo-600 dark:text-indigo-400"}`}>
                                                {s.title}
                                              </span>
                                              <span className="text-[10px] text-muted-foreground uppercase">{s.source_type}</span>
                                            </div>
                                          </div>
                                          {isExternal && <ArrowUpRight className="w-3 h-3 text-indigo-400 opacity-50" />}
                                        </a>
                                      );
                                    })}
                                  </div>
                                </div>
                              );
                            })()}
                          </div>
                        </div>
                      </div>
                    ))}
                    <div className="h-4" /> {/* Spacer */}
                  </div>
                </div>

                {/* FLOATING INPUT Area */}
                <div className="absolute bottom-0 left-0 right-0 p-3 sm:p-4 md:p-6 flex justify-center z-30 pointer-events-none bg-gradient-to-t from-background via-background/80 to-transparent">
                  <div className="w-full max-w-2xl mx-auto pointer-events-auto pb-1 sm:pb-2">
                    <div className="group relative flex items-center gap-2 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-white/20 dark:border-white/10 shadow-2xl rounded-full p-1.5 pl-4 sm:p-2 sm:pl-5 transition-all duration-300 focus-within:ring-2 focus-within:ring-white/30 hover:shadow-indigo-500/10 hover:border-white/30">
                      <Input
                        placeholder="Ask..."
                        value={question}
                        onChange={(e) => setQuestion(e.target.value)}
                        className="border-none border-0 shadow-none outline-none bg-transparent h-10 text-sm sm:text-base placeholder:text-muted-foreground/60 focus-visible:ring-0 focus-visible:ring-offset-0 px-0 min-w-0"
                        onKeyDown={(e) => {
                          if (e.key === "Enter" && !e.shiftKey) {
                            e.preventDefault();
                            send();
                          }
                        }}
                      />
                      <Button
                        onClick={() => send()}
                        disabled={isLoading || !question.trim()}
                        size="icon"
                        className={`rounded-full h-9 w-9 sm:h-10 sm:w-10 shrink-0 transition-all duration-300 ${question.trim() ? "bg-slate-900 hover:bg-slate-800 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-200 shadow-lg scale-100" : "bg-muted text-muted-foreground scale-95"}`}
                      >
                        {isLoading ? <Loader2 className="w-4 h-4 sm:w-5 sm:h-5 animate-spin" /> : <ArrowUpRight className="w-4 h-4 sm:w-5 sm:h-5" />}
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </>
  );
};
