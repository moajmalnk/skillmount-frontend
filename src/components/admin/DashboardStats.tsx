import { useEffect, useState } from "react";
import { statsService, DashboardStat, ChartData, ActivityLog } from "@/services/statsService";
import { StatCard } from "./stats/StatCard";
import { GrowthChart } from "./stats/GrowthChart";
import { BatchChart } from "./stats/BatchChart";
import { RecentActivity } from "./stats/RecentActivity";
import { Loader2 } from "lucide-react";

export const DashboardStats = () => {
  const [stats, setStats] = useState<DashboardStat[]>([]);
  const [growthData, setGrowthData] = useState<ChartData[]>([]);
  const [batchData, setBatchData] = useState<ChartData[]>([]);
  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [s, g, b, a] = await Promise.all([
          statsService.getStats(),
          statsService.getGrowthData(),
          statsService.getBatchData(),
          statsService.getRecentActivity()
        ]);
        
        setStats(s);
        setGrowthData(g);
        setBatchData(b);
        setActivityLogs(a);
      } catch (error) {
        console.error("Failed to load stats", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

  if (isLoading) {
    return <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* 1. Top KPI Cards */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat, index) => (
          <StatCard key={index} {...stat} />
        ))}
      </div>

      {/* 2. Charts Row 1: Growth (Wide) & Activity */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <GrowthChart data={growthData} />
        <RecentActivity logs={activityLogs} />
      </div>

      {/* 3. Charts Row 2: Batches & Other insights (Placeholder for future) */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
         <BatchChart data={batchData} />
         {/* You can add another chart here later, e.g., Top Affiliates */}
      </div>
    </div>
  );
};