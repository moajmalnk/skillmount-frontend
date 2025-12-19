import { useState } from "react";
import {
    Bell, Check, MailOpen, Ticket, Info, CheckCheck, ExternalLink, Loader2
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
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { formatDistanceToNow } from "date-fns";

export const NotificationBell = () => {
    const [isOpen, setIsOpen] = useState(false);
    const navigate = useNavigate();
    const queryClient = useQueryClient();

    // 1. Fetch Notifications with Query
    const { data: notifications = [], isLoading } = useQuery({
        queryKey: ['notifications'],
        queryFn: notificationService.getAll,
        refetchInterval: 30000, // Poll every 30s
    });

    const unreadCount = notifications.filter(n => !n.is_read).length;

    // 2. Mutations
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

    // 3. Handlers
    const handleMarkAsRead = (e: React.MouseEvent, id: number) => {
        e.stopPropagation(); // Prevent navigation
        markReadMutation.mutate(id);
    };

    const handleMarkAllMethod = () => {
        markAllReadMutation.mutate();
    };

    // Fix legacy/incorrect links from backend notifications
    const fixLink = (link?: string) => {
        if (!link) return "/";

        // Fix Ticket Links (Old: /admin/tickets?id=123 -> New: /admin?tab=tickets&id=123)
        if (link.includes("/admin/tickets")) {
            return link.replace("/admin/tickets", "/admin?tab=tickets");
        }

        // Fix Inquiry Links (Old: /admin/support -> New: /admin?tab=inquiries)
        if (link.includes("/admin/support")) {
            return "/admin?tab=inquiries";
        }

        return link;
    };

    const handleItemClick = (notification: Notification, e: React.MouseEvent) => {
        // If it's a link click (Ctrl/Cmd+Click), let browser handle it
        if (e.ctrlKey || e.metaKey || e.button === 1) return;

        e.preventDefault(); // Prevent Link's default behavior so we can handle navigation + close

        // Otherwise close and mark read if needed
        setIsOpen(false);
        if (!notification.is_read) {
            markReadMutation.mutate(notification.id);
        }

        if (notification.link) {
            navigate(fixLink(notification.link));
        }
    };

    // 4. Icons & Styling Helper
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
        <Popover open={isOpen} onOpenChange={setIsOpen}>
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
                        <h4 className="font-semibold text-sm">Notifications</h4>
                        {unreadCount > 0 && (
                            <Badge variant="secondary" className="text-[10px] px-1.5 h-5">{unreadCount} new</Badge>
                        )}
                    </div>
                    {unreadCount > 0 && (
                        <Button
                            variant="ghost"
                            size="sm"
                            disabled={markAllReadMutation.isPending}
                            className="text-xs h-7 px-2 text-muted-foreground hover:text-primary gap-1"
                            onClick={handleMarkAllMethod}
                        >
                            {markAllReadMutation.isPending ? <Loader2 className="w-3 h-3 animate-spin" /> : <CheckCheck className="w-3.5 h-3.5" />}
                            Mark all read
                        </Button>
                    )}
                </div>

                {/* Content */}
                <ScrollArea className="h-[400px]">
                    {isLoading ? (
                        <div className="flex flex-col items-center justify-center h-40 text-muted-foreground gap-2">
                            <Loader2 className="h-6 w-6 animate-spin" />
                            <span className="text-xs">Loading updates...</span>
                        </div>
                    ) : notifications.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-48 text-muted-foreground gap-3">
                            <div className="bg-muted p-4 rounded-full">
                                <MailOpen className="h-6 w-6 opacity-40" />
                            </div>
                            <span className="text-sm">No notifications yet</span>
                        </div>
                    ) : (
                        <div className="divide-y divide-border/40">
                            {notifications.map((notification) => {
                                const { icon: Icon, color, bg } = getTypeStyles(notification.notification_type);

                                return (
                                    <div
                                        key={notification.id}
                                        className={cn(
                                            "group relative flex gap-3 p-4 transition-all hover:bg-muted/40",
                                            !notification.is_read ? "bg-primary/5 hover:bg-primary/10" : "bg-transparent"
                                        )}
                                    >
                                        {/* Unread Indicator Bar */}
                                        {!notification.is_read && (
                                            <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary" />
                                        )}

                                        {/* Icon */}
                                        <div className={cn("mt-1 w-9 h-9 shrink-0 rounded-full flex items-center justify-center", bg)}>
                                            <Icon className={cn("h-4 w-4", color)} />
                                        </div>

                                        {/* Content */}
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

                                            {/* Actions */}
                                            <div className="flex items-center gap-3 pt-2">
                                                {/* Action Link */}
                                                {notification.link && (
                                                    <Link
                                                        to={fixLink(notification.link)}
                                                        onClick={(e) => handleItemClick(notification, e)}
                                                        className="text-xs font-medium text-primary hover:underline flex items-center gap-1"
                                                    >
                                                        View Details <ExternalLink className="w-3 h-3" />
                                                    </Link>
                                                )}

                                                {/* Manual Mark Read */}
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
                        </div>
                    )}
                </ScrollArea>

                {/* Footer */}
                {notifications.length > 5 && (
                    <div className="p-2 border-t bg-muted/30 text-center">
                        <span className="text-[10px] text-muted-foreground">
                            Showing latest notifications
                        </span>
                    </div>
                )}
            </PopoverContent>
        </Popover>
    );
};
