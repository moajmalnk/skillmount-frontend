import { Ticket } from "@/types/ticket";
import { ScrollArea } from "@/components/ui/scroll-area";
import { CalendarClock, CheckCircle2, MessageSquare, AlertCircle, RefreshCw, User, Mic, Paperclip } from "lucide-react";

export const TicketLogView = ({ ticket }: { ticket: Ticket }) => {
    // Helper to determine role
    const getRole = (name: string) => {
        return name === ticket.student?.name ? 'Student' : 'Support Agent';
    };

    // Helper to format date
    const formatDate = (dateStr: string) => {
        return new Date(dateStr).toLocaleString('en-US', {
            weekday: 'short',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    // Construct timeline events
    const events = [
        {
            type: 'create',
            timestamp: ticket.created_at,
            title: "Ticket Created",
            subtitle: `by ${ticket.student?.name || 'Student'} (Student)`,
            description: "Initial request submitted.",
            icon: <CalendarClock className="w-3.5 h-3.5 text-blue-500" />
        },
        // Current Status (Top of list logically, but we sort by time)
        {
            type: 'status',
            timestamp: ticket.updated_at,
            title: "Current Status Updated",
            subtitle: `Status is now ${ticket.status}`,
            description: `Priority set to ${ticket.priority}`,
            icon: <RefreshCw className="w-3.5 h-3.5 text-orange-500" />
        }
    ];

    // Merge messages as detailed activity
    ticket.messages?.forEach(msg => {
        const role = getRole(msg.sender_name);
        const isVoice = !!msg.voice_note;
        const isAttachment = !!msg.attachment;

        let actionMethod = "Text";
        if (isVoice) actionMethod = "Voice Note";
        else if (isAttachment && !msg.message) actionMethod = "Attachment";
        else if (isAttachment) actionMethod = "Text & Attachment";

        events.push({
            type: 'message',
            timestamp: msg.timestamp,
            title: `Reply from ${msg.sender_name}`,
            subtitle: `${role} • via ${actionMethod}`,
            description: msg.message || (isVoice ? 'Voice Note' : 'File Attachment'),
            icon: isVoice ? <Mic className="w-3.5 h-3.5 text-purple-500" /> : <MessageSquare className="w-3.5 h-3.5 text-zinc-500" />
        });
    });

    // Sort by date desc (Newest first)
    events.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

    return (
        <div className="h-full flex flex-col p-4 sm:p-6 animate-in fade-in zoom-in-95 duration-200">
            <h3 className="font-semibold text-lg mb-6 flex items-center gap-2">
                <RefreshCw className="w-4 h-4 text-muted-foreground" />
                Ticket Audit Log
            </h3>
            <ScrollArea className="flex-1 pr-4">
                <div className="relative border-l border-border/60 ml-3 space-y-8 pb-8">
                    {events.map((event, i) => (
                        <div key={i} className="relative pl-8 group">
                            {/* Icon Bubble */}
                            <div className={`
                                absolute -left-2.5 p-1.5 bg-background rounded-full border shadow-sm transition-all group-hover:scale-110
                                ${event.type === 'create' ? 'border-blue-200' : ''}
                                ${event.type === 'message' ? 'border-zinc-200' : ''}
                                ${event.type === 'status' ? 'border-orange-200' : ''}
                            `}>
                                {event.icon}
                            </div>

                            {/* Content */}
                            <div className="flex flex-col gap-1">
                                <div className="flex items-center gap-2">
                                    <span className="text-sm font-semibold text-foreground">
                                        {event.title}
                                    </span>
                                    <span className="text-[10px] text-muted-foreground bg-muted/50 px-1.5 py-0.5 rounded-full">
                                        {formatDate(event.timestamp)}
                                    </span>
                                </div>

                                <span className="text-xs font-medium text-primary/80">
                                    {event.subtitle}
                                </span>

                                <div className="mt-1 p-2 bg-muted/20 rounded-md border border-border/30 text-xs text-muted-foreground/90 leading-relaxed font-mono">
                                    {event.description}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </ScrollArea>
        </div>
    );
};
