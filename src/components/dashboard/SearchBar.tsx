import { ChangeEvent } from "react";

import { Search } from "lucide-react";

import { Input } from "@/components/ui/input";

type SearchBarProps = {
  placeholder?: string;
  value: string;
  onChange: (event: ChangeEvent<HTMLInputElement>) => void;
};

export function SearchBar({
  placeholder = "Search...",
  value,
  onChange,
}: SearchBarProps) {
  return (
    <div className="relative w-full max-w-sm">
      <Search
        className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
        aria-hidden="true"
      />

      <Input
        className="border-border bg-background pl-10 text-foreground placeholder:text-muted-foreground dark:bg-slate-900"
        placeholder={placeholder}
        value={value}
        onChange={onChange}
      />
    </div>
  );
}