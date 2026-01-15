import api from "@/lib/api";
import { Notification, PaginatedNotificationResponse } from "@/types/notification";

export const notificationService = {
    getAll: async (params?: { hours?: number; page?: number; page_size?: number }): Promise<PaginatedNotificationResponse> => {
        try {
            const response = await api.get<PaginatedNotificationResponse>('/notifications/', { params });
            return response.data;
        } catch (error) {
            console.error("Failed to fetch notifications", error);
            return { count: 0, next: null, previous: null, results: [] };
        }
    },

    markAsRead: async (id: number): Promise<void> => {
        try {
            await api.patch(`/notifications/${id}/mark_read/`);
        } catch (error) {
            console.error("Failed to mark notification as read", error);
        }
    },

    markAllAsRead: async (): Promise<void> => {
        try {
            await api.patch('/notifications/mark_all_read/');
        } catch (error) {
            console.error("Failed to mark all notifications as read", error);
        }
    }
};
