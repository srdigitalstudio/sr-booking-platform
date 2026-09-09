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
import { StatCard } from "@/components/dashboard/StatCard";

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL,
});

const prisma = new PrismaClient({
  adapter,
});

export default async function DashboardPage() {
  const [
    appointmentsCount,
    pendingAppointments,
    confirmedAppointments,
    completedAppointmentsCount,
    cancelledAppointments,
    customersCount,
    servicesCount,
    completedAppointments,
    settings,
  ] = await Promise.all([
    prisma.appointment.count(),

    prisma.appointment.count({
      where: {
        status: "PENDING",
      },
    }),

    prisma.appointment.count({
      where: {
        status: "CONFIRMED",
      },
    }),

    prisma.appointment.count({
      where: {
        status: "COMPLETED",
      },
    }),

    prisma.appointment.count({
      where: {
        status: "CANCELLED",
      },
    }),

    prisma.customer.count(),

    prisma.service.count({
      where: {
        active: true,
      },
    }),

    prisma.appointment.findMany({
      where: {
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

    prisma.settings.findFirst({
      select: {
        currency: true,
        businessName: true,
      },
    }),
  ]);

  const revenue = completedAppointments.reduce(
    (total, appointment) => {
      return total + Number(appointment.service.price ?? 0);
    },
    0
  );

  const currency = settings?.currency ?? "USD";
  const businessName =
    settings?.businessName ?? "SR Booking";

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
          description="Completed appointments"
          icon={CreditCard}
        />

        <StatCard
          title="Active Services"
          value={servicesCount.toString()}
          description="Currently available"
          icon={Scissors}
        />
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