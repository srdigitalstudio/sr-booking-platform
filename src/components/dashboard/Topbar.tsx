"use client";

import Link from "next/link";
import {
  LogOut,
  Menu,
  Moon,
  Plus,
  Sun,
} from "lucide-react";
import { useState } from "react";

import { useTheme } from "@/components/theme/ThemeProvider";

type TopbarProps = {
  onOpenMenu: () => void;
};

export function Topbar({
  onOpenMenu,
}: TopbarProps) {
  const { theme, toggleTheme } = useTheme();

  const [profileOpen, setProfileOpen] =
    useState(false);
  const [loggingOut, setLoggingOut] =
    useState(false);

  const darkMode = theme === "dark";

  async function handleLogout() {
    if (loggingOut) {
      return;
    }

    setLoggingOut(true);

    try {
      const response = await fetch(
        "/api/auth/logout",
        {
          method: "POST",
        }
      );

      if (!response.ok) {
        throw new Error(
          "Logout request failed"
        );
      }

      window.location.href = "/login";
    } catch (error) {
      console.error(
        "Failed to logout:",
        error
      );

      setLoggingOut(false);
    }
  }

  return (
    <header className="flex min-h-16 items-center justify-between border-b border-border bg-background px-4 text-foreground sm:px-6">
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onOpenMenu}
          className="flex h-10 w-10 items-center justify-center rounded-xl border border-border bg-background text-muted-foreground transition hover:bg-muted hover:text-foreground lg:hidden"
          aria-label="Open navigation"
        >
          <Menu
            className="h-5 w-5"
            aria-hidden="true"
          />
        </button>

        <div>
          <h2 className="text-lg font-bold tracking-tight sm:text-2xl">
            Dashboard
          </h2>

          <p className="hidden text-sm text-muted-foreground sm:block">
            Welcome back
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2 sm:gap-3">
        <button
          type="button"
          onClick={toggleTheme}
          className="flex h-10 w-10 items-center justify-center rounded-xl border border-border bg-background text-muted-foreground transition hover:bg-muted hover:text-foreground"
          aria-label={
            darkMode
              ? "Switch to light mode"
              : "Switch to dark mode"
          }
          title={
            darkMode
              ? "Light mode"
              : "Dark mode"
          }
        >
          {darkMode ? (
            <Sun
              className="h-5 w-5"
              aria-hidden="true"
            />
          ) : (
            <Moon
              className="h-5 w-5"
              aria-hidden="true"
            />
          )}
        </button>

        <Link
          href="/dashboard/appointments"
          className="flex items-center gap-2 rounded-xl bg-blue-600 px-3 py-2 text-sm font-medium text-white transition hover:bg-blue-700 sm:px-4"
        >
          <Plus
            className="h-4 w-4"
            aria-hidden="true"
          />

          <span className="hidden sm:inline">
            New Booking
          </span>

          <span className="sm:hidden">
            Booking
          </span>
        </Link>

        <div className="relative">
          <button
            type="button"
            onClick={() =>
              setProfileOpen(
                (open) => !open
              )
            }
            className="flex h-10 w-10 items-center justify-center rounded-full bg-muted text-sm font-semibold text-foreground transition hover:bg-accent"
            aria-label="Open user menu"
            aria-expanded={profileOpen}
          >
            SR
          </button>

          {profileOpen && (
            <div className="absolute right-0 top-12 z-50 w-44 overflow-hidden rounded-xl border border-border bg-popover p-1 shadow-lg">
              <button
                type="button"
                onClick={handleLogout}
                disabled={loggingOut}
                className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-popover-foreground transition hover:bg-muted disabled:cursor-not-allowed disabled:opacity-50"
              >
                <LogOut
                  className="h-4 w-4"
                  aria-hidden="true"
                />

                {loggingOut
                  ? "Logging out..."
                  : "Logout"}
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}