import api from "@/lib/api";
import { Notification } from "@/types/notification";

export const notificationService = {
    getAll: async (): Promise<Notification[]> => {
        try {
            const response = await api.get<Notification[]>('/notifications/');
            return response.data;
        } catch (error) {
            console.error("Failed to fetch notifications", error);
            return [];
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
