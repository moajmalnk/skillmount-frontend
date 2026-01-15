export interface Notification {
    id: number;
    title: string;
    message: string;
    link?: string;
    is_read: boolean;
    notification_type: 'ticket_reply' | 'ticket_create' | 'system';
    created_at: string;
}

export type NotificationType = Notification['notification_type'];

export interface PaginatedNotificationResponse {
    count: number;
    next: string | null;
    previous: string | null;
    results: Notification[];
}
