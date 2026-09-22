import Link from "next/link";
import {
  ArrowRight,
  CalendarDays,
  Clock3,
  UserRound,
} from "lucide-react";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@/generated/prisma/client";

import { getCurrentBusinessContext } from "@/lib/auth";
import { StatusBadge } from "@/components/dashboard/StatusBadge";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL,
});

const prisma = new PrismaClient({
  adapter,
});

type AppointmentStatus =
  | "pending"
  | "confirmed"
  | "completed"
  | "cancelled";

function formatDate(
  date: Date,
  timeZone: string
) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    timeZone,
  }).format(date);
}

function getTodayRange(timeZone: string) {
  const now = new Date();

  const formatter = new Intl.DateTimeFormat(
    "en-US",
    {
      timeZone,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    }
  );

  const parts = formatter.formatToParts(now);

  const year = Number(
    parts.find((part) => part.type === "year")?.value
  );

  const month = Number(
    parts.find((part) => part.type === "month")?.value
  );

  const day = Number(
    parts.find((part) => part.type === "day")?.value
  );

  const start = new Date(
    Date.UTC(year, month - 1, day)
  );

  const end = new Date(
    Date.UTC(year, month - 1, day + 1)
  );

  return {
    start,
    end,
  };
}

export async function RecentAppointments() {
  const businessContext =
    await getCurrentBusinessContext();

  if (!businessContext) {
    return null;
  }

  const businessId = businessContext.business.id;
  const timeZone =
    businessContext.business.timezone || "UTC";

  const { start, end } = getTodayRange(timeZone);

  const [
    todayAppointments,
    upcomingAppointments,
    recentAppointments,
  ] = await Promise.all([
    prisma.appointment.findMany({
      where: {
        businessId,
        date: {
          gte: start,
          lt: end,
        },
      },
      include: {
        customer: true,
        service: true,
      },
      orderBy: {
        time: "asc",
      },
      take: 5,
    }),

    prisma.appointment.findMany({
      where: {
        businessId,
        date: {
          gte: end,
        },
      },
      include: {
        customer: true,
        service: true,
      },
      orderBy: [
        {
          date: "asc",
        },
        {
          time: "asc",
        },
      ],
      take: 5,
    }),

    prisma.appointment.findMany({
      where: {
        businessId,
      },
      include: {
        customer: true,
        service: true,
      },
      orderBy: {
        createdAt: "desc",
      },
      take: 5,
    }),
  ]);

  return (
    <div className="space-y-6">
      {/* Today */}
      <Card className="overflow-hidden rounded-2xl border-border bg-card shadow-sm">
        <CardHeader className="flex flex-col gap-3 border-b border-border sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-100 text-blue-600 dark:bg-blue-950 dark:text-blue-400">
              <CalendarDays
                className="h-5 w-5"
                aria-hidden="true"
              />
            </div>

            <div>
              <CardTitle className="text-lg font-semibold">
                Today&apos;s Appointments
              </CardTitle>

              <p className="mt-1 text-sm text-muted-foreground">
                Your schedule for today.
              </p>
            </div>
          </div>

          <span className="w-fit rounded-full bg-muted px-3 py-1 text-xs font-semibold text-muted-foreground">
            {todayAppointments.length}{" "}
            {todayAppointments.length === 1
              ? "appointment"
              : "appointments"}
          </span>
        </CardHeader>

        <CardContent className="p-4 sm:p-6">
          {todayAppointments.length === 0 ? (
            <EmptyAppointments
              title="No appointments today"
              description="Your schedule is clear for today."
            />
          ) : (
            <div className="space-y-3">
              {todayAppointments.map((appointment) => (
                <AppointmentRow
                  key={appointment.id}
                  customerName={
                    appointment.customer.name
                  }
                  serviceName={
                    appointment.service.name
                  }
                  date={appointment.date}
                  time={appointment.time}
                  timeZone={timeZone}
                  status={
                    appointment.status.toLowerCase() as AppointmentStatus
                  }
                />
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Upcoming */}
      <Card className="overflow-hidden rounded-2xl border-border bg-card shadow-sm">
        <CardHeader className="flex flex-col gap-3 border-b border-border sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-purple-100 text-purple-600 dark:bg-purple-950 dark:text-purple-400">
              <Clock3
                className="h-5 w-5"
                aria-hidden="true"
              />
            </div>

            <div>
              <CardTitle className="text-lg font-semibold">
                Upcoming Appointments
              </CardTitle>

              <p className="mt-1 text-sm text-muted-foreground">
                The next bookings on your schedule.
              </p>
            </div>
          </div>

          <Link
            href="/dashboard/appointments"
            className="group flex w-fit items-center gap-1.5 rounded-lg px-2.5 py-2 text-sm font-medium text-blue-600 transition-colors hover:bg-blue-50 hover:text-blue-700 dark:text-blue-400 dark:hover:bg-blue-950 dark:hover:text-blue-300"
          >
            View All
            <ArrowRight
              className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1"
              aria-hidden="true"
            />
          </Link>
        </CardHeader>

        <CardContent className="p-4 sm:p-6">
          {upcomingAppointments.length === 0 ? (
            <EmptyAppointments
              title="No upcoming appointments"
              description="New bookings will appear here."
            />
          ) : (
            <div className="space-y-3">
              {upcomingAppointments.map(
                (appointment) => (
                  <AppointmentRow
                    key={appointment.id}
                    customerName={
                      appointment.customer.name
                    }
                    serviceName={
                      appointment.service.name
                    }
                    date={appointment.date}
                    time={appointment.time}
                    timeZone={timeZone}
                    status={
                      appointment.status.toLowerCase() as AppointmentStatus
                    }
                  />
                )
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Recent */}
      <Card className="overflow-hidden rounded-2xl border-border bg-card shadow-sm">
        <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <CardTitle className="text-lg font-semibold">
              Recent Appointments
            </CardTitle>

            <p className="mt-1 text-sm text-muted-foreground">
              Latest booking activity.
            </p>
          </div>

          <Link
            href="/dashboard/appointments"
            className="group flex w-fit items-center gap-1.5 rounded-lg px-2.5 py-2 text-sm font-medium text-blue-600 transition-colors hover:bg-blue-50 hover:text-blue-700 dark:text-blue-400 dark:hover:bg-blue-950 dark:hover:text-blue-300"
          >
            View All
            <ArrowRight
              className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1"
              aria-hidden="true"
            />
          </Link>
        </CardHeader>

        <CardContent className="p-0">
          {recentAppointments.length === 0 ? (
            <div className="p-4 sm:p-6">
              <EmptyAppointments
                title="No appointments yet"
                description="New bookings will appear here."
              />
            </div>
          ) : (
            <>
              <div className="hidden overflow-x-auto md:block">
                <table className="w-full min-w-[720px]">
                  <thead>
                    <tr className="border-y border-border bg-muted/30 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                      <th className="px-6 py-3">
                        Customer
                      </th>

                      <th className="px-4 py-3">
                        Service
                      </th>

                      <th className="px-4 py-3">
                        Date
                      </th>

                      <th className="px-4 py-3">
                        Time
                      </th>

                      <th className="px-6 py-3 text-right">
                        Status
                      </th>
                    </tr>
                  </thead>

                  <tbody>
                    {recentAppointments.map(
                      (appointment) => {
                        const status =
                          appointment.status.toLowerCase() as AppointmentStatus;

                        return (
                          <tr
                            key={appointment.id}
                            className="group border-b border-border transition-colors last:border-0 hover:bg-muted/40"
                          >
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-3">
                                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-blue-100 text-xs font-bold text-blue-700 dark:bg-blue-950 dark:text-blue-300">
                                  {getInitials(
                                    appointment.customer.name
                                  )}
                                </div>

                                <div className="min-w-0">
                                  <p className="truncate text-sm font-semibold text-card-foreground">
                                    {
                                      appointment
                                        .customer
                                        .name
                                    }
                                  </p>

                                  <p className="text-xs text-muted-foreground">
                                    Customer
                                  </p>
                                </div>
                              </div>
                            </td>

                            <td className="px-4 py-4 text-sm text-muted-foreground">
                              {
                                appointment.service
                                  .name
                              }
                            </td>

                            <td className="whitespace-nowrap px-4 py-4 text-sm font-medium text-card-foreground">
                              {formatDate(
                                appointment.date,
                                timeZone
                              )}
                            </td>

                            <td className="whitespace-nowrap px-4 py-4 text-sm font-medium text-card-foreground">
                              {appointment.time}
                            </td>

                            <td className="px-6 py-4 text-right">
                              <StatusBadge
                                status={status}
                              />
                            </td>
                          </tr>
                        );
                      }
                    )}
                  </tbody>
                </table>
              </div>

              <div className="divide-y divide-border md:hidden">
                {recentAppointments.map(
                  (appointment) => {
                    const status =
                      appointment.status.toLowerCase() as AppointmentStatus;

                    return (
                      <div
                        key={appointment.id}
                        className="p-4 transition-colors hover:bg-muted/40 sm:p-5"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex min-w-0 items-center gap-3">
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-100 text-xs font-bold text-blue-700 dark:bg-blue-950 dark:text-blue-300">
                              {getInitials(
                                appointment.customer.name
                              )}
                            </div>

                            <div className="min-w-0">
                              <p className="truncate text-sm font-semibold">
                                {
                                  appointment.customer
                                    .name
                                }
                              </p>

                              <p className="mt-0.5 truncate text-xs text-muted-foreground">
                                {
                                  appointment.service
                                    .name
                                }
                              </p>
                            </div>
                          </div>

                          <StatusBadge
                            status={status}
                          />
                        </div>

                        <div className="mt-4 flex flex-wrap gap-x-4 gap-y-2 text-xs text-muted-foreground">
                          <span className="inline-flex items-center gap-1.5">
                            <CalendarDays
                              className="h-3.5 w-3.5"
                              aria-hidden="true"
                            />
                            {formatDate(
                              appointment.date,
                              timeZone
                            )}
                          </span>

                          <span className="inline-flex items-center gap-1.5">
                            <Clock3
                              className="h-3.5 w-3.5"
                              aria-hidden="true"
                            />
                            {appointment.time}
                          </span>
                        </div>
                      </div>
                    );
                  }
                )}
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function AppointmentRow({
  customerName,
  serviceName,
  date,
  time,
  timeZone,
  status,
}: {
  customerName: string;
  serviceName: string;
  date: Date;
  time: string;
  timeZone: string;
  status: AppointmentStatus;
}) {
  return (
    <div className="group flex flex-col gap-4 rounded-2xl border border-border bg-background/50 p-4 transition-all duration-200 hover:border-blue-200 hover:bg-blue-50/30 hover:shadow-sm sm:flex-row sm:items-center sm:justify-between dark:hover:border-blue-900 dark:hover:bg-blue-950/20">
      <div className="flex min-w-0 items-center gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-muted text-muted-foreground transition-colors group-hover:bg-blue-100 group-hover:text-blue-600 dark:group-hover:bg-blue-950 dark:group-hover:text-blue-400">
          <UserRound
            className="h-5 w-5"
            aria-hidden="true"
          />
        </div>

        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-card-foreground">
            {customerName}
          </p>

          <p className="mt-0.5 truncate text-xs text-muted-foreground">
            {serviceName}
          </p>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3 sm:justify-end">
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <CalendarDays
            className="h-3.5 w-3.5"
            aria-hidden="true"
          />
          <span>
            {formatDate(date, timeZone)}
          </span>
        </div>

        <div className="flex items-center gap-1.5 text-xs font-semibold text-foreground">
          <Clock3
            className="h-3.5 w-3.5"
            aria-hidden="true"
          />
          <span>{time}</span>
        </div>

        <StatusBadge status={status} />
      </div>
    </div>
  );
}

function EmptyAppointments({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-muted/10 px-6 py-10 text-center">
      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-muted text-muted-foreground">
        <CalendarDays
          className="h-6 w-6"
          aria-hidden="true"
        />
      </div>

      <p className="mt-4 text-sm font-semibold">
        {title}
      </p>

      <p className="mt-1 max-w-sm text-xs leading-5 text-muted-foreground">
        {description}
      </p>

      <Link
        href="/dashboard/appointments"
        className="mt-4 text-sm font-semibold text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
      >
        Manage appointments
      </Link>
    </div>
  );
}

function getInitials(name: string) {
  const parts = name
    .trim()
    .split(/\s+/)
    .filter(Boolean);

  if (parts.length === 0) {
    return "C";
  }

  if (parts.length === 1) {
    return parts[0].slice(0, 2).toUpperCase();
  }

  return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
}