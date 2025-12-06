import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import ProfessionalBackground from "@/components/ProfessionalBackground";

// Import the shared components
import { TicketList } from "@/components/tickets/TicketList";
import { TicketDetailModal } from "@/components/tickets/TicketDetailModal";

// Import the shared Type
import { Ticket } from "@/types/ticket";

// Mock Data: Specific to the logged-in Tutor
const TUTOR_TICKETS: Ticket[] = [
  {
    id: "TKT-2024-001",
    title: "Elementor Mobile Menu Issue",
    description: "The mobile menu is not collapsing when I click the link on the home page. I've tried changing the Z-index but it didn't help.",
    date: "2025-10-20",
    category: "Technical Support",
    priority: "Medium",
    status: "Open",
    student: { 
      id: "STU-00571", 
      name: "Zareena", 
      email: "zareena@example.com",
      avatar: "", // Add URL if available
      batch: "Batch 14"
    }
  },
  {
    id: "TKT-2024-002",
    title: "Clarification on React Props",
    description: "I am confused about how to pass props from child to parent component. Can you explain the concept of 'Lifting State Up'?",
    date: "2025-10-29",
    category: "Course Doubt",
    priority: "High",
    status: "Open",
    student: { 
      id: "STU-00715", 
      name: "Anju Aravind", 
      email: "anju@example.com",
      batch: "Batch 15"
    }
  }
];

export default function TicketInbox() {
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Handler when a tutor clicks a ticket in the list
  const handleOpenTicket = (ticket: Ticket) => {
    setSelectedTicket(ticket);
    setIsModalOpen(true);
  };

  // Filter logic (Optional: You can add more complex filters here)
  const openTickets = TUTOR_TICKETS.filter(t => t.status === "Open");
  const closedTickets = TUTOR_TICKETS.filter(t => t.status === "Closed");

  return (
    <div className="min-h-screen bg-background relative">
      {/* Subtle Professional Background */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <ProfessionalBackground
          src="/assets/img/hero/tutor-bg.webp" // Ensure you have a valid image path here
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
              Manage student queries and provide expert support.
            </p>
          </div>
        </div>

        {/* Tabs for Organization */}
        <Tabs defaultValue="open" className="w-full">
          <div className="flex items-center justify-between mb-4">
            <TabsList className="bg-muted/50 p-1 rounded-lg">
              <TabsTrigger value="open" className="px-6">
                Assigned to Me ({openTickets.length})
              </TabsTrigger>
              <TabsTrigger value="closed" className="px-6">
                Resolved History ({closedTickets.length})
              </TabsTrigger>
            </TabsList>
          </div>

          {/* OPEN TICKETS TAB */}
          <TabsContent value="open">
            <Card className="bg-card/50 backdrop-blur-sm border-border/50 shadow-sm">
              <CardContent className="p-0">
                <TicketList 
                  tickets={openTickets} 
                  onSelectTicket={handleOpenTicket} 
                />
              </CardContent>
            </Card>
          </TabsContent>
          
          {/* CLOSED TICKETS TAB */}
          <TabsContent value="closed">
            <Card className="bg-card/50 backdrop-blur-sm border-border/50 shadow-sm">
              <CardContent className="p-0">
                {closedTickets.length > 0 ? (
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
        {/* Important: Pass role="tutor" to hide Admin-only features like Delete */}
        <TicketDetailModal 
          ticket={selectedTicket} 
          isOpen={isModalOpen} 
          onClose={() => setIsModalOpen(false)}
          role="tutor" 
        />
      </div>
    </div>
  );
}