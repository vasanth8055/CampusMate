import type { ReactNode } from "react";
import { ArrowUp, ArrowDown } from "lucide-react";
import { cn } from "@/lib/cn";
import { Card, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";

export type StatisticsCardProps = {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: ReactNode;
  trend?: number; // positive or negative percentage
  className?: string;
  loading?: boolean;
};

export function StatisticsCard({ title, value, subtitle, icon, trend, className, loading = false }: StatisticsCardProps) {
  const trendPositive = trend !== undefined && trend > 0;
  const trendLabel = trend !== undefined ? `${trend > 0 ? "+" : ""}${trend}%` : undefined;

  return (
    <Card loading={loading} className={cn("w-full", className)}>
      <CardContent>
        <div className="flex items-center gap-3">
          {icon ? <div className="shrink-0">{icon}</div> : null}

          <div className="min-w-0 flex-1">
            <div className="text-small text-foreground-secondary">{title}</div>
            <div className="text-h3 font-semibold text-foreground">{value}</div>
            {subtitle ? <div className="text-small text-foreground-secondary">{subtitle}</div> : null}
          </div>

          {trend !== undefined ? (
            <Badge variant={trendPositive ? "availableSeats" : "rejected"} size="md">
              <span className="inline-flex items-center gap-1">
                {trendPositive ? <ArrowUp className="h-4 w-4" /> : <ArrowDown className="h-4 w-4" />}
                {trendLabel}
              </span>
            </Badge>
          ) : null}
        </div>
      </CardContent>
    </Card>
  );
}

export default StatisticsCard;
