"use client";

import { Moon, Sun } from "lucide-react";

export function ThemeToggle() {
  function toggleTheme() {
    const isDark =
      document.documentElement.classList.contains("dark");

    const nextTheme = isDark ? "light" : "dark";

    document.documentElement.classList.toggle(
      "dark",
      nextTheme === "dark"
    );

    document.cookie = `theme=${nextTheme}; path=/; max-age=31536000; samesite=lax`;
  }

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label="Toggle dark mode"
      title="Toggle dark mode"
      className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-border bg-background text-foreground shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:bg-muted hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
    >
      <Moon
        className="h-5 w-5 dark:hidden"
        aria-hidden="true"
      />

      <Sun
        className="hidden h-5 w-5 dark:block"
        aria-hidden="true"
      />
    </button>
  );
}