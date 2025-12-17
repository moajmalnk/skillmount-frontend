import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Edit, Clock, Trash2 } from "lucide-react";
import { Ticket } from "@/types/ticket";
import { format } from "date-fns";

interface TicketListProps {
  tickets: Ticket[];
  onSelectTicket: (ticket: Ticket) => void;
  onDeleteTicket: (ticket: Ticket) => void;
}

export const TicketList = ({ tickets, onSelectTicket, onDeleteTicket }: TicketListProps) => {
  if (tickets.length === 0) {
    return <div className="text-center py-10 text-muted-foreground">No tickets found.</div>;
  }

  return (
    <div className="space-y-3">
      {/* Header Row */}
      <div className="grid grid-cols-12 gap-4 px-6 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
        <div className="col-span-2">Ticket ID</div>
        <div className="col-span-3">Title & Date</div>
        <div className="col-span-2">Category</div>
        <div className="col-span-3">Ticketed By</div>
        <div className="col-span-1">Priority</div>
        <div className="col-span-1 text-right">Action</div>
      </div>

      {/* Ticket Rows */}
      {tickets.map((ticket) => (
        <div
          key={ticket.id}
          className="grid grid-cols-12 gap-4 items-center bg-card border border-border/50 hover:border-primary/30 hover:shadow-md transition-all duration-200 p-4 rounded-xl group cursor-pointer"
          onClick={() => onSelectTicket(ticket)}
        >
          {/* ID */}
          <div className="col-span-2 font-mono text-xs text-muted-foreground">
            {ticket.id}
          </div>

          {/* Title */}
          <div className="col-span-3">
            <div className="font-semibold text-foreground truncate">{ticket.title}</div>
            <div className="text-xs text-primary/70 flex items-center gap-1 mt-0.5">
              <Clock className="w-3 h-3" /> {ticket.created_at ? format(new Date(ticket.created_at), 'dd MMM yyyy') : 'N/A'}
            </div>
          </div>

          {/* Category */}
          <div className="col-span-2 text-sm text-muted-foreground">
            {ticket.category}
          </div>

          {/* Student Info */}
          <div className="col-span-3 flex items-center gap-3">
            <Avatar className="h-8 w-8">
              <AvatarImage src={ticket.student?.avatar} />
              <AvatarFallback className="bg-primary/10 text-primary text-xs">{ticket.student?.name?.substring(0, 2) || 'ST'}</AvatarFallback>
            </Avatar>
            <div className="flex flex-col">
              <span className="text-sm font-medium leading-none">{ticket.student?.name || "Unknown"}</span>
              <span className="text-[10px] text-muted-foreground font-mono mt-1">{ticket.student?.id || "No ID"}</span>
            </div>
          </div>

          {/* Priority */}
          <div className="col-span-1">
            <Badge
              variant="outline"
              className={`
                ${ticket.priority === 'High' ? 'bg-red-500/10 text-red-600 border-red-200' : ''}
                ${ticket.priority === 'Medium' ? 'bg-orange-500/10 text-orange-600 border-orange-200' : ''}
                ${ticket.priority === 'Low' ? 'bg-blue-500/10 text-blue-600 border-blue-200' : ''}
              `}
            >
              {ticket.priority}
            </Badge>
          </div>

          {/* Actions */}
          <div className="col-span-1 text-right">
            <div className="flex items-center justify-end gap-1">
              <Button variant="ghost" size="icon" className="bg-muted/50 group-hover:bg-primary group-hover:text-white transition-colors h-8 w-8">
                <Edit className="w-4 h-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="bg-muted/50 hover:bg-destructive hover:text-destructive-foreground transition-colors h-8 w-8"
                onClick={(e) => {
                  e.stopPropagation();
                  onDeleteTicket(ticket);
                }}
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};