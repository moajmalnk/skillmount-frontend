import { useState } from "react";
import { useQuery, useMutation, useQueryClient, useInfiniteQuery } from "@tanstack/react-query";
import { formatDistanceToNow } from "date-fns";
import { useNavigate } from "react-router-dom";
import { notificationService } from "@/services/notificationService";
import { Notification } from "@/types/notification";
import { cn } from "@/lib/utils";
import {
    Bell, Check, MailOpen, Ticket, Info, CheckCheck, ExternalLink, Loader2, Filter, Trash2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useInView } from "react-intersection-observer";
import { useEffect } from "react";
import { toast } from "sonner";

export default function Notifications() {
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const { ref, inView } = useInView();
    const [activeTab, setActiveTab] = useState("all");

    // Fetch Notifications (Infinite Scroll)
    const {
        data,
        fetchNextPage,
        hasNextPage,
        isFetchingNextPage,
        status,
        refetch
    } = useInfiniteQuery({
        queryKey: ['notifications', 'page', activeTab],
        queryFn: ({ pageParam = 1 }) => notificationService.getAll({
            page: pageParam,
            page_size: 20,
            // If API supports filtering by 'read/unread', add it here. 
            // Assuming the current API might just return all, filtering client-side or if API update is needed.
            // checking service... usually getAll accepts params.
        }),
        initialPageParam: 1,
        getNextPageParam: (lastPage) => {
            if (lastPage.next) {
                const param = new URL(lastPage.next).searchParams.get('page');
                return param ? parseInt(param) : undefined;
            }
            return undefined;
        },
    });

    useEffect(() => {
        if (inView && hasNextPage) {
            fetchNextPage();
        }
    }, [inView, hasNextPage, fetchNextPage]);

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
    const allNotifications = data?.pages.flatMap(page => page.results) || [];

    // Client-side filtering if backend doesn't support it yet
    const filteredNotifications = activeTab === 'unread'
        ? allNotifications.filter(n => !n.is_read)
        : allNotifications;

    const unreadCount = allNotifications.filter(n => !n.is_read).length;

    const handleMarkAsRead = (e: React.MouseEvent, id: number) => {
        e.stopPropagation();
        markReadMutation.mutate(id);
    };

    const handleMarkAllRead = () => {
        markAllReadMutation.mutate();
    };

    const fixLink = (notification: Notification) => {
        const link = notification.link;
        const title = (notification.title || "").toLowerCase();
        if (title.includes("inquiry") || (link && (link.includes("/admin/support") || link.includes("inquiry")))) {
            return "/admin?tab=inquiries";
        }
        if (link && link.includes("/admin/tickets")) {
            return "/admin?tab=tickets";
        }
        return link || "";
    };

    const handleItemClick = (notification: Notification) => {
        if (!notification.is_read) {
            markReadMutation.mutate(notification.id);
        }
        const targetPath = fixLink(notification);
        if (targetPath) navigate(targetPath);
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

    return (
        <div className="container max-w-4xl mx-auto py-8 px-4 min-h-[80vh]">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Notifications</h1>
                    <p className="text-muted-foreground mt-1">Stay updated with your latest alerts and messages.</p>
                </div>
                <div className="flex items-center gap-2">
                    {unreadCount > 0 && (
                        <Button variant="outline" size="sm" onClick={handleMarkAllRead} disabled={markAllReadMutation.isPending}>
                            <CheckCheck className="w-4 h-4 mr-2" />
                            Mark all as read
                        </Button>
                    )}
                </div>
            </div>

            <Card className="border-border shadow-sm">
                <CardHeader className="p-0">
                    <div className="px-6 py-4 border-b border-border flex items-center justify-between bg-muted/20">
                        <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab} className="w-full">
                            <TabsList className="bg-background border border-border">
                                <TabsTrigger value="all" className="data-[state=active]:bg-secondary">
                                    All Notifications
                                </TabsTrigger>
                                <TabsTrigger value="unread" className="data-[state=active]:bg-secondary">
                                    Unread
                                    {unreadCount > 0 && <Badge variant="destructive" className="ml-2 h-5 min-w-5 px-1">{unreadCount}</Badge>}
                                </TabsTrigger>
                            </TabsList>
                        </Tabs>
                    </div>
                </CardHeader>
                <CardContent className="p-0">
                    {status === 'pending' ? (
                        <div className="flex flex-col items-center justify-center py-20 text-muted-foreground gap-3">
                            <Loader2 className="h-8 w-8 animate-spin text-primary" />
                            <p>Loading notifications...</p>
                        </div>
                    ) : filteredNotifications.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-20 text-muted-foreground gap-4">
                            <div className="bg-muted p-6 rounded-full">
                                <MailOpen className="h-10 w-10 opacity-30" />
                            </div>
                            <div className="text-center">
                                <h3 className="text-lg font-medium text-foreground">No notifications found</h3>
                                <p className="text-sm mt-1">
                                    {activeTab === 'unread' ? "You're all caught up! Check 'All' for history." : "We'll notify you when something important happens."}
                                </p>
                            </div>
                            {activeTab === 'unread' && (
                                <Button variant="link" onClick={() => setActiveTab('all')}>
                                    View all notifications
                                </Button>
                            )}
                        </div>
                    ) : (
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
                                            <p className="text-sm text-muted-foreground leading-relaxed">
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

                            {/* Infinite Scroll Loader */}
                            <div ref={ref} className="py-4 flex justify-center w-full">
                                {isFetchingNextPage && <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />}
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
