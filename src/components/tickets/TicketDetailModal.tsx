import { useState, useEffect, useRef } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { X, Trash2, Edit2, Send, Paperclip, MessageSquare, FileText, CheckCircle2, ChevronDown, Mic, Loader2 } from "lucide-react";
import { VoiceRecorder } from "@/components/tickets/VoiceRecorder";
import { toast } from "sonner";
import { Ticket } from "@/types/ticket";
import { ticketService } from "@/services/ticketService";
import { systemService } from "@/services/systemService";
import { MacroSelector } from "./MacroSelector";

interface TicketDetailModalProps {
  ticket: Ticket | null;
  isOpen: boolean;
  onClose: () => void;
  role?: "admin" | "tutor" | "student";
  currentUserId?: number | string; // Needed to correctly align "My Messages"
  onDelete?: (id: string) => void;
  onUpdate?: () => void; // Trigger refresh parent
}

export const TicketDetailModal = ({
  ticket,
  isOpen,
  onClose,
  role = "admin",
  currentUserId,
  onDelete,
  onUpdate
}: TicketDetailModalProps) => {
  const [activeView, setActiveView] = useState<"details" | "summary">("details");
  const [replyText, setReplyText] = useState("");
  const [voiceBlob, setVoiceBlob] = useState<Blob | null>(null);
  const [attachment, setAttachment] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [macros, setMacros] = useState<string[]>([]);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const isSupportRole = role === "admin" || role === "tutor";

  const isClosed = ticket?.status === "Closed";
  const canReply = isSupportRole || !isClosed;

  useEffect(() => {
    const loadMacros = async () => {
      // Only admins/tutors need macros
      if (isOpen && isSupportRole) {
        try {
          const settings = await systemService.getSettings();
          if (settings.macros && settings.macros.length > 0) {
            setMacros(settings.macros);
          }
        } catch (e) {
          console.error("Failed to load macros", e);
        }
      }
    };
    loadMacros();
  }, [isOpen, isSupportRole]);

  if (!ticket) return null;

  const handleMacroSelect = (value: string) => {
    setReplyText(prev => prev + (prev ? "\n" : "") + value);
    setTimeout(() => textareaRef.current?.focus(), 50);
  };

  // ... (rest of functions) ...

  // SKIP to Render part where MacroSelector is used


  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      setAttachment(e.target.files[0]);
    }
  };

  const handleAssign = async (userId: number | null) => {
    if (!ticket) return;
    try {
      await ticketService.assign(ticket.id, userId);
      if (onUpdate) onUpdate();
    } catch (e) { toast.error("Failed to assign ticket"); }
  };

  const handleSendReply = async (closeTicket: boolean = false) => {
    if (!replyText && !voiceBlob && !attachment) {
      toast.error("Please enter a message, record voice, or attach a file.");
      return;
    }

    setIsSubmitting(true);
    try {
      await ticketService.reply(ticket.id, replyText, voiceBlob || undefined, attachment || undefined);

      // If Admin wants to close it immediately
      if (closeTicket && isSupportRole) {
        await ticketService.updateStatus(ticket.id, 'Closed');
        toast.success("Reply sent & Ticket Closed");
      } else {
        toast.success("Reply sent successfully");
      }

      // Reset
      setReplyText("");
      setVoiceBlob(null);
      setAttachment(null);

      // Notify parent to refresh
      if (onUpdate) onUpdate();

      // If closed, maybe close modal?
      if (closeTicket) onClose();

    } catch (error: any) {
      // Backend returns "detail" in error
      toast.error(error.response?.data?.detail || "Failed to send reply");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleStatusChange = async (newStatus: 'Closed' | 'Reopened') => {
    try {
      await ticketService.updateStatus(ticket.id, newStatus);
      toast.success(`Ticket ${newStatus}`);
      if (onUpdate) onUpdate();
    } catch (e) {
      toast.error("Failed to update status");
    }
  };

  const handleDelete = () => {
    if (window.confirm("Are you sure you want to delete this ticket?")) {
      if (onDelete) onDelete(ticket.id);
      onClose();
    }
  };

  // --- SUB-COMPONENTS ---
  const SummaryView = () => (
    <div className="p-4 sm:p-6 space-y-6 animate-in fade-in zoom-in-95 duration-200 overflow-y-auto h-full">
      <h3 className="font-semibold text-lg text-foreground">Ticket Summary</h3>
      <div className="bg-primary/5 border border-primary/10 rounded-xl p-4 flex flex-col sm:flex-row items-center sm:items-start gap-4 text-center sm:text-left">
        <Avatar className="h-14 w-14 border-2 border-background shadow-sm">
          <AvatarFallback className="bg-primary text-primary-foreground font-bold text-xl">
            {ticket.student?.name?.substring(0, 2).toUpperCase() || "ST"}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1 overflow-hidden w-full">
          <div className="font-bold text-xl truncate">{ticket.student?.name || "Student"}</div>
          <div className="text-xs text-primary font-mono bg-primary/10 px-2 py-0.5 rounded-full w-fit mt-1 mx-auto sm:mx-0">
            {ticket.student?.id || "N/A"}
          </div>
          <div className="text-sm text-muted-foreground mt-1 truncate">
            {ticket.student?.email}
          </div>
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
        <div className="p-3 sm:p-4 rounded-xl border border-border bg-card">
          <div className="text-[10px] text-muted-foreground mb-1 uppercase tracking-wider">Ticket Code</div>
          <div className="font-mono font-medium text-sm sm:text-base truncate">{ticket.id}</div>
        </div>
        <div className="p-3 sm:p-4 rounded-xl border border-border bg-card">
          <div className="text-[10px] text-muted-foreground mb-1 uppercase tracking-wider">Category</div>
          <div className="font-medium text-sm sm:text-base">{ticket.category}</div>
        </div>
        <div className="p-3 sm:p-4 rounded-xl border border-border bg-card">
          <div className="text-[10px] text-muted-foreground mb-1 uppercase tracking-wider">Status</div>
          <Badge variant={ticket.status === "Open" ? "default" : "secondary"} className="mt-1">
            {ticket.status}
          </Badge>
        </div>
        <div className="p-3 sm:p-4 rounded-xl border border-border bg-card">
          <div className="text-[10px] text-muted-foreground mb-1 uppercase tracking-wider">Priority</div>
          <Badge
            variant="outline"
            className={`mt-1 ${ticket.priority === "High" || ticket.priority === "Urgent"
              ? "text-red-500 border-red-200 bg-red-50"
              : ""
              }`}
          >
            {ticket.priority}
          </Badge>
        </div>

        {/* ASSIGNED TO */}
        <div className="p-3 sm:p-4 rounded-xl border border-border bg-card col-span-1 sm:col-span-2">
          <div className="text-[10px] text-muted-foreground mb-2 uppercase tracking-wider">Assigned To</div>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            {ticket.assigned_to ? (
              <div className="flex items-center gap-3">
                <Avatar className="h-8 w-8 border border-border">
                  <AvatarFallback className="text-xs bg-muted">
                    {ticket.assigned_to_details?.name?.substring(0, 2).toUpperCase() || "ID"}
                  </AvatarFallback>
                </Avatar>
                <div className="flex flex-col">
                  <span className="font-semibold text-sm">{ticket.assigned_to_details?.name || `User ${ticket.assigned_to}`}</span>
                  <span className="text-[10px] text-muted-foreground">Support Agent</span>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-2 text-muted-foreground text-sm italic">
                <div className="h-2 w-2 rounded-full bg-yellow-400"></div>
                Unassigned
              </div>
            )}

            {/* Show Action Button here on mobile for easier access */}
            {isSupportRole && (
              <div className="sm:hidden mt-2">
                {ticket.assigned_to ? (
                  (role === "admin" || String(currentUserId) === String(ticket.assigned_to)) && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleAssign(null)}
                      className="w-full text-xs h-8 border-dashed hover:border-solid"
                    >
                      Unassign
                    </Button>
                  )
                ) : (
                  <Button
                    size="sm"
                    variant="default"
                    onClick={() => handleAssign(Number(currentUserId))}
                    className="w-full text-xs h-8"
                  >
                    Claim Ticket
                  </Button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  const DetailsView = () => (
    <div className="flex flex-col h-full animate-in fade-in zoom-in-95 duration-200 overflow-hidden">
      {/* Messages Header - Compact */}
      <div className="px-4 sm:px-6 py-3 sm:py-4 border-b border-border/40 bg-background/50 backdrop-blur-sm sticky top-0 z-10 flex justify-between items-center shrink-0">
        <div className="overflow-hidden mr-2">
          <h2 className="font-bold text-base sm:text-lg leading-tight truncate" title={ticket.title}>{ticket.title}</h2>
          <div className="flex items-center gap-2 mt-0.5 text-[10px] sm:text-xs text-muted-foreground">
            <span className="font-mono hidden sm:inline">{ticket.id}</span>
            <span className="hidden sm:inline">•</span>
            <span className="truncate">{new Date(ticket.created_at).toLocaleDateString()}</span>
          </div>
        </div>
        <div className="flex gap-1 sm:gap-2 shrink-0">
          <Badge variant={ticket.status === 'Open' ? 'default' : 'secondary'} className="text-[10px] px-1.5">{ticket.status}</Badge>
          <Badge variant="outline" className="text-[10px] px-1.5 hidden xs:inline-flex">{ticket.priority}</Badge>
        </div>
      </div>

      {/* Message History */}
      <ScrollArea className="flex-1 p-3 sm:p-6 bg-muted/5">
        <div className="space-y-4 sm:space-y-6 max-w-3xl mx-auto">
          {/* Initial Description */}
          <div className="flex gap-3 sm:gap-4">
            <Avatar className="h-7 w-7 sm:h-8 sm:w-8 mt-1 border border-border shrink-0">
              <AvatarFallback className="bg-primary/10 text-primary text-[10px] sm:text-xs">
                {ticket.student?.name?.substring(0, 2).toUpperCase() || "ST"}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 overflow-hidden">
              <div className="flex items-baseline gap-2 mb-1 overflow-hidden">
                <span className="text-xs sm:text-sm font-semibold truncate">{ticket.student?.name}</span>
                <span className="text-[9px] sm:text-[10px] text-muted-foreground shrink-0">Original Request</span>
              </div>
              <div className="p-3 sm:p-4 rounded-2xl rounded-tl-none bg-background border border-border text-xs sm:text-sm leading-relaxed shadow-sm break-words">
                {ticket.description}
              </div>
            </div>
          </div>

          {/* Messages */}
          {ticket.messages?.map((msg: any) => {
            let isMe = false;
            if (currentUserId) {
              isMe = String(msg.sender) === String(currentUserId);
            } else {
              isMe = role === "student" ? msg.sender_name === ticket.student?.name : msg.sender_name !== ticket.student?.name;
            }

            return (
              <div
                key={msg.id}
                className={`flex gap-2 sm:gap-3 ${isMe ? "flex-row-reverse" : "flex-row"}`}
              >
                <Avatar className="h-7 w-7 sm:h-8 sm:w-8 mt-1 border border-border bg-background shrink-0">
                  <AvatarFallback className={`text-[10px] ${isMe ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>
                    {msg.sender_name?.substring(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>

                <div
                  className={`
                  max-w-[85%] sm:max-w-[75%] rounded-2xl p-3 sm:p-3.5 shadow-sm text-xs sm:text-sm
                  ${isMe
                      ? "bg-primary text-primary-foreground rounded-tr-none"
                      : "bg-background border border-border rounded-tl-none"
                    }
                `}
                >
                  <div className="space-y-2">
                    <p className="whitespace-pre-wrap leading-relaxed break-words">
                      {msg.message}
                    </p>
                    {msg.voice_note && (
                      <div className={`mt-2 rounded-lg p-1.5 sm:p-2 ${isMe ? 'bg-white/10' : 'bg-muted'}`}>
                        <audio controls className="w-full h-8 max-w-[180px] sm:max-w-[220px]" src={msg.voice_note} />
                      </div>
                    )}
                    {msg.attachment && (
                      <a
                        href={msg.attachment}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`group flex items-center gap-2 sm:gap-3 p-1.5 sm:p-2 rounded-lg transition-colors border ${isMe ? 'bg-white/10 border-white/20 hover:bg-white/20' : 'bg-muted hover:bg-muted/80 border-border'}`}
                      >
                        <div className={`p-1.5 sm:p-2 rounded-md ${isMe ? 'bg-white/20' : 'bg-background'}`}>
                          <Paperclip className="w-3 h-3 sm:w-4 sm:h-4" />
                        </div>
                        <div className="flex flex-col overflow-hidden">
                          <span className="text-[10px] sm:text-xs font-medium truncate max-w-[120px] sm:max-w-[150px]">Attachment</span>
                          <span className="text-[8px] sm:text-[10px] opacity-70">Click to view</span>
                        </div>
                      </a>
                    )}
                  </div>
                  <div className={`text-[9px] sm:text-[10px] mt-1.5 opacity-60 ${isMe ? 'text-right' : 'text-left'}`}>
                    {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </ScrollArea>

      {/* Reply Section */}
      <div className="p-3 sm:p-4 bg-background border-t border-border shadow-[0_-5px_20px_-10px_rgba(0,0,0,0.1)] z-20 shrink-0">
        {canReply ? (
          <div className="max-w-4xl mx-auto flex flex-col gap-2 sm:gap-3">
            <div className="flex items-center justify-between gap-2 overflow-x-auto no-scrollbar py-1">
              {isSupportRole && macros.length > 0 && (
                <div className="flex-1 min-w-[160px] max-w-[240px] sm:max-w-[300px]">
                  <MacroSelector macros={macros} onSelect={handleMacroSelect} />
                </div>
              )}
              <div className="flex items-center gap-1 sm:gap-2 ml-auto shrink-0">
                <div className="flex items-center border rounded-md p-0.5 sm:p-1 gap-0.5 sm:gap-1">
                  <VoiceRecorder onRecordingComplete={setVoiceBlob} onDelete={() => setVoiceBlob(null)} variant="compact" />
                  <div className={`relative flex items-center justify-center h-7 w-7 sm:h-8 sm:w-8 rounded-md hover:bg-muted cursor-pointer transition-colors ${attachment ? 'text-primary bg-primary/10' : 'text-muted-foreground'}`} title="Attach File">
                    <input type="file" className="absolute inset-0 opacity-0 cursor-pointer" onChange={handleFileChange} />
                    <Paperclip className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                    {attachment && <span className="absolute top-0.5 right-0.5 w-1.5 h-1.5 bg-primary rounded-full" />}
                  </div>
                </div>
              </div>
            </div>

            <div className="flex gap-2 sm:gap-3 items-end">
              <Textarea
                ref={textareaRef}
                placeholder="Type your reply..."
                className="min-h-[40px] max-h-[120px] resize-none py-2.5 sm:py-3 text-xs sm:text-sm"
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                rows={1}
              />
              <Button size="icon" onClick={() => handleSendReply(false)} disabled={isSubmitting} className="h-9 w-9 sm:h-10 sm:w-10 shrink-0 shadow-sm">
                {isSubmitting ? <Loader2 className="w-3 h-3 sm:w-4 sm:h-4 animate-spin" /> : <Send className="w-3.5 h-3.5 sm:w-4 sm:h-4" />}
              </Button>
            </div>

            {(attachment || voiceBlob) && (
              <div className="flex gap-2 overflow-x-auto py-1 no-scrollbar">
                {attachment && (
                  <Badge variant="secondary" className="gap-1.5 py-0.5 pl-2 pr-1 text-[10px]">
                    <Paperclip className="w-2.5 h-2.5" />
                    <span className="max-w-[80px] sm:max-w-[120px] truncate">{attachment.name}</span>
                    <button onClick={() => setAttachment(null)} className="ml-1 hover:bg-background/50 rounded-full p-0.5"><X className="w-2.5 h-2.5" /></button>
                  </Badge>
                )}
                {voiceBlob && (
                  <Badge variant="secondary" className="gap-1.5 py-0.5 pl-2 pr-1 bg-purple-50 text-purple-700 text-[10px]">
                    <Mic className="w-2.5 h-2.5" />
                    <span>Voice Recorded</span>
                    <button onClick={() => setVoiceBlob(null)} className="ml-1 hover:bg-background/50 rounded-full p-0.5"><X className="w-2.5 h-2.5" /></button>
                  </Badge>
                )}
              </div>
            )}
          </div>
        ) : (
          <div className="flex items-center justify-center gap-3 py-1">
            <div className="flex items-center gap-1.5 text-muted-foreground bg-muted/50 px-3 py-1.5 rounded-full text-[10px] sm:text-xs">
              <CheckCircle2 className="w-3.5 h-3.5" /> This ticket is closed.
            </div>
            <Button variant="outline" size="sm" className="h-8 text-[10px] sm:text-xs" onClick={() => handleStatusChange("Reopened")}>
              Reopen
            </Button>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl p-0 w-[95vw] sm:w-[90vw] md:w-full h-[90vh] sm:h-[85vh] max-h-[850px] overflow-hidden flex flex-col sm:flex-row gap-0 outline-none border-none shadow-2xl rounded-2xl bg-background">
        {/* LEFT SIDEBAR - Adaptive for Mobile */}
        <div className="w-full sm:w-56 bg-muted/30 border-b sm:border-r border-border/50 flex flex-row sm:flex-col justify-between p-2 sm:p-4 shrink-0 overflow-hidden">
          <div className="flex flex-row sm:flex-col gap-2 sm:gap-6 flex-1 items-center sm:items-stretch overflow-x-auto no-scrollbar">
            <div className="flex flex-row sm:flex-col gap-1 w-full shrink-0 sm:shrink">
              <h3 className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-2 px-3 hidden sm:block">Menu</h3>
              <div className="flex flex-row sm:flex-col gap-1 w-full">
                <Button
                  variant={activeView === "details" ? "secondary" : "ghost"}
                  className={`flex-1 sm:flex-none justify-center sm:justify-start text-xs sm:text-sm font-medium h-9 sm:h-10 ${activeView === 'details' ? 'bg-white shadow-sm dark:bg-muted text-primary' : 'text-muted-foreground'}`}
                  onClick={() => setActiveView("details")}
                >
                  <div className={`sm:mr-3 p-1 rounded-md ${activeView === 'details' ? 'bg-primary/10 text-primary' : ''}`}>
                    <MessageSquare className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  </div>
                  <span className="hidden xs:inline">Conversation</span>
                </Button>
                <Button
                  variant={activeView === "summary" ? "secondary" : "ghost"}
                  className={`flex-1 sm:flex-none justify-center sm:justify-start text-xs sm:text-sm font-medium h-9 sm:h-10 ${activeView === 'summary' ? 'bg-white shadow-sm dark:bg-muted text-primary' : 'text-muted-foreground'}`}
                  onClick={() => setActiveView("summary")}
                >
                  <div className={`sm:mr-3 p-1 rounded-md ${activeView === 'summary' ? 'bg-primary/10 text-primary' : ''}`}>
                    <FileText className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  </div>
                  <span className="hidden xs:inline">Info & Metadata</span>
                </Button>
              </div>
            </div>

            {/* Assignment Section - Hidden on Mobile Sidebar */}
            {isSupportRole && (
              <div className="hidden sm:block space-y-3 pt-4 border-t border-border/50">
                <h3 className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider px-3">Assignment</h3>
                <div className="bg-background rounded-xl p-3 border border-border shadow-sm mx-1">
                  {ticket?.assigned_to ? (
                    <div className="space-y-3">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-8 w-8 border">
                          <AvatarFallback className="text-[10px]">
                            {ticket.assigned_to_details?.name?.substring(0, 2).toUpperCase() || "ID"}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex flex-col overflow-hidden">
                          <span className="text-xs font-semibold truncate">{ticket.assigned_to_details?.name}</span>
                          <span className="text-[10px] text-muted-foreground">Assignee</span>
                        </div>
                      </div>
                      {(role === "admin" || String(currentUserId) === String(ticket.assigned_to)) && (
                        <Button variant="outline" size="sm" onClick={() => handleAssign(null)} className="w-full text-xs h-8 border-dashed hover:border-solid">
                          Unassign
                        </Button>
                      )}
                    </div>
                  ) : (
                    <div className="text-center">
                      <div className="text-xs text-muted-foreground mb-3">No one is assigned</div>
                      <Button size="sm" variant="default" onClick={() => handleAssign(Number(currentUserId))} className="w-full text-xs h-8">
                        Claim Ticket
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          <div className="flex items-center gap-2 px-1 shrink-0">
            {role === "admin" && onDelete && (
              <Button variant="ghost" size="icon" onClick={handleDelete} className="text-muted-foreground hover:text-destructive hover:bg-destructive/10 h-8 w-8 sm:h-9 sm:w-9 shrink-0">
                <Trash2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              </Button>
            )}
            <Button variant="ghost" className="text-[10px] sm:text-xs text-muted-foreground h-8 px-2 sm:px-3" onClick={onClose}>
              Close
            </Button>
          </div>
        </div>

        {/* RIGHT CONTENT */}
        <div className="flex-1 bg-background relative flex flex-col min-h-0">
          {activeView === "details" ? <DetailsView /> : <SummaryView />}
        </div>
      </DialogContent>
    </Dialog>
  );
};