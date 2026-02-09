import { useEffect, useMemo, useRef, useState, useCallback } from "react";
import ReactMarkdown from "react-markdown";
import { MessageSquare, Sparkles, X, Loader2, ArrowUpRight, Copy, Bot, Info, PanelLeft, Plus, Menu, ChevronLeft, History, Youtube, FileText, Globe, BookOpen, Maximize2, Minimize2, Languages, MoreVertical, Trash2, Share2, Pin, Edit2, Package } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { chatService, ChatSource } from "@/services/chatService";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuPortal,
} from "@/components/ui/dropdown-menu";

interface Turn {
  id: string;
  question: string;
  answer: string;
  sources: ChatSource[];
  displayedAnswer: string;
  isTyping?: boolean;
  translatedAnswer?: string;
  showTranslated?: boolean;
  isTranslating?: boolean;
}

const HelpModal = ({ open, onClose }: { open: boolean; onClose: () => void }) => {
  if (!open) return null;
  return (
    <div className="absolute inset-0 z-[60] flex items-center justify-center bg-black/20 backdrop-blur-[2px] p-4 animate-in fade-in duration-200">
      <div className="absolute inset-0" onClick={onClose} />
      <Card className="w-full max-w-sm shadow-2xl bg-background/90 backdrop-blur-xl border-white/20 relative z-10">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-lg font-bold flex items-center gap-2">
            <img src="https://moajmalnk.in/assets/img/logo/logo-lightaj.png" alt="Hints" className="w-5 h-5 object-contain" />
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
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

const DeleteSessionModal = ({
  open,
  onClose,
  onConfirm,
  isDeleting,
}: {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  isDeleting: boolean;
}) => {
  if (!open) return null;
  return (
    <div className="absolute inset-0 z-[60] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="absolute inset-0" onClick={onClose} />
      <Card className="w-full max-w-sm shadow-2xl bg-white dark:bg-slate-950 border-white/20 relative z-10">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg font-bold text-red-600 flex items-center gap-2">
            <Trash2 className="w-5 h-5" />
            Delete Conversation
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-slate-600 dark:text-slate-300">
            Are you sure you want to delete this conversation? This action cannot be undone.
          </p>
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="outline" onClick={onClose} disabled={isDeleting}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={onConfirm}
              disabled={isDeleting}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              {isDeleting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
              Delete
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

const RenameSessionModal = ({
  open,
  onClose,
  onConfirm,
  currentTitle,
  isRenaming,
}: {
  open: boolean;
  onClose: () => void;
  onConfirm: (newTitle: string) => void;
  currentTitle: string;
  isRenaming: boolean;
}) => {
  const [title, setTitle] = useState(currentTitle);

  useEffect(() => {
    setTitle(currentTitle);
  }, [currentTitle, open]);

  if (!open) return null;

  return (
    <div className="absolute inset-0 z-[60] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="absolute inset-0" onClick={onClose} />
      <Card className="w-full max-w-sm shadow-2xl bg-white dark:bg-slate-950 border-white/20 relative z-10">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg font-bold flex items-center gap-2">
            <Edit2 className="w-5 h-5 text-purple-500" />
            Rename Conversation
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter new title..."
              className="w-full"
              autoFocus
              onKeyDown={(e) => {
                if (e.key === 'Enter') onConfirm(title);
              }}
            />
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="outline" onClick={onClose} disabled={isRenaming}>
              Cancel
            </Button>
            <Button
              onClick={() => onConfirm(title)}
              disabled={isRenaming || !title.trim()}
              className="bg-purple-600 hover:bg-purple-700 text-white"
            >
              {isRenaming ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
              Save
            </Button>
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
  onDeleteSession,
  onRenameSession,
  onPinSession,
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
  onDeleteSession: (id: string) => void;
  onRenameSession: (id: string, newTitle: string) => void;
  onPinSession: (id: string, isPinned: boolean) => void;
}) => {
  const sidebarWidth = isCollapsed ? "w-[70px]" : "w-[260px]";
  const commonClasses = `flex flex-col border-r border-slate-200 dark:border-white/10 bg-slate-50/80 dark:bg-slate-900/50 backdrop-blur-xl transition-all duration-300 ease-in-out h-full overflow-hidden shrink-0 z-20`;

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
            onDeleteSession={onDeleteSession}
            onRenameSession={onRenameSession}
            onPinSession={onPinSession}
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
            <span className="font-semibold text-sm tracking-wide text-slate-700 dark:text-slate-200 animate-in fade-in duration-300">
              History
            </span>
          )}
          <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-slate-200/50 dark:hover:bg-white/10 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors" onClick={toggleCollapse}>
            <PanelLeft className="w-4 h-4" />
          </Button>
        </div>
        <SidebarContent
          isCollapsed={isCollapsed}
          onNewChat={onNewChat}
          sessions={sessions}
          activeSessionId={activeSessionId}
          onSelectSession={onSelectSession}
          onDeleteSession={onDeleteSession}
          onRenameSession={onRenameSession}
          onPinSession={onPinSession}
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
    Pinned: [],
    Today: [],
    Yesterday: [],
    "Previous 7 Days": [],
    Older: [],
  };

  sessions.forEach((session) => {
    if (session.is_pinned) {
      groups.Pinned.push(session);
      return;
    }

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
  onDeleteSession,
  onRenameSession,
  onPinSession,
}: {
  isCollapsed: boolean;
  onNewChat: () => void;
  sessions: any[];
  activeSessionId?: string;
  onSelectSession: (id: string) => void;
  onCloseMobile?: () => void;
  onDeleteSession: (id: string) => void;
  onRenameSession: (id: string, newTitle: string) => void;
  onPinSession: (id: string, isPinned: boolean) => void;
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
                    <div className="flex items-center justify-between w-full min-w-0 group/item">
                      <div className="flex flex-col gap-0.5 min-w-0 overflow-hidden pr-6">
                        <span className={`text-sm font-medium truncate w-full block ${activeSessionId === session.id ? "text-indigo-600 dark:text-indigo-100" : ""}`}>
                          {session.is_pinned && <Pin className="w-3 h-3 inline mr-1 text-indigo-500 fill-current" />}
                          {session.title || "New Conversation"}
                        </span>
                      </div>

                      {/* 3-Dot Menu */}
                      <div className="opacity-0 group-hover/item:opacity-100 transition-opacity absolute right-1 top-1/2 -translate-y-1/2" onClick={(e) => e.stopPropagation()}>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-6 w-6 rounded-full hover:bg-slate-300 dark:hover:bg-slate-700 bg-transparent">
                              <MoreVertical className="w-3.5 h-3.5 text-slate-500" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-48 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 z-50">
                            <DropdownMenuItem onClick={() => {
                              const url = `${window.location.origin}/chat/share/${session.id}`;
                              navigator.clipboard.writeText(url).then(() => toast.success("Link copied to clipboard"));
                            }}>
                              <Share2 className="w-4 h-4 mr-2" /> Share link
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => onPinSession(session.id, !session.is_pinned)}>
                              <Pin className={`w-4 h-4 mr-2 ${session.is_pinned ? "fill-current" : ""}`} />
                              {session.is_pinned ? "Unpin" : "Pin"}
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => onRenameSession(session.id, session.title)}>
                              <Edit2 className="w-4 h-4 mr-2" /> Rename
                            </DropdownMenuItem>
                            <DropdownMenuSeparator className="bg-slate-100 dark:bg-slate-800" />
                            <DropdownMenuItem
                              className="text-red-600 focus:text-red-600 focus:bg-red-50 dark:focus:bg-red-900/20"
                              onClick={() => onDeleteSession(session.id)}
                            >
                              <Trash2 className="w-4 h-4 mr-2" /> Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
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

  // Deny access if profile is incomplete (except for admins)
  const isAdmin = user?.role === 'admin' || user?.role === 'super_admin';
  if (user && !isAdmin && !user.isProfileComplete) return null;

  const [isOpen, setIsOpen] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  // Modal States
  const [isRecording, setIsRecording] = useState(false);
  const [deleteData, setDeleteData] = useState<{ id: string, open: boolean }>({ id: "", open: false });
  const [renameData, setRenameData] = useState<{ id: string, title: string, open: boolean }>({ id: "", title: "", open: false });
  const [isDeleting, setIsDeleting] = useState(false);
  const [isRenaming, setIsRenaming] = useState(false);

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
      console.log("Chat History Data:", data);
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
      toast.error("Could not load chat history");
    }
  }, []);

  useEffect(() => {
    // Only fetch history once when mounted, or when explicitly needed
    fetchHistory();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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

  const handleTranslate = async (turn: Turn) => {
    if (turn.showTranslated) {
      setTurns(prev => prev.map(t => t.id === turn.id ? { ...t, showTranslated: false } : t));
      return;
    }

    if (turn.translatedAnswer) {
      setTurns(prev => prev.map(t => t.id === turn.id ? { ...t, showTranslated: true } : t));
      return;
    }

    setTurns(prev => prev.map(t => t.id === turn.id ? { ...t, isTranslating: true } : t));

    try {
      const translated = await chatService.translate(turn.answer);
      setTurns(prev => prev.map(t => t.id === turn.id ? {
        ...t,
        translatedAnswer: translated,
        showTranslated: true,
        isTranslating: false
      } : t));
    } catch (e) {
      toast.error("Translation failed");
      setTurns(prev => prev.map(t => t.id === turn.id ? { ...t, isTranslating: false } : t));
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

  const handleDeleteSession = (sessionIdToDelete: string) => {
    setDeleteData({ id: sessionIdToDelete, open: true });
  };

  const handleDeleteSessionConfirm = async (sessionIdToDelete: string) => {
    try {
      await chatService.deleteSession(sessionIdToDelete);
      setSessions(prev => prev.filter(s => s.id !== sessionIdToDelete));
      if (sessionId === sessionIdToDelete) {
        handleNewChat();
      }
      toast.success("Conversation deleted");
    } catch (e) {
      toast.error("Failed to delete conversation");
    }
  };

  const handleRenameSession = (sessionId: string, currentTitle: string) => {
    // Find title if not passed or ensure it's correct (though usually passed from UI)
    const session = sessions.find(s => s.id === sessionId);
    setRenameData({ id: sessionId, title: session?.title || currentTitle || "", open: true });
  };

  const handleRenameSessionConfirm = async (sessionId: string, newTitle: string) => {
    try {
      const updated = await chatService.renameSession(sessionId, newTitle);
      setSessions(prev => prev.map(s => s.id === sessionId ? updated : s));
      toast.success("Renamed successfully");
    } catch (e) {
      toast.error("Failed to rename");
    }
  };

  const handlePinSession = async (sessionId: string, isPinned: boolean) => {
    try {
      const updated = await chatService.pinSession(sessionId, isPinned);
      setSessions(prev => prev.map(s => s.id === sessionId ? updated : s));
      toast.success(isPinned ? "Pinned conversation" : "Unpinned conversation");
    } catch (e) {
      toast.error("Failed to update pin");
    }
  };

  // Only show chat for logged-in users
  if (!user) {
    return null;
  }

  return (
    <>
      <div className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-50 pointer-events-none group/chat-trigger">
        {/* Ambient Glow */}
        <div className="absolute -inset-0.5 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full blur opacity-20 group-hover/chat-trigger:opacity-60 transition duration-500 animate-pulse"></div>
        <Button
          onClick={() => setIsOpen(true)}
          size="lg"
          className="relative shadow-2xl rounded-full gap-3 pl-4 pr-6 h-12 sm:h-14 pointer-events-auto bg-background/95 backdrop-blur-xl border border-indigo-500/20 text-foreground hover:bg-background hover:scale-105 hover:shadow-indigo-500/20 transition-all duration-300 cursor-pointer"
        >
          <div className="relative">
            <img src="https://moajmalnk.in/assets/img/logo/logo-lightaj.png" alt="SkillMount" className="w-6 h-6 sm:w-7 sm:h-7 object-contain" />
            <span className="absolute -top-0.5 -right-0.5 flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-green-500 border border-background"></span>
            </span>
          </div>
          <div className="flex flex-col items-start text-left">
            <span className="font-bold text-sm sm:text-base leading-none">Ajmal NK</span>
            <span className="text-[10px] text-muted-foreground font-medium leading-none mt-0.5">Online</span>
          </div>
        </Button>
      </div>

      {isOpen && (
        <div className={`fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm ${isExpanded ? "p-0" : "p-0 sm:px-4 sm:py-6"} animate-in fade-in duration-200`}>
          <Card className={`w-full flex flex-col overflow-hidden relative border-none sm:shadow-2xl bg-background/95 backdrop-blur-md ${isExpanded ? "h-full max-w-none rounded-none" : "h-[100dvh] sm:h-[85vh] sm:max-w-[85vw] sm:rounded-2xl"}`}>

            {/* MODALS */}
            <DeleteSessionModal
              open={deleteData.open}
              onClose={() => setDeleteData({ ...deleteData, open: false })}
              onConfirm={async () => {
                if (!deleteData.id) return;
                setIsDeleting(true);
                await handleDeleteSessionConfirm(deleteData.id);
                setIsDeleting(false);
                setDeleteData({ ...deleteData, open: false });
              }}
              isDeleting={isDeleting}
            />

            <RenameSessionModal
              open={renameData.open}
              onClose={() => setRenameData({ ...renameData, open: false })}
              onConfirm={async (newTitle) => {
                if (!renameData.id) return;
                setIsRenaming(true);
                await handleRenameSessionConfirm(renameData.id, newTitle);
                setIsRenaming(false);
                setRenameData({ ...renameData, open: false });
              }}
              currentTitle={renameData.title}
              isRenaming={isRenaming}
            />

            <HelpModal open={showHelp} onClose={() => setShowHelp(false)} />

            {/* Header with Antigravity feel */}
            <CardHeader className="flex flex-row items-center justify-between shrink-0 bg-white/80 dark:bg-black/40 backdrop-blur-md border-b border-slate-200 dark:border-white/10 z-20 relative px-4 md:px-6 py-4">
              <div className="flex items-center gap-3">
                <Button variant="ghost" size="icon" className="sm:hidden -ml-2 text-slate-400 hover:text-white" onClick={() => setIsMobileNavOpen(true)}>
                  <Menu className="w-5 h-5" />
                </Button>
                <CardTitle className="flex items-center gap-3">
                  <img src="https://moajmalnk.in/assets/img/logo/logo-lightaj.png" alt="Logo" className="h-10 w-auto object-contain" />
                  <div className="flex flex-col">
                    <span className="font-bold text-lg tracking-tight">Codi</span>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] uppercase font-medium text-muted-foreground tracking-wider">AI Powered</span>
                      <Badge variant="outline" className="hidden sm:inline-flex bg-background/50 backdrop-blur-sm text-[10px] font-normal border-indigo-500/20 text-muted-foreground px-2 py-0.5 h-auto">
                        Materials · Blog · FAQ
                      </Badge>
                    </div>
                  </div>
                </CardTitle>
              </div>
              <div className="flex items-center gap-2">
                <Button size="icon" variant="ghost" className="rounded-full hover:bg-white/20 hidden sm:flex" onClick={() => setIsExpanded(!isExpanded)}>
                  {isExpanded ? <Minimize2 className="w-4 h-4 text-muted-foreground hover:text-indigo-500" /> : <Maximize2 className="w-4 h-4 text-muted-foreground hover:text-indigo-500" />}
                </Button>
                <Button size="icon" variant="ghost" className="rounded-full hover:bg-slate-100 dark:hover:bg-white/20" onClick={() => setShowHelp(true)}>
                  <Info className="w-5 h-5 text-muted-foreground hover:text-indigo-500 transition-colors" />
                </Button>
                <Separator orientation="vertical" className="h-6 mx-1 bg-slate-200 dark:bg-white/20 hidden sm:block" />
                <Button size="icon" variant="ghost" className="rounded-full hover:bg-red-100 dark:hover:bg-red-500/10 hover:text-red-500 transition-colors" onClick={() => setIsOpen(false)}>
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
                  onDeleteSession={handleDeleteSession}
                  onRenameSession={handleRenameSession}
                  onPinSession={handlePinSession}
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
                  onDeleteSession={handleDeleteSession}
                  onRenameSession={handleRenameSession}
                  onPinSession={handlePinSession}
                />
              </div>

              {/* Chat Area */}
              <div className="flex-1 flex flex-col relative min-w-0 bg-background/50">
                <div className="absolute inset-0 overflow-y-auto scrollbar-thin scrollbar-thumb-rounded-full scrollbar-track-transparent scrollbar-thumb-muted-foreground/20">
                  <div
                    ref={scrollRef}
                    className="flex flex-col gap-4 p-4 md:p-6 w-full min-h-full"
                  >


                    {/* Suggestions */}
                    {turns.length === 0 && (
                      <div className="flex gap-2 flex-wrap justify-center sm:flex-wrap mb-4">
                        {suggestions.map((s) => (
                          <Button
                            key={s}
                            size="sm"
                            variant="outline"
                            className="rounded-full bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800/50 hover:bg-indigo-100 dark:hover:bg-indigo-900/40 hover:scale-105 transition-all duration-300 shadow-sm"
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
                        <div className="h-20 w-20 rounded-full bg-white/10 dark:bg-white/5 backdrop-blur-md flex items-center justify-center mb-4 shadow-xl border border-white/20 dark:border-white/10">
                          <img src="https://moajmalnk.in/assets/img/logo/logo-lightaj.png" alt="Logo" className="w-10 h-10 object-contain opacity-80" />
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
                                <img src="https://moajmalnk.in/assets/img/logo/logo-lightaj.png" alt="Bot" className="w-5 h-5 object-contain" />
                                <span className="font-semibold text-foreground text-xs uppercase tracking-wide">Assistant</span>
                              </div>
                              {!turn.isTyping && (
                                <div className="flex items-center gap-1">
                                  <Button
                                    size="icon"
                                    variant="ghost"
                                    className={`h-6 w-6 transition-all ${turn.showTranslated ? "bg-indigo-100 text-indigo-600 dark:bg-indigo-500/20 dark:text-indigo-300" : "opacity-50 hover:opacity-100"}`}
                                    onClick={() => handleTranslate(turn)}
                                    title="Translate to Malayalam"
                                    disabled={turn.isTranslating}
                                  >
                                    {turn.isTranslating ? (
                                      <Loader2 className="w-3 h-3 animate-spin" />
                                    ) : (
                                      <span className="text-[10px] font-bold leading-none">മ</span>
                                    )}
                                  </Button>
                                  <Button size="icon" variant="ghost" className="h-6 w-6 opacity-50 hover:opacity-100" onClick={() => copyAnswer(turn.answer)}>
                                    <Copy className="w-3 h-3" />
                                  </Button>
                                </div>
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
                                  {turn.showTranslated
                                    ? (turn.translatedAnswer || "")
                                    : (turn.displayedAnswer || turn.answer) + (turn.isTyping ? " ▋" : "")
                                  }
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
                                      const isVideo = type.includes("video") || type.includes("youtube") || (s.url && s.url.includes("youtube.com"));

                                      // Smart Image Extraction
                                      let imageUrl = null;
                                      if (isVideo && s.url) {
                                        const videoIdMatch = s.url.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/);
                                        if (videoIdMatch) {
                                          imageUrl = `https://img.youtube.com/vi/${videoIdMatch[1]}/mqdefault.jpg`;
                                        }
                                      }

                                      // Icon Selection
                                      let Icon = Globe;
                                      if (isVideo) Icon = Youtube;
                                      else if (type.includes("pdf") || type.includes("material")) Icon = FileText;
                                      else if (type.includes("blog")) Icon = BookOpen;
                                      else if (isExternal) Icon = ArrowUpRight;

                                      const getSmartLink = (source: ChatSource) => {
                                        if (source.url && source.url.startsWith("http")) return source.url;
                                        if (type === "video" || type === "material" || type === "plugin" || type === "theme") {
                                          let tab = "template-kits";
                                          if (type === "theme") tab = "themes";
                                          if (type === "plugin") tab = "plugins";
                                          if (type === "video") tab = "videos";
                                          if (type.includes("doc")) tab = "docs";
                                          if (type.includes("snippet")) tab = "snippets";

                                          return `/materials?id=${s.id}&tab=${tab}`;
                                        }
                                        if (type === "faq") return "/faq";
                                        if (type === "blog") {
                                          if (source.url && source.url.includes("/blog/")) return source.url;
                                          return "/blog";
                                        }
                                        if (source.url && source.url.startsWith("/")) return source.url;
                                        return "#";
                                      };

                                      const linkHref = getSmartLink(s);

                                      // RENDER: Rich Card
                                      return (
                                        <a
                                          key={s.id}
                                          href={linkHref}
                                          target="_blank"
                                          rel="noreferrer"
                                          className="flex gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700/50 transition-all duration-300 group overflow-hidden"
                                        >
                                          {/* Thumbnail Section */}
                                          <div className="shrink-0 relative w-24 h-16 rounded-lg overflow-hidden bg-slate-200 dark:bg-slate-700 flex items-center justify-center">
                                            {imageUrl ? (
                                              <img src={imageUrl} alt={s.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                                            ) : (
                                              <Icon className="w-6 h-6 text-muted-foreground opacity-50" />
                                            )}
                                            {isVideo && (
                                              <div className="absolute inset-0 flex items-center justify-center bg-black/20 group-hover:bg-black/10 transition-colors">
                                                <div className="w-6 h-6 rounded-full bg-red-600 flex items-center justify-center shadow-lg transform group-hover:scale-110 transition-transform">
                                                  <div className="w-0 h-0 border-t-[3px] border-t-transparent border-l-[6px] border-l-white border-b-[3px] border-b-transparent ml-0.5"></div>
                                                </div>
                                              </div>
                                            )}
                                          </div>

                                          {/* Text Content */}
                                          <div className="flex flex-col justify-between flex-1 py-0.5 min-w-0">
                                            <div>
                                              <h4 className="text-xs font-semibold text-foreground line-clamp-2 leading-snug group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                                                {s.title}
                                              </h4>
                                              <div className="flex items-center gap-2 mt-1">
                                                <span className="text-[10px] text-muted-foreground uppercase bg-slate-200/50 dark:bg-slate-700/50 px-1.5 py-0.5 rounded flex items-center gap-1">
                                                  {!imageUrl && <Icon className="w-2.5 h-2.5" />} {isVideo ? "Youtube" : s.source_type}
                                                </span>
                                                {isExternal && <ArrowUpRight className="w-2.5 h-2.5 text-muted-foreground opacity-60" />}
                                              </div>
                                            </div>
                                          </div>
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
                    <div className="h-32 sm:h-40" /> {/* Large Spacer for Floating Input */}
                  </div>
                </div>

                {/* WHATSAPP STYLE INPUT AREA */}
                <div className="absolute bottom-0 left-0 right-0 z-30 bg-background/95 backdrop-blur-md border-t border-border/50">
                  <div className="w-full max-w-4xl mx-auto flex flex-col gap-2 p-2 sm:p-3">

                    {/* Quick Response / Macros Macro Bar */}


                    {/* Main Input Bar */}
                    <div className="flex items-end gap-2 bg-transparent">



                      {/* Input Field Container */}
                      <div className="flex-1 min-w-0 bg-secondary/40 hover:bg-secondary/60 focus-within:bg-secondary/60 dark:bg-slate-800/50 dark:hover:bg-slate-800 dark:focus-within:bg-slate-800 transition-colors rounded-3xl flex items-center px-4 py-1.5 border border-transparent focus-within:border-primary/20 relative overflow-hidden">
                        <Input
                          placeholder="Type your reply..."
                          value={question}
                          onChange={(e) => setQuestion(e.target.value)}
                          className="border-none shadow-none outline-none bg-transparent h-auto max-h-[120px] py-1.5 text-sm sm:text-base placeholder:text-muted-foreground/60 focus-visible:ring-0 focus-visible:ring-offset-0 px-0 min-w-0 resize-none"
                          onKeyDown={(e) => {
                            if (e.key === "Enter" && !e.shiftKey) {
                              e.preventDefault();
                              send();
                            }
                          }}
                          autoComplete="off"
                        />
                      </div>

                      {/* Right Actions: Send Button Only */}
                      <div className="shrink-0 flex items-center gap-1">
                        <Button
                          onClick={() => send()}
                          disabled={isLoading || !question.trim()}
                          size="icon"
                          className="rounded-full h-10 w-10 bg-primary hover:bg-primary/90 text-primary-foreground shadow-sm transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <ArrowUpRight className="w-5 h-5 ml-0.5" />}
                        </Button>
                      </div>

                    </div>
                    <div className="h-1"></div> {/* Bottom Spacer */}
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
