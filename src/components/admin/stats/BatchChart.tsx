import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
  ComposedChart,
  Line,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Area
} from "recharts";
import { ChartData } from "@/services/statsService";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowUpRight } from "lucide-react";

export const BatchChart = ({ data }: { data: ChartData[] }) => {
  const [activeRange, setActiveRange] = useState("1Yr");

  // Calculate total students for the header
  const totalStudents = data.reduce((acc, curr) => acc + curr.value, 0);

  return (
    <Card className="col-span-full shadow-md border-border/60 overflow-hidden">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-6 border-b border-border/40 bg-muted/20">
        <div className="space-y-1">
          <CardTitle className="text-xl font-bold flex items-center gap-2">
            Student Distribution
            <Badge variant="secondary" className="font-normal text-xs bg-emerald-500/10 text-emerald-600 border-emerald-500/20">
              <ArrowUpRight className="w-3 h-3 mr-1" /> +12% Growth
            </Badge>
          </CardTitle>
          <CardDescription className="text-base">
            Total of <span className="font-medium text-foreground">{totalStudents}</span> active students across all batches.
          </CardDescription>
        </div>

        {/* Time Range Selector (Visual) */}
        <div className="hidden sm:flex items-center p-1 bg-background/50 border rounded-lg">
          {["1M", "6M", "1Yr", "All"].map((range) => (
            <Button
              key={range}
              variant={activeRange === range ? "secondary" : "ghost"}
              size="sm"
              onClick={() => setActiveRange(range)}
              className={`h-7 text-xs font-medium px-3 ${activeRange === range ? "bg-background shadow-sm text-primary" : "text-muted-foreground"
                }`}
            >
              {range}
            </Button>
          ))}
        </div>
      </CardHeader>

      <CardContent className="p-6">
        <div className="h-[350px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={data} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="colorBar" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                </linearGradient>
                <linearGradient id="colorLine" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                </linearGradient>
              </defs>

              <CartesianGrid
                vertical={false}
                strokeDasharray="3 3"
                stroke="hsl(var(--border))"
                opacity={0.4}
              />

              <XAxis
                dataKey="name"
                stroke="hsl(var(--muted-foreground))"
                fontSize={12}
                tickLine={false}
                axisLine={false}
                dy={10}
              />
              <YAxis
                stroke="hsl(var(--muted-foreground))"
                fontSize={12}
                tickLine={false}
                axisLine={false}
                dx={-10}
                tickFormatter={(value) => `${value}`}
              />

              <Tooltip
                cursor={{ fill: 'hsl(var(--muted)/0.2)' }}
                content={({ active, payload, label }) => {
                  if (active && payload && payload.length) {
                    return (
                      <div className="rounded-lg border bg-card p-3 shadow-xl ring-1 ring-black/5">
                        <p className="mb-1 text-sm font-semibold text-foreground">{label}</p>
                        <div className="flex items-center gap-2">
                          <div className="h-2 w-2 rounded-full bg-primary" />
                          <span className="text-sm font-medium text-muted-foreground">
                            Students:
                          </span>
                          <span className="text-sm font-bold text-foreground">
                            {payload[0].value}
                          </span>
                        </div>
                      </div>
                    );
                  }
                  return null;
                }}
              />

              {/* Bars for 'Volume' Effect */}
              <Bar
                dataKey="value"
                fill="url(#colorBar)"
                barSize={40}
                radius={[4, 4, 0, 0]}
                fillOpacity={0.6}
              />

              {/* Smooth Line Overlay */}
              <Area
                type="monotone"
                dataKey="value"
                stroke="hsl(var(--primary))"
                strokeWidth={3}
                fill="url(#colorLine)"
                fillOpacity={0.1}
              />

              {/* Line Point */}
              <Line
                type="monotone"
                dataKey="value"
                stroke="none"
                dot={{ r: 4, fill: "hsl(var(--background))", stroke: "hsl(var(--primary))", strokeWidth: 2 }}
                activeDot={{ r: 6, strokeWidth: 0 }}
              />

            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};