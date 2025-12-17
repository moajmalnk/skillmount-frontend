import { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import ProfessionalBackground from "@/components/ProfessionalBackground";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

// Import the shared components
import { TicketList } from "@/components/tickets/TicketList";
import { TicketDetailModal } from "@/components/tickets/TicketDetailModal";

// Import Service & Type
import { ticketService } from "@/services/ticketService";
import { Ticket } from "@/types/ticket";

export default function TicketInbox() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // 1. Fetch Real Data
  const loadTickets = async () => {
    setIsLoading(true);
    try {
      const data = await ticketService.getAll();
      setTickets(data);
    } catch (error) {
      console.error("Failed to load tickets", error);
      toast.error("Failed to load tickets");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadTickets();
  }, []);

  // 2. Handler when a tutor clicks a ticket
  const handleOpenTicket = (ticket: Ticket) => {
    setSelectedTicket(ticket);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    loadTickets(); // Refresh data to see new messages/status changes
  };

  // Active tickets are those still open (tutors/admins give a final reply which closes the ticket).
  const openTickets = tickets.filter(t => t.status === "Open");
  const closedTickets = tickets.filter(t => t.status === "Closed");

  return (
    <div className="min-h-screen bg-background relative">
      {/* Subtle Professional Background */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <ProfessionalBackground
          src="/assets/img/hero/tutor-bg.webp" // Ensure path exists
          alt="Background"
          className="w-full h-full opacity-[0.02]"
          overlay={true}
        />
      </div>

      <div className="container mx-auto px-4 py-8 relative z-10">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Tutor Inbox</h1>
            <p className="text-muted-foreground">
              Review student tickets and send a clear, final reply for each one.
            </p>
          </div>
        </div>

        {/* Tabs for Organization */}
        <Tabs defaultValue="open" className="w-full">
          <div className="flex items-center justify-between mb-4">
            <TabsList className="bg-muted/50 p-1 rounded-lg">
              <TabsTrigger value="open" className="px-6">
                Active Tickets ({openTickets.length})
              </TabsTrigger>
              <TabsTrigger value="closed" className="px-6">
                Resolved History ({closedTickets.length})
              </TabsTrigger>
            </TabsList>
          </div>

          {/* OPEN / PENDING TICKETS TAB */}
          <TabsContent value="open">
            <Card className="bg-card/50 backdrop-blur-sm border-border/50 shadow-sm">
              <CardContent className="p-0">
                {isLoading ? (
                  <div className="flex justify-center py-12">
                    <Loader2 className="w-8 h-8 animate-spin text-primary" />
                  </div>
                ) : (
                  <TicketList 
                    tickets={openTickets} 
                    onSelectTicket={handleOpenTicket} 
                  />
                )}
              </CardContent>
            </Card>
          </TabsContent>
          
          {/* CLOSED TICKETS TAB */}
          <TabsContent value="closed">
            <Card className="bg-card/50 backdrop-blur-sm border-border/50 shadow-sm">
              <CardContent className="p-0">
                {isLoading ? (
                   <div className="flex justify-center py-12">
                     <Loader2 className="w-8 h-8 animate-spin text-primary" />
                   </div>
                ) : closedTickets.length > 0 ? (
                  <TicketList 
                    tickets={closedTickets} 
                    onSelectTicket={handleOpenTicket} 
                  />
                ) : (
                  <div className="text-center py-12 text-muted-foreground">
                    No resolved tickets found.
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Ticket Detail Modal */}
        <TicketDetailModal 
          ticket={selectedTicket} 
          isOpen={isModalOpen} 
          onClose={handleCloseModal}
          role="tutor" 
        />
      </div>
    </div>
  );
}