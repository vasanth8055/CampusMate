import type { HTMLAttributes } from "react";
import { tv, type VariantProps } from "tailwind-variants";

import { cn } from "@/lib/cn";

const skeletonVariants = tv({
  base: "animate-pulse rounded-input bg-border-subtle",
  variants: {
    variant: {
      default: "rounded-input",
      circular: "rounded-full",
      text: "h-4 rounded-input",
    },
  },
  defaultVariants: {
    variant: "default",
  },
});

type SkeletonProps = HTMLAttributes<HTMLDivElement> &
  VariantProps<typeof skeletonVariants>;

export function Skeleton({ className, variant, ...props }: SkeletonProps) {
  return (
    <div
      aria-hidden="true"
      className={cn(skeletonVariants({ variant }), className)}
      {...props}
    />
  );
}
