import { useState, useEffect } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { X, Trash2, Edit2, Send, Paperclip, Mic, FileText, CheckCircle2, MessageSquare } from "lucide-react";
import { VoiceRecorder } from "@/components/tickets/VoiceRecorder";
import { toast } from "sonner";
import { systemService } from "@/services/systemService";
import { ticketService } from "@/services/ticketService";

interface TicketDetailModalProps {
  ticket: any | null;
  isOpen: boolean;
  onClose: () => void;
}

export const TicketDetailModal = ({ ticket, isOpen, onClose }: TicketDetailModalProps) => {
  const [activeView, setActiveView] = useState<"details" | "summary">("details");
  const [replyText, setReplyText] = useState("");
  const [voiceBlob, setVoiceBlob] = useState<Blob | null>(null);
  const [attachment, setAttachment] = useState<File | null>(null);
  const [macros, setMacros] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const loadMacros = async () => {
      const settings = await systemService.getSettings();
      if (settings.macros && settings.macros.length > 0) {
        setMacros(settings.macros);
      }
    };
    if (isOpen) {
      loadMacros();
    }
  }, [isOpen]);

  if (!ticket) return null;

  const handleMacroSelect = (value: string) => {
    setReplyText(prev => prev + (prev ? "\n" : "") + value);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      setAttachment(e.target.files[0]);
    }
  };

  // UPDATED: Handle Reply with Close option
  const handleSendReply = async (shouldClose: boolean = false) => {
    if (!replyText && !voiceBlob && !attachment) {
        toast.error("Please enter a message.");
        return;
    }

    setIsSubmitting(true);
    try {
      // Pass the 'shouldClose' flag to your service, which sends it to backend
      await ticketService.reply(ticket.id, replyText, voiceBlob || undefined, attachment || undefined, shouldClose);

      toast.success(shouldClose ? "Ticket Resolved & Closed" : "Reply Sent", { 
          description: "Student has been notified." 
      });

      // Clear form
      setReplyText("");
      setVoiceBlob(null);
      setAttachment(null);
      onClose(); // Close modal on success
    } catch (error) {
      console.error("Failed to send reply:", error);
      toast.error("Failed to send reply");
    } finally {
      setIsSubmitting(false);
    }
  };

  // --- VIEWS ---
  const SummaryView = () => (
    <div className="p-6 space-y-6 animate-in fade-in zoom-in-95 duration-200">
      <h3 className="font-semibold text-lg text-foreground">Ticket Summary</h3>
      <div className="bg-primary/5 border border-primary/10 rounded-xl p-4 flex items-center gap-4">
        <Avatar className="h-12 w-12 border-2 border-background">
          <AvatarFallback className="bg-primary text-primary-foreground">
            {ticket.student?.name?.substring(0, 2) || 'ST'}
          </AvatarFallback>
        </Avatar>
        <div>
          <div className="font-bold text-lg">{ticket.student?.name || "Unknown Student"}</div>
          <div className="text-xs text-primary font-mono">{ticket.student?.id ? `ID: ${ticket.student.id}` : "No ID"}</div>
          <div className="text-xs text-muted-foreground">{ticket.student?.email || "No Email"}</div>
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
          <Badge variant="outline">{ticket.priority}</Badge>
        </div>
      </div>
    </div>
  );

  const DetailsView = () => (
    <div className="flex flex-col h-full animate-in fade-in zoom-in-95 duration-200">
      {/* Header */}
      <div className="p-6 border-b border-border/50 pb-4 bg-muted/10">
        <div className="flex justify-between items-start mb-2">
          <div>
            <h2 className="text-xl font-bold">{ticket.title}</h2>
            <div className="flex items-center gap-2 mt-1">
              <Badge variant="secondary" className="text-[10px]">
                {ticket.created_at ? new Date(ticket.created_at).toLocaleDateString() : 'N/A'}
              </Badge>
              <Badge className={ticket.status === 'Open' ? 'bg-green-100 text-green-700' : 'bg-gray-100'}>
                {ticket.status}
              </Badge>
              <Badge variant="outline">{ticket.priority}</Badge>
            </div>
          </div>
        </div>
        {(!ticket.messages || ticket.messages.length === 0) && (
          <div className="mt-4 p-4 bg-muted/30 rounded-xl border border-border/50 text-sm text-muted-foreground italic">
            "{ticket.description || "No description provided."}"
          </div>
        )}
      </div>

      {/* Messages */}
      <ScrollArea className="flex-1 p-6 bg-background">
        <div className="space-y-6">
          {ticket.messages?.map((msg: any) => (
            <div key={msg.id} className="flex flex-col gap-2 p-4 rounded-xl border border-border/60 bg-card shadow-sm">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Avatar className="h-6 w-6">
                    <AvatarFallback className="text-[10px] bg-primary/10 text-primary">
                      {msg.sender_name?.substring(0, 2).toUpperCase() || "??"}
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-sm font-semibold">{msg.sender_name}</span>
                </div>
                <span className="text-[10px] text-muted-foreground">
                  {msg.timestamp ? new Date(msg.timestamp).toLocaleString() : ''}
                </span>
              </div>
              <div className="pl-8 text-sm text-foreground/90 whitespace-pre-wrap">
                {msg.message}
              </div>
              {(msg.attachment || msg.voice_note) && (
                <div className="pl-8 mt-2 space-y-2">
                  {msg.voice_note && (
                    <div className="flex items-center gap-3 p-2 bg-muted/40 rounded-lg max-w-sm">
                      <Mic className="w-4 h-4 text-purple-600" />
                      <audio controls src={msg.voice_note} className="h-8 w-full max-w-[200px]" />
                    </div>
                  )}
                  {msg.attachment && (
                    <a
                      href={msg.attachment}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center gap-2 text-xs font-medium text-primary hover:underline p-2 bg-blue-50/50 rounded-lg w-fit border border-blue-100/50"
                    >
                      <Paperclip className="w-3.5 h-3.5" />
                      Download Attachment
                    </a>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      </ScrollArea>

      {/* Reply Section */}
      <div className="p-4 border-t border-border/50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="space-y-4">
          <Select onValueChange={handleMacroSelect}>
            <SelectTrigger className="w-full h-9 bg-muted/20 text-xs">
              <SelectValue placeholder="Quick Reply..." />
            </SelectTrigger>
            <SelectContent>
              {macros.map((m, i) => (
                <SelectItem key={i} value={m}>{m}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <div className="space-y-4">
            <Textarea
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
              
              {/* ACTION BUTTONS */}
              <div className="flex flex-col gap-2">
                <Button 
                    size="icon" 
                    className="h-[38px] w-[80px]" 
                    onClick={() => handleSendReply(false)}
                    disabled={isSubmitting}
                    title="Send Reply"
                >
                    <Send className="w-5 h-5" />
                </Button>
                <Button 
                    size="icon" 
                    variant="secondary"
                    className="h-[38px] w-[80px] bg-green-100 hover:bg-green-200 text-green-700 border border-green-200"
                    onClick={() => handleSendReply(true)}
                    disabled={isSubmitting}
                    title="Reply & Close Ticket"
                >
                    <CheckCircle2 className="w-5 h-5" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl p-0 h-[600px] overflow-hidden flex gap-0 outline-none border-none shadow-2xl rounded-2xl bg-background">
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
            <Button variant="ghost" size="icon" className="ml-auto rounded-full" onClick={onClose}>
              <X className="w-5 h-5" />
            </Button>
          </div>
        </div>
        <div className="flex-1 bg-background">
          {activeView === 'details' ? <DetailsView /> : <SummaryView />}
        </div>
      </DialogContent>
    </Dialog>
  );
};