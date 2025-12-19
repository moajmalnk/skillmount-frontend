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
import { X, Trash2, Send, Paperclip, MessageSquare, FileText, CheckCircle2, Mic, Loader2 } from "lucide-react";
import { VoiceRecorder } from "@/components/tickets/VoiceRecorder";
import { toast } from "sonner";
import { Ticket } from "@/types/ticket";
import { ticketService } from "@/services/ticketService";
import { systemService } from "@/services/systemService";
import { MacroSelector } from "@/components/tickets/MacroSelector";

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
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

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

  const handleMacroSelect = (value: string) => {
    setReplyText((prev) => prev + (prev ? "\n" : "") + value);
    setTimeout(() => textareaRef.current?.focus(), 50);
  };

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
      await ticketService.reply(
        ticket.id,
        replyText,
        voiceBlob || undefined,
        attachment || undefined
      );

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
    <div className="p-6 space-y-6 animate-in fade-in zoom-in-95 duration-200">
      <h3 className="font-semibold text-lg text-foreground">Ticket Summary</h3>
      <div className="bg-muted/30 border border-muted rounded-xl p-4 flex items-center gap-4">
        <Avatar className="h-14 w-14 border-2 border-background shadow-sm">
          <AvatarFallback className="bg-primary/10 text-primary font-bold text-xl">
            {ticket.student?.name?.substring(0, 2).toUpperCase() || "ST"}
          </AvatarFallback>
        </Avatar>
        <div>
          <div className="font-bold text-xl">{ticket.student?.name || "Student"}</div>
          <div className="text-xs text-primary font-mono bg-primary/10 px-2 py-0.5 rounded-full w-fit mt-1">
            {ticket.student?.id || "N/A"}
          </div>
          <div className="text-sm text-muted-foreground mt-1">
            {ticket.student?.email}
          </div>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        {[
          { label: "Ticket Code", value: ticket.id, mono: true },
          { label: "Category", value: ticket.category },
          { label: "Created At", value: new Date(ticket.created_at).toLocaleDateString() },
          { label: "Last Updated", value: new Date(ticket.created_at).toLocaleDateString() }, // Using created_at fallback if updated_at missing
        ].map((item, i) => (
          <div key={i} className="p-4 rounded-xl border border-border bg-card">
            <div className="text-xs text-muted-foreground mb-1 uppercase tracking-wider">{item.label}</div>
            <div className={`font-medium ${item.mono ? "font-mono" : ""}`}>
              {item.value}
            </div>
          </div>
        ))}

        <div className="p-4 rounded-xl border border-border bg-card">
          <div className="text-xs text-muted-foreground mb-1 uppercase tracking-wider">Status</div>
          <Badge
            variant={ticket.status === "Open" ? "default" : "secondary"}
            className="mt-1"
          >
            {ticket.status}
          </Badge>
        </div>
        <div className="p-4 rounded-xl border border-border bg-card">
          <div className="text-xs text-muted-foreground mb-1 uppercase tracking-wider">Priority</div>
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
        <div className="p-4 rounded-xl border border-border bg-card col-span-2">
          <div className="text-xs text-muted-foreground mb-2 uppercase tracking-wider">Assigned To</div>
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
        </div>
      </div>
    </div>
  );

  const DetailsView = () => (
    <div className="flex flex-col h-full animate-in fade-in zoom-in-95 duration-200">
      {/* Messages Header - Compact */}
      <div className="px-6 py-4 border-b border-border/40 bg-background/50 backdrop-blur-sm sticky top-0 z-10 flex justify-between items-center">
        <div>
          <h2 className="font-bold text-lg leading-tight line-clamp-1" title={ticket.title}>{ticket.title}</h2>
          <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
            <span className="font-mono">{ticket.id}</span>
            <span>•</span>
            <span>{new Date(ticket.created_at).toLocaleString()}</span>
          </div>
        </div>
        <div className="flex gap-2">
          <Badge variant={ticket.status === 'Open' ? 'default' : 'secondary'}>{ticket.status}</Badge>
          <Badge variant="outline">{ticket.priority}</Badge>
        </div>
      </div>

      {/* Message History */}
      <ScrollArea className="flex-1 p-4 sm:p-6 bg-muted/5">
        <div className="space-y-6 max-w-3xl mx-auto">
          {/* Initial Description */}
          <div className="flex gap-4">
            <Avatar className="h-8 w-8 mt-1 border border-border">
              <AvatarFallback className="bg-primary/10 text-primary text-xs">
                {ticket.student?.name?.substring(0, 2).toUpperCase() || "ST"}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <div className="flex items-baseline gap-2 mb-1">
                <span className="text-sm font-semibold">{ticket.student?.name}</span>
                <span className="text-[10px] text-muted-foreground">Original Request</span>
              </div>
              <div className="p-4 rounded-2xl rounded-tl-none bg-background border border-border text-sm leading-relaxed shadow-sm">
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
              if (role === "student") {
                isMe = msg.sender_name === ticket.student?.name;
              } else {
                isMe = msg.sender_name !== ticket.student?.name;
              }
            }

            return (
              <div
                key={msg.id}
                className={`flex gap-3 ${isMe ? "flex-row-reverse" : "flex-row"}`}
              >
                {/* Avatar */}
                <Avatar className="h-8 w-8 mt-1 border border-border bg-background">
                  <AvatarFallback className={`text-[10px] ${isMe ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>
                    {msg.sender_name?.substring(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>

                {/* Bubble */}
                <div
                  className={`
                  max-w-[75%] rounded-2xl p-3.5 shadow-sm text-sm
                  ${isMe
                      ? "bg-primary text-primary-foreground rounded-tr-none"
                      : "bg-background border border-border rounded-tl-none dark:bg-muted/20"
                    }
                `}
                >
                  <div className="space-y-2">
                    <p className="whitespace-pre-wrap leading-relaxed">
                      {msg.message}
                    </p>
                    {msg.voice_note && (
                      <div className={`mt-2 rounded-lg p-2 ${isMe ? 'bg-white/10' : 'bg-muted'}`}>
                        <audio
                          controls
                          className="w-full h-8 max-w-[220px]"
                          src={msg.voice_note}
                        />
                      </div>
                    )}
                    {msg.attachment && (
                      <a
                        href={msg.attachment}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`group flex items-center gap-3 p-2 rounded-lg transition-colors border ${isMe ? 'bg-white/10 border-white/20 hover:bg-white/20' : 'bg-muted hover:bg-muted/80 border-border'}`}
                      >
                        <div className={`p-2 rounded-md ${isMe ? 'bg-white/20' : 'bg-background'}`}>
                          <Paperclip className="w-4 h-4" />
                        </div>
                        <div className="flex flex-col overflow-hidden">
                          <span className="text-xs font-medium truncate max-w-[150px]">Attachment</span>
                          <span className="text-[10px] opacity-70">Click to view</span>
                        </div>
                      </a>
                    )}
                  </div>

                  {/* Timestamp inside bubble for tighter look */}
                  <div className={`text-[10px] mt-1.5 opacity-60 ${isMe ? 'text-right' : 'text-left'}`}>
                    {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </ScrollArea>

      {/* Reply Section - Modernized */}
      <div className="p-4 bg-background border-t border-border shadow-[0_-5px_20px_-10px_rgba(0,0,0,0.1)] z-20">
        {canReply ? (
          <div className="max-w-4xl mx-auto flex flex-col gap-3">
            {/* Toolbar Row */}
            <div className="flex items-center justify-between gap-2">
              {isSupportRole && macros.length > 0 && (
                <div className="flex-1 max-w-[300px]">
                  <MacroSelector macros={macros} onSelect={handleMacroSelect} />
                </div>
              )}
              <div className="flex items-center gap-2 ml-auto">
                {/* Compact Voice/File Controls */}
                <div className="flex items-center border rounded-md p-1 gap-1">
                  <VoiceRecorder
                    onRecordingComplete={setVoiceBlob}
                    onDelete={() => setVoiceBlob(null)}
                    variant="compact" // Assuming VoiceRecorder can handle this or just CSS
                  />
                  <div className={`relative flex items-center justify-center h-8 w-8 rounded-md hover:bg-muted cursor-pointer transition-colors ${attachment ? 'text-primary bg-primary/10' : 'text-muted-foreground'}`} title="Attach File">
                    <input type="file" className="absolute inset-0 opacity-0 cursor-pointer" onChange={handleFileChange} />
                    <Paperclip className="w-4 h-4" />
                    {attachment && <span className="absolute top-1 right-1 w-1.5 h-1.5 bg-primary rounded-full" />}
                  </div>
                </div>
              </div>
            </div>

            <div className="flex gap-3 items-end">
              <Textarea
                ref={textareaRef}
                placeholder="Type your reply here..."
                className="min-h-[44px] max-h-[150px] resize-none py-3"
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                rows={1}
              />

              <div className="flex gap-2 shrink-0">
                <Button
                  size="icon"
                  onClick={() => handleSendReply(false)}
                  disabled={isSubmitting}
                  className="h-10 w-10 shrink-0 shadow-sm"
                  title="Send Reply"
                >
                  {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                </Button>
                {isSupportRole && (
                  <Button
                    size="icon"
                    variant="secondary"
                    onClick={() => handleSendReply(true)}
                    disabled={isSubmitting}
                    className="h-10 w-10 shrink-0 bg-green-600 hover:bg-green-700 text-white shadow-sm border-0"
                    title="Reply & Close Ticket"
                  >
                    {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                  </Button>
                )}
              </div>
            </div>
            {/* Attachment Preview Bar */}
            {(attachment || voiceBlob) && (
              <div className="flex gap-2 overflow-x-auto py-2">
                {attachment && (
                  <Badge variant="secondary" className="gap-2 py-1 pl-2 pr-1">
                    <Paperclip className="w-3 h-3" />
                    <span className="max-w-[100px] truncate">{attachment.name}</span>
                    <button onClick={() => setAttachment(null)} className="ml-1 hover:bg-background/50 rounded-full p-0.5"><X className="w-3 h-3" /></button>
                  </Badge>
                )}
                {voiceBlob && (
                  <Badge variant="secondary" className="gap-2 py-1 pl-2 pr-1 bg-purple-50 text-purple-700 dark:bg-purple-900/20 dark:text-purple-300">
                    <Mic className="w-3 h-3" />
                    <span>Voice Note Recorded</span>
                    <button onClick={() => setVoiceBlob(null)} className="ml-1 hover:bg-background/50 rounded-full p-0.5"><X className="w-3 h-3" /></button>
                  </Badge>
                )}
              </div>
            )}

          </div>
        ) : (
          <div className="flex items-center justify-center gap-4 py-2">
            <div className="flex items-center gap-2 text-muted-foreground bg-muted/50 px-4 py-2 rounded-full text-sm">
              <CheckCircle2 className="w-4 h-4" />
              This ticket is closed.
            </div>
            <Button variant="outline" size="sm" onClick={() => handleStatusChange("Reopened")}>
              Reopen Ticket
            </Button>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-4xl p-0 h-[85vh] max-h-[800px] overflow-hidden flex gap-0 outline-none border-none shadow-2xl rounded-2xl bg-background">
          {/* LEFT SIDEBAR - Modernized */}
          <div className="w-64 bg-muted/20 border-r border-border flex flex-col justify-between p-4">
            <div className="space-y-6">
              {/* Header / Logo Area could go here */}

              <div className="space-y-1">
                <h3 className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-2 px-3">Menu</h3>
                <Button
                  variant={activeView === "details" ? "secondary" : "ghost"}
                  className={`w-full justify-start text-sm font-medium ${activeView === 'details' ? 'bg-white shadow-sm dark:bg-muted text-primary' : 'text-muted-foreground'}`}
                  onClick={() => setActiveView("details")}
                >
                  <div className={`mr-3 p-1 rounded-md ${activeView === 'details' ? 'bg-primary/10 text-primary' : ''}`}>
                    <MessageSquare className="w-4 h-4" />
                  </div>
                  Conversation
                </Button>
                <Button
                  variant={activeView === "summary" ? "secondary" : "ghost"}
                  className={`w-full justify-start text-sm font-medium ${activeView === 'summary' ? 'bg-white shadow-sm dark:bg-muted text-primary' : 'text-muted-foreground'}`}
                  onClick={() => setActiveView("summary")}
                >
                  <div className={`mr-3 p-1 rounded-md ${activeView === 'summary' ? 'bg-primary/10 text-primary' : ''}`}>
                    <FileText className="w-4 h-4" />
                  </div>
                  Info & Metadata
                </Button>
              </div>

              {/* Assignment Section - Card Style */}
              {isSupportRole && (
                <div className="space-y-3 pt-4 border-t border-border/50">
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
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleAssign(null)}
                            className="w-full text-xs h-8 border-dashed hover:border-solid hover:bg-destructive/10 hover:text-destructive hover:border-destructive/30"
                          >
                            Unassign
                          </Button>
                        )}
                      </div>
                    ) : (
                      <div className="text-center">
                        <div className="text-xs text-muted-foreground mb-3">No one is assigned</div>
                        <Button
                          size="sm"
                          variant="default"
                          onClick={() => handleAssign(Number(currentUserId))}
                          className="w-full text-xs h-8"
                        >
                          Claim Ticket
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            <div className="flex items-center justify-between px-1">
              {role === "admin" && onDelete && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleDelete}
                  className="text-muted-foreground hover:text-destructive hover:bg-destructive/10 h-9 w-9"
                  title="Delete Ticket"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              )}
              {/* Close Button as a standard secondary button instead of icon */}
              <Button variant="ghost" className="text-xs text-muted-foreground" onClick={onClose}>
                Close
              </Button>
            </div>
          </div>

          {/* RIGHT CONTENT */}
          <div className="flex-1 bg-background relative flex flex-col">
            {activeView === "details" ? DetailsView() : SummaryView()}
          </div>
        </DialogContent>
      </Dialog>

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
