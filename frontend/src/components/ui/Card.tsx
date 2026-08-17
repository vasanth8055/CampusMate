import { forwardRef, type HTMLAttributes, type ReactNode } from "react";
import { tv, type VariantProps } from "tailwind-variants";

import { cn } from "@/lib/cn";

import { Skeleton } from "./Skeleton";

const cardVariants = tv({
  base: "rounded-card border border-border bg-surface text-foreground",
  variants: {
    variant: {
      default: "shadow-soft",
      elevated: "shadow-medium",
      outline: "shadow-none",
    },
    interactive: {
      true: "cursor-pointer transition-shadow duration-150 hover:shadow-medium focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring",
    },
    loading: {
      true: "pointer-events-none",
    },
  },
  defaultVariants: {
    variant: "default",
    interactive: false,
    loading: false,
  },
});

export type CardProps = HTMLAttributes<HTMLDivElement> &
  VariantProps<typeof cardVariants> & {
    asChild?: boolean;
  };

export const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ className, variant, interactive, loading, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(cardVariants({ variant, interactive, loading, className }))}
        {...props}
      >
        {loading ? <CardSkeleton /> : children}
      </div>
    );
  },
);

Card.displayName = "Card";

export type CardHeaderProps = HTMLAttributes<HTMLDivElement>;

export function CardHeader({ className, ...props }: CardHeaderProps) {
  return (
    <div
      className={cn("flex flex-col gap-1 border-b border-border-subtle px-5 py-4", className)}
      {...props}
    />
  );
}

export type CardTitleProps = HTMLAttributes<HTMLHeadingElement>;

export function CardTitle({ className, ...props }: CardTitleProps) {
  return <h3 className={cn("text-h3 text-foreground", className)} {...props} />;
}

export type CardDescriptionProps = HTMLAttributes<HTMLParagraphElement>;

export function CardDescription({ className, ...props }: CardDescriptionProps) {
  return (
    <p className={cn("text-small text-foreground-secondary", className)} {...props} />
  );
}

export type CardContentProps = HTMLAttributes<HTMLDivElement>;

export function CardContent({ className, ...props }: CardContentProps) {
  return <div className={cn("px-5 py-4", className)} {...props} />;
}

export type CardFooterProps = HTMLAttributes<HTMLDivElement>;

export function CardFooter({ className, ...props }: CardFooterProps) {
  return (
    <div
      className={cn(
        "flex items-center gap-3 border-t border-border-subtle px-5 py-4",
        className,
      )}
      {...props}
    />
  );
}

export type CardActionsProps = HTMLAttributes<HTMLDivElement>;

export function CardActions({ className, children, ...props }: CardActionsProps) {
  return (
    <div className={cn("flex items-center gap-2", className)} {...props}>
      {children}
    </div>
  );
}

function CardSkeleton() {
  return (
    <div className="flex flex-col gap-4 p-5">
      <Skeleton className="h-5 w-2/5" />
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-4/5" />
      <Skeleton className="h-10 w-full rounded-button" />
    </div>
  );
}

export type ClickableCardProps = CardProps & {
  onClick?: () => void;
  href?: string;
  children: ReactNode;
};

export function ClickableCard({
  onClick,
  href,
  children,
  className,
  variant,
  loading,
  ...props
}: ClickableCardProps) {
  const sharedClassName = cn(
    cardVariants({ variant, interactive: true, loading, className }),
  );

  if (href) {
    return (
      <a href={href} className={sharedClassName} {...(props as any)}>
        {loading ? <CardSkeleton /> : children}
      </a>
    );
  }

  return (
    <Card
      interactive
      variant={variant}
      loading={loading}
      className={className}
      onClick={onClick}
      role={onClick ? "button" : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={
        onClick
          ? (event) => {
              if (event.key === "Enter" || event.key === " ") {
                event.preventDefault();
                onClick();
              }
            }
          : undefined
      }
      {...props}
    >
      {children}
    </Card>
  );
}

export { cardVariants };
