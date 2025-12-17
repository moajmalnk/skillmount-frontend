import { useEffect, useMemo, useRef, useState } from "react";
import { MessageSquare, Sparkles, X, Loader2, ArrowUpRight, Copy, Bot } from "lucide-react";
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

export const ChatWidget = () => {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [question, setQuestion] = useState("");
  const [sessionId, setSessionId] = useState<string | undefined>(undefined);
  const [turns, setTurns] = useState<Turn[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const typingIntervalRef = useRef<number | null>(null);

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

  useEffect(() => {
    if (isOpen) {
      chatService.history().then((data) => {
        const flat: Turn[] = (data || []).flatMap((s: any) =>
          (s.turns || []).map((t: any) => ({
            id: t.id,
            question: t.question,
            answer: t.answer,
            sources: t.sources || [],
            displayedAnswer: t.answer,
            isTyping: false,
          }))
        );
        setTurns(flat.slice(-6)); // keep chronological recent
      });
    }
  }, [isOpen]);

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

  const send = async () => {
    if (!question.trim()) return;
    if (!user) {
      toast.error("Please log in to use the assistant.");
      return;
    }
    setIsLoading(true);
    try {
      const res = await chatService.ask(question, sessionId);
      setSessionId(res.session_id);
      const fullAnswer = res.answer || "";

      const newTurn: Turn = {
        id: res.turn_id,
        question,
        answer: fullAnswer,
        sources: res.sources || [],
        displayedAnswer: "",
        isTyping: true,
      };

      setTurns((prev) => {
        // ensure only the latest one is typing
        const withoutTyping = prev.map((t) => ({ ...t, isTyping: false }));
        const next = [...withoutTyping, newTurn].slice(-6);
        return next;
      });

      // Start the typewriter animation for this answer
      startTypingAnimation(newTurn.id, fullAnswer);
      setQuestion("");
    } catch (err: any) {
      toast.error(err?.response?.data?.detail || "Could not fetch answer.");
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
          className="shadow-lg rounded-full gap-2 pointer-events-auto"
        >
          <Sparkles className="w-4 h-4" />
          Study Assistant
        </Button>
      </div>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-2 py-4 sm:px-4 sm:py-6">
          {/* Fixed-height shell so input can stay pinned to the bottom */}
          <Card className="w-full max-w-full sm:max-w-5xl h-[90vh] sm:h-[85vh] flex flex-col overflow-hidden">
            <CardHeader className="flex flex-row items-center justify-between shrink-0">
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-primary" />
                Study Assistant
              </CardTitle>
              <div className="flex items-center gap-2">
                <Badge variant="secondary">Materials + Blog + FAQ</Badge>
                <Button size="icon" variant="ghost" onClick={() => setIsOpen(false)}>
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="flex flex-1 flex-col md:flex-row gap-4 md:gap-6 overflow-hidden min-h-0">
              {/* LEFT: chat area */}
              <div className="w-full md:w-[55%] flex flex-col flex-1 min-h-0 gap-3">
                <div className="flex items-center justify-between bg-muted/50 border rounded-xl px-3 py-2">
                  <div className="flex items-center gap-3">
                    <div className="h-9 w-9 rounded-full bg-primary/10 border border-primary/30 flex items-center justify-center">
                      <Bot className="w-4 h-4 text-primary" />
                    </div>
                    <div className="flex flex-col leading-tight">
                      <span className="text-sm font-semibold">Study Assistant</span>
                      <span className="text-xs text-green-500">Online</span>
                    </div>
                  </div>
                  <Badge variant="outline" className="text-xs">Materials · Blog · FAQ</Badge>
                </div>
                {/* Scrollable content: suggestions + conversation history */}
                {/* Messages area: scrolls independently, leaving input pinned at bottom */}
                <div
                  ref={scrollRef}
                  className="flex-1 min-h-0 overflow-y-auto space-y-3 pr-1 sm:pr-2 scrollbar-thin scrollbar-thumb-rounded-full scrollbar-track-transparent scrollbar-thumb-muted-foreground/20"
                >
                  <div className="flex gap-2 flex-wrap sm:flex-wrap">
                    {suggestions.map((s) => (
                      <Button key={s} size="sm" variant="secondary" className="rounded-full" onClick={() => setQuestion(s)}>
                        {s}
                      </Button>
                    ))}
                  </div>
                  <div className="bg-background/40 border rounded-2xl p-3 space-y-3">
                    {turns.length === 0 && (
                      <div className="text-sm text-muted-foreground border rounded-lg p-4 text-center">
                        Ask anything about materials, blogs, or FAQs. We'll cite what we use.
                      </div>
                    )}
                    {turns.map((turn) => (
                      <div key={turn.id} className="space-y-2">
                        <div className="flex justify-end">
                          <div className="max-w-[80%] rounded-3xl rounded-br-md bg-primary text-primary-foreground px-4 py-3 text-sm shadow-md whitespace-pre-wrap flex gap-2">
                            <div className="flex-1">{turn.question}</div>
                            <div className="self-end text-[10px] opacity-80">You</div>
                          </div>
                        </div>
                        <div className="flex justify-start">
                          <div className="max-w-[80%] rounded-3xl rounded-bl-md bg-card border border-border/60 px-4 py-3 text-sm shadow-sm space-y-3">
                            <div className="flex items-center justify-between gap-2">
                              <div className="flex items-center gap-2">
                                <div className="h-7 w-7 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center">
                                  <Bot className="w-3.5 h-3.5 text-primary" />
                                </div>
                                <span className="font-semibold text-foreground">Assistant</span>
                              </div>
                              <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => copyAnswer(turn.answer)}>
                                <Copy className="w-4 h-4" />
                              </Button>
                            </div>
                            <div className="text-foreground whitespace-pre-wrap">
                              {turn.displayedAnswer || turn.answer}
                              {turn.isTyping && <span className="animate-pulse opacity-60">▋</span>}
                            </div>
                            {turn.sources?.length > 0 && !turn.isTyping && (
                              <div className="space-y-2">
                                <div className="text-xs font-semibold text-muted-foreground">Sources</div>
                                <div className="flex flex-col gap-2">
                                  {turn.sources.map((s) => (
                                    <a
                                      key={s.id}
                                      href={s.url || "#"}
                                      className="flex items-center justify-between text-sm border rounded-lg px-3 py-2 hover:bg-background"
                                      target="_blank"
                                      rel="noreferrer"
                                    >
                                      <div className="flex flex-col">
                                        <span className="font-medium">{s.title}</span>
                                        <span className="text-xs text-muted-foreground uppercase">{s.source_type}</span>
                                      </div>
                                      <Button variant="outline" size="sm" className="h-8">
                                        {s.source_type === "material" ? "Download" : "Open"}
                                      </Button>
                                    </a>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                {/* Input: pinned to bottom of left column */}
                <div className="mt-1 md:mt-0 shrink-0">
                  <div className="flex items-center gap-2 bg-muted/70 border rounded-full px-3 sm:px-4 py-2 shadow-sm">
                    <Input
                      placeholder="Ask anything about your course materials..."
                      value={question}
                      onChange={(e) => setQuestion(e.target.value)}
                      className="border-none shadow-none bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0"
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && !e.shiftKey) {
                          e.preventDefault();
                          send();
                        }
                      }}
                    />
                    <Button onClick={send} disabled={isLoading} size="icon" className="rounded-full shrink-0">
                      {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <ArrowUpRight className="w-4 h-4" />}
                    </Button>
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">Press Enter to send</div>
                </div>
              </div>
              {/* RIGHT: info column (hidden on mobile) */}
              <Separator orientation="vertical" className="hidden md:block" />
              <div className="hidden md:flex w-[45%] flex-1 flex-col gap-3 overflow-y-auto min-h-0">
                <div className="border rounded-lg p-4 space-y-2">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-primary" />
                    <span className="text-sm font-semibold">What can I ask?</span>
                  </div>
                  <ul className="text-sm text-muted-foreground list-disc list-inside space-y-1">
                    <li>Find the right video or plugin for a topic.</li>
                    <li>Ask for step-by-step guidance based on our materials.</li>
                    <li>Get quick links to blogs and FAQs.</li>
                  </ul>
                </div>
                <div className="border rounded-lg p-4 space-y-2">
                  <div className="text-sm font-semibold">Tips</div>
                  <ul className="text-sm text-muted-foreground list-disc list-inside space-y-1">
                    <li>Add keywords like "React hooks", "WordPress", "Hostinger".</li>
                    <li>Be specific: "short video about API auth"</li>
                    <li>We cite sources so you can open them quickly.</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </>
  );
};
