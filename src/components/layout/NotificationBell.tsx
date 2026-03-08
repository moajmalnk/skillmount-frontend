import { useState, useEffect, Fragment } from "react"; // Added Fragment
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
import { toast } from "sonner"; // Added toast for real-time alerts

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

    // --- PWA Badge & Dynamic Favicon Effect ---
    useEffect(() => {
        const updateBadges = async () => {
            // 1. PWA App Badge (OS Level for Installed App)
            if ('setAppBadge' in navigator) {
                try {
                    if (unreadCount > 0) {
                        await navigator.setAppBadge(unreadCount);
                    } else {
                        await navigator.clearAppBadge();
                    }
                } catch (e) {
                    // Silently fail if permission denied or not supported
                    console.debug("App badge update failed", e);
                }
            }

            // 2. Dynamic Favicon (Browser Tab Level)
            const favicon = document.querySelector("link[rel~='icon']") as HTMLLinkElement;
            if (favicon) {
                // Keep original href to revert
                const originalHref = favicon.dataset.originalHref || favicon.href;
                if (!favicon.dataset.originalHref) favicon.dataset.originalHref = originalHref;

                if (unreadCount > 0) {
                    const img = new Image();
                    img.crossOrigin = "anonymous"; // Handle potential CORS if icon is CDN hosted
                    img.src = originalHref;
                    img.onload = () => {
                        const canvas = document.createElement('canvas');
                        canvas.width = 32;
                        canvas.height = 32;
                        const ctx = canvas.getContext('2d');
                        if (ctx) {
                            // Draw original icon
                            ctx.drawImage(img, 0, 0, 32, 32);

                            // Draw Badge Circle
                            ctx.beginPath();
                            ctx.arc(22, 10, 8, 0, 2 * Math.PI);
                            ctx.fillStyle = '#ef4444'; // Red-500
                            ctx.fill();

                            // Draw Text
                            ctx.fillStyle = 'white';
                            ctx.font = 'bold 10px sans-serif';
                            ctx.textAlign = 'center';
                            ctx.textBaseline = 'middle';
                            const countText = unreadCount > 9 ? '9+' : unreadCount.toString();
                            ctx.fillText(countText, 22, 10.5);

                            favicon.href = canvas.toDataURL('image/png');
                        }
                    };
                } else {
                    favicon.href = originalHref;
                }
            }
        };

        updateBadges();
    }, [unreadCount]);

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

    // --- REAL-TIME WEBSOCKET NOTIFICATIONS ---
    useEffect(() => {
        const token = localStorage.getItem('access_token');
        if (!token) return;

        let ws: WebSocket | null = null;
        let reconnectTimer: ReturnType<typeof setTimeout>;
        let reconnectAttempts = 0;
        const MAX_RECONNECT_ATTEMPTS = 5;
        const BASE_DELAY = 3000; // 3 seconds
        let isMounted = true;

        const connect = () => {
            if (!isMounted) return;

            const isLocal = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
            const wsProtocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
            const wsHost = isLocal ? 'localhost:8000' : 'skillapi.moajmalnk.in';
            const wsUrl = `${wsProtocol}//${wsHost}/ws/notifications/?token=${token}`;

            try {
                ws = new WebSocket(wsUrl);
            } catch {
                // WebSocket constructor failed — server likely doesn't support WS
                return;
            }

            ws.onopen = () => {
                reconnectAttempts = 0; // Reset on successful connection
                console.debug("Notification WS Connected");
            };

            ws.onmessage = (event) => {
                try {
                    const data = JSON.parse(event.data);

                    // 1. Invalidate queries to refresh the list and badge count
                    queryClient.invalidateQueries({ queryKey: ['notifications'] });

                    // 2. Show a toast for immediate feedback
                    toast(data.title || "New Notification", {
                        description: data.message,
                        action: data.link ? {
                            label: "View",
                            onClick: () => navigate(fixLink({ link: data.link, title: data.title } as Notification))
                        } : undefined,
                    });

                    // 3. Play subtle sound if possible
                    try {
                        const audio = new Audio('/notification-sound.mp3');
                        audio.volume = 0.5;
                        audio.play().catch(() => { }); // Browser might block autoplay
                    } catch { }

                } catch {
                    // Silently ignore parse errors
                }
            };

            ws.onerror = () => {
                // Silently handle — no console.error to avoid noisy output
            };

            ws.onclose = () => {
                // Attempt reconnect with exponential backoff
                if (isMounted && reconnectAttempts < MAX_RECONNECT_ATTEMPTS) {
                    const delay = Math.min(BASE_DELAY * Math.pow(2, reconnectAttempts), 30000);
                    reconnectAttempts++;
                    reconnectTimer = setTimeout(connect, delay);
                }
            };
        };

        connect();

        return () => {
            isMounted = false;
            clearTimeout(reconnectTimer);
            if (ws) ws.close();
        };
    }, [queryClient, navigate]);

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
        <Link to="/notifications">
            <Button variant="ghost" size="icon" className="relative group hover:bg-muted/50">
                <Bell className={cn("h-5 w-5 transition-all text-muted-foreground group-hover:text-foreground", unreadCount > 0 && "text-primary animate-pulse-subtle")} />
                {unreadCount > 0 && (
                    <Badge
                        className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-[10px] bg-red-500 hover:bg-red-600 shadow-sm animate-in zoom-in border border-background"
                    >
                        {unreadCount > 9 ? '9+' : unreadCount}
                    </Badge>
                )}
            </Button>
        </Link>
    );
};
