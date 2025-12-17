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
      {/* 1. Top KPI Cards - 4 Columns on Desktop, 2 on Tablet, 1 on Mobile */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat, index) => (
          <StatCard key={index} {...stat} />
        ))}
      </div>

      {/* 2. Main Content Grid - 12 Column System */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        
        {/* Row 1: Growth Chart (8 cols) & Recent Activity (4 cols) */}
        <GrowthChart data={growthData} />
        <RecentActivity logs={activityLogs} />

        {/* Row 2: Batch Chart (4 cols) & Future Widgets */}
        <BatchChart data={batchData} />
        
        {/* Placeholder for future widgets to fill the remaining 8 columns if needed */}
        {/* <div className="md:col-span-8 bg-card/50 border border-border/50 rounded-xl min-h-[300px] flex items-center justify-center text-muted-foreground">
            Future Widget Area
        </div> */}
      </div>
    </div>
  );
};