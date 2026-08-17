import { Search } from "lucide-react";

type SearchBarProps = {
  placeholder?: string;
};

export function SearchBar({ placeholder = "Search" }: SearchBarProps) {
  return (
    <label className="flex w-full items-center gap-2 rounded-input border border-border bg-surface px-3 py-2 text-sm text-foreground-secondary shadow-sm transition focus-within:border-secondary focus-within:ring-2 focus-within:ring-secondary-subtle">
      <Search className="h-4 w-4 text-foreground-secondary" />
      <input
        type="search"
        placeholder={placeholder}
        className="w-full border-0 bg-transparent text-sm text-foreground outline-none placeholder:text-foreground-secondary"
      />
    </label>
  );
}
