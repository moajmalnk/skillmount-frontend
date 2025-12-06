import { userService } from "@/services/userService";
import { inquiryService } from "@/services/inquiryService";
import { materialService } from "@/services/materialService";
import { Student } from "@/types/user";
import { formatBatchForDisplay } from "@/lib/batches";

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
  value2?: number; 
}

export interface ActivityLog {
  id: string;
  user: string;
  action: string;
  time: string;
  type: "login" | "create" | "delete" | "update";
}

const delay = (ms: number) => new Promise((res) => setTimeout(res, ms));

export const statsService = {
  // 1. Top Cards: Real Aggregated Data
  getStats: async (): Promise<DashboardStat[]> => {
    await delay(600); // Simulate network latency

    const [users, inquiries, materials] = await Promise.all([
        userService.getAll(),
        inquiryService.getAll(),
        materialService.getAll()
    ]);

    const students = users.filter(u => u.role === 'student') as Student[];
    const pendingInquiries = inquiries.filter(i => i.status === 'New');

    // --- CALCULATIONS ---

    // 1. Total Students & Growth
    const totalStudents = students.length;
    const lastMonthStudents = Math.floor(totalStudents * 0.9); // Mocking 10% growth
    const studentGrowth = Math.round(((totalStudents - lastMonthStudents) / lastMonthStudents) * 100);

    // 2. Placements (Students with placement data)
    const placedStudents = students.filter(s => s.placement !== undefined).length;
    // Mocking a high growth rate for placements as it's a key KPI
    const placementGrowth = 15; 

    // 3. Materials Count
    const totalMaterials = materials.length;

    // 4. Inquiries
    const totalPending = pendingInquiries.length;

    return [
      { 
        label: "Total Students", 
        value: totalStudents.toLocaleString(), 
        change: studentGrowth, 
        trend: "up", 
        icon: "users" 
      },
      { 
        label: "Successful Placements", 
        value: placedStudents, 
        change: placementGrowth, 
        trend: "up", 
        icon: "award" // Replaced Revenue/Active Tutors with this
      },
      { 
        label: "Pending Inquiries", 
        value: totalPending, 
        change: 2, 
        trend: "up", // Slight increase in workload
        icon: "message" 
      }, 
      { 
        label: "Learning Materials", 
        value: totalMaterials, 
        change: 5, 
        trend: "up", 
        icon: "book" 
      },
    ];
  },

  // 2. Growth Chart: Students Joined per Month
  getGrowthData: async (): Promise<ChartData[]> => {
    await delay(800);
    const users = await userService.getAll();
    const students = users.filter(u => u.role === 'student');

    // Group students by Month of 'createdAt'
    const monthCounts: Record<string, number> = {};
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

    students.forEach(student => {
        const date = new Date(student.createdAt);
        const monthName = months[date.getMonth()];
        monthCounts[monthName] = (monthCounts[monthName] || 0) + 1;
    });

    const data = Object.keys(monthCounts).map(month => ({
        name: month,
        value: monthCounts[month]
    }));

    // Fill data if sparse (for visual demo)
    if (data.length < 3) {
        return [
            { name: "Aug", value: 12 },
            { name: "Sep", value: 18 },
            { name: "Oct", value: 25 },
            { name: "Nov", value: monthCounts['Nov'] || 30 },
            { name: "Dec", value: monthCounts['Dec'] || 45 }
        ];
    }

    return data;
  },

  // 3. Batch Distribution
  getBatchData: async (): Promise<ChartData[]> => {
    await delay(700);
    const users = await userService.getAll();
    const students = users.filter(u => u.role === 'student') as Student[];

    const batchCounts: Record<string, number> = {};

    students.forEach(student => {
        const display = formatBatchForDisplay(student.batch, false); // "September 2025"
        const shortName = display.split(' ')[0]; // "September"
        batchCounts[shortName] = (batchCounts[shortName] || 0) + 1;
    });

    return Object.keys(batchCounts).map(batchName => ({
        name: batchName,
        value: batchCounts[batchName]
    }));
  },

  // 4. Recent Activity
  getRecentActivity: async (): Promise<ActivityLog[]> => {
    await delay(500);
    
    const [users, inquiries] = await Promise.all([
        userService.getAll(),
        inquiryService.getAll()
    ]);

    const recentStudents = users
        .filter(u => u.role === 'student')
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        .slice(0, 3)
        .map(s => ({
            id: s.id,
            user: s.name,
            action: "Joined the platform",
            time: new Date(s.createdAt).toLocaleDateString(),
            type: "create" as const
        }));

    const recentInquiries = inquiries
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
        .slice(0, 3)
        .map(i => ({
            id: i.id,
            user: i.name,
            action: `Inquiry: ${i.subject || "General Question"}`,
            time: i.date,
            type: "update" as const
        }));

    const combined = [...recentStudents, ...recentInquiries]
        .sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime())
        .slice(0, 5);

    return combined;
  }
};