import { useState, useEffect } from "react";
import { TicketList } from "./TicketList";
import { TicketDetailModal } from "./TicketDetailModal";
import { DeleteConfirmationDialog } from "../DeleteConfirmationDialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ticketService } from "@/services/ticketService";
import { Ticket } from "@/types/ticket";
import { toast } from "sonner";

export const TicketManager = () => {
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [deleteTicket, setDeleteTicket] = useState<Ticket | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [priorityFilter, setPriorityFilter] = useState<"all" | "Low" | "Medium" | "High" | "Urgent">("all");

  // Load Tickets
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

  // Filter Logic
  const filtered = tickets.filter((t) => {
    const matchesSearch =
      !searchTerm ||
      t.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesPriority =
      priorityFilter === "all" || t.priority === priorityFilter;
    return matchesSearch && matchesPriority;
  });

  const openTickets = filtered.filter(t => t.status !== 'Closed');
  const closedTickets = filtered.filter(t => t.status === 'Closed');

  const openTicket = (ticket: Ticket) => {
    setSelectedTicket(ticket);
    setIsModalOpen(true);
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    loadTickets(); // Refresh tickets when modal closes
  };

  const handleDeleteTicket = (ticket: Ticket) => {
    setDeleteTicket(ticket);
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!deleteTicket) return;

    try {
      if (deleteTicket.id) {
        await ticketService.delete(deleteTicket.id);
        toast.success("Ticket deleted successfully");
        loadTickets();
        setIsDeleteDialogOpen(false);
        setDeleteTicket(null);
      }
    } catch (error) {
      toast.error("Failed to delete ticket");
    }
  };

  return (
    <div className="space-y-6">
      <Tabs defaultValue="open" className="w-full">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between mb-4">
          <TabsList className="bg-muted/50 p-1 rounded-lg">
            <TabsTrigger value="open" className="px-6">Open Tickets ({openTickets.length})</TabsTrigger>
            <TabsTrigger value="closed" className="px-6">Closed Tickets ({closedTickets.length})</TabsTrigger>
          </TabsList>

          <div className="flex flex-col md:flex-row gap-2 w-full md:w-auto">
            <Input
              placeholder="Search by ID or subject…"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="h-9 md:w-64"
            />
            <Select
              value={priorityFilter}
              onValueChange={(val: any) => setPriorityFilter(val)}
            >
              <SelectTrigger className="h-9 md:w-40">
                <SelectValue placeholder="Priority" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All priorities</SelectItem>
                <SelectItem value="Urgent">Urgent</SelectItem>
                <SelectItem value="High">High</SelectItem>
                <SelectItem value="Medium">Medium</SelectItem>
                <SelectItem value="Low">Low</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <TabsContent value="open">
          <Card className="bg-transparent border-none shadow-none">
            <CardContent className="p-0">
              {isLoading ? (
                <div className="p-10 text-center text-muted-foreground">Loading tickets...</div>
              ) : (
                <TicketList
                  tickets={openTickets}
                  onSelectTicket={openTicket}
                  onDeleteTicket={handleDeleteTicket}
                />
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="closed">
          <Card className="bg-transparent border-none shadow-none">
            <CardContent className="p-0">
              {isLoading ? (
                <div className="p-10 text-center text-muted-foreground">Loading tickets...</div>
              ) : closedTickets.length === 0 ? (
                <div className="text-center py-10 text-muted-foreground">No closed tickets.</div>
              ) : (
                <TicketList
                  tickets={closedTickets}
                  onSelectTicket={openTicket}
                  onDeleteTicket={handleDeleteTicket}
                />
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* The Detail Modal */}
      <TicketDetailModal
        ticket={selectedTicket}
        isOpen={isModalOpen}
        onClose={handleModalClose}
      />

      {/* Delete Confirmation Dialog */}
      <DeleteConfirmationDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        onConfirm={confirmDelete}
        title="Delete Ticket"
        description="Are you sure you want to delete this ticket? This action cannot be undone."
        itemName={deleteTicket?.title}
      />
    </div>
  );
};