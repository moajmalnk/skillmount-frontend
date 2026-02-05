import { useState, Fragment } from "react"; // Added Fragment
import {
    Bell, Check, MailOpen, Ticket, Info, CheckCheck, ExternalLink, Loader2, History, ChevronLeft
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { notificationService } from "@/services/notificationService";
import { Notification } from "@/types/notification";
import { useNavigate, Link } from "react-router-dom";
import { cn } from "@/lib/utils";
import { useQuery, useMutation, useQueryClient, useInfiniteQuery } from "@tanstack/react-query";
import { formatDistanceToNow } from "date-fns";

export const NotificationBell = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [viewMode, setViewMode] = useState<'recent' | 'all'>('recent');
    const navigate = useNavigate();
    const queryClient = useQueryClient();

    // 1. Fetch Recent Notifications (Last 48h)
    const { data: recentData, isLoading: isRecentLoading } = useQuery({
        queryKey: ['notifications', 'recent'],
        queryFn: () => notificationService.getAll({ hours: 48, page_size: 10 }),
        refetchInterval: 30000,
    });

    // 2. Fetch All Notifications (Infinite Scroll)
    const {
        data: allData,
        fetchNextPage,
        hasNextPage,
        isFetchingNextPage,
        isLoading: isAllLoading
    } = useInfiniteQuery({
        queryKey: ['notifications', 'all'],
        queryFn: ({ pageParam = 1 }) => notificationService.getAll({ page: pageParam }),
        initialPageParam: 1,
        getNextPageParam: (lastPage) => {
            if (lastPage.next) {
                const param = new URL(lastPage.next).searchParams.get('page');
                return param ? parseInt(param) : undefined;
            }
            return undefined;
        },
        enabled: viewMode === 'all', // Only fetch when in 'all' mode
    });

    const notifications = viewMode === 'recent'
        ? (recentData?.results || [])
        : (allData?.pages.flatMap(page => page.results) || []);

    const isLoading = viewMode === 'recent' ? isRecentLoading : isAllLoading;

    // Calculate unread from RECENT (or separate endpoint for count?)
    // Actually, unread count should probably be global. For now, using recent's unread is "okay" but imperfect if an old one is unread.
    // Ideally, we'd have a separate `/notifications/unread-count/` endpoint.
    // For now, let's use recentData's count + maybe a visual indicator if there are more.
    // But since `recentData` is paginated, we rely on what we have.
    // A quick hack: Recent is likely what matters most for the badge.
    const unreadCount = (recentData?.results || []).filter(n => !n.is_read).length;

    // 3. Mutations
    const markReadMutation = useMutation({
        mutationFn: notificationService.markAsRead,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['notifications'] });
        }
    });

    const markAllReadMutation = useMutation({
        mutationFn: notificationService.markAllAsRead,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['notifications'] });
        }
    });

    // 4. Handlers
    const handleMarkAsRead = (e: React.MouseEvent, id: number) => {
        e.stopPropagation();
        markReadMutation.mutate(id);
    };

    const handleMarkAllMethod = () => {
        markAllReadMutation.mutate();
    };

    const fixLink = (notification: Notification) => {
        const link = notification.link;
        const title = (notification.title || "").toLowerCase();

        // 1. Inquiries (Admin Only Feature)
        // Detect "New Inquiry" even if link is missing or broken
        if (title.includes("inquiry") || (link && (link.includes("/admin/support") || link.includes("inquiry")))) {
            return "/admin?tab=inquiries";
        }

        // 2. Admin Tickets
        // Redirect to Ticket Manager if link points to admin tickets
        if (link && link.includes("/admin/tickets")) {
            return "/admin?tab=tickets";
        }

        // 3. Fallback: Use provided link or stay on page (prevent crash)
        return link || "/";
    };

    const handleItemClick = (notification: Notification, e: React.MouseEvent) => {
        if (e.ctrlKey || e.metaKey || e.button === 1) return;
        e.preventDefault();
        setIsOpen(false);

        if (!notification.is_read) {
            markReadMutation.mutate(notification.id);
        }

        const targetPath = fixLink(notification);
        navigate(targetPath);
    };

    // 5. Icons & Styling Helper
    const getTypeStyles = (type: Notification['notification_type']) => {
        switch (type) {
            case 'ticket_create':
            case 'ticket_reply':
                return { icon: Ticket, color: "text-blue-500", bg: "bg-blue-500/10" };
            case 'system':
                return { icon: Info, color: "text-orange-500", bg: "bg-orange-500/10" };
            default:
                return { icon: Bell, color: "text-gray-500", bg: "bg-gray-500/10" };
        }
    };

    return (
        <Popover open={isOpen} onOpenChange={(open) => {
            setIsOpen(open);
            if (!open) setViewMode('recent'); // Reset to recent when closed
        }}>
            <PopoverTrigger asChild>
                <Button variant="ghost" size="icon" className="relative">
                    <Bell className={cn("h-5 w-5 transition-all", unreadCount > 0 && "text-primary animate-pulse-subtle")} />
                    {unreadCount > 0 && (
                        <Badge
                            className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-[10px] bg-red-500 hover:bg-red-600 shadow-sm animate-in zoom-in"
                        >
                            {unreadCount}
                        </Badge>
                    )}
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-96 p-0 shadow-xl border-border/50" align="end">
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b bg-muted/30">
                    <div className="flex items-center gap-2">
                        {viewMode === 'all' && (
                            <Button variant="ghost" size="icon" className="h-6 w-6 -ml-2 mr-1" onClick={() => setViewMode('recent')}>
                                <ChevronLeft className="h-4 w-4" />
                            </Button>
                        )}
                        <h4 className="font-semibold text-sm">
                            {viewMode === 'recent' ? 'Recent Updates' : 'Notification History'}
                        </h4>
                        {unreadCount > 0 && viewMode === 'recent' && (
                            <Badge variant="secondary" className="text-[10px] px-1.5 h-5">{unreadCount} new</Badge>
                        )}
                    </div>
                    <div className="flex gap-1">
                        {unreadCount > 0 && (
                            <Button
                                variant="ghost"
                                size="sm"
                                disabled={markAllReadMutation.isPending}
                                className="text-xs h-7 px-2 text-muted-foreground hover:text-primary gap-1"
                                onClick={handleMarkAllMethod}
                                title="Mark all as read"
                            >
                                <CheckCheck className="w-3.5 h-3.5" />
                            </Button>
                        )}
                    </div>
                </div>

                {/* Content */}
                <ScrollArea className="h-[400px]">
                    {isLoading ? (
                        <div className="flex flex-col items-center justify-center h-40 text-muted-foreground gap-2">
                            <Loader2 className="h-6 w-6 animate-spin" />
                            <span className="text-xs">Loading...</span>
                        </div>
                    ) : notifications.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-48 text-muted-foreground gap-3">
                            <div className="bg-muted p-4 rounded-full">
                                <MailOpen className="h-6 w-6 opacity-40" />
                            </div>
                            <span className="text-sm">
                                {viewMode === 'recent' ? "No recent notifications" : "No notifications found"}
                            </span>
                            {viewMode === 'recent' && (
                                <Button variant="link" size="sm" onClick={() => setViewMode('all')}>
                                    View older history
                                </Button>
                            )}
                        </div>
                    ) : (
                        <div className="divide-y divide-border/40">
                            {notifications.map((notification) => {
                                const { icon: Icon, color, bg } = getTypeStyles(notification.notification_type as any);

                                return (
                                    <div
                                        key={notification.id}
                                        className={cn(
                                            "group relative flex gap-3 p-4 transition-all hover:bg-muted/40",
                                            !notification.is_read ? "bg-primary/5 hover:bg-primary/10" : "bg-transparent"
                                        )}
                                    >
                                        {!notification.is_read && (
                                            <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary" />
                                        )}

                                        <div className={cn("mt-1 w-9 h-9 shrink-0 rounded-full flex items-center justify-center", bg)}>
                                            <Icon className={cn("h-4 w-4", color)} />
                                        </div>

                                        <div className="flex-1 space-y-1 min-w-0">
                                            <div className="flex items-start justify-between gap-2">
                                                <p className={cn("text-sm font-medium leading-none truncate pr-4", !notification.is_read ? "text-foreground" : "text-muted-foreground")}>
                                                    {notification.title}
                                                </p>
                                                <span className="text-[10px] text-muted-foreground shrink-0 tabular-nums">
                                                    {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })}
                                                </span>
                                            </div>

                                            <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                                                {notification.message}
                                            </p>

                                            <div className="flex items-center gap-3 pt-2">
                                                {notification.link && (
                                                    <button
                                                        onClick={(e) => handleItemClick(notification, e)}
                                                        className="text-xs font-medium text-primary hover:underline flex items-center gap-1 bg-transparent border-0 p-0 cursor-pointer"
                                                    >
                                                        View Details <ExternalLink className="w-3 h-3" />
                                                    </button>
                                                )}

                                                {!notification.is_read && (
                                                    <button
                                                        onClick={(e) => handleMarkAsRead(e, notification.id)}
                                                        className="text-[10px] text-muted-foreground hover:text-foreground flex items-center gap-1 transition-colors ml-auto group/read"
                                                        title="Mark as read"
                                                    >
                                                        <Check className="w-3 h-3 group-hover/read:text-green-500" />
                                                        Mark read
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}

                            {/* "Load More" or "View History" Footer Actions */}
                            {viewMode === 'recent' ? (
                                <div className="p-3 text-center border-t bg-muted/10">
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className="w-full text-xs text-muted-foreground hover:text-primary"
                                        onClick={() => setViewMode('all')}
                                    >
                                        <History className="w-3.5 h-3.5 mr-2" />
                                        View Earlier Notifications
                                    </Button>
                                </div>
                            ) : (
                                <div className="p-3 text-center border-t bg-muted/10">
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        disabled={!hasNextPage || isFetchingNextPage}
                                        onClick={() => fetchNextPage()}
                                        className="w-full text-xs"
                                    >
                                        {isFetchingNextPage ? (
                                            <>
                                                <Loader2 className="w-3.5 h-3.5 mr-2 animate-spin" />
                                                Loading...
                                            </>
                                        ) : hasNextPage ? (
                                            "Load More"
                                        ) : (
                                            "No more notifications"
                                        )}
                                    </Button>
                                </div>
                            )}
                        </div>
                    )}
                </ScrollArea>
            </PopoverContent>
        </Popover>
    );
};
