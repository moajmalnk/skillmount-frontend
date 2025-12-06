import { useState } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { X, Trash2, Edit2, Send, Paperclip, Mic, FileText, User, MessageSquare } from "lucide-react";
import { VoiceRecorder } from "@/components/tickets/VoiceRecorder"; // Reusing your existing component
import { toast } from "sonner";

// Mock Macros (In real app, pass this as prop from Settings)
const MACROS = [
  "We are looking into your issue.",
  "Please clear your browser cache and try again.",
  "Can you please provide a screenshot?",
  "This issue has been resolved."
];

interface TicketDetailModalProps {
  ticket: any | null;
  isOpen: boolean;
  onClose: () => void;
}

export const TicketDetailModal = ({ ticket, isOpen, onClose }: TicketDetailModalProps) => {
  const [activeView, setActiveView] = useState<"details" | "summary">("details");
  const [replyText, setReplyText] = useState("");
  const [voiceBlob, setVoiceBlob] = useState<Blob | null>(null);
  
  if (!ticket) return null;

  const handleMacroSelect = (value: string) => {
    setReplyText(prev => prev + (prev ? "\n" : "") + value);
  };

  const handleSendReply = () => {
    if(!replyText && !voiceBlob) return;
    toast.success("Reply Sent", { description: "Student notified." });
    setReplyText("");
    setVoiceBlob(null);
  };

  // --- SUB-COMPONENTS FOR VIEWS ---

  const SummaryView = () => (
    <div className="p-6 space-y-6 animate-in fade-in zoom-in-95 duration-200">
      <h3 className="font-semibold text-lg text-foreground">Ticket Summary</h3>
      
      {/* Ticket Creator Card */}
      <div className="bg-primary/5 border border-primary/10 rounded-xl p-4 flex items-center gap-4">
        <Avatar className="h-12 w-12 border-2 border-background">
          <AvatarFallback className="bg-primary text-primary-foreground">{ticket.student.name.substring(0,2)}</AvatarFallback>
        </Avatar>
        <div>
          <div className="font-bold text-lg">{ticket.student.name}</div>
          <div className="text-xs text-primary font-mono">{ticket.student.id}</div>
          <div className="text-xs text-muted-foreground">Student • Batch 14</div>
        </div>
      </div>

      {/* Info Grid */}
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
      <div className="p-6 border-b border-border/50 pb-4">
        <div className="flex justify-between items-start mb-2">
          <div>
            <h2 className="text-xl font-bold">{ticket.title}</h2>
            <div className="flex items-center gap-2 mt-1">
              <Badge variant="secondary" className="text-[10px]">{ticket.date}</Badge>
              <Badge className={ticket.status === 'Open' ? 'bg-green-100 text-green-700' : 'bg-gray-100'}>
                {ticket.status}
              </Badge>
            </div>
          </div>
        </div>
        
        {/* Description Box */}
        <div className="mt-4 p-4 bg-muted/30 rounded-xl border border-border/50 text-sm text-muted-foreground italic">
          "{ticket.description || "No description provided."}"
        </div>
      </div>

      {/* Reply Section */}
      <ScrollArea className="flex-1 p-6">
        <div className="space-y-4">
          <h4 className="text-sm font-semibold text-muted-foreground">Reply & Actions</h4>
          
          {/* Macro Selector */}
          <Select onValueChange={handleMacroSelect}>
            <SelectTrigger className="w-full bg-background">
              <SelectValue placeholder="Select a Quick Reply (Macro)" />
            </SelectTrigger>
            <SelectContent>
              {MACROS.map((m, i) => (
                <SelectItem key={i} value={m}>{m}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Text Area */}
          <Textarea 
            placeholder="Type your reply here..." 
            className="min-h-[120px] resize-none"
            value={replyText}
            onChange={(e) => setReplyText(e.target.value)}
          />

          {/* Advanced Inputs */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <span className="text-xs font-medium">Attach Voice Note</span>
              <VoiceRecorder 
                onRecordingComplete={setVoiceBlob} 
                onDelete={() => setVoiceBlob(null)} 
              />
            </div>
            <div className="space-y-1">
              <span className="text-xs font-medium">Attach File</span>
              <div className="border border-dashed border-border rounded-lg h-[60px] flex items-center justify-center cursor-pointer hover:bg-muted/50 transition-colors">
                <div className="flex items-center gap-2 text-muted-foreground text-xs">
                  <Paperclip className="w-4 h-4" /> Upload
                </div>
              </div>
            </div>
          </div>
        </div>
      </ScrollArea>

      {/* Send Action */}
      <div className="p-4 border-t border-border/50 bg-muted/10">
        <Button className="w-full" onClick={handleSendReply}>
          <Send className="w-4 h-4 mr-2" /> Send Reply
        </Button>
      </div>
    </div>
  );

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl p-0 h-[600px] overflow-hidden flex gap-0 outline-none border-none shadow-2xl rounded-2xl bg-background">
        
        {/* LEFT SIDEBAR (Navigation) */}
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
            <Button variant="outline" size="icon" className="bg-white hover:bg-primary hover:text-white rounded-full transition-colors border-none shadow-sm">
              <Edit2 className="w-4 h-4" />
            </Button>
            <Button variant="outline" size="icon" className="bg-white hover:bg-destructive hover:text-white rounded-full transition-colors border-none shadow-sm">
              <Trash2 className="w-4 h-4" />
            </Button>
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