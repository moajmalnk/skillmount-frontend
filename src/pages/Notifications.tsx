import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { formatDistanceToNow } from "date-fns";
import { useNavigate, useSearchParams } from "react-router-dom";
import { notificationService } from "@/services/notificationService";
import { Notification } from "@/types/notification";
import { cn } from "@/lib/utils";
import {
    Bell, Check, MailOpen, Ticket, Info, CheckCheck, ExternalLink, Loader2, Trash2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import {
    Pagination,
    PaginationContent,
    PaginationEllipsis,
    PaginationItem,
    PaginationLink,
    PaginationNext,
    PaginationPrevious,
} from "@/components/ui/pagination";

export default function Notifications() {
    const navigate = useNavigate();
    const [searchParams, setSearchParams] = useSearchParams();
    const queryClient = useQueryClient();

    // Pagination State
    const pageParam = parseInt(searchParams.get("page") || "1");
    const [page, setPage] = useState(pageParam);
    const [activeTab, setActiveTab] = useState("all");
    const pageSize = 15;

    // Sync URL with state
    useEffect(() => {
        setSearchParams({ page: page.toString() });
    }, [page, setSearchParams]);

    useEffect(() => {
        // If user navigates browser back/forward
        const urlPage = parseInt(searchParams.get("page") || "1");
        if (urlPage !== page) setPage(urlPage);
    }, [searchParams]);


    // Fetch Notifications (Standard Pagination)
    const {
        data,
        isLoading,
        isError,
        isPlaceholderData
    } = useQuery({
        queryKey: ['notifications', page, activeTab],
        queryFn: () => notificationService.getAll({
            page: page,
            page_size: pageSize,
        }),
        placeholderData: (previousData) => previousData, // Keep data while fetching new page
    });

    const notifications = data?.results || [];
    const totalCount = data?.count || 0;
    const totalPages = Math.ceil(totalCount / pageSize);

    // Mutations
    const markReadMutation = useMutation({
        mutationFn: notificationService.markAsRead,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['notifications'] });
        },
        onError: () => toast.error("Failed to mark as read")
    });

    const markAllReadMutation = useMutation({
        mutationFn: notificationService.markAllAsRead,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['notifications'] });
            toast.success("All notifications marked as read");
        },
        onError: () => toast.error("Failed to mark all as read")
    });

    // Helper functions
    const filteredNotifications = activeTab === 'unread'
        ? notifications.filter(n => !n.is_read)
        : notifications;

    // Note: This count is only for the CURRENT PAGE if backend doesn't support unread filter param.
    // Ideally backend should provide global unread count.
    // For now, valid for current view.
    const unreadCountInView = filteredNotifications.filter(n => !n.is_read).length;

    const handleMarkAsRead = (e: React.MouseEvent, id: number) => {
        e.stopPropagation();
        markReadMutation.mutate(id);
    };

    const handleMarkAllRead = () => {
        markAllReadMutation.mutate();
    };

    const fixLink = (notification: Notification) => {
        let link = notification.link || "";

        // Attempt to extract path from full URL to handle cross-environment links (e.g. prod link on localhost)
        try {
            if (link.startsWith("http")) {
                const url = new URL(link);
                link = url.pathname + url.search + url.hash;
            }
        } catch (e) {
            // If invalid URL, proceed with original string
        }

        const title = (notification.title || "").toLowerCase();
        const linkLower = link.toLowerCase();

        // Inquiries
        if (title.includes("inquiry") || linkLower.includes("inquiry") || linkLower.includes("tab=inquiries")) {
            return "/admin?tab=inquiries";
        }

        // Tickets
        // Detect either standard admin route or query param style
        if (linkLower.includes("/admin/tickets") || linkLower.includes("tab=tickets") || title.includes("ticket")) {
            // Extract ID if present
            const idMatch = link.match(/[?&]id=([^&]+)/);
            if (idMatch) {
                return `/admin?tab=tickets&id=${idMatch[1]}`;
            }
            return "/admin?tab=tickets";
        }

        return link;
    };

    const handleItemClick = (notification: Notification) => {
        if (!notification.is_read) {
            markReadMutation.mutate(notification.id);
        }
        const targetPath = fixLink(notification);

        if (targetPath) {
            if (targetPath.startsWith("http")) {
                window.location.href = targetPath;
            } else {
                navigate(targetPath);
            }
        }
    };

    const getTypeStyles = (type: Notification['notification_type']) => {
        switch (type) {
            case 'ticket_create':
            case 'ticket_reply':
                return { icon: Ticket, color: "text-blue-500", bg: "bg-blue-500/10", border: "border-blue-200 dark:border-blue-900" };
            case 'system':
                return { icon: Info, color: "text-orange-500", bg: "bg-orange-500/10", border: "border-orange-200 dark:border-orange-900" };
            default:
                return { icon: Bell, color: "text-gray-500", bg: "bg-gray-500/10", border: "border-border" };
        }
    };

    // Render Pagination Items
    const renderPaginationItems = () => {
        const items = [];
        const maxVisible = 5;

        // Previous
        items.push(
            <PaginationItem key="prev">
                <PaginationPrevious
                    href="#"
                    onClick={(e) => { e.preventDefault(); if (page > 1) setPage(page - 1); }}
                    aria-disabled={page <= 1}
                    className={page <= 1 ? "pointer-events-none opacity-50" : ""}
                />
            </PaginationItem>
        );

        // Pages
        if (totalPages <= maxVisible) {
            for (let i = 1; i <= totalPages; i++) {
                items.push(
                    <PaginationItem key={i}>
                        <PaginationLink
                            href="#"
                            isActive={page === i}
                            onClick={(e) => { e.preventDefault(); setPage(i); }}
                        >
                            {i}
                        </PaginationLink>
                    </PaginationItem>
                );
            }
        } else {
            // Complex logic for ellipsis
            let startPage = Math.max(1, page - 2);
            let endPage = Math.min(totalPages, page + 2);

            if (startPage > 1) {
                items.push(
                    <PaginationItem key="1">
                        <PaginationLink href="#" onClick={(e) => { e.preventDefault(); setPage(1); }}>1</PaginationLink>
                    </PaginationItem>
                );
                if (startPage > 2) {
                    items.push(<PaginationItem key="ellipsis-start"><PaginationEllipsis /></PaginationItem>);
                }
            }

            for (let i = startPage; i <= endPage; i++) {
                items.push(
                    <PaginationItem key={i}>
                        <PaginationLink
                            href="#"
                            isActive={page === i}
                            onClick={(e) => { e.preventDefault(); setPage(i); }}
                        >
                            {i}
                        </PaginationLink>
                    </PaginationItem>
                );
            }

            if (endPage < totalPages) {
                if (endPage < totalPages - 1) {
                    items.push(<PaginationItem key="ellipsis-end"><PaginationEllipsis /></PaginationItem>);
                }
                items.push(
                    <PaginationItem key={totalPages}>
                        <PaginationLink href="#" onClick={(e) => { e.preventDefault(); setPage(totalPages); }}>{totalPages}</PaginationLink>
                    </PaginationItem>
                );
            }
        }

        // Next
        items.push(
            <PaginationItem key="next">
                <PaginationNext
                    href="#"
                    onClick={(e) => { e.preventDefault(); if (page < totalPages) setPage(page + 1); }}
                    aria-disabled={page >= totalPages}
                    className={page >= totalPages ? "pointer-events-none opacity-50" : ""}
                />
            </PaginationItem>
        );

        return items;
    };

    return (
        <div className="container max-w-4xl mx-auto py-8 px-4 min-h-[80vh]">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Notifications</h1>
                    <p className="text-muted-foreground mt-1">Stay updated with your latest alerts and messages.</p>
                </div>
                <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" onClick={handleMarkAllRead} disabled={markAllReadMutation.isPending}>
                        <CheckCheck className="w-4 h-4 mr-2" />
                        Mark all as read
                    </Button>
                </div>
            </div>

            <Card className="border-border shadow-sm min-h-[500px] flex flex-col">
                <CardHeader className="p-0">
                    <div className="px-6 py-4 border-b border-border flex items-center justify-between bg-muted/20">
                        <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab} className="w-full">
                            <TabsList className="bg-background border border-border">
                                <TabsTrigger value="all" className="data-[state=active]:bg-secondary">
                                    All Notifications
                                </TabsTrigger>
                                <TabsTrigger value="unread" className="data-[state=active]:bg-secondary">
                                    Unread
                                </TabsTrigger>
                            </TabsList>
                        </Tabs>
                        <div className="text-xs text-muted-foreground hidden sm:block">
                            Page {page} of {totalPages || 1}
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="p-0 flex-1 flex flex-col">
                    {isLoading ? (
                        <div className="flex flex-col items-center justify-center py-20 text-muted-foreground gap-3 flex-1">
                            <Loader2 className="h-8 w-8 animate-spin text-primary" />
                            <p>Loading notifications...</p>
                        </div>
                    ) : filteredNotifications.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-20 text-muted-foreground gap-4 flex-1">
                            <div className="bg-muted p-6 rounded-full">
                                <MailOpen className="h-10 w-10 opacity-30" />
                            </div>
                            <div className="text-center">
                                <h3 className="text-lg font-medium text-foreground">No notifications found</h3>
                                <p className="text-sm mt-1">
                                    {activeTab === 'unread' ? "You're all caught up!" : "We'll notify you when something important happens."}
                                </p>
                            </div>
                            {activeTab === 'unread' && (
                                <Button variant="link" onClick={() => setActiveTab('all')}>
                                    View all notifications
                                </Button>
                            )}
                        </div>
                    ) : (
                        <div className="flex-1 flex flex-col">
                            <div className="divide-y divide-border">
                                {filteredNotifications.map((notification) => {
                                    const { icon: Icon, color, bg, border } = getTypeStyles(notification.notification_type as any);
                                    return (
                                        <div
                                            key={notification.id}
                                            onClick={() => handleItemClick(notification)}
                                            className={cn(
                                                "group flex gap-4 p-5 hover:bg-muted/30 transition-all cursor-pointer relative",
                                                !notification.is_read ? "bg-primary/5 hover:bg-primary/10" : ""
                                            )}
                                        >
                                            {!notification.is_read && (
                                                <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary" />
                                            )}

                                            <div className={cn("mt-1 w-10 h-10 shrink-0 rounded-full flex items-center justify-center shadow-sm border", bg, border)}>
                                                <Icon className={cn("h-5 w-5", color)} />
                                            </div>

                                            <div className="flex-1 min-w-0 space-y-1">
                                                <div className="flex items-start justify-between gap-2">
                                                    <h4 className={cn("font-semibold text-base", !notification.is_read ? "text-foreground" : "text-foreground/80")}>
                                                        {notification.title}
                                                    </h4>
                                                    <span className="text-xs text-muted-foreground whitespace-nowrap">
                                                        {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })}
                                                    </span>
                                                </div>
                                                <p className="text-sm text-muted-foreground leading-relaxed line-clamp-2">
                                                    {notification.message}
                                                </p>

                                                <div className="flex items-center gap-4 pt-2">
                                                    {notification.link && (notification.notification_type === 'ticket_create' || notification.notification_type === 'ticket_reply') && (
                                                        <span className="text-xs font-medium text-primary flex items-center gap-1 group-hover:underline">
                                                            View Details <ExternalLink className="w-3 h-3" />
                                                        </span>
                                                    )}

                                                    {!notification.is_read && (
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            className="h-6 px-2 text-[10px] ml-auto text-muted-foreground hover:text-foreground"
                                                            onClick={(e) => handleMarkAsRead(e, notification.id)}
                                                        >
                                                            <Check className="w-3 h-3 mr-1" /> Mark as read
                                                        </Button>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>

                            {/* Pagination Controls */}
                            {totalPages > 1 && (
                                <div className="p-4 border-t border-border mt-auto">
                                    <Pagination>
                                        <PaginationContent>
                                            {renderPaginationItems()}
                                        </PaginationContent>
                                    </Pagination>
                                </div>
                            )}
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
