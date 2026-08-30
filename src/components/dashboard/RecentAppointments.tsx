import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@/generated/prisma/client";

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

export async function RecentAppointments() {
  const appointments =
    await prisma.appointment.findMany({
      include: {
        customer: true,
        service: true,
      },
      orderBy: [
        {
          date: "desc",
        },
        {
          time: "desc",
        },
      ],
      take: 5,
    });

  return (
    <Card className="rounded-2xl border-border bg-card shadow-md">
      <CardHeader className="flex flex-row items-center justify-between gap-4">
        <div>
          <CardTitle className="text-lg font-semibold text-card-foreground">
            Recent Appointments
          </CardTitle>

          <p className="mt-1 text-sm text-muted-foreground">
            Latest customer bookings
          </p>
        </div>

        <Link
          href="/dashboard/appointments"
          className="group flex shrink-0 items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium text-blue-600 transition-all duration-200 hover:bg-blue-50 hover:text-blue-700 dark:text-blue-400 dark:hover:bg-blue-950 dark:hover:text-blue-300"
        >
          <span>View All</span>

          <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1" />
        </Link>
      </CardHeader>

      <CardContent>
        {appointments.length === 0 ? (
          <div className="rounded-xl border border-dashed border-border py-10 text-center">
            <p className="font-medium text-card-foreground">
              No appointments yet
            </p>

            <p className="mt-1 text-sm text-muted-foreground">
              New bookings will appear here.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[650px]">
              <thead>
                <tr className="border-b border-border text-left text-sm text-muted-foreground">
                  <th className="px-3 pb-4 font-medium">
                    Customer
                  </th>

                  <th className="px-3 pb-4 font-medium">
                    Service
                  </th>

                  <th className="px-3 pb-4 font-medium">
                    Date & Time
                  </th>

                  <th className="px-3 pb-4 text-right font-medium">
                    Status
                  </th>
                </tr>
              </thead>

              <tbody>
                {appointments.map((appointment) => {
                  const status =
                    appointment.status.toLowerCase() as AppointmentStatus;

                  return (
                    <tr
                      key={appointment.id}
                      className="group border-b border-border transition-colors duration-200 last:border-0 hover:bg-muted/50"
                    >
                      <td className="px-3 py-4">
                        <div className="font-medium text-card-foreground">
                          {appointment.customer.name}
                        </div>
                      </td>

                      <td className="px-3 py-4 text-muted-foreground">
                        {appointment.service.name}
                      </td>

                      <td className="whitespace-nowrap px-3 py-4 text-sm text-card-foreground">
                        <span>
                          {appointment.date
                            .toISOString()
                            .slice(0, 10)}
                        </span>

                        <span className="mx-2 text-muted-foreground">
                          •
                        </span>

                        <span className="font-medium text-foreground">
                          {appointment.time}
                        </span>
                      </td>

                      <td className="px-3 py-4 text-right">
                        <StatusBadge status={status} />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
