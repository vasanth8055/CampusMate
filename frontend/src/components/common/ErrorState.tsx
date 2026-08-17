type ErrorStateProps = {
  title?: string;
  message?: string;
};

export function ErrorState({ title = "Something went wrong", message = "Please try again later." }: ErrorStateProps) {
  return (
    <div className="rounded-card border border-danger-subtle bg-danger-subtle p-6 text-danger">
      <h3 className="text-lg font-semibold">{title}</h3>
      <p className="mt-2 text-sm">{message}</p>
    </div>
  );
}
