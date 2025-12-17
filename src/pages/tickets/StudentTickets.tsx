import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TicketList } from "@/components/tickets/TicketList";
import { TicketDetailModal } from "@/components/tickets/TicketDetailModal";
import ProfessionalBackground from "@/components/ProfessionalBackground";
import { Ticket } from "@/types/ticket";
import { useAuth } from "@/context/AuthContext";
import { ticketService } from "@/services/ticketService";
import { toast } from "sonner";

export default function StudentTickets() {
  const { user } = useAuth();
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadTickets = async () => {
    setIsLoading(true);
    try {
      const data = await ticketService.getAll();
      setTickets(data);
    } catch (error) {
      toast.error("Failed to load tickets");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadTickets();
  }, []);

  const handleOpenTicket = (ticket: Ticket) => {
    setSelectedTicket(ticket);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    loadTickets(); // Refresh tickets when modal closes
  };

  return (
    <div className="min-h-screen bg-background relative p-6">
      <div className="absolute inset-0 z-0 pointer-events-none">
        <ProfessionalBackground
          src="/assets/img/hero/tutor-hero.jpg"
          alt="bg"
          className="w-full h-full opacity-[0.02]"
          overlay={true}
        />
      </div>

      <div className="container mx-auto max-w-5xl relative z-10 space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">My Support Tickets</h1>
          <p className="text-muted-foreground">
            Track the status of your support queries. Our team will reply here and close the ticket for you.
          </p>
        </div>

        <Card className="bg-card/50 backdrop-blur-sm border-border/50 shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg">Ticket History ({tickets.length})</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="p-10 text-center text-muted-foreground">Loading your tickets...</div>
            ) : tickets.length === 0 ? (
              <div className="text-center py-10 text-muted-foreground">
                <p>You don't have any tickets yet.</p>
                <p className="text-sm mt-2">Need help? Create a ticket from the home page.</p>
              </div>
            ) : (
              <TicketList
                tickets={tickets}
                onSelectTicket={handleOpenTicket}
                showStudentInfo={false}
              />
            )}
          </CardContent>
        </Card>

        {/* Student ticket modal */}
        <TicketDetailModal
          ticket={selectedTicket}
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          role="student"
        />
      </div>
    </div>
  );
}