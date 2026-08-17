import type { ReactNode } from "react";

export type PageHeaderProps = {
  title: string;
  subtitle?: string;
  description?: string;
  rightSlot?: ReactNode;
};

export function PageHeader({ title, subtitle, description, rightSlot }: PageHeaderProps) {
  const displayText = subtitle ?? description;
  return (
    <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">{title}</h1>
        {displayText ? <p className="mt-1 text-sm text-foreground-secondary">{displayText}</p> : null}
      </div>
      {rightSlot ? <div>{rightSlot}</div> : null}
    </div>
  );
}
