"use client";

import { ReactNode, useEffect, useState } from "react";
import { X } from "lucide-react";
import { usePathname } from "next/navigation";

import { Sidebar } from "./Sidebar";
import { Topbar } from "./Topbar";

type DashboardLayoutProps = {
  children: ReactNode;
};

export function DashboardLayout({
  children,
}: DashboardLayoutProps) {
  const pathname = usePathname();

  const [mobileMenuOpen, setMobileMenuOpen] =
    useState(false);

  const openMobileMenu = () => {
    setMobileMenuOpen(true);
  };

  const closeMobileMenu = () => {
    setMobileMenuOpen(false);
  };

  useEffect(() => {
    if (!mobileMenuOpen) {
      document.body.style.overflow = "";

      return;
    }

    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileMenuOpen]);

  return (
    <div className="flex min-h-screen bg-background text-foreground">
      <Sidebar pathname={pathname} />

      {mobileMenuOpen && (
        <div
          className="fixed inset-0 z-50 lg:hidden"
          role="dialog"
          aria-modal="true"
          aria-label="Mobile navigation"
        >
          <button
            type="button"
            onClick={closeMobileMenu}
            className="absolute inset-0 bg-black/40 backdrop-blur-[1px]"
            aria-label="Close navigation"
          />

          <div className="relative z-10 h-full w-72 max-w-[85vw] bg-background shadow-2xl">
            <button
              type="button"
              onClick={closeMobileMenu}
              className="absolute right-4 top-5 z-20 flex h-9 w-9 items-center justify-center rounded-lg border border-border bg-background text-muted-foreground transition hover:bg-muted hover:text-foreground"
              aria-label="Close navigation"
            >
              <X
                className="h-5 w-5"
                aria-hidden="true"
              />
            </button>

            <Sidebar
              pathname={pathname}
              mobile
              onNavigate={closeMobileMenu}
            />
          </div>
        </div>
      )}

      <div className="flex min-w-0 flex-1 flex-col bg-background">
        <Topbar onOpenMenu={openMobileMenu} />

        <main className="flex-1 bg-background p-4 sm:p-6 lg:p-8">
          <div className="mx-auto w-full max-w-7xl">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
