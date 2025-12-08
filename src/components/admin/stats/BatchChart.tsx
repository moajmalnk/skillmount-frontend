import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Bar, BarChart, ResponsiveContainer, XAxis, Tooltip } from "recharts";
import { ChartData } from "@/services/statsService";

export const BatchChart = ({ data }: { data: ChartData[] }) => {
  return (
    <Card className="col-span-1 md:col-span-6 lg:col-span-4 border-border/50 shadow-sm">
      <CardHeader>
        <CardTitle>Student Distribution</CardTitle>
        <CardDescription>Active students per batch.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-[250px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data}>
              <XAxis 
                dataKey="name" 
                stroke="#888888" 
                fontSize={12} 
                tickLine={false} 
                axisLine={false} 
              />
              <Tooltip 
                cursor={{fill: 'hsl(var(--muted)/0.3)'}}
                contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))', borderRadius: '8px' }}
              />
              <Bar 
                dataKey="value" 
                fill="hsl(var(--primary))" 
                radius={[4, 4, 0, 0]} 
                barSize={30}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};