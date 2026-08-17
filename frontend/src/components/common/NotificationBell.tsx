import { Bell } from "lucide-react";

type NotificationBellProps = {
  count?: number;
};

export function NotificationBell({ count = 0 }: NotificationBellProps) {
  return (
    <button
      type="button"
      className="relative inline-flex h-10 w-10 items-center justify-center rounded-full border border-border bg-surface text-foreground-secondary transition hover:border-border-subtle hover:bg-surface-subtle"
      aria-label="Notifications"
    >
      <Bell className="h-4 w-4" />
      {count > 0 ? (
        <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-danger px-1 text-[10px] font-semibold text-foreground-inverse">
          {count > 9 ? "9+" : count}
        </span>
      ) : null}
    </button>
  );
}
