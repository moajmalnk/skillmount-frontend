import { useState } from "react";
import { TicketList } from "./TicketList";
import { TicketDetailModal } from "./TicketDetailModal";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";

// Mock Data
const TICKETS = [
  {
    id: "#T-CE8FD2",
    title: "Want to change date and hours",
    date: "20-10-2025",
    category: "Wrong Class Scheduled",
    student: { name: "Zareena", id: "ALB/TEA/00571" },
    priority: "Medium",
    status: "Open",
    description: "Kindly change the date and time. I took the class on Saturday 18th Oct."
  },
  {
    id: "#T-F09F47",
    title: "I can't assess my dashboard",
    date: "29-10-2025",
    category: "Unable to Join Class",
    student: { name: "Anju Aravind", id: "ALB/TEA/00715" },
    priority: "High",
    status: "Open",
    description: "The login button is not working for me."
  }
];

export const TicketManager = () => {
  const [selectedTicket, setSelectedTicket] = useState<any | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const openTicket = (ticket: any) => {
    setSelectedTicket(ticket);
    setIsModalOpen(true);
  };

  return (
    <div className="space-y-6">
      <Tabs defaultValue="open" className="w-full">
        <div className="flex items-center justify-between mb-4">
          <TabsList className="bg-muted/50 p-1 rounded-lg">
            <TabsTrigger value="open" className="px-6">Open Tickets ({TICKETS.length})</TabsTrigger>
            <TabsTrigger value="closed" className="px-6">Closed Tickets (0)</TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="open">
          <Card className="bg-transparent border-none shadow-none">
            <CardContent className="p-0">
              <TicketList 
                tickets={TICKETS as any} 
                onSelectTicket={openTicket} 
              />
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="closed">
          <div className="text-center py-10 text-muted-foreground">No closed tickets.</div>
        </TabsContent>
      </Tabs>

      {/* The Detail Modal */}
      <TicketDetailModal 
        ticket={selectedTicket} 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
      />
    </div>
  );
};