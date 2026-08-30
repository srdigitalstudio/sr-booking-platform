import {
  CalendarDays,
  CreditCard,
  Scissors,
  Users,
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
    customersCount,
    servicesCount,
    completedAppointments,
  ] = await Promise.all([
    prisma.appointment.count(),

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
      include: {
        service: true,
      },
    }),
  ]);

  const revenue = completedAppointments.reduce(
    (total, appointment) => {
      return total + Number(appointment.service.price ?? 0);
    },
    0
  );

  return (
    <div className="space-y-6 sm:space-y-8">
      <div className="flex flex-col gap-2">
        <div>
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
            Dashboard
          </h1>

          <p className="mt-1.5 text-sm text-muted-foreground sm:mt-2 sm:text-base">
            Welcome to SR Booking Platform.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 lg:gap-6">
        <StatCard
          title="Appointments"
          value={appointmentsCount.toString()}
          description="Total bookings"
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
          value={`$${revenue.toFixed(2)}`}
          description="Completed appointments"
          icon={CreditCard}
        />

        <StatCard
          title="Services"
          value={servicesCount.toString()}
          description="Currently active"
          icon={Scissors}
        />
      </div>

      <div className="min-w-0">
        <RecentAppointments />
      </div>
    </div>
  );
}