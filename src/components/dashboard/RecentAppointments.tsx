import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@/generated/prisma/client";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import { StatusBadge } from "@/components/dashboard/StatusBadge";

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL,
});

const prisma = new PrismaClient({
  adapter,
});

export async function RecentAppointments() {
  const appointments =
    await prisma.appointment.findMany({
      include: {
        customer: true,
        service: true,
      },
      orderBy: {
        date: "desc",
      },
      take: 5,
    });

  return (
    <Card className="rounded-2xl border-0 shadow-md">
      <CardHeader>
        <CardTitle>
          Recent Appointments
        </CardTitle>
      </CardHeader>

      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="border-b text-left text-sm text-muted-foreground">
              <tr>
                <th className="pb-4">Customer</th>
                <th className="pb-4">Service</th>
                <th className="pb-4">Date</th>
                <th className="pb-4">Status</th>
              </tr>
            </thead>

            <tbody>
              {appointments.map((appointment) => (
                <tr
                  key={appointment.id}
                  className="border-b last:border-0"
                >
                  <td className="py-4 font-medium">
                    {appointment.customer.name}
                  </td>

                  <td>
                    {appointment.service.name}
                  </td>

                  <td>
                    {appointment.date
                      .toISOString()
                      .slice(0, 10)}{" "}
                    • {appointment.time}
                  </td>

                  <td>
                    <StatusBadge
                      status={appointment.status.toLowerCase() as "pending" | "confirmed" | "completed" | "cancelled"}
                    />
                  </td>
                </tr>
              ))}

              {appointments.length === 0 && (
                <tr>
                  <td
                    colSpan={4}
                    className="py-8 text-center text-muted-foreground"
                  >
                    No appointments yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}