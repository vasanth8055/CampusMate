/**
 * Centralized CampusMate Status Colors and Labels
 * Ensures 100% semantic consistency across My Trips, My Rides, Dashboards, and Alerts.
 *
 * Semantic Rules:
 * - SCHEDULED: Primary/neutral
 * - REQUESTED: Amber / Warning (Waiting for response)
 * - ACCEPTED / CONFIRMED: Indigo / Primary
 * - ONGOING / IN_PROGRESS: Emerald Green (Active commute)
 * - COMPLETED: Neutral Emerald / Surface
 * - CANCELLED: RED (Danger)
 * - REJECTED: RED (Danger)
 * - FAILED / ERROR: RED (Danger)
 */

export function getStatusBadgeClass(status?: string): string {
  const s = (status || "").toUpperCase();
  switch (s) {
    case "ONGOING":
    case "IN_PROGRESS":
      return "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-500/30";
    case "ACCEPTED":
    case "CONFIRMED":
      return "bg-primary-subtle text-primary border border-primary/20";
    case "REQUESTED":
      return "bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-500/30";
    case "COMPLETED":
      return "bg-surface-subtle text-foreground-secondary border border-border";
    case "CANCELLED":
      return "bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300 border border-rose-500/30";
    case "REJECTED":
      return "bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300 border border-rose-500/30";
    case "FAILED":
      return "bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300 border border-rose-500/30";
    case "SCHEDULED":
    default:
      return "bg-primary-subtle text-primary border border-primary/20";
  }
}

export function getStatusLabel(status?: string): string {
  const s = (status || "").toUpperCase();
  switch (s) {
    case "ONGOING":
    case "IN_PROGRESS":
      return "• In Progress";
    case "ACCEPTED":
      return "Accepted";
    case "CONFIRMED":
      return "Confirmed";
    case "REQUESTED":
      return "Waiting for Approval";
    case "COMPLETED":
      return "Completed";
    case "CANCELLED":
      return "Cancelled";
    case "REJECTED":
      return "Rejected";
    case "SCHEDULED":
      return "Scheduled";
    default:
      return status || "Unknown";
  }
}
