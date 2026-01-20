import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ActivityLog } from "@/services/statsService";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";

export const RecentActivity = ({ logs }: { logs: ActivityLog[] }) => {
  return (
    <Card className="col-span-1 md:col-span-12 lg:col-span-4 border-border/50 shadow-sm h-[450px] flex flex-col">
      <CardHeader>
        <CardTitle>Recent Activity</CardTitle>
        <CardDescription>Latest actions across the platform.</CardDescription>
      </CardHeader>
      <CardContent className="p-0 flex-1 overflow-hidden">
        <ScrollArea className="h-full px-6 pb-6">
          <div className="space-y-6">
            {logs.map((log) => (
              <div key={log.id} className="flex items-start gap-4">
                <Avatar className="h-9 w-9 mt-0.5 border border-border">
                  <AvatarFallback className="text-xs bg-primary/10 text-primary font-medium">
                    {log.user.substring(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="space-y-1 flex-1">
                  <div className="flex justify-between items-start">
                    <p className="text-sm font-medium leading-none">{log.user}</p>
                    <span className="text-[10px] text-muted-foreground whitespace-nowrap">{log.time}</span>
                  </div>
                  <p className="text-xs text-muted-foreground line-clamp-2">
                    {log.action}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
};