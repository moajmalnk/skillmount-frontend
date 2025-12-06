import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TicketList } from "@/components/tickets/TicketList";
import { TicketDetailModal } from "@/components/tickets/TicketDetailModal";
import ProfessionalBackground from "@/components/ProfessionalBackground";
import { Ticket } from "@/types/ticket";
import { useAuth } from "@/context/AuthContext";

// Mock Data: Tickets belonging to the logged-in student
const MY_TICKETS: Ticket[] = [
  {
    id: "TKT-2024-001",
    title: "Elementor Mobile Menu Issue",
    description: "The mobile menu is not collapsing when I click the link.",
    date: "2025-10-20",
    category: "Technical Support",
    priority: "Medium",
    status: "Open",
    student: { 
      id: "STU-001", 
      name: "Alex Johnson", // Current User
      email: "alex@example.com",
      avatar: "",
      batch: "Batch 14"
    },
    messages: [
        { id: "1", sender: "student", text: "Menu isn't working on mobile.", time: "10:00 AM" },
        { id: "2", sender: "tutor", text: "Try clearing cache.", time: "10:15 AM" }
    ]
  }
];

export default function StudentTickets() {
  const { user } = useAuth();
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleOpenTicket = (ticket: Ticket) => {
    setSelectedTicket(ticket);
    setIsModalOpen(true);
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
            <p className="text-muted-foreground">Track status and reply to your queries.</p>
        </div>

        <Card className="bg-card/50 backdrop-blur-sm border-border/50 shadow-sm">
            <CardHeader>
                <CardTitle className="text-lg">Ticket History</CardTitle>
            </CardHeader>
            <CardContent>
            {/* Reusing the same component! */}
            <TicketList 
                tickets={MY_TICKETS} 
                onSelectTicket={handleOpenTicket} 
            />
            </CardContent>
        </Card>

        {/* Reusing the same modal with role="student" */}
        <TicketDetailModal 
            ticket={selectedTicket} 
            isOpen={isModalOpen} 
            onClose={() => setIsModalOpen(false)}
            role="student" 
        />
      </div>
    </div>
  );
}