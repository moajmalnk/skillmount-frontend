import api from "@/lib/api";

// Types
export interface DashboardStat {
  label: string;
  value: string | number;
  change: number; 
  trend: "up" | "down" | "neutral";
  icon: "users" | "money" | "ticket" | "activity" | "book" | "message" | "award";
}

export interface ChartData {
  name: string;
  value: number;
}

export interface ActivityLog {
  id: string;
  user: string; // Mapped from actor_name
  action: string; // Mapped from description
  time: string;
  type: "login" | "create" | "delete" | "update" | "info";
}

// Internal cache to avoid 4 parallel requests
let dashboardPromise: Promise<any> | null = null;

const fetchDashboardData = () => {
  if (!dashboardPromise) {
    dashboardPromise = api.get('/admin/stats/')
      .then(res => res.data)
      .catch(err => {
        console.error("Dashboard fetch error", err);
        return null;
      })
      // Clear cache after 5 seconds so a refresh (or navigating away and back) fetches new data
      .finally(() => setTimeout(() => { dashboardPromise = null; }, 5000));
  }
  return dashboardPromise;
};

export const statsService = {
  // 1. Top Cards
  getStats: async (): Promise<DashboardStat[]> => {
    const data = await fetchDashboardData();
    return data?.stats || [];
  },

  // 2. Growth Chart
  getGrowthData: async (): Promise<ChartData[]> => {
    const data = await fetchDashboardData();
    return data?.growth || [];
  },

  // 3. Batch Distribution
  getBatchData: async (): Promise<ChartData[]> => {
    const data = await fetchDashboardData();
    return data?.batches || [];
  },

  // 4. Recent Activity
  getRecentActivity: async (): Promise<ActivityLog[]> => {
    const data = await fetchDashboardData();
    if (!data?.activity) return [];

    // Map Backend 'ActivityLog' format to Frontend UI format
    return data.activity.map((log: any) => ({
        id: log.id,
        user: log.actor_name || "System",
        action: log.description,
        // Format simple time string
        time: new Date(log.timestamp).toLocaleDateString(),
        type: log.action_type
    }));
  }
};