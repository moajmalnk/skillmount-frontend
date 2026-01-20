import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, DollarSign, Ticket, Activity, TrendingUp, TrendingDown, Minus, BookOpen, MessageSquare, Award, Star, IndianRupee, Share2 } from "lucide-react";

interface StatCardProps {
  label: string;
  value: string | number;
  change: number;
  trend: "up" | "down" | "neutral";
  // Added 'award' and 'star' to the allowed icons
  icon: "users" | "money" | "ticket" | "activity" | "book" | "message" | "award" | "star" | "rupee" | "affiliate";
}

export const StatCard = ({ label, value, change, trend, icon }: StatCardProps) => {
  const IconMap = {
    users: Users,
    money: DollarSign,
    ticket: Ticket,
    activity: Activity,
    book: BookOpen,
    message: MessageSquare,
    award: Award,
    star: Star,
    rupee: IndianRupee,
    affiliate: Share2
  };

  const IconComponent = IconMap[icon] || Activity;

  // Color logic
  // For tickets/messages, trend DOWN is usually good (green), UP is bad (red)
  // For Students/Placements/Materials, trend UP is good (green)
  const isPositiveGood = icon !== "ticket" && icon !== "message";

  let colorClass = "text-muted-foreground";
  if (trend === "up") colorClass = isPositiveGood ? "text-green-500" : "text-red-500";
  if (trend === "down") colorClass = isPositiveGood ? "text-red-500" : "text-green-500";
  if (trend === "neutral") colorClass = "text-muted-foreground";

  return (
    <Card className="border-border/50 shadow-sm hover:shadow-md transition-all">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {label}
        </CardTitle>
        <IconComponent className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        <p className={`text-xs flex items-center mt-1 ${colorClass}`}>
          {trend === "up" && <TrendingUp className="w-3 h-3 mr-1" />}
          {trend === "down" && <TrendingDown className="w-3 h-3 mr-1" />}
          {trend === "neutral" && <Minus className="w-3 h-3 mr-1" />}
          {change === 0 ? "No change" : `${Math.abs(change)}% from last month`}
        </p>
      </CardContent>
    </Card>
  );
};