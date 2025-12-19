import { useState, useEffect, useRef } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { X, Trash2, Edit2, Send, Paperclip, MessageSquare, FileText, CheckCircle2, ChevronDown } from "lucide-react";
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
    <div className="p-6 space-y-6 animate-in fade-in zoom-in-95 duration-200">
      <h3 className="font-semibold text-lg text-foreground">Ticket Summary</h3>
      <div className="bg-primary/5 border border-primary/10 rounded-xl p-4 flex items-center gap-4">
        <Avatar className="h-12 w-12 border-2 border-background">
          <AvatarFallback className="bg-primary text-primary-foreground">
            {ticket.student?.name?.substring(0, 2).toUpperCase() || 'ST'}
          </AvatarFallback>
        </Avatar>
        <div>
          <div className="font-bold text-lg">{ticket.student?.name || 'Student'}</div>
          <div className="text-xs text-primary font-mono">{ticket.student?.id}</div>
          <div className="text-xs text-muted-foreground">{ticket.student?.email}</div>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="p-4 rounded-xl border border-border bg-card">
          <div className="text-xs text-muted-foreground mb-1">Ticket Code</div>
          <div className="font-mono font-bold">{ticket.id}</div>
        </div>
        <div className="p-4 rounded-xl border border-border bg-card">
          <div className="text-xs text-muted-foreground mb-1">Category</div>
          <div className="font-bold text-sm">{ticket.category}</div>
        </div>
        <div className="p-4 rounded-xl border border-border bg-card">
          <div className="text-xs text-muted-foreground mb-1">Status</div>
          <Badge variant={ticket.status === 'Open' ? 'default' : 'secondary'}>{ticket.status}</Badge>
        </div>
        <div className="p-4 rounded-xl border border-border bg-card">
          <div className="text-xs text-muted-foreground mb-1">Priority</div>
          <Badge variant="outline" className={ticket.priority === 'High' ? 'text-red-500 border-red-200' : ''}>
            {ticket.priority}
          </Badge>
        </div>

        {/* ASSIGNED TO */}
        {ticket.assigned_to && (
          <div className="p-4 rounded-xl border border-border bg-card col-span-2">
            <div className="text-xs text-muted-foreground mb-1">Assigned To</div>
            <div className="flex items-center gap-2">
              <Avatar className="h-6 w-6">
                <AvatarFallback className="text-[10px]">
                  {ticket.assigned_to_details?.name?.substring(0, 2).toUpperCase() || 'ID'}
                </AvatarFallback>
              </Avatar>
              <div className="font-bold text-sm">{ticket.assigned_to_details?.name || `User ${ticket.assigned_to}`}</div>
            </div>
          </div>
        )}
      </div>
    </div>
  );

  const DetailsView = () => (
    <div className="flex flex-col h-full animate-in fade-in zoom-in-95 duration-200">
      {/* Header */}
      <div className="p-6 border-b border-border/50 pb-4">
        <div className="flex justify-between items-start mb-2">
          <div>
            <h2 className="text-xl font-bold">{ticket.title}</h2>
            <div className="flex items-center gap-2 mt-1">
              <Badge variant="secondary" className="text-[10px]">
                {new Date(ticket.created_at).toLocaleDateString()}
              </Badge>
              <Badge className={
                ticket.status === 'Open' ? 'bg-green-100 text-green-700' :
                  ticket.status === 'Closed' ? 'bg-gray-100 text-gray-500' :
                    'bg-blue-100 text-blue-700'
              }>
                {ticket.status}
              </Badge>
              <Badge variant="outline">{ticket.priority}</Badge>
            </div>
          </div>
        </div>
      </div>

      {/* Message History */}
      <ScrollArea className="flex-1 p-6 bg-muted/5">
        <div className="space-y-6">
          {/* Initial Description */}
          <div className="flex justify-start">
            <div className="max-w-[85%]">
              <div className="flex items-center gap-2 mb-2">
                <Avatar className="h-6 w-6">
                  <AvatarFallback className="text-[10px] bg-primary text-primary-foreground">
                    {ticket.student?.name?.substring(0, 2).toUpperCase() || 'ST'}
                  </AvatarFallback>
                </Avatar>
                <span className="text-xs font-semibold">{ticket.student?.name}</span>
                <span className="text-[10px] text-muted-foreground">{new Date(ticket.created_at).toLocaleString()}</span>
              </div>
              <div className="p-4 rounded-2xl rounded-tl-none bg-white border border-border/50 shadow-sm text-sm whitespace-pre-wrap">
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
              if (role === 'student') {
                isMe = msg.sender_name === ticket.student?.name;
              } else {
                isMe = msg.sender_name !== ticket.student?.name;
              }
            }

            return (
              <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                <div className={`
                  max-w-[80%] rounded-2xl p-4 shadow-sm
                  ${isMe
                    ? 'bg-primary text-primary-foreground rounded-tr-none'
                    : 'bg-white border border-border/50 rounded-tl-none'
                  }
                `}>
                  {!isMe && (
                    <div className="flex items-center gap-2 mb-2">
                      <Avatar className="h-6 w-6">
                        <AvatarFallback className="bg-background/20 text-[10px]">
                          {msg.sender_name?.substring(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <span className="text-xs font-semibold opacity-70">{msg.sender_name}</span>
                      <span className="text-[10px] opacity-50">
                        {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  )}

                  <div className="space-y-2">
                    <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.message}</p>
                    {msg.voice_note && (
                      <div className="mt-2 bg-background/10 rounded-lg p-1">
                        <audio controls className="w-full h-8 max-w-[200px]">
                          <source src={msg.voice_note} type="audio/webm" />
                          <source src={msg.voice_note} type="audio/wav" />
                          <source src={msg.voice_note} type="audio/mp4" />
                          <source src={msg.voice_note} type="audio/mpeg" />
                        </audio>
                      </div>
                    )}
                    {msg.attachment && (
                      <a
                        href={msg.attachment}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`inline-flex items-center gap-2 text-xs hover:underline mt-1 p-2 rounded-lg ${isMe ? 'bg-primary-foreground/10' : 'bg-muted'}`}
                      >
                        <Paperclip className="w-3 h-3" />
                        Download Attachment
                      </a>
                    )}
                  </div>

                  {isMe && (
                    <div className="text-[10px] opacity-60 text-right mt-1">
                      {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </ScrollArea>

      {/* Reply Section */}
      <div className="p-6 border-t border-border/50 bg-background">
        {canReply ? (
          <div className="space-y-4">
            {isSupportRole && macros.length > 0 && (
              <MacroSelector macros={macros} onSelect={handleMacroSelect} />
            )}

            <Textarea
              ref={textareaRef}
              placeholder="Type your reply here..."
              className="min-h-[80px] resize-none"
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
            />

            <div className="flex gap-4 items-start">
              <div className="flex-1">
                <VoiceRecorder
                  onRecordingComplete={setVoiceBlob}
                  onDelete={() => setVoiceBlob(null)}
                />
              </div>
              <div className="flex-1">
                <div className={`border border-dashed border-border rounded-xl h-[80px] flex items-center justify-center cursor-pointer hover:bg-muted/50 transition-colors relative ${attachment ? 'bg-primary/5 border-primary/20' : ''}`}>
                  <input type="file" className="absolute inset-0 opacity-0 cursor-pointer" onChange={handleFileChange} />
                  <div className="flex flex-col items-center gap-1 text-muted-foreground text-xs p-2 text-center">
                    {attachment ? (
                      <>
                        <Paperclip className="w-4 h-4 text-primary" />
                        <span className="text-primary font-medium truncate max-w-[120px]">{attachment.name}</span>
                      </>
                    ) : (
                      <>
                        <Paperclip className="w-4 h-4" />
                        <span>Attach File</span>
                      </>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <Button
                  size="sm"
                  onClick={() => handleSendReply(false)}
                  disabled={isSubmitting}
                  className="h-9 px-4"
                >
                  <Send className="w-4 h-4 mr-2" /> Reply
                </Button>
                {isSupportRole && (
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => handleSendReply(true)}
                    disabled={isSubmitting}
                    className="h-9 px-4 bg-green-100 text-green-700 hover:bg-green-200"
                    title="Reply & Close Ticket"
                  >
                    <CheckCircle2 className="w-4 h-4 mr-2" /> Resolve
                  </Button>
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center space-y-3 py-2">
            <p className="text-xs text-muted-foreground">
              This ticket is closed.
            </p>
            <Button variant="outline" size="sm" onClick={() => handleStatusChange('Reopened')}>
              Reopen Ticket
            </Button>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl p-0 h-[650px] overflow-hidden flex gap-0 outline-none border-none shadow-2xl rounded-2xl bg-background">
        {/* LEFT SIDEBAR */}
        <div className="w-56 bg-muted/30 border-r border-border/50 flex flex-col justify-between p-4">
          <div className="space-y-2">
            <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-4 px-2">Menu</h3>
            <Button
              variant={activeView === 'details' ? 'secondary' : 'ghost'}
              className="w-full justify-start text-sm"
              onClick={() => setActiveView('details')}
            >
              <MessageSquare className="w-4 h-4 mr-2" /> Conversation
            </Button>
            <Button
              variant={activeView === 'summary' ? 'secondary' : 'ghost'}
              className="w-full justify-start text-sm"
              onClick={() => setActiveView('summary')}
            >
              <FileText className="w-4 h-4 mr-2" /> Info & Metadata
            </Button>

            {/* Assignment Section for Support */}
            {isSupportRole && (
              <div className="mt-6 pt-6 border-t border-border/50">
                <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-3 px-2">Assignment</h3>
                {ticket?.assigned_to ? (
                  <div className="flex flex-col gap-2 px-2">
                    <div className="text-xs text-foreground font-medium flex items-center gap-2 mb-2">
                      <Avatar className="h-6 w-6 border">
                        <AvatarFallback className="text-[9px]">
                          {ticket.assigned_to_details?.name?.substring(0, 2).toUpperCase() || 'ID'}
                        </AvatarFallback>
                      </Avatar>
                      <span className="truncate">{ticket.assigned_to_details?.name || `User ${ticket.assigned_to}`}</span>
                    </div>
                    {/* Only allow Unassign if I am Admin OR I am the assignee */}
                    {(role === 'admin' || String(currentUserId) === String(ticket.assigned_to)) && (
                      <Button variant="outline" size="sm" onClick={() => handleAssign(null)} className="h-7 text-xs w-full bg-background">
                        Unassign / Release
                      </Button>
                    )}
                  </div>
                ) : (
                  <div className="px-2">
                    <Button size="sm" variant="default" onClick={() => handleAssign(Number(currentUserId))} className="w-full text-xs h-8 gap-2 bg-primary/90 hover:bg-primary">
                      <CheckCircle2 className="w-3 h-3" /> Claim Ticket
                    </Button>
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="flex gap-2">
            {role === 'admin' && onDelete && (
              <Button variant="outline" size="icon" onClick={handleDelete} className="bg-white hover:bg-destructive hover:text-white rounded-full border-none shadow-sm h-8 w-8">
                <Trash2 className="w-4 h-4" />
              </Button>
            )}
            <Button variant="ghost" size="icon" className="ml-auto rounded-full h-8 w-8" onClick={onClose}>
              <X className="w-5 h-5" />
            </Button>
          </div>
        </div>

        {/* RIGHT CONTENT */}
        <div className="flex-1 bg-background relative">
          {activeView === 'details' ? <DetailsView /> : <SummaryView />}
        </div>
      </DialogContent>
    </Dialog>
  );
};