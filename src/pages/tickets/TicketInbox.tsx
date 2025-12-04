import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Search, Filter, Inbox, CheckCircle2, Clock, AlertCircle, 
  MoreVertical, Send, Paperclip, Mic, X, User, ChevronLeft
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Textarea } from "@/components/ui/textarea";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Separator } from "@/components/ui/separator";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { toast } from "sonner";
import ProfessionalBackground from "@/components/ProfessionalBackground";

// --- MOCK DATA ---
const TICKETS = [
  {
    id: "TKT-1024",
    student: { name: "Alex Johnson", avatar: "", batch: "Batch 14", email: "alex@example.com" },
    subject: "Elementor Header issue on Mobile",
    preview: "The sticky header isn't working correctly on iPhone Safari...",
    priority: "high",
    status: "open",
    date: "2h ago",
    messages: [
      { id: 1, sender: "student", text: "Hi, I'm having trouble with the Elementor sticky header. It works fine on desktop but disappears on iPhone Safari.", time: "10:30 AM" },
      { id: 2, sender: "tutor", text: "Hello Alex! Have you checked the 'Sticky Effect' settings in the Advanced tab? Make sure it's enabled for Mobile.", time: "10:45 AM" },
      { id: 3, sender: "student", text: "Yes, it is enabled. I've attached a screenshot.", attachments: ["screenshot.jpg"], time: "10:50 AM" }
    ]
  },
  {
    id: "TKT-1025",
    student: { name: "Sarah Williams", avatar: "", batch: "Batch 14", email: "sarah@example.com" },
    subject: "WooCommerce Payment Gateway",
    preview: "Stripe isn't showing up in checkout options.",
    priority: "medium",
    status: "open",
    date: "5h ago",
    messages: [
      { id: 1, sender: "student", text: "I installed the Stripe plugin but it's not appearing in checkout.", time: "08:00 AM" }
    ]
  },
  {
    id: "TKT-1026",
    student: { name: "Mike Ross", avatar: "", batch: "Batch 13", email: "mike@example.com" },
    subject: "Course Certificate Request",
    preview: "I have completed all modules...",
    priority: "low",
    status: "closed",
    date: "1d ago",
    messages: [
      { id: 1, sender: "student", text: "I finished the capstone project. When can I get the certificate?", time: "Yesterday" }
    ]
  }
];

export default function TicketInbox() {
  const [selectedTicketId, setSelectedTicketId] = useState<string | null>(null);
  const [filter, setFilter] = useState("all"); // all, open, closed
  const [replyText, setReplyText] = useState("");
  const [isRecording, setIsRecording] = useState(false);

  const selectedTicket = TICKETS.find(t => t.id === selectedTicketId);

  // Filter Logic
  const filteredTickets = TICKETS.filter(t => {
    if (filter === "open") return t.status === "open";
    if (filter === "closed") return t.status === "closed";
    return true;
  });

  const handleSendMessage = () => {
    if (!replyText.trim()) return;
    toast.success("Reply Sent!", { description: "Student has been notified via WhatsApp and Email." });
    setReplyText("");
  };

  const toggleRecording = () => {
    if (isRecording) {
      setIsRecording(false);
      toast.success("Voice Note Attached");
    } else {
      setIsRecording(true);
    }
  };

  return (
    <div className="min-h-[calc(100vh-64px)] bg-background flex flex-col relative overflow-hidden">
      {/* Background Ambience */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <ProfessionalBackground
          src="https://moajmalnk.in/assets/img/hero/moajmalnk.webp" 
          alt="bg"
          className="w-full h-full opacity-[0.03]"
          overlay={true}
        />
      </div>

      {/* --- HEADER STATS --- */}
      <div className="relative z-10 border-b border-border/40 bg-card/50 backdrop-blur-sm p-6">
        <div className="container mx-auto max-w-7xl">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h1 className="text-2xl font-bold tracking-tight">Support Inbox</h1>
              <p className="text-muted-foreground text-sm">Manage student queries and technical issues.</p>
            </div>
            <div className="flex gap-4">
              <div className="flex items-center gap-2 px-4 py-2 bg-primary/10 text-primary rounded-lg border border-primary/20">
                <Inbox className="w-4 h-4" />
                <span className="font-bold">8 Open</span>
              </div>
              <div className="flex items-center gap-2 px-4 py-2 bg-orange-500/10 text-orange-600 rounded-lg border border-orange-500/20">
                <AlertCircle className="w-4 h-4" />
                <span className="font-bold">2 Urgent</span>
              </div>
              <div className="flex items-center gap-2 px-4 py-2 bg-green-500/10 text-green-600 rounded-lg border border-green-500/20">
                <CheckCircle2 className="w-4 h-4" />
                <span className="font-bold">95% Resolved</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* --- MAIN CONTENT LAYOUT --- */}
      <div className="flex-1 container mx-auto max-w-7xl p-4 md:p-6 relative z-10 h-full overflow-hidden">
        <div className="grid grid-cols-12 gap-6 h-[calc(100vh-220px)]">
          
          {/* LEFT: TICKET LIST */}
          <div className={`col-span-12 md:col-span-4 lg:col-span-3 flex flex-col bg-card border border-border/50 rounded-2xl shadow-lg overflow-hidden ${selectedTicketId ? 'hidden md:flex' : 'flex'}`}>
            {/* Search & Filter */}
            <div className="p-4 border-b border-border/50 space-y-3 bg-muted/20">
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input placeholder="Search tickets..." className="pl-9 bg-background" />
              </div>
              <div className="flex gap-2">
                <Button 
                  variant={filter === 'all' ? 'secondary' : 'ghost'} 
                  size="sm" 
                  className="flex-1 text-xs"
                  onClick={() => setFilter('all')}
                >
                  All
                </Button>
                <Button 
                  variant={filter === 'open' ? 'secondary' : 'ghost'} 
                  size="sm" 
                  className="flex-1 text-xs"
                  onClick={() => setFilter('open')}
                >
                  Open
                </Button>
                <Button 
                  variant={filter === 'closed' ? 'secondary' : 'ghost'} 
                  size="sm" 
                  className="flex-1 text-xs"
                  onClick={() => setFilter('closed')}
                >
                  Closed
                </Button>
              </div>
            </div>

            {/* List */}
            <ScrollArea className="flex-1">
              <div className="flex flex-col p-2 gap-2">
                {filteredTickets.map((ticket) => (
                  <button
                    key={ticket.id}
                    onClick={() => setSelectedTicketId(ticket.id)}
                    className={`text-left p-3 rounded-xl transition-all duration-200 border ${
                      selectedTicketId === ticket.id 
                        ? "bg-primary/5 border-primary/20 shadow-sm" 
                        : "bg-transparent border-transparent hover:bg-muted"
                    }`}
                  >
                    <div className="flex justify-between items-start mb-1">
                      <div className="flex items-center gap-2">
                        <Avatar className="h-6 w-6">
                          <AvatarFallback className="text-[10px] bg-primary/10 text-primary">
                            {ticket.student.name.substring(0, 2)}
                          </AvatarFallback>
                        </Avatar>
                        <span className="font-semibold text-sm truncate max-w-[120px]">{ticket.student.name}</span>
                      </div>
                      <span className="text-[10px] text-muted-foreground whitespace-nowrap">{ticket.date}</span>
                    </div>
                    <h4 className="text-sm font-medium mb-1 truncate">{ticket.subject}</h4>
                    <p className="text-xs text-muted-foreground truncate mb-2">{ticket.preview}</p>
                    <div className="flex items-center gap-2">
                      {ticket.priority === 'high' && <Badge variant="destructive" className="text-[10px] h-5 px-1.5">Urgent</Badge>}
                      {ticket.priority === 'medium' && <Badge variant="secondary" className="text-[10px] h-5 px-1.5 bg-orange-100 text-orange-700">Medium</Badge>}
                      <span className="text-[10px] text-muted-foreground ml-auto">#{ticket.id}</span>
                    </div>
                  </button>
                ))}
              </div>
            </ScrollArea>
          </div>

          {/* RIGHT: TICKET DETAIL & CHAT */}
          <div className={`col-span-12 md:col-span-8 lg:col-span-9 flex flex-col bg-card border border-border/50 rounded-2xl shadow-lg overflow-hidden ${!selectedTicketId ? 'hidden md:flex' : 'flex'}`}>
            {selectedTicket ? (
              <>
                {/* Chat Header */}
                <div className="p-4 border-b border-border/50 flex justify-between items-center bg-muted/10 backdrop-blur-md">
                  <div className="flex items-center gap-3">
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="md:hidden h-8 w-8" 
                      onClick={() => setSelectedTicketId(null)}
                    >
                      <ChevronLeft className="h-5 w-5" />
                    </Button>
                    <Avatar>
                      <AvatarFallback>{selectedTicket.student.name.substring(0, 2)}</AvatarFallback>
                    </Avatar>
                    <div>
                      <h3 className="font-bold text-sm md:text-base">{selectedTicket.subject}</h3>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <span>{selectedTicket.student.name}</span>
                        <span>•</span>
                        <span>{selectedTicket.student.batch}</span>
                        <span>•</span>
                        <span className="bg-primary/10 text-primary px-1.5 rounded">{selectedTicket.id}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant={selectedTicket.status === 'open' ? 'default' : 'secondary'} size="sm" className="h-8">
                          {selectedTicket.status === 'open' ? 'Open' : 'Closed'}
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>Mark as Open</DropdownMenuItem>
                        <DropdownMenuItem>Mark as Pending</DropdownMenuItem>
                        <DropdownMenuItem className="text-red-600">Mark as Closed</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                {/* Chat Body */}
                <ScrollArea className="flex-1 p-4 md:p-6 bg-muted/5">
                  <div className="space-y-6">
                    {selectedTicket.messages.map((msg) => (
                      <div 
                        key={msg.id} 
                        className={`flex gap-3 ${msg.sender === 'tutor' ? 'flex-row-reverse' : ''}`}
                      >
                        <Avatar className="h-8 w-8 mt-1">
                          <AvatarFallback className={msg.sender === 'tutor' ? 'bg-primary text-white' : ''}>
                            {msg.sender === 'tutor' ? 'ME' : selectedTicket.student.name.substring(0, 2)}
                          </AvatarFallback>
                        </Avatar>
                        <div className={`max-w-[80%] ${msg.sender === 'tutor' ? 'items-end' : 'items-start'} flex flex-col`}>
                          <div className={`p-4 rounded-2xl text-sm leading-relaxed shadow-sm ${
                            msg.sender === 'tutor' 
                              ? 'bg-primary text-primary-foreground rounded-tr-sm' 
                              : 'bg-white dark:bg-card border border-border/50 rounded-tl-sm'
                          }`}>
                            <p>{msg.text}</p>
                            {msg.attachments && (
                              <div className="mt-3 flex gap-2">
                                {msg.attachments.map((file, i) => (
                                  <div key={i} className="flex items-center gap-2 bg-black/10 dark:bg-white/10 px-3 py-1.5 rounded-lg text-xs">
                                    <Paperclip className="h-3 w-3" /> {file}
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                          <span className="text-[10px] text-muted-foreground mt-1 px-1">{msg.time}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>

                {/* Reply Box */}
                <div className="p-4 bg-background border-t border-border/50">
                  {isRecording && (
                    <div className="mb-2 p-2 bg-red-50 text-red-600 rounded-lg flex items-center justify-between text-sm animate-pulse">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-red-600 rounded-full"></div>
                        Recording... 00:12
                      </div>
                      <Button variant="ghost" size="sm" onClick={() => setIsRecording(false)} className="h-6 w-6 p-0 hover:bg-red-100">
                        <X className="w-3 h-3" />
                      </Button>
                    </div>
                  )}
                  <div className="relative">
                    <Textarea 
                      placeholder="Type your reply here..." 
                      className="min-h-[80px] pr-24 resize-none rounded-xl border-border/50 focus:border-primary/50"
                      value={replyText}
                      onChange={(e) => setReplyText(e.target.value)}
                    />
                    <div className="absolute bottom-2 right-2 flex gap-1">
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-primary">
                            <Paperclip className="h-4 w-4" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>Attach File</TooltipContent>
                      </Tooltip>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button 
                            variant={isRecording ? "destructive" : "ghost"} 
                            size="icon" 
                            className={`h-8 w-8 ${!isRecording && "text-muted-foreground hover:text-primary"}`}
                            onClick={toggleRecording}
                          >
                            <Mic className="h-4 w-4" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>Voice Note</TooltipContent>
                      </Tooltip>
                      <Button size="icon" className="h-8 w-8 rounded-lg" onClick={handleSendMessage}>
                        <Send className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  <p className="text-[10px] text-muted-foreground mt-2 text-center">
                    Pressing send will notify the student via WhatsApp & Email immediately.
                  </p>
                </div>
              </>
            ) : (
              // Empty State
              <div className="flex flex-col items-center justify-center h-full text-center p-8">
                <div className="w-20 h-20 bg-primary/5 rounded-full flex items-center justify-center mb-6">
                  <Inbox className="w-10 h-10 text-primary/40" />
                </div>
                <h3 className="text-xl font-bold mb-2">Select a Ticket</h3>
                <p className="text-muted-foreground max-w-sm">
                  Choose a ticket from the left sidebar to view details and reply to students.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}