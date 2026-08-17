import type { ComponentPropsWithoutRef } from "react";

type AvatarProps = ComponentPropsWithoutRef<"img"> & {
  name?: string;
  size?: "sm" | "md" | "lg";
};

export function Avatar({ name, src, size = "md", className = "", ...props }: AvatarProps) {
  const sizeMap = {
    sm: "h-8 w-8 text-xs",
    md: "h-10 w-10 text-sm",
    lg: "h-12 w-12 text-base",
  };

  if (src) {
    return (
      <img
        src={src}
        alt={name ?? "User avatar"}
        className={`${sizeMap[size]} rounded-full object-cover ring-2 ring-white dark:ring-slate-800 ${className}`.trim()}
        {...props}
      />
    );
  }

  return (
    <div
      className={`${sizeMap[size]} inline-flex items-center justify-center rounded-full bg-primary text-primary-foreground font-semibold shadow-sm ${className}`.trim()}
      {...props}
    >
      {(name ?? "R").slice(0, 1).toUpperCase()}
    </div>
  );
}
