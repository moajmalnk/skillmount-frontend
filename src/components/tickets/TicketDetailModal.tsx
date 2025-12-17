import { useState } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { X, Trash2, Edit2, Send, Paperclip, MessageSquare, FileText } from "lucide-react";
import { VoiceRecorder } from "@/components/tickets/VoiceRecorder";
import { toast } from "sonner";
import { Ticket } from "@/types/ticket";
import { ticketService } from "@/services/ticketService";

interface TicketDetailModalProps {
  ticket: Ticket | null;
  isOpen: boolean;
  onClose: () => void;
  role?: "admin" | "tutor" | "student";
}

export const TicketDetailModal = ({ ticket, isOpen, onClose, role = "admin" }: TicketDetailModalProps) => {
  const [activeView, setActiveView] = useState<"details" | "summary">("details");
  const [replyText, setReplyText] = useState("");
  const [voiceBlob, setVoiceBlob] = useState<Blob | null>(null);
  const [attachment, setAttachment] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isSupportRole = role === "admin" || role === "tutor";
  const isClosed = ticket?.status === "Closed";
  const canReply = !!ticket && isSupportRole && !isClosed;

  if (!ticket) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      setAttachment(e.target.files[0]);
    }
  };

  const handleSendReply = async () => {
    if (!canReply) {
      return;
    }

    if (!replyText && !voiceBlob && !attachment) {
      toast.error("Please enter a message, record audio, or attach a file.");
      return;
    }

    setIsSubmitting(true);

    try {
      // For support roles, a reply is the final update and closes the ticket.
      await ticketService.reply(ticket.id, replyText, voiceBlob || undefined, attachment || undefined);

      toast.success("Reply sent", {
        description: "We’ve received your update on this ticket."
      });

      // Reset Form
      setReplyText("");
      setVoiceBlob(null);
      setAttachment(null);
      onClose();

    } catch (error) {
      toast.error("Failed to send reply");
      console.error(error);
    } finally {
      setIsSubmitting(false);
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
              <Badge className={ticket.status === 'Open' ? 'bg-green-100 text-green-700' : 'bg-gray-100'}>
                {ticket.status}
              </Badge>
            </div>
          </div>
        </div>
      </div>

      {/* Message History */}
      <ScrollArea className="flex-1 p-6">
        <div className="space-y-4">
          <h4 className="text-sm font-semibold text-muted-foreground mb-4">Conversation</h4>

          {/* Initial Description */}
          {ticket.messages?.length === 0 && (
            <div className="p-4 bg-muted/30 rounded-xl border border-border/50">
              <div className="flex items-start gap-3">
                <Avatar className="h-8 w-8">
                  <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                    {ticket.student?.name?.substring(0, 2).toUpperCase() || 'ST'}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-sm font-semibold">{ticket.student?.name || 'You'}</span>
                    <span className="text-xs text-muted-foreground">
                      {new Date(ticket.created_at).toLocaleString()}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground italic">{ticket.description}</p>
                </div>
              </div>
            </div>
          )}

          {/* Messages */}
          {ticket.messages?.map((msg: any) => {
            const isMe = msg.sender_name === ticket.student?.name; // Simple check. Better if using ID but name works for now.
            // If viewing as Tutor: My messages (Tutor) should be right aligned.
            // If viewing as Student: My messages (Student) should be right aligned.
            // The logic: If (role === 'student' && message_sender === me) OR (role === 'tutor' && message_sender === me)
            // But we don't have 'me' user object easily here unless passed.
            // Simplified Assumption: 
            // - If role='student', then msg.sender_name === ticket.student.name is ME.
            // - If role='tutor', then msg.sender_name !== ticket.student.name is ME (mostly).

            // Let's rely on simple name check vs ticket.student.name for Student View.
            // For Tutor view, it might be inverted if we wanted "Tutor" on right. 
            // BUT usually "Customer" (Student) is on Left, "Agent" (Tutor) is on Right.

            // Current Request: User (Student) says "My Name is on top". 
            // So if I am Student, I want MY messages on Right.

            // Improved Alignment Logic
            let alignRight = false;
            if (role === 'student') {
              // If I am student, MY messages (sender == me) on Right. Others (Support) on Left.
              alignRight = (msg.sender_name === ticket.student?.name);
            } else {
              // If I am Admin/Tutor, MY messages (sender != student) on Right. Student on Left.
              alignRight = (msg.sender_name !== ticket.student?.name);
            }

            return (
              <div key={msg.id} className={`flex ${alignRight ? 'justify-end' : 'justify-start'}`}>
                <div className={`
                  max-w-[80%] rounded-2xl p-4 shadow-sm
                  ${alignRight
                    ? 'bg-primary text-primary-foreground rounded-tr-none'
                    : 'bg-muted rounded-tl-none'
                  }
                `}>
                  {/* Header (Only show for others) */}
                  {!alignRight && (
                    <div className="flex items-center gap-2 mb-2">
                      <Avatar className="h-6 w-6">
                        <AvatarFallback className="bg-background/20 text-[10px]">
                          {msg.sender_name.substring(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <span className="text-xs font-semibold opacity-70">{msg.sender_name}</span>
                      <span className="text-[10px] opacity-50">
                        {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  )}

                  {/* Message Content */}
                  <div className="space-y-2">
                    <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.message}</p>

                    {/* Media */}
                    {msg.voice_note && (
                      <div className="mt-2 bg-background/10 rounded-lg p-1">
                        <audio controls className="w-full h-8 max-w-[200px]">
                          <source src={msg.voice_note} type="audio/webm" />
                          <source src={msg.voice_note} type="audio/wav" />
                        </audio>
                      </div>
                    )}

                    {msg.attachment && (
                      <a
                        href={msg.attachment}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`inline-flex items-center gap-2 text-xs hover:underline mt-1 p-2 rounded-lg ${alignRight ? 'bg-primary-foreground/10' : 'bg-background/50'}`}
                      >
                        <Paperclip className="w-3 h-3" />
                        Attachment
                      </a>
                    )}
                  </div>

                  {/* Timestamp for Me (Bottom Right) */}
                  {alignRight && (
                    <div className="text-[10px] opacity-50 text-right mt-1">
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
      <div className="p-6 border-t border-border/50 bg-muted/10 space-y-4">
        {canReply ? (
          <>
            <h4 className="text-sm font-semibold text-muted-foreground">Send Reply</h4>

            <Textarea
              placeholder="Type your reply here..."
              className="min-h-[100px] resize-none"
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
            />

            <div className="flex gap-4">
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
            </div>

            <Button className="w-full" onClick={handleSendReply} disabled={isSubmitting}>
              <Send className="w-4 h-4 mr-2" />
              {isSubmitting ? "Sending..." : "Send Reply"}
            </Button>
          </>
        ) : (
          <div className="text-center space-y-3">
            <p className="text-xs text-muted-foreground">
              {role === "student"
                ? "This ticket is closed or awaiting support action."
                : "This ticket is closed."}
            </p>

            {role === "student" && ticket.status !== 'Closed' && (
              <Button variant="outline" size="sm" onClick={() => handleStatusUpdate('Closed')}>
                Mark as Resolved
              </Button>
            )}

            {role === "student" && ticket.status === 'Closed' && (
              <Button variant="outline" size="sm" onClick={() => handleStatusUpdate('Reopened')}>
                Reopen Ticket
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  );

  const handleStatusUpdate = async (status: 'Closed' | 'Reopened') => {
    try {
      await ticketService.updateStatus(ticket.id, status);
      toast.success(`Ticket ${status}`);
      onClose(); // Close modal to refresh or trigger refresh
    } catch (err) {
      toast.error("Failed to update status");
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl p-0 h-[600px] overflow-hidden flex gap-0 outline-none border-none shadow-2xl rounded-2xl bg-background">
        {/* LEFT SIDEBAR */}
        <div className="w-64 bg-muted/30 border-r border-border/50 flex flex-col justify-between p-4">
          <div className="space-y-2">
            <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-4 px-2">Menu</h3>
            <Button
              variant={activeView === 'details' ? 'secondary' : 'ghost'}
              className="w-full justify-start"
              onClick={() => setActiveView('details')}
            >
              <MessageSquare className="w-4 h-4 mr-2" /> Ticket Details
            </Button>
            <Button
              variant={activeView === 'summary' ? 'secondary' : 'ghost'}
              className="w-full justify-start"
              onClick={() => setActiveView('summary')}
            >
              <FileText className="w-4 h-4 mr-2" /> Ticket Summary
            </Button>
          </div>

          <div className="flex gap-2">
            <Button variant="outline" size="icon" className="bg-white hover:bg-primary hover:text-white rounded-full border-none shadow-sm">
              <Edit2 className="w-4 h-4" />
            </Button>
            {/* Logic Check: Only Admins can delete tickets */}
            {role === 'admin' && (
              <Button variant="outline" size="icon" className="bg-white hover:bg-destructive hover:text-white rounded-full border-none shadow-sm">
                <Trash2 className="w-4 h-4" />
              </Button>
            )}
            <Button variant="ghost" size="icon" className="ml-auto rounded-full" onClick={onClose}>
              <X className="w-5 h-5" />
            </Button>
          </div>
        </div>

        {/* RIGHT CONTENT */}
        <div className="flex-1 bg-background">
          {activeView === 'details' ? <DetailsView /> : <SummaryView />}
        </div>
      </DialogContent>
    </Dialog>
  );
};