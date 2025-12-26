import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Edit, Clock } from "lucide-react";
import { Ticket } from "@/types/ticket"; // <--- Imported from central types

interface TicketListProps {
  tickets: Ticket[];
  onSelectTicket: (ticket: Ticket) => void;
  showStudentInfo?: boolean;
}

export const TicketList = ({ tickets, onSelectTicket, showStudentInfo = true }: TicketListProps) => {
  if (tickets.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground bg-muted/5 rounded-xl border border-dashed border-border">
        No tickets found.
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* Header Row - Hidden on mobile */}
      <div className="hidden md:grid grid-cols-12 gap-4 px-6 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
        <div className="col-span-2">Ticket ID</div>
        <div className="col-span-3">Title & Date</div>
        <div className="col-span-2">Category</div>
        {showStudentInfo && <div className="col-span-3">Ticketed By</div>}
        <div className="col-span-1">Priority</div>
        <div className="col-span-1 text-right">Action</div>
      </div>

      {/* Ticket Rows */}
      {tickets.map((ticket) => (
        <div
          key={ticket.id}
          className="flex flex-col md:grid md:grid-cols-12 gap-3 md:gap-4 items-start md:items-center bg-card border border-border/50 hover:border-primary/30 hover:shadow-md transition-all duration-200 p-4 rounded-xl group cursor-pointer relative"
          onClick={() => onSelectTicket(ticket)}
        >
          {/* Mobile Header: ID & Action */}
          <div className="flex md:hidden items-center justify-between w-full border-b border-border/50 pb-2 mb-1">
            <span className="font-mono text-[10px] text-muted-foreground">{ticket.id}</span>
            <Button variant="ghost" size="icon" className="h-7 w-7 bg-muted/50 text-muted-foreground hover:bg-primary hover:text-primary-foreground">
              <Edit className="w-3.5 h-3.5" />
            </Button>
          </div>

          {/* ID - Desktop only */}
          <div className="hidden md:block col-span-2 font-mono text-xs text-muted-foreground truncate">
            {ticket.id}
          </div>

          {/* Title & Date */}
          <div className="col-span-12 md:col-span-3 w-full">
            <div className="font-semibold text-foreground text-sm sm:text-base md:truncate leading-tight" title={ticket.title}>
              {ticket.title}
            </div>
            <div className="text-[10px] sm:text-xs text-primary/70 flex items-center gap-1 mt-1">
              <Clock className="w-3 h-3" /> {new Date(ticket.created_at).toLocaleDateString()}
            </div>
          </div>

          {/* Category */}
          <div className="col-span-12 md:col-span-2 flex items-center gap-2 md:block">
            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider md:hidden">Category:</span>
            <span className="text-xs sm:text-sm text-muted-foreground truncate">{ticket.category}</span>
          </div>

          {/* Student Info */}
          {showStudentInfo && (
            <div className="col-span-12 md:col-span-3 flex items-center gap-3 w-full">
              <Avatar className="h-8 w-8 shrink-0 border border-border/50">
                <AvatarImage src={ticket.student.avatar} />
                <AvatarFallback className="bg-primary/10 text-primary text-[10px]">
                  {ticket.student.name.substring(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="flex flex-col min-w-0">
                <span className="text-xs sm:text-sm font-medium leading-tight truncate">{ticket.student.name}</span>
                <span className="text-[10px] text-muted-foreground font-mono truncate">
                  {ticket.student.id}
                </span>
              </div>
            </div>
          )}

          {/* Priority Badge */}
          <div className="col-span-12 md:col-span-1 flex items-center gap-2 md:block">
            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider md:hidden">Priority:</span>
            <Badge
              variant="outline"
              className={`
                 text-[10px] h-5 px-1.5 whitespace-nowrap
                 ${ticket.priority === 'High' || ticket.priority === 'Urgent' ? 'bg-red-500/10 text-red-600 border-red-200' : ''}
                 ${ticket.priority === 'Medium' ? 'bg-orange-500/10 text-orange-600 border-orange-200' : ''}
                 ${ticket.priority === 'Low' ? 'bg-blue-500/10 text-blue-600 border-blue-200' : ''}
               `}
            >
              {ticket.priority}
            </Badge>
          </div>

          {/* Actions - Desktop only */}
          <div className="hidden md:block col-span-1 text-right">
            <Button
              variant="ghost"
              size="icon"
              className="bg-muted/50 group-hover:bg-primary group-hover:text-primary-foreground transition-colors h-8 w-8"
            >
              <Edit className="w-4 h-4" />
            </Button>
          </div>
        </div>
      ))}
    </div>
  );
};