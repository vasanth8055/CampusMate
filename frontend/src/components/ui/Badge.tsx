import type { HTMLAttributes, ReactNode } from "react";
import { tv, type VariantProps } from "tailwind-variants";

import { cn } from "@/lib/cn";

const badgeVariants = tv({
  base: [
    "inline-flex items-center justify-center gap-1",
    "rounded-full font-medium whitespace-nowrap",
    "border border-transparent",
  ],
  variants: {
    variant: {
      verified: "bg-success-subtle text-success",
      pending: "bg-warning-subtle text-warning",
      completed: "bg-success-subtle text-success",
      cancelled: "bg-border-subtle text-foreground-muted",
      rejected: "bg-danger-subtle text-danger",
      availableSeats: "bg-primary-subtle text-primary",
      driverVerified: "bg-info-subtle text-info",
      premiumDriver: "bg-accent/15 text-accent-foreground",
      default: "bg-border-subtle text-foreground-secondary",
    },
    size: {
      sm: "px-2 py-0.5 text-caption",
      md: "px-2.5 py-1 text-small",
    },
  },
  defaultVariants: {
    variant: "default",
    size: "md",
  },
});

export type BadgeProps = HTMLAttributes<HTMLSpanElement> &
  VariantProps<typeof badgeVariants> & {
    icon?: ReactNode;
  };

export function Badge({
  className,
  variant,
  size,
  icon,
  children,
  ...props
}: BadgeProps) {
  return (
    <span className={cn(badgeVariants({ variant, size, className }))} {...props}>
      {icon ? <span aria-hidden="true">{icon}</span> : null}
      {children}
    </span>
  );
}

export { badgeVariants };

/** Human-readable labels for semantic badge variants */
export const badgeLabels = {
  verified: "Verified",
  pending: "Pending",
  completed: "Completed",
  cancelled: "Cancelled",
  rejected: "Rejected",
  availableSeats: "Seats Available",
  driverVerified: "Driver Verified",
  premiumDriver: "Premium Driver",
} as const;

export type BadgeVariant = NonNullable<VariantProps<typeof badgeVariants>["variant"]>;

export function StatusBadge({
  variant,
  children,
  ...props
}: Omit<BadgeProps, "variant"> & { variant: Exclude<BadgeVariant, "default"> }) {
  return (
    <Badge variant={variant} {...props}>
      {children ?? badgeLabels[variant as keyof typeof badgeLabels]}
    </Badge>
  );
}
