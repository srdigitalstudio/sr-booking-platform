import {
  CalendarCheck,
  CalendarDays,
  CheckCircle2,
  Clock3,
  CreditCard,
  Scissors,
  Users,
  XCircle,
} from "lucide-react";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@/generated/prisma/client";

import { RecentAppointments } from "@/components/dashboard/RecentAppointments";
import { RevenueChart } from "@/components/dashboard/RevenueChart";
import { StatCard } from "@/components/dashboard/StatCard";
import { getCurrentBusinessContext } from "@/lib/auth";

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL,
});

const prisma = new PrismaClient({
  adapter,
});

function getTimeZoneParts(date: Date, timeZone: string) {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(date);

  const values = Object.fromEntries(
    parts
      .filter(
        (part) =>
          part.type === "year" ||
          part.type === "month" ||
          part.type === "day"
      )
      .map((part) => [part.type, Number(part.value)])
  );

  return {
    year: values.year,
    month: values.month,
    day: values.day,
  };
}

function getTimeZoneOffset(date: Date, timeZone: string) {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hourCycle: "h23",
  }).formatToParts(date);

  const values = Object.fromEntries(
    parts
      .filter(
        (part) =>
          part.type === "year" ||
          part.type === "month" ||
          part.type === "day" ||
          part.type === "hour" ||
          part.type === "minute" ||
          part.type === "second"
      )
      .map((part) => [part.type, Number(part.value)])
  );

  const asUtc = Date.UTC(
    values.year,
    values.month - 1,
    values.day,
    values.hour,
    values.minute,
    values.second
  );

  return asUtc - date.getTime();
}

function getStartOfMonth(timeZone: string) {
  const now = new Date();
  const { year, month } = getTimeZoneParts(now, timeZone);

  const localMonthStart = Date.UTC(year, month - 1, 1);
  const firstGuess = new Date(localMonthStart);

  const firstOffset = getTimeZoneOffset(
    firstGuess,
    timeZone
  );

  const firstResult = new Date(
    localMonthStart - firstOffset
  );

  const finalOffset = getTimeZoneOffset(
    firstResult,
    timeZone
  );

  return new Date(localMonthStart - finalOffset);
}

function getStartOfNextMonth(timeZone: string) {
  const now = new Date();
  const { year, month } = getTimeZoneParts(now, timeZone);

  const nextYear = month === 12 ? year + 1 : year;
  const nextMonth = month === 12 ? 1 : month + 1;

  const localMonthStart = Date.UTC(
    nextYear,
    nextMonth - 1,
    1
  );

  const firstGuess = new Date(localMonthStart);

  const firstOffset = getTimeZoneOffset(
    firstGuess,
    timeZone
  );

  const firstResult = new Date(
    localMonthStart - firstOffset
  );

  const finalOffset = getTimeZoneOffset(
    firstResult,
    timeZone
  );

  return new Date(localMonthStart - finalOffset);
}

function getStartOfDay(date: Date, timeZone: string) {
  const { year, month, day } = getTimeZoneParts(
    date,
    timeZone
  );

  const localDayStart = Date.UTC(
    year,
    month - 1,
    day
  );

  const firstGuess = new Date(localDayStart);

  const firstOffset = getTimeZoneOffset(
    firstGuess,
    timeZone
  );

  const firstResult = new Date(
    localDayStart - firstOffset
  );

  const finalOffset = getTimeZoneOffset(
    firstResult,
    timeZone
  );

  return new Date(localDayStart - finalOffset);
}

function getDateKey(date: Date, timeZone: string) {
  const { year, month, day } = getTimeZoneParts(
    date,
    timeZone
  );

  return `${year}-${String(month).padStart(
    2,
    "0"
  )}-${String(day).padStart(2, "0")}`;
}

function formatChartDate(
  date: Date,
  timeZone: string
) {
  return new Intl.DateTimeFormat("en-US", {
    timeZone,
    month: "short",
    day: "numeric",
  }).format(date);
}

export default async function DashboardPage() {
  const businessContext =
    await getCurrentBusinessContext();

  if (!businessContext) {
    return (
      <div className="rounded-2xl border bg-white p-8 shadow-sm">
        <h1 className="text-2xl font-bold">
          Business not found
        </h1>

        <p className="mt-2 text-sm text-muted-foreground">
          No active business is available for your
          account.
        </p>
      </div>
    );
  }

  const businessId = businessContext.business.id;

  const timeZone =
    businessContext.business.timezone || "UTC";

  const monthStart = getStartOfMonth(timeZone);

  const nextMonthStart =
    getStartOfNextMonth(timeZone);

  const chartStartDate = new Date(monthStart);

  chartStartDate.setDate(
    chartStartDate.getDate() - 29
  );

  const [
    appointmentsCount,
    pendingAppointments,
    confirmedAppointments,
    completedAppointmentsCount,
    cancelledAppointments,
    customersCount,
    servicesCount,
    completedAppointments,
    monthlyCompletedAppointments,
    chartAppointments,
    settings,
  ] = await Promise.all([
    prisma.appointment.count({
      where: {
        businessId,
      },
    }),

    prisma.appointment.count({
      where: {
        businessId,
        status: "PENDING",
      },
    }),

    prisma.appointment.count({
      where: {
        businessId,
        status: "CONFIRMED",
      },
    }),

    prisma.appointment.count({
      where: {
        businessId,
        status: "COMPLETED",
      },
    }),

    prisma.appointment.count({
      where: {
        businessId,
        status: "CANCELLED",
      },
    }),

    prisma.customer.count({
      where: {
        businessId,
      },
    }),

    prisma.service.count({
      where: {
        businessId,
        active: true,
      },
    }),

    prisma.appointment.findMany({
      where: {
        businessId,
        status: "COMPLETED",
      },
      select: {
        service: {
          select: {
            price: true,
          },
        },
      },
    }),

    prisma.appointment.findMany({
      where: {
        businessId,
        status: "COMPLETED",
        date: {
          gte: monthStart,
          lt: nextMonthStart,
        },
      },
      select: {
        service: {
          select: {
            price: true,
          },
        },
      },
    }),

    prisma.appointment.findMany({
      where: {
        businessId,
        status: "COMPLETED",
        date: {
          gte: chartStartDate,
          lt: nextMonthStart,
        },
      },
      select: {
        date: true,
        service: {
          select: {
            price: true,
          },
        },
      },
      orderBy: {
        date: "asc",
      },
    }),

    prisma.settings.findUnique({
      where: {
        businessId,
      },
      select: {
        currency: true,
        businessName: true,
      },
    }),
  ]);

  const revenue = completedAppointments.reduce(
    (total, appointment) => {
      return (
        total +
        Number(appointment.service.price ?? 0)
      );
    },
    0
  );

  const monthlyRevenue =
    monthlyCompletedAppointments.reduce(
      (total, appointment) => {
        return (
          total +
          Number(appointment.service.price ?? 0)
        );
      },
      0
    );

  const chartRevenue = new Map<string, number>();

  for (const appointment of chartAppointments) {
    const dateKey = getDateKey(
      appointment.date,
      timeZone
    );

    const currentRevenue =
      chartRevenue.get(dateKey) ?? 0;

    chartRevenue.set(
      dateKey,
      currentRevenue +
        Number(appointment.service.price ?? 0)
    );
  }

  const chartData: {
    date: string;
    revenue: number;
  }[] = [];

  const currentDate = new Date(
    getStartOfDay(new Date(), timeZone)
  );

  for (let index = 29; index >= 0; index--) {
    const date = new Date(currentDate);

    date.setUTCDate(
      date.getUTCDate() - index
    );

    const dateKey = getDateKey(
      date,
      timeZone
    );

    chartData.push({
      date: formatChartDate(date, timeZone),
      revenue: chartRevenue.get(dateKey) ?? 0,
    });
  }

  const currency = settings?.currency ?? "USD";

  const businessName =
    settings?.businessName ??
    businessContext.business.name ??
    "SR Booking";

  const currencyFormatter = new Intl.NumberFormat(
    "en-US",
    {
      style: "currency",
      currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }
  );

  return (
    <div className="space-y-8 pb-10">
      {/* Header */}
      <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
        <div className="min-w-0">
          <div className="mb-2 flex items-center gap-2 text-sm font-medium text-blue-600 dark:text-blue-400">
            <CalendarDays
              className="h-4 w-4"
              aria-hidden="true"
            />

            Overview
          </div>

          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl lg:text-4xl">
            Dashboard
          </h1>

          <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground sm:text-base">
            Welcome to {businessName}. Here&apos;s an
            overview of your booking activity.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <a
            href="/dashboard/appointments"
            className="inline-flex h-10 items-center gap-2 rounded-xl bg-blue-600 px-4 text-sm font-semibold text-white shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:bg-blue-700 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
          >
            <CalendarCheck
              className="h-4 w-4"
              aria-hidden="true"
            />
            New Booking
          </a>

          <a
            href="/dashboard/customers"
            className="inline-flex h-10 items-center gap-2 rounded-xl border border-border bg-background px-4 text-sm font-semibold text-foreground shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:bg-muted hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
          >
            <Users
              className="h-4 w-4"
              aria-hidden="true"
            />
            Add Customer
          </a>

          <a
            href="/dashboard/services"
            className="inline-flex h-10 items-center gap-2 rounded-xl border border-border bg-background px-4 text-sm font-semibold text-foreground shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:bg-muted hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
          >
            <Scissors
              className="h-4 w-4"
              aria-hidden="true"
            />
            Add Service
          </a>
        </div>
      </div>

      {/* Primary statistics */}
      <section
        aria-label="Dashboard statistics"
        className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4"
      >
        <StatCard
          title="Total Appointments"
          value={appointmentsCount.toString()}
          description="All bookings"
          icon={CalendarDays}
        />

        <StatCard
          title="Customers"
          value={customersCount.toString()}
          description="Registered customers"
          icon={Users}
        />

        <StatCard
          title="Revenue"
          value={currencyFormatter.format(revenue)}
          description="All completed appointments"
          icon={CreditCard}
        />

        <StatCard
          title="Active Services"
          value={servicesCount.toString()}
          description="Currently available"
          icon={Scissors}
        />
      </section>

      {/* Monthly revenue */}
      <section aria-label="Monthly revenue">
        <div className="mb-4">
          <h2 className="text-lg font-semibold tracking-tight">
            This Month
          </h2>

          <p className="mt-1 text-sm text-muted-foreground">
            Revenue from completed appointments this
            month.
          </p>
        </div>

        <StatCard
          title="Monthly Revenue"
          value={currencyFormatter.format(
            monthlyRevenue
          )}
          description="Completed appointments this month"
          icon={CreditCard}
        />
      </section>

      {/* Revenue chart */}
      <section aria-label="Revenue analytics">
        <div className="mb-4">
          <h2 className="text-lg font-semibold tracking-tight">
            Revenue Overview
          </h2>

          <p className="mt-1 text-sm text-muted-foreground">
            Completed appointment revenue over the last
            30 days.
          </p>
        </div>

        <div className="rounded-2xl border bg-card p-4 shadow-sm sm:p-6">
          <RevenueChart
            data={chartData}
            currency={currency}
          />
        </div>
      </section>

      {/* Appointment status */}
      <section aria-label="Appointment status">
        <div className="mb-4">
          <h2 className="text-lg font-semibold tracking-tight">
            Appointment Status
          </h2>

          <p className="mt-1 text-sm text-muted-foreground">
            A quick breakdown of your current booking
            pipeline.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <StatCard
            title="Pending"
            value={pendingAppointments.toString()}
            description="Awaiting confirmation"
            icon={Clock3}
            compact
          />

          <StatCard
            title="Confirmed"
            value={confirmedAppointments.toString()}
            description="Scheduled bookings"
            icon={CheckCircle2}
            compact
          />

          <StatCard
            title="Completed"
            value={completedAppointmentsCount.toString()}
            description="Finished bookings"
            icon={CalendarCheck}
            compact
          />

          <StatCard
            title="Cancelled"
            value={cancelledAppointments.toString()}
            description="Cancelled bookings"
            icon={XCircle}
            compact
          />
        </div>
      </section>

      {/* Appointments */}
      <section aria-label="Appointments">
        <RecentAppointments />
      </section>
    </div>
  );
}