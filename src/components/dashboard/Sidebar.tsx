import Link from "next/link";
import {
  CalendarDays,
  CheckCircle2,
  LayoutDashboard,
  Settings,
  Scissors,
  UserRound,
  Users,
} from "lucide-react";

type SidebarProps = {
  pathname: string;
  mobile?: boolean;
  onNavigate?: () => void;
};

const navigation = [
  {
    name: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
    description: "Overview",
  },
  {
    name: "Appointments",
    href: "/dashboard/appointments",
    icon: CalendarDays,
    description: "Manage bookings",
  },
  {
    name: "Customers",
    href: "/dashboard/customers",
    icon: Users,
    description: "Customer directory",
  },
  {
    name: "Staff",
    href: "/dashboard/staff",
    icon: UserRound,
    description: "Manage team members",
  },
  {
    name: "Services",
    href: "/dashboard/services",
    icon: Scissors,
    description: "Manage services",
  },
];

const secondaryNavigation = [
  {
    name: "Settings",
    href: "/dashboard/settings",
    icon: Settings,
    description: "Platform settings",
  },
];

export function Sidebar({
  pathname,
  mobile = false,
  onNavigate,
}: SidebarProps) {
  const renderNavigationItem = (
    item: (typeof navigation)[number]
  ) => {
    const Icon = item.icon;

    const isActive =
      item.href === "/dashboard"
        ? pathname === "/dashboard"
        : pathname.startsWith(item.href);

    return (
      <Link
        key={item.href}
        href={item.href}
        onClick={onNavigate}
        aria-current={isActive ? "page" : undefined}
        className={`group relative flex items-center gap-3 rounded-xl px-3 py-3 transition-all duration-200 ${
          isActive
            ? "bg-blue-600 text-white shadow-md shadow-blue-600/20"
            : "text-sidebar-foreground/75 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
        }`}
      >
        <span
          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg transition-all duration-200 ${
            isActive
              ? "bg-white/15 text-white"
              : "bg-sidebar-accent text-sidebar-foreground/70 group-hover:bg-background group-hover:text-blue-600"
          }`}
        >
          <Icon
            className="h-5 w-5"
            strokeWidth={isActive ? 2.2 : 2}
            aria-hidden="true"
          />
        </span>

        <span className="min-w-0 flex-1">
          <span
            className={`block truncate text-sm font-semibold ${
              isActive
                ? "text-white"
                : "text-sidebar-foreground/90"
            }`}
          >
            {item.name}
          </span>

          <span
            className={`mt-0.5 block truncate text-[11px] ${
              isActive
                ? "text-white/70"
                : "text-sidebar-foreground/50"
            }`}
          >
            {item.description}
          </span>
        </span>

        {isActive && (
          <span className="h-2 w-2 shrink-0 rounded-full bg-white shadow-sm" />
        )}
      </Link>
    );
  };

  return (
    <aside
      className={`flex h-full w-64 shrink-0 flex-col border-border bg-sidebar text-sidebar-foreground ${
        mobile ? "" : "hidden border-r lg:flex"
      }`}
    >
      {/* Brand */}
      <div className="border-b border-sidebar-border px-5 py-5">
        <Link
          href="/dashboard"
          onClick={onNavigate}
          className="group flex items-center gap-3 rounded-xl p-1"
        >
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-600 text-white shadow-md shadow-blue-600/20 transition-transform duration-200 group-hover:scale-105">
            <CalendarDays
              className="h-5 w-5"
              strokeWidth={2.2}
              aria-hidden="true"
            />
          </div>

          <div className="min-w-0">
            <h1 className="truncate text-lg font-bold tracking-tight text-sidebar-foreground">
              SR Booking
            </h1>

            <p className="mt-0.5 truncate text-[11px] font-medium text-muted-foreground">
              Booking Management
            </p>
          </div>
        </Link>
      </div>

      {/* Main Navigation */}
      <div className="flex-1 overflow-y-auto px-3 py-5">
        <div className="mb-3 px-3">
          <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-muted-foreground/70">
            Main Menu
          </p>
        </div>

        <nav
          className="space-y-1.5"
          aria-label="Main navigation"
        >
          {navigation.map(renderNavigationItem)}
        </nav>

        {/* Secondary Navigation */}
        <div className="my-6 border-t border-sidebar-border" />

        <div className="mb-3 px-3">
          <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-muted-foreground/70">
            System
          </p>
        </div>

        <nav
          className="space-y-1.5"
          aria-label="System navigation"
        >
          {secondaryNavigation.map((item) => {
            const Icon = item.icon;

            const isActive = pathname.startsWith(
              item.href
            );

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onNavigate}
                aria-current={
                  isActive ? "page" : undefined
                }
                className={`group relative flex items-center gap-3 rounded-xl px-3 py-3 transition-all duration-200 ${
                  isActive
                    ? "bg-blue-600 text-white shadow-md shadow-blue-600/20"
                    : "text-sidebar-foreground/75 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                }`}
              >
                <span
                  className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg transition-all duration-200 ${
                    isActive
                      ? "bg-white/15 text-white"
                      : "bg-sidebar-accent text-sidebar-foreground/70 group-hover:bg-background group-hover:text-blue-600"
                  }`}
                >
                  <Icon
                    className="h-5 w-5"
                    strokeWidth={isActive ? 2.2 : 2}
                    aria-hidden="true"
                  />
                </span>

                <span className="min-w-0 flex-1">
                  <span
                    className={`block truncate text-sm font-semibold ${
                      isActive
                        ? "text-white"
                        : "text-sidebar-foreground/90"
                    }`}
                  >
                    {item.name}
                  </span>

                  <span
                    className={`mt-0.5 block truncate text-[11px] ${
                      isActive
                        ? "text-white/70"
                        : "text-sidebar-foreground/50"
                    }`}
                  >
                    {item.description}
                  </span>
                </span>

                {isActive && (
                  <span className="h-2 w-2 shrink-0 rounded-full bg-white shadow-sm" />
                )}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Bottom Status Card */}
      <div className="border-t border-sidebar-border p-4">
        <div className="rounded-2xl border border-sidebar-border bg-sidebar-accent/70 p-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-green-100 dark:bg-green-950">
              <CheckCircle2
                className="h-4 w-4 text-green-600 dark:text-green-400"
                aria-hidden="true"
              />
            </div>

            <div className="min-w-0">
              <p className="text-xs font-semibold text-sidebar-accent-foreground">
                System Active
              </p>

              <p className="mt-0.5 text-[10px] text-muted-foreground">
                Booking system is ready
              </p>
            </div>
          </div>

          <div className="mt-3 h-px bg-sidebar-border" />

          <p className="mt-3 text-[10px] leading-4 text-muted-foreground">
            Manage your appointments, customers, staff and services from one place.
          </p>
        </div>
      </div>
    </aside>
  );
}