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
import { useAuth } from "@/context/AuthContext";
import { Badge } from "@/components/ui/badge";

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
  const { user } = useAuth();
  const isAdmin = user?.role === 'super_admin';

  // --- FILTER LOGIC ---

  // 1. Unassigned (Admin Triage Queue)
  // Only valid if user is Admin, as Tutors don't receive these data from backend anymore
  const unassignedTickets = tickets.filter(t => !t.assigned_to && t.status !== 'Closed');

  // 2. My Active Tasks (Assigned to Me & Open)
  const myActiveTickets = tickets.filter(t =>
    String(t.assigned_to) === String(user?.id) &&
    t.status !== 'Closed'
  );

  // 3. All Active (Admin Oversight)
  const allActiveTickets = tickets.filter(t => t.status !== 'Closed');

  // 4. History (Closed)
  // For Tutors: Only shows their closed tickets (filtered by backend)
  // For Admins: Shows ALL closed tickets
  const closedTickets = tickets.filter(t => t.status === 'Closed');

  return (
    <div className="min-h-screen bg-background relative">
      {/* Subtle Professional Background */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <ProfessionalBackground
          src="https://moajmalnk.in/assets/img/hero/moajmalnk.webp"
          alt="Background"
          className="w-full h-full opacity-[0.02]"
          overlay={true}
        />
      </div>

      <div className="container mx-auto px-4 py-8 relative z-10">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              {isAdmin ? "Support Dashboard" : "My Task Inbox"}
            </h1>
            <p className="text-muted-foreground">
              {isAdmin
                ? "Triage incoming tickets and oversee tutor performance."
                : "Work through your assigned student tickets and provide quality support."}
            </p>
          </div>
        </div>

        {/* Tabs for Organization */}
        <Tabs defaultValue={isAdmin ? "unassigned" : "my_active"} className="w-full">
          <div className="flex items-center justify-between mb-4 overflow-x-auto no-scrollbar">
            <TabsList className="bg-muted/50 p-1 rounded-lg flex-nowrap w-full sm:w-auto justify-start">

              {/* ADMIN: Unassigned (Priority) */}
              {isAdmin && (
                <TabsTrigger value="unassigned" className="px-4 sm:px-6 gap-2">
                  Unassigned
                  {unassignedTickets.length > 0 && (
                    <Badge variant="destructive" className="h-5 px-1.5 text-[10px] min-w-[20px] justify-center ml-1">
                      {unassignedTickets.length}
                    </Badge>
                  )}
                </TabsTrigger>
              )}

              {/* BOTH: My Active Tickets */}
              <TabsTrigger value="my_active" className="px-4 sm:px-6 gap-2">
                {isAdmin ? "My Assigned" : "My Inbox"}
                {myActiveTickets.length > 0 && (
                  <Badge variant="secondary" className="h-5 px-1.5 text-[10px] min-w-[20px] justify-center ml-1 bg-primary/10 text-primary">
                    {myActiveTickets.length}
                  </Badge>
                )}
              </TabsTrigger>

              {/* ADMIN: All Active Overview */}
              {isAdmin && (
                <TabsTrigger value="all_active" className="px-4 sm:px-6">
                  All Active ({allActiveTickets.length})
                </TabsTrigger>
              )}

              {/* BOTH: History */}
              <TabsTrigger value="closed" className="px-4 sm:px-6">
                Resolved ({closedTickets.length})
              </TabsTrigger>
            </TabsList>
          </div>

          {/* 1. UNASSIGNED LIST */}
          {isAdmin && (
            <TabsContent value="unassigned">
              <Card className="bg-card/50 backdrop-blur-sm border-border/50 shadow-sm">
                <CardContent className="p-0">
                  {isLoading ? (
                    <div className="flex justify-center py-12">
                      <Loader2 className="w-8 h-8 animate-spin text-primary" />
                    </div>
                  ) : unassignedTickets.length > 0 ? (
                    <TicketList
                      tickets={unassignedTickets}
                      onSelectTicket={handleOpenTicket}
                      showAssignee={true}
                    />
                  ) : (
                    <div className="text-center py-12 text-muted-foreground">
                      <p>Great! No unassigned tickets.</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          )}

          {/* 2. MY ACTIVE LIST */}
          <TabsContent value="my_active">
            <Card className="bg-card/50 backdrop-blur-sm border-border/50 shadow-sm">
              <CardContent className="p-0">
                {isLoading ? (
                  <div className="flex justify-center py-12">
                    <Loader2 className="w-8 h-8 animate-spin text-primary" />
                  </div>
                ) : myActiveTickets.length > 0 ? (
                  <TicketList
                    tickets={myActiveTickets}
                    onSelectTicket={handleOpenTicket}
                  />
                ) : (
                  <div className="text-center py-12 text-muted-foreground">
                    <p>You have no active tickets assigned.</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* 3. ALL ACTIVE LIST (Admin Only) */}
          {isAdmin && (
            <TabsContent value="all_active">
              <Card className="bg-card/50 backdrop-blur-sm border-border/50 shadow-sm">
                <CardContent className="p-0">
                  {isLoading ? (
                    <div className="flex justify-center py-12">
                      <Loader2 className="w-8 h-8 animate-spin text-primary" />
                    </div>
                  ) : (
                    <TicketList
                      tickets={allActiveTickets}
                      onSelectTicket={handleOpenTicket}
                      showAssignee={true}
                    />
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          )}

          {/* 4. CLOSED LIST */}
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

        <TicketDetailModal
          ticket={selectedTicket}
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          onUpdate={loadTickets}
          role={user?.role as "admin" | "tutor"}
          currentUserId={user?.id}
        />
      </div>
    </div>
  );
}