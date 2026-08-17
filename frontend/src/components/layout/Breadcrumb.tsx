type BreadcrumbProps = {
  items: Array<{ label: string; href?: string }>;
  current: string;
};

export function Breadcrumb({ items, current }: BreadcrumbProps) {
  return (
    <nav aria-label="Breadcrumb" className="mb-4 flex items-center gap-2 text-sm text-foreground-secondary">
      {items.map((item, index) => (
        <div key={`${item.label}-${index}`} className="flex items-center gap-2">
          {item.href ? (
            <a href={item.href} className="transition hover:text-foreground hover:dark:text-foreground-inverse">
              {item.label}
            </a>
          ) : (
            <span className="text-foreground-secondary">{item.label}</span>
          )}
          {index < items.length - 1 ? <span className="text-foreground-secondary">/</span> : null}
        </div>
      ))}
      <span className="text-foreground">{current}</span>
    </nav>
  );
}
