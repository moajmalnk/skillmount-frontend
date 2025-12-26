import { useState, useEffect } from "react";
import { TicketList } from "./TicketList";
import { TicketDetailModal } from "./TicketDetailModal";
import { DeleteConfirmationDialog } from "../DeleteConfirmationDialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ticketService } from "@/services/ticketService";
import { useAuth } from "@/context/AuthContext"; // Import useAuth
import { Ticket } from "@/types/ticket";
import { toast } from "sonner";
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Filter, X } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import { DateRange } from "react-day-picker";
import { cn } from "@/lib/utils";

export const TicketManager = () => {
    const { user } = useAuth();
    const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [tickets, setTickets] = useState<Ticket[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [activeTab, setActiveTab] = useState("Open"); // Track active tab
    const [deleteTicket, setDeleteTicket] = useState<Ticket | null>(null);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    // Priority filter still separate or can be added to server params
    const [priorityFilter, setPriorityFilter] = useState<"all" | "Low" | "Medium" | "High" | "Urgent">("all");

    // Pagination & Advanced Filters
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [categoryFilter, setCategoryFilter] = useState("");

    const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined);

    // Load Tickets (Server-Side Filter)
    const loadTickets = async () => {
        setIsLoading(true);
        try {
            const params: any = {};

            params.page = page;

            // Tab Logic
            if (activeTab === 'Open') {
                // Show Open, In Progress, Reopened
                params['status__in'] = 'Open,In Progress,Reopened';
            } else if (activeTab === 'Closed') {
                params.status = 'Closed';
            } else if (activeTab === 'Assigned') {
                params.assigned_to = user?.id;
            }

            if (searchTerm) params.search = searchTerm;
            if (priorityFilter !== 'all') params.priority = priorityFilter;
            if (categoryFilter) params.category__icontains = categoryFilter;

            if (dateRange?.from) params.created_at__gte = format(dateRange.from, "yyyy-MM-dd");
            if (dateRange?.to) params.created_at__lte = format(dateRange.to, "yyyy-MM-dd");

            const data = await ticketService.getAll(params);

            if (data.results) {
                setTickets(data.results);
                const count = data.count || 0;
                setTotalPages(Math.ceil(count / 10) || 1);
            } else {
                setTickets(data); // Fallback
                setTotalPages(1);
            }

        } catch (error) {
            toast.error("Failed to load tickets");
        } finally {
            setIsLoading(false);
        }
    };

    // Reload when filters change (Reset page to 1 for filters)
    useEffect(() => {
        setPage(1);
        loadTickets();
    }, [activeTab, priorityFilter, categoryFilter, dateRange]);

    // Reload when page changes (don't reset page)
    useEffect(() => {
        loadTickets();
    }, [page]);

    // Debounce search separate to avoid rapid calls
    useEffect(() => {
        const timer = setTimeout(() => {
            setPage(1); // Reset page on search
            loadTickets();
        }, 500);
        return () => clearTimeout(timer);
    }, [searchTerm]);


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
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <div className="flex flex-col gap-4">
                    {/* Top Bar: Tabs & Search & Priority */}
                    <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                        <TabsList className="bg-muted/50 p-1 rounded-lg w-full md:w-auto flex justify-between md:justify-start">
                            <TabsTrigger value="Open" className="flex-1 md:flex-none px-2 sm:px-4 text-[10px] sm:text-sm">Open / Pending</TabsTrigger>
                            <TabsTrigger value="Assigned" className="flex-1 md:flex-none px-2 sm:px-4 text-[10px] sm:text-sm">My Assigned</TabsTrigger>
                            <TabsTrigger value="Closed" className="flex-1 md:flex-none px-2 sm:px-4 text-[10px] sm:text-sm">Closed</TabsTrigger>
                        </TabsList>

                        <div className="grid grid-cols-2 md:flex md:flex-row gap-2 w-full md:w-auto">
                            <Input
                                placeholder="Search..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="h-9 w-full md:w-48 bg-background text-xs sm:text-sm"
                            />
                            <Select
                                value={priorityFilter}
                                onValueChange={(val: any) => setPriorityFilter(val)}
                            >
                                <SelectTrigger className="h-9 w-full md:w-32 bg-background text-xs sm:text-sm">
                                    <SelectValue placeholder="Priority" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">Priority: All</SelectItem>
                                    <SelectItem value="Urgent">Urgent</SelectItem>
                                    <SelectItem value="High">High</SelectItem>
                                    <SelectItem value="Medium">Medium</SelectItem>
                                    <SelectItem value="Low">Low</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    {/* Advanced Filters Bar */}
                    <div className="flex flex-col sm:flex-row flex-wrap gap-2 items-start sm:items-center bg-muted/20 p-2 rounded-lg border border-border/50">
                        <div className="text-[10px] sm:text-xs font-bold text-muted-foreground uppercase tracking-wider flex items-center px-1">
                            <Filter className="w-3 h-3 mr-1" /> Filters:
                        </div>

                        <div className="flex flex-wrap gap-2 w-full sm:w-auto">
                            <div className="relative flex-1 sm:flex-none">
                                <Filter className="absolute left-2 top-1/2 -translate-y-1/2 w-3 h-3 text-muted-foreground" />
                                <Input
                                    placeholder="Category..."
                                    value={categoryFilter}
                                    onChange={(e) => setCategoryFilter(e.target.value)}
                                    className="h-8 w-full sm:w-36 pl-8 text-[11px] bg-background border-dashed focus-visible:ring-0 focus-visible:border-primary"
                                />
                            </div>

                            <Popover>
                                <PopoverTrigger asChild>
                                    <Button
                                        id="date"
                                        variant={"outline"}
                                        className={cn(
                                            "h-8 w-full sm:w-[200px] justify-start text-left font-normal border-dashed text-[11px]",
                                            !dateRange && "text-muted-foreground"
                                        )}
                                    >
                                        <CalendarIcon className="mr-2 h-3 w-3" />
                                        <span className="truncate">
                                            {dateRange?.from ? (
                                                dateRange.to ? (
                                                    <>
                                                        {format(dateRange.from, "LLL dd, y")} -{" "}
                                                        {format(dateRange.to, "LLL dd, y")}
                                                    </>
                                                ) : (
                                                    format(dateRange.from, "LLL dd, y")
                                                )
                                            ) : (
                                                <span>Pick a date range</span>
                                            )}
                                        </span>
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0" align="start">
                                    <Calendar
                                        initialFocus
                                        mode="range"
                                        defaultMonth={dateRange?.from}
                                        selected={dateRange}
                                        onSelect={setDateRange}
                                        numberOfMonths={1}
                                        className="p-3"
                                    />
                                </PopoverContent>
                            </Popover>

                            {(categoryFilter || dateRange) && (
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => { setCategoryFilter(""); setDateRange(undefined); }}
                                    className="h-8 text-[11px] text-muted-foreground hover:text-foreground hover:bg-muted ml-auto sm:ml-0"
                                >
                                    <X className="w-3 h-3 mr-1" />
                                    Clear
                                </Button>
                            )}
                        </div>
                    </div>
                </div>

                {/* Content Area */}
                <div className="mt-4 space-y-4">
                    <Card className="bg-transparent border-none shadow-none">
                        <CardContent className="p-0">
                            {isLoading ? (
                                <div className="p-10 text-center text-muted-foreground">Loading tickets...</div>
                            ) : tickets.length === 0 ? (
                                <div className="text-center py-10 text-muted-foreground">No tickets found matching filters.</div>
                            ) : (
                                <>
                                    <TicketList
                                        tickets={tickets}
                                        onSelectTicket={openTicket}
                                        onDeleteTicket={handleDeleteTicket}
                                    />

                                    {/* Pagination Controls */}
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
                                </>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </Tabs>

            {/* The Detail Modal */}
            <TicketDetailModal
                ticket={selectedTicket}
                isOpen={isModalOpen}
                onClose={handleModalClose}
                role="admin"
                currentUserId={user?.id}
                onDelete={(id) => {
                    setIsModalOpen(false);
                    const t = tickets.find(x => x.id === id);
                    if (t) handleDeleteTicket(t);
                }}
                onUpdate={loadTickets}
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
