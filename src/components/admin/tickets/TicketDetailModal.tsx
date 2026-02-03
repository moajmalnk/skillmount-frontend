import { useState, useEffect, useRef } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { X, Trash2, Send, Paperclip, MessageSquare, FileText, CheckCircle2, Mic, Loader2, ScrollText, Edit, XCircle, Maximize2, Minimize2 } from "lucide-react";
import { VoiceRecorder } from "@/components/tickets/VoiceRecorder";
import { TicketAudioPlayer } from "@/components/tickets/TicketAudioPlayer";
import { toast } from "sonner";
import { Ticket } from "@/types/ticket";
import { ticketService } from "@/services/ticketService";
import { systemService } from "@/services/systemService";
import { MacroSelector } from "@/components/tickets/MacroSelector";
import { useAuth } from "@/context/AuthContext";
import { MacroItem } from "@/services/systemService";
import { EditTicketDialog } from "./EditTicketDialog";
import { TicketLogView } from "./TicketLogView";

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
  ticket: initialTicket,
  isOpen,
  onClose,
  role = "admin",
  currentUserId,
  onDelete,
  onUpdate
}: TicketDetailModalProps) => {
  const { user } = useAuth(); // Needed for 'ME' avatar fallback

  const [ticket, setTicket] = useState<Ticket | null>(initialTicket);
  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    setTicket(initialTicket);
    if (isOpen) {
      setActiveView("details");
    }
  }, [initialTicket, isOpen]);

  const [activeView, setActiveView] = useState<"details" | "summary" | "log">("details");
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [replyText, setReplyText] = useState("");
  const [voiceBlob, setVoiceBlob] = useState<Blob | null>(null);
  const [attachment, setAttachment] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [macros, setMacros] = useState<MacroItem[]>([]);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [ticket?.messages, activeView]);

  const isSupportRole = role === "admin" || role === "tutor";
  const isClosed = ticket?.status === "Closed";
  const canReply = isSupportRole || !isClosed;

  useEffect(() => {
    const loadMacros = async () => {
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

  const handleMacroSelect = (description: string) => {
    setReplyText((prev) => prev + (prev ? "\n" : "") + description);
    setTimeout(() => textareaRef.current?.focus(), 50);
  };
  // ...

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
    } catch (e) {
      toast.error("Failed to assign ticket");
    }
  };

  const handleSendReply = async (closeTicket: boolean = false) => {
    if (!replyText && !voiceBlob && !attachment) {
      toast.error("Please enter a message, record voice, or attach a file.");
      return;
    }

    setIsSubmitting(true);
    try {
      const newMessage = await ticketService.reply(
        ticket.id,
        replyText,
        voiceBlob || undefined,
        attachment || undefined
      );

      // Immediately update local state
      if (ticket) {
        setTicket({
          ...ticket,
          status: isSupportRole ? "In Progress" : "Open", // Optimistic status update
          messages: [...(ticket.messages || []), newMessage]
        });
      }

      if (closeTicket && isSupportRole) {
        await ticketService.updateStatus(ticket.id, "Closed");
        toast.success("Reply sent & Ticket Closed");
      } else {
        toast.success("Reply sent successfully");
      }

      setReplyText("");
      setVoiceBlob(null);
      setAttachment(null);
      if (onUpdate) onUpdate();
      if (closeTicket) onClose();
    } catch (error: any) {
      toast.error(error.response?.data?.detail || "Failed to send reply");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleStatusChange = async (newStatus: "Closed" | "Reopened") => {
    try {
      await ticketService.updateStatus(ticket.id, newStatus);
      if (ticket) {
        setTicket({ ...ticket, status: newStatus });
      }
      toast.success(`Ticket ${newStatus}`);
      if (onUpdate) onUpdate();
    } catch (e) {
      toast.error("Failed to update status");
    }
  };

  const handleDelete = () => {
    setShowDeleteDialog(true);
  };

  const confirmDelete = () => {
    if (onDelete && ticket) {
      onDelete(ticket.id);
      setShowDeleteDialog(false);
      onClose();
    }
  };

  // --- SUB-COMPONENTS ---
  const SummaryView = () => (
    <div className="p-4 sm:p-6 pr-12 space-y-6 animate-in fade-in zoom-in-95 duration-200 overflow-y-auto h-full">
      <h3 className="font-semibold text-lg text-foreground">Ticket Summary</h3>
      <div className="bg-muted/30 border border-muted rounded-xl p-4 flex flex-col sm:flex-row items-center sm:items-start gap-4 text-center sm:text-left">
        <Avatar className="h-14 w-14 border-2 border-background shadow-sm">
          <AvatarFallback className="bg-primary/10 text-primary font-bold text-xl">
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
        {[
          { label: "Ticket Code", value: ticket.id, mono: true },
          { label: "Category", value: ticket.category },
          { label: "Created At", value: new Date(ticket.created_at).toLocaleDateString() },
          { label: "Last Updated", value: new Date(ticket.created_at).toLocaleDateString() },
        ].map((item, i) => (
          <div key={i} className="p-3 sm:p-4 rounded-xl border border-border bg-card">
            <div className="text-[10px] text-muted-foreground mb-1 uppercase tracking-wider">{item.label}</div>
            <div className={`font-medium text-sm sm:text-base ${item.mono ? "font-mono" : ""}`}>
              {item.value}
            </div>
          </div>
        ))}

        <div className="p-3 sm:p-4 rounded-xl border border-border bg-card">
          <div className="text-[10px] text-muted-foreground mb-1 uppercase tracking-wider">Status</div>
          <Badge
            variant={ticket.status === "Open" ? "default" : "secondary"}
            className="mt-1"
          >
            {ticket.status}
          </Badge>
        </div>
        <div className="p-3 sm:p-4 rounded-xl border border-border bg-card">
          <div className="text-[10px] text-muted-foreground mb-1 uppercase tracking-wider">Priority</div>
          <Badge
            variant="outline"
            className={`mt-1 ${ticket.priority === "High" || ticket.priority === "Urgent"
              ? "text-red-500 border-red-200 bg-red-50 dark:bg-red-950/20"
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
      {/* Messages Header - Compact - Increased padding to strictly avoid Close button overlap */}
      <div className="px-4 sm:px-6 pr-36 border-b border-border/40 bg-background/50 backdrop-blur-sm sticky top-0 z-10 flex justify-between items-center shrink-0 h-[60px] sm:h-[72px]">
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
          <div className="w-16 sm:w-20 shrink-0" /> {/* Spacer for global controls */}
        </div>
      </div>

      {/* Message History */}
      {/* Message History */}
      <ScrollArea className="flex-1 bg-background/50">
        <div className="p-4 sm:p-6 space-y-4 max-w-4xl mx-auto flex flex-col relative z-10">

          {/* Original Request as the FIRST Message - Professional Context Card */}
          <div className="flex gap-4 w-full justify-center mb-4">
            <div className="w-full max-w-3xl">
              <div className="bg-amber-50/50 dark:bg-amber-950/10 border border-amber-200/50 dark:border-amber-900/30 rounded-xl p-4 text-sm text-foreground relative">
                <div className="flex items-center gap-2 mb-2">
                  <Avatar className="h-6 w-6 border border-amber-200/50">
                    <AvatarFallback className="bg-amber-100 text-amber-700 text-[9px]">
                      {ticket.student?.name?.substring(0, 2).toUpperCase() || "ST"}
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-xs font-semibold text-amber-800 dark:text-amber-500">Original Request</span>
                  <span className="text-[10px] text-muted-foreground ml-auto">{new Date(ticket.created_at).toLocaleString()}</span>
                </div>
                <p className="whitespace-pre-wrap leading-relaxed text-foreground/90 pl-8">
                  {ticket.description}
                </p>
              </div>
            </div>
          </div>

          {/* Date Divider (Simple) */}
          <div className="flex justify-center py-2">
            <span className="text-[10px] bg-black/5 dark:bg-white/5 text-muted-foreground px-2 py-0.5 rounded-full shadow-sm">
              {new Date(ticket.created_at).toLocaleDateString()}
            </span>
          </div>

          {/* Messages */}
          {ticket.messages?.map((msg: any) => {
            let isMe = false;
            if (currentUserId) {
              isMe = String(msg.sender) === String(currentUserId);
            } else {
              if (role === "student") {
                isMe = msg.sender_name === ticket.student?.name;
              } else {
                isMe = msg.sender_name !== ticket.student?.name;
              }
            }

            // Detect Media Type
            const isImage = msg.attachment && /\.(jpg|jpeg|png|gif|webp)$/i.test(msg.attachment);

            // Clean Message Text
            // If message is just "Attachment Sent" etc and we show the image, hide text.
            const hasMedia = msg.voice_note || isImage || msg.attachment;
            const isRedundantText = hasMedia && (msg.message === '[Voice Note Sent]' || msg.message === '[Attachment Sent]' || msg.message === '[Initial Attachments]');
            const showText = !isRedundantText && msg.message;

            return (
              <div
                key={msg.id}
                className={`flex gap-1 w-full animate-in fade-in slide-in-from-bottom-1 duration-200 group ${isMe ? "justify-end" : "justify-start"}`}
              >
                {/* Avatar (Only for others) */}
                {!isMe && (
                  <Avatar className="h-6 w-6 mt-0 border border-border shadow-sm shrink-0 self-start">
                    <AvatarFallback className="bg-muted text-muted-foreground text-[8px]">
                      {msg.sender_name?.substring(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                )}

                <div className={`flex flex-col items-${isMe ? "end" : "start"} max-w-[85%] sm:max-w-[70%]`}>
                  {/* Bubble */}
                  <div
                    className={`
                      relative shadow-sm text-sm break-words flex flex-col transition-all
                      ${isMe
                        ? "bg-primary text-primary-foreground dark:bg-muted dark:text-foreground dark:border-primary/30 dark:border rounded-xl rounded-tr-none"
                        : "bg-muted/40 border border-border/50 rounded-xl rounded-tl-none text-foreground"
                      }
                      ${isImage ? "p-1" : "p-2 px-3"}
                    `}
                  >
                    {/* Image Preview */}
                    {isImage && (
                      <div className="relative mb-1 overflow-hidden rounded-lg cursor-pointer bg-black/5 dark:bg-white/5 border border-black/5" onClick={() => window.open(msg.attachment, '_blank')}>
                        <img
                          src={msg.attachment}
                          alt="Attachment"
                          className="w-full h-auto max-h-[300px] object-cover"
                          loading="lazy"
                        />
                      </div>
                    )}

                    {/* Text */}
                    {showText && (
                      <p className="whitespace-pre-wrap leading-relaxed mb-0 min-w-[60px] pr-12 pb-1 relative">
                        {msg.message}
                        <span className={`text-[9px] font-medium leading-none ${isMe ? 'text-primary-foreground/70' : 'text-muted-foreground'} absolute bottom-0 right-0 select-none`}>
                          {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </p>
                    )}

                    {/* Voice Note */}
                    {msg.voice_note && (
                      <div className="min-w-[260px] pb-4 relative">
                        <TicketAudioPlayer src={msg.voice_note} isMe={isMe} timestamp={msg.timestamp} />
                      </div>
                    )}

                    {/* Generic File Attachment (Non-Image) */}
                    {msg.attachment && !isImage && (
                      <div className="relative pb-4">
                        <a
                          href={msg.attachment}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={`
                          flex items-center gap-3 p-2 rounded-lg mb-0 transition-colors border
                          ${isMe
                              ? 'bg-white/10 border-white/10 hover:bg-white/20 text-white'
                              : 'bg-background hover:bg-background/80 border-border/60 text-foreground'
                            }
                        `}
                        >
                          <div className={`p-1.5 rounded-md ${isMe ? 'bg-white/20' : 'bg-primary/10 text-primary'}`}>
                            <FileText className="w-4 h-4" />
                          </div>
                          <div className="flex flex-col overflow-hidden max-w-[160px]">
                            <span className="text-xs truncate font-medium">Document</span>
                            <span className={`text-[10px] uppercase truncate opacity-70 ${isMe ? 'text-white/70' : 'text-muted-foreground'}`}>Click to open</span>
                          </div>
                        </a>
                        <span className={`text-[9px] font-medium leading-none ${isMe ? 'text-primary-foreground/70' : 'text-muted-foreground'} absolute bottom-0 right-0 select-none`}>
                          {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
          <div ref={messagesEndRef} className="h-1" />
        </div>
      </ScrollArea>

      {/* Reply Section - Modernized */}
      <div className="p-3 sm:p-4 bg-background border-t border-border shadow-[0_-5px_20px_-10px_rgba(0,0,0,0.1)] z-20 shrink-0">
        {canReply ? (
          <div className="max-w-4xl mx-auto flex flex-col gap-2 sm:gap-3">
            {/* Toolbar Row */}
            <div className="flex items-center justify-between gap-2 overflow-x-auto no-scrollbar py-1">
              {isSupportRole && macros.length > 0 && (
                <div className="flex-1 min-w-[160px] max-w-[240px] sm:max-w-[300px]">
                  <MacroSelector macros={macros} onSelect={handleMacroSelect} />
                </div>
              )}
              <div className="flex items-center gap-1 sm:gap-2 ml-auto shrink-0">
                {/* Compact Voice/File Controls */}
                <div className="flex items-center border rounded-md p-0.5 sm:p-1 gap-0.5 sm:gap-1">
                  <VoiceRecorder
                    onRecordingComplete={setVoiceBlob}
                    onDelete={() => setVoiceBlob(null)}
                    variant="compact"
                  />
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

              <Button
                size="icon"
                onClick={() => handleSendReply(false)}
                disabled={isSubmitting}
                className="h-9 w-9 sm:h-10 sm:w-10 shrink-0 shadow-sm"
                title="Send Reply"
              >
                {isSubmitting ? <Loader2 className="w-3 h-3 sm:w-4 sm:h-4 animate-spin" /> : <Send className="w-3.5 h-3.5 sm:w-4 sm:h-4" />}
              </Button>
            </div>
            {/* Attachment Preview Bar */}
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
                  <Badge variant="secondary" className="gap-1.5 py-0.5 pl-2 pr-1 bg-purple-50 text-purple-700 dark:bg-purple-900/20 dark:text-purple-300 text-[10px]">
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
              <CheckCircle2 className="w-3.5 h-3.5" />
              This ticket is closed.
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
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent
          onInteractOutside={(e) => e.preventDefault()}
          className={`p-0 overflow-hidden flex flex-col sm:flex-row gap-0 outline-none border-none shadow-2xl bg-background transition-all duration-300 ${isExpanded
            ? "w-screen h-screen max-w-none max-h-none rounded-none"
            : "modal-admin-uniform rounded-2xl"
            }`}
        >
          {/* ... */}

          {/* LEFT SIDEBAR - Adaptive for Mobile */}
          <div className="w-full sm:w-64 bg-muted/20 border-b sm:border-r border-border flex flex-row sm:flex-col justify-between p-2 sm:p-4 shrink-0 overflow-hidden">
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
                    <span>Conversation</span>
                  </Button>
                  <Button
                    variant={activeView === "summary" ? "secondary" : "ghost"}
                    className={`flex-1 sm:flex-none justify-center sm:justify-start text-xs sm:text-sm font-medium h-9 sm:h-10 ${activeView === 'summary' ? 'bg-white shadow-sm dark:bg-muted text-primary' : 'text-muted-foreground'}`}
                    onClick={() => setActiveView("summary")}
                  >
                    <div className={`sm:mr-3 p-1 rounded-md ${activeView === 'summary' ? 'bg-primary/10 text-primary' : ''}`}>
                      <FileText className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                    </div>
                    <span>Info & Metadata</span>
                  </Button>

                  {/* Additional Actions */}
                  <div className="my-1 border-t border-border/50 hidden sm:block" />

                  <Button
                    variant={activeView === "log" ? "secondary" : "ghost"}
                    className={`flex-1 sm:flex-none justify-center sm:justify-start text-xs sm:text-sm font-medium h-9 sm:h-10 ${activeView === 'log' ? 'bg-white shadow-sm dark:bg-muted text-primary' : 'text-muted-foreground hover:bg-muted'}`}
                    onClick={() => setActiveView("log")}
                  >
                    <div className={`sm:mr-3 p-1 rounded-md ${activeView === 'log' ? 'bg-primary/10 text-primary' : ''}`}>
                      <ScrollText className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                    </div>
                    <span>Ticket Log</span>
                  </Button>

                  <Button
                    variant="ghost"
                    className="flex-1 sm:flex-none justify-center sm:justify-start text-xs sm:text-sm font-medium h-9 sm:h-10 text-muted-foreground hover:bg-muted"
                    onClick={() => setShowEditDialog(true)}
                  >
                    <div className="sm:mr-3 p-1 rounded-md">
                      <Edit className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                    </div>
                    <span>Edit Ticket</span>
                  </Button>

                  {ticket.status !== 'Closed' ? (
                    <Button
                      variant="ghost"
                      className="flex-1 sm:flex-none justify-center sm:justify-start text-xs sm:text-sm font-medium h-9 sm:h-10 text-muted-foreground hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-950/20"
                      onClick={() => handleStatusChange("Closed")}
                    >
                      <div className="sm:mr-3 p-1 rounded-md">
                        <XCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                      </div>
                      <span>Close Ticket</span>
                    </Button>
                  ) : (
                    <Button
                      variant="ghost"
                      className="flex-1 sm:flex-none justify-center sm:justify-start text-xs sm:text-sm font-medium h-9 sm:h-10 text-muted-foreground hover:bg-green-50 hover:text-green-600 dark:hover:bg-green-950/20"
                      onClick={() => handleStatusChange("Reopened")}
                    >
                      <div className="sm:mr-3 p-1 rounded-md">
                        <CheckCircle2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                      </div>
                      <span>Open Ticket</span>
                    </Button>
                  )}

                  {role === "admin" && (
                    <Button
                      variant="ghost"
                      className="flex-1 sm:flex-none justify-center sm:justify-start text-xs sm:text-sm font-medium h-9 sm:h-10 text-muted-foreground hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-950/20"
                      onClick={handleDelete}
                    >
                      <div className="sm:mr-3 p-1 rounded-md">
                        <Trash2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                      </div>
                      <span>Delete Ticket</span>
                    </Button>
                  )}
                </div>
              </div>

              {/* Assignment Section - Hidden on Mobile Sidebar (exists in Summary) */}
              {/* Assignment Section Removed */}
            </div>


          </div>

          {/* RIGHT CONTENT */}
          <div className="flex-1 bg-background relative flex flex-col min-h-0">
            {activeView === "details" ? DetailsView() : activeView === "summary" ? SummaryView() : <TicketLogView ticket={ticket} />}
          </div>

          {/* Global Close Button */}
          {/* Global Controls (Expand + Close) */}
          <div className="absolute top-3 right-3 z-50 flex items-center gap-2">
            <Button
              variant="secondary"
              size="icon"
              onClick={() => setIsExpanded(!isExpanded)}
              className="h-8 w-8 rounded-full shadow-sm bg-background/80 backdrop-blur-sm border border-border/50 hover:bg-muted"
              title={isExpanded ? "Collapse" : "Expand"}
            >
              {isExpanded ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </Button>
            <Button
              variant="secondary"
              size="icon"
              onClick={onClose}
              className="h-8 w-8 rounded-full shadow-sm bg-background/80 backdrop-blur-sm border border-border/50 hover:bg-muted"
              title="Close"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <EditTicketDialog
        ticket={ticket}
        isOpen={showEditDialog}
        onClose={() => setShowEditDialog(false)}
        onUpdate={(updated) => {
          setTicket(updated);
          if (onUpdate) onUpdate();
        }}
      />

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete ticket
              <span className="font-mono font-bold mx-1 text-foreground">{ticket.id}</span>
              and remove all associated data.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete Ticket
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};
