import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const DashboardStats = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
      <Card>
        <CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-muted-foreground">Total Students</CardTitle></CardHeader>
        <CardContent><div className="text-3xl font-bold">1,240</div><p className="text-xs text-muted-foreground">+12% from last month</p></CardContent>
      </Card>
      <Card>
        <CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-muted-foreground">Active Tutors</CardTitle></CardHeader>
        <CardContent><div className="text-3xl font-bold">24</div></CardContent>
      </Card>
      {/* Add other stat cards here */}
    </div>
  );
};