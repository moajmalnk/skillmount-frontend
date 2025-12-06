import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ActivityLog } from "@/services/statsService";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

export const RecentActivity = ({ logs }: { logs: ActivityLog[] }) => {
  return (
    <Card className="col-span-4 lg:col-span-2 border-border/50">
      <CardHeader>
        <CardTitle>Recent Activity</CardTitle>
        <CardDescription>Latest actions across the platform.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-8">
          {logs.map((log) => (
            <div key={log.id} className="flex items-center">
              <Avatar className="h-9 w-9">
                <AvatarFallback className="text-xs bg-primary/10 text-primary">
                    {log.user.substring(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="ml-4 space-y-1">
                <p className="text-sm font-medium leading-none">{log.user}</p>
                <p className="text-sm text-muted-foreground">
                  {log.action}
                </p>
              </div>
              <div className="ml-auto font-medium text-xs text-muted-foreground">
                  {log.time}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};