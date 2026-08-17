/* eslint-disable react-refresh/only-export-components */
import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from "react";
import { tv, type VariantProps } from "tailwind-variants";

import { cn } from "@/lib/cn";

import { Spinner } from "./Spinner";

const buttonVariants = tv({
  base: [
    "inline-flex shrink-0 items-center justify-center gap-2",
    "font-medium text-sm",
    "rounded-button",
    "transition-colors duration-150",
    "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring",
    "disabled:pointer-events-none disabled:opacity-50",
  ],
  variants: {
    variant: {
      primary:
        "bg-primary text-white hover:bg-primary-hover active:bg-primary-pressed",
      secondary:
        "bg-secondary text-white hover:bg-secondary-hover",
      outline:
        "border border-border bg-transparent text-foreground hover:bg-surface-elevated active:bg-border-subtle",
      ghost:
        "bg-transparent text-foreground hover:bg-surface-elevated active:bg-border-subtle",
      danger:
        "bg-danger text-white hover:bg-danger/90 active:bg-danger/80",
      success:
        "bg-success text-white hover:bg-success/90 active:bg-success/80",
    },
    size: {
      sm: "h-8 px-3 text-xs",
      md: "h-10 px-4 text-sm",
      lg: "h-12 px-6 text-base",
      icon: "h-10 w-10 p-0 text-sm",
      fab: "fixed bottom-6 right-6 z-fixed h-14 w-14 rounded-full p-0 shadow-large text-base",
    },
    fullWidth: {
      true: "w-full",
    },
  },
  defaultVariants: {
    variant: "primary",
    size: "md",
  },
});

type ButtonVariantProps = VariantProps<typeof buttonVariants>;

export type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> &
  ButtonVariantProps & {
    loading?: boolean;
    leftIcon?: ReactNode;
    rightIcon?: ReactNode;
    loadingText?: string;
  };

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant,
      size,
      fullWidth,
      loading = false,
      disabled,
      leftIcon,
      rightIcon,
      loadingText,
      children,
      type = "button",
      ...props
    },
    ref,
  ) => {
    const isDisabled = disabled || loading;
    const isIconOnly = size === "icon" || size === "fab";
    const spinnerSize = size === "sm" ? "sm" : size === "lg" || size === "fab" ? "lg" : "md";

    return (
      <button
        ref={ref}
        type={type}
        disabled={isDisabled}
        aria-busy={loading || undefined}
        className={cn(buttonVariants({ variant, size, fullWidth, className }))}
        {...props}
      >
        {loading ? (
          <>
            <Spinner size={spinnerSize} />
            {!isIconOnly && (loadingText ?? children)}
          </>
        ) : (
          <>
            {leftIcon}
            {children}
            {rightIcon}
          </>
        )}
      </button>
    );
  },
);

Button.displayName = "Button";

export default Button;
export { Button, buttonVariants };
