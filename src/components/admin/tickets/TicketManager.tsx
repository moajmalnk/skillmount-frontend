import { useState, useEffect } from "react";
import { TicketList } from "./TicketList";
import { TicketDetailModal } from "./TicketDetailModal";
import { DeleteConfirmationDialog } from "../DeleteConfirmationDialog";
import { Card, CardContent } from "@/components/ui/card";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ticketService } from "@/services/ticketService";
import { systemService } from "@/services/systemService";
import { useAuth } from "@/context/AuthContext"; // Import useAuth
import { Ticket } from "@/types/ticket";
import { toast } from "sonner";
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Filter, X, Search, Plus } from "lucide-react";
import { TicketCreateDialog } from "./TicketCreateDialog";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import { DateRange } from "react-day-picker";
import { cn } from "@/lib/utils";

export const TicketManager = () => {
    const { user } = useAuth();
    const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isCreateOpen, setIsCreateOpen] = useState(false);
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
    const [categoryOptions, setCategoryOptions] = useState<string[]>([]);

    useEffect(() => {
        const fetchCategories = async () => {
            const settings = await systemService.getSettings();
            setCategoryOptions(settings.ticketCategories || []);
        };
        fetchCategories();
    }, []);

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
        <div className="space-y-4">
            {/* Filter Bar */}
            <Card>
                <CardContent className="p-4">
                    <div className="flex flex-col md:flex-row gap-4">
                        {/* Search */}
                        <div className="flex-1 relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                            <Input
                                placeholder="Search tickets..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-9"
                            />
                        </div>

                        {/* Status View (Tabs Replacement) */}
                        <div className="w-full md:w-[170px]">
                            <Select value={activeTab} onValueChange={setActiveTab}>
                                <SelectTrigger>
                                    <SelectValue placeholder="View" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Open">Open / Pending</SelectItem>
                                    <SelectItem value="Assigned">My Assigned</SelectItem>
                                    <SelectItem value="Closed">Closed</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Priority */}
                        <div className="w-full md:w-[150px]">
                            <Select value={priorityFilter} onValueChange={(val: any) => setPriorityFilter(val)}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Priority" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Priorities</SelectItem>
                                    <SelectItem value="Urgent">Urgent</SelectItem>
                                    <SelectItem value="High">High</SelectItem>
                                    <SelectItem value="Medium">Medium</SelectItem>
                                    <SelectItem value="Low">Low</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Category */}
                        <div className="w-full md:w-[180px]">
                            <Select
                                value={categoryFilter === "" ? "all" : categoryFilter}
                                onValueChange={(val) => setCategoryFilter(val === "all" ? "" : val)}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Category" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Categories</SelectItem>
                                    {categoryOptions.map(cat => (
                                        <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Date Range */}
                        <Popover>
                            <PopoverTrigger asChild>
                                <Button
                                    variant={"outline"}
                                    className={cn(
                                        "w-full md:w-[210px] justify-start text-left font-normal",
                                        !dateRange && "text-muted-foreground"
                                    )}
                                >
                                    <CalendarIcon className="mr-2 h-4 w-4" />
                                    {dateRange?.from ? (
                                        dateRange.to ? (
                                            <>{format(dateRange.from, "MMM dd")} - {format(dateRange.to, "MMM dd")}</>
                                        ) : (
                                            format(dateRange.from, "MMM dd")
                                        )
                                    ) : (
                                        <span>Filter by Date</span>
                                    )}
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0" align="end">
                                <Calendar
                                    initialFocus
                                    mode="range"
                                    defaultMonth={dateRange?.from}
                                    selected={dateRange}
                                    onSelect={setDateRange}
                                    numberOfMonths={2}
                                    className="p-3"
                                />
                            </PopoverContent>
                        </Popover>

                        {/* Reset Filters */}
                        {(categoryFilter || dateRange || searchTerm || priorityFilter !== 'all') && (
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => {
                                    setCategoryFilter("");
                                    setDateRange(undefined);
                                    setSearchTerm("");
                                    setPriorityFilter("all");
                                }}
                                title="Reset Filters"
                            >
                                <X className="w-4 h-4" />
                            </Button>
                        )}

                        <Button onClick={() => setIsCreateOpen(true)} className="shrink-0">
                            <Plus className="w-4 h-4 mr-2" /> Raise Ticket
                        </Button>
                    </div>


                </CardContent>
            </Card>

            {/* Data Card */}
            <Card>
                <CardContent className="p-0">
                    {isLoading ? (
                        <div className="p-10 text-center text-muted-foreground flex flex-col items-center gap-2">
                            {/* Loader icon if available, or just text */}
                            {/* We didn't import Loader2, but we can rely on text or add import.
                                 StudentManager used Loader2.
                                 TicketManager originally just had text "Loading tickets..."
                                 I'll keep text to avoid import error or add Loader2 later?
                                 Actually I can assume Loader2 is available if I import it?
                                 I won't risk it. Text is fine.
                              */}
                            Loading tickets...
                        </div>
                    ) : tickets.length === 0 ? (
                        <div className="text-center py-10 text-muted-foreground">No tickets found matching filters.</div>
                    ) : (
                        <>
                            <TicketList
                                tickets={tickets}
                                onSelectTicket={openTicket}
                                onDeleteTicket={handleDeleteTicket}
                            />

                            {/* Pagination */}
                            <div className="flex items-center justify-between px-4 py-4 border-t">
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

            {/* Modal & Dialogs directly in layout space, unrelated to rendering */}
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

            <TicketCreateDialog
                isOpen={isCreateOpen}
                onClose={() => setIsCreateOpen(false)}
                onSuccess={loadTickets}
            />

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
