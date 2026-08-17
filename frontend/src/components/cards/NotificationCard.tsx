import type { ReactNode } from "react";
import { Clock } from "lucide-react";
import { cn } from "@/lib/cn";
import { Card, CardContent } from "@/components/ui/Card";
import { Avatar } from "@/components/common/Avatar";
import { Badge } from "@/components/ui/Badge";

export type NotificationPriority = "low" | "normal" | "high";

export type NotificationCardProps = {
  id?: string | number;
  avatarUrl?: string;
  title: string;
  description?: string;
  timestamp?: string;
  unread?: boolean;
  priority?: NotificationPriority;
  onClick?: () => void;
  loading?: boolean;
  className?: string;
  children?: ReactNode;
};

const priorityToVariant: Record<NotificationPriority, string> = {
  low: "default",
  normal: "pending",
  high: "rejected",
};

export function NotificationCard({
  id,
  avatarUrl,
  title,
  description,
  timestamp,
  unread = false,
  priority = "normal",
  onClick,
  loading = false,
  className,
  children,
}: NotificationCardProps) {
  const variant = priorityToVariant[priority] ?? "default";

  return (
    <Card loading={loading} className={cn("w-full", className)} role={onClick ? "button" : undefined} tabIndex={onClick ? 0 : undefined} onClick={onClick} aria-labelledby={id ? `notification-${id}-title` : undefined}>
      <CardContent>
        <div className="flex items-start gap-3">
          <Avatar name={title} src={avatarUrl} size="sm" />

          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <div id={id ? `notification-${id}-title` : undefined} className="text-small font-semibold text-foreground truncate">{title}</div>
              <div className="ml-2">
                {unread ? <Badge variant="pending" size="sm">New</Badge> : null}
                {priority !== "normal" ? <span className="ml-2"><Badge variant={variant as any} size="sm">{priority}</Badge></span> : null}
              </div>
            </div>

            {description ? (
              <div className="mt-1 text-small text-foreground-secondary truncate">{description}</div>
            ) : null}

            <div className="mt-2 flex items-center gap-2 text-small text-foreground-secondary">
              {timestamp ? (
                <span className="inline-flex items-center gap-1"><Clock className="h-4 w-4 text-foreground-muted" aria-hidden="true" />{timestamp}</span>
              ) : null}

              <div className="ml-auto">{children}</div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default NotificationCard;
