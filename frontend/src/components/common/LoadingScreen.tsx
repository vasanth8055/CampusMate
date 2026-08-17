export function LoadingScreen() {
  return (
    <div className="flex min-h-[50vh] items-center justify-center">
      <div className="flex items-center gap-3 rounded-full border border-border bg-surface/80 px-5 py-3 text-sm font-medium text-foreground-secondary shadow-sm">
        <span className="h-4 w-4 animate-spin rounded-full border-2 border-border border-t-primary" />
        Loading...
      </div>
    </div>
  );
}
