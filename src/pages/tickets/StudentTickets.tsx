import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TicketList } from "@/components/tickets/TicketList";
import { TicketDetailModal } from "@/components/tickets/TicketDetailModal";
import ProfessionalBackground from "@/components/ProfessionalBackground";
import { Ticket } from "@/types/ticket";
import { useAuth } from "@/context/AuthContext";
import { ticketService } from "@/services/ticketService";
import { toast } from "sonner";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function StudentTickets() {
    const { user } = useAuth();
    const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [tickets, setTickets] = useState<Ticket[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalCount, setTotalCount] = useState(0);

    const loadTickets = async () => {
        setIsLoading(true);
        try {
            const data = await ticketService.getAll({ page });
            if (data.results) {
                setTickets(data.results);
                const count = data.count || 0;
                setTotalCount(count);
                setTotalPages(Math.ceil(count / 10) || 1);
            } else {
                setTickets(data);
                setTotalCount(data.length);
                setTotalPages(1);
            }
        } catch (error) {
            toast.error("Failed to load tickets");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        loadTickets();
    }, [page]);

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
                    src="/tutor-hero.jpg"
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
                        <CardTitle className="text-lg">Ticket History ({totalCount})</CardTitle>
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
                            <>
                                <TicketList
                                    tickets={tickets}
                                    onSelectTicket={handleOpenTicket}
                                    showStudentInfo={false}
                                />
                                {totalPages > 1 && (
                                    <div className="flex items-center justify-between py-4 border-t border-border/50 mt-4">
                                        <div className="text-xs text-muted-foreground">
                                            Page {page} of {totalPages}
                                        </div>
                                        <div className="flex gap-2">
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                disabled={page <= 1}
                                                onClick={() => setPage(p => p - 1)}
                                                className="h-8 w-8 p-0"
                                            >
                                                <ChevronLeft className="w-4 h-4" />
                                            </Button>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                disabled={page >= totalPages}
                                                onClick={() => setPage(p => p + 1)}
                                                className="h-8 w-8 p-0"
                                            >
                                                <ChevronRight className="w-4 h-4" />
                                            </Button>
                                        </div>
                                    </div>
                                )}
                            </>
                        )}
                    </CardContent>
                </Card>

                {/* Student ticket modal */}
                <TicketDetailModal
                    ticket={selectedTicket}
                    isOpen={isModalOpen}
                    onClose={handleCloseModal}
                    role="student"
                    currentUserId={user?.id}
                    onUpdate={loadTickets}
                />
            </div>
        </div>
    );
}
